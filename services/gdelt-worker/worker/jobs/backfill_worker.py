from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4

from worker.bigquery_service import BigQueryService
from worker.config import Settings
from worker.gdelt import build_backfill_windows, fetch_text, filter_entries_for_window, parse_masterfile
from worker.ingest_pipeline import ingest_entries
from worker.jobs import normalizer, rollup_worker
from worker.models import JobResult


def _tracker_status(stats: dict[str, int]) -> str:
    if stats["errors"] > 0:
        return "partial"
    return "loaded"


def run(
    settings: Settings,
    start_date: str | None = None,
    end_date: str | None = None,
    max_months: int | None = None,
) -> JobResult:
    started_at = datetime.now(timezone.utc).isoformat()
    warehouse = BigQueryService(settings)
    warehouse.ensure_warehouse()
    masterfile_text = fetch_text(settings.gdelt_masterfile_url)
    all_entries = parse_masterfile(masterfile_text)
    windows = build_backfill_windows(start_date or settings.backfill_start_date, end_date or settings.backfill_end_date)
    if max_months is not None:
        windows = windows[:max_months]

    total_loaded = 0
    total_rejected = 0
    total_discovered = 0
    total_errors = 0
    total_duplicates = 0
    months_processed = 0

    for window in windows:
        month_entries = filter_entries_for_window(all_entries, window)
        mention_entries = [entry for entry in month_entries if entry.feed_type == "mentions"]
        gkg_entries = [entry for entry in month_entries if entry.feed_type == "gkg"]
        event_entries = [entry for entry in month_entries if entry.feed_type == "events"]

        mention_stats = ingest_entries(settings, warehouse, mention_entries, scope="backfill", recent_event_ids=set(), update_registry=False)
        warehouse.upsert_backfill_tracker(
            month_key=window.month_key,
            feed_type="mentions",
            status=_tracker_status(mention_stats),
            range_start=window.start_date.isoformat(),
            range_end=window.end_date.isoformat(),
            rows_accepted=mention_stats["rows_loaded"],
            rows_rejected=mention_stats["rows_rejected"],
            discovered_domains=mention_stats["discovered_domains"],
        )

        gkg_stats = ingest_entries(settings, warehouse, gkg_entries, scope="backfill", recent_event_ids=set(), update_registry=False)
        warehouse.upsert_backfill_tracker(
            month_key=window.month_key,
            feed_type="gkg",
            status=_tracker_status(gkg_stats),
            range_start=window.start_date.isoformat(),
            range_end=window.end_date.isoformat(),
            rows_accepted=gkg_stats["rows_loaded"],
            rows_rejected=gkg_stats["rows_rejected"],
            discovered_domains=gkg_stats["discovered_domains"],
        )

        event_ids = warehouse.event_ids_for_window(window.month_key, "backfill")
        event_stats = ingest_entries(settings, warehouse, event_entries, scope="backfill", recent_event_ids=event_ids, update_registry=False)
        warehouse.upsert_backfill_tracker(
            month_key=window.month_key,
            feed_type="events",
            status=_tracker_status(event_stats),
            range_start=window.start_date.isoformat(),
            range_end=window.end_date.isoformat(),
            rows_accepted=event_stats["rows_loaded"],
            rows_rejected=event_stats["rows_rejected"],
            discovered_domains=event_stats["discovered_domains"],
        )

        total_loaded += mention_stats["rows_loaded"] + gkg_stats["rows_loaded"] + event_stats["rows_loaded"]
        total_rejected += mention_stats["rows_rejected"] + gkg_stats["rows_rejected"] + event_stats["rows_rejected"]
        total_discovered += mention_stats["discovered_domains"] + gkg_stats["discovered_domains"] + event_stats["discovered_domains"]
        total_errors += mention_stats["errors"] + gkg_stats["errors"] + event_stats["errors"]
        total_duplicates += mention_stats["duplicate_files"] + gkg_stats["duplicate_files"] + event_stats["duplicate_files"]
        months_processed += 1

    normalizer.run(settings)
    rollup_worker.run(settings)
    status = "success" if total_errors == 0 else "error"
    summary = (
        "Processed monthly historical GDELT backfill windows and refreshed the normalized and serving layers."
        if status == "success"
        else "Completed a partial backfill pass with file-level errors. Check backfill_tracker and ingest_errors before continuing."
    )
    return JobResult(
        job_name="backfill-worker",
        request_id=f"backfill-worker-{uuid4()}",
        status=status,
        summary=summary,
        business={
            "backfill_start_date": start_date or settings.backfill_start_date,
            "backfill_end_date": end_date or settings.backfill_end_date,
            "months_processed": months_processed,
        },
        performance={
            "rows_loaded": total_loaded,
            "rows_rejected": total_rejected,
            "discovered_domains": total_discovered,
            "errors": total_errors,
            "duplicate_files": total_duplicates,
        },
        started_at=started_at,
        finished_at=datetime.now(timezone.utc).isoformat(),
    )
