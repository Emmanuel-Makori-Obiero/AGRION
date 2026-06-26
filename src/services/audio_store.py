"""Pluggable publishing for synthesised audio clips.

ElevenLabs output is cached on local disk by :mod:`voice_service`. That file
then has to be reachable by Africa's Talking to ``<Play>`` it. On an ephemeral
container filesystem (the deploy target) a local file can vanish on restart, so
this module abstracts *publishing* a cached clip to a durable, public location.

Selection is automatic: set ``audio_s3_bucket`` to publish to S3, otherwise the
clip is served from local disk via the ``/voice/audio/{filename}`` route. The
``boto3`` import is lazy so S3 stays an optional dependency.
"""

from __future__ import annotations

import asyncio
import logging
from pathlib import Path

from config.settings import get_settings

logger = logging.getLogger(__name__)


class LocalAudioStore:
    """Serve clips from disk through the app's own audio route."""

    def publish_url(self, path: Path, request_base_url: str) -> str:
        base = get_settings().public_base_url.rstrip("/") or request_base_url.rstrip(
            "/"
        )
        return f"{base}/api/v1/voice/audio/{path.name}"


class S3AudioStore:
    """Upload clips to S3 and return a public (or CDN-fronted) URL."""

    def __init__(self) -> None:
        settings = get_settings()
        self._bucket = settings.audio_s3_bucket
        self._region = settings.audio_s3_region
        self._public_base = settings.audio_s3_public_base.rstrip("/")

    def _upload_sync(self, path: Path) -> None:
        import boto3  # lazy: optional dependency

        client = boto3.client("s3", region_name=self._region)
        client.upload_file(
            str(path),
            self._bucket,
            path.name,
            ExtraArgs={"ContentType": "audio/mpeg"},
        )

    async def publish_url(self, path: Path, request_base_url: str) -> str:
        # Upload off the event loop (boto3 is synchronous).
        await asyncio.to_thread(self._upload_sync, path)
        if self._public_base:
            return f"{self._public_base}/{path.name}"
        return f"https://{self._bucket}.s3.{self._region}.amazonaws.com/{path.name}"


async def publish(path: Path, request_base_url: str) -> str:
    """Publish a cached clip and return a URL Africa's Talking can fetch."""
    settings = get_settings()
    if settings.audio_s3_bucket:
        return await S3AudioStore().publish_url(path, request_base_url)
    return LocalAudioStore().publish_url(path, request_base_url)
