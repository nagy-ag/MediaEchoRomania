from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

from worker.bigquery_service import BigQueryService
from worker.config import Settings
from worker.queries import derived_queries
from worker.models import JobResult

SERVING_QUERY_TO_TABLE = {
    "overview_current.sql": "overview_current",
    "top_events_current.sql": "top_events_current",
    "top_entities_current.sql": "top_entities_current",
    "morning_brief_candidates.sql": "morning_brief_candidates",
    "outlet_compare_cache.sql": "outlet_compare_cache",
    "outlet_detail_cache.sql": "outlet_detail_cache",
    "entity_trend_cache.sql": "entity_trend_cache",
    "status_summary.sql": "status_summary",
}


def run(settings: Settings) -> JobResult:
    started_at = datetime.now(timezone.utc).isoformat()
    warehouse = BigQueryService(settings)
    warehouse.ensure_warehouse()
    executed = []
    for table_name, sql in derived_queries(settings):
        warehouse.run_sql(sql)
        warehouse.update_freshness_watermark(settings.datasets.derived, table_name, datetime.now(timezone.utc).isoformat())
        executed.append(table_name)
    serving_dir = Path(__file__).resolve().parents[1] / "sql" / "serving"
    for path in sorted(serving_dir.glob("*.sql")):
        destination_table = SERVING_QUERY_TO_TABLE[path.name]
        select_sql = path.read_text(encoding="utf-8").replace("{{ project_id }}", settings.gcp_project_id)
        warehouse.run_sql(
            f"CREATE OR REPLACE TABLE `{settings.gcp_project_id}.{settings.datasets.serving}.{destination_table}` AS {select_sql}"
        )
        warehouse.update_freshness_watermark(settings.datasets.serving, destination_table, datetime.now(timezone.utc).isoformat())
        executed.append(destination_table)
    return JobResult(
        job_name="rollup-worker",
        request_id=f"rollup-worker-{uuid4()}",
        status="success",
        summary="Rebuilt derived analytics tables and refreshed serving rollups for public and analyst reads.",
        business={
            "derived_dataset": settings.datasets.derived,
            "serving_dataset": settings.datasets.serving,
            "recent_window_hours": settings.recent_serving_window_hours,
        },
        performance={
            "refresh_count": len(executed),
        },
        started_at=started_at,
        finished_at=datetime.now(timezone.utc).isoformat(),
    )
