import pandas as pd
from pathlib import Path

# ===== 基準ディレクトリ =====
BASE_DIR = Path(__file__).resolve().parent.parent

INPUT_DIR = BASE_DIR / "extractedData_BFpercentage"
OUTPUT_DIR = BASE_DIR / "extractedData_AFpercentage"
OUTPUT_DIR.mkdir(exist_ok=True)

# =====資源に合わせて変更 =====
INPUT_CSV = INPUT_DIR / "Oil_Fuel_import.csv"
OUTPUT_CSV = OUTPUT_DIR / "Oil_Fuel_import.csv"

# ===== 許容誤差 =====
PERCENT_TOLERANCE = 0.1  # ±0.1%


def calculate_percentage(df: pd.DataFrame) -> pd.DataFrame:
    """
    year × resource 単位で volume / value の割合を計算
    """

    df["volume"] = pd.to_numeric(df["volume"], errors="coerce")
    df["value"] = pd.to_numeric(df["value"], errors="coerce")

    volume_sum = df.groupby(["year", "resource"])["volume"].transform("sum")
    value_sum = df.groupby(["year", "resource"])["value"].transform("sum")

    df["volume_percentage"] = (df["volume"] / volume_sum * 100).round(2)
    df["value_percentage"] = (df["value"] / value_sum * 100).round(2)

    return df


def check_duplicates(df: pd.DataFrame) -> None:
    """
    同一 year × resource × country_code の重複チェック
    """
    key_cols = ["year", "resource", "country_code"]
    duplicated = df[df.duplicated(subset=key_cols, keep=False)]

    if not duplicated.empty:
        print("[WARN] 重複データが検出されました:")
        print(duplicated[key_cols].value_counts())
    else:
        print("[OK] 重複データなし")


def check_percentage_sum(df: pd.DataFrame) -> None:
    """
    year × resource ごとの % 合計チェック
    """
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


def main():
    if not INPUT_CSV.exists():
        raise FileNotFoundError(f"入力CSVが存在しません: {INPUT_CSV}")

    df = pd.read_csv(INPUT_CSV)

    required_columns = {
        "year", "resource", "country_code", "volume", "value"
    }
    missing = required_columns - set(df.columns)
    if missing:
        raise ValueError(f"必要な列が不足しています: {missing}")

    # ===== チェック①：重複 =====
    check_duplicates(df)

    # ===== %計算 =====
    df = calculate_percentage(df)

    # ===== チェック②：%合計 =====
    check_percentage_sum(df)

    # ===== 出力 =====
    df.to_csv(OUTPUT_CSV, index=False, encoding="utf-8")
    print("[INFO] %計算・検証完了")
    print(f"[INFO] 出力先: {OUTPUT_CSV.resolve()}")


if __name__ == "__main__":
    main()

