CREATE SCHEMA IF NOT EXISTS `{{ project_id }}.gdelt_ops`;

CREATE TABLE IF NOT EXISTS `{{ project_id }}.gdelt_ops.job_runs` (
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

CREATE TABLE IF NOT EXISTS `{{ project_id }}.gdelt_ops.job_status` (
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

CREATE TABLE IF NOT EXISTS `{{ project_id }}.gdelt_ops.backfill_tracker` (
  month_key STRING,
  feed_type STRING,
  range_start DATE,
  range_end DATE,
  status STRING,
  rows_accepted INT64,
  rows_rejected INT64,
  discovered_domains INT64,
  started_at TIMESTAMP,
  completed_at TIMESTAMP
)
CLUSTER BY month_key, feed_type;

CREATE TABLE IF NOT EXISTS `{{ project_id }}.gdelt_ops.freshness_watermarks` (
  dataset_name STRING,
  table_name STRING,
  watermark_value TIMESTAMP,
  updated_at TIMESTAMP
)
CLUSTER BY dataset_name, table_name;

CREATE TABLE IF NOT EXISTS `{{ project_id }}.gdelt_ops.outlet_discovery_queue` (
  alias_domain STRING,
  first_seen_at TIMESTAMP,
  last_seen_at TIMESTAMP,
  sample_source_url STRING,
  source_file STRING,
  source_count INT64,
  status STRING
)
PARTITION BY DATE(first_seen_at)
CLUSTER BY alias_domain, status;

CREATE TABLE IF NOT EXISTS `{{ project_id }}.gdelt_ops.event_universe` (
  window_key STRING,
  window_start TIMESTAMP,
  window_end TIMESTAMP,
  scope STRING,
  global_event_id INT64,
  created_at TIMESTAMP
)
PARTITION BY DATE(window_start)
CLUSTER BY global_event_id, scope;
