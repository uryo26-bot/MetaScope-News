# EneChart

## 概要
EneChart は、日本のエネルギー構成や資源の供給プロセスを、
初学者向けに分かりやすく可視化することを目的とした個人制作プロジェクトです。

本リポジトリでは、FastAPI を用いた backend と、
将来的に拡張可能な frontend を含めて管理しています。

## 使用技術
- Python 3.11
- FastAPI
- Uvicorn
- LangChain
- FAISS
- Docker
- React（frontend）

## セットアップ（Docker）

### 1. リポジトリをクローン
```bash
git clone https://github.com/uryo26-bot/EneChart_prototype.git
cd EneChart_prototype/backend
```
### 2. 環境変数の設定
`.env` ファイルを作成し、以下を設定してください。

```env
OPENAI_API_KEY=your_api_key_here
```

### 3. Docker イメージのビルド
```bash
docker build -t enechart-backend .
```
### 4. コンテナ起動
```bash
docker run -p 8000:8000 --env-file .env enechart-backend
```

## 起動確認（最後）
以下にアクセスすると FastAPI の Swagger UI が表示されます。

- http://localhost:8000/docs


