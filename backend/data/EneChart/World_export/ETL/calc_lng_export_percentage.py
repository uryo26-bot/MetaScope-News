#!/usr/bin/env python3
"""
LNG_export_BFpercentage.csv から世界全体の輸出量に対する割合（percentage）を計算し、
LNG_export_AFpercentage.csv を生成する。
"""
import csv
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
INPUT_DIR = BASE_DIR / "extractedData_BFpercentage"
OUTPUT_DIR = BASE_DIR / "extractedData_AFpercentage"
INPUT_CSV = INPUT_DIR / "LNG_export_BFpercentage.csv"
OUTPUT_CSV = OUTPUT_DIR / "LNG_export_AFpercentage.csv"
OUTPUT_DIR.mkdir(exist_ok=True)


def main():
    with open(INPUT_CSV, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    if not rows:
        print("Error: No data")
        return

    # 年度ごとに産出量を集計し、世界合計を算出
    by_year: dict[int, list[dict]] = {}
    for row in rows:
        year = int(row["年度"])
        mtoe = float(row["産出量（MTOE）"])
        if year not in by_year:
            by_year[year] = []
        by_year[year].append({**row, "mtoe": mtoe})

    # 年度ごとに世界合計を計算し、割合を追加
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

    with open(OUTPUT_CSV, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(
            f,
            fieldnames=["国名", "ISOコード", "年度", "産出量（MTOE）", "volume_percentage"],
        )
        writer.writeheader()
        writer.writerows(output_rows)

    print(f"Wrote {len(output_rows)} records to {OUTPUT_CSV}")


if __name__ == "__main__":
    main()
