SELECT
  cluster_id,
  cluster_label,
  salience_score,
  active_outlets,
  speed_score,
  stability_score
FROM `{{ project_id }}.gdelt_derived.event_clusters`
ORDER BY salience_score DESC
LIMIT 100;