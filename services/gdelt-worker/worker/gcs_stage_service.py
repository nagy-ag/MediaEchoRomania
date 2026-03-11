from __future__ import annotations

from pathlib import Path
from typing import Any

from worker.config import Settings, parse_service_account


class GcsStageService:
    def __init__(self, settings: Settings, client: Any | None = None) -> None:
        self.settings = settings
        self.client = client or self._build_client()

    def _build_client(self) -> Any:
        from google.cloud import storage
        from google.oauth2 import service_account

        service_account_info = parse_service_account()
        if service_account_info:
            credentials = service_account.Credentials.from_service_account_info(service_account_info)
            return storage.Client(project=self.settings.gcp_project_id, credentials=credentials)
        return storage.Client(project=self.settings.gcp_project_id)

    def _blob(self, blob_path: str) -> Any:
        return self.client.bucket(self.settings.gcs_stage_bucket).blob(blob_path)

    def blob_exists(self, blob_path: str) -> bool:
        return self._blob(blob_path).exists()

    def upload_file(self, local_path: Path, blob_path: str, content_type: str = "text/tab-separated-values") -> str:
        blob = self._blob(blob_path)
        blob.upload_from_filename(str(local_path), content_type=content_type)
        return f"gs://{self.settings.gcs_stage_bucket}/{blob_path}"
