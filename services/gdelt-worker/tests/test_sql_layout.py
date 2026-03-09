from pathlib import Path
import unittest


class SqlLayoutTests(unittest.TestCase):
    def test_serving_sql_files_exist(self) -> None:
        sql_dir = Path(__file__).resolve().parents[1] / "worker" / "sql" / "serving"
        expected = {
            "dashboard_overview_7d.sql",
            "morning_brief_candidates.sql",
            "top_events_current.sql",
            "outlet_compare_cache.sql",
            "status_summary.sql",
        }
        self.assertEqual({path.name for path in sql_dir.iterdir()}, expected)


if __name__ == "__main__":
    unittest.main()