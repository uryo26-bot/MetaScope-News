#!/usr/bin/env python3
"""
extractedData_BFpercentage → extractedData_AFpercentage
BF（数量ベース）から volume/value の割合を計算し AF（割合）CSV を生成する。
BF フォルダ内の全 *_import.csv を自動検出して処理（天然ガス・石油・石炭に限らない）。
"""
import argparse
from pathlib import Path

import pandas as pd

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent

INPUT_DIR = BASE_DIR / "EneChart" / "Japan_import" / "extractedData_BFpercentage"
OUTPUT_DIR = BASE_DIR / "EneChart" / "Japan_import" / "extractedData_AFpercentage"

PERCENT_TOLERANCE = 0.1  # ±0.1%

REQUIRED_COLUMNS = {"year", "resource", "country_code", "volume", "value"}


def parse_args():
    p = argparse.ArgumentParser(
        description="BF（数量ベース）→ AF（割合）変換"
    )
    p.add_argument(
        "--files",
        nargs="*",
        help="処理するCSVファイル名（省略時はBF内の全*_import.csvを処理）",
    )
    return p.parse_args()


def calculate_percentage(df: pd.DataFrame) -> pd.DataFrame:
    df["volume"] = pd.to_numeric(df["volume"], errors="coerce")
    df["value"] = pd.to_numeric(df["value"], errors="coerce")

    volume_sum = df.groupby(["year", "resource"])["volume"].transform("sum")
    value_sum = df.groupby(["year", "resource"])["value"].transform("sum")

    df["volume_percentage"] = (df["volume"] / volume_sum * 100).round(2)
    df["value_percentage"] = (df["value"] / value_sum * 100).round(2)
    return df


def check_duplicates(df: pd.DataFrame) -> None:
    key_cols = ["year", "resource", "country_code"]
    duplicated = df[df.duplicated(subset=key_cols, keep=False)]
    if not duplicated.empty:
        print("[WARN] 重複データが検出されました:")
        print(duplicated[key_cols].value_counts())
    else:
        print("[OK] 重複データなし")


def check_percentage_sum(df: pd.DataFrame) -> None:
    grouped = df.groupby(["year", "resource"]).agg(
        volume_sum=("volume_percentage", "sum"),
        value_sum=("value_percentage", "sum"),
    )
    for (year, resource), row in grouped.iterrows():
        vol_diff = abs(row["volume_sum"] - 100)
        val_diff = abs(row["value_sum"] - 100)
        if vol_diff > PERCENT_TOLERANCE or val_diff > PERCENT_TOLERANCE:
            print(
                f"[WARN] %合計異常: year={year}, resource={resource} "
                f"(volume={row['volume_sum']:.2f}%, value={row['value_sum']:.2f}%)"
            )
        else:
            print(
                f"[OK] %合計正常: year={year}, resource={resource} "
                f"(volume={row['volume_sum']:.2f}%, value={row['value_sum']:.2f}%)"
            )


def process_one(input_csv: Path, output_csv: Path) -> bool:
    if not input_csv.exists():
        print(f"[skip] 入力なし: {input_csv}")
        return False

    df = pd.read_csv(input_csv)
    missing = REQUIRED_COLUMNS - set(df.columns)
    if missing:
        print(f"[ERROR] {input_csv.name}: 必要な列が不足: {missing}")
        return False

    check_duplicates(df)
    df = calculate_percentage(df)
    check_percentage_sum(df)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    df.to_csv(output_csv, index=False, encoding="utf-8")
    print(f"[INFO] 出力: {output_csv}")
    return True


def main():
    args = parse_args()
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    if args.files:
        csv_files = [INPUT_DIR / f for f in args.files]
    else:
        # BF内の全 *_import.csv を自動検出
        csv_files = sorted(INPUT_DIR.glob("*_import.csv"))

    if not csv_files:
        print("[WARN] 処理対象のCSVがありません")
        return

    for input_path in csv_files:
        if not input_path.exists():
            continue
        print(f"\n--- {input_path.name} ---")
        output_path = OUTPUT_DIR / input_path.name
        process_one(input_path, output_path)

    print("\n[INFO] BF→AF 変換完了")


if __name__ == "__main__":
    main()
