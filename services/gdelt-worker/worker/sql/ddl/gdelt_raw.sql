CREATE SCHEMA IF NOT EXISTS `{{ project_id }}.gdelt_raw`;

CREATE TABLE IF NOT EXISTS `{{ project_id }}.gdelt_raw.raw_mentions` (
  source_file STRING,
  checksum STRING,
  published_at TIMESTAMP,
  ingested_at TIMESTAMP,
  global_event_id INT64,
  mention_time TIMESTAMP,
  mention_type STRING,
  source_name STRING,
  source_domain STRING,
  source_url STRING,
  confidence INT64,
  mention_doc_tone FLOAT64
)
PARTITION BY DATE(mention_time)
CLUSTER BY global_event_id, source_domain;

CREATE TABLE IF NOT EXISTS `{{ project_id }}.gdelt_raw.raw_gkg` (
  source_file STRING,
  checksum STRING,
  published_at TIMESTAMP,
  ingested_at TIMESTAMP,
  gkg_record_id STRING,
  date TIMESTAMP,
  source_common_name STRING,
  source_domain STRING,
  document_identifier STRING,
  themes STRING,
  persons STRING,
  organizations STRING,
  gcam STRING,
  v2tone STRING
)
PARTITION BY DATE(date)
CLUSTER BY source_domain, document_identifier;

CREATE TABLE IF NOT EXISTS `{{ project_id }}.gdelt_raw.raw_events` (
  source_file STRING,
  checksum STRING,
  published_at TIMESTAMP,
  ingested_at TIMESTAMP,
  global_event_id INT64,
  sql_date DATE,
  event_root_code STRING,
  action_geo_country_code STRING,
  goldstein_scale FLOAT64,
  avg_tone FLOAT64,
  source_url STRING
)
PARTITION BY sql_date
CLUSTER BY global_event_id, event_root_code;

CREATE TABLE IF NOT EXISTS `{{ project_id }}.gdelt_raw.raw_files` (
  source_file STRING,
  checksum STRING,
  published_at TIMESTAMP,
  ingested_at TIMESTAMP,
  feed_type STRING,
  row_count INT64,
  status STRING
)
PARTITION BY DATE(ingested_at)
CLUSTER BY feed_type, source_file;

CREATE TABLE IF NOT EXISTS `{{ project_id }}.gdelt_raw.ingest_registry` (
  source_file STRING,
  feed_type STRING,
  published_at TIMESTAMP,
  size_bytes INT64,
  url STRING,
  checksum STRING,
  status STRING,
  rows_loaded INT64,
  first_seen_at TIMESTAMP,
  last_attempt_at TIMESTAMP,
  last_completed_at TIMESTAMP,
  error_message STRING
)
PARTITION BY DATE(first_seen_at)
CLUSTER BY status, feed_type;

CREATE TABLE IF NOT EXISTS `{{ project_id }}.gdelt_raw.ingest_errors` (
  source_file STRING,
  occurred_at TIMESTAMP,
  stage STRING,
  error_message STRING,
  payload_json STRING
)
PARTITION BY DATE(occurred_at)
CLUSTER BY stage, source_file;
