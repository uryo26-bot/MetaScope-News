export async function askRag(query: string) {
  const res = await fetch(
    `http://127.0.0.1:8001/rag?query=${encodeURIComponent(query)}`
  );

  if (!res.ok) {
    throw new Error(`HTTP error ${res.status}`);
  }

  return res.json();
}
