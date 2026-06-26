"""Consent recording for telephony channels.

NDPA-2023-flavoured: we keep an auditable consent record keyed by the *hashed*
phone number. Feature-phone channels (USSD/SMS/voice) auto-grant on first use,
because the caller has no way to tap an "I agree" control — but the grant is
still persisted with its channel and timestamp.

This is the pattern, not a legal review. A production rollout should add an
explicit IVR/SMS opt-in step for first-time callers.
"""

from __future__ import annotations

import asyncio
import logging

from src.services.graph_service import graph_service

logger = logging.getLogger(__name__)


async def ensure_consent(phone_hash: str, channel: str) -> None:
    """Best-effort: record a consent grant for a hashed farmer on a channel.

    Runs the synchronous driver off the event loop and never raises — a consent
    write failing must not break the farmer's turn.
    """
    try:
        await asyncio.to_thread(graph_service.ensure_consent, phone_hash, channel)
    except Exception as exc:  # noqa: BLE001 — non-critical side-effect
        logger.error("consent: failed to record for %s/%s: %s", phone_hash, channel, exc)
