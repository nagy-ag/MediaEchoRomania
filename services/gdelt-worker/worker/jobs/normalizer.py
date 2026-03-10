from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4

from worker.bigquery_service import BigQueryService
from worker.config import Settings
from worker.queries import normalization_queries
from worker.models import JobResult


def run(settings: Settings) -> JobResult:
    started_at = datetime.now(timezone.utc).isoformat()
    warehouse = BigQueryService(settings)
    warehouse.ensure_warehouse()
    executed = []
    for table_name, sql in normalization_queries(settings):
        warehouse.run_sql(sql)
        warehouse.update_freshness_watermark(settings.datasets.norm, table_name, datetime.now(timezone.utc).isoformat())
        executed.append(table_name)
    return JobResult(
        job_name="normalizer",
        request_id=f"normalizer-{uuid4()}",
        status="success",
        summary="Rebuilt the Romania-only normalized layer from scoped raw GDELT tables.",
        business={
            "source_dataset": settings.datasets.raw,
            "target_dataset": settings.datasets.norm,
            "tables": executed,
        },
        performance={
            "refresh_count": len(executed),
        },
        started_at=started_at,
        finished_at=datetime.now(timezone.utc).isoformat(),
    )
