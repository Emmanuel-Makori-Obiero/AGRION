"""Graph assembly: triage → expert → formatter.

`build_graph` compiles the workflow against a checkpointer. `run_turn` is a thin
helper the API layer uses to invoke the graph with the phone number as the
thread id and return the formatted, user-facing string.

Triage merges the former intake + router nodes into one LLM call, so the turn
costs three model calls (triage, expert, formatter) instead of four.
"""

from __future__ import annotations

import asyncio
import logging

from langgraph.graph import END, START, StateGraph
from langgraph.graph.state import CompiledStateGraph

from src.agent.checkpoint import thread_config
from src.agent.nodes.experts import (
    agronomy_expert,
    climate_expert,
    finance_expert,
)
from src.agent.nodes.formatter import channel_formatter
from src.agent.nodes.triage import route_by_intent, triage_node
from src.agent.state import ChannelType, FarmerState, initial_state

logger = logging.getLogger(__name__)


def build_graph(checkpointer) -> CompiledStateGraph:
    """Wire and compile the multi-channel agent graph."""
    builder = StateGraph(FarmerState)

    builder.add_node("triage", triage_node)
    builder.add_node("agronomy", agronomy_expert)
    builder.add_node("climate", climate_expert)
    builder.add_node("finance", finance_expert)
    builder.add_node("formatter", channel_formatter)

    builder.add_edge(START, "triage")

    # Triage writes domain_intent; this edge fans out to the matching expert.
    builder.add_conditional_edges(
        "triage",
        route_by_intent,
        {
            "agronomy": "agronomy",
            "climate": "climate",
            "finance": "finance",
        },
    )

    # Every expert funnels into the formatter, then we are done.
    for expert in ("agronomy", "climate", "finance"):
        builder.add_edge(expert, "formatter")
    builder.add_edge("formatter", END)

    return builder.compile(checkpointer=checkpointer)


async def run_turn(
    graph: CompiledStateGraph,
    *,
    phone_number: str,
    user_input: str,
    channel_type: ChannelType,
    preferred_language: str = "en",
    crop_focus: str | None = None,
) -> str:
    """Run one turn and return the channel-formatted response string.

    The phone number is the checkpoint thread id, so a resumed/dropped session
    continues on the same thread.
    """
    state = initial_state(
        phone_number=phone_number,
        user_input=user_input,
        channel_type=channel_type,
        preferred_language=preferred_language,
        crop_focus=crop_focus,
    )
    result = await graph.ainvoke(state, config=thread_config(phone_number))

    # Persist the farmer's detected region (best-effort) so other channels —
    # notably the region-less MMS pipeline — can tag observations with it.
    region = result.get("region")
    if region:
        try:
            from src.services.graph_service import graph_service

            await asyncio.to_thread(
                graph_service.upsert_farmer_region, phone_number, region
            )
        except Exception as exc:  # non-critical — never fail the farmer's turn
            logger.warning("failed to persist farmer region (%s)", exc)

    return result["final_ui_response"] or ""
