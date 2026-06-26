"""Neo4j client and deterministic Cypher queries.

Queries are intentionally parameterised and read-only so responses are
predictable and safe to serve over USSD/IVR.
"""

from __future__ import annotations

from uuid import uuid4

from neo4j import GraphDatabase

from config.settings import get_settings

# Vision subject types mapped to the graph label used for the condition node.
# Whitelisted so the value can be safely interpolated into Cypher (labels
# cannot be parameterised). Anything else (e.g. "crop"/"unknown") stores no
# condition node.
_CONDITION_LABELS: dict[str, str] = {
    "pest": "Pest",
    "disease": "Disease",
    "weed": "Weed",
}


class GraphService:
    def __init__(self) -> None:
        settings = get_settings()
        self._driver = GraphDatabase.driver(
            settings.neo4j_uri,
            auth=(settings.neo4j_user, settings.neo4j_password),
        )
        self._database = settings.neo4j_database

    def close(self) -> None:
        self._driver.close()

    def verify_connectivity(self) -> None:
        self._driver.verify_connectivity()

    def get_practices(self, crop: str, topic: str | None = None) -> list[dict]:
        """Return advisory practices for a crop, optionally filtered by topic."""
        cypher = (
            "MATCH (c:Crop {name: $crop})-[:HAS_PRACTICE]->(p:Practice) "
            "WHERE $topic IS NULL OR p.topic = $topic "
            "RETURN p.topic AS topic, p.text AS text "
            "ORDER BY p.topic"
        )
        with self._driver.session(database=self._database) as session:
            result = session.run(cypher, crop=crop, topic=topic)
            return [record.data() for record in result]

    def get_forecast(self, region: str) -> dict | None:
        """Return the most recent forecast for a region."""
        cypher = (
            "MATCH (f:Forecast {region: $region}) "
            "RETURN f.period AS period, f.rainfall_mm AS rainfall_mm, "
            "f.outlook AS outlook "
            "ORDER BY f.period DESC LIMIT 1"
        )
        with self._driver.session(database=self._database) as session:
            record = session.run(cypher, region=region).single()
            return record.data() if record else None

    def get_observed_conditions(
        self, crop: str, region: str | None = None, limit: int = 5
    ) -> list[dict]:
        """Return pests/diseases/weeds farmers have reported on a crop.

        Counts are aggregated from individual ``Observation`` records (each
        carries the reporting farmer's region) so the result can be scoped:
        pass ``region`` to see only that region's reports, or ``None`` for the
        national picture. Ranked by frequency, most prevalent first.
        """
        cypher = (
            "MATCH (c:Crop {name: $crop})<-[:ON_CROP]-(o:Observation)"
            "-[:IDENTIFIES]->(x) "
            "WHERE $region IS NULL OR o.region = $region "
            "RETURN x.name AS condition, head(labels(x)) AS kind, "
            "count(o) AS reports "
            "ORDER BY reports DESC LIMIT $limit"
        )
        with self._driver.session(database=self._database) as session:
            result = session.run(cypher, crop=crop, region=region, limit=limit)
            return [record.data() for record in result]

    def upsert_farmer_region(self, phone: str, region: str) -> None:
        """Record a farmer's most recent known region on their Farmer node.

        Other channels (USSD/SMS/chat) detect region from the conversation;
        storing it here lets the region-less MMS pipeline tag its observations
        with the farmer's region too.
        """

        def _write(tx) -> None:
            tx.run(
                "MERGE (f:Farmer {phone: $phone}) SET f.region = $region",
                phone=phone,
                region=region,
            )

        with self._driver.session(database=self._database) as session:
            session.execute_write(_write)

    def save_diagnosis(
        self,
        *,
        phone: str,
        subject_type: str,
        crop: str | None,
        condition: str | None,
        severity: str | None,
        confidence: float,
        recommendation: str | None,
        region: str | None = None,
        source: str = "mms",
    ) -> str:
        """Persist a vision diagnosis as an Observation and return its id.

        Builds: ``(Farmer)-[:REPORTED]->(Observation)``, plus ``ON_CROP`` and
        ``IDENTIFIES`` edges when known. Prevalence is not denormalised onto an
        aggregate edge; it is counted from these Observations at query time by
        :meth:`get_observed_conditions`.

        When ``region`` is omitted (the usual MMS case, which carries no
        location), the observation inherits the farmer's last known region so it
        still counts toward region-scoped queries.
        """
        obs_id = str(uuid4())
        condition_label = _CONDITION_LABELS.get(subject_type)
        with self._driver.session(database=self._database) as session:
            session.execute_write(
                self._write_diagnosis,
                obs_id=obs_id,
                phone=phone,
                subject_type=subject_type,
                crop=crop,
                condition=condition,
                condition_label=condition_label,
                severity=severity,
                confidence=confidence,
                recommendation=recommendation,
                region=region,
                source=source,
            )
        return obs_id

    @staticmethod
    def _write_diagnosis(
        tx,
        *,
        obs_id: str,
        phone: str,
        subject_type: str,
        crop: str | None,
        condition: str | None,
        condition_label: str | None,
        severity: str | None,
        confidence: float,
        recommendation: str | None,
        region: str | None,
        source: str,
    ) -> None:
        """Transaction body for :meth:`save_diagnosis`."""
        # An explicit region updates the farmer's known region; otherwise the
        # observation falls back to whatever region the farmer already had.
        tx.run(
            "MERGE (f:Farmer {phone: $phone}) "
            "SET f.region = coalesce($region, f.region) "
            "CREATE (o:Observation {id: $obs_id}) "
            "SET o.created_at = datetime(), o.source = $source, "
            "    o.subject_type = $subject_type, o.confidence = $confidence, "
            "    o.severity = $severity, o.recommendation = $recommendation, "
            "    o.condition = $condition, o.region = f.region "
            "MERGE (f)-[:REPORTED]->(o)",
            phone=phone,
            obs_id=obs_id,
            source=source,
            subject_type=subject_type,
            confidence=confidence,
            severity=severity,
            recommendation=recommendation,
            condition=condition,
            region=region,
        )

        if crop:
            tx.run(
                "MATCH (o:Observation {id: $obs_id}) "
                "MERGE (c:Crop {name: $crop}) "
                "MERGE (o)-[:ON_CROP]->(c)",
                obs_id=obs_id,
                crop=crop,
            )

        # Only link a condition node for a recognised, labelled subject type.
        # Prevalence is derived at query time by counting Observations (see
        # get_observed_conditions), so no aggregate edge is maintained here.
        if condition and condition_label:
            tx.run(
                "MATCH (o:Observation {id: $obs_id}) "
                f"MERGE (x:{condition_label} {{name: $condition}}) "
                "MERGE (o)-[:IDENTIFIES]->(x)",
                obs_id=obs_id,
                condition=condition,
            )


# Module-level singleton reused across requests.
graph_service = GraphService()
