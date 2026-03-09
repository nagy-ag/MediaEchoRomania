from __future__ import annotations

import json
import os
from dataclasses import dataclass

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
    convex_url: str



def _parse_service_account() -> dict[str, str] | None:
    raw = os.getenv("GCP_SERVICE_ACCOUNT_JSON", "").strip()
    if not raw:
        return None
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return None



def load_settings() -> Settings:
    _parse_service_account()
    return Settings(
        gdelt_masterfile_url=os.getenv("GDELT_MASTERFILE_URL", "http://data.gdeltproject.org/gdeltv2/masterfilelist.txt"),
        gcp_project_id=os.getenv("GCP_PROJECT_ID", "media-echo-romania"),
        gcp_location=os.getenv("GCP_LOCATION", "EU"),
        datasets=DatasetNames(
            raw=os.getenv("BQ_DATASET_RAW", "gdelt_raw"),
            norm=os.getenv("BQ_DATASET_NORM", "gdelt_norm"),
            derived=os.getenv("BQ_DATASET_DERIVED", "gdelt_derived"),
            serving=os.getenv("BQ_DATASET_SERVING", "gdelt_serving"),
            ops=os.getenv("BQ_DATASET_OPS", "gdelt_ops"),
        ),
        worker_env=os.getenv("WORKER_ENV", "development"),
        deployment_platform=os.getenv("RAILWAY_ENVIRONMENT_NAME", "railway"),
        worker_batch_size=int(os.getenv("WORKER_BATCH_SIZE", "128")),
        poll_lookback_minutes=int(os.getenv("WORKER_POLL_LOOKBACK_MINUTES", "180")),
        convex_url=os.getenv("NEXT_PUBLIC_CONVEX_URL", ""),
    )