"""
services/sms_store.py

In-memory + file-backed store for SMS advice coupons.
Farmer types their coupon code via SMS to retrieve full advice.
Now heavily upgraded to support Dual-Write: Legacy JSON + Persistent Neo4j Graph.
"""
import json
import os
import random
import string
import logging
from datetime import datetime
from neo4j import GraphDatabase  # Added for Neo4j Persistent Storage

# File-backed so coupons survive restarts locally
STORE_PATH = os.path.join(os.path.dirname(__file__), "..", "sms_outbox.json")

# How many chars is "short enough" to show directly on USSD
USSD_INLINE_MAX = 100


# ─── LEGACY JSON FILE SYSTEM (Kept intact for backward compatibility) ───

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
    Save advice against a coupon code using the legacy JSON method.
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
    Look up advice by coupon code from JSON.
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


# ─── NEW NEO4J GRAPH SYSTEM (For Persistent Render Deployments) ───

def get_neo4j_driver():
    """Establishes an on-demand connection to your Neo4j instance using env vars."""
    uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
    username = os.getenv("NEO4J_USERNAME", "neo4j")
    password = os.getenv("NEO4J_PASSWORD")
    return GraphDatabase.driver(uri, auth=(username, password))


def save_sms_token(token: str, advice: str, phone_number: str):
    """
    Saves a newly generated advice token directly into Neo4j.
    This guarantees the token survives Render's ephemeral filesystem wipes.
    """
    clean_token = token.strip().upper()
    logging.info(f"💾 [GRAPH WRITE] Attempting to commit token '{clean_token}' to Neo4j...")
    
    try:
        driver = get_neo4j_driver()
        
        # Cypher query to insert the token node safely
        query = """
        MERGE (t:SMSOutbox {token: $token})
        SET t.advice = $advice,
            t.phone = $phone,
            t.retrieved = false,
            t.createdAt = datetime()
        RETURN t
        """
        
        with driver.session() as session:
            result = session.run(query, token=clean_token, advice=advice, phone=phone_number)
            record = result.single()
            if record:
                logging.info(f"   ✅ SUCCESS: Token '{clean_token}' is now persistent inside Neo4j graph nodes.")
            else:
                logging.warning(f"   ⚠️ WRITE WARNING: Query executed but node registration was unconfirmed.")
                
        driver.close()
    except Exception as e:
        logging.error(f"   ❌ [CRITICAL GRAPH WRITE ERROR] Failed saving token to Neo4j: {e}")