// Database constraints and indexes for AgriConnect Nigeria.
// Run once against a fresh Neo4j instance:
//   cat config/neo4j_constraints.cypher | cypher-shell -u neo4j -p <password>

// ── Uniqueness constraints (also create backing indexes) ────────────
CREATE CONSTRAINT crop_name IF NOT EXISTS
FOR (c:Crop) REQUIRE c.name IS UNIQUE;

CREATE CONSTRAINT region_name IF NOT EXISTS
FOR (r:Region) REQUIRE r.name IS UNIQUE;

CREATE CONSTRAINT practice_id IF NOT EXISTS
FOR (p:Practice) REQUIRE p.id IS UNIQUE;

CREATE CONSTRAINT pest_name IF NOT EXISTS
FOR (p:Pest) REQUIRE p.name IS UNIQUE;

CREATE CONSTRAINT forecast_id IF NOT EXISTS
FOR (f:Forecast) REQUIRE f.id IS UNIQUE;

// Vision-diagnosis observations (written back from the MMS pipeline).
CREATE CONSTRAINT disease_name IF NOT EXISTS
FOR (d:Disease) REQUIRE d.name IS UNIQUE;

CREATE CONSTRAINT weed_name IF NOT EXISTS
FOR (w:Weed) REQUIRE w.name IS UNIQUE;

CREATE CONSTRAINT farmer_phone IF NOT EXISTS
FOR (f:Farmer) REQUIRE f.phone IS UNIQUE;

CREATE CONSTRAINT observation_id IF NOT EXISTS
FOR (o:Observation) REQUIRE o.id IS UNIQUE;

// ── Lookup indexes ──────────────────────────────────────────────────
CREATE INDEX crop_season IF NOT EXISTS
FOR (c:Crop) ON (c.season);

CREATE INDEX forecast_region IF NOT EXISTS
FOR (f:Forecast) ON (f.region);
