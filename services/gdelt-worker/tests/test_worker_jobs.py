import unittest
from unittest.mock import patch

from worker.jobs.backfill_worker import run as run_backfill_worker


class WorkerJobTests(unittest.TestCase):
    def test_backfill_worker_delegates_to_stage_range_pipeline(self) -> None:
        fake_settings = type("Settings", (), {"backfill_start_date": "2015-01-01", "backfill_end_date": "2026-03-11"})()
        fake_result = object()

        with patch("worker.jobs.backfill_worker.stage_range.run", return_value=fake_result) as stage_run:
            result = run_backfill_worker(fake_settings, start_date="2026-01-01", end_date="2026-03-10")

        self.assertIs(result, fake_result)
        stage_run.assert_called_once()


if __name__ == "__main__":
    unittest.main()
