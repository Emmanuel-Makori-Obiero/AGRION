"""
Run once against your Neo4j AuraDB to seed the starter knowledge graph.

Usage:
    python scripts/seed_neo4j.py
"""
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv()

from neo4j import GraphDatabase

print("--- DEBUGGING ENV VARIABLES ---")
print("CURRENT WORK DIR:", os.getcwd())
print("NEO4J_URI:", os.environ.get("NEO4J_URI"))
print("NEO4J_USERNAME:", os.environ.get("NEO4J_USERNAME"))
print("NEO4J_PASSWORD_EXISTS:", os.environ.get("NEO4J_PASSWORD") is not None)
print("-------------------------------")

# Split into separate statements — Neo4j AuraDB does not support
# multiple MERGE chains in one run_query call reliably over the driver.
STATEMENTS = [
    # ── Crops ────────────────────────────────────────────────────────
    "MERGE (c:Crop {name:'maize'}) SET c.notes='Plant at onset of rains; intercrop with legumes. Space 75cm x 25cm.'",
    "MERGE (c:Crop {name:'cassava'}) SET c.notes='Drought tolerant; harvest 8-12 months after planting. Use certified cuttings.'",
    "MERGE (c:Crop {name:'tomato'}) SET c.notes='Stake plants early; water at base; watch for blight in humid weather.'",
    "MERGE (c:Crop {name:'rice'}) SET c.notes='Needs flooded fields; transplant at 21 days; watch for stem borers.'",
    "MERGE (c:Crop {name:'yam'}) SET c.notes='Plant on mounds for drainage; use 300-500g seed yams; rotate fields yearly.'",
    "MERGE (c:Crop {name:'sorghum'}) SET c.notes='Drought resistant; plant at 50cm x 20cm; harvest at 90-120 days.'",
    "MERGE (c:Crop {name:'cowpea'}) SET c.notes='Fix nitrogen; harvest pods at 60-90 days; intercrop with maize or sorghum.'",
    "MERGE (c:Crop {name:'cocoa'}) SET c.notes='Plant in shade; prune regularly; harvest pods when yellow or orange.'",
    "MERGE (c:Crop {name:'millet'}) SET c.notes='Very drought tolerant; thin to 15cm spacing; harvest at 75-90 days.'",
    "MERGE (c:Crop {name:'pepper'}) SET c.notes='Needs well-drained soil; stake tall varieties; water consistently.'",
    "MERGE (c:Crop {name:'groundnut'}) SET c.notes='Inoculate seed with rhizobium; harvest when leaves yellow at 90-120 days.'",

    # ── Pests ────────────────────────────────────────────────────────
    "MERGE (p:Pest {name:'fall armyworm'}) SET p.treatment='Apply neem extract or recommended pesticide early morning; check leaf whorls.'",
    "MERGE (p:Pest {name:'late blight'}) SET p.treatment='Remove affected leaves; apply copper-based fungicide; improve airflow.'",
    "MERGE (p:Pest {name:'stem borer'}) SET p.treatment='Apply granular insecticide into leaf whorl at tillering stage.'",
    "MERGE (p:Pest {name:'cassava mosaic virus'}) SET p.treatment='Remove and burn infected plants; plant only CMD-resistant varieties.'",
    "MERGE (p:Pest {name:'aphids'}) SET p.treatment='Spray neem oil or insecticidal soap; introduce ladybirds as natural predators.'",
    "MERGE (p:Pest {name:'black pod disease'}) SET p.treatment='Remove and destroy infected pods; apply copper fungicide every 3 weeks.'",
    "MERGE (p:Pest {name:'rosette virus'}) SET p.treatment='Control aphid vectors with insecticide; plant resistant groundnut varieties.'",

    # ── Regions ──────────────────────────────────────────────────────
    "MERGE (:Region {name:'North Central Nigeria'})",
    "MERGE (:Region {name:'South West Nigeria'})",
    "MERGE (:Region {name:'North East Nigeria'})",
    "MERGE (:Region {name:'South East Nigeria'})",
    "MERGE (:Region {name:'South South Nigeria'})",
    "MERGE (:Region {name:'North West Nigeria'})",

    # ── Crop → Pest relationships ─────────────────────────────────────
    "MATCH (c:Crop {name:'maize'}), (p:Pest {name:'fall armyworm'}) MERGE (c)-[:SUSCEPTIBLE_TO]->(p)",
    "MATCH (c:Crop {name:'maize'}), (p:Pest {name:'stem borer'}) MERGE (c)-[:SUSCEPTIBLE_TO]->(p)",
    "MATCH (c:Crop {name:'tomato'}), (p:Pest {name:'late blight'}) MERGE (c)-[:SUSCEPTIBLE_TO]->(p)",
    "MATCH (c:Crop {name:'tomato'}), (p:Pest {name:'aphids'}) MERGE (c)-[:SUSCEPTIBLE_TO]->(p)",
    "MATCH (c:Crop {name:'rice'}), (p:Pest {name:'stem borer'}) MERGE (c)-[:SUSCEPTIBLE_TO]->(p)",
    "MATCH (c:Crop {name:'cassava'}), (p:Pest {name:'cassava mosaic virus'}) MERGE (c)-[:SUSCEPTIBLE_TO]->(p)",
    "MATCH (c:Crop {name:'cocoa'}), (p:Pest {name:'black pod disease'}) MERGE (c)-[:SUSCEPTIBLE_TO]->(p)",
    "MATCH (c:Crop {name:'groundnut'}), (p:Pest {name:'rosette virus'}) MERGE (c)-[:SUSCEPTIBLE_TO]->(p)",
    "MATCH (c:Crop {name:'groundnut'}), (p:Pest {name:'aphids'}) MERGE (c)-[:SUSCEPTIBLE_TO]->(p)",
    "MATCH (c:Crop {name:'cowpea'}), (p:Pest {name:'aphids'}) MERGE (c)-[:SUSCEPTIBLE_TO]->(p)",
    "MATCH (c:Crop {name:'sorghum'}), (p:Pest {name:'fall armyworm'}) MERGE (c)-[:SUSCEPTIBLE_TO]->(p)",
    "MATCH (c:Crop {name:'millet'}), (p:Pest {name:'fall armyworm'}) MERGE (c)-[:SUSCEPTIBLE_TO]->(p)",

    # ── Crop → Region relationships ───────────────────────────────────
    "MATCH (c:Crop {name:'maize'}), (r:Region {name:'North Central Nigeria'}) MERGE (c)-[:GROWN_IN]->(r)",
    "MATCH (c:Crop {name:'maize'}), (r:Region {name:'North East Nigeria'}) MERGE (c)-[:GROWN_IN]->(r)",
    "MATCH (c:Crop {name:'maize'}), (r:Region {name:'South West Nigeria'}) MERGE (c)-[:GROWN_IN]->(r)",
    "MATCH (c:Crop {name:'yam'}), (r:Region {name:'North Central Nigeria'}) MERGE (c)-[:GROWN_IN]->(r)",
    "MATCH (c:Crop {name:'yam'}), (r:Region {name:'South East Nigeria'}) MERGE (c)-[:GROWN_IN]->(r)",
    "MATCH (c:Crop {name:'cassava'}), (r:Region {name:'South West Nigeria'}) MERGE (c)-[:GROWN_IN]->(r)",
    "MATCH (c:Crop {name:'cassava'}), (r:Region {name:'South South Nigeria'}) MERGE (c)-[:GROWN_IN]->(r)",
    "MATCH (c:Crop {name:'cassava'}), (r:Region {name:'South East Nigeria'}) MERGE (c)-[:GROWN_IN]->(r)",
    "MATCH (c:Crop {name:'rice'}), (r:Region {name:'North Central Nigeria'}) MERGE (c)-[:GROWN_IN]->(r)",
    "MATCH (c:Crop {name:'rice'}), (r:Region {name:'South South Nigeria'}) MERGE (c)-[:GROWN_IN]->(r)",
    "MATCH (c:Crop {name:'tomato'}), (r:Region {name:'North Central Nigeria'}) MERGE (c)-[:GROWN_IN]->(r)",
    "MATCH (c:Crop {name:'tomato'}), (r:Region {name:'South West Nigeria'}) MERGE (c)-[:GROWN_IN]->(r)",
    "MATCH (c:Crop {name:'sorghum'}), (r:Region {name:'North East Nigeria'}) MERGE (c)-[:GROWN_IN]->(r)",
    "MATCH (c:Crop {name:'sorghum'}), (r:Region {name:'North West Nigeria'}) MERGE (c)-[:GROWN_IN]->(r)",
    "MATCH (c:Crop {name:'millet'}), (r:Region {name:'North East Nigeria'}) MERGE (c)-[:GROWN_IN]->(r)",
    "MATCH (c:Crop {name:'millet'}), (r:Region {name:'North West Nigeria'}) MERGE (c)-[:GROWN_IN]->(r)",
    "MATCH (c:Crop {name:'cowpea'}), (r:Region {name:'North West Nigeria'}) MERGE (c)-[:GROWN_IN]->(r)",
    "MATCH (c:Crop {name:'cowpea'}), (r:Region {name:'North East Nigeria'}) MERGE (c)-[:GROWN_IN]->(r)",
    "MATCH (c:Crop {name:'cocoa'}), (r:Region {name:'South West Nigeria'}) MERGE (c)-[:GROWN_IN]->(r)",
    "MATCH (c:Crop {name:'cocoa'}), (r:Region {name:'South South Nigeria'}) MERGE (c)-[:GROWN_IN]->(r)",
    "MATCH (c:Crop {name:'groundnut'}), (r:Region {name:'North West Nigeria'}) MERGE (c)-[:GROWN_IN]->(r)",
    "MATCH (c:Crop {name:'groundnut'}), (r:Region {name:'North East Nigeria'}) MERGE (c)-[:GROWN_IN]->(r)",
    "MATCH (c:Crop {name:'pepper'}), (r:Region {name:'North Central Nigeria'}) MERGE (c)-[:GROWN_IN]->(r)",
    "MATCH (c:Crop {name:'pepper'}), (r:Region {name:'South West Nigeria'}) MERGE (c)-[:GROWN_IN]->(r)",
]


