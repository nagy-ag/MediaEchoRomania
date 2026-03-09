from __future__ import annotations

from dataclasses import asdict, dataclass, field
from datetime import datetime
from typing import Any, Literal

FeedType = Literal["events", "mentions", "gkg"]


@dataclass(frozen=True)
class MasterfileEntry:
    published_at: datetime
    size_bytes: int
    url: str
    feed_type: FeedType


@dataclass(frozen=True)
class DatasetNames:
    raw: str
    norm: str
    derived: str
    serving: str
    ops: str


@dataclass
class JobResult:
    job_name: str
    request_id: str
    status: Literal["success", "error"]
    summary: str
    business: dict[str, Any] = field(default_factory=dict)
    performance: dict[str, Any] = field(default_factory=dict)

    def asdict(self) -> dict[str, Any]:
        payload = asdict(self)
        payload["generated_at"] = datetime.utcnow().isoformat() + "Z"
        return payload