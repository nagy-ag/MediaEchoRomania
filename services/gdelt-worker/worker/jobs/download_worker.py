from __future__ import annotations

from worker.config import Settings
from worker.jobs import live_range
from worker.models import JobResult


def run(settings: Settings) -> JobResult:
    return live_range.run(settings)
