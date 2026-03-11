from __future__ import annotations

from collections import defaultdict
from datetime import datetime, timezone
from uuid import uuid4

from worker.config import Settings
from worker.gcs_stage_service import GcsStageService
from worker.gdelt import fetch_bytes, fetch_text, parse_masterfile
from worker.jobs import normalizer, rollup_worker
from worker.models import FeedType, JobResult, MasterfileEntry, PipelineScope
from worker.pipeline_warehouse import PipelineWarehouse
from worker.ranges import month_windows_between, parse_date_bounds, timestamp_within_range, window_bounds
from worker.stage_serialization import PreparedStageFile, write_stage_file


def _entries_in_range(entries: list[MasterfileEntry], start_ts: datetime, end_ts: datetime) -> list[MasterfileEntry]:
    return [entry for entry in entries if timestamp_within_range(entry.published_at, start_ts, end_ts)]


def _batch_key(entry: MasterfileEntry, granularity: str) -> str:
    if granularity == "month":
        return entry.published_at.strftime("%Y-%m")
    return entry.published_at.strftime("%Y-%m-%d")


def _stage_entries(
    settings: Settings,
    stage_store: GcsStageService,
    warehouse: PipelineWarehouse,
    manifest_rows: list[dict[str, object]],
    *,
    run_id: str,
    scope: PipelineScope,
) -> dict[str, int]:
    uris_by_feed_batch: dict[tuple[FeedType, str], list[str]] = defaultdict(list)
    source_files_by_feed_batch: dict[tuple[FeedType, str], list[str]] = defaultdict(list)
    rows_staged = 0
    files_completed = 0
    errors = 0

    for row in manifest_rows:
        entry = MasterfileEntry(
            published_at=row["published_at"],
            size_bytes=int(row["size_bytes"]),
            url=str(row["source_url"]),
            feed_type=str(row["feed_type"]),
            source_checksum=str(row.get("source_checksum") or ""),
        )
        source_file = str(row["source_file"])
        checksum = str(row.get("source_checksum") or "")
        batch_key = _batch_key(entry, settings.backfill_batch_granularity)
        grouped_key = (entry.feed_type, batch_key)

        if row.get("load_status") == "loaded":
            files_completed += 1
            rows_staged += int(row.get("row_count") or 0)
            continue

        staged_uri = str(row.get("staged_uri") or "")
        if not staged_uri:
            prepared: PreparedStageFile | None = None
            try:
                payload = fetch_bytes(entry.url)
                prepared = write_stage_file(entry, payload, settings.gcs_stage_prefix)
                staged_uri = stage_store.upload_file(prepared.local_path, prepared.blob_path)
                warehouse.mark_manifest_staged(source_file, prepared.source_checksum, staged_uri, prepared.row_count)
                rows_staged += prepared.row_count
            except Exception as exc:
                errors += 1
                warehouse.mark_manifest_error(source_file, checksum, str(exc))
                continue
            finally:
                if prepared is not None:
                    prepared.cleanup()
        else:
            rows_staged += int(row.get("row_count") or 0)

        uris_by_feed_batch[grouped_key].append(staged_uri)
        source_files_by_feed_batch[grouped_key].append(source_file)
        files_completed += 1

    load_batches = 0
    for (feed_type, batch_key), uris in uris_by_feed_batch.items():
        warehouse.load_stage_uris(feed_type, uris)
        warehouse.mark_manifest_loaded(source_files_by_feed_batch[(feed_type, batch_key)])
        warehouse.record_load_audit(
            run_id=run_id,
            scope=scope,
            feed_type=feed_type,
            batch_key=batch_key,
            uri_count=len(uris),
            rows_loaded=0,
            rows_rejected=0,
            status="success",
            summary=f"Loaded {len(uris)} staged {feed_type} files for {batch_key} into BigQuery staging.",
        )
        load_batches += 1

    return {
        "files_total": len(manifest_rows),
        "files_completed": files_completed,
        "rows_staged": rows_staged,
        "load_batches": load_batches,
        "errors": errors,
    }


