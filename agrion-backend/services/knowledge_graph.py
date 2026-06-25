"""
Read/write helpers over the agronomic knowledge graph.

Schema (seeded by scripts/seed_neo4j.py):
  (:Crop {name, notes})-[:SUSCEPTIBLE_TO]->(:Pest {name, treatment})
  (:Crop)-[:GROWN_IN]->(:Region {name})
  (:Farmer {phone_hash, consent, consent_ts})-[:ASKED]->(:Query {text, crop, channel, ts})
"""
from extensions.neo4j_client import run_query


def get_crop_context(crop: str | None, region: str | None = None) -> dict | None:
    """Fetch agronomic context for a crop (+ optional region).
    Returns None if crop isn't found or DB is unreachable."""
    if not crop:
        return None

    # FIX: query was matching on c.name = $crop but seeds store lowercase names.
    # Use toLower() to make this case-insensitive.
    query = """
    MATCH (c:Crop)
    WHERE toLower(c.name) = toLower($crop)
    OPTIONAL MATCH (c)-[:SUSCEPTIBLE_TO]->(p:Pest)
    OPTIONAL MATCH (c)-[:GROWN_IN]->(r:Region)
    WHERE $region IS NULL OR r.name = $region
    RETURN c.name AS crop, c.notes AS notes,
           collect(DISTINCT p.name) AS pests,
           collect(DISTINCT r.name) AS regions
    LIMIT 1
    """
    rows = run_query(query, {"crop": crop, "region": region})
    if not rows:
        return None
    return rows[0]


def log_farmer_query(phone_hash: str, crop: str, question: str, channel: str):
    """Write an interaction node. Raw phone number is NEVER stored — only hash."""
    query = """
    MERGE (f:Farmer {phone_hash: $phone_hash})
    CREATE (q:Query {text: $question, crop: $crop, channel: $channel, ts: datetime()})
    MERGE (f)-[:ASKED]->(q)
    """
    run_query(
        query,
        {"phone_hash": phone_hash, "crop": crop, "question": question, "channel": channel},
        write=True,
    )


def get_farmer_history(phone_hash: str, limit: int = 5) -> list[dict]:
    """Return recent queries for a farmer — useful for personalised advice."""
    query = """
    MATCH (f:Farmer {phone_hash: $phone_hash})-[:ASKED]->(q:Query)
    RETURN q.crop AS crop, q.text AS question, q.channel AS channel, q.ts AS ts
    ORDER BY q.ts DESC
    LIMIT $limit
    """
    rows = run_query(query, {"phone_hash": phone_hash, "limit": limit})
    return rows or []
