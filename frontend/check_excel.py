import pandas as pd
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

# ★ energy-frontend/data を使う
data_dir = BASE_DIR / "data"
data_dir.mkdir(exist_ok=True)

file_path = data_dir / "経産省割合変化表.xlsx"

df = pd.read_excel(
    file_path,
    sheet_name="4.電源構成(発電量）",
    header=None
)

# ===== 年度行（2つ目）を取得 =====
year_rows = df[df.iloc[:, 1] == "年度"].index.tolist()
year_row_idx = year_rows[1]
years = df.iloc[year_row_idx, 3:].astype(int)

# ===== 割合ブロック抽出（9電源）=====
energy_start = year_row_idx + 1
energy_end   = energy_start + 9

df_percent = df.iloc[energy_start:energy_end].copy()

# ===== 整形 =====
df_percent.index = df_percent.iloc[:, 1]
df_percent.index.name = "energy"
df_percent = df_percent.iloc[:, 3:]
df_percent.columns = years

# ===== tidy data =====
df_tidy = (
    df_percent
    .reset_index()
    .melt(id_vars="energy", var_name="year", value_name="percentage")
)

# ===== 数値処理 =====
df_tidy["year"] = pd.to_numeric(df_tidy["year"], errors="coerce")
df_tidy["percentage"] = pd.to_numeric(df_tidy["percentage"], errors="coerce")
df_tidy = df_tidy.dropna()
df_tidy["percentage"] *= 100
df_tidy["year"] = df_tidy["year"].astype(int)
df_tidy = df_tidy.reset_index(drop=True)

# ===== 保存 =====
csv_path = data_dir / "energy_mix_percentage.csv"
df_tidy.to_csv(csv_path, index=False)

print("Saved to:", csv_path)



from pathlib import Path
import os

print("=== DEBUG INFO ===")
print("This file :", Path(__file__).resolve())
print("BASE_DIR :", BASE_DIR)
print("DATA_DIR :", data_dir)
print("Exists data_dir?:", data_dir.exists())
print("Files in data_dir:", list(data_dir.glob("*")))
print("==================")




