"""Milestone 3 — the unconstrained specialist agents.

These nodes optimise purely for **accuracy and depth**. They know nothing about
USSD/SMS character limits — that is entirely the channel formatter's job
(Milestone 4). Each writes its full reasoning into ``expert_reasoning``.

`agronomy_expert` is the RAG showcase: it retrieves grounded context from the
ChromaDB knowledge base before reasoning. `climate_expert` and `finance_expert`
follow the same shape so the router's three branches all resolve.
"""

from __future__ import annotations

import asyncio
import logging

from langchain_core.messages import HumanMessage, SystemMessage

from src.agent.llm import get_chat_model
from src.agent.state import FarmerState

logger = logging.getLogger(__name__)


def _format_context(docs) -> str:
    """Join retrieved chunks with source tags for citation in reasoning."""
    blocks = []
    for i, doc in enumerate(docs, start=1):
        source = doc.metadata.get("source", "knowledge base")
        blocks.append(f"[{i}] ({source})\n{doc.page_content.strip()}")
    return "\n\n".join(blocks) if blocks else "(no documents retrieved)"


def _format_practices(practices: list[dict]) -> str:
    """Render structured IITA graph facts as a citable block."""
    if not practices:
        return "(no structured facts on file for this crop)"
    return "\n".join(f"- {p['topic']}: {p['text']}" for p in practices)


def _format_forecast(forecast: dict | None) -> str:
    """Render the NiMet forecast row as a single grounded line."""
    if not forecast:
        return "(no forecast on file for this region)"
    return (
        f"{forecast['period']}: {forecast['outlook']}, "
        f"expected rainfall {forecast['rainfall_mm']}mm"
    )


_AGRONOMY_SYSTEM = """You are a senior agronomist advising Nigerian smallholder
farmers. You are given two evidence sources: authoritative IITA knowledge-graph
facts and supporting manual excerpts. Use them to produce a highly accurate,
step-by-step agronomic solution to the farmer's problem.

IMPORTANT:
- Ignore character limits completely. Do not summarise for SMS or USSD.
- Reason deeply: diagnosis, root cause, then an ordered action plan.
- Ground every recommendation in the evidence. The IITA knowledge-graph facts
  are authoritative; prefer them when they conflict with the manual excerpts.
  If both are silent, say so rather than inventing specifics.
- Prefer locally available, low-cost inputs suited to Nigerian conditions."""


async def agronomy_expert(state: FarmerState) -> dict:
    """RAG-grounded agronomy reasoning written into ``expert_reasoning``.

    Grounds on two sources: the structured IITA ``Practice`` facts in Neo4j
    (fast, authoritative) and the unstructured manual chunks in the vector
    store. Each source degrades independently so an outage in one still leaves a
    grounded answer from the other.
    """
    # Imported lazily so the graph can be built/tested without Chroma or Neo4j.
    from src.agent.rag import get_retriever
    from src.services.graph_service import graph_service

    crop = state.get("crop_focus")

    # Structured graph facts. The Neo4j driver is synchronous, so run it off the
    # event loop to avoid blocking other concurrent turns.
    practices: list[dict] = []
    if crop:
        try:
            practices = await asyncio.to_thread(graph_service.get_practices, crop)
        except Exception as exc:  # graph unavailable — fall back to vector only
            logger.warning("graph lookup failed (%s); proceeding without it", exc)

    # Unstructured vector chunks.
    query = f"{crop or ''} {state['user_input']}".strip()
    try:
        docs = await get_retriever(k=4).ainvoke(query)
    except Exception as exc:  # store missing/unbuilt — reason without context
        logger.warning("retrieval failed (%s); proceeding ungrounded", exc)
        docs = []

    messages = [
        SystemMessage(content=_AGRONOMY_SYSTEM),
        HumanMessage(
            content=(
                f"Crop: {crop or 'unspecified'}\n"
                f"Farmer's problem: {state['user_input']}\n\n"
                f"IITA knowledge-graph facts:\n{_format_practices(practices)}\n\n"
                f"Retrieved manual excerpts:\n{_format_context(docs)}"
            )
        ),
    ]

    response = await get_chat_model(temperature=0.2).ainvoke(messages)
    return {"expert_reasoning": response.content.strip()}


_CLIMATE_SYSTEM = """You are an agro-climatologist for Nigerian farmers. Give a
thorough, accurate answer about weather, rainfall, forecasts, and the planting
calendar relevant to the farmer's crop and region. Ignore length limits and
focus on correctness; explain timing and risk clearly.

Ground your answer in the NiMet forecast provided when it is present. When no
forecast is on file, say so plainly and give general seasonal guidance rather
than inventing specific figures."""


async def climate_expert(state: FarmerState) -> dict:
    """Climate / weather reasoning grounded on the NiMet ``Forecast`` in Neo4j."""
    # Imported lazily so the graph can be built/tested without Neo4j installed.
    from src.services.graph_service import graph_service

    region = state.get("region")
    forecast = None
    if region:
        try:
            # Synchronous Neo4j call run off the event loop.
            forecast = await asyncio.to_thread(graph_service.get_forecast, region)
        except Exception as exc:  # graph unavailable — reason without it
            logger.warning("forecast lookup failed (%s); proceeding without it", exc)

    messages = [
        SystemMessage(content=_CLIMATE_SYSTEM),
        HumanMessage(
            content=(
                f"Crop: {state.get('crop_focus') or 'unspecified'}\n"
                f"Region: {region or 'unspecified'}\n"
                f"Question: {state['user_input']}\n\n"
                f"NiMet forecast on file:\n{_format_forecast(forecast)}"
            )
        ),
    ]
    response = await get_chat_model(temperature=0.2).ainvoke(messages)
    return {"expert_reasoning": response.content.strip()}


_FINANCE_SYSTEM = """You are an agricultural finance and markets advisor for
Nigerian smallholders. Give an accurate, practical answer about prices,
markets, selling strategy, credit, loans, subsidies, costs, and profit. Ignore
length limits; show the reasoning and any simple calculations in full."""


async def finance_expert(state: FarmerState) -> dict:
    """Finance / market reasoning written into ``expert_reasoning``."""
    messages = [
        SystemMessage(content=_FINANCE_SYSTEM),
        HumanMessage(
            content=(
                f"Crop: {state.get('crop_focus') or 'unspecified'}\n"
                f"Question: {state['user_input']}"
            )
        ),
    ]
    response = await get_chat_model(temperature=0.2).ainvoke(messages)
    return {"expert_reasoning": response.content.strip()}
