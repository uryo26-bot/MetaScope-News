from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from pathlib import Path
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings, ChatOpenAI

app = FastAPI()

# ===== CORS =====
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===== パス =====
BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
CSV_PATH = DATA_DIR / "energy_mix_percentage.csv"
VECTOR_DIR = BASE_DIR / "vectorstore"

# ===== CSV =====
generation_df = pd.read_csv(CSV_PATH)

# ===== RAG =====
embeddings = OpenAIEmbeddings()
db = FAISS.load_local(
    VECTOR_DIR,
    embeddings,
    allow_dangerous_deserialization=True
)
retriever = db.as_retriever(search_kwargs={"k": 3})

llm = ChatOpenAI(
    model="gpt-4o-mini",
    temperature=0
)

# ===== API =====
@app.get("/energy")
def get_energy(year: int | None = None):
    if year is not None:
        return generation_df[generation_df["year"] == year].to_dict(orient="records")
    return generation_df.to_dict(orient="records")


@app.get("/rag")
def rag(query: str = Query(..., description="例：天然ガスとは何ですか？")):
    docs = retriever.invoke(query)
    context = "\n\n".join(d.page_content for d in docs)

    sources = sorted(
        set(d.metadata.get("source", "").split("\\")[-1] for d in docs)
    )

    prompt = f"""
あなたはEneChartの解説アシスタントです。
以下の情報のみを使って、初学者向けに200字以内で説明してください。

【参照情報】
{context}

【質問】
{query}
"""

    answer = llm.invoke(prompt).content

    return {
        "answer": answer,
        "sources": sources
    }


# 石炭・石油・天然ガスの輸入元割合: extractedData_AFpercentage のCSVを使用
IMPORT_AF_DIR = DATA_DIR / "importdata" / "extractedData_AFpercentage"
SOURCE_TO_FILENAME = {
    "lng": "Natural_Gas_import.csv",
    "coal": "Coal_Fuel_import.csv",
    "oil": "Oil_Fuel_import.csv",
}


@app.get("/import-data/{source}")
def get_import_data(source: str, year: int = 2024):
    filename = SOURCE_TO_FILENAME.get(source.lower())
    if not filename:
        return []
    csv_path = IMPORT_AF_DIR / filename
    if not csv_path.exists():
        return []
    df = pd.read_csv(csv_path)
    df = df[df["year"] == year].copy()
    df["volume_percentage"] = pd.to_numeric(df["volume_percentage"], errors="coerce").fillna(0)
    # 国ごとに集計（同一国で複数行ある場合に合算）
    agg = df.groupby(["country_code", "country"], as_index=False)["volume_percentage"].sum()
    agg["percentage"] = agg["volume_percentage"].round(2)
    records = [
        {"country": row["country"], "percentage": float(row["percentage"]), "countryCode": row["country_code"]}
        for _, row in agg.iterrows()
    ]
    return records



