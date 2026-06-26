"""
Verify the Neo4j seed — run after seed_neo4j.py
Usage: python scripts/verify_neo4j.py
"""
import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv()

from neo4j import GraphDatabase

uri      = os.getenv("NEO4J_URI")
user     = os.getenv("NEO4J_USERNAME")
password = os.getenv("NEO4J_PASSWORD")

driver = GraphDatabase.driver(uri, auth=(user, password))
driver.verify_connectivity()
print("[neo4j] Connected.\n")

checks = [
    ("Total Crop nodes",    "MATCH (c:Crop) RETURN count(c) AS n"),
    ("Total Pest nodes",    "MATCH (p:Pest) RETURN count(p) AS n"),
    ("Total Region nodes",  "MATCH (r:Region) RETURN count(r) AS n"),
    ("SUSCEPTIBLE_TO rels", "MATCH ()-[r:SUSCEPTIBLE_TO]->() RETURN count(r) AS n"),
    ("GROWN_IN rels",       "MATCH ()-[r:GROWN_IN]->() RETURN count(r) AS n"),
]

all_ok = True
with driver.session() as session:
    for label, query in checks:
        result = session.run(query).single()
        n = result["n"] if result else 0
        status = "✓" if n > 0 else "✗ EMPTY"
        if n == 0:
            all_ok = False
        print(f"  {status}  {label}: {n}")

    print("\n── Crop list ──────────────────────────────")
    for row in session.run("MATCH (c:Crop) RETURN c.name AS name ORDER BY name"):
        print(f"  • {row['name']}")

    print("\n── Pest list ──────────────────────────────")
    for row in session.run("MATCH (p:Pest) RETURN p.name AS name ORDER BY name"):
        print(f"  • {row['name']}")

    print("\n── Region list ────────────────────────────")
    for row in session.run("MATCH (r:Region) RETURN r.name AS name ORDER BY name"):
        print(f"  • {row['name']}")

    print("\n── Sample relationships ────────────────────")
    q = """
    MATCH (c:Crop)-[:SUSCEPTIBLE_TO]->(p:Pest)
    RETURN c.name AS crop, p.name AS pest
    ORDER BY crop LIMIT 8
    """
    for row in session.run(q):
        print(f"  {row['crop']} → {row['pest']}")

    print("\n── Maize full context (what the app sees) ──")
    q = """
    MATCH (c:Crop {name:'maize'})
    OPTIONAL MATCH (c)-[:SUSCEPTIBLE_TO]->(p:Pest)
    OPTIONAL MATCH (c)-[:GROWN_IN]->(r:Region)
    RETURN c.name AS crop, c.notes AS notes,
           collect(DISTINCT p.name) AS pests,
           collect(DISTINCT r.name) AS regions
    """
    row = session.run(q).single()
    if row:
        print(f"  crop   : {row['crop']}")
        print(f"  notes  : {row['notes']}")
        print(f"  pests  : {row['pests']}")
        print(f"  regions: {row['regions']}")

driver.close()
print("\n✓ All good — DB is seeded and live." if all_ok else "\n✗ Some nodes missing — re-run seed_neo4j.py")