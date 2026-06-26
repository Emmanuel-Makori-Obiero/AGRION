"""MMS vision-diagnostics pipeline.

A lightweight, framework-free worker that turns a blurry low-resolution MMS
photo into a single SMS-ready diagnosis:

    raw bytes -> local enhancement -> Vision LLM -> validated diagnosis -> SMS

Stages are deliberately decoupled so each can be tested and swapped in
isolation. The orchestrator is :func:`diagnose_image`.
"""

from __future__ import annotations

from src.vision.models import Diagnosis, QualityReport, VisionResult, VisionStatus
from src.vision.pipeline import diagnose_image

__all__ = [
    "diagnose_image",
    "Diagnosis",
    "QualityReport",
    "VisionResult",
    "VisionStatus",
]
