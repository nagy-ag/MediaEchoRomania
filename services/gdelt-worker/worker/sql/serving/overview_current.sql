WITH recent_clusters AS (
  SELECT *
  FROM `{{ project_id }}.gdelt_derived.event_clusters`
  WHERE first_seen_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
),
recent_mentions AS (
  SELECT *
  FROM `{{ project_id }}.gdelt_norm.mentions_ro`
  WHERE mention_time >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
),
recent_coverage AS (
  SELECT *
  FROM `{{ project_id }}.gdelt_derived.coverage_episodes`
  WHERE first_mention_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
)
SELECT
  CURRENT_TIMESTAMP() AS generated_at,
  CONCAT(CAST(TIMESTAMP_DIFF(CURRENT_TIMESTAMP(), (SELECT MAX(generated_at) FROM `{{ project_id }}.gdelt_derived.event_clusters`), MINUTE) AS STRING), ' minutes') AS data_freshness,
  '7d' AS granularity,
  'Recent Romania-only overview, aggregated from precomputed event clusters and coverage episodes.' AS confidence_notes,
  (SELECT COUNT(*) FROM recent_clusters) AS new_events,
  (SELECT COUNT(*) FROM recent_mentions) AS mention_volume,
  (SELECT COUNT(DISTINCT outlet_id) FROM recent_coverage) AS active_outlets,
  (SELECT AVG(speed_score) FROM recent_coverage) AS avg_speed,
  (SELECT AVG(stability_score) FROM recent_coverage) AS avg_stability,
  (SELECT COUNT(*) FROM recent_clusters WHERE ghosting_score >= 60) AS ghosted_major_events;
