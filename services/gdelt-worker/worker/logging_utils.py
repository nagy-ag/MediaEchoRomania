from __future__ import annotations

import json
import os
from typing import Any

from worker.models import JobResult


def emit_job_event(result: JobResult) -> None:
    payload: dict[str, Any] = {
        "event": result.job_name,
        "request": {
            "request_id": result.request_id,
            "job_name": result.job_name,
        },
        "infrastructure": {
            "service": "gdelt-worker",
            "deployment_platform": os.getenv("DEPLOYMENT_PLATFORM", os.getenv("RAILWAY_ENVIRONMENT_NAME", "gcp")),
            "environment": os.getenv("WORKER_ENV", "development"),
            "region": os.getenv("GOOGLE_CLOUD_REGION", os.getenv("RAILWAY_REGION", "local")),
            "git_commit": os.getenv("RAILWAY_GIT_COMMIT_SHA") or os.getenv("GIT_COMMIT", "local"),
            "github_branch": os.getenv("RAILWAY_GIT_BRANCH") or os.getenv("GITHUB_REF_NAME", "local"),
            "github_run_id": os.getenv("GITHUB_RUN_ID", "local"),
            "deployment_id": os.getenv("RAILWAY_DEPLOYMENT_ID") or os.getenv("K_REVISION", "local"),
        },
        "business": result.business,
        "performance": result.performance,
        "outcome": {
            "status": result.status,
        },
        "summary": result.summary,
    }
    print(json.dumps(payload, sort_keys=True))
