from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4

from worker.config import Settings
from worker.models import JobResult
from worker.pipeline_warehouse import PipelineWarehouse


REFRESHED_TABLES = ["mentions_ro", "gkg_ro", "events_ro"]


def run(settings: Settings) -> JobResult:
    started_at = datetime.now(timezone.utc).isoformat()
    warehouse = PipelineWarehouse(settings)
    warehouse.ensure_pipeline_assets()
    warehouse.run_script("sp_refresh_norm.sql")
    for table_name in REFRESHED_TABLES:
        warehouse.warehouse.update_freshness_watermark(settings.datasets.norm, table_name, datetime.now(timezone.utc).isoformat())
    return JobResult(
        job_name="normalizer",
        request_id=f"normalizer-{uuid4()}",
        status="success",
        summary="Rebuilt the Romania-only normalized layer from scoped raw GDELT tables.",
        business={
            "source_dataset": settings.datasets.raw,
            "target_dataset": settings.datasets.norm,
            "tables": REFRESHED_TABLES,
        },
        performance={
            "refresh_count": len(REFRESHED_TABLES),
        },
        started_at=started_at,
        finished_at=datetime.now(timezone.utc).isoformat(),
    )
