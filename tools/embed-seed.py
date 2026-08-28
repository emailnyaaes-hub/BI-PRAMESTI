#!/usr/bin/env python3
"""Embed exported BI PRAMESTI browser data into bundled seed files."""

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_JS = ROOT / "assets" / "js" / "data.js"
CAPAIAN_JS = ROOT / "assets" / "js" / "ick-capaian-live.js"


def write_data_js(records: list) -> None:
    body = json.dumps(records, ensure_ascii=False, indent=2)
    DATA_JS.write_text(f"window.EKONOMI_SEED = {body};\n", encoding="utf-8")
    print(f"Wrote {len(records)} records to {DATA_JS}")


def write_capaian_js(capaian: dict) -> None:
    body = json.dumps(capaian, ensure_ascii=False, indent=2)
    CAPAIAN_JS.write_text(f"window.ICK_CAPAIAN_LIVE = {body};\n", encoding="utf-8")
    print(f"Wrote capaian ({len(capaian.get('offices', []))} offices) to {CAPAIAN_JS}")


def main() -> int:
    if len(sys.argv) < 2:
        print("Usage: python3 tools/embed-seed.py bi-pramesti-export.json")
        return 1
    src = Path(sys.argv[1])
    if not src.is_file():
        print(f"File not found: {src}")
        return 1
    payload = json.loads(src.read_text(encoding="utf-8"))
    records = payload.get("records") or []
    if not records:
        print("No records in export file.")
        return 1
    write_data_js(records)
    capaian = payload.get("capaian")
    if capaian and capaian.get("offices"):
        write_capaian_js(capaian)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
