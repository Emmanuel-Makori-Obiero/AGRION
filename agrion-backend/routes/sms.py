"""
Africa's Talking inbound SMS webhook.

Two flows handled here:
  1. Coupon retrieval  — farmer texts a 6-char code (e.g. "A3KZ9B")
                         and gets back the full advice from USSD session.
  2. Direct question   — farmer texts a free-form question and gets
                         a short AI answer directly in the SMS reply.
"""
import logging
import os  # Added to fetch environment variables
from flask import Blueprint, request
import africastalking

from services.ai_engine import get_advice
from services.consent import has_consented, hash_phone, record_consent
from services.knowledge_graph import get_crop_context, log_farmer_query
from services.sms_store import retrieve_advice

sms_bp = Blueprint("sms", __name__)

SMS_CHARACTER_BUDGET = 150

KNOWN_CROPS = [
    "maize", "cassava", "tomato", "rice", "yam",
    "sorghum", "cowpea", "cocoa", "millet", "pepper", "groundnut"
]

# ── INITIALIZE AFRICA'S TALKING SDK ───────────────────────────────────
# Pull credentials from your environment or default to sandbox
at_username = os.getenv("AT_USERNAME", "sandbox")
at_api_key = os.getenv("AT_API_KEY")

if at_api_key:
    africastalking.initialize(at_username, at_api_key)
    at_sms = africastalking.SMS
else:
    logging.warning("AT_API_KEY is missing from environment. Outbound SMS will fail.")
    at_sms = None
# ──────────────────────────────────────────────────────────────────────


def _guess_crop(text: str) -> str | None:
    lowered = text.lower()
    for crop in KNOWN_CROPS:
        if crop in lowered:
            return crop
    return None


def _is_coupon(text: str) -> bool:
    """True if the SMS looks like a 6-char coupon code."""
    t = text.strip().upper()
    return len(t) == 6 and t.isalnum()


@sms_bp.route("/sms", methods=["POST"])
def sms_callback():
    phone_number = request.values.get("from", "").strip()
    text         = request.values.get("text", "").strip()
    phone_hash   = hash_phone(phone_number) if phone_number else "anonymous_hash"

    if not text:
        # AT just needs a 200 OK plain response. We don't return JSON.
        return "OK", 200 

    # 2. Consent
    if not has_consented(phone_hash):
        record_consent(phone_hash, True)

    advice = ""

    # ── FLOW A: Coupon retrieval ──────────────────────────────────────
    if _is_coupon(text):
        advice = retrieve_advice(text)
        if advice:
            log_farmer_query(phone_hash, "coupon_retrieval", text, channel="sms")
        else:
            advice = "Code not found or expired. Dial *384*55# for new advice."

    # ── FLOW B: Direct SMS question ───────────────────────────────────
    else:
        crop      = _guess_crop(text)
        safe_crop = crop if crop else "unspecified"
        context   = get_crop_context(safe_crop)
        advice    = get_advice(text, context, channel="sms")

        if not advice:
            advice = "Could not generate advice. Describe the issue differently."

        # Truncate to SMS budget
        if len(advice) > SMS_CHARACTER_BUDGET:
            advice = advice[:SMS_CHARACTER_BUDGET].rstrip() + "..."

        try:
            log_farmer_query(phone_hash, safe_crop, text, channel="sms")
        except Exception as e:
            logging.error(f"[sms] Log failed: {e}")

    # ── SEND OUTBOUND SMS VIA SDK ─────────────────────────────────────
    if phone_number and advice and at_sms:
        try:
            response = at_sms.send(advice, [phone_number])
            logging.info(f"AT SMS Response: {response}")
        except Exception as e:
            logging.error(f"Failed to send AT SMS: {e}")

    # Acknowledge receipt of the webhook back to Africa's Talking
    return "Message Processed", 200