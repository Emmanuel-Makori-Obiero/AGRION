"""Stages 3 & 4 — Vision LLM call and structured-output parsing.

Sends the base64-encoded *enhanced* image to an OpenAI-compatible vision
endpoint (GPT-4o by default) and returns a validated :class:`Diagnosis`.

Plain ``httpx`` only — no orchestration framework. The model is forced into
JSON mode and given a strict schema; we still validate with Pydantic because
"JSON mode" guarantees *valid JSON*, not *the right shape*.
"""

from __future__ import annotations

import base64
import logging

import httpx
from pydantic import ValidationError

from config.settings import get_settings
from src.vision.models import Diagnosis

logger = logging.getLogger(__name__)


class VisionLLMError(RuntimeError):
    """Raised when the Vision LLM cannot be reached or returns unusable output."""


# A tight, low-ambiguity contract. The model is told exactly what to emit and,
# crucially, what to do when it is *unsure* — so uncertainty surfaces as a low
# confidence score instead of a confident hallucination.
SYSTEM_PROMPT = """\
You are a plant-health diagnostic engine for Nigerian smallholder farmers.
You receive ONE photo of a plant, leaf, pest, or field. Identify the crop and
any pest, disease, or nutrient deficiency visible.

Rules:
- Respond with a SINGLE JSON object and nothing else. No prose, no markdown.
- Use EXACTLY these keys:
  {
    "subject_type": one of "crop" | "pest" | "disease" | "weed" | "unknown",
    "crop": string or null,           // e.g. "Maize", "Rice", "Cassava"
    "condition": string or null,      // e.g. "Fall armyworm", "Leaf blast"
    "severity": "low" | "moderate" | "high" | null,
    "confidence": number 0.0-1.0,     // your honest certainty
    "recommendation": string or null  // ONE action, max 12 words, low-cost
  }
- Base every field ONLY on what is visible. Do not guess a specific disease
  from an unclear image.
- If you cannot clearly identify the subject, set "subject_type":"unknown" and
  a LOW "confidence" (below 0.4). Never invent a condition to seem helpful.
- Prefer common Nigerian pests/diseases and locally available, affordable
  remedies in the recommendation.\
"""


def _to_data_uri(image_bytes: bytes) -> str:
    """Base64-encode JPEG bytes as an inline data URI for the image_url field."""
    b64 = base64.b64encode(image_bytes).decode("ascii")
    return f"data:image/jpeg;base64,{b64}"


def _build_payload(image_bytes: bytes, model: str) -> dict:
    """Assemble the OpenAI-format chat-completions request body."""
    return {
        "model": model,
        "temperature": 0.0,  # deterministic, factual
        "max_tokens": 300,
        "response_format": {"type": "json_object"},
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "Diagnose this plant photo. Return only the JSON object.",
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": _to_data_uri(image_bytes),
                            # 'low' keeps token cost/latency down; the image is
                            # already enhanced and resized for legibility.
                            "detail": "low",
                        },
                    },
                ],
            },
        ],
    }


async def diagnose(image_bytes: bytes) -> Diagnosis:
    """Send an enhanced image to the Vision LLM and return a validated Diagnosis.

    Raises :class:`VisionLLMError` on transport, HTTP, JSON, or schema failure so
    the orchestrator can fall back to a safe SMS.
    """
    settings = get_settings()
    if not settings.vision_api_key:
        raise VisionLLMError("vision_api_key is not configured")

    url = f"{settings.vision_base_url.rstrip('/')}/chat/completions"
    headers = {"Authorization": f"Bearer {settings.vision_api_key}"}
    payload = _build_payload(image_bytes, settings.vision_model)

    try:
        async with httpx.AsyncClient(timeout=settings.vision_request_timeout) as client:
            resp = await client.post(url, json=payload, headers=headers)
            resp.raise_for_status()
            data = resp.json()
            content = data["choices"][0]["message"]["content"]
    except httpx.HTTPError as exc:
        raise VisionLLMError(f"vision request failed: {exc}") from exc
    except (KeyError, IndexError, ValueError) as exc:
        raise VisionLLMError(f"unexpected vision response shape: {exc}") from exc

    try:
        # Pydantic v2 parses the JSON string and enforces the schema in one step.
        return Diagnosis.model_validate_json(content)
    except ValidationError as exc:
        logger.warning("vision: schema validation failed for %r", content)
        raise VisionLLMError(f"vision output failed validation: {exc}") from exc
