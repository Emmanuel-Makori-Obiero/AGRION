"""The orchestrator — tie the four stages into one diagnosis attempt.

    enhance() -> diagnose() -> validate confidence -> condense()

Every branch returns a :class:`VisionResult` whose ``sms`` is always safe to
send, so callers (the MMS webhook worker) never have to handle ``None``.
"""

from __future__ import annotations

import logging

from config.settings import get_settings
from src.vision import sms
from src.vision.client import VisionLLMError, diagnose
from src.vision.enhance import enhance
from src.vision.models import VisionResult, VisionStatus

logger = logging.getLogger(__name__)


async def diagnose_image(image_bytes: bytes) -> VisionResult:
    """Run the full MMS-diagnostics pipeline on one inbound image.

    Args:
        image_bytes: the raw bytes of the MMS attachment (any format OpenCV can
            decode: JPEG, PNG, etc.).

    Returns:
        A :class:`VisionResult` carrying the terminal status and a send-ready
        ``sms`` string for the farmer.
    """
    settings = get_settings()

    # --- Stages 1 & 2: local enhancement + quality gate ------------------ #
    enhanced, quality = enhance(image_bytes)
    if enhanced is None:
        return VisionResult(
            status=VisionStatus.TOO_DEGRADED,
            sms=sms.FALLBACK_TOO_DEGRADED,
            quality=quality,
            detail=f"quality gate: {quality.reason}",
        )

    # --- Stages 3 & 4: Vision LLM + schema validation -------------------- #
    try:
        diagnosis = await diagnose(enhanced)
    except VisionLLMError as exc:
        logger.error("vision: diagnosis failed: %s", exc)
        return VisionResult(
            status=VisionStatus.ERROR,
            sms=sms.FALLBACK_ERROR,
            quality=quality,
            detail=str(exc),
        )

    # --- Confidence gate: refuse to send a guess as if it were a finding -- #
    if (
        diagnosis.subject_type == "unknown"
        or diagnosis.confidence < settings.vision_min_confidence
    ):
        logger.info(
            "vision: low-confidence result (%.2f, %s); returning fallback",
            diagnosis.confidence,
            diagnosis.subject_type,
        )
        return VisionResult(
            status=VisionStatus.UNIDENTIFIED,
            sms=sms.FALLBACK_UNIDENTIFIED,
            diagnosis=diagnosis,
            quality=quality,
            detail=f"confidence {diagnosis.confidence:.2f}",
        )

    # --- Success: condense to a single SMS ------------------------------- #
    return VisionResult(
        status=VisionStatus.OK,
        sms=sms.condense(diagnosis),
        diagnosis=diagnosis,
        quality=quality,
    )
