from __future__ import annotations

from dataclasses import asdict, dataclass, field
from datetime import date, datetime
from typing import Any, Literal

FeedType = Literal["events", "mentions", "gkg"]
JobStatus = Literal["success", "error"]


@dataclass(frozen=True)
class MasterfileEntry:
    published_at: datetime
    size_bytes: int
    url: str
    feed_type: FeedType
    source_checksum: str = ""


@dataclass(frozen=True)
class DatasetNames:
    raw: str
    norm: str
    derived: str
    serving: str
    ops: str


@dataclass(frozen=True)
class BackfillWindow:
    month_key: str
    start_date: date
    end_date: date


@dataclass(frozen=True)
class ParsedFeedBatch:
    feed_type: FeedType
    rows: list[dict[str, Any]]
    discovered_domains: set[str]
    accepted_event_ids: set[int]
    checksum: str
    processed_rows: int
    rejected_rows: int


@dataclass
class JobResult:
    job_name: str
    request_id: str
    status: JobStatus
    summary: str
    business: dict[str, Any] = field(default_factory=dict)
    performance: dict[str, Any] = field(default_factory=dict)
    started_at: str = ""
    finished_at: str = ""

    def asdict(self) -> dict[str, Any]:
        payload = asdict(self)
        payload["generated_at"] = self.finished_at or datetime.utcnow().isoformat() + "Z"
        return payload
