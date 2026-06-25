"""
Run once against your Neo4j AuraDB to seed the starter knowledge graph.

Usage:
    python scripts/seed_neo4j.py
"""
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# 1. Load env first
from dotenv import load_dotenv
load_dotenv()

# 2. Import application logic second
import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from extensions.neo4j_client import run_query

print("--- DEBUGGING ENV VARIABLES ---")
print("CURRENT WORK DIR:", os.getcwd())
print("NEO4J_URI:", os.environ.get("NEO4J_URI"))
print("NEO4J_USERNAME:", os.environ.get("NEO4J_USERNAME"))
print("NEO4J_PASSWORD_EXISTS:", os.environ.get("NEO4J_PASSWORD") is not None)
print("-------------------------------")

SEED_CYPHER = """
MERGE (maize:Crop {name: 'maize'})
  SET maize.notes = 'Plant at onset of rains; intercrop with legumes to fix nitrogen. Space 75cm x 25cm.'
MERGE (cassava:Crop {name: 'cassava'})
  SET cassava.notes = 'Drought tolerant; harvest 8-12 months after planting. Use certified cuttings.'
MERGE (tomato:Crop {name: 'tomato'})
  SET tomato.notes = 'Stake plants early; water at base not leaves; watch for blight in humid weather.'
MERGE (rice:Crop {name: 'rice'})
  SET rice.notes = 'Needs flooded or well-irrigated fields; transplant at 21 days; watch for stem borers.'
MERGE (yam:Crop {name: 'yam'})
  SET yam.notes = 'Plant on mounds for drainage; use 300g-500g seed yams; rotate fields yearly.'

MERGE (faw:Pest {name: 'fall armyworm'})
  SET faw.treatment = 'Apply neem extract or recommended pesticide early morning.'
MERGE (blight:Pest {name: 'late blight'})
  SET blight.treatment = 'Remove affected leaves; apply copper-based fungicide; improve airflow.'
MERGE (stemborer:Pest {name: 'stem borer'})
  SET stemborer.treatment = 'Apply granular insecticide into leaf whorl at tillering stage.'
MERGE (mosaic:Pest {name: 'cassava mosaic virus'})
  SET mosaic.treatment = 'Remove and burn infected plants; plant only CMD-resistant varieties.'
MERGE (faw2:Pest {name: 'fall armyworm'})

MERGE (maize)-[:SUSCEPTIBLE_TO]->(faw)
MERGE (tomato)-[:SUSCEPTIBLE_TO]->(blight)
MERGE (rice)-[:SUSCEPTIBLE_TO]->(stemborer)
MERGE (cassava)-[:SUSCEPTIBLE_TO]->(mosaic)

MERGE (north:Region {name: 'North Central Nigeria'})
MERGE (south:Region {name: 'South West Nigeria'})
MERGE (northeast:Region {name: 'North East Nigeria'})

MERGE (maize)-[:GROWN_IN]->(north)
MERGE (maize)-[:GROWN_IN]->(northeast)
MERGE (yam)-[:GROWN_IN]->(north)
MERGE (cassava)-[:GROWN_IN]->(south)
MERGE (rice)-[:GROWN_IN]->(north)
MERGE (tomato)-[:GROWN_IN]->(north)
MERGE (tomato)-[:GROWN_IN]->(south)
"""

if __name__ == "__main__":
    result = run_query(SEED_CYPHER, write=True)
    if result is None:
        print("ERROR: Could not connect to Neo4j.")
        print("Check NEO4J_URI / NEO4J_USERNAME / NEO4J_PASSWORD in your .env file.")
        sys.exit(1)
    else:
        print("✓ Seed graph written to Neo4j successfully.")
        print("  Crops: Maize, Cassava, Tomato, Rice, Yam")
        print("  Pests: FAW, Late Blight, Stem Borer, Cassava Mosaic Virus")
        print("  Regions: North Central, South West, North East Nigeria")
