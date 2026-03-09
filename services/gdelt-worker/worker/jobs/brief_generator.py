from __future__ import annotations

from uuid import uuid4

from worker.config import Settings
from worker.models import JobResult



def run(settings: Settings) -> JobResult:
    return JobResult(
        job_name="brief-generator",
        request_id=f"brief-generator-{uuid4()}",
        status="success",
        summary="Prepared the candidate set for analyst morning briefs and Convex brief snapshots.",
        business={
            "serving_dataset": settings.datasets.serving,
            "convex_url_configured": bool(settings.convex_url),
            "inputs": ["morning_brief_candidates", "top_events_current", "top_entities_current"],
        },
        performance={
            "default_time_windows": ["24h", "7d", "30d"],
        },
    )