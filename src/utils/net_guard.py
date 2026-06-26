"""Network-boundary guards for the telephony webhooks.

Two protections live here:

* :func:`assert_safe_url` — blocks Server-Side Request Forgery. The MMS and
  voice flows fetch a URL supplied in the (untrusted) webhook payload; without
  a guard an attacker could point us at ``169.254.169.254`` or an internal
  service. We enforce scheme, an optional domain allowlist, and — crucially —
  that every resolved IP is publicly routable.

* :func:`verify_telephony_caller` — a FastAPI dependency that authenticates the
  *inbound* webhook. Africa's Talking has no request-signing standard, so we
  rely on an IP allowlist; Twilio requests are additionally verified via their
  ``X-Twilio-Signature`` HMAC when an auth token is configured.
"""

from __future__ import annotations

import asyncio
import base64
import hmac
import ipaddress
import logging
from hashlib import sha1
from urllib.parse import urlparse

from fastapi import HTTPException, Request

from config.settings import get_settings

logger = logging.getLogger(__name__)


class UnsafeURLError(ValueError):
    """Raised when a URL fails the SSRF guard."""


def _split_csv(value: str) -> list[str]:
    return [item.strip() for item in value.split(",") if item.strip()]


def _host_allowed(host: str, allowlist: list[str]) -> bool:
    host = host.lower()
    return any(host == d or host.endswith(f".{d}") for d in allowlist)


async def assert_safe_url(url: str) -> None:
    """Validate ``url`` is safe to fetch, or raise :class:`UnsafeURLError`.

    Enforces an http(s) scheme, the configured domain allowlist (when set), and
    that no resolved address is private/loopback/link-local/reserved.
    """
    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https") or not parsed.hostname:
        raise UnsafeURLError(f"unsupported or malformed URL: {url!r}")

    allowlist = _split_csv(get_settings().media_host_allowlist)
    if allowlist and not _host_allowed(parsed.hostname, allowlist):
        raise UnsafeURLError(f"host not in media allowlist: {parsed.hostname}")

    port = parsed.port or (443 if parsed.scheme == "https" else 80)
    loop = asyncio.get_running_loop()
    try:
        infos = await loop.getaddrinfo(parsed.hostname, port)
    except OSError as exc:
        raise UnsafeURLError(f"could not resolve host: {parsed.hostname}") from exc

    for info in infos:
        ip = ipaddress.ip_address(info[4][0])
        # is_global is False for private/loopback/link-local/reserved ranges.
        if not ip.is_global:
            raise UnsafeURLError(
                f"host {parsed.hostname} resolves to non-public address {ip}"
            )


def _valid_twilio_signature(
    auth_token: str, url: str, params: dict[str, str], signature: str
) -> bool:
    """Recompute Twilio's HMAC-SHA1 signature and compare in constant time."""
    payload = url + "".join(f"{k}{params[k]}" for k in sorted(params))
    digest = hmac.new(
        auth_token.encode("utf-8"), payload.encode("utf-8"), sha1
    ).digest()
    expected = base64.b64encode(digest).decode("utf-8")
    return hmac.compare_digest(expected, signature)


async def verify_telephony_caller(request: Request) -> None:
    """FastAPI dependency: authenticate an inbound telephony webhook.

    Applies the IP allowlist when configured, and verifies the Twilio signature
    when both the header and an auth token are present. Raises ``403`` on
    failure. With nothing configured it allows the request but logs a warning,
    so misconfiguration is visible rather than silently open.
    """
    settings = get_settings()

    cidrs = _split_csv(settings.telephony_ip_allowlist)
    if cidrs:
        client_ip = ipaddress.ip_address(request.client.host)
        if not any(client_ip in ipaddress.ip_network(c, strict=False) for c in cidrs):
            logger.warning("rejected webhook from disallowed IP %s", client_ip)
            raise HTTPException(status_code=403, detail="forbidden")

    signature = request.headers.get("X-Twilio-Signature")
    if signature and settings.twilio_auth_token:
        form = await request.form()
        params = {k: str(v) for k, v in form.items()}
        if not _valid_twilio_signature(
            settings.twilio_auth_token, str(request.url), params, signature
        ):
            logger.warning("rejected webhook with bad Twilio signature")
            raise HTTPException(status_code=403, detail="forbidden")

    if not cidrs and not (signature and settings.twilio_auth_token):
        logger.warning(
            "telephony webhook accepted without authentication; set "
            "telephony_ip_allowlist (or Twilio auth) in production"
        )
