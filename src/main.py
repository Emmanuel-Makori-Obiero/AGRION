"""FastAPI application entrypoint for AgriConnect Nigeria.

Wires up the USSD and IVR webhook controllers that Africa's Talking calls,
plus a lightweight health check for deployment probes.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI

from config.settings import get_settings
from src.agent.checkpoint import open_checkpointer
from src.agent.graph import build_graph
from src.api.v1 import genui, ivr, ussd, voice_bridge, webhooks

settings = get_settings()
logging.basicConfig(level=settings.log_level.upper())


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Open the SQLite checkpointer once and compile the agent graph with it.

    The compiled graph is shared across all webhook requests via app.state, so
    every channel checkpoints to the same store keyed by phone number.
    """
    async with open_checkpointer() as checkpointer:
        app.state.agent_graph = build_graph(checkpointer)
        logging.getLogger(__name__).info("agent graph compiled and ready")
        yield


app = FastAPI(
    title="AgriConnect Nigeria",
    description=(
        "Multi-channel (USSD / SMS / chatbot) farming advisory powered by a "
        "LangGraph agent, Neo4j knowledge graph, Featherless LLM, and "
        "ElevenLabs voice."
    ),
    version="0.2.0",
    lifespan=lifespan,
)

app.include_router(ussd.router, prefix="/api/v1", tags=["ussd"])
app.include_router(ivr.router, prefix="/api/v1", tags=["ivr"])
app.include_router(voice_bridge.router, prefix="/api/v1", tags=["voice-bridge"])
app.include_router(genui.router, prefix="/api/v1", tags=["genui"])
app.include_router(webhooks.router, prefix="/api/v1", tags=["agent"])


@app.get("/health", tags=["system"])
async def health() -> dict[str, str]:
    return {"status": "ok", "env": settings.app_env}
