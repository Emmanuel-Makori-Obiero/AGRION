"""ElevenLabs text-to-speech with dialect voice selection and disk caching.

The voice bridge speaks the AI's answer back to the farmer in their chosen
dialect, so :meth:`VoiceService.synthesize` takes a ``dialect`` and maps it to a
configured ElevenLabs voice id (falling back to the default voice when a dialect
has no dedicated voice configured).

Generated clips are cached by a hash of (voice id, text), so repeat advisories —
and repeats of the same answer across callers — are not re-synthesised, keeping
IVR latency and API cost down.
"""

from __future__ import annotations

import hashlib
from pathlib import Path
from typing import Literal

import httpx

from config.settings import get_settings

# Dialects the bridge can speak. Each maps to a configurable ElevenLabs voice.
Dialect = Literal["hausa", "yoruba", "igbo", "pidgin", "english"]


class VoiceService:
    def __init__(self) -> None:
        settings = get_settings()
        self._api_key = settings.elevenlabs_api_key
        self._default_voice_id = settings.elevenlabs_voice_id
        self._base_url = settings.elevenlabs_base_url.rstrip("/")
        self._cache_dir = Path(settings.audio_cache_dir)
        self._cache_dir.mkdir(parents=True, exist_ok=True)
        self._voice_by_dialect: dict[str, str] = {
            "hausa": settings.elevenlabs_voice_hausa,
            "yoruba": settings.elevenlabs_voice_yoruba,
            "igbo": settings.elevenlabs_voice_igbo,
            "pidgin": settings.elevenlabs_voice_pidgin,
            "english": settings.elevenlabs_voice_english,
        }

    def _resolve_voice(self, dialect: Dialect | None) -> str:
        """Pick the voice id for a dialect, falling back to the default voice."""
        if dialect:
            voice = self._voice_by_dialect.get(dialect)
            if voice:
                return voice
        return self._default_voice_id

    def _cache_path(self, text: str, voice_id: str) -> Path:
        digest = hashlib.sha256(
            f"{voice_id}:{text}".encode("utf-8")
        ).hexdigest()
        return self._cache_dir / f"{digest}.mp3"

    async def synthesize(self, text: str, dialect: Dialect | None = None) -> Path:
        """Render ``text`` to an MP3 in the dialect's voice; return its path.

        Returns the cached file when one already exists for this (voice, text).
        """
        voice_id = self._resolve_voice(dialect)
        path = self._cache_path(text, voice_id)
        if path.exists():
            return path

        url = f"{self._base_url}/text-to-speech/{voice_id}"
        headers = {
            "xi-api-key": self._api_key,
            "Content-Type": "application/json",
        }
        payload = {
            "text": text,
            # Multilingual model so a single request handles any dialect.
            "model_id": "eleven_multilingual_v2",
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, json=payload, headers=headers)
            resp.raise_for_status()
            path.write_bytes(resp.content)

        return path


voice_service = VoiceService()
