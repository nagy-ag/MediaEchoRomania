# GCP Pipeline Infra

This folder provisions the minimum GCP resources for the redesigned EU-native GDELT pipeline.

Expected flow after `terraform apply`:
- build and push the worker container image
- set `worker_image`
- apply Terraform
- execute `gdelt-manifest-sync` and `gdelt-live-range` as Cloud Run Jobs
- use the workflow as the manual backfill entrypoint once the worker image is live

Manual follow-up after apply:
1. Create the BigQuery datasets in `EU` if they do not already exist.
2. Add the worker env vars from `.env.example` plus `GCS_GDELT_STAGE_BUCKET` and `BQ_DATASET_STAGE`.
3. Deploy the worker image that contains the new `manifest-sync`, `stage-range`, and `live-range` commands.
4. Run the cutover SQL migration in `services/gdelt-worker/worker/sql/migrations/20260311_gcp_pipeline_cutover.sql`.
