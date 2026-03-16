#!/usr/bin/env python3
"""
既存リソース（天然ガス・石油・石炭）の raw→BF を一括実行するランナー。
新規リソース追加時は import_mof_to_bf.py を直接実行。
"""
import subprocess
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
IMPORT_SCRIPT = SCRIPT_DIR / "import_mof_to_bf.py"


def run(cmd: list[str]) -> bool:
    r = subprocess.run([sys.executable, str(IMPORT_SCRIPT)] + cmd)
    return r.returncode == 0


def main():
    resources = [
        # LNG（天然ガス）: 品目単一なので --aggregate なし、出力は Natural_Gas_import.csv
        ["LNG", "--parent", "Natural_Gas", "--output", "Natural_Gas_import.csv", "--volume-unit", "MT"],
        # 石炭: 品目複数なので合算
        ["Coal_Fuel", "--parent", "Coal", "--aggregate", "--volume-unit", "MT"],
        # 石油: 品目複数なので合算
        ["Oil_Fuel", "--parent", "Oil", "--aggregate", "--volume-unit", "KG"],
    ]

    for args in resources:
        print(f"\n{'='*60}\n>>> {args[0]}\n{'='*60}")
        if not run(args):
            print(f"[ERROR] {args[0]} で失敗")
            sys.exit(1)

    print("\n[INFO] 全リソース raw→BF 完了")
    print("次に calc_import_percentage.py を実行して BF→AF 変換してください。")


if __name__ == "__main__":
    main()
