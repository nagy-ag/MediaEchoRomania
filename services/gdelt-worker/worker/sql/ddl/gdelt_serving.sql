CREATE SCHEMA IF NOT EXISTS `{{ project_id }}.gdelt_serving`;

CREATE TABLE IF NOT EXISTS `{{ project_id }}.gdelt_serving.overview_current` (
  generated_at TIMESTAMP,
  data_freshness STRING,
  granularity STRING,
  confidence_notes STRING,
  new_events INT64,
  mention_volume INT64,
  active_outlets INT64,
  avg_speed FLOAT64,
  avg_stability FLOAT64,
  ghosted_major_events INT64
);

CREATE TABLE IF NOT EXISTS `{{ project_id }}.gdelt_serving.top_events_current` (
  generated_at TIMESTAMP,
  data_freshness STRING,
  granularity STRING,
  confidence_notes STRING,
  cluster_id STRING,
  cluster_label STRING,
  salience_score FLOAT64,
  active_outlets INT64,
  speed_score FLOAT64,
  stability_score FLOAT64
);

CREATE TABLE IF NOT EXISTS `{{ project_id }}.gdelt_serving.top_entities_current` (
  generated_at TIMESTAMP,
  data_freshness STRING,
  granularity STRING,
  confidence_notes STRING,
  entity_label STRING,
  mention_count INT64,
  avg_tone FLOAT64
);

CREATE TABLE IF NOT EXISTS `{{ project_id }}.gdelt_serving.morning_brief_candidates` (
  generated_at TIMESTAMP,
  data_freshness STRING,
  granularity STRING,
  confidence_notes STRING,
  cluster_id STRING,
  headline STRING,
  salience_score FLOAT64,
  divergence_score FLOAT64,
  ghosting_score FLOAT64,
  evidence_json STRING
);

CREATE TABLE IF NOT EXISTS `{{ project_id }}.gdelt_serving.outlet_compare_cache` (
  generated_at TIMESTAMP,
  data_freshness STRING,
  granularity STRING,
  confidence_notes STRING,
  outlet_id STRING,
  avg_speed FLOAT64,
  avg_stability FLOAT64,
  avg_ghosting FLOAT64,
  avg_divergence FLOAT64
);

CREATE TABLE IF NOT EXISTS `{{ project_id }}.gdelt_serving.outlet_detail_cache` (
  generated_at TIMESTAMP,
  data_freshness STRING,
  granularity STRING,
  confidence_notes STRING,
  outlet_id STRING,
  event_count_30d INT64,
  avg_speed FLOAT64,
  avg_stability FLOAT64,
  avg_ghosting FLOAT64,
  avg_divergence FLOAT64
);

CREATE TABLE IF NOT EXISTS `{{ project_id }}.gdelt_serving.entity_trend_cache` (
  generated_at TIMESTAMP,
  data_freshness STRING,
  granularity STRING,
  confidence_notes STRING,
  entity_label STRING,
  metric_month DATE,
  mention_count INT64,
  avg_tone FLOAT64
);

CREATE TABLE IF NOT EXISTS `{{ project_id }}.gdelt_serving.status_summary` (
  generated_at TIMESTAMP,
  data_freshness STRING,
  granularity STRING,
  confidence_notes STRING,
  latest_successful_sync TIMESTAMP,
  healthy_jobs INT64,
  unhealthy_jobs INT64,
  freshest_watermark TIMESTAMP
);
