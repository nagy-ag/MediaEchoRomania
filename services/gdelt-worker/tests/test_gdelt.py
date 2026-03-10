import io
import unittest
import zipfile
from datetime import datetime, timezone

from worker.gdelt import build_backfill_windows, normalize_domain, parse_feed_batch, parse_masterfile
from worker.models import MasterfileEntry


class GdeltHelpersTests(unittest.TestCase):
    def _zip_payload(self, filename: str, body: str) -> bytes:
        buffer = io.BytesIO()
        with zipfile.ZipFile(buffer, mode="w", compression=zipfile.ZIP_DEFLATED) as archive:
            archive.writestr(filename, body)
        return buffer.getvalue()

    def test_normalize_domain_handles_urls_and_www(self) -> None:
        self.assertEqual(normalize_domain("https://www.hotnews.ro/article"), "hotnews.ro")
        self.assertEqual(normalize_domain("www.digi24.ro"), "digi24.ro")
        self.assertEqual(normalize_domain(""), "")

    def test_build_backfill_windows_is_newest_first(self) -> None:
        windows = build_backfill_windows("2025-01-01", "2025-03-15")
        self.assertEqual([window.month_key for window in windows], ["2025-03", "2025-02", "2025-01"])

    def test_parse_masterfile_skips_malformed_lines(self) -> None:
        entries = parse_masterfile(
            "123 297a16b493de7cf6ca809a7cc31d0b93 http://data.gdeltproject.org/gdeltv2/20260309083000.export.CSV.zip\n"
            "150383 http://data.gdeltproject.org/gdeltv2/bad-line.export.CSV.zip\n"
            "not-a-size 123 http://data.gdeltproject.org/gdeltv2/also-bad.export.CSV.zip"
        )
        self.assertEqual(len(entries), 1)
        self.assertEqual(entries[0].feed_type, "events")
        self.assertEqual(entries[0].source_checksum, "297a16b493de7cf6ca809a7cc31d0b93")

    def test_parse_feed_batch_filters_mentions_to_allowed_domains(self) -> None:
        row_allowed = [""] * 13
        row_allowed[0] = "101"
        row_allowed[1] = "20260309083000"
        row_allowed[2] = "1"
        row_allowed[3] = "HotNews"
        row_allowed[4] = "https://www.hotnews.ro/story"
        row_allowed[10] = "90"
        row_allowed[12] = "1.5"

        row_blocked = [""] * 13
        row_blocked[0] = "202"
        row_blocked[1] = "20260309083000"
        row_blocked[2] = "1"
        row_blocked[3] = "Unknown"
        row_blocked[4] = "https://unknown.example/story"
        row_blocked[10] = "50"
        row_blocked[12] = "-2.0"

        payload = self._zip_payload("mentions.tsv", "\n".join(["\t".join(row_allowed), "\t".join(row_blocked)]))
        entry = MasterfileEntry(
            published_at=datetime(2026, 3, 9, 8, 45, tzinfo=timezone.utc),
            size_bytes=len(payload),
            url="http://data.gdeltproject.org/gdeltv2/20260309084500.mentions.CSV.zip",
            feed_type="mentions",
        )

        batch = parse_feed_batch(entry, payload, {"hotnews.ro"})
        self.assertEqual(len(batch.rows), 1)
        self.assertEqual(batch.accepted_event_ids, {101})
        self.assertEqual(batch.discovered_domains, {"unknown.example"})
        self.assertEqual(batch.rejected_rows, 1)

    def test_parse_feed_batch_filters_events_to_known_event_ids(self) -> None:
        row_allowed = [""] * 58
        row_allowed[0] = "101"
        row_allowed[1] = "20260309"
        row_allowed[28] = "14"
        row_allowed[30] = "3.5"
        row_allowed[34] = "1.0"
        row_allowed[51] = "RO"
        row_allowed[57] = "https://hotnews.ro/story"

        row_blocked = [""] * 58
        row_blocked[0] = "202"
        row_blocked[1] = "20260309"
        row_blocked[28] = "14"
        row_blocked[30] = "1.5"
        row_blocked[34] = "-1.0"
        row_blocked[51] = "RO"
        row_blocked[57] = "https://unknown.example/story"

        payload = self._zip_payload("events.tsv", "\n".join(["\t".join(row_allowed), "\t".join(row_blocked)]))
        entry = MasterfileEntry(
            published_at=datetime(2026, 3, 9, 8, 30, tzinfo=timezone.utc),
            size_bytes=len(payload),
            url="http://data.gdeltproject.org/gdeltv2/20260309083000.export.CSV.zip",
            feed_type="events",
        )

        batch = parse_feed_batch(entry, payload, set(), accepted_event_ids={101})
        self.assertEqual(len(batch.rows), 1)
        self.assertEqual(batch.rows[0]["global_event_id"], 101)
        self.assertEqual(batch.rejected_rows, 1)


if __name__ == "__main__":
    unittest.main()