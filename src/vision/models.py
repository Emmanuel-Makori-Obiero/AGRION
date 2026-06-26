"""Pydantic models for the vision pipeline.

These cover three boundaries:

* :class:`QualityReport` — the verdict of the local image-quality gate.
* :class:`Diagnosis` — the *structured* answer we require from the Vision LLM
  (validated, never trusted as free text).
* :class:`VisionResult` — what the orchestrator hands back to the caller,
  including the final SMS string and the outcome status.
"""

from __future__ import annotations

from enum import Enum
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

SubjectType = Literal["crop", "pest", "disease", "weed", "unknown"]
Severity = Literal["low", "moderate", "high"]


class QualityReport(BaseModel):
    """Outcome of the local quality gate run before any LLM call is made."""

    is_processable: bool
    blur_score: float = Field(description="Variance of Laplacian; higher = sharper.")
    brightness: float = Field(description="Mean luma, 0–255.")
    width: int
    height: int
    reason: Optional[str] = Field(
        default=None,
        description="Why the image was rejected, when is_processable is False.",
    )


class Diagnosis(BaseModel):
    """The strict structured payload we demand back from the Vision LLM.

    ``extra="ignore"`` keeps validation resilient to a chatty model that adds
    stray keys, while still rejecting wrong *types* on the keys we care about.
    """

    model_config = ConfigDict(extra="ignore")

    subject_type: SubjectType
    crop: Optional[str] = Field(default=None, description="Identified crop, if any.")
    condition: Optional[str] = Field(
        default=None, description="Pest/disease/deficiency name, if any."
    )
    severity: Optional[Severity] = None
    confidence: float = Field(ge=0.0, le=1.0)
    recommendation: Optional[str] = Field(
        default=None, description="One short, actionable next step."
    )

    @field_validator("crop", "condition", "recommendation", mode="before")
    @classmethod
    def _blank_to_none(cls, v: object) -> object:
        """Normalise empty/placeholder strings the model sometimes emits."""
        if isinstance(v, str):
            v = v.strip()
            if not v or v.lower() in {"none", "n/a", "unknown", "null"}:
                return None
        return v


class VisionStatus(str, Enum):
    """Terminal state of one diagnosis attempt."""

    OK = "ok"  # confident diagnosis produced
    TOO_DEGRADED = "too_degraded"  # image failed the local quality gate
    UNIDENTIFIED = "unidentified"  # LLM could not confidently identify subject
    ERROR = "error"  # LLM/transport failure


class VisionResult(BaseModel):
    """What the orchestrator returns: always carries a send-ready ``sms``."""

    status: VisionStatus
    sms: str
    diagnosis: Optional[Diagnosis] = None
    quality: Optional[QualityReport] = None
    detail: Optional[str] = Field(
        default=None, description="Operator-facing note (errors, low confidence)."
    )
