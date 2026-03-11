ALTER TABLE `{{ project_id }}.gdelt_ops.job_runs`
ADD COLUMN IF NOT EXISTS progress_step INT64,
ADD COLUMN IF NOT EXISTS progress_total_steps INT64,
ADD COLUMN IF NOT EXISTS progress_message STRING,
ADD COLUMN IF NOT EXISTS is_complete BOOL;

ALTER TABLE `{{ project_id }}.gdelt_ops.job_status`
ADD COLUMN IF NOT EXISTS active_request_id STRING,
ADD COLUMN IF NOT EXISTS in_progress BOOL,
ADD COLUMN IF NOT EXISTS progress_step INT64,
ADD COLUMN IF NOT EXISTS progress_total_steps INT64,
ADD COLUMN IF NOT EXISTS progress_message STRING,
ADD COLUMN IF NOT EXISTS progress_updated_at TIMESTAMP;
