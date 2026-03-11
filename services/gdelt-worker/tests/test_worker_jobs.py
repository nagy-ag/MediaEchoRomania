import unittest
from unittest.mock import patch

from worker.jobs.backfill_worker import _progress_message, _tracker_status
from worker.jobs.download_worker import run as run_download_worker


class WorkerJobTests(unittest.TestCase):
    def test_tracker_status_marks_errors_as_partial(self) -> None:
        self.assertEqual(_tracker_status({"errors": 0}), "loaded")
        self.assertEqual(_tracker_status({"errors": 1}), "partial")

    def test_progress_message_tracks_month_completion(self) -> None:
        self.assertEqual(
            _progress_message(0, 3, "2026-03"),
            "processed 0/3 month windows (latest: 2026-03)",
        )
        self.assertEqual(
            _progress_message(2, 3, "2026-02"),
            "processed 2/3 month windows (latest: 2026-02)",
        )

    def test_download_worker_returns_error_status_when_file_errors_exist(self) -> None:
        fake_settings = type(
            "Settings",
            (),
            {
                "datasets": type("Datasets", (), {"raw": "gdelt_raw", "ops": "gdelt_ops"})(),
                "repair_window_hours": 72,
                "worker_batch_size": 128,
            },
        )()

        with patch("worker.jobs.download_worker.BigQueryService") as warehouse_cls, patch(
            "worker.jobs.download_worker.ingest_entries",
            return_value={
                "files_seen": 1,
                "rows_loaded": 0,
                "rows_rejected": 0,
                "discovered_domains": 0,
                "accepted_event_ids": 0,
                "errors": 1,
                "duplicate_files": 0,
            },
        ):
            warehouse = warehouse_cls.return_value
            warehouse.list_pending_entries.return_value = []
            warehouse.recent_event_ids.return_value = set()
            result = run_download_worker(fake_settings)

        self.assertEqual(result.status, "error")


if __name__ == "__main__":
    unittest.main()
