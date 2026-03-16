# -*- coding: utf-8 -*-
"""
データパス設定（単一ソース）
アプリ・ETL で参照するパスを一元管理。新規データ追加時はここを更新する。
"""
from pathlib import Path

# 基準ディレクトリ（backend/）
BACKEND_DIR = Path(__file__).resolve().parent
DATA_DIR = BACKEND_DIR / "data"

# ===== 処理済みデータ（アプリ参照用） =====
# EneChart: 発電割合・輸入元割合（extractedData_AFpercentage）・世界輸出割合
ENECHART = DATA_DIR / "EneChart"
ENECHART_ENERGY_MIX = ENECHART / "energy_mix_percentage.csv"
ENECHART_JAPAN_IMPORT_SHARE = ENECHART / "Japan_import" / "extractedData_AFpercentage"
ENECHART_WORLD_EXPORT_SHARE = ENECHART / "World_export" / "extractedData_AFpercentage"

# MetalChart / AgriChart
METALCHART = DATA_DIR / "MetalChart"
METALCHART_IMPORT = METALCHART / "import"
METALCHART_PRODUCTION = METALCHART / "production"

AGRICHART = DATA_DIR / "AgriChart"
AGRICHART_IMPORT = AGRICHART / "import"
AGRICHART_PRODUCTION = AGRICHART / "production"

# ===== 未加工・ETL用 =====
# 日本輸入割合の生データ（財務省貿易統計Excel: Coal_Fuel, LNG, Oil_Fuel）
ENECHART_JAPAN_IMPORT_RAW = DATA_DIR / "EneChart" / "Japan_import" / "raw"
# 世界輸出割合の生データ（LNG_export_MTOE_world.csv）
ENECHART_WORLD_EXPORT_RAW = DATA_DIR / "EneChart" / "World_export" / "raw"
# ETL は EneChart/Japan_import/ETL および EneChart/World_export/ETL に配置

# マスター・RAG
MASTER_DIR = DATA_DIR / "master"
COUNTRY_MASTER = MASTER_DIR / "country_master.csv"
RAGDATA_DIR = DATA_DIR / "ragdata"
