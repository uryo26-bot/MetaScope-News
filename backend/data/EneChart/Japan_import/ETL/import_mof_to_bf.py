#!/usr/bin/env python3
"""
raw (Excel) → extractedData_BFpercentage
財務省貿易統計Excel（国名・累計第２数量・累計金額）を読み込み、BF形式CSV に追記する。
天然ガス・石油・石炭以外の資源も、Excel構造が同じであれば同様に処理可能。
"""
import argparse
import csv
from pathlib import Path

import pandas as pd

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent

COUNTRY_MASTER = BASE_DIR / "master" / "country_master.csv"
OUTPUT_DIR = BASE_DIR / "EneChart" / "Japan_import" / "extractedData_BFpercentage"

FIELDNAMES = [
    "year",
    "resource",
    "parent_resource",
    "country_code",
    "country",
    "volume",
    "volume_unit",
    "volume_percentage",
    "value",
    "value_unit",
    "value_percentage",
    "source",
]

# Excel 列名（財務省貿易統計共通）
EXCEL_COL_COUNTRY = "国名"
EXCEL_COL_VOLUME = "累計第２数量"
EXCEL_COL_VALUE = "累計金額"
EXCEL_HEADER_ROW = 8


def parse_args():
    p = argparse.ArgumentParser(
        description="財務省貿易統計ExcelをBF形式CSVに変換（raw→BF）"
    )
    p.add_argument(
        "resource",
        help="資源識別子（例: LNG, Coal_Fuel, Oil_Fuel, Uranium）",
    )
    p.add_argument(
        "--parent",
        required=True,
        help="親資源名（CSVのparent_resource列、例: Natural_Gas, Coal, Oil）",
    )
    p.add_argument(
        "--raw-dir",
        default=None,
        help="raw配下のフォルダ名（省略時はresourceと同じ）",
    )
    p.add_argument(
        "--output",
        default=None,
        help="出力CSVファイル名（省略時は {resource}_import.csv）",
    )
    p.add_argument(
        "--aggregate",
        action="store_true",
        help="国名単位で品目を合算（複数品目がある場合）",
    )
    p.add_argument(
        "--volume-unit",
        default="MT",
        help="数量単位（MT, KG等）",
    )
    p.add_argument(
        "--value-unit",
        default="JPY_1000",
        help="金額単位",
    )
    p.add_argument(
        "--source",
        default="MOF_TradeStatistics_ItemCountry",
        help="データソース識別子",
    )
    p.add_argument(
        "--years",
        default="2025-2009",
        help="処理対象年度範囲（例: 2025-2009）",
    )
    return p.parse_args()


def parse_year_range(s: str) -> list[int]:
    """'2025-2009' → [2025,2024,...,2010]"""
    parts = s.split("-")
    if len(parts) != 2:
        raise ValueError("--years は '開始-終了' 形式（例: 2025-2009）")
    start, end = int(parts[0]), int(parts[1])
    return list(range(start, end, -1)) if start > end else list(range(start, end + 1))


def load_country_master() -> dict:
    df = pd.read_csv(COUNTRY_MASTER)
    return dict(zip(df["country_ja"], df["country_code"]))


def load_existing_keys(output_csv: Path, resource: str) -> set:
    if not output_csv.exists() or output_csv.stat().st_size == 0:
        return set()
    df = pd.read_csv(output_csv)
    return set(zip(df["year"], df["resource"], df["country_code"]))


def transform_row(
    row,
    country_map: dict,
    year: int,
    resource: str,
    parent_resource: str,
    volume_unit: str,
    value_unit: str,
    source: str,
) -> dict:
    country_name = row[EXCEL_COL_COUNTRY]
    country_code = country_map.get(country_name)
    if country_code is None:
        raise ValueError(
            f"country_masterに未登録の国名があります。当該国をcountry_masterに追加してください。: {country_name}"
        )
    return {
        "year": year,
        "resource": resource,
        "parent_resource": parent_resource,
        "country_code": country_code,
        "country": country_name,
        "volume": row[EXCEL_COL_VOLUME],
        "volume_unit": volume_unit,
        "volume_percentage": "",
        "value": row[EXCEL_COL_VALUE],
        "value_unit": value_unit,
        "value_percentage": "",
        "source": source,
    }


def append_to_csv(rows: list[dict], output_csv: Path):
    file_exists = output_csv.exists()
    with open(output_csv, "a", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDNAMES)
        if not file_exists:
            writer.writeheader()
        writer.writerows(rows)


def main():
    args = parse_args()
    resource = args.resource
    parent_resource = args.parent
    raw_dir = args.raw_dir or resource
    output_name = args.output or f"{resource}_import.csv"
    years = parse_year_range(args.years)

    master_dir = BASE_DIR / "EneChart" / "Japan_import" / "raw" / raw_dir
    output_csv = OUTPUT_DIR / output_name
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    country_map = load_country_master()
    existing_keys = load_existing_keys(output_csv, resource)

    for year in years:
        input_file = master_dir / f"{year}{resource}_im_MOF.xlsx"

        if not input_file.exists():
            print(f"[skip] ファイルなし: {input_file}")
            continue

        if str(year) not in input_file.name:
            raise ValueError(f"年度{year}とファイル名が一致しません: {input_file.name}")

        df = pd.read_excel(input_file, header=EXCEL_HEADER_ROW)

        # 必須列チェック
        for col in [EXCEL_COL_COUNTRY, EXCEL_COL_VOLUME, EXCEL_COL_VALUE]:
            if col not in df.columns:
                raise ValueError(f"Excelに必須列がありません: {col}（存在: {list(df.columns)}）")

        if args.aggregate:
            df = df.groupby(EXCEL_COL_COUNTRY, as_index=False).agg({
                EXCEL_COL_VOLUME: "sum",
                EXCEL_COL_VALUE: "sum",
            })

        transformed_rows = []
        skipped = 0

        for _, row in df.iterrows():
            country_name = row[EXCEL_COL_COUNTRY]
            country_code = country_map.get(country_name)

            if country_code is None:
                raise ValueError(f"country_masterに未登録の国名があります: {country_name}")

            key = (year, resource, country_code)
            if key in existing_keys:
                skipped += 1
                continue

            transformed_rows.append(
                transform_row(
                    row,
                    country_map,
                    year,
                    resource,
                    parent_resource,
                    args.volume_unit,
                    args.value_unit,
                    args.source,
                )
            )
            existing_keys.add(key)

        if transformed_rows:
            append_to_csv(transformed_rows, output_csv)

        print(
            f"[INFO] {year}年 {resource}: 追加{len(transformed_rows)}行 / 重複スキップ {skipped}行"
        )

    print(f"[INFO] 出力先: {output_csv}")


if __name__ == "__main__":
    main()
