from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4

from worker.bigquery_service import BigQueryService
from worker.config import Settings
from worker.ingest_pipeline import ingest_entries
from worker.models import JobResult


def run(settings: Settings) -> JobResult:
    started_at = datetime.now(timezone.utc).isoformat()
    warehouse = BigQueryService(settings)
    warehouse.ensure_warehouse()
    entries = warehouse.list_pending_entries(settings.worker_batch_size)
    recent_event_ids = warehouse.recent_event_ids(settings.repair_window_hours)
    stats = ingest_entries(settings, warehouse, entries, scope="continuous", recent_event_ids=recent_event_ids, update_registry=True)
    status = "success" if stats["errors"] == 0 else "error"
    summary = (
        "Downloaded pending GDELT exports, filtered them to approved Romanian outlets, and stored scoped raw rows."
        if status == "success"
        else "Encountered per-file ingestion errors while processing pending GDELT exports. Check ingest_errors for details."
    )
    return JobResult(
        job_name="download-worker",
        request_id=f"download-worker-{uuid4()}",
        status=status,
        summary=summary,
        business={
            "raw_dataset": settings.datasets.raw,
            "ops_dataset": settings.datasets.ops,
            "repair_window_hours": settings.repair_window_hours,
        },
        performance=stats,
        started_at=started_at,
        finished_at=datetime.now(timezone.utc).isoformat(),
    )
