# データフォルダ構成

データ増加に対応できるよう整理された構成です。

## ディレクトリ一覧

```
backend/data/
├── EneChart/           # 電源チャート用（処理済み）
│   ├── energy_mix_percentage.csv
│   ├── Japan_import/   # 日本輸入元割合
│   │   ├── raw/       # 生データ（財務省貿易統計Excel等）Coal_Fuel/LNG/Oil_Fuel
│   │   ├── ETL/       # raw→BF→AF パイプライン（import_mof_to_bf, calc_import_percentage）
│   │   ├── extractedData_BFpercentage/  # 中間（数量ベース）
│   │   └── extractedData_AFpercentage/   # 最終（割合）← アプリ参照
│   └── World_export/   # 世界輸出割合（LNG等）
│       ├── raw/       # 生データ（LNG_export_MTOE_world.csv）
│       ├── ETL/       # raw→BF→AF パイプライン（extract_mtoe_to_bf, calc_export_percentage）
│       ├── extractedData_BFpercentage/
│       └── extractedData_AFpercentage/   # ← アプリ参照
│
├── MetalChart/        # 金属・鉱物チャート
│   ├── import/        # 日本輸入元
│   └── production/    # 世界生産国
│
├── AgriChart/         # 農産物チャート
│   ├── import/
│   └── production/
│
├── master/            # マスター（国コード等。輸入生データは EneChart/Japan_import/raw/ へ）
│   └── country_master.csv
│
├── ragdata/           # RAG用Markdown
│   ├── concepts/
│   └── energy/
│
└── metalchart_agrichart/  # Metal/AgriChart ダミーデータ生成
    └── generate_full_years.py
```

## データフロー

### EneChart
1. **元データ**: `EneChart/Japan_import/raw/`（Coal_Fuel, LNG, Oil_Fuel）、`EneChart/World_export/raw/`（LNG_export_MTOE_world.csv）
2. **ETL**: `EneChart/Japan_import/ETL/` および `EneChart/World_export/ETL/` のスクリプトを実行
3. **出力先**: `EneChart/Japan_import/`, `EneChart/World_export/`
4. **アプリ参照**: `extractedData_AFpercentage`（割合計算済み）

### MetalChart / AgriChart
- CSV を `import/` または `production/` に直接配置
- ダミー生成: `python data/metalchart_agrichart/generate_full_years.py`

## パス設定

- **Backend**: `backend/data_paths.py` で一元管理
- **Frontend API**: `frontend/lib/dataPaths.ts` で参照

新規データ追加時は上記を更新してください。

## ETL 実行順序（EneChart）

**Japan_import**
1. `import_mof_to_bf.py` → BF（または `run_enechart_imports.py` で一括）
2. `calc_import_percentage.py` → BF から AF

**World_export**
1. `extract_mtoe_to_bf.py` → BF（または `run_world_export_pipeline.py` で一括）
2. `calc_export_percentage.py` → BF から AF
