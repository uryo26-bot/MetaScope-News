#!/usr/bin/env python3
"""
LNG_export_MTOE_world.csv からデータを抽出し、
国名・ISOコード・年度・産出量（MTOE）のCSVを生成する。
"""
import csv
import re
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
INPUT_CSV = BASE_DIR / "LNG_export_MTOE_world.csv"
OUTPUT_DIR = BASE_DIR / "extractedData_BFpercentage"
OUTPUT_DIR.mkdir(exist_ok=True)
OUTPUT_CSV = OUTPUT_DIR / "LNG_export_BFpercentage.csv"


def extract_iso3(code: str) -> str | None:
    """INTL.26-4-XXX-MTOE.A 形式から ISO3 を抽出"""
    m = re.search(r"INTL\.26-4-([A-Z]{3})-MTOE\.A", code.strip())
    return m.group(1) if m else None


def parse_value(val: str) -> float | None:
    """NA, --, 空を None に、数値を float に"""
    if not val or val.strip() in ("NA", "--", ""):
        return None
    try:
        return float(val.strip())
    except ValueError:
        return None


def main():
    with open(INPUT_CSV, "r", encoding="utf-8") as f:
        reader = csv.reader(f)
        rows = list(reader)

    if len(rows) < 4:
        print("Error: CSV has insufficient rows")
        return

    # Row 1: API, empty, 1980, 1981, ... 2024
    year_row = rows[1]
    years = []
    for i, cell in enumerate(year_row):
        if i < 2:
            continue
        try:
            y = int(cell.strip())
            years.append((i, y))
        except ValueError:
            break

    records = []
    # Row 3+: data
    for row in rows[3:]:
        if len(row) < 2:
            continue
        code_cell = row[0].strip()
        country_name = row[1].strip() if len(row) > 1 else ""
        iso3 = extract_iso3(code_cell)
        if not iso3:
            continue
        # World は除外（国別ではない）
        if iso3 == "WORL":
            continue
        for col_idx, year in years:
            if col_idx >= len(row):
                break
            val = parse_value(row[col_idx])
            if val is not None and val > 0:
                records.append({
                    "国名": country_name,
                    "ISOコード": iso3,
                    "年度": year,
                    "産出量（MTOE）": round(val, 4),
                })

    # 年度・産出量降順でソート
    records.sort(key=lambda r: (-r["年度"], -r["産出量（MTOE）"]))

    OUTPUT_CSV.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_CSV, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["国名", "ISOコード", "年度", "産出量（MTOE）"])
        writer.writeheader()
        writer.writerows(records)

    print(f"Wrote {len(records)} records to {OUTPUT_CSV}")


if __name__ == "__main__":
    main()
