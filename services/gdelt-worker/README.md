# GDELT Worker

Railway-oriented Python worker for Media Echo Romania. The worker owns ingestion, normalization, rollups, morning brief candidate generation, and alert generation while Convex remains the app-state and cache layer.

## Local setup

```powershell
py -3 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m worker.cli masterfile-poller --dry-run
```

## Recommended Railway services

- `gdelt-masterfile-poller`: `python -m worker.cli masterfile-poller`
- `gdelt-download-worker`: `python -m worker.cli download-worker`
- `gdelt-normalizer`: `python -m worker.cli normalizer`
- `gdelt-rollup-worker`: `python -m worker.cli rollup-worker`
- `gdelt-brief-worker`: `python -m worker.cli brief-generator`
- `gdelt-alert-worker`: `python -m worker.cli alert-worker`

## SQL assets

`worker/sql/ddl` contains dataset and table DDL templates.
`worker/sql/serving` contains the serving-layer query templates used by rollup jobs.