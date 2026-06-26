"""
Featherless AI wrapper utilizing McGill-NLP/AfriqueGemma-4B.
Implements translate-after-generate and memory caching for graph nodes.
"""
import os
from openai import OpenAI
import re

_client = None
_kg_cache = {}

FALLBACK_ADVICE = (
    "Advisory engine unavailable. Try again or call your local extension officer."
)

USSD_MAX_CHARS = 160   # USSD hard cap (operators enforce 160–182; use 160 safe floor)
SMS_MAX_CHARS  = 150   # Single-SMS budget with AT overhead headroom
DEFAULT_MODEL  = "McGill-NLP/AfriqueGemma-4B"
REQUEST_TIMEOUT_SECONDS = 15.0


def get_client() -> OpenAI | None:
    global _client
    if _client is not None:
        return _client

    api_key = os.getenv("FEATHERLESS_API_KEY")
    if not api_key:
        print("[ai_engine] FEATHERLESS_API_KEY not set — using fallback.")
        return None

    _client = OpenAI(
        base_url="https://api.featherless.ai/v1",
        api_key=api_key,
        timeout=REQUEST_TIMEOUT_SECONDS,
    )
    return _client


def get_or_generate_context(crop: str, fetch_func) -> dict:
    """Cache-or-generate: retrieves from DB or generates missing agronomy context."""
    if crop in _kg_cache:
        return _kg_cache[crop]

    context = fetch_func(crop)
    if context:
        _kg_cache[crop] = context
        return context

    client = get_client()
    if client:
        try:
            model = os.getenv("FEATHERLESS_MODEL", DEFAULT_MODEL)
            system = "You are a West African agronomist. Summarize primary growing risks for the requested crop."
            res = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": f"Detail context for: {crop}"}
                ],
                max_tokens=60,
                temperature=0.2
            )
            context_data = {
                "crop": crop,
                "notes": res.choices[0].message.content.strip(),
                "pests": []
            }
            _kg_cache[crop] = context_data
            return context_data
        except Exception as e:
            print(f"[ai_engine] Context generation failed: {e}")

    return {"crop": crop, "notes": "Standard agronomic practices apply.", "pests": []}


def translate_response(text: str, target_lang: str) -> str:
    """Phase 2: Translates the English response to the target language."""
    if target_lang.lower() in ["en", "english"]:
        return text

    client = get_client()
    if not client:
        return text

    try:
        model = os.getenv("FEATHERLESS_MODEL", DEFAULT_MODEL)
        system_prompt = (
            f"You are a professional translator. Translate the following agricultural advice "
            f"into {target_lang}. Maintain brevity, technical accuracy, and clear formatting."
        )
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": text}
            ],
            max_tokens=120,
            temperature=0.1,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"[ai_engine] Translation phase failed: {e}")
        return text


def build_prompt(question: str, crop_context: dict | None) -> tuple[str, str]:
    if crop_context:
        pests = ", ".join(crop_context.get("pests") or []) or "none recorded"
        context_block = (
            f"Crop: {crop_context.get('crop')}. "
            f"Notes: {crop_context.get('notes') or 'n/a'}. "
            f"Pests: {pests}."
        )
    else:
        context_block = "No specific crop data available."

    system = (
        "You are Agrion, an agricultural advisor for smallholder farmers in Nigeria. "
        "Answer ONLY the farmer's question in 2 short plain sentences. "
        "Do NOT repeat the question, do NOT include context labels, "
        "do NOT say 'Based on...' or 'According to...'. "
        "Write only the advice itself. Max 140 characters total."
    )
    user = f"Context: {context_block}\nQuestion: {question}"
    return system, user


def get_advice(
    question: str,
    crop_context: dict | None = None,
    language_hint: str | None = None,
    channel: str = "sms",
) -> str:
    client = get_client()
    if client is None:
        return FALLBACK_ADVICE

    system, user = build_prompt(question, crop_context)
    model = os.getenv("FEATHERLESS_MODEL", DEFAULT_MODEL)

    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            max_tokens=80,
            temperature=0.3,
        )
        
        # ─── SANITIZATION & EXTRACTION BLOCK ───
        raw = response.choices[0].message.content.strip()

        # Strip chain-of-thought leak tags (restored from hidden Markdown tags)
        if "</think>" in raw:
            raw = raw.split("</think>")[-1].strip()
        elif "<think>" in raw:
            raw = raw.split("<think>")[-1].strip()

        # Strip any role echoes or prompt leaking headers
        for prefix in ("user\n", "assistant\n", "Question:", "Answer:", "Context:"):
            if raw.lower().startswith(prefix.lower()):
                raw = raw[len(prefix):].strip()

        # Strip emoji and complex symbols that break standard GSM/SMS encoding
        raw = re.sub(r'[^\x00-\x7F\u00C0-\u024F\u1E00-\u1EFF]', '', raw).strip()
        advice_en = raw if raw else FALLBACK_ADVICE
        # ───────────────────────────────────────

        # Phase 2: translate the sanitized text
        final_advice = translate_response(advice_en, language_hint or "English")

        # Enforce channel character budgets safely
        if channel == "ussd":
            cap = USSD_MAX_CHARS
        else:
            cap = SMS_MAX_CHARS  # sms, mms, default

        if len(final_advice) > cap:
            final_advice = final_advice[:cap - 3].rstrip() + "..."

        return final_advice
        
    except Exception as e:
        print(f"[ai_engine] Engine pipeline failed: {e}")
        return FALLBACK_ADVICE
    
    
