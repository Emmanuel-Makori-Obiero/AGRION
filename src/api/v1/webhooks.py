"""Milestone 5 — multi-channel webhook layer.

Three endpoints normalise three very different inbound payload shapes (USSD
form posts, SMS form posts, web JSON), set the correct ``channel_type``, and
invoke the *same* compiled LangGraph agent using the phone number as the
thread id. Each returns the response in the format its channel expects.

The compiled graph lives on ``app.state.agent_graph`` (set up in the FastAPI
lifespan in ``src/main.py``), so all requests share one checkpointer.
"""

from __future__ import annotations

import asyncio
import logging

import httpx
from fastapi import APIRouter, Form, Request
from fastapi.responses import PlainTextResponse, Response
from pydantic import BaseModel, Field

from config.settings import get_settings
from src.agent.graph import run_turn
from src.services.graph_service import graph_service
from src.vision import Diagnosis, VisionStatus, diagnose_image
from src.vision.sms import FALLBACK_ERROR

logger = logging.getLogger(__name__)

router = APIRouter()

# Sent when an MMS arrives with no usable image attachment.
NO_MEDIA_MSG = (
    "No photo found in your message. Please send one clear, close-up photo of "
    "the affected plant."
)


def _graph(request: Request):
    """Fetch the compiled agent graph stored on app startup."""
    return request.app.state.agent_graph


async def _fetch_media(url: str) -> bytes:
    """Download the MMS attachment, using Twilio basic-auth when configured.

    Twilio media URLs require AccountSid/AuthToken basic auth; Africa's Talking
    and other public/signed URLs do not, so auth is applied only when set.
    """
    settings = get_settings()
    auth: tuple[str, str] | None = None
    if settings.twilio_account_sid and settings.twilio_auth_token:
        auth = (settings.twilio_account_sid, settings.twilio_auth_token)

    async with httpx.AsyncClient(timeout=20.0, follow_redirects=True) as client:
        resp = await client.get(url, auth=auth)
        resp.raise_for_status()
        return resp.content


async def _persist_diagnosis(phone: str, diagnosis: Diagnosis) -> None:
    """Best-effort write of a confident diagnosis into Neo4j.

    Runs the synchronous driver off the event loop and swallows failures: a
    graph outage must never block or fail the farmer's SMS reply.
    """
    try:
        obs_id = await asyncio.to_thread(
            graph_service.save_diagnosis,
            phone=phone,
            subject_type=diagnosis.subject_type,
            crop=diagnosis.crop,
            condition=diagnosis.condition,
            severity=diagnosis.severity,
            confidence=diagnosis.confidence,
            recommendation=diagnosis.recommendation,
        )
        logger.info("mms: persisted observation %s for %s", obs_id, phone)
    except Exception as exc:  # noqa: BLE001 — persistence is non-critical
        logger.error("mms: failed to persist diagnosis for %s: %s", phone, exc)


# --------------------------------------------------------------------------- #
# USSD — Africa's Talking form POST. Response must be a 'CON '/'END ' string.
# --------------------------------------------------------------------------- #
@router.post("/webhook/ussd", response_class=PlainTextResponse)
async def ussd_webhook(
    request: Request,
    sessionId: str = Form(...),
    phoneNumber: str = Form(...),
    text: str = Form(default=""),
) -> str:
    # The latest '*'-delimited segment is the farmer's most recent entry.
    latest = text.split("*")[-1].strip() if text else ""
    user_input = latest or "I need farming advice"

    answer = await run_turn(
        _graph(request),
        phone_number=phoneNumber,
        user_input=user_input,
        channel_type="ussd",
    )
    # 'END ' terminates the session with the formatted menu/answer.
    return f"END {answer}"


# --------------------------------------------------------------------------- #
# SMS — Africa's Talking / Twilio form POST. Return plain text (or TwiML).
# --------------------------------------------------------------------------- #
@router.post("/webhook/sms")
async def sms_webhook(
    request: Request,
    # Africa's Talking uses 'from'/'text'; Twilio uses 'From'/'Body'.
    from_at: str | None = Form(default=None, alias="from"),
    text_at: str | None = Form(default=None, alias="text"),
    from_twilio: str | None = Form(default=None, alias="From"),
    body_twilio: str | None = Form(default=None, alias="Body"),
) -> Response:
    phone = from_at or from_twilio or ""
    message = (text_at or body_twilio or "").strip()
    if not phone:
        return PlainTextResponse("Missing sender number", status_code=400)

    answer = await run_turn(
        _graph(request),
        phone_number=phone,
        user_input=message or "I need farming advice",
        channel_type="sms",
    )

    # Plain text is valid for Africa's Talking. For Twilio, wrap in TwiML:
    #   return Response(f"<Response><Message>{answer}</Message></Response>",
    #                   media_type="application/xml")
    return PlainTextResponse(answer)


# --------------------------------------------------------------------------- #
# MMS — inbound picture message. Providers post a media URL, not the bytes, so
# we download the image, run the vision-diagnostics pipeline, and reply by SMS.
# --------------------------------------------------------------------------- #
@router.post("/webhook/mms")
async def mms_webhook(
    request: Request,
    # Africa's Talking uses 'from'/'mediaUrl'; Twilio uses 'From'/'MediaUrl0'.
    from_at: str | None = Form(default=None, alias="from"),
    from_twilio: str | None = Form(default=None, alias="From"),
    media_at: str | None = Form(default=None, alias="mediaUrl"),
    media_twilio: str | None = Form(default=None, alias="MediaUrl0"),
) -> Response:
    phone = from_at or from_twilio or ""
    media_url = media_at or media_twilio
    if not phone:
        return PlainTextResponse("Missing sender number", status_code=400)
    if not media_url:
        return PlainTextResponse(NO_MEDIA_MSG)

    try:
        image_bytes = await _fetch_media(media_url)
    except httpx.HTTPError as exc:
        logger.error("mms: media download failed for %s: %s", phone, exc)
        return PlainTextResponse(FALLBACK_ERROR)

    result = await diagnose_image(image_bytes)
    logger.info("mms diagnosis: status=%s phone=%s", result.status.value, phone)

    # Persist only confident identifications so the graph accumulates real
    # field signal rather than the model's "unknown"/low-confidence guesses.
    if result.status is VisionStatus.OK and result.diagnosis is not None:
        await _persist_diagnosis(phone, result.diagnosis)

    # Plain text is valid for Africa's Talking. For Twilio, wrap in TwiML:
    #   return Response(f"<Response><Message>{result.sms}</Message></Response>",
    #                   media_type="application/xml")
    return PlainTextResponse(result.sms)


# --------------------------------------------------------------------------- #
# Chatbot — web frontend JSON. Return JSON with markdown text.
# --------------------------------------------------------------------------- #
class ChatRequest(BaseModel):
    phone_number: str = Field(..., description="Stable user/thread identifier")
    message: str
    preferred_language: str = "English"
    crop_focus: str | None = None


class ChatResponse(BaseModel):
    channel: str = "chatbot"
    response: str  # markdown


@router.post("/webhook/chat", response_model=ChatResponse)
async def chat_webhook(request: Request, payload: ChatRequest) -> ChatResponse:
    answer = await run_turn(
        _graph(request),
        phone_number=payload.phone_number,
        user_input=payload.message,
        channel_type="chatbot",
        preferred_language=payload.preferred_language,
        crop_focus=payload.crop_focus,
    )
    return ChatResponse(response=answer)
