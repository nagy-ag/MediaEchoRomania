from __future__ import annotations

from datetime import datetime, time, timedelta, timezone

from worker.models import BackfillWindow


def parse_date_bounds(start_date: str, end_date: str | None = None) -> tuple[datetime, datetime]:
    start_value = datetime.strptime(start_date, "%Y-%m-%d").date()
    end_value = datetime.utcnow().date() if not end_date else datetime.strptime(end_date, "%Y-%m-%d").date()
    start_ts = datetime.combine(start_value, time.min, tzinfo=timezone.utc)
    end_ts = datetime.combine(end_value, time.max, tzinfo=timezone.utc)
    return start_ts, end_ts


def month_windows_between(start_date: str, end_date: str | None = None) -> list[BackfillWindow]:
    start_value = datetime.strptime(start_date, "%Y-%m-%d").date().replace(day=1)
    end_value = datetime.utcnow().date() if not end_date else datetime.strptime(end_date, "%Y-%m-%d").date()
    cursor = end_value.replace(day=1)
    windows: list[BackfillWindow] = []
    while cursor >= start_value:
        next_month = cursor.replace(year=cursor.year + 1, month=1, day=1) if cursor.month == 12 else cursor.replace(month=cursor.month + 1, day=1)
        windows.append(BackfillWindow(month_key=cursor.strftime("%Y-%m"), start_date=cursor, end_date=next_month))
        cursor = cursor.replace(year=cursor.year - 1, month=12, day=1) if cursor.month == 1 else cursor.replace(month=cursor.month - 1, day=1)
    windows.reverse()
    return windows


def window_bounds(window: BackfillWindow, requested_start: str, requested_end: str | None = None) -> tuple[datetime, datetime]:
    start_ts, end_ts = parse_date_bounds(requested_start, requested_end)
    window_start = datetime.combine(window.start_date, time.min, tzinfo=timezone.utc)
    window_end = datetime.combine(window.end_date, time.min, tzinfo=timezone.utc)
    clipped_start = max(start_ts, window_start)
    clipped_end = min(end_ts, window_end - timedelta(microseconds=1))
    return clipped_start, clipped_end


def timestamp_within_range(candidate: datetime, start_ts: datetime, end_ts: datetime) -> bool:
    return start_ts <= candidate <= end_ts
