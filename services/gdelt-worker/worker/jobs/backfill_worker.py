from __future__ import annotations

from datetime import datetime

from worker.config import Settings
from worker.jobs import stage_range
from worker.models import JobResult


def run(
    settings: Settings,
    start_date: str | None = None,
    end_date: str | None = None,
    max_months: int | None = None,
) -> JobResult:
    effective_start = start_date or settings.backfill_start_date
    effective_end = end_date or settings.backfill_end_date or datetime.utcnow().date().isoformat()
    return stage_range.run(
        settings,
        start_date=effective_start,
        end_date=effective_end,
        scope="backfill",
        refresh_downstream=True,
    )
