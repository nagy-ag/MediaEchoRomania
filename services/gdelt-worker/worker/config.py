from __future__ import annotations

import json
import os
from dataclasses import dataclass
from pathlib import Path

from worker.models import DatasetNames


@dataclass(frozen=True)
class Settings:
    gdelt_masterfile_url: str
    gcp_project_id: str
    gcp_location: str
    datasets: DatasetNames
    worker_env: str
    deployment_platform: str
    worker_batch_size: int
    poll_lookback_minutes: int
    live_sync_lookback_minutes: int
    convex_url: str
    repair_window_hours: int
    recent_serving_window_hours: int
    backfill_start_date: str
    backfill_end_date: str
    backfill_batch_granularity: str
    outlet_registry_table: str
    outlet_alias_table: str
    domain_review_table: str
    freshness_table: str
    backfill_runs_table: str
    backfill_steps_table: str
    file_manifest_table: str
    file_manifest_buffer_table: str
    load_audit_table: str
    gcs_stage_bucket: str
    gcs_stage_prefix: str
    job_stale_after_minutes: int
    seed_outlets_path: Path


def parse_service_account() -> dict[str, str] | None:
    raw = os.getenv("GCP_SERVICE_ACCOUNT_JSON", "").strip()
    if not raw:
        return None
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return None


def resolve_seed_outlets_path(default_path: Path) -> Path:
    configured = os.getenv("WORKER_SEED_OUTLETS_PATH", "").strip()
    if not configured:
        return default_path
    return Path(configured)


def load_settings() -> Settings:
    seed_path = Path(__file__).resolve().parent / "seeds" / "romanian_outlets.json"
    parse_service_account()
    return Settings(
        gdelt_masterfile_url=os.getenv("GDELT_MASTERFILE_URL", "http://data.gdeltproject.org/gdeltv2/masterfilelist.txt"),
        gcp_project_id=os.getenv("GCP_PROJECT_ID", "media-echo-romania"),
        gcp_location=os.getenv("GCP_LOCATION", "EU"),
        datasets=DatasetNames(
            stage=os.getenv("BQ_DATASET_STAGE", "gdelt_stage"),
            raw=os.getenv("BQ_DATASET_RAW", "gdelt_raw"),
            norm=os.getenv("BQ_DATASET_NORM", "gdelt_norm"),
            derived=os.getenv("BQ_DATASET_DERIVED", "gdelt_derived"),
            serving=os.getenv("BQ_DATASET_SERVING", "gdelt_serving"),
            ops=os.getenv("BQ_DATASET_OPS", "gdelt_ops"),
        ),
        worker_env=os.getenv("WORKER_ENV", "development"),
        deployment_platform=os.getenv("DEPLOYMENT_PLATFORM", os.getenv("RAILWAY_ENVIRONMENT_NAME", "gcp")),
        worker_batch_size=int(os.getenv("WORKER_BATCH_SIZE", "128")),
        poll_lookback_minutes=int(os.getenv("WORKER_POLL_LOOKBACK_MINUTES", "180")),
        live_sync_lookback_minutes=int(os.getenv("LIVE_SYNC_LOOKBACK_MINUTES", os.getenv("WORKER_POLL_LOOKBACK_MINUTES", "180"))),
        convex_url=os.getenv("NEXT_PUBLIC_CONVEX_URL", ""),
        repair_window_hours=int(os.getenv("WORKER_REPAIR_WINDOW_HOURS", "72")),
        recent_serving_window_hours=int(os.getenv("WORKER_RECENT_SERVING_WINDOW_HOURS", "168")),
        backfill_start_date=os.getenv("WORKER_BACKFILL_START_DATE", "2015-01-01"),
        backfill_end_date=os.getenv("WORKER_BACKFILL_END_DATE", ""),
        backfill_batch_granularity=os.getenv("BACKFILL_BATCH_GRANULARITY", "day"),
        outlet_registry_table=os.getenv("BQ_OUTLET_REGISTRY_TABLE", "outlets_norm"),
        outlet_alias_table=os.getenv("BQ_OUTLET_ALIAS_TABLE", "outlet_domain_aliases"),
        domain_review_table=os.getenv("BQ_DOMAIN_REVIEW_TABLE", "domain_review_queue"),
        freshness_table=os.getenv("BQ_FRESHNESS_TABLE", "freshness_watermarks"),
        backfill_runs_table=os.getenv("BQ_BACKFILL_RUNS_TABLE", "backfill_runs"),
        backfill_steps_table=os.getenv("BQ_BACKFILL_STEPS_TABLE", "backfill_steps"),
        file_manifest_table=os.getenv("BQ_FILE_MANIFEST_TABLE", "file_manifest"),
        file_manifest_buffer_table=os.getenv("BQ_FILE_MANIFEST_BUFFER_TABLE", "file_manifest_buffer"),
        load_audit_table=os.getenv("BQ_LOAD_AUDIT_TABLE", "load_audit"),
        gcs_stage_bucket=os.getenv("GCS_GDELT_STAGE_BUCKET", ""),
        gcs_stage_prefix=os.getenv("GCS_GDELT_STAGE_PREFIX", "gdelt-stage"),
        job_stale_after_minutes=int(os.getenv("WORKER_JOB_STALE_AFTER_MINUTES", "30")),
        seed_outlets_path=resolve_seed_outlets_path(seed_path),
    )
