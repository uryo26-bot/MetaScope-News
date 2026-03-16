#!/usr/bin/env python3
"""
raw (MTOE形式CSV) → extractedData_BFpercentage
EIA API形式の輸出/産出量CSVから、国名・ISO・年度・産出量（MTOE）のBF形式を生成。
LNG以外の資源も、同じCSV構造であれば同様に処理可能。
"""
import argparse
import csv
import re
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent

RAW_DIR = BASE_DIR / "EneChart" / "World_export" / "raw"
OUTPUT_DIR = BASE_DIR / "EneChart" / "World_export" / "extractedData_BFpercentage"

# コード形式: INTL.26-4-XXX-MTOE.A など（数字部分は資源により異なる場合あり）
DEFAULT_CODE_PATTERN = r"INTL\.\d+-\d+-([A-Z]{3})-MTOE\.A"


def parse_args():
    p = argparse.ArgumentParser(
        description="MTOE形式CSVをBF形式に変換（raw→BF）"
    )
    p.add_argument(
        "resource",
        nargs="?",
        default="LNG",
        help="資源識別子（例: LNG, Coal）。入力ファイル名の接頭辞",
    )
    p.add_argument(
        "--input",
        default=None,
        help="入力CSVファイル名（省略時: {resource}_export_MTOE_world.csv）",
    )
    p.add_argument(
        "--output",
        default=None,
        help="出力CSVファイル名（省略時: {resource}_export_BFpercentage.csv）",
    )
    p.add_argument(
        "--pattern",
        default=DEFAULT_CODE_PATTERN,
        help="ISO3抽出用の正規表現（1番目のキャプチャがISO3）",
    )
    p.add_argument(
        "--year-row",
        type=int,
        default=1,
        help="年度が記載される行インデックス（0始まり）",
    )
    p.add_argument(
        "--data-start-row",
        type=int,
        default=3,
        help="データ行の開始インデックス（0始まり）",
    )
    p.add_argument(
        "--exclude-iso",
        default="WORL",
        help="除外するISOコード（国別でない集計用）",
    )
    return p.parse_args()


def extract_iso3(code: str, pattern: re.Pattern) -> str | None:
    m = pattern.search(code.strip())
    return m.group(1) if m else None


def parse_value(val: str) -> float | None:
    if not val or val.strip() in ("NA", "--", ""):
        return None
    try:
        return float(val.strip())
    except ValueError:
        return None


def main():
    args = parse_args()
    resource = args.resource
    input_name = args.input or f"{resource}_export_MTOE_world.csv"
    output_name = args.output or f"{resource}_export_BFpercentage.csv"

    input_csv = RAW_DIR / input_name
    output_csv = OUTPUT_DIR / output_name

    if not input_csv.exists():
        print(f"[ERROR] 入力ファイルが見つかりません: {input_csv}")
        return 1

    pattern = re.compile(args.pattern)

    with open(input_csv, "r", encoding="utf-8") as f:
        reader = csv.reader(f)
        rows = list(reader)

    if len(rows) < args.data_start_row + 1:
        print("[ERROR] CSVの行数が不足しています")
        return 1

    # 年度列を取得
    year_row = rows[args.year_row]
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
    for row in rows[args.data_start_row:]:
        if len(row) < 2:
            continue
        code_cell = row[0].strip()
        country_name = row[1].strip() if len(row) > 1 else ""
        iso3 = extract_iso3(code_cell, pattern)
        if not iso3:
            continue
        if iso3 == args.exclude_iso:
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

    records.sort(key=lambda r: (-r["年度"], -r["産出量（MTOE）"]))

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    with open(output_csv, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(
            f,
            fieldnames=["国名", "ISOコード", "年度", "産出量（MTOE）"],
        )
        writer.writeheader()
        writer.writerows(records)

    print(f"[INFO] {len(records)} 件を出力: {output_csv}")
    return 0


if __name__ == "__main__":
    exit(main())
