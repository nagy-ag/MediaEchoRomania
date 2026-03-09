from __future__ import annotations

from datetime import datetime, timezone
from urllib.request import urlopen
from uuid import uuid4

from worker.config import Settings
from worker.models import JobResult, MasterfileEntry



def infer_feed_type(url: str) -> str:
    lowered = url.lower()
    if ".mentions." in lowered:
        return "mentions"
    if ".gkg." in lowered:
        return "gkg"
    return "events"



def parse_masterfile(text: str) -> list[MasterfileEntry]:
    entries: list[MasterfileEntry] = []
    for raw_line in text.splitlines():
        line = raw_line.strip()
        if not line:
            continue
        published, size_bytes, url = line.split(maxsplit=2)
        entries.append(
            MasterfileEntry(
                published_at=datetime.strptime(published, "%Y%m%d%H%M%S").replace(tzinfo=timezone.utc),
                size_bytes=int(size_bytes),
                url=url,
                feed_type=infer_feed_type(url),
            )
        )
    return entries



def fetch_masterfile(url: str) -> str:
    with urlopen(url) as response:  # noqa: S310 - GDELT endpoint is an explicit input.
        return response.read().decode("utf-8")



def run(settings: Settings, dry_run: bool = False) -> JobResult:
    request_id = f"masterfile-poller-{uuid4()}"
    masterfile_text = "" if dry_run else fetch_masterfile(settings.gdelt_masterfile_url)
    entries = parse_masterfile(masterfile_text) if masterfile_text else []
    counts = {
        "events": sum(1 for entry in entries if entry.feed_type == "events"),
        "mentions": sum(1 for entry in entries if entry.feed_type == "mentions"),
        "gkg": sum(1 for entry in entries if entry.feed_type == "gkg"),
    }
    return JobResult(
        job_name="masterfile-poller",
        request_id=request_id,
        status="success",
        summary="Discovered masterfile entries and classified them by feed type.",
        business={
            "gdelt_masterfile_url": settings.gdelt_masterfile_url,
            "datasets": settings.datasets.__dict__,
            "entry_counts": counts,
            "dry_run": dry_run,
        },
        performance={
            "entries_seen": len(entries),
        },
    )