#!/usr/bin/env python3
"""
extractedData_BFpercentage → extractedData_AFpercentage
BF（産出量MTOE）から世界合計に対する割合（volume_percentage）を計算し AF を生成。
BF フォルダ内の全 *_export_BFpercentage.csv を自動検出して処理。
"""
import argparse
import csv
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent

INPUT_DIR = BASE_DIR / "EneChart" / "World_export" / "extractedData_BFpercentage"
OUTPUT_DIR = BASE_DIR / "EneChart" / "World_export" / "extractedData_AFpercentage"

BF_SUFFIX = "_export_BFpercentage.csv"
AF_SUFFIX = "_export_AFpercentage.csv"


def parse_args():
    p = argparse.ArgumentParser(
        description="BF（産出量）→ AF（割合）変換"
    )
    p.add_argument(
        "--files",
        nargs="*",
        help="処理するBFファイル名（省略時はBF内の全*_export_BFpercentage.csv）",
    )
    return p.parse_args()


def process_one(input_csv: Path, output_csv: Path) -> bool:
    if not input_csv.exists():
        print(f"[skip] 入力なし: {input_csv}")
        return False

    rows = []
    with open(input_csv, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    if not rows:
        print("[ERROR] データがありません")
        return False

    # 年度ごとに産出量を集計し、世界合計に対する割合を計算
    by_year: dict[int, list[dict]] = {}
    for row in rows:
        year = int(row["年度"])
        mtoe = float(row["産出量（MTOE）"])
        if year not in by_year:
            by_year[year] = []
        by_year[year].append({**row, "mtoe": mtoe})

    output_rows = []
    for year in sorted(by_year.keys(), reverse=True):
        year_rows = by_year[year]
        world_total = sum(r["mtoe"] for r in year_rows)
        for r in year_rows:
            pct = round((r["mtoe"] / world_total * 100), 2) if world_total > 0 else 0
            output_rows.append({
                "国名": r["国名"],
                "ISOコード": r["ISOコード"],
                "年度": year,
                "産出量（MTOE）": r["産出量（MTOE）"],
                "volume_percentage": pct,
            })

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    with open(output_csv, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(
            f,
            fieldnames=["国名", "ISOコード", "年度", "産出量（MTOE）", "volume_percentage"],
        )
        writer.writeheader()
        writer.writerows(output_rows)

    print(f"[INFO] {len(output_rows)} 件を出力: {output_csv}")
    return True


def main():
    args = parse_args()

    if args.files:
        bf_files = [INPUT_DIR / f for f in args.files]
    else:
        bf_files = sorted(INPUT_DIR.glob("*_export_BFpercentage.csv"))

    if not bf_files:
        print("[WARN] 処理対象のBFファイルがありません")
        return

    for input_path in bf_files:
        if not input_path.exists():
            continue
        # 出力ファイル名: XXX_export_BFpercentage.csv → XXX_export_AFpercentage.csv
        stem = input_path.stem.replace("_BFpercentage", "")
        output_name = stem + "_AFpercentage.csv"
        output_path = OUTPUT_DIR / output_name

        print(f"\n--- {input_path.name} ---")
        process_one(input_path, output_path)

    print("\n[INFO] BF→AF 変換完了")


if __name__ == "__main__":
    main()
