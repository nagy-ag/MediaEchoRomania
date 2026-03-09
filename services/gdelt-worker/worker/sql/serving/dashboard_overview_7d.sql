SELECT
  CURRENT_TIMESTAMP() AS snapshot_at,
  COUNT(DISTINCT cluster_id) AS new_events,
  COUNT(*) AS mention_volume,
  COUNT(DISTINCT outlet_id) AS active_outlets,
  AVG(speed_score) AS avg_speed,
  AVG(stability_score) AS avg_stability,
  COUNTIF(ghosting_flag) AS ghosted_major_events
FROM `{{ project_id }}.gdelt_derived.coverage_episodes`;