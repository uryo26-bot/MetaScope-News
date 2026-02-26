from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from langchain_openai import ChatOpenAI

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

def query_rag(query: str):
    docs = retriever.invoke(query)

    context = "\n\n".join(d.page_content for d in docs)

    # 参照元ファイル名を取得
    sources = sorted(
        set(d.metadata.get("source", "").split("/")[-1] for d in docs)
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

    # 回答の末尾に参照元を付与
    if sources:
        answer += "\n\n（参考：" + ", ".join(sources) + "）"

    return answer



if __name__ == "__main__":
    print(ask("天然ガスとは何ですか？"))
