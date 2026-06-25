"""
Minimal NDPA-2023-flavoured consent handling for the hackathon MVP.

What this actually does:
  - Never stores a raw phone number — only a salted hash, so a DB leak
    doesn't directly expose PII (data minimisation, NDPA Art. 29 spirit).
  - Requires an explicit consent record before /api/advice on the web
    channel will respond with real content.

What this is NOT:
  - A legal compliance review. Treat this as "demonstrates the pattern
    judges are looking for," not "passes an audit."
  - Currently the USSD/SMS channels auto-grant consent on first use
    (see routes/ussd.py, routes/sms.py) because a feature-phone user
    can't tap an "I agree" checkbox — in a real deployment this should
    be an explicit IVR/SMS opt-in step, not implicit.
"""
import hashlib
import os

from extensions.neo4j_client import run_query


def hash_phone(phone_number: str) -> str:
    salt = os.getenv("PHONE_HASH_SALT", "agrion-dev-salt")
    return hashlib.sha256(f"{salt}:{phone_number}".encode()).hexdigest()[:16]


def has_consented(phone_hash: str) -> bool:
    rows = run_query(
        "MATCH (f:Farmer {phone_hash: $h}) RETURN f.consent AS consent",
        {"h": phone_hash},
    )
    if rows is None:
        # Neo4j unreachable right now (e.g. no credentials set yet) —
        # fail OPEN so the demo keeps working. Flag this in your README
        # as a known limitation; a real deployment should fail CLOSED.
        return True
    return bool(rows) and rows[0].get("consent") is True


def record_consent(phone_hash: str, granted: bool = True):
    run_query(
        "MERGE (f:Farmer {phone_hash: $h}) SET f.consent = $granted, f.consent_ts = datetime()",
        {"h": phone_hash, "granted": granted},
        write=True,
    )
