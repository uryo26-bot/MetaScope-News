# MetaScope

目の前のモノや現象を起点に、社会・産業・資源構造まで理解できる探索型アプリ。

エネルギー構成、金属・農産物の輸入元・生産国、ニュース分析などを可視化し、初学者にも分かりやすく提供します。

## 機能

| ページ | 説明 |
|--------|------|
| **EneChart** | 日本の発電構成、 LNG/石炭/石油の輸入元割合、世界のLNG産出国割合 |
| **MetalChart** | 金属・鉱物の日本輸入元と世界生産国 |
| **AgriChart** | 農産物の日本輸入元と世界生産国 |
| **NewsScope** | ニュースの多角的分析（主体、視点、時系列、関連資源） |
| **PortChart** | 資源・品目の輸入元・生産国を地図上で可視化 |

## 技術スタック

### Frontend
- Next.js 16 / React 19
- TypeScript
- Tailwind CSS
- Recharts / Mapbox GL / React Map GL
- Framer Motion

### Backend
- FastAPI
- Python 3.11+
- pandas
- LangChain / FAISS（RAG）
- Anthropic Claude（NewsScope 分析）

## セットアップ

### 要件
- Node.js 20+
- Python 3.11+
- npm

### 1. クローン

```bash
git clone https://github.com/<your-org>/MetaScope_news.git
cd MetaScope_news
```

### 2. 依存関係のインストール

```bash
# Frontend
cd frontend && npm install

# Backend（NewsScope のAI分析を使う場合）
cd backend && pip install -r requirements.txt
```

### 3. 環境変数

プロジェクトルートまたは `frontend/` に `.env.local` を作成:

```env
# NewsScope 分析用（Anthropic）
ANTHROPIC_API_KEY=your_api_key_here
```

### 4. 開発サーバー起動

```bash
# ルートから（Frontend のみ）
npm run dev
```

- Frontend: http://localhost:3000

NewsScope の AI 分析を使う場合は、別ターミナルで Backend を起動:

```bash
cd backend
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

## ビルド

```bash
npm run build
npm run start
```

## プロジェクト構成

```
MetaScope_news/
├── frontend/          # Next.js フロントエンド
│   ├── app/           # ページ（EneChart, MetalChart, AgriChart, NewsScope, PortChart）
│   ├── components/
│   ├── data/          # リソース定義、国マスタ等
│   └── lib/
├── backend/           # FastAPI + データ・ETL
│   ├── data/          # CSV、raw、ETL スクリプト
│   │   ├── EneChart/  # 電源・輸入・輸出データ
│   │   ├── MetalChart/
│   │   ├── AgriChart/
│   │   └── master/
│   └── app.py
└── package.json
```

## データ更新（ETL）

### EneChart 日本輸入

1. `backend/data/EneChart/Japan_import/raw/` に Excel 配置
2. `python run_enechart_imports.py`（または `import_mof_to_bf.py` + `calc_import_percentage.py`）

### EneChart 世界輸出

1. `backend/data/EneChart/World_export/raw/` に MTOE 形式 CSV 配置
2. `python run_world_export_pipeline.py`

詳細は `backend/data/DATA_STRUCTURE.md` を参照してください。

## ライセンス

Private
