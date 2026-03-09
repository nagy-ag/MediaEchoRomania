CREATE SCHEMA IF NOT EXISTS `{{ project_id }}.gdelt_ops`;

CREATE TABLE IF NOT EXISTS `{{ project_id }}.gdelt_ops.job_runs` (
  job_name STRING,
  request_id STRING,
  started_at TIMESTAMP,
  finished_at TIMESTAMP,
  status STRING,
  summary STRING,
  payload_json STRING
)
PARTITION BY DATE(started_at)
CLUSTER BY job_name, status;

CREATE TABLE IF NOT EXISTS `{{ project_id }}.gdelt_ops.job_status` (
  job_name STRING,
  last_success_at TIMESTAMP,
  last_error_at TIMESTAMP,
  stale_after_minutes INT64,
  status STRING,
  notes STRING
);