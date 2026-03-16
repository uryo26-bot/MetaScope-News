# Japan_import ETL: raw → BF → AF

パイプライン: `raw/` (Excel) → `extractedData_BFpercentage` → `extractedData_AFpercentage`

財務省貿易統計のExcel（国名・累計第２数量・累計金額）であれば、天然ガス・石油・石炭以外の資源も同様に処理可能。

## 実行順序

### 1. raw → BF（数量ベース）

**既存3資源を一括実行**
```bash
python run_enechart_imports.py
```

**単一リソース／新規リソースを実行**
```bash
python import_mof_to_bf.py <resource> --parent <親資源名> [オプション]
```

**主なオプション**

| オプション | 説明 | 例 |
|-----------|------|-----|
| `--parent` | 必須。CSVの parent_resource 列 | `Natural_Gas`, `Coal`, `Oil` |
| `--raw-dir` | raw 配下フォルダ（省略時=resource） | `Uranium` |
| `--output` | 出力CSV名（省略時=`{resource}_import.csv`） | `Natural_Gas_import.csv` |
| `--aggregate` | 国名単位で品目合算（複数品目がある場合） | |
| `--volume-unit` | 数量単位（MT, KG等） | `MT` |
| `--years` | 年度範囲 | `2025-2009` |

**実行例（新規リソース：ウラン）**
```bash
# raw/Uranium/ に 2010Uranium_im_MOF.xlsx 等を配置し、
python import_mof_to_bf.py Uranium --parent Nuclear --raw-dir Uranium --volume-unit "MT"
```

### 2. BF → AF（割合）

```bash
python calc_import_percentage.py
```

BF フォルダ内の全 `*_import.csv` を自動検出して変換。

特定ファイルのみ処理する場合:
```bash
python calc_import_percentage.py --files Natural_Gas_import.csv Coal_Fuel_import.csv
```

## Excel 要件

- ヘッダー行: 9行目（0-basedで8行目）
- 必須列: `国名`, `累計第２数量`, `累計金額`
- ファイル名: `{年}{resource}_im_MOF.xlsx`（例: `2024LNG_im_MOF.xlsx`）
