# GDELT Worker

GCP-oriented Python worker for Media Echo Romania. The redesigned pipeline stages GDELT files in EU Cloud Storage, batch-loads them into BigQuery stage tables, scopes accepted Romanian coverage in SQL, and then refreshes normalized, derived, and serving datasets.

## Local setup

```powershell
py -3 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m worker.cli manifest-sync --dry-run
```

## Primary commands

- `python -m worker.cli manifest-sync --dry-run`
- `python -m worker.cli manifest-sync`
- `python -m worker.cli live-range`
- `python -m worker.cli stage-range --start-date 2026-03-01 --end-date 2026-03-10 --scope backfill`
- `python -m worker.cli backfill-worker --start-date 2015-01-01 --end-date 2026-03-10`

`backfill-worker` is now a compatibility wrapper around the new GCS + BigQuery stage pipeline.

## Data flow

1. Fetch the GDELT masterfile and merge candidate files into `gdelt_ops.file_manifest`.
2. Download ZIPs and rewrite them as plain TSV stage files in `gs://$GCS_GDELT_STAGE_BUCKET/$GCS_GDELT_STAGE_PREFIX/...`.
3. Batch-load those TSV files into `gdelt_stage.stage_mentions`, `stage_gkg`, and `stage_events`.
4. Run SQL scripts to scope Romanian outlets, update the domain review queue, and refresh normalized/derived/serving tables.

## BigQuery assets

- `worker/sql/ddl`: datasets and tables
- `worker/sql/scripts`: stage-to-raw scoping and SQL refresh entrypoints
- `worker/sql/migrations/20260311_gcp_pipeline_cutover.sql`: one-time cutover cleanup

## GCP infra

`infra/gcp` contains the starting Terraform assets for:
- EU Cloud Storage stage bucket
- Cloud Run Jobs for `manifest-sync` and `live-range`
- Workflow placeholder for manual backfill orchestration
- service account and base IAM grants

## Railway after cutover

Disable these worker services after the new GCP path is live:
- `gdelt-masterfile-poller`
- `gdelt-download-worker`
- `gdelt-normalizer`
- `gdelt-rollup-worker`
- `gdelt-backfill-worker`

Keep the web app in Railway. Revisit `brief` / `alert` later if you want to move them to GCP too.
