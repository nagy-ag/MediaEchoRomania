CREATE SCHEMA IF NOT EXISTS `{{ project_id }}.gdelt_derived`;

CREATE TABLE IF NOT EXISTS `{{ project_id }}.gdelt_derived.event_clusters` (
  cluster_id STRING,
  event_id STRING,
  cluster_label STRING,
  salience_score FLOAT64,
  created_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `{{ project_id }}.gdelt_derived.coverage_episodes` (
  episode_id STRING,
  cluster_id STRING,
  outlet_id STRING,
  first_mention_at TIMESTAMP,
  last_mention_at TIMESTAMP,
  lag_minutes INT64,
  speed_score FLOAT64,
  stability_score FLOAT64
)
PARTITION BY DATE(first_mention_at)
CLUSTER BY cluster_id, outlet_id;