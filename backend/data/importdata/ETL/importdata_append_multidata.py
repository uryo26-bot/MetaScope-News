import pandas as pd
import csv
from pathlib import Path

# ===== 基準ディレクトリ =====
BASE_DIR = Path(__file__).resolve().parent.parent


# ===== 資源別設定（Coal 用の例）=====
RESOURCE = "Oil_Fuel" #CSV内のresource(子要素)だから、metascopeで検索を容易にするため燃料用の石炭であることを示している。
PARENT_RESOURCE = "Oil" #CSV内の親要素（Coal全体でソートできるようにする）
RESOURCE_DIR = "Oil_Fuel" #master\フォルダ名

TARGET_YEARS = list(range(2025, 2009, -1))

VOLUME_UNIT = "KG"
VALUE_UNIT = "JPY_1000"
SOURCE = "MOF_TradeStatistics_ItemCountry"


# ===== 設定 =====
MASTER_DIR = BASE_DIR / "master" / RESOURCE_DIR
COUNTRY_MASTER = BASE_DIR / "master" / "country_master.csv"

OUTPUT_DIR = BASE_DIR / "extractedData_BFpercentage"
OUTPUT_DIR.mkdir(exist_ok=True)
OUTPUT_CSV = OUTPUT_DIR / "Oil_Fuel_import.csv"

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


# ===== country_master =====
def load_country_master() -> dict:
    df = pd.read_csv(COUNTRY_MASTER)
    return dict(zip(df["country_ja"], df["country_code"]))


# ===== 既存キー =====
def load_existing_keys() -> set:
    if not OUTPUT_CSV.exists() or OUTPUT_CSV.stat().st_size == 0:
        return set()

    df = pd.read_csv(OUTPUT_CSV)
    return set(zip(df["year"], df["resource"], df["country_code"]))


# ===== 行変換（合算後 row を想定）=====
def transform_row(row, country_map: dict, year: int) -> dict:
    country_name = row["国名"]
    country_code = country_map.get(country_name)

    if country_code is None:
        raise ValueError(
            f"country_masterに未登録の国名があります: {country_name}"
        )

    return {
        "year": year,
        "resource": RESOURCE,
        "parent_resource": PARENT_RESOURCE,
        "country_code": country_code,
        "country": country_name,
        "volume": row["累計第２数量"],
        "volume_unit": VOLUME_UNIT,
        "volume_percentage": "",
        "value": row["累計金額"],
        "value_unit": VALUE_UNIT,
        "value_percentage": "",
        "source": SOURCE,
    }


# ===== append =====
def append_rows(rows: list[dict]):
    file_exists = OUTPUT_CSV.exists()

    with open(OUTPUT_CSV, "a", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDNAMES)

        if not file_exists:
            writer.writeheader()

        writer.writerows(rows)


# ===== メイン =====
def main():
    country_map = load_country_master()
    existing_keys = load_existing_keys()

    for year in TARGET_YEARS:
        input_file = MASTER_DIR / f"{year}{RESOURCE}_im_MOF.xlsx"

        if not input_file.exists():
            print(f"[skip] ファイルなし: {input_file}")
            continue

        df = pd.read_excel(input_file, header=8)

        # ===== ★ ここが最大の変更点 ★ =====
        # 国名単位で品目を合算
        grouped = (
            df
            .groupby("国名", as_index=False)
            .agg({
                "累計第２数量": "sum",
                "累計金額": "sum"
            })
        )

        transformed_rows = []
        skipped = 0

        for _, row in grouped.iterrows():
            country_name = row["国名"]
            country_code = country_map.get(country_name)

            if country_code is None:
                raise ValueError(
                    f"country_masterに未登録の国名があります: {country_name}"
                )

            key = (year, RESOURCE, country_code)
            if key in existing_keys:
                skipped += 1
                continue

            transformed_rows.append(
                transform_row(row, country_map, year)
            )
            existing_keys.add(key)

        if transformed_rows:
            append_rows(transformed_rows)

        print(
            f"[INFO] {year}年 {RESOURCE}: 追加{len(transformed_rows)}行 / 重複スキップ {skipped}行"
        )


if __name__ == "__main__":
    main()

print(f"[DEBUG] 出力先: {OUTPUT_CSV.resolve()}")
