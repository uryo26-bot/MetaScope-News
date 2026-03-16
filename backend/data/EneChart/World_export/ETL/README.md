# World_export ETL: raw → BF → AF

パイプライン: `raw/` (MTOE形式CSV) → `extractedData_BFpercentage` → `extractedData_AFpercentage`

EIA API形式の世界輸出/産出量CSV（国別・年度別MTOE）を処理。LNG以外の資源も同じ構造なら同様に処理可能。

## 実行順序

### 1. raw → BF（産出量ベース）

**既存（LNG）を実行**
```bash
python extract_mtoe_to_bf.py LNG
```

**新規リソースを実行**
```bash
# raw/ に {Resource}_export_MTOE_world.csv を配置後
python extract_mtoe_to_bf.py <resource>
```

**オプション**
- `--input`: 入力ファイル名（省略時: `{resource}_export_MTOE_world.csv`）
- `--output`: 出力ファイル名（省略時: `{resource}_export_BFpercentage.csv`）
- `--pattern`: ISO3抽出用正規表現

### 2. BF → AF（割合）

```bash
python calc_export_percentage.py
```

BF 内の全 `*_export_BFpercentage.csv` を自動検出して変換。

### 一括実行

```bash
python run_world_export_pipeline.py
```

## raw CSV 形式（EIA API）

- Row 0: メタデータ
- Row 1: API, (空), 1980, 1981, ... (年度列)
- Row 2: 説明
- Row 3+: `INTL.数字-数字-XXX-MTOE.A`, 国名, 値, 値, ...

- 列0: コード（INTL.26-4-AUS-MTOE.A 等）
- 列1: 国名
- 列2〜: 年度別産出量（MTOE）
