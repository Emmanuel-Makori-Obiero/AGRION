"""
Africa's Talking inbound SMS webhook.

MVP scope: free-text questions only. The MMS photo / vision-upscaling
pipeline described in the proposal (Stages 1-4) is intentionally OUT of
scope for the 2-day build -- it needs image storage, an upscaling model,
and a vision-LLM call. Note it in the pitch as "designed, next sprint."
"""
from flask import Blueprint, jsonify, request

from services.ai_engine import get_advice
from services.consent import has_consented, hash_phone, record_consent
from services.knowledge_graph import get_crop_context, log_farmer_query

sms_bp = Blueprint("sms", __name__)

# FIX: was referencing undefined KNOWN_CROPS (missing capital K)
KNOWN_CROPS = ["maize", "cassava", "tomato", "rice", "yam"]


def _guess_crop(text: str) -> str | None:
    lowered = text.lower()
    for crop in KNOWN_CROPS:
        if crop in lowered:
            return crop
    return None


@sms_bp.route("/sms", methods=["POST"])
def sms_callback():
    phone_number = request.values.get("from", "")
    text = request.values.get("text", "")
    phone_hash = hash_phone(phone_number)

    if not text.strip():
        return jsonify({"reply_text": "Please send a farming question, e.g. 'maize yellow leaves'"}), 200

    if not has_consented(phone_hash):
        record_consent(phone_hash, True)

    crop = _guess_crop(text)
    context = get_crop_context(crop)
    advice = get_advice(text, context)
    log_farmer_query(phone_hash, crop or "unspecified", text, channel="sms")

    # Africa's Talking expects HTTP 200 with the body it will send as SMS.
    # Wire outbound AT Send SMS here once you have a live AT account.
    return jsonify({"reply_text": advice}), 200
