WITH freshness AS (
  SELECT MAX(generated_at) AS last_generated_at
  FROM `{{ project_id }}.gdelt_derived.event_clusters`
)
SELECT
  CURRENT_TIMESTAMP() AS generated_at,
  CONCAT(CAST(TIMESTAMP_DIFF(CURRENT_TIMESTAMP(), freshness.last_generated_at, MINUTE) AS STRING), ' minutes') AS data_freshness,
  'current' AS granularity,
  'Morning brief candidates prioritize salience, divergence, and ghosting from the current event cluster rollup.' AS confidence_notes,
  clusters.cluster_id,
  clusters.cluster_label AS headline,
  clusters.salience_score,
  clusters.divergence_score,
  clusters.ghosting_score,
  TO_JSON_STRING(STRUCT(clusters.primary_entities, clusters.top_outlets, clusters.key_themes)) AS evidence_json
FROM `{{ project_id }}.gdelt_derived.event_clusters` clusters
CROSS JOIN freshness
ORDER BY clusters.salience_score DESC, clusters.divergence_score DESC
LIMIT 50;
