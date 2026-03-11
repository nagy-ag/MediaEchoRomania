from __future__ import annotations

import csv
import io
import shutil
import tempfile
import zipfile
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

from worker import gdelt
from worker.models import FeedType, MasterfileEntry

STAGE_COLUMNS = {
    "mentions": [
        "source_file",
        "source_checksum",
        "manifest_url",
        "published_at",
        "staged_at",
        "global_event_id",
        "mention_time",
        "mention_type",
        "source_name",
        "source_identifier",
        "source_domain",
        "confidence",
        "mention_doc_tone",
    ],
    "gkg": [
        "source_file",
        "source_checksum",
        "manifest_url",
        "published_at",
        "staged_at",
        "gkg_record_id",
        "date",
        "source_common_name",
        "document_identifier",
        "source_domain",
        "themes",
        "persons",
        "organizations",
        "gcam",
        "v2tone",
    ],
    "events": [
        "source_file",
        "source_checksum",
        "manifest_url",
        "published_at",
        "staged_at",
        "global_event_id",
        "sql_date",
        "event_root_code",
        "action_geo_country_code",
        "goldstein_scale",
        "avg_tone",
        "source_url",
    ],
}


@dataclass(frozen=True)
class PreparedStageFile:
    local_path: Path
    blob_path: str
    source_file: str
    source_checksum: str
    row_count: int
    feed_type: FeedType
    published_at: datetime
    manifest_url: str

    def cleanup(self) -> None:
        shutil.rmtree(self.local_path.parent, ignore_errors=True)


def stage_blob_path(entry: MasterfileEntry, prefix: str) -> str:
    return (
        f"{prefix.rstrip('/')}/feed={entry.feed_type}/year={entry.published_at:%Y}/month={entry.published_at:%m}"
        f"/day={entry.published_at:%d}/{gdelt.source_file_from_url(entry.url).replace('.zip', '.tsv')}"
    )


def _safe_string(value: object | None) -> str:
    if value is None:
        return ""
    return str(value)


def _mention_stage_row(row: list[str], entry: MasterfileEntry, checksum: str, staged_at: datetime) -> list[str] | None:
    parsed = gdelt._mention_row(  # type: ignore[attr-defined]
        row,
        gdelt.source_file_from_url(entry.url),
        checksum,
        entry.published_at,
        staged_at,
    )
    if not parsed:
        return None
    return [
        _safe_string(parsed["source_file"]),
        checksum,
        entry.url,
        entry.published_at.isoformat(),
        staged_at.isoformat(),
        _safe_string(parsed["global_event_id"]),
        _safe_string(parsed["mention_time"]),
        _safe_string(parsed["mention_type"]),
        _safe_string(parsed["source_name"]),
        _safe_string(parsed["source_url"]),
        _safe_string(parsed["source_domain"]),
        _safe_string(parsed["confidence"]),
        _safe_string(parsed["mention_doc_tone"]),
    ]


def _gkg_stage_row(row: list[str], entry: MasterfileEntry, checksum: str, staged_at: datetime) -> list[str] | None:
    parsed = gdelt._gkg_row(  # type: ignore[attr-defined]
        row,
        gdelt.source_file_from_url(entry.url),
        checksum,
        entry.published_at,
        staged_at,
    )
    if not parsed:
        return None
    return [
        _safe_string(parsed["source_file"]),
        checksum,
        entry.url,
        entry.published_at.isoformat(),
        staged_at.isoformat(),
        _safe_string(parsed["gkg_record_id"]),
        _safe_string(parsed["date"]),
        _safe_string(parsed["source_common_name"]),
        _safe_string(parsed["document_identifier"]),
        _safe_string(parsed["source_domain"]),
        _safe_string(parsed["themes"]),
        _safe_string(parsed["persons"]),
        _safe_string(parsed["organizations"]),
        _safe_string(parsed["gcam"]),
        _safe_string(parsed["v2tone"]),
    ]


def _event_stage_row(row: list[str], entry: MasterfileEntry, checksum: str, staged_at: datetime) -> list[str] | None:
    parsed = gdelt._event_row(  # type: ignore[attr-defined]
        row,
        gdelt.source_file_from_url(entry.url),
        checksum,
        entry.published_at,
        staged_at,
    )
    if not parsed:
        return None
    return [
        _safe_string(parsed["source_file"]),
        checksum,
        entry.url,
        entry.published_at.isoformat(),
        staged_at.isoformat(),
        _safe_string(parsed["global_event_id"]),
        _safe_string(parsed["sql_date"]),
        _safe_string(parsed["event_root_code"]),
        _safe_string(parsed["action_geo_country_code"]),
        _safe_string(parsed["goldstein_scale"]),
        _safe_string(parsed["avg_tone"]),
        _safe_string(parsed["source_url"]),
    ]


def _row_to_stage_values(row: list[str], entry: MasterfileEntry, checksum: str, staged_at: datetime) -> list[str] | None:
    if entry.feed_type == "mentions":
        return _mention_stage_row(row, entry, checksum, staged_at)
    if entry.feed_type == "gkg":
        return _gkg_stage_row(row, entry, checksum, staged_at)
    return _event_stage_row(row, entry, checksum, staged_at)


def write_stage_file(entry: MasterfileEntry, payload: bytes, prefix: str) -> PreparedStageFile:
    checksum = entry.source_checksum or gdelt.checksum_bytes(payload)
    staged_at = datetime.now(timezone.utc)
    row_count = 0
    temp_dir = Path(tempfile.mkdtemp(prefix="gdelt-stage-"))
    stage_name = gdelt.source_file_from_url(entry.url).replace(".zip", ".tsv")
    local_path = temp_dir / stage_name

    with local_path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.writer(handle, delimiter="\t", quoting=csv.QUOTE_MINIMAL)
        with zipfile.ZipFile(io.BytesIO(payload)) as archive:
            first_name = archive.namelist()[0]
            with archive.open(first_name, "r") as source_handle:
                text_stream = io.TextIOWrapper(source_handle, encoding="utf-8", errors="replace", newline="")
                reader = csv.reader(text_stream, delimiter="\t")
                for row in reader:
                    if not row:
                        continue
                    staged_row = _row_to_stage_values(row, entry, checksum, staged_at)
                    if not staged_row:
                        continue
                    writer.writerow(staged_row)
                    row_count += 1

    return PreparedStageFile(
        local_path=local_path,
        blob_path=stage_blob_path(entry, prefix),
        source_file=gdelt.source_file_from_url(entry.url),
        source_checksum=checksum,
        row_count=row_count,
        feed_type=entry.feed_type,
        published_at=entry.published_at,
        manifest_url=entry.url,
    )
