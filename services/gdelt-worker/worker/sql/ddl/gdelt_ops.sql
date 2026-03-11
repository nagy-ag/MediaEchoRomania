CREATE SCHEMA IF NOT EXISTS `{{ project_id }}.{{ dataset_ops }}`;

CREATE TABLE IF NOT EXISTS `{{ project_id }}.{{ dataset_ops }}.job_runs` (
  job_name STRING,
  request_id STRING,
  started_at TIMESTAMP,
  finished_at TIMESTAMP,
  status STRING,
  summary STRING,
  payload_json STRING,
  progress_step INT64,
  progress_total_steps INT64,
  progress_message STRING,
  is_complete BOOL
)
PARTITION BY DATE(started_at)
CLUSTER BY job_name, status;

CREATE TABLE IF NOT EXISTS `{{ project_id }}.{{ dataset_ops }}.job_status` (
  job_name STRING,
  last_success_at TIMESTAMP,
  last_error_at TIMESTAMP,
  stale_after_minutes INT64,
  status STRING,
  notes STRING,
  active_request_id STRING,
  in_progress BOOL,
  progress_step INT64,
  progress_total_steps INT64,
  progress_message STRING,
  progress_updated_at TIMESTAMP
)
CLUSTER BY job_name, status;

CREATE TABLE IF NOT EXISTS `{{ project_id }}.{{ dataset_ops }}.backfill_runs` (
  run_id STRING,
  scope STRING,
  requested_start TIMESTAMP,
  requested_end TIMESTAMP,
  status STRING,
  batch_granularity STRING,
  months_total INT64,
  months_completed INT64,
  files_total INT64,
  files_completed INT64,
  rows_loaded INT64,
  rows_rejected INT64,
  started_at TIMESTAMP,
  finished_at TIMESTAMP,
  summary STRING
)
PARTITION BY DATE(started_at)
CLUSTER BY scope, status;

CREATE TABLE IF NOT EXISTS `{{ project_id }}.{{ dataset_ops }}.backfill_steps` (
  run_id STRING,
  step_id STRING,
  scope STRING,
  step_kind STRING,
  month_key STRING,
  feed_type STRING,
  range_start TIMESTAMP,
  range_end TIMESTAMP,
  status STRING,
  files_total INT64,
  files_completed INT64,
  rows_loaded INT64,
  rows_rejected INT64,
  started_at TIMESTAMP,
  finished_at TIMESTAMP,
  summary STRING
)
PARTITION BY DATE(started_at)
CLUSTER BY run_id, month_key, feed_type;

CREATE TABLE IF NOT EXISTS `{{ project_id }}.{{ dataset_ops }}.file_manifest` (
  source_file STRING,
  feed_type STRING,
  published_at TIMESTAMP,
  size_bytes INT64,
  source_url STRING,
  source_checksum STRING,
  staged_uri STRING,
  stage_status STRING,
  load_status STRING,
  scoped_status STRING,
  row_count INT64,
  first_seen_at TIMESTAMP,
  last_seen_at TIMESTAMP,
  staged_at TIMESTAMP,
  loaded_at TIMESTAMP,
  scoped_at TIMESTAMP,
  last_error_at TIMESTAMP,
  last_error_message STRING
)
PARTITION BY DATE(published_at)
CLUSTER BY feed_type, source_file;

CREATE TABLE IF NOT EXISTS `{{ project_id }}.{{ dataset_ops }}.file_manifest_buffer` (
  source_file STRING,
  feed_type STRING,
  published_at TIMESTAMP,
  size_bytes INT64,
  source_url STRING,
  source_checksum STRING,
  first_seen_at TIMESTAMP,
  last_seen_at TIMESTAMP
)
PARTITION BY DATE(last_seen_at)
CLUSTER BY feed_type, source_file;

CREATE TABLE IF NOT EXISTS `{{ project_id }}.{{ dataset_ops }}.load_audit` (
  audit_id STRING,
  run_id STRING,
  scope STRING,
  feed_type STRING,
  batch_key STRING,
  uri_count INT64,
  rows_loaded INT64,
  rows_rejected INT64,
  started_at TIMESTAMP,
  finished_at TIMESTAMP,
  status STRING,
  summary STRING
)
PARTITION BY DATE(started_at)
CLUSTER BY feed_type, status;

CREATE TABLE IF NOT EXISTS `{{ project_id }}.{{ dataset_ops }}.domain_review_queue` (
  alias_domain STRING,
  first_seen_at TIMESTAMP,
  last_seen_at TIMESTAMP,
  sample_identifier STRING,
  source_file STRING,
  source_count INT64,
  status STRING
)
PARTITION BY DATE(first_seen_at)
CLUSTER BY alias_domain, status;

CREATE TABLE IF NOT EXISTS `{{ project_id }}.{{ dataset_ops }}.freshness_watermarks` (
  dataset_name STRING,
  table_name STRING,
  watermark_value TIMESTAMP,
  updated_at TIMESTAMP
)
CLUSTER BY dataset_name, table_name;
