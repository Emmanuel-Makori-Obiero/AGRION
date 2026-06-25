"""
REST API consumed by the Lovable web frontend (Pathway B).
"""
from flask import Blueprint, jsonify, request

from services.ai_engine import get_advice
from services.consent import has_consented, hash_phone, record_consent
from services.knowledge_graph import get_crop_context, get_farmer_history, log_farmer_query

api_bp = Blueprint("api", __name__)


@api_bp.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "agrion-backend"})


@api_bp.route("/consent", methods=["POST"])
def consent():
    """Body: { "phone": "+234...", "granted": true }"""
    data = request.get_json(force=True) or {}
    phone = data.get("phone")
    granted = bool(data.get("granted", True))

    if not phone:
        return jsonify({"error": "phone is required"}), 400

    phone_hash = hash_phone(phone)
    record_consent(phone_hash, granted)
    return jsonify({"phone_hash": phone_hash, "consent": granted})


@api_bp.route("/advice", methods=["POST"])
def advice():
    """Body: { "phone": "+234...", "crop": "Maize", "question": "...", "language": "Hausa" }"""
    data = request.get_json(force=True) or {}
    phone = data.get("phone", "web-anonymous")
    crop = data.get("crop")
    question = data.get("question")
    language = data.get("language")

    if not question:
        return jsonify({"error": "question is required"}), 400

    phone_hash = hash_phone(phone)
    if phone != "web-anonymous" and not has_consented(phone_hash):
        return jsonify({
            "error": "consent_required",
            "message": "Grant data consent before requesting advice (NDPA 2023).",
        }), 403

    context = get_crop_context(crop) if crop else None
    answer = get_advice(question, context, language_hint=language, channel="web")
    log_farmer_query(phone_hash, crop or "unspecified", question, channel="web")

    return jsonify({"crop": crop, "answer": answer})


@api_bp.route("/history", methods=["GET"])
def history():
    """GET /api/history?phone=+234... — recent farmer queries (for dashboard)."""
    phone = request.args.get("phone")
    if not phone:
        return jsonify({"error": "phone query param required"}), 400

    phone_hash = hash_phone(phone)
    queries = get_farmer_history(phone_hash)
    return jsonify({"queries": queries})
