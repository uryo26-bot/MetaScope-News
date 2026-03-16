import pandas as pd
import csv
from pathlib import Path

# ===== 基準ディレクトリ（importdata）=====
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent


# ===== 資源別設定（ここだけ触る）=====
RESOURCE = "LNG"
PARENT_RESOURCE = "Natural_Gas"
RESOURCE_DIR = "LNG"   # master配下のフォルダ名

TARGET_YEARS = list(range(2025,2009, -1))#複数年度を一気に追加できる

VOLUME_UNIT = "MT"
VALUE_UNIT = "JPY_1000"
SOURCE = "MOF_TradeStatistics_ItemCountry"

# ===== 設定 =====
MASTER_DIR = BASE_DIR / "master" / RESOURCE_DIR
COUNTRY_MASTER = BASE_DIR / "master" / "country_master.csv" #国名をISOコードで統一する（MetaScopeなど外部での要素追加を容易にする）

OUTPUT_DIR = BASE_DIR / "EneChart" / "Japan_import" / "extractedData_BFpercentage"
OUTPUT_DIR.mkdir(exist_ok=True)

OUTPUT_CSV = OUTPUT_DIR / "Natural_Gas_import.csv"


#列名一覧（全ての資源データで共通）
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

# ===== country_master 読み込み =====
def load_country_master() -> dict:
    df = pd.read_csv(COUNTRY_MASTER)
    return dict(zip(df["country_ja"], df["country_code"])) #表記をISO辞書にする（地域ごとのソートなど外部機能の追加が容易になる）


# ===== 既存データの一意キー取得 ===== 
def load_existing_keys() -> set:
    if not OUTPUT_CSV.exists():
        return set()
    
    if OUTPUT_CSV.stat().st_size == 0:
        return set()

    df = pd.read_csv(OUTPUT_CSV)
    return set(zip(df["year"], df["resource"], df["country_code"])) #重複年度のappendを防止するためのNG情報（既存情報）を提示


# ===== 1行変換 =====
def transform_row(row, country_map: dict, year: int) -> dict:
    country_name = row["国名"]
    country_code = country_map.get(country_name)

    if country_code is None:
        raise ValueError(
            f"country_masterに未登録の国名があります。当該国をcountry_masterに追加してください。: {country_name}"
        ) #未登録の国名を提示してcountry_masterへの追加を促す

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


# ===== append処理 =====
def append_to_natural_gas(rows: list[dict]):
    file_exists = OUTPUT_CSV.exists()

    with open(OUTPUT_CSV, "a", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDNAMES)

        if not file_exists:
            writer.writeheader()

        for row in rows:
            writer.writerow(row)


# ===== メイン =====
def main():
    country_map = load_country_master()
    existing_keys = load_existing_keys()

    for year in TARGET_YEARS:
        input_file = MASTER_DIR / f"{year}{RESOURCE}_im_MOF.xlsx" #資源に合わせて手動で書き換える

        if not input_file.exists():
            print(f"[skip] ファイルなし: {input_file}")
            continue
        
        if str(year) not in input_file.name:
            raise ValueError(
                f"年度{year}とファイル名が一致しません: {input_file.name}"
            )

        df = pd.read_excel(input_file, header=8)

        transformed_rows = []
        skipped = 0

        for _, row in df.iterrows():
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
            append_to_natural_gas(transformed_rows)

        print(
            f"[INFO] {year}年 {RESOURCE}: 追加{len(transformed_rows)}行 / 重複スキップ {skipped}行"
            )



if __name__ == "__main__":
    main()


print(f"[DEBUG] 出力先: {OUTPUT_CSV.resolve()}")


