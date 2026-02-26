"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { EneChart } from "./EneChart";
import { FuriganaText } from "./Furigana";
import { useEnergyData } from "../hooks/useEnergyData";

export function App() {
  const pathname = usePathname();
  const [furiganaEnabled, setFuriganaEnabled] = useState(false);
  const [activeTool, setActiveTool] = useState<"enechart" | "metalchart" | "agricchart">(
    pathname?.startsWith("/agricchart") ? "agricchart" : pathname?.startsWith("/metalchart") ? "metalchart" : "enechart"
  );
  const { energyData, loading, error } = useEnergyData();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl font-bold">
          <FuriganaText enabled={furiganaEnabled}>読み込み中...</FuriganaText>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl font-bold text-red-600">
          <FuriganaText enabled={furiganaEnabled}>{`エラー: ${error}`}</FuriganaText>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 共通ヘッダー（高級感のあるデザイン） */}
      <header className="font-header relative bg-gradient-to-b from-white to-slate-50/80 border-b border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
        {/* アクセントライン（控えめなグラデーション） */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-slate-300/70 to-transparent" aria-hidden />

        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="flex items-center justify-between">
            {/* タイトル */}
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-800 mb-2">
                <FuriganaText enabled={furiganaEnabled}>MetaScope</FuriganaText>
              </h1>
              <p className="text-base font-bold text-slate-500 tracking-wide max-w-xl">
                <FuriganaText enabled={furiganaEnabled}>
                  目の前のモノや現象を起点に、社会・産業・資源構造まで理解できる探索型アプリ
                </FuriganaText>
              </p>
            </div>

            {/* ふりがなボタン */}
            <button
              onClick={() => setFuriganaEnabled(!furiganaEnabled)}
              className={`px-5 py-2.5 rounded-md text-sm font-bold transition-all duration-200 border ${
                furiganaEnabled
                  ? "bg-slate-800 text-white border-slate-800 shadow-sm hover:bg-slate-700"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <FuriganaText enabled={furiganaEnabled}>
                {furiganaEnabled ? "ふりがな: オン" : "ふりがな: オフ"}
              </FuriganaText>
            </button>
          </div>

          {/* ツール切り替えナビ */}
          <nav className="mt-8 flex gap-2 border-t border-slate-100 pt-6">
            <button
              onClick={() => setActiveTool("enechart")}
              className={`px-5 py-2.5 rounded-md text-sm font-bold transition-all duration-200 ${
                activeTool === "enechart"
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
              }`}
            >
              <FuriganaText enabled={furiganaEnabled}>EneChart</FuriganaText>
            </button>
            <Link
              href="/metalchart"
              onClick={() => setActiveTool("metalchart")}
              className={`px-5 py-2.5 rounded-md text-sm font-bold transition-all duration-200 ${
                activeTool === "metalchart"
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
              }`}
            >
              <FuriganaText enabled={furiganaEnabled}>MetalChart</FuriganaText>
            </Link>
            <Link
              href="/agricchart"
              onClick={() => setActiveTool("agricchart")}
              className={`px-5 py-2.5 rounded-md text-sm font-bold transition-all duration-200 ${
                activeTool === "agricchart"
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
              }`}
            >
              <FuriganaText enabled={furiganaEnabled}>AgriChart</FuriganaText>
            </Link>
          </nav>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto">
        {activeTool === "enechart" && <EneChart energyData={energyData} furiganaEnabled={furiganaEnabled} />}
        {activeTool === "metalchart" && (
          <div className="p-8">
            <p className="text-slate-600">
              <FuriganaText enabled={furiganaEnabled}>
                <Link href="/metalchart" className="text-slate-800 font-bold underline hover:no-underline">MetalChart ページへ</Link>
              </FuriganaText>
            </p>
          </div>
        )}
        {activeTool === "agricchart" && (
          <div className="p-8">
            <p className="text-slate-600">
              <FuriganaText enabled={furiganaEnabled}>
                <Link href="/agricchart" className="text-slate-800 font-bold underline hover:no-underline">AgriChart ページへ</Link>
              </FuriganaText>
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
