import unittest

from worker.cli import COMMANDS


class CliRegistryTests(unittest.TestCase):
    def test_required_jobs_are_registered(self) -> None:
        self.assertEqual(
            set(COMMANDS.keys()),
            {
                "masterfile-poller",
                "download-worker",
                "normalizer",
                "rollup-worker",
                "brief-generator",
                "alert-worker",
            },
        )


if __name__ == "__main__":
    unittest.main()