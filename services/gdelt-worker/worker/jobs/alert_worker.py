from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4

from worker.bigquery_service import BigQueryService
from worker.config import Settings
from worker.models import JobResult


def run(settings: Settings) -> JobResult:
    started_at = datetime.now(timezone.utc).isoformat()
    warehouse = BigQueryService(settings)
    stale_count = warehouse.query_scalar(
        f"SELECT COUNT(*) AS count FROM `{settings.gcp_project_id}.{settings.datasets.ops}.job_status` WHERE status != 'healthy'"
    )
    ghosting_count = warehouse.query_scalar(
        f"SELECT COUNT(*) AS count FROM `{settings.gcp_project_id}.{settings.datasets.derived}.ghosting_flags`"
    )
    divergence_count = warehouse.query_scalar(
        f"SELECT COUNT(*) AS count FROM `{settings.gcp_project_id}.{settings.datasets.derived}.divergence_flags`"
    )
    return JobResult(
        job_name="alert-worker",
        request_id=f"alert-worker-{uuid4()}",
        status="success",
        summary="Evaluated stale-job, ghosting, and divergence alert surfaces from ops and derived tables.",
        business={
            "ops_dataset": settings.datasets.ops,
            "alert_checks": ["stale_jobs", "ghosting_flags", "divergence_flags"],
        },
        performance={
            "stale_jobs": int(stale_count or 0),
            "ghosting_flags": int(ghosting_count or 0),
            "divergence_flags": int(divergence_count or 0),
        },
        started_at=started_at,
        finished_at=datetime.now(timezone.utc).isoformat(),
    )
