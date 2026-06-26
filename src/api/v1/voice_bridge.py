"""Hybrid voice bridge — Africa's Talking Voice <-> GraphRAG.

One webhook (`POST /voice/bridge`) drives the whole call; Africa's Talking hits
it at each step and we branch on which fields are present:

    dial-in            -> language menu (GetDigits)
    digit pressed      -> set dialect, prompt + Record the question
    recordingUrl back  -> STT -> GraphRAG (run_turn) -> dialect TTS -> Play

A second route (`GET /voice/audio/{filename}`) serves the synthesised MP3 so
Africa's Talking can play it back.

Session state (the chosen dialect, keyed by Africa's Talking sessionId) is held
in process memory — fine for a single worker; move to Redis for horizontal
scale. Spoken menu/prompts use Africa's Talking's built-in TTS (English); only
the AI answer is rendered in-dialect via ElevenLabs. Pre-recorded localized
prompts are the production upgrade.
"""

from __future__ import annotations

import logging
from pathlib import Path

from fastapi import APIRouter, Depends, Form, HTTPException, Request
from fastapi.responses import FileResponse, Response

from config.settings import get_settings
from src.agent.graph import run_turn
from src.api.schemas.telecom import VoiceCallRequest
from src.services import audio_store
from src.services.consent import ensure_consent
from src.services.identity import hash_phone
from src.services.session_store import session_store
from src.services.stt_service import STTError, transcribe
from src.services.voice_service import Dialect, voice_service
from src.utils import telephony_xml as xml
from src.utils.net_guard import (
    UnsafeURLError,
    assert_safe_url,
    verify_telephony_caller,
)

logger = logging.getLogger(__name__)

router = APIRouter()

# DTMF digit -> dialect, plus the display name (passed to GraphRAG as the
# preferred language) and the Whisper language hint for STT.
_DIALECT_BY_DIGIT: dict[str, Dialect] = {
    "1": "hausa",
    "2": "yoruba",
    "3": "igbo",
    "4": "pidgin",
    "5": "english",
}
_LANGUAGE_NAME: dict[Dialect, str] = {
    "hausa": "Hausa",
    "yoruba": "Yoruba",
    "igbo": "Igbo",
    "pidgin": "Pidgin",
    "english": "English",
}
_STT_LANG: dict[Dialect, str] = {
    "hausa": "ha",
    "yoruba": "yo",
    "igbo": "ig",
    "pidgin": "en",  # no dedicated Pidgin code; English is the closest hint
    "english": "en",
}

_MENU_PROMPT = (
    "Welcome to Agrion. For Hausa press 1. For Yoruba press 2. "
    "For Igbo press 3. For Pidgin press 4. For English press 5."
)
_ASK_PROMPT = "Please ask your question after the beep, then press the hash key."
_FOLLOWUP_PROMPT = (
    "To ask another question, speak after the beep and press hash. "
    "Otherwise you may hang up."
)

def voice_call_form(
    sessionId: str = Form(...),
    isActive: str = Form(default="1"),
    callerNumber: str | None = Form(default=None),
    destinationNumber: str | None = Form(default=None),
    direction: str = Form(default="Inbound"),
    dtmfDigits: str | None = Form(default=None),
    recordingUrl: str | None = Form(default=None),
    durationInSeconds: str | None = Form(default=None),
) -> VoiceCallRequest:
    """Bind and validate the Africa's Talking form payload into a model."""
    return VoiceCallRequest(
        sessionId=sessionId,
        isActive=isActive,
        callerNumber=callerNumber,
        destinationNumber=destinationNumber,
        direction=direction,
        dtmfDigits=dtmfDigits,
        recordingUrl=recordingUrl,
        durationInSeconds=durationInSeconds,
    )


@router.post("/voice/bridge", dependencies=[Depends(verify_telephony_caller)])
async def voice_bridge(
    request: Request, req: VoiceCallRequest = Depends(voice_call_form)
) -> Response:
    """Single entry point Africa's Talking calls at every step of the call."""
    # Call ended: clean up session state and acknowledge with an empty document.
    if req.is_active == "0":
        await session_store.delete(req.session_id)
        return xml.response()

    # Step 3 — the caller's recording is ready: transcribe -> answer -> speak.
    if req.recording_url:
        stored = await session_store.get(req.session_id)
        dialect: Dialect = stored or "english"  # type: ignore[assignment]
        return await _handle_recording(request, req, dialect)

    # Step 2 — a language was chosen: store it and record the question.
    if req.dtmf_digits:
        dialect = _DIALECT_BY_DIGIT.get(req.dtmf_digits)
        if dialect is None:
            return xml.response(
                xml.say("Sorry, that option is not available. Goodbye."),
                xml.hangup(),
            )
        await session_store.set(req.session_id, dialect)
        return xml.response(xml.record(prompt=_ASK_PROMPT))

    # Step 1 — dial-in: present the language menu.
    return xml.response(xml.get_digits(_MENU_PROMPT, num_digits=1, timeout=10))


async def _handle_recording(
    request: Request, req: VoiceCallRequest, dialect: Dialect
) -> Response:
    """STT -> GraphRAG -> dialect TTS for one captured question."""
    pid = hash_phone(req.caller_number or req.session_id)
    await ensure_consent(pid, "voice")

    # 1) Speech-to-text. Guard the provider-supplied URL against SSRF first.
    try:
        await assert_safe_url(req.recording_url)
        transcription = await transcribe(
            req.recording_url, language=_STT_LANG.get(dialect)
        )
    except (STTError, UnsafeURLError) as exc:
        logger.error("voice: STT failed for %s: %s", req.session_id, exc)
        return xml.response(
            xml.say("Sorry, we could not hear your question. Please call again."),
            xml.hangup(),
        )

    logger.info("voice: transcript (%s): %r", dialect, transcription.text)

    # 2) GraphRAG — reuse the compiled agent; dialect drives the reply language.
    answer = await run_turn(
        request.app.state.agent_graph,
        phone_number=pid,
        user_input=transcription.text,
        channel_type="voice",
        preferred_language=_LANGUAGE_NAME[dialect],
    )

    # 3) Text-to-speech in the chosen dialect. If TTS fails, fall back to
    #    Africa's Talking's own <Say> so the caller still hears the answer.
    try:
        audio_path = await voice_service.synthesize(answer, dialect=dialect)
        url = await audio_store.publish(audio_path, str(request.base_url))
    except Exception as exc:  # noqa: BLE001 — degrade to built-in TTS
        logger.error("voice: TTS/publish failed for %s: %s", req.session_id, exc)
        return xml.response(xml.say(answer), xml.record(prompt=_FOLLOWUP_PROMPT))

    # Play the answer, then record a follow-up so the call can continue.
    return xml.response(xml.play(url), xml.record(prompt=_FOLLOWUP_PROMPT))


@router.get("/voice/audio/{filename}")
async def serve_audio(filename: str) -> FileResponse:
    """Serve a synthesised MP3 for Africa's Talking playback."""
    # Guard against path traversal: only a bare *.mp3 basename is servable.
    name = Path(filename).name
    if not name.endswith(".mp3") or name != filename:
        raise HTTPException(status_code=404, detail="not found")

    path = Path(get_settings().audio_cache_dir) / name
    if not path.exists():
        raise HTTPException(status_code=404, detail="not found")
    return FileResponse(path, media_type="audio/mpeg")
