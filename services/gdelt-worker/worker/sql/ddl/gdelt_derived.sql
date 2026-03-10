CREATE SCHEMA IF NOT EXISTS `{{ project_id }}.gdelt_derived`;

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

CREATE TABLE IF NOT EXISTS `{{ project_id }}.gdelt_derived.event_clusters` (
  cluster_id STRING,
  global_event_id INT64,
  cluster_label STRING,
  first_seen_at TIMESTAMP,
  last_seen_at TIMESTAMP,
  salience_score FLOAT64,
  active_outlets INT64,
  speed_score FLOAT64,
  stability_score FLOAT64,
  divergence_score FLOAT64,
  ghosting_score FLOAT64,
  primary_entities ARRAY<STRING>,
  top_outlets ARRAY<STRING>,
  key_themes ARRAY<STRING>,
  generated_at TIMESTAMP,
  confidence_notes STRING
)
CLUSTER BY cluster_id;

CREATE TABLE IF NOT EXISTS `{{ project_id }}.gdelt_derived.outlet_metrics_daily` (
  metric_date DATE,
  outlet_id STRING,
  event_count INT64,
  avg_speed FLOAT64,
  avg_stability FLOAT64,
  avg_ghosting FLOAT64,
  avg_divergence FLOAT64
)
PARTITION BY metric_date
CLUSTER BY outlet_id;

CREATE TABLE IF NOT EXISTS `{{ project_id }}.gdelt_derived.outlet_metrics_monthly` (
  metric_month DATE,
  outlet_id STRING,
  event_count INT64,
  avg_speed FLOAT64,
  avg_stability FLOAT64,
  avg_ghosting FLOAT64,
  avg_divergence FLOAT64
)
CLUSTER BY outlet_id;

CREATE TABLE IF NOT EXISTS `{{ project_id }}.gdelt_derived.entity_metrics_daily` (
  metric_date DATE,
  entity_label STRING,
  mention_count INT64,
  avg_tone FLOAT64
)
PARTITION BY metric_date
CLUSTER BY entity_label;

CREATE TABLE IF NOT EXISTS `{{ project_id }}.gdelt_derived.entity_metrics_monthly` (
  metric_month DATE,
  entity_label STRING,
  mention_count INT64,
  avg_tone FLOAT64
)
CLUSTER BY entity_label;

CREATE TABLE IF NOT EXISTS `{{ project_id }}.gdelt_derived.theme_metrics_monthly` (
  metric_month DATE,
  theme_label STRING,
  mention_count INT64,
  avg_tone FLOAT64
)
CLUSTER BY theme_label;

CREATE TABLE IF NOT EXISTS `{{ project_id }}.gdelt_derived.propagation_edges` (
  edge_id STRING,
  cluster_id STRING,
  source_outlet_id STRING,
  target_outlet_id STRING,
  lag_minutes INT64,
  generated_at TIMESTAMP
)
CLUSTER BY cluster_id;

CREATE TABLE IF NOT EXISTS `{{ project_id }}.gdelt_derived.ghosting_flags` (
  ghosting_flag_id STRING,
  cluster_id STRING,
  outlet_id STRING,
  ghosting_score FLOAT64,
  generated_at TIMESTAMP
)
CLUSTER BY cluster_id, outlet_id;

CREATE TABLE IF NOT EXISTS `{{ project_id }}.gdelt_derived.divergence_flags` (
  divergence_flag_id STRING,
  cluster_id STRING,
  divergence_score FLOAT64,
  generated_at TIMESTAMP
)
CLUSTER BY cluster_id;

CREATE TABLE IF NOT EXISTS `{{ project_id }}.gdelt_derived.local_vs_national_monthly` (
  metric_month DATE,
  outlet_scope STRING,
  event_count INT64,
  avg_speed FLOAT64,
  avg_stability FLOAT64,
  avg_ghosting FLOAT64
)
CLUSTER BY outlet_scope;

CREATE TABLE IF NOT EXISTS `{{ project_id }}.gdelt_derived.seasonality_rollups` (
  month_of_year INT64,
  theme_label STRING,
  avg_mentions FLOAT64,
  avg_tone FLOAT64
)
CLUSTER BY month_of_year, theme_label;
