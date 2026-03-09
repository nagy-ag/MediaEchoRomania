CREATE SCHEMA IF NOT EXISTS `{{ project_id }}.gdelt_raw`;

CREATE TABLE IF NOT EXISTS `{{ project_id }}.gdelt_raw.raw_events` (
  source_file STRING,
  ingested_at TIMESTAMP,
  global_event_id INT64,
  sql_date DATE,
  event_root_code STRING,
  goldstein_scale FLOAT64,
  avg_tone FLOAT64,
  source_url STRING
)
PARTITION BY sql_date
CLUSTER BY global_event_id, event_root_code;

CREATE TABLE IF NOT EXISTS `{{ project_id }}.gdelt_raw.raw_mentions` (
  source_file STRING,
  ingested_at TIMESTAMP,
  global_event_id INT64,
  mention_time TIMESTAMP,
  source_domain STRING,
  source_url STRING,
  confidence INT64,
  mention_doc_tone FLOAT64
)
PARTITION BY DATE(mention_time)
CLUSTER BY global_event_id, source_domain;

CREATE TABLE IF NOT EXISTS `{{ project_id }}.gdelt_raw.raw_gkg` (
  source_file STRING,
  ingested_at TIMESTAMP,
  gkg_record_id STRING,
  date TIMESTAMP,
  source_common_name STRING,
  document_identifier STRING,
  themes STRING,
  persons STRING,
  organizations STRING,
  gcam STRING,
  v2tone STRING
)
PARTITION BY DATE(date)
CLUSTER BY source_common_name, document_identifier;