def run(
    settings: Settings,
    *,
    start_date: str,
    end_date: str,
    scope: PipelineScope,
    refresh_downstream: bool = True,
) -> JobResult:
    started_at = datetime.now(timezone.utc).isoformat()
    request_id = f"{scope}-range-{uuid4()}"
    if not settings.gcs_stage_bucket:
        return JobResult(
            job_name=f"{scope}-range",
            request_id=request_id,
            status="error",
            summary="GCS_GDELT_STAGE_BUCKET is required for the redesigned pipeline.",
            business={"scope": scope},
            performance={},
            started_at=started_at,
            finished_at=datetime.now(timezone.utc).isoformat(),
        )

    warehouse = PipelineWarehouse(settings)
    warehouse.ensure_pipeline_assets()
    stage_store = GcsStageService(settings)
    start_ts, end_ts = parse_date_bounds(start_date, end_date)
    all_entries = parse_masterfile(fetch_text(settings.gdelt_masterfile_url))

    total_files = 0
    total_completed = 0
    total_rows_staged = 0
    total_errors = 0
    months_total = 0

    if scope == "backfill":
        windows = month_windows_between(start_date, end_date)
        months_total = len(windows)
        warehouse.start_backfill_run(request_id, scope, start_ts, end_ts, months_total, settings.backfill_batch_granularity)
        for window in windows:
            window_start, window_end = window_bounds(window, start_date, end_date)
            month_entries = _entries_in_range(all_entries, window_start, window_end)
            warehouse.merge_file_manifest_entries(month_entries)
            manifest_rows = warehouse.list_manifest_entries(window_start, window_end)
            stage_stats = _stage_entries(settings, stage_store, warehouse, manifest_rows, run_id=request_id, scope=scope)
            warehouse.run_script(
                "sp_scope_stage_range.sql",
                {
                    "scope_start": window_start.isoformat(),
                    "scope_end": window_end.isoformat(),
                },
            )
            warehouse.mark_manifest_scoped(window_start, window_end)
            warehouse.upsert_backfill_step(
                run_id=request_id,
                step_id=f"{request_id}:{window.month_key}",
                scope=scope,
                step_kind="month",
                month_key=window.month_key,
                feed_type="all",
                range_start=window_start,
                range_end=window_end,
                status="success" if stage_stats["errors"] == 0 else "partial",
                files_total=stage_stats["files_total"],
                files_completed=stage_stats["files_completed"],
                rows_loaded=stage_stats["rows_staged"],
                rows_rejected=0,
                summary=f"Staged and scoped {window.month_key} using the GCS + BigQuery pipeline.",
            )
            total_files += stage_stats["files_total"]
            total_completed += stage_stats["files_completed"]
            total_rows_staged += stage_stats["rows_staged"]
            total_errors += stage_stats["errors"]
    else:
        range_entries = _entries_in_range(all_entries, start_ts, end_ts)
        warehouse.merge_file_manifest_entries(range_entries)
        manifest_rows = warehouse.list_manifest_entries(start_ts, end_ts)
        stage_stats = _stage_entries(settings, stage_store, warehouse, manifest_rows, run_id=request_id, scope=scope)
        warehouse.run_script(
            "sp_scope_stage_range.sql",
            {
                "scope_start": start_ts.isoformat(),
                "scope_end": end_ts.isoformat(),
            },
        )
        warehouse.mark_manifest_scoped(start_ts, end_ts)
        total_files = stage_stats["files_total"]
        total_completed = stage_stats["files_completed"]
        total_rows_staged = stage_stats["rows_staged"]
        total_errors = stage_stats["errors"]

    if refresh_downstream:
        normalizer.run(settings)
        rollup_worker.run(settings)

    status = "success" if total_errors == 0 else "error"
    if scope == "backfill":
        warehouse.finalize_backfill_run(
            request_id,
            status,
            "Historical backfill completed through the GCS + BigQuery batch pipeline."
            if status == "success"
            else "Backfill completed with stage or fetch errors. Check file_manifest and backfill_steps.",
        )

    return JobResult(
        job_name=f"{scope}-range",
        request_id=request_id,
        status=status,
        summary=(
            "Processed the requested historical range through the GCS-staged BigQuery pipeline."
            if status == "success" and scope == "backfill"
            else "Processed the live lookback window through the GCS-staged BigQuery pipeline."
            if status == "success"
            else "Pipeline run finished with stage or fetch errors. Check file_manifest for failed source files."
        ),
        business={
            "scope": scope,
            "requested_start": start_date,
            "requested_end": end_date,
            "batch_granularity": settings.backfill_batch_granularity,
        },
        performance={
            "files_total": total_files,
            "files_completed": total_completed,
            "rows_staged": total_rows_staged,
            "months_total": months_total,
            "errors": total_errors,
        },
        started_at=started_at,
        finished_at=datetime.now(timezone.utc).isoformat(),
    )
