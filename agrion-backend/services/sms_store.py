"""
services/sms_store.py

In-memory + file-backed store for SMS advice coupons.
Farmer types their coupon code via SMS to retrieve full advice.
"""
import json
import os
import random
import string
from datetime import datetime

# File-backed so coupons survive restarts
STORE_PATH = os.path.join(os.path.dirname(__file__), "..", "sms_outbox.json")

# How many chars is "short enough" to show directly on USSD
USSD_INLINE_MAX = 100


def _load() -> dict:
    try:
        with open(os.path.abspath(STORE_PATH), "r", encoding="utf-8") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {}


def _save(store: dict):
    with open(os.path.abspath(STORE_PATH), "w", encoding="utf-8") as f:
        json.dump(store, f, indent=2)


def generate_coupon() -> str:
    """6-char alphanumeric code — easy to type on a feature phone."""
    return "".join(random.choices(string.ascii_uppercase + string.digits, k=6))


def store_advice(phone_hash: str, advice: str) -> str:
    """
    Save advice against a coupon code.
    Returns the coupon code.
    """
    store = _load()
    code = generate_coupon()
    # Avoid collisions
    while code in store:
        code = generate_coupon()

    store[code] = {
        "phone_hash": phone_hash,
        "advice":     advice,
        "ts":         datetime.now().isoformat(),
        "retrieved":  False,
    }
    _save(store)
    return code


def retrieve_advice(code: str) -> str | None:
    """
    Look up advice by coupon code.
    Marks it retrieved but keeps it for audit.
    Returns advice string or None if not found.
    """
    store = _load()
    code  = code.strip().upper()
    entry = store.get(code)
    if not entry:
        return None
    entry["retrieved"] = True
    _save(store)
    return entry["advice"]


def is_short_enough_for_ussd(advice: str) -> bool:
    """True if advice fits inline on the USSD END screen."""
    return len(advice) <= USSD_INLINE_MAX