UPDATE `{{ project_id }}.{{ dataset_ops }}.backfill_steps`
SET status = '{{ step_status }}',
    files_total = {{ files_total }},
    files_completed = {{ files_completed }},
    rows_loaded = {{ rows_loaded }},
    rows_rejected = {{ rows_rejected }},
    finished_at = CURRENT_TIMESTAMP(),
    summary = '{{ step_summary }}'
WHERE step_id = '{{ step_id }}';

UPDATE `{{ project_id }}.{{ dataset_ops }}.backfill_runs`
SET months_completed = (
      SELECT COUNT(*)
      FROM `{{ project_id }}.{{ dataset_ops }}.backfill_steps`
      WHERE run_id = '{{ run_id }}' AND status = 'success'
    ),
    files_total = (
      SELECT COALESCE(SUM(files_total), 0)
      FROM `{{ project_id }}.{{ dataset_ops }}.backfill_steps`
      WHERE run_id = '{{ run_id }}'
    ),
    files_completed = (
      SELECT COALESCE(SUM(files_completed), 0)
      FROM `{{ project_id }}.{{ dataset_ops }}.backfill_steps`
      WHERE run_id = '{{ run_id }}'
    ),
    rows_loaded = (
      SELECT COALESCE(SUM(rows_loaded), 0)
      FROM `{{ project_id }}.{{ dataset_ops }}.backfill_steps`
      WHERE run_id = '{{ run_id }}'
    ),
    rows_rejected = (
      SELECT COALESCE(SUM(rows_rejected), 0)
      FROM `{{ project_id }}.{{ dataset_ops }}.backfill_steps`
      WHERE run_id = '{{ run_id }}'
    )
WHERE run_id = '{{ run_id }}';
