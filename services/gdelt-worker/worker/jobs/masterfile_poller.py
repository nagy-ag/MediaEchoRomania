from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4

from worker.bigquery_service import BigQueryService
from worker.config import Settings
from worker.gdelt import fetch_text, filter_entries_by_lookback, parse_masterfile
from worker.models import JobResult


def run(settings: Settings, dry_run: bool = False) -> JobResult:
    started_at = datetime.now(timezone.utc).isoformat()
    request_id = f"masterfile-poller-{uuid4()}"
    masterfile_text = fetch_text(settings.gdelt_masterfile_url)
    entries = parse_masterfile(masterfile_text)
    recent_entries = filter_entries_by_lookback(entries, settings.poll_lookback_minutes)
    inserted = 0
    if not dry_run:
        warehouse = BigQueryService(settings)
        warehouse.ensure_warehouse()
        inserted = warehouse.insert_masterfile_entries(recent_entries)
    return JobResult(
        job_name="masterfile-poller",
        request_id=request_id,
        status="success",
        summary="Polled the GDELT masterfile and registered unseen recent exports.",
        business={
            "gdelt_masterfile_url": settings.gdelt_masterfile_url,
            "dry_run": dry_run,
            "lookback_minutes": settings.poll_lookback_minutes,
            "entries_recent": len(recent_entries),
            "entries_inserted": inserted,
        },
        performance={
            "entries_total": len(entries),
        },
        started_at=started_at,
        finished_at=datetime.now(timezone.utc).isoformat(),
    )
