from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4

from worker.config import Settings
from worker.gdelt import fetch_text, filter_entries_by_lookback, parse_masterfile
from worker.models import JobResult
from worker.pipeline_warehouse import PipelineWarehouse


def run(settings: Settings, dry_run: bool = False) -> JobResult:
    started_at = datetime.now(timezone.utc).isoformat()
    request_id = f"manifest-sync-{uuid4()}"
    entries = parse_masterfile(fetch_text(settings.gdelt_masterfile_url))
    recent_entries = filter_entries_by_lookback(entries, settings.live_sync_lookback_minutes)

    if dry_run:
        return JobResult(
            job_name="manifest-sync",
            request_id=request_id,
            status="success",
            summary="Manifest sync dry-run completed without writing file manifest state.",
            business={"lookback_minutes": settings.live_sync_lookback_minutes},
            performance={"candidate_files": len(recent_entries)},
            started_at=started_at,
            finished_at=datetime.now(timezone.utc).isoformat(),
        )

    warehouse = PipelineWarehouse(settings)
    warehouse.ensure_pipeline_assets()
    inserted = warehouse.merge_file_manifest_entries(recent_entries)
    return JobResult(
        job_name="manifest-sync",
        request_id=request_id,
        status="success",
        summary="Synchronized the recent GDELT manifest slice into the authoritative file manifest table.",
        business={"lookback_minutes": settings.live_sync_lookback_minutes},
        performance={"candidate_files": len(recent_entries), "manifest_rows_merged": inserted},
        started_at=started_at,
        finished_at=datetime.now(timezone.utc).isoformat(),
    )
