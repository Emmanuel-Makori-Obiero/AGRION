"""Stages 1 & 2 — local, lightweight image enhancement.

No deep-learning super-resolution here: just classic OpenCV operations chosen to
clean up a typical 2 MP MMS photo (noisy, dim, soft) fast enough to run inside a
standard container worker with no GPU.

Pipeline, in order:

1. **Quality gate** — reject images that are too dark or too blurry to bother
   sending to the (paid, slower) Vision LLM.
2. **Denoise** — edge-preserving bilateral filter (keeps leaf/lesion edges).
3. **Contrast** — CLAHE on the luma channel, for uneven outdoor lighting.
4. **Resize** — fit the long edge to a target so small images gain detail and
   huge ones don't bloat the upload.
5. **Sharpen** — unsharp mask to recover perceived detail.

The public entry point is :func:`enhance`.
"""

from __future__ import annotations

import logging

import cv2
import numpy as np

from config.settings import get_settings
from src.vision.models import QualityReport

logger = logging.getLogger(__name__)


def _decode(image_bytes: bytes) -> np.ndarray | None:
    """Decode raw bytes to a BGR image, or ``None`` if it isn't a valid image."""
    buffer = np.frombuffer(image_bytes, dtype=np.uint8)
    img = cv2.imdecode(buffer, cv2.IMREAD_COLOR)
    return img


def _assess(img: np.ndarray) -> QualityReport:
    """Score sharpness and brightness and decide if the image is worth sending."""
    settings = get_settings()
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Variance of the Laplacian is a cheap, robust focus metric: low variance
    # means few edges, i.e. a blurry frame.
    blur_score = float(cv2.Laplacian(gray, cv2.CV_64F).var())
    brightness = float(gray.mean())
    height, width = img.shape[:2]

    reason: str | None = None
    if blur_score < settings.vision_blur_threshold:
        reason = "too_blurry"
    elif brightness < settings.vision_min_brightness:
        reason = "too_dark"
    elif min(width, height) < settings.vision_min_edge:
        reason = "too_small"

    return QualityReport(
        is_processable=reason is None,
        blur_score=blur_score,
        brightness=brightness,
        width=width,
        height=height,
        reason=reason,
    )


def _resize_to_target(img: np.ndarray, target_long_edge: int) -> np.ndarray:
    """Scale the image so its longest side equals ``target_long_edge``."""
    height, width = img.shape[:2]
    long_edge = max(height, width)
    if long_edge == target_long_edge:
        return img

    scale = target_long_edge / long_edge
    new_size = (round(width * scale), round(height * scale))
    # INTER_CUBIC interpolates well when upscaling; INTER_AREA is best for shrink.
    interpolation = cv2.INTER_CUBIC if scale > 1 else cv2.INTER_AREA
    return cv2.resize(img, new_size, interpolation=interpolation)


def _unsharp_mask(img: np.ndarray, amount: float = 1.0, sigma: float = 3.0) -> np.ndarray:
    """Sharpen via unsharp masking (original + amount*(original - blurred))."""
    blurred = cv2.GaussianBlur(img, (0, 0), sigmaX=sigma)
    return cv2.addWeighted(img, 1 + amount, blurred, -amount, 0)


def enhance(image_bytes: bytes) -> tuple[bytes | None, QualityReport]:
    """Enhance an MMS image and report its quality.

    Returns ``(jpeg_bytes, report)``. When the quality gate rejects the image
    (or it cannot be decoded), ``jpeg_bytes`` is ``None`` and the report's
    ``reason`` explains why — the caller should short-circuit to a fallback SMS
    rather than spend an LLM call on an unusable frame.
    """
    settings = get_settings()

    img = _decode(image_bytes)
    if img is None:
        logger.warning("vision: could not decode inbound image bytes")
        return None, QualityReport(
            is_processable=False,
            blur_score=0.0,
            brightness=0.0,
            width=0,
            height=0,
            reason="decode_failed",
        )

    report = _assess(img)
    if not report.is_processable:
        logger.info("vision: image rejected by quality gate (%s)", report.reason)
        return None, report

    # --- Stage 2: enhancement chain -------------------------------------- #
    # Edge-preserving denoise (cheap relative to fastNlMeans, keeps lesions).
    img = cv2.bilateralFilter(img, d=7, sigmaColor=50, sigmaSpace=50)

    # Local contrast for uneven field lighting, applied to luma only so colours
    # (key for chlorosis/disease cues) are preserved.
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    luma, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    luma = clahe.apply(luma)
    img = cv2.cvtColor(cv2.merge((luma, a, b)), cv2.COLOR_LAB2BGR)

    img = _resize_to_target(img, settings.vision_target_long_edge)
    img = _unsharp_mask(img, amount=0.8, sigma=3.0)

    ok, encoded = cv2.imencode(
        ".jpg", img, [int(cv2.IMWRITE_JPEG_QUALITY), settings.vision_jpeg_quality]
    )
    if not ok:
        logger.error("vision: JPEG re-encode failed after enhancement")
        return None, QualityReport(
            is_processable=False,
            blur_score=report.blur_score,
            brightness=report.brightness,
            width=report.width,
            height=report.height,
            reason="encode_failed",
        )

    return encoded.tobytes(), report
