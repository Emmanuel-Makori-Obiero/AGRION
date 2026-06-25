"""
Featherless AI wrapper utilizing McGill-NLP/AfriqueQwen-4B.
Implements translate-after-generate and memory caching for graph nodes.
"""
import os
from openai import OpenAI

_client = None
_kg_cache = {}

FALLBACK_ADVICE = (
    "We could not reach the advisory engine right now. "
    "Please try again shortly or call your local extension officer."
)

USSD_MAX_CHARS = 175
DEFAULT_MODEL = "McGill-NLP/AfriqueQwen-4B"
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
    """Cache-or-generate: Retrieves from DB or generates missing agronomy context."""
    if crop in _kg_cache:
        return _kg_cache[crop]
    
    # 1. Attempt DB fetch
    context = fetch_func(crop)
    if context:
        _kg_cache[crop] = context
        return context
        
    # 2. Generate fallback context if node is missing
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
    """Phase 2: Translates the engineered English response to the target language."""
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
            f"Agronomic notes: {crop_context.get('notes') or 'n/a'}. "
            f"Known pests/risks: {pests}."
        )
    else:
        context_block = "No specific crop record found in the knowledge graph."

    system = (
        "You are Agrion, an agricultural advisor for smallholder farmers in Nigeria. "
        "Keep answers to 2 SHORT sentences. Be practical and specific. "
        "Suitable for a single SMS. Respond in simple, clear English only."
    )
    user = f"Knowledge graph context: {context_block}\n\nFarmer question: {question}"
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

    # Phase 1: Generate optimal advice in English
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
        advice_en = response.choices[0].message.content.strip()
        
        # Phase 2: Translate to requested language
        final_advice = translate_response(advice_en, language_hint or "English")

        # Hard truncate for USSD channel safety limits
        if channel == "ussd" and len(final_advice) > USSD_MAX_CHARS:
            final_advice = final_advice[: USSD_MAX_CHARS - 3] + "..."

        return final_advice
    except Exception as e:
        print(f"[ai_engine] Engine pipeline failed: {e}")
        return FALLBACK_ADVICE