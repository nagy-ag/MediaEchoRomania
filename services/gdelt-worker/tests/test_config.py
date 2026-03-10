import os
import unittest
from pathlib import Path
from unittest.mock import patch

from worker.config import resolve_seed_outlets_path


class WorkerConfigTests(unittest.TestCase):
    def test_resolve_seed_outlets_path_uses_default_when_env_blank(self) -> None:
        default_path = Path("/tmp/seed.json")
        with patch.dict(os.environ, {"WORKER_SEED_OUTLETS_PATH": ""}, clear=False):
            self.assertEqual(resolve_seed_outlets_path(default_path), default_path)


if __name__ == "__main__":
    unittest.main()
