"""Milestone 4 — the Dynamic Channel Formatter.

The experts produced deep, unconstrained reasoning. This node is the strict
editor: it reshapes that reasoning into the exact technical format the farmer's
channel can render, driven entirely by ``state['channel_type']``.

A hard validation pass (`fit_to_channel`) runs *after* the LLM, because models
routinely overshoot character budgets. For SMS/USSD it truncates on a safe
boundary and logs the overflow; for the chatbot it passes through.
"""

from __future__ import annotations

import logging

from langchain_core.messages import HumanMessage, SystemMessage

from src.agent.llm import get_chat_model
from src.agent.state import ChannelType, FarmerState

logger = logging.getLogger(__name__)

# Hard character budgets per channel. USSD pages allow a little more than a
# single SMS segment; the chatbot is unconstrained.
CHANNEL_LIMITS: dict[ChannelType, int | None] = {
    "sms": 160,
    "ussd": 182,
    "voice": 320,  # ~2-3 spoken sentences; trimmed if the model overshoots
    "chatbot": None,
}

_PROFILES: dict[ChannelType, str] = {
    "sms": (
        "CHANNEL: SMS.\n"
        "- Hard limit: 160 characters total. Never exceed it.\n"
        "- Plain text only. No markdown, asterisks, or emoji.\n"
        "- Translate the answer into the farmer's preferred language.\n"
        "- Give EXACTLY ONE high-impact action step — the single most "
        "important thing to do now."
    ),
    "ussd": (
        "CHANNEL: USSD.\n"
        "- Hard limit: 182 characters total. Never exceed it.\n"
        "- Output a raw menu string using clean line breaks (\\n).\n"
        "- Each option starts with a single digit, e.g. '1. Plant now'.\n"
        "- No markdown. Keep options terse. Translate into the farmer's "
        "preferred language."
    ),
    "voice": (
        "CHANNEL: Voice (IVR readout).\n"
        "- This text will be SPOKEN ALOUD by a text-to-speech engine.\n"
        "- Keep it short: 2-3 plain sentences. No lists, markdown, or symbols.\n"
        "- Use simple words the farmer can follow by ear; write numbers and "
        "units as words (e.g. 'twenty centimetres').\n"
        "- Give one clear action. Translate into the farmer's preferred "
        "language/dialect."
    ),
    "chatbot": (
        "CHANNEL: Web chatbot.\n"
        "- No length limit.\n"
        "- Rich Markdown is encouraged: use ##, **bold**, and bullet lists.\n"
        "- Preserve the depth and structure of the expert reasoning.\n"
        "- Reply in the farmer's preferred language."
    ),
}

_SYSTEM_TEMPLATE = """You are the channel formatter for a Nigerian farming
advisory service. You receive an expert's full, unconstrained answer and must
re-present it for one specific delivery channel. Do not add new facts; only
reshape, translate, and trim what the expert provided.

Farmer's preferred language: {language}

{profile}

Output ONLY the final message for the farmer — no preamble, no explanation."""


def fit_to_channel(text: str, channel: ChannelType) -> str:
    """Enforce the channel's character budget.

    Returns text unchanged when within budget (or unconstrained). Otherwise
    truncates on a word boundary, logs the overflow, and — for USSD — avoids
    cutting in the middle of a menu line.
    """
    limit = CHANNEL_LIMITS[channel]
    text = text.strip()
    if limit is None or len(text) <= limit:
        return text

    logger.error(
        "%s formatter overflow: %d > %d chars; truncating",
        channel,
        len(text),
        limit,
    )

    if channel == "ussd":
        # Keep only whole '\n'-separated lines that fit.
        kept: list[str] = []
        used = 0
        for line in text.split("\n"):
            extra = len(line) + (1 if kept else 0)
            if used + extra > limit:
                break
            kept.append(line)
            used += extra
        if kept:
            return "\n".join(kept)

    # SMS (or a single oversized USSD line): trim on a word boundary.
    ellipsis = "..."
    cutoff = limit - len(ellipsis)
    trimmed = text[:cutoff].rsplit(" ", 1)[0].rstrip()
    return f"{trimmed}{ellipsis}"


async def channel_formatter(state: FarmerState) -> dict:
    """Adapt ``expert_reasoning`` to the farmer's channel and validate length."""
    channel: ChannelType = state["channel_type"]
    reasoning = state.get("expert_reasoning") or ""
    if not reasoning:
        logger.warning("formatter called with empty expert_reasoning")

    system = _SYSTEM_TEMPLATE.format(
        language=state.get("preferred_language") or "English",
        profile=_PROFILES[channel],
    )
    messages = [
        SystemMessage(content=system),
        HumanMessage(content=f"Expert answer to reformat:\n{reasoning}"),
    ]

    response = await get_chat_model(temperature=0.3).ainvoke(messages)
    final = fit_to_channel(response.content, channel)
    return {"final_ui_response": final}
