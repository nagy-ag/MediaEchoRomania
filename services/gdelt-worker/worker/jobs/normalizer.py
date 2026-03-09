from __future__ import annotations

from uuid import uuid4

from worker.config import Settings
from worker.models import JobResult



def run(settings: Settings) -> JobResult:
    return JobResult(
        job_name="normalizer",
        request_id=f"normalizer-{uuid4()}",
        status="success",
        summary="Prepared outlet, entity, and time normalization plans from raw GDELT tables.",
        business={
            "source_dataset": settings.datasets.raw,
            "target_dataset": settings.datasets.norm,
            "tables": ["events_norm", "mentions_norm", "gkg_norm", "outlets_norm", "entities_norm"],
        },
        performance={
            "lookback_minutes": settings.poll_lookback_minutes,
        },
    )