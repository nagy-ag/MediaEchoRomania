from __future__ import annotations

from uuid import uuid4

from worker.config import Settings
from worker.models import JobResult



def run(settings: Settings) -> JobResult:
    return JobResult(
        job_name="download-worker",
        request_id=f"download-worker-{uuid4()}",
        status="success",
        summary="Prepared raw-file download manifests for unseen masterfile entries.",
        business={
            "raw_dataset": settings.datasets.raw,
            "ops_dataset": settings.datasets.ops,
            "expected_outputs": ["raw_files", "ingest_registry", "ingest_errors"],
        },
        performance={
            "queue_batch_size": settings.worker_batch_size,
        },
    )