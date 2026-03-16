#!/usr/bin/env python3
"""
World_export の raw→BF→AF を一括実行するランナー。
"""
import subprocess
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
EXTRACT_SCRIPT = SCRIPT_DIR / "extract_mtoe_to_bf.py"
CALC_SCRIPT = SCRIPT_DIR / "calc_export_percentage.py"


def main():
    # 1. raw → BF（LNG）
    print("=" * 60)
    print("Step 1: raw → BF (extract_mtoe_to_bf.py)")
    print("=" * 60)
    r = subprocess.run([sys.executable, str(EXTRACT_SCRIPT), "LNG"])
    if r.returncode != 0:
        print("[ERROR] extract で失敗")
        sys.exit(1)

    # 2. BF → AF
    print("\n" + "=" * 60)
    print("Step 2: BF → AF (calc_export_percentage.py)")
    print("=" * 60)
    r = subprocess.run([sys.executable, str(CALC_SCRIPT)])
    if r.returncode != 0:
        print("[ERROR] calc で失敗")
        sys.exit(1)

    print("\n[INFO] World_export パイプライン完了")


if __name__ == "__main__":
    main()
