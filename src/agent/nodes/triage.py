"""Triage node — combined intake + routing in a single LLM call.

Formerly two sequential nodes (intake: language/crop/region extraction; router:
domain classification). Both are lightweight metadata passes over the same
message, so doing them in one call removes a whole LLM round-trip from every
turn — the cheapest win for the latency-critical USSD path.

`triage_node` writes `preferred_language`, `crop_focus`, `region`, and
`domain_intent` into state; `route_by_intent` is the LangGraph conditional-edge
function that turns `domain_intent` into the next expert node.
"""

from __future__ import annotations

import logging

from langchain_core.messages import HumanMessage, SystemMessage

from src.agent.llm import get_chat_model, parse_json_object
from src.agent.state import DomainIntent, FarmerState

logger = logging.getLogger(__name__)

VALID_INTENTS: tuple[DomainIntent, ...] = ("agronomy", "climate", "finance")
_DEFAULT_INTENT: DomainIntent = "agronomy"

_SYSTEM = """You are the triage step for a Nigerian farming advisory service.
Farmers write in English, Hausa, Yoruba, Igbo, or Nigerian Pidgin, and often
code-switch within one message. In a SINGLE pass, extract the routing metadata.

Reply with ONLY a JSON object using exactly these keys:
{
  "preferred_language": one of "English", "Hausa", "Yoruba", "Igbo", "Pidgin"
      (the dominant language to reply in; if a message mixes Pidgin and English,
      prefer "Pidgin"),
  "crop_focus": the single crop asked about (e.g. "Rice", "Maize", "Cassava",
      "Tomato") or null if none is mentioned,
  "region": the Nigerian state/region mentioned (e.g. "Kano", "Oyo") or null,
  "domain_intent": one of:
      - "agronomy": planting, pests, disease, fertiliser, soil, seeds, harvest, yield
      - "climate": weather, rainfall, forecast, drought, flooding, planting calendar
      - "finance": prices, markets, selling, loans, credit, subsidies, profit, costs
}"""


async def triage_node(state: FarmerState) -> dict:
    """Detect language/crop/region and classify intent in one call."""
    model = get_chat_model(temperature=0.0, max_tokens=120)
    crop_hint = state.get("crop_focus") or "unknown"
    messages = [
        SystemMessage(content=_SYSTEM),
        HumanMessage(
            content=f"Crop hint: {crop_hint}\nMessage: {state['user_input']}"
        ),
    ]

    try:
        response = await model.ainvoke(messages)
        parsed = parse_json_object(response.content)
    except (ValueError, KeyError) as exc:
        # Degrade gracefully: keep caller-supplied language, default the intent.
        logger.warning("triage parse failed (%s); using defaults", exc)
        parsed = {}

    update: dict = {}

    # Only overwrite language when triage actually detected one; otherwise keep
    # whatever the channel/API layer already set.
    language = (parsed.get("preferred_language") or "").strip()
    if language:
        update["preferred_language"] = language

    crop = parsed.get("crop_focus")
    if isinstance(crop, str) and crop.strip():
        update["crop_focus"] = crop.strip().title()

    region = parsed.get("region")
    if isinstance(region, str) and region.strip():
        update["region"] = region.strip().title()

    intent = (parsed.get("domain_intent") or "").strip().lower()
    if intent not in VALID_INTENTS:
        logger.warning("triage intent %r invalid; defaulting to %s", intent, _DEFAULT_INTENT)
        intent = _DEFAULT_INTENT
    update["domain_intent"] = intent

    return update


def route_by_intent(state: FarmerState) -> DomainIntent:
    """Conditional-edge function: pick the expert node from `domain_intent`."""
    intent = state.get("domain_intent")
    if intent in VALID_INTENTS:
        return intent  # type: ignore[return-value]
    return _DEFAULT_INTENT
