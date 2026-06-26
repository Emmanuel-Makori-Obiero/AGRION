"""Pluggable session store for short-lived call state.

The voice bridge needs to remember a caller's chosen dialect between Africa's
Talking callbacks. An in-process dict only works for a single worker; with
multiple workers (the deploy runs 2+) the next callback can land on a different
process. This module abstracts the store so the bridge code is identical
whether state lives in memory (dev/single worker) or Redis (production).

Selection is automatic: set ``redis_url`` to use Redis, otherwise the in-memory
store is used. ``redis`` is imported lazily so it stays an optional dependency.
"""

from __future__ import annotations

import logging
import time
from typing import Optional, Protocol

from config.settings import get_settings

logger = logging.getLogger(__name__)

_DEFAULT_TTL = 600  # seconds; a call won't outlive this


class SessionStore(Protocol):
    """Minimal async key/value store with per-key expiry."""

    async def get(self, key: str) -> Optional[str]: ...
    async def set(self, key: str, value: str, ttl: int = _DEFAULT_TTL) -> None: ...
    async def delete(self, key: str) -> None: ...


class InMemorySessionStore:
    """Process-local store with lazy TTL expiry. Fine for one worker only."""

    def __init__(self) -> None:
        self._data: dict[str, tuple[str, float]] = {}

    async def get(self, key: str) -> Optional[str]:
        item = self._data.get(key)
        if item is None:
            return None
        value, expires_at = item
        if expires_at < time.monotonic():
            self._data.pop(key, None)
            return None
        return value

    async def set(self, key: str, value: str, ttl: int = _DEFAULT_TTL) -> None:
        self._data[key] = (value, time.monotonic() + ttl)

    async def delete(self, key: str) -> None:
        self._data.pop(key, None)


class RedisSessionStore:
    """Redis-backed store; survives restarts and is shared across workers."""

    def __init__(self, url: str) -> None:
        from redis import asyncio as aioredis  # lazy: optional dependency

        self._redis = aioredis.from_url(url, decode_responses=True)

    async def get(self, key: str) -> Optional[str]:
        return await self._redis.get(key)

    async def set(self, key: str, value: str, ttl: int = _DEFAULT_TTL) -> None:
        await self._redis.set(key, value, ex=ttl)

    async def delete(self, key: str) -> None:
        await self._redis.delete(key)


def _build_store() -> SessionStore:
    url = get_settings().redis_url
    if url:
        try:
            logger.info("session store: Redis")
            return RedisSessionStore(url)
        except Exception as exc:  # missing dep / bad URL — fall back, stay up
            logger.error("Redis session store unavailable (%s); using memory", exc)
    logger.info("session store: in-memory (single-worker only)")
    return InMemorySessionStore()


# Module-level singleton chosen at import time from configuration.
session_store: SessionStore = _build_store()
