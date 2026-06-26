"""Speech-to-text for the voice bridge.

Downloads the recording Africa's Talking captured and transcribes it via an
OpenAI-compatible Whisper endpoint. Plain ``httpx`` — the audio is sent as a
multipart upload.

Note on accuracy: Whisper's coverage of Hausa/Yoruba/Igbo is far weaker than its
English coverage, and Nigerian Pidgin has no dedicated language code. We pass a
language hint when we have one, but transcripts in these dialects should be
treated as best-effort.
"""

from __future__ import annotations

import httpx
from pydantic import BaseModel

from config.settings import get_settings


class STTError(RuntimeError):
    """Raised when audio cannot be fetched or transcribed."""


class Transcription(BaseModel):
    """Validated result of a speech-to-text call."""

    text: str
    language: str | None = None


async def transcribe(audio_url: str, language: str | None = None) -> Transcription:
    """Fetch the recording at ``audio_url`` and return its transcription.

    Args:
        audio_url: the ``recordingUrl`` Africa's Talking posted to the webhook.
        language: optional ISO-639-1 hint (e.g. ``"ha"``) to bias decoding.

    Raises:
        STTError: on missing config, download failure, transport/HTTP error,
            an unexpected response shape, or an empty transcript.
    """
    settings = get_settings()
    if not settings.stt_api_key:
        raise STTError("stt_api_key is not configured")

    transcribe_url = f"{settings.stt_base_url.rstrip('/')}/audio/transcriptions"
    headers = {"Authorization": f"Bearer {settings.stt_api_key}"}

    try:
        async with httpx.AsyncClient(timeout=60.0, follow_redirects=True) as client:
            audio = await client.get(audio_url)
            audio.raise_for_status()

            files = {
                "file": (
                    "recording.wav",
                    audio.content,
                    audio.headers.get("content-type", "audio/wav"),
                )
            }
            data = {"model": settings.stt_model}
            if language:
                data["language"] = language

            resp = await client.post(
                transcribe_url, headers=headers, files=files, data=data
            )
            resp.raise_for_status()
            payload = resp.json()
    except httpx.HTTPError as exc:
        raise STTError(f"speech-to-text request failed: {exc}") from exc
    except ValueError as exc:  # non-JSON body
        raise STTError(f"unexpected STT response: {exc}") from exc

    text = (payload.get("text") or "").strip()
    if not text:
        raise STTError("transcription was empty")
    return Transcription(text=text, language=payload.get("language"))
