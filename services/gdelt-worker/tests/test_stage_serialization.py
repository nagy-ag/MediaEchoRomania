import unittest
from datetime import datetime, timezone
from pathlib import Path

from worker.models import MasterfileEntry
from worker.stage_serialization import STAGE_COLUMNS, stage_blob_path, write_stage_file


class StageSerializationTests(unittest.TestCase):
    def test_stage_blob_path_uses_feed_and_calendar_partitions(self) -> None:
        entry = MasterfileEntry(
            published_at=datetime(2026, 3, 11, 10, 15, tzinfo=timezone.utc),
            size_bytes=123,
            url="http://data.gdeltproject.org/gdeltv2/20260311101500.mentions.CSV.zip",
            feed_type="mentions",
            source_checksum="abc",
        )
        self.assertEqual(
            stage_blob_path(entry, "gdelt-stage"),
            "gdelt-stage/feed=mentions/year=2026/month=03/day=11/20260311101500.mentions.CSV.tsv",
        )

    def test_stage_columns_exist_for_all_feeds(self) -> None:
        self.assertEqual(set(STAGE_COLUMNS.keys()), {"mentions", "gkg", "events"})


if __name__ == "__main__":
    unittest.main()
