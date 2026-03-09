from __future__ import annotations

import argparse

from worker.config import load_settings
from worker.jobs import alert_worker, brief_generator, download_worker, masterfile_poller, normalizer, rollup_worker
from worker.logging_utils import emit_job_event

COMMANDS = {
    "masterfile-poller": lambda settings, args: masterfile_poller.run(settings, dry_run=args.dry_run),
    "download-worker": lambda settings, args: download_worker.run(settings),
    "normalizer": lambda settings, args: normalizer.run(settings),
    "rollup-worker": lambda settings, args: rollup_worker.run(settings),
    "brief-generator": lambda settings, args: brief_generator.run(settings),
    "alert-worker": lambda settings, args: alert_worker.run(settings),
}



def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Media Echo Romania Railway worker")
    subparsers = parser.add_subparsers(dest="command", required=True)

    for name in COMMANDS:
        subparser = subparsers.add_parser(name)
        if name == "masterfile-poller":
            subparser.add_argument("--dry-run", action="store_true")

    return parser



def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    settings = load_settings()
    result = COMMANDS[args.command](settings, args)
    emit_job_event(result)
    return 0 if result.status == "success" else 1