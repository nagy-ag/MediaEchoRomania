WITH freshness AS (
  SELECT MAX(watermark_value) AS freshest_watermark
  FROM `{{ project_id }}.gdelt_ops.freshness_watermarks`
),
job_health AS (
  SELECT
    MAX(last_success_at) AS latest_successful_sync,
    COUNTIF(status = 'healthy') AS healthy_jobs,
    COUNTIF(status != 'healthy') AS unhealthy_jobs
  FROM `{{ project_id }}.gdelt_ops.job_status`
)
SELECT
  CURRENT_TIMESTAMP() AS generated_at,
  CONCAT(CAST(TIMESTAMP_DIFF(CURRENT_TIMESTAMP(), freshest_watermark, MINUTE) AS STRING), ' minutes') AS data_freshness,
  'status' AS granularity,
  'Operational summary combines job status health with dataset freshness watermarks.' AS confidence_notes,
  latest_successful_sync,
  healthy_jobs,
  unhealthy_jobs,
  freshest_watermark
FROM job_health
CROSS JOIN freshness;
