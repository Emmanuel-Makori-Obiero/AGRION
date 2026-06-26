"""Milestone 1 — the shared graph state.

`FarmerState` is the single object threaded through every node. Nodes return
partial dicts; LangGraph merges them into this shape. The `channel_type` field
is what lets the final formatter know whether it is writing for a 182-char USSD
page, a 160-char SMS, or an unconstrained web chatbot.
"""

from __future__ import annotations

from typing import Literal, Optional, TypedDict

# Discriminators reused across nodes, edges, and the API layer.
ChannelType = Literal["ussd", "sms", "chatbot"]
DomainIntent = Literal["agronomy", "climate", "finance"]


class FarmerState(TypedDict):
    """State passed between LangGraph nodes for one farmer interaction."""

    # --- Inputs (set by the API layer before invocation) ---
    phone_number: str  # also used as the checkpoint thread_id
    preferred_language: str  # e.g. "en", "Hausa", "Yoruba", "Pidgin"
    user_input: str
    channel_type: ChannelType

    # --- Populated by the intake node ---
    crop_focus: Optional[str]
    region: Optional[str]  # Nigerian state/region, used to ground forecasts

    # --- Populated by the router node ---
    domain_intent: Optional[DomainIntent]

    # --- Populated by the specialist expert nodes ---
    expert_reasoning: Optional[str]

    # --- Populated by the channel formatter (the user-facing answer) ---
    final_ui_response: Optional[str]


def initial_state(
    *,
    phone_number: str,
    user_input: str,
    channel_type: ChannelType,
    preferred_language: str = "en",
    crop_focus: Optional[str] = None,
    region: Optional[str] = None,
) -> FarmerState:
    """Build a fresh state for a new turn.

    The optional fields are seeded to ``None`` so nodes can rely on the keys
    existing even before they are computed.
    """
    return FarmerState(
        phone_number=phone_number,
        preferred_language=preferred_language,
        user_input=user_input,
        channel_type=channel_type,
        crop_focus=crop_focus,
        region=region,
        domain_intent=None,
        expert_reasoning=None,
        final_ui_response=None,
    )
