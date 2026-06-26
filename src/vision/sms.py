"""SMS condensation — turn a validated Diagnosis into a <=160-char message.

This is deliberately deterministic (no second LLM call): we control the wording,
so the output is predictable, cheap, and instant. The builder assembles the most
useful fields first and drops the least important ones to stay within budget.

Note on the limit: 160 is the GSM-7 single-segment budget. Latin diacritics used
in localized Hausa/Yoruba/Igbo can push a message into UCS-2 (70 chars/segment).
We count code points here and keep English concise; localization/translation is
handled downstream by the existing channel formatter, which is encoding-aware.
"""

from __future__ import annotations

from src.vision.models import Diagnosis

SMS_LIMIT = 160

# Fallbacks are pre-written, action-oriented, and comfortably within one segment.
FALLBACK_TOO_DEGRADED = (
    "Photo too blurry or dark to read. Please resend a clear, close-up photo of "
    "the affected plant in good daylight."
)
FALLBACK_UNIDENTIFIED = (
    "Could not identify the problem from the photo. Send a close-up of the "
    "affected leaves, or reply describing the symptoms."
)
FALLBACK_ERROR = (
    "Diagnosis service is busy right now. Please resend your photo in a few "
    "minutes."
)


def _fit(text: str, limit: int = SMS_LIMIT) -> str:
    """Trim to the SMS budget on a word boundary, marking dropped content."""
    text = " ".join(text.split())
    if len(text) <= limit:
        return text
    ellipsis = "."
    trimmed = text[: limit - len(ellipsis)].rsplit(" ", 1)[0].rstrip(" ,.;:")
    return f"{trimmed}{ellipsis}"


def condense(diagnosis: Diagnosis) -> str:
    """Render a Diagnosis as a single SMS, prioritising subject then action.

    Layout: ``"<Crop>: <Condition> (<severity>). <Recommendation>"`` with each
    segment included only when present, then trimmed to the SMS budget.
    """
    subject = diagnosis.crop or (
        diagnosis.condition or diagnosis.subject_type.capitalize()
    )

    # Headline: what it is.
    head = subject
    if diagnosis.condition and diagnosis.condition != subject:
        head = f"{subject}: {diagnosis.condition}"
    if diagnosis.severity:
        head = f"{head} ({diagnosis.severity})"

    # Body: what to do. The action is the highest-value part for the farmer, so
    # it is kept whole where possible and the headline is what gets trimmed.
    if diagnosis.recommendation:
        action = diagnosis.recommendation.rstrip(".")
        message = f"{head}. {action}."
    else:
        message = f"{head}."

    return _fit(message)
