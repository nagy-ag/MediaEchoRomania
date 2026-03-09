SELECT
  CURRENT_TIMESTAMP() AS snapshot_at,
  cluster_id,
  cluster_label AS headline,
  salience_score,
  divergence_score,
  ghosting_score,
  TO_JSON_STRING(STRUCT(primary_entities, top_outlets, key_themes)) AS evidence_json
FROM `{{ project_id }}.gdelt_derived.event_clusters`
ORDER BY salience_score DESC
LIMIT 50;