def seed(uri: str, user: str, password: str):
    driver = GraphDatabase.driver(uri, auth=(user, password))
    driver.verify_connectivity()
    print("[neo4j] Connected. Running seed statements...")

    ok = 0
    fail = 0
    with driver.session() as session:
        for stmt in STATEMENTS:
            try:
                session.execute_write(lambda tx, s=stmt: tx.run(s).consume())
                ok += 1
            except Exception as e:
                print(f"  FAILED: {stmt[:60]}... → {e}")
                fail += 1

    driver.close()
    print(f"\n✓ Seed complete — {ok} statements OK, {fail} failed.")
    if ok > 0:
        print("  Crops : maize, cassava, tomato, rice, yam, sorghum, cowpea, cocoa, millet, pepper, groundnut")
        print("  Pests : fall armyworm, late blight, stem borer, cassava mosaic virus, aphids, black pod, rosette virus")
        print("  Regions: all 6 Nigerian geopolitical zones")


if __name__ == "__main__":
    uri      = os.getenv("NEO4J_URI")
    user     = os.getenv("NEO4J_USERNAME")
    password = os.getenv("NEO4J_PASSWORD")

    if not all([uri, user, password]):
        print("ERROR: NEO4J_URI / NEO4J_USERNAME / NEO4J_PASSWORD not set in .env")
        sys.exit(1)

    seed(uri, user, password)