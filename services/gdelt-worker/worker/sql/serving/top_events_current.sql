WITH freshness AS (
  SELECT MAX(generated_at) AS last_generated_at
  FROM `{{ project_id }}.gdelt_derived.event_clusters`
)
SELECT
  CURRENT_TIMESTAMP() AS generated_at,
  CONCAT(CAST(TIMESTAMP_DIFF(CURRENT_TIMESTAMP(), freshness.last_generated_at, MINUTE) AS STRING), ' minutes') AS data_freshness,
  'current' AS granularity,
  'Top active event clusters ranked from precomputed salience, speed, and outlet participation.' AS confidence_notes,
  clusters.cluster_id,
  clusters.cluster_label,
  clusters.salience_score,
  clusters.active_outlets,
  clusters.speed_score,
  clusters.stability_score
FROM `{{ project_id }}.gdelt_derived.event_clusters` clusters
CROSS JOIN freshness
ORDER BY clusters.salience_score DESC, clusters.active_outlets DESC
LIMIT 100;
