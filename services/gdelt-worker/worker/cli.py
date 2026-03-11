from __future__ import annotations

import argparse

from worker.bigquery_service import BigQueryService
from worker.config import load_settings
from worker.jobs import (
    alert_worker,
    backfill_worker,
    brief_generator,
    download_worker,
    live_range,
    manifest_sync,
    masterfile_poller,
    normalizer,
    rollup_worker,
    stage_range,
)
from worker.logging_utils import emit_job_event

COMMANDS = {
    "masterfile-poller": lambda settings, args: masterfile_poller.run(settings, dry_run=args.dry_run),
    "download-worker": lambda settings, args: download_worker.run(settings),
    "normalizer": lambda settings, args: normalizer.run(settings),
    "rollup-worker": lambda settings, args: rollup_worker.run(settings),
    "brief-generator": lambda settings, args: brief_generator.run(settings),
    "alert-worker": lambda settings, args: alert_worker.run(settings),
    "backfill-worker": lambda settings, args: backfill_worker.run(
        settings,
        start_date=args.start_date,
        end_date=args.end_date,
        max_months=args.max_months,
    ),
    "manifest-sync": lambda settings, args: manifest_sync.run(settings, dry_run=args.dry_run),
    "stage-range": lambda settings, args: stage_range.run(
        settings,
        start_date=args.start_date,
        end_date=args.end_date,
        scope=args.scope,
        refresh_downstream=not args.skip_refresh,
    ),
    "live-range": lambda settings, args: live_range.run(settings),
}


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Media Echo Romania GCP-oriented worker")
    subparsers = parser.add_subparsers(dest="command", required=True)

    for name in COMMANDS:
        subparser = subparsers.add_parser(name)
        if name in {"masterfile-poller", "manifest-sync"}:
            subparser.add_argument("--dry-run", action="store_true")
        if name == "backfill-worker":
            subparser.add_argument("--start-date")
            subparser.add_argument("--end-date")
            subparser.add_argument("--max-months", type=int)
        if name == "stage-range":
            subparser.add_argument("--start-date", required=True)
            subparser.add_argument("--end-date", required=True)
            subparser.add_argument("--scope", choices=["live", "backfill"], default="backfill")
            subparser.add_argument("--skip-refresh", action="store_true")

    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    settings = load_settings()
    result = COMMANDS[args.command](settings, args)
    emit_job_event(result)
    if args.command not in {"masterfile-poller", "manifest-sync"} or not getattr(args, "dry_run", False):
        warehouse = BigQueryService(settings)
        warehouse.ensure_warehouse()
        warehouse.record_job_result(result)
    return 0 if result.status == "success" else 1


if __name__ == "__main__":
    raise SystemExit(main())
