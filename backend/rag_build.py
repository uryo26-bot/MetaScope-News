from pathlib import Path
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings

print("=== rag_build.py is running ===")

DATA_DIR = Path("data/ragdata")
VECTOR_DIR = "vectorstore"

docs = []

for path in DATA_DIR.rglob("*.md"):
    print("Found:", path)
    loader = TextLoader(path, encoding="utf-8")
    docs.extend(loader.load())

print("Number of documents loaded:", len(docs))

if not docs:
    raise RuntimeError("No markdown files found. Check data/ragdata path.")

splitter = RecursiveCharacterTextSplitter(
    chunk_size=800,
    chunk_overlap=50
)

chunks = splitter.split_documents(docs)
print("Number of chunks:", len(chunks))

embeddings = OpenAIEmbeddings()
db = FAISS.from_documents(chunks, embeddings)
db.save_local(VECTOR_DIR)

print("✅ Vector store built successfully.")

def build_index():
    print("=== rag_build.py is running ===")
    ...
    
if __name__ == "__main__":
    build_index()



