CREATE SCHEMA IF NOT EXISTS `{{ project_id }}.{{ dataset_stage }}`;

CREATE TABLE IF NOT EXISTS `{{ project_id }}.{{ dataset_stage }}.stage_mentions` (
  source_file STRING,
  source_checksum STRING,
  manifest_url STRING,
  published_at TIMESTAMP,
  staged_at TIMESTAMP,
  global_event_id INT64,
  mention_time TIMESTAMP,
  mention_type STRING,
  source_name STRING,
  source_identifier STRING,
  source_domain STRING,
  confidence INT64,
  mention_doc_tone FLOAT64
)
PARTITION BY DATE(published_at)
CLUSTER BY source_domain, global_event_id;

CREATE TABLE IF NOT EXISTS `{{ project_id }}.{{ dataset_stage }}.stage_gkg` (
  source_file STRING,
  source_checksum STRING,
  manifest_url STRING,
  published_at TIMESTAMP,
  staged_at TIMESTAMP,
  gkg_record_id STRING,
  date TIMESTAMP,
  source_common_name STRING,
  document_identifier STRING,
  source_domain STRING,
  themes STRING,
  persons STRING,
  organizations STRING,
  gcam STRING,
  v2tone STRING
)
PARTITION BY DATE(published_at)
CLUSTER BY source_domain, gkg_record_id;

CREATE TABLE IF NOT EXISTS `{{ project_id }}.{{ dataset_stage }}.stage_events` (
  source_file STRING,
  source_checksum STRING,
  manifest_url STRING,
  published_at TIMESTAMP,
  staged_at TIMESTAMP,
  global_event_id INT64,
  sql_date DATE,
  event_root_code STRING,
  action_geo_country_code STRING,
  goldstein_scale FLOAT64,
  avg_tone FLOAT64,
  source_url STRING
)
PARTITION BY DATE(published_at)
CLUSTER BY global_event_id, event_root_code;
