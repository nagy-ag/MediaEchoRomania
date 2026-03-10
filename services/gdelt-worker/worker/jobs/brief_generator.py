from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4

from worker.bigquery_service import BigQueryService
from worker.config import Settings
from worker.models import JobResult


def run(settings: Settings) -> JobResult:
    started_at = datetime.now(timezone.utc).isoformat()
    warehouse = BigQueryService(settings)
    candidate_count = warehouse.query_scalar(
        f"SELECT COUNT(*) AS count FROM `{settings.gcp_project_id}.{settings.datasets.serving}.morning_brief_candidates`"
    )
    entity_count = warehouse.query_scalar(
        f"SELECT COUNT(*) AS count FROM `{settings.gcp_project_id}.{settings.datasets.serving}.top_entities_current`"
    )
    return JobResult(
        job_name="brief-generator",
        request_id=f"brief-generator-{uuid4()}",
        status="success",
        summary="Prepared the serving-layer candidate set for analyst morning briefs.",
        business={
            "serving_dataset": settings.datasets.serving,
            "convex_url_configured": bool(settings.convex_url),
            "inputs": ["morning_brief_candidates", "top_events_current", "top_entities_current"],
        },
        performance={
            "candidate_rows": int(candidate_count or 0),
            "entity_rows": int(entity_count or 0),
        },
        started_at=started_at,
        finished_at=datetime.now(timezone.utc).isoformat(),
    )
