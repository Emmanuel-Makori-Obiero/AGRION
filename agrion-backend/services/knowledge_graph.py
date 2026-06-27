"""
Read/write helpers over the agronomic knowledge graph & AI engine.

Schema:
  (:Crop {name, notes})-[:SUSCEPTIBLE_TO]->(:Pest {name, treatment})
  (:Crop)-[:GROWN_IN]->(:Region {name})
  (:Farmer {phone_hash, consent, consent_ts})-[:ASKED]->(:Query {text, crop, channel, ts})
"""
from extensions.neo4j_client import run_query


def check_farmer_consent(phone_hash: str) -> bool:
    rows = run_query(
        "MATCH (f:Farmer {phone_hash: $phone_hash}) RETURN f.consent AS consent",
        {"phone_hash": phone_hash},
    )
    if rows and rows[0].get("consent"):
        return True
    return False


def get_crop_context(crop: str | None, region: str | None = None) -> dict | None:
    if not crop:
        return None

    # FIX: region filter moved into a WITH clause so $region is always
    # a valid bound parameter regardless of whether it is None.
    query = """
    MATCH (c:Crop)
    WHERE toLower(c.name) = toLower($crop)
    OPTIONAL MATCH (c)-[:SUSCEPTIBLE_TO]->(p:Pest)
    OPTIONAL MATCH (c)-[:GROWN_IN]->(r:Region)
    WITH c, p, r
    WHERE $region IS NULL OR toLower(r.name) = toLower($region)
    RETURN c.name AS crop, c.notes AS notes,
           collect(DISTINCT p.name) AS pests,
           collect(DISTINCT r.name) AS regions
    LIMIT 1
    """
    params = {
        "crop":   crop,
        "region": region,   # None is a valid Cypher null — no string coercion needed
    }
    rows = run_query(query, params)
    if not rows:
        return None
    return rows[0]


def log_farmer_query(phone_hash: str, crop: str | None, question: str, channel: str):
    """Write an interaction node. Raw phone number is NEVER stored — only hash."""
    query = """
    MERGE (f:Farmer {phone_hash: $phone_hash})
    CREATE (q:Query {text: $question, crop: $crop, channel: $channel, ts: datetime()})
    MERGE (f)-[:ASKED]->(q)
    """
    params = {
        "phone_hash": phone_hash,
        "crop":       crop if crop else "Unknown",
        "question":   question,
        "channel":    channel,
    }
    run_query(query, params, write=True)


def get_farmer_history(phone_hash: str, limit: int = 5) -> list[dict]:
    query = """
    MATCH (f:Farmer {phone_hash: $phone_hash})-[:ASKED]->(q:Query)
    RETURN q.crop AS crop, q.text AS question, q.channel AS channel, q.ts AS ts
    ORDER BY q.ts DESC
    LIMIT $limit
    """
    rows = run_query(query, {"phone_hash": phone_hash, "limit": limit})
    return rows or []

def get_all_regions() -> list[str]:
    rows = run_query(
        "MATCH (r:Region) RETURN toLower(r.name) AS name",
        {},
    )
    return [row["name"] for row in rows] if rows else []
    
def process_query_via_ai(phone_hash, question, crop=None, region=None, channel="SMS"):
    from services.ai_engine import get_advice
    
    SMS_MAX = 150
    # Define phrases that indicate a system failure
    FALLBACK_PHRASES = ["Agrion AI is busy", "update you shortly", "try again"]

    if not check_farmer_consent(phone_hash):
        return "Reply YES to consent before receiving advice."[:SMS_MAX]

    db_context = get_crop_context(crop, region)
    advice = get_advice(question, db_context, channel="sms")

    # Guard: If AI returns a failure/fallback, DO NOT save to DB
    if not advice or any(phrase in advice for phrase in FALLBACK_PHRASES):
        return "System temporarily busy. Please try again in 5 minutes."

    # If advice is good, proceed with logging
    log_farmer_query(phone_hash, crop, question, channel)
    
    if len(advice) > SMS_MAX:
        advice = advice[:SMS_MAX].rstrip() + "..."
        
    return advice