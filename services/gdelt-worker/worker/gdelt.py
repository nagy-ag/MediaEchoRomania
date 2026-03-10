from __future__ import annotations

import csv
import hashlib
import io
import zipfile
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Iterable
from urllib.parse import urlparse
from urllib.request import urlopen

from worker.models import BackfillWindow, FeedType, MasterfileEntry, ParsedFeedBatch

EVENT_ID_INDEX = 0
EVENT_DATE_INDEX = 1
EVENT_ROOT_CODE_INDEX = 28
GOLDSTEIN_INDEX = 30
AVG_TONE_INDEX = 34
ACTION_GEO_COUNTRY_CODE_INDEX = 51
EVENT_SOURCE_URL_INDEX = 57

MENTION_TIME_INDEX = 1
MENTION_TYPE_INDEX = 2
MENTION_SOURCE_NAME_INDEX = 3
MENTION_IDENTIFIER_INDEX = 4
MENTION_CONFIDENCE_INDEX = 10
MENTION_DOC_TONE_INDEX = 12

GKG_RECORD_ID_INDEX = 0
GKG_DATE_INDEX = 1
GKG_SOURCE_COMMON_NAME_INDEX = 3
GKG_DOCUMENT_IDENTIFIER_INDEX = 4
GKG_THEMES_INDEX = 7
GKG_PERSONS_INDEX = 11
GKG_ORGANIZATIONS_INDEX = 13
GKG_V2TONE_INDEX = 15
GKG_GCAM_INDEX = 17

FEED_PRIORITY: dict[FeedType, int] = {
    "mentions": 0,
    "gkg": 1,
    "events": 2,
}


def infer_feed_type(url: str) -> FeedType:
    lowered = url.lower()
    if ".mentions." in lowered:
        return "mentions"
    if ".gkg." in lowered:
        return "gkg"
    return "events"


def source_file_from_url(url: str) -> str:
    return Path(urlparse(url).path).name


def normalize_domain(value: str) -> str:
    candidate = value.strip().lower()
    if not candidate:
        return ""
    if "://" not in candidate:
        candidate = f"https://{candidate}"
    parsed = urlparse(candidate)
    domain = parsed.netloc or parsed.path
    domain = domain.lower()
    if domain.startswith("www."):
        domain = domain[4:]
    return domain.strip("/")


def parse_timestamp(value: str) -> datetime:
    return datetime.strptime(value, "%Y%m%d%H%M%S").replace(tzinfo=timezone.utc)


def parse_date(value: str) -> str:
    return datetime.strptime(value, "%Y%m%d").date().isoformat()


def parse_masterfile(text: str) -> list[MasterfileEntry]:
    entries: list[MasterfileEntry] = []
    for raw_line in text.splitlines():
        line = raw_line.strip()
        if not line:
            continue
        published, size_bytes, url = line.split(maxsplit=2)
        entries.append(
            MasterfileEntry(
                published_at=parse_timestamp(published),
                size_bytes=int(size_bytes),
                url=url,
                feed_type=infer_feed_type(url),
            )
        )
    return entries


def filter_entries_by_lookback(
    entries: Iterable[MasterfileEntry],
    lookback_minutes: int,
    now: datetime | None = None,
) -> list[MasterfileEntry]:
    reference = now or datetime.now(timezone.utc)
    floor = reference - timedelta(minutes=lookback_minutes)
    return [entry for entry in entries if entry.published_at >= floor]


def sort_entries_for_ingest(entries: Iterable[MasterfileEntry]) -> list[MasterfileEntry]:
    return sorted(entries, key=lambda entry: (entry.published_at, FEED_PRIORITY[entry.feed_type], entry.url))


def build_backfill_windows(start_date: str, end_date: str, newest_first: bool = True) -> list[BackfillWindow]:
    start = datetime.strptime(start_date, "%Y-%m-%d").date().replace(day=1)
    end_value = datetime.utcnow().date() if not end_date else datetime.strptime(end_date, "%Y-%m-%d").date()
    cursor = end_value.replace(day=1)
    windows: list[BackfillWindow] = []
    while cursor >= start:
        if cursor.month == 12:
            next_month = cursor.replace(year=cursor.year + 1, month=1, day=1)
        else:
            next_month = cursor.replace(month=cursor.month + 1, day=1)
        windows.append(
            BackfillWindow(
                month_key=cursor.strftime("%Y-%m"),
                start_date=cursor,
                end_date=next_month,
            )
        )
        if cursor.month == 1:
            cursor = cursor.replace(year=cursor.year - 1, month=12, day=1)
        else:
            cursor = cursor.replace(month=cursor.month - 1, day=1)
    if not newest_first:
        windows.reverse()
    return windows


def filter_entries_for_window(entries: Iterable[MasterfileEntry], window: BackfillWindow) -> list[MasterfileEntry]:
    window_start = datetime.combine(window.start_date, datetime.min.time(), tzinfo=timezone.utc)
    window_end = datetime.combine(window.end_date, datetime.min.time(), tzinfo=timezone.utc)
    return [entry for entry in entries if window_start <= entry.published_at < window_end]


def fetch_text(url: str) -> str:
    with urlopen(url) as response:  # noqa: S310 - GDELT endpoint is an explicit input.
        return response.read().decode("utf-8")


def fetch_bytes(url: str) -> bytes:
    with urlopen(url) as response:  # noqa: S310 - GDELT endpoint is an explicit input.
        return response.read()


def checksum_bytes(payload: bytes) -> str:
    return hashlib.sha256(payload).hexdigest()


def iter_tsv_rows(payload: bytes) -> Iterable[list[str]]:
    with zipfile.ZipFile(io.BytesIO(payload)) as archive:
        first_name = archive.namelist()[0]
        with archive.open(first_name, "r") as handle:
            text_stream = io.TextIOWrapper(handle, encoding="utf-8", errors="replace", newline="")
            reader = csv.reader(text_stream, delimiter="\t")
            for row in reader:
                if row:
                    yield row


def _safe_float(value: str) -> float | None:
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _safe_int(value: str) -> int | None:
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def _mention_row(
    row: list[str],
    source_file: str,
    checksum: str,
    published_at: datetime,
    ingested_at: datetime,
) -> dict[str, object] | None:
    if len(row) <= MENTION_DOC_TONE_INDEX:
        return None
    global_event_id = _safe_int(row[EVENT_ID_INDEX])
    if global_event_id is None:
        return None
    source_url = row[MENTION_IDENTIFIER_INDEX].strip()
    source_domain = normalize_domain(source_url or row[MENTION_SOURCE_NAME_INDEX])
    mention_time = parse_timestamp(row[MENTION_TIME_INDEX])
    return {
        "source_file": source_file,
        "checksum": checksum,
        "published_at": published_at.isoformat(),
        "ingested_at": ingested_at.isoformat(),
        "global_event_id": global_event_id,
        "mention_time": mention_time.isoformat(),
        "mention_type": row[MENTION_TYPE_INDEX],
        "source_name": row[MENTION_SOURCE_NAME_INDEX],
        "source_domain": source_domain,
        "source_url": source_url,
        "confidence": _safe_int(row[MENTION_CONFIDENCE_INDEX]),
        "mention_doc_tone": _safe_float(row[MENTION_DOC_TONE_INDEX]),
    }


def _gkg_row(
    row: list[str],
    source_file: str,
    checksum: str,
    published_at: datetime,
    ingested_at: datetime,
) -> dict[str, object] | None:
    if len(row) <= GKG_GCAM_INDEX:
        return None
    source_url = row[GKG_DOCUMENT_IDENTIFIER_INDEX].strip()
    source_domain = normalize_domain(source_url or row[GKG_SOURCE_COMMON_NAME_INDEX])
    timestamp = parse_timestamp(row[GKG_DATE_INDEX])
    return {
        "source_file": source_file,
        "checksum": checksum,
        "published_at": published_at.isoformat(),
        "ingested_at": ingested_at.isoformat(),
        "gkg_record_id": row[GKG_RECORD_ID_INDEX],
        "date": timestamp.isoformat(),
        "source_common_name": row[GKG_SOURCE_COMMON_NAME_INDEX],
        "source_domain": source_domain,
        "document_identifier": source_url,
        "themes": row[GKG_THEMES_INDEX],
        "persons": row[GKG_PERSONS_INDEX],
        "organizations": row[GKG_ORGANIZATIONS_INDEX],
        "gcam": row[GKG_GCAM_INDEX],
        "v2tone": row[GKG_V2TONE_INDEX],
    }


def _event_row(
    row: list[str],
    source_file: str,
    checksum: str,
    published_at: datetime,
    ingested_at: datetime,
) -> dict[str, object] | None:
    if len(row) <= EVENT_SOURCE_URL_INDEX:
        return None
    global_event_id = _safe_int(row[EVENT_ID_INDEX])
    if global_event_id is None:
        return None
    return {
        "source_file": source_file,
        "checksum": checksum,
        "published_at": published_at.isoformat(),
        "ingested_at": ingested_at.isoformat(),
        "global_event_id": global_event_id,
        "sql_date": parse_date(row[EVENT_DATE_INDEX]),
        "event_root_code": row[EVENT_ROOT_CODE_INDEX],
        "action_geo_country_code": row[ACTION_GEO_COUNTRY_CODE_INDEX],
        "goldstein_scale": _safe_float(row[GOLDSTEIN_INDEX]),
        "avg_tone": _safe_float(row[AVG_TONE_INDEX]),
        "source_url": row[EVENT_SOURCE_URL_INDEX],
    }


def parse_feed_batch(
    entry: MasterfileEntry,
    payload: bytes,
    allowed_domains: set[str],
    accepted_event_ids: set[int] | None = None,
) -> ParsedFeedBatch:
    ingested_at = datetime.now(timezone.utc)
    source_file = source_file_from_url(entry.url)
    checksum = checksum_bytes(payload)
    rows: list[dict[str, object]] = []
    discovered_domains: set[str] = set()
    accepted_ids: set[int] = set()
    processed_rows = 0
    rejected_rows = 0
    accepted_event_ids = accepted_event_ids or set()

    for row in iter_tsv_rows(payload):
        processed_rows += 1
        if entry.feed_type == "mentions":
            parsed = _mention_row(row, source_file, checksum, entry.published_at, ingested_at)
            if not parsed:
                rejected_rows += 1
                continue
            domain = str(parsed["source_domain"])
            if domain in allowed_domains:
                rows.append(parsed)
                accepted_ids.add(int(parsed["global_event_id"]))
            else:
                rejected_rows += 1
                if domain:
                    discovered_domains.add(domain)
        elif entry.feed_type == "gkg":
            parsed = _gkg_row(row, source_file, checksum, entry.published_at, ingested_at)
            if not parsed:
                rejected_rows += 1
                continue
            domain = str(parsed["source_domain"])
            if domain in allowed_domains:
                rows.append(parsed)
            else:
                rejected_rows += 1
                if domain:
                    discovered_domains.add(domain)
        else:
            parsed = _event_row(row, source_file, checksum, entry.published_at, ingested_at)
            if not parsed:
                rejected_rows += 1
                continue
            if int(parsed["global_event_id"]) in accepted_event_ids:
                rows.append(parsed)
            else:
                rejected_rows += 1

    return ParsedFeedBatch(
        feed_type=entry.feed_type,
        rows=rows,
        discovered_domains=discovered_domains,
        accepted_event_ids=accepted_ids,
        checksum=checksum,
        processed_rows=processed_rows,
        rejected_rows=rejected_rows,
    )
