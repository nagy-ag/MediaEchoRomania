CREATE SCHEMA IF NOT EXISTS `{{ project_id }}.gdelt_serving`;

CREATE TABLE IF NOT EXISTS `{{ project_id }}.gdelt_serving.dashboard_overview_7d` (
  snapshot_at TIMESTAMP,
  new_events INT64,
  mention_volume INT64,
  active_outlets INT64,
  avg_speed FLOAT64,
  avg_stability FLOAT64,
  ghosted_major_events INT64
);

CREATE TABLE IF NOT EXISTS `{{ project_id }}.gdelt_serving.morning_brief_candidates` (
  snapshot_at TIMESTAMP,
  cluster_id STRING,
  headline STRING,
  salience_score FLOAT64,
  divergence_score FLOAT64,
  ghosting_score FLOAT64,
  evidence_json STRING
);