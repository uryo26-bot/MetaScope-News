"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FuriganaText } from "./Furigana";
import { useFurigana } from "../contexts/FuriganaContext";

export function Header() {
  const pathname = usePathname();
  const { enabled: furiganaEnabled, setEnabled: setFuriganaEnabled } = useFurigana();
  const isEneChart = pathname === "/";
  const isMetalChart = pathname?.startsWith("/metalchart") ?? false;
  const isAgricChart = pathname?.startsWith("/agricchart") ?? false;
  const isNewsScope = pathname?.startsWith("/newsscope") ?? false;

  return (
    <header className="font-header relative bg-gradient-to-b from-white to-slate-50/80 border-b border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-slate-300/70 to-transparent" aria-hidden />

      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="flex items-center justify-between">
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

        <nav className="mt-8 flex gap-2 border-t border-slate-100 pt-6">
          <Link
            href="/"
            className={`px-5 py-2.5 rounded-md text-sm font-bold transition-all duration-200 ${
              isEneChart ? "bg-slate-800 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
            }`}
          >
            <FuriganaText enabled={furiganaEnabled}>EneChart</FuriganaText>
          </Link>
          <Link
            href="/metalchart"
            className={`px-5 py-2.5 rounded-md text-sm font-bold transition-all duration-200 ${
              isMetalChart ? "bg-slate-800 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
            }`}
          >
            <FuriganaText enabled={furiganaEnabled}>MetalChart</FuriganaText>
          </Link>
          <Link
            href="/agricchart"
            className={`px-5 py-2.5 rounded-md text-sm font-bold transition-all duration-200 ${
              isAgricChart ? "bg-slate-800 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
            }`}
          >
            <FuriganaText enabled={furiganaEnabled}>AgriChart</FuriganaText>
          </Link>
          <Link
            href="/newsscope"
            className={`px-5 py-2.5 rounded-md text-sm font-bold transition-all duration-200 ${
              isNewsScope ? "bg-slate-800 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
            }`}
          >
            <FuriganaText enabled={furiganaEnabled}>NewsScope</FuriganaText>
          </Link>
        </nav>
      </div>
    </header>
  );
}
