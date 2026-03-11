from __future__ import annotations

from datetime import datetime, timedelta, timezone

from worker.config import Settings
from worker.jobs import stage_range
from worker.models import JobResult


def run(settings: Settings) -> JobResult:
    end_date = datetime.now(timezone.utc).date().isoformat()
    start_date = (datetime.now(timezone.utc) - timedelta(minutes=settings.live_sync_lookback_minutes)).date().isoformat()
    return stage_range.run(
        settings,
        start_date=start_date,
        end_date=end_date,
        scope="live",
        refresh_downstream=True,
    )
