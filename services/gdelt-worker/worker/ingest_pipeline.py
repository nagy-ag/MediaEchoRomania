from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Iterable

from worker.bigquery_service import BigQueryService
from worker.config import Settings
from worker.gdelt import fetch_bytes, parse_feed_batch, sort_entries_for_ingest, source_file_from_url
from worker.models import MasterfileEntry
from worker.outlet_registry import build_approved_domain_set

RAW_TABLE_BY_FEED = {
    "mentions": "raw_mentions",
    "gkg": "raw_gkg",
    "events": "raw_events",
}


def ingest_entries(
    settings: Settings,
    warehouse: BigQueryService,
    entries: Iterable[MasterfileEntry],
    scope: str,
    recent_event_ids: set[int] | None = None,
    update_registry: bool = False,
) -> dict[str, int]:
    approved_domains = build_approved_domain_set(warehouse.approved_domain_rows())
    event_ids = set(recent_event_ids or set())
    stats = {
        "files_seen": 0,
        "rows_loaded": 0,
        "rows_rejected": 0,
        "discovered_domains": 0,
        "accepted_event_ids": 0,
        "errors": 0,
        "duplicate_files": 0,
    }

    for entry in sort_entries_for_ingest(entries):
        stats["files_seen"] += 1
        source_file = source_file_from_url(entry.url)
        try:
            payload = fetch_bytes(entry.url)
            batch = parse_feed_batch(entry, payload, approved_domains, event_ids)

            if warehouse.raw_file_already_loaded(source_file, batch.checksum):
                stats["duplicate_files"] += 1
                if update_registry:
                    warehouse.update_ingest_registry(source_file, status="downloaded", checksum=batch.checksum, rows_loaded=0)
                continue

            event_ids.update(batch.accepted_event_ids)
            window_key = entry.published_at.strftime("%Y-%m") if scope == "backfill" else entry.published_at.strftime("%Y%m%d%H%M")

            if batch.accepted_event_ids:
                warehouse.append_event_universe(
                    batch.accepted_event_ids,
                    window_key=window_key,
                    window_start=entry.published_at.isoformat(),
                    window_end=entry.published_at.isoformat(),
                    scope=scope,
                )
                stats["accepted_event_ids"] += len(batch.accepted_event_ids)

            if batch.discovered_domains:
                warehouse.append_discovery_domains(batch.discovered_domains, source_file=source_file, sample_url=entry.url)
                stats["discovered_domains"] += len(batch.discovered_domains)

            loaded = warehouse.load_rows(settings.datasets.raw, RAW_TABLE_BY_FEED[entry.feed_type], batch.rows)
            stats["rows_loaded"] += loaded
            stats["rows_rejected"] += batch.rejected_rows

            warehouse.load_rows(
                settings.datasets.raw,
                "raw_files",
                [
                    {
                        "source_file": source_file,
                        "checksum": batch.checksum,
                        "published_at": entry.published_at.isoformat(),
                        "ingested_at": datetime.now(timezone.utc).isoformat(),
                        "feed_type": entry.feed_type,
                        "row_count": loaded,
                        "status": "loaded",
                    }
                ],
            )
            if update_registry:
                warehouse.update_ingest_registry(source_file, status="downloaded", checksum=batch.checksum, rows_loaded=loaded)
        except Exception as exc:
            stats["errors"] += 1
            warehouse.record_ingest_error(
                source_file=source_file,
                stage="download_and_parse",
                error_message=str(exc),
                payload_json=json.dumps({"url": entry.url, "feed_type": entry.feed_type, "scope": scope}, sort_keys=True),
            )
            if update_registry:
                warehouse.update_ingest_registry(source_file, status="error", checksum=None, rows_loaded=0, error_message=str(exc))

    return stats
