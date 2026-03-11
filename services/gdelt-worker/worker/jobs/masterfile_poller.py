from __future__ import annotations

from worker.config import Settings
from worker.jobs import manifest_sync
from worker.models import JobResult


def run(settings: Settings, dry_run: bool = False) -> JobResult:
    return manifest_sync.run(settings, dry_run=dry_run)
