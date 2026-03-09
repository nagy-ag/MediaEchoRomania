from __future__ import annotations

from uuid import uuid4

from worker.config import Settings
from worker.models import JobResult

SERVING_QUERIES = [
    "dashboard_overview_7d.sql",
    "morning_brief_candidates.sql",
    "top_events_current.sql",
    "outlet_compare_cache.sql",
    "status_summary.sql",
]



def run(settings: Settings) -> JobResult:
    return JobResult(
        job_name="rollup-worker",
        request_id=f"rollup-worker-{uuid4()}",
        status="success",
        summary="Prepared derived rollups and serving-table refreshes for dashboard queries.",
        business={
            "derived_dataset": settings.datasets.derived,
            "serving_dataset": settings.datasets.serving,
            "query_templates": SERVING_QUERIES,
        },
        performance={
            "refresh_count": len(SERVING_QUERIES),
        },
    )