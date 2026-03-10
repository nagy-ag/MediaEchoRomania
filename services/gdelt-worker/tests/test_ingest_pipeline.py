import unittest
from datetime import datetime, timezone
from unittest.mock import patch

from worker.ingest_pipeline import ingest_entries
from worker.models import MasterfileEntry, ParsedFeedBatch


class _FakeSettings:
    class datasets:
        raw = "gdelt_raw"


class _FakeWarehouse:
    def __init__(self, duplicate: bool = False) -> None:
        self.duplicate = duplicate
        self.registry_updates: list[tuple[str, str, str | None, int]] = []
        self.raw_file_loads = 0

    def approved_domain_rows(self):
        return [{"alias_domain": "hotnews.ro", "review_status": "approved"}]

    def raw_file_already_loaded(self, source_file: str, checksum: str) -> bool:
        return self.duplicate

    def append_event_universe(self, *args, **kwargs):
        return 0

    def append_discovery_domains(self, *args, **kwargs):
        return 0

    def load_rows(self, dataset, table, rows):
        if table == "raw_files":
            self.raw_file_loads += 1
        return len(rows)

    def update_ingest_registry(self, source_file, status, checksum, rows_loaded, error_message=None):
        self.registry_updates.append((source_file, status, checksum, rows_loaded))

    def record_ingest_error(self, *args, **kwargs):
        return None


class IngestPipelineTests(unittest.TestCase):
    def test_duplicate_files_are_skipped_before_raw_loads(self) -> None:
        entry = MasterfileEntry(
            published_at=datetime(2026, 3, 10, 12, 0, tzinfo=timezone.utc),
            size_bytes=123,
            url="http://data.gdeltproject.org/gdeltv2/20260310120000.mentions.CSV.zip",
            feed_type="mentions",
        )
        batch = ParsedFeedBatch(
            feed_type="mentions",
            rows=[{"global_event_id": 1}],
            discovered_domains=set(),
            accepted_event_ids={1},
            checksum="abc123",
            processed_rows=1,
            rejected_rows=0,
        )
        warehouse = _FakeWarehouse(duplicate=True)

        with patch("worker.ingest_pipeline.fetch_bytes", return_value=b"zip"), patch(
            "worker.ingest_pipeline.parse_feed_batch", return_value=batch
        ):
            stats = ingest_entries(_FakeSettings(), warehouse, [entry], scope="continuous", recent_event_ids=set(), update_registry=True)

        self.assertEqual(stats["duplicate_files"], 1)
        self.assertEqual(stats["rows_loaded"], 0)
        self.assertEqual(warehouse.raw_file_loads, 0)
        self.assertEqual(warehouse.registry_updates[0], ("20260310120000.mentions.CSV.zip", "downloaded", "abc123", 0))


if __name__ == "__main__":
    unittest.main()
