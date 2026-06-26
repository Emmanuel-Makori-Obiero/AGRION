"""Africa's Talking call-control XML builders.

Africa's Talking drives the call by reading an XML document on every webhook
response: ``<Response>`` wrapping verbs like ``<Say>``, ``<Play>``, ``<Record>``
and ``<GetDigits>``. These helpers build those strings with correct escaping so
controllers stay readable and never hand-concatenate XML.

All user-facing text is XML-escaped, and every attribute is quoted via
``quoteattr`` so a stray quote or ``&`` in a URL or prompt can't break the doc.
"""

from __future__ import annotations

from xml.sax.saxutils import escape, quoteattr

from fastapi.responses import Response


def _attrs(**kwargs: object) -> str:
    """Render keyword args as XML attributes, skipping ``None`` values."""
    parts = [f"{k}={quoteattr(str(v))}" for k, v in kwargs.items() if v is not None]
    return (" " + " ".join(parts)) if parts else ""


def say(text: str, voice: str | None = None) -> str:
    """Speak text via Africa's Talking built-in TTS."""
    return f"<Say{_attrs(voice=voice)}>{escape(text)}</Say>"


def play(url: str) -> str:
    """Play an audio file from a publicly reachable URL."""
    return f"<Play{_attrs(url=url)}/>"


def record(
    *,
    prompt: str | None = None,
    finish_on_key: str = "#",
    max_length: int = 20,
    timeout: int = 10,
    play_beep: bool = True,
    trim_silence: bool = True,
) -> str:
    """Record a snippet of caller audio, then continue the call.

    This is the *partial* ``<Record>`` form: the caller's audio is captured and
    its ``recordingUrl`` is delivered on the *next* webhook callback, so the
    controller can transcribe it and respond. An optional spoken ``prompt`` is
    nested inside.
    """
    inner = say(prompt) if prompt else ""
    attrs = _attrs(
        finishOnKey=finish_on_key,
        maxLength=max_length,
        timeout=timeout,
        playBeep=str(play_beep).lower(),
        trimSilence=str(trim_silence).lower(),
    )
    return f"<Record{attrs}>{inner}</Record>"


def get_digits(
    prompt: str,
    *,
    num_digits: int = 1,
    timeout: int = 10,
    finish_on_key: str | None = None,
) -> str:
    """Prompt for DTMF input; the pressed digits arrive on the next callback."""
    attrs = _attrs(
        numDigits=num_digits, timeout=timeout, finishOnKey=finish_on_key
    )
    return f"<GetDigits{attrs}>{say(prompt)}</GetDigits>"


def hangup() -> str:
    """End the call."""
    return "<Hangup/>"


def reject() -> str:
    """Reject an inbound call before it is answered/billed."""
    return "<Reject/>"


def response(*elements: str) -> Response:
    """Wrap call-control verbs in a ``<Response>`` document as a FastAPI Response.

    An empty call (no elements) is the correct reply to a call-ended callback.
    """
    body = "".join(elements)
    xml = f'<?xml version="1.0" encoding="UTF-8"?><Response>{body}</Response>'
    return Response(content=xml, media_type="application/xml")
