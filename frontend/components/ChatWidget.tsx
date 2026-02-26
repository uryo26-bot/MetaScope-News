"use client";

import { useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  async function sendMessage() {
  if (!input.trim()) return;

  const userText = input;

  setMessages((prev) => [...prev, { role: "user", content: userText }]);
  setInput("");

  try {
    const res = await fetch(
      `http://localhost:8000/rag?query=${encodeURIComponent(userText)}`
    );

    if (!res.ok) throw new Error("API error");

    const data = await res.json();

    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: data.answer },
    ]);
  } catch (e) {
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "回答を取得できませんでした" },
    ]);
  }
}


  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "#2563eb",
          color: "#fff",
          fontSize: 24,
          border: "none",
          cursor: "pointer",
          zIndex: 1000,
        }}
      >
        💬
      </button>

      {/* Chat window */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: 96,
            right: 24,
            width: 320,
            height: 420,
            background: "#fff",
            border: "1px solid #ddd",
            borderRadius: 8,
            display: "flex",
            flexDirection: "column",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              padding: 8,
              borderBottom: "1px solid #ddd",
              fontWeight: "bold",
            }}
          >
            EneChart AI
          </div>

          <div
            style={{
              flex: 1,
              padding: 8,
              overflowY: "auto",
              fontSize: 14,
            }}
          >
            {messages.map((m, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <strong>{m.role === "user" ? "あなた" : "AI"}:</strong>
                {m.content}
              </div>
            ))}
          </div>

          <div style={{ padding: 8, borderTop: "1px solid #ddd" }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="質問を入力…"
              style={{
                width: "100%",
                padding: 6,
                fontSize: 14,
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
