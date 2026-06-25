"""
Single shared Neo4j AuraDB driver.

run_query() NEVER raises to the caller — returns None if DB is unreachable.
This keeps the USSD/SMS handlers alive even without Neo4j credentials set
(graceful degradation: LLM still answers, just without graph context).
"""
import os
from neo4j import GraphDatabase

_driver = None


def get_driver():
    global _driver
    if _driver is not None:
        return _driver

    uri = os.getenv("NEO4J_URI")
    user = os.getenv("NEO4J_USERNAME")
    password = os.getenv("NEO4J_PASSWORD")

    if not all([uri, user, password]):
        print("[neo4j] Missing credentials — running without graph context.")
        return None

    try:
        driver = GraphDatabase.driver(uri, auth=(user, password))
        driver.verify_connectivity()
        _driver = driver
        print("[neo4j] Connected.")
    except Exception as e:
        print(f"[neo4j] Connection failed: {e}")
        _driver = None

    return _driver


def run_query(query: str, params: dict | None = None, write: bool = False):
    """Returns list of dict rows, or None if DB unreachable."""
    driver = get_driver()
    if driver is None:
        return None

    params = params or {}
    try:
        with driver.session() as session:
            if write:
                # FIX: use keyword unpacking correctly — params is passed as a dict
                result = session.execute_write(lambda tx: list(tx.run(query, parameters_=params)))
            else:
                result = session.execute_read(lambda tx: list(tx.run(query, parameters_=params)))
        return [dict(r) for r in result]
    except Exception as e:
        print(f"[neo4j] Query failed: {e}")
        return None


def close_driver():
    """Call on app shutdown to release connections."""
    global _driver
    if _driver:
        _driver.close()
        _driver = None
