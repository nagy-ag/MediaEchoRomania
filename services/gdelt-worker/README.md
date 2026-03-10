# GDELT Worker

Railway-oriented Python worker for Media Echo Romania. The worker owns ingestion, normalization, historical backfill, rollups, morning brief candidate generation, and alert generation while Convex remains the app-state and hot-cache layer.

## Local setup

```powershell
py -3 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m worker.cli masterfile-poller --dry-run
```

## Worker commands

- `python -m worker.cli masterfile-poller --dry-run`
- `python -m worker.cli masterfile-poller`
- `python -m worker.cli download-worker`
- `python -m worker.cli normalizer`
- `python -m worker.cli rollup-worker`
- `python -m worker.cli brief-generator`
- `python -m worker.cli alert-worker`
- `python -m worker.cli backfill-worker --max-months 24`
- `python -m worker.cli backfill-worker --start-date 2015-01-01 --end-date 2026-03-01`

## Railway note

`services/gdelt-worker/railway.toml` must not contain a shared `startCommand`.
All worker services use the same root directory, so each worker command must be set in the Railway UI per service.

## Recommended Railway services

- `gdelt-masterfile-poller`: `python -m worker.cli masterfile-poller`
  Schedule: every 15 minutes.
- `gdelt-download-worker`: `python -m worker.cli download-worker`
  Schedule: every 15 minutes.
- `gdelt-normalizer`: `python -m worker.cli normalizer`
  Schedule: every 15 minutes.
- `gdelt-rollup-worker`: `python -m worker.cli rollup-worker`
  Schedule: every 15 minutes.
- `gdelt-brief-worker`: `python -m worker.cli brief-generator`
  Schedule: hourly or every morning.
- `gdelt-alert-worker`: `python -m worker.cli alert-worker`
  Schedule: every 15 minutes or hourly.
- `gdelt-backfill-worker`: `python -m worker.cli backfill-worker --max-months 24`
  Schedule: manual while historical import is running, then disable.

## What the worker creates in BigQuery

- `gdelt_raw`: raw GDELT slices, ingest registry, raw file registry, ingest errors.
- `gdelt_norm`: Romania-only normalized rows plus curated outlet registry and domain aliases.
- `gdelt_derived`: daily/monthly analytical rollups, event clusters, ghosting/divergence flags.
- `gdelt_serving`: overview, top events, entity trends, outlet caches, status summary.
- `gdelt_ops`: job runs, job health, freshness watermarks, backfill tracker, outlet discovery queue, event universe.

## Before the first live run

1. Create the GCP project and enable BigQuery.
2. Create a service account with BigQuery dataset and job permissions.
3. Add the environment variables from `.env.example` to Railway and your local `.env.local`.
4. Review `worker/seeds/romanian_outlets.json` and replace the starter outlet set with your approved curated list.
5. Run `python -m worker.cli backfill-worker --max-months 24` first, then continue older months until the 2015 backfill is complete.

## SQL assets

`worker/sql/ddl` contains dataset and table DDL templates.
`worker/sql/serving` contains the serving-layer query templates used by rollup jobs.
