from datetime import timezone
import unittest

from worker.gdelt import infer_feed_type, parse_masterfile


class MasterfilePollerTests(unittest.TestCase):
    def test_infer_feed_type(self) -> None:
        self.assertEqual(infer_feed_type("http://example.com/20260309.export.CSV.zip"), "events")
        self.assertEqual(infer_feed_type("http://example.com/20260309.mentions.CSV.zip"), "mentions")
        self.assertEqual(infer_feed_type("http://example.com/20260309.gkg.csv.zip"), "gkg")

    def test_parse_masterfile(self) -> None:
        entries = parse_masterfile(
            "123 aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa http://data.gdeltproject.org/gdeltv2/20260309083000.export.CSV.zip\n"
            "456 bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb http://data.gdeltproject.org/gdeltv2/20260309084500.mentions.CSV.zip"
        )
        self.assertEqual(len(entries), 2)
        self.assertEqual(entries[0].feed_type, "events")
        self.assertEqual(entries[1].feed_type, "mentions")
        self.assertEqual(entries[0].published_at.tzinfo, timezone.utc)
        self.assertEqual(entries[1].published_at.strftime("%Y%m%d%H%M%S"), "20260309084500")


if __name__ == "__main__":
    unittest.main()