SELECT
  CURRENT_TIMESTAMP() AS snapshot_at,
  MAX(last_success_at) AS latest_successful_sync,
  COUNTIF(status = "healthy") AS healthy_jobs,
  COUNTIF(status != "healthy") AS unhealthy_jobs
FROM `{{ project_id }}.gdelt_ops.job_status`;