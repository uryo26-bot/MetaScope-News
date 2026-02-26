from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings, ChatOpenAI

# FastAPI app
app = FastAPI()

# CORS（フロントから叩くため）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 開発中なので全許可
    allow_methods=["*"],
    allow_headers=["*"],
)

# Vector store
VECTOR_DIR = "vectorstore"

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

@app.get("/rag")
def rag(query: str = Query(..., description="例：天然ガスとは何ですか？")):
    docs = retriever.invoke(query)

    context = "\n\n".join(d.page_content for d in docs)

    # 表示用にファイル名だけ取得
    sources = sorted(
        set(d.metadata.get("source", "").split("\\")[-1] for d in docs)
    )

    prompt = f"""
あなたはEneChartの解説アシスタントです。
以下の情報のみを使って、初学者向けに説明してください。

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
