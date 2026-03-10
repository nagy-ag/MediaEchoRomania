from __future__ import annotations

import json
from pathlib import Path
from typing import Any


def load_outlet_seed(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def build_approved_domain_set(alias_rows: list[dict[str, Any]]) -> set[str]:
    return {
        str(row["alias_domain"]).lower()
        for row in alias_rows
        if str(row.get("review_status", "approved")).lower() == "approved"
    }
