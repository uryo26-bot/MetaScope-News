"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { LensCard } from "./LensCard";
import { SprintingStickFigure } from "./SprintingStickFigure";
import { MapModal } from "./MapModal";
import type { LensType } from "./LensCard";

type PerspectiveItem = {
  plus: string;
  minus: string;
};

type SubjectAnalysis = {
  domestic: PerspectiveItem;
  international: PerspectiveItem;
  economic: PerspectiveItem;
};

type TimelineItem = {
  year: string;
  event: string;
};

type AnalyzeResponse = {
  subjects: string[];
  analyses: Record<string, SubjectAnalysis>;
  timeline: TimelineItem[];
  related_resource: "oil" | "lng" | "coal" | "none";
};

type DetailCacheItem = {
  explanation: string;
  countries: { name: string; role: string; type: string }[];
};

function detailKey(subject: string, lens: LensType, type: "plus" | "minus"): string {
  return `${subject}_${lens}_${type}`;
}

const LENS_CONFIG: {
  type: LensType;
  label: string;
  purpose: string;
}[] = [
  { type: "domestic", label: "国内", purpose: "国内視点での分析" },
  { type: "international", label: "国際", purpose: "国際視点での分析" },
  { type: "economic", label: "経済", purpose: "経済視点での分析" },
];

const LENS_TO_API: Record<LensType, string> = {
  domestic: "domestic",
  international: "international",
  economic: "economic",
};

const LOADING_MESSAGES = [
  "分析中...",
  "ニュースを解析しています...",
  "地図を作成しています...",
  "もうしばらくお待ちください...",
];

export default function NewsScopeClient() {
  const [newsText, setNewsText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [activeLens, setActiveLens] = useState<LensType | null>(null);
  const [detailsCache, setDetailsCache] = useState<Record<string, DetailCacheItem>>({});
  const [detailsLoading, setDetailsLoading] = useState<Record<string, boolean>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [invalidMessage, setInvalidMessage] = useState<string | null>(null);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    subject: string;
    label: string;
    content: string;
    lensType: LensType;
    detailType: "plus" | "minus";
  }>({ isOpen: false, subject: "", label: "", content: "", lensType: "domestic", detailType: "plus" });
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);
  const fetchAbortedRef = useRef(false);

  useEffect(() => {
    if (!loading) return;
    setLoadingMessage(LOADING_MESSAGES[0]);
    let index = 0;
    const id = setInterval(() => {
      index = Math.min(index + 1, LOADING_MESSAGES.length - 1);
      setLoadingMessage(LOADING_MESSAGES[index]);
      if (index >= LOADING_MESSAGES.length - 1) clearInterval(id);
    }, 2500);
    return () => clearInterval(id);
  }, [loading]);

  const handleAnalyze = useCallback(async () => {
    if (!newsText.trim()) return;
    setLoading(true);
    setResult(null);
    setApiError(null);
    setInvalidMessage(null);
    setSelectedSubject("");
    setActiveLens(null);
    setDetailsCache({});
    setDetailsLoading({});
    fetchAbortedRef.current = false;
    try {
      const res = await fetch("/api/analyze-news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ news: newsText.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg =
          data?.error ??
          (res.status === 502
            ? "バックエンドが起動していません。backend フォルダで uvicorn backend.app:app --reload を実行してください。"
            : `エラーが発生しました。HTTP ${res.status}`);
        throw new Error(msg);
      }
      if (data.is_valid === false) {
        setInvalidMessage(data.message ?? "このニュースは有効ではありません。");
        setResult(null);
        return;
      }
      setResult(data);
      setSelectedSubject(data.subjects[0] ?? "");
    } catch (e) {
      console.error(e);
      setResult(null);
      setApiError(e instanceof Error ? e.message : "予期せぬエラーが発生しました");
    } finally {
      setLoading(false);
    }
  }, [newsText]);

  useEffect(() => {
    if (!result || !newsText.trim()) return;
    const news = newsText.trim();
    const items: { key: string; subject: string; lens: LensType; type: "plus" | "minus"; content: string }[] = [];
    for (const subject of result.subjects) {
      const analysis = result.analyses[subject];
      if (!analysis) continue;
      for (const config of LENS_CONFIG) {
        items.push({
          key: detailKey(subject, config.type, "plus"),
          subject,
          lens: config.type,
          type: "plus",
          content: analysis[config.type].plus,
        });
        items.push({
          key: detailKey(subject, config.type, "minus"),
          subject,
          lens: config.type,
          type: "minus",
          content: analysis[config.type].minus,
        });
      }
    }

    let index = 0;
    const runNext = async () => {
      if (fetchAbortedRef.current || index >= items.length) return;
      const item = items[index++];
      if (!item) return;
      setDetailsLoading((prev) => ({ ...prev, [item.key]: true }));
      try {
        const res = await fetch("/api/explain-detail", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subject: item.subject,
            lens: LENS_TO_API[item.lens],
            content: item.content,
            news,
          }),
        });
        if (fetchAbortedRef.current) return;
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setDetailsCache((prev) => ({
          ...prev,
          [item.key]: {
            explanation: data.explanation ?? "",
            countries: data.countries ?? [],
          },
        }));
      } catch (e) {
        if (!fetchAbortedRef.current) {
          setDetailsCache((prev) => ({
            ...prev,
            [item.key]: { explanation: "詳細の取得に失敗しました", countries: [] },
          }));
        }
      } finally {
        if (!fetchAbortedRef.current) {
          setDetailsLoading((prev) => ({ ...prev, [item.key]: false }));
        }
        runNext();
      }
    };
    runNext();
    return () => {
      fetchAbortedRef.current = true;
    };
  }, [result, newsText, result?.subjects?.length ?? 0]);

  const handleLensClick = useCallback((type: LensType) => {
    setActiveLens((prev) => (prev === type ? null : type));
  }, []);

  const openMapModal = useCallback(
    (lensType: LensType, label: string, content: string, detailType: "plus" | "minus") => {
      setModalState({
        isOpen: true,
        subject: selectedSubject,
        label,
        content,
        lensType,
        detailType,
      });
    },
    [selectedSubject]
  );

  const closeMapModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const currentAnalysis = result?.analyses?.[selectedSubject];
  const currentDetailKey = modalState.isOpen
    ? detailKey(modalState.subject, modalState.lensType, modalState.detailType)
    : "";
  const cachedDetail = currentDetailKey ? detailsCache[currentDetailKey] : null;
  const detailLoading = currentDetailKey ? detailsLoading[currentDetailKey] : false;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <textarea
          id="news-input"
          value={newsText}
          onChange={(e) => setNewsText(e.target.value)}
          placeholder="ニュース本文を貼り付けてください..."
          rows={5}
          className="w-full rounded-lg border border-zinc-600 bg-zinc-800/80 text-zinc-100 placeholder-zinc-500 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 resize-y"
          disabled={loading}
        />
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={loading || !newsText.trim()}
          className="mt-6 w-28 h-28 rounded-full bg-gradient-to-b from-zinc-100 to-zinc-200 border-[6px] border-zinc-800 text-zinc-900 font-bold text-sm shadow-[inset_0_3px_6px_rgba(255,255,255,0.8),inset_0_-2px_4px_rgba(0,0,0,0.08),0_6px_12px_rgba(0,0,0,0.4),0_2px_4px_rgba(0,0,0,0.3)] hover:bg-gradient-to-b hover:from-zinc-200 hover:to-zinc-300 hover:shadow-[inset_0_3px_6px_rgba(255,255,255,0.9),inset_0_-2px_4px_rgba(0,0,0,0.06),0_8px_16px_rgba(0,0,0,0.45)] active:scale-[0.97] active:shadow-[inset_0_4px_8px_rgba(0,0,0,0.2),0_2px_4px_rgba(0,0,0,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 focus:ring-offset-zinc-900 transition-all flex items-center justify-center"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <span className="inline-block w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />分析中</span>
          ) : (
            <span className="flex items-center justify-center w-20 h-20 rounded-full bg-zinc-900 text-white font-bold text-xs leading-tight text-center px-1">解析する</span>
          )}
        </button>
      </div>

      {apiError && (
        <div className="rounded-lg border border-red-500/50 bg-red-950/30 px-4 py-3 text-sm text-red-300">
          {apiError}
        </div>
      )}

      {!loading && invalidMessage && (
        <div className="rounded-xl border border-zinc-600 bg-zinc-800/80 p-10 text-center">
          <span className="mb-4 block text-3xl" aria-hidden>
            ⚠
          </span>
          <p className="mb-4 text-lg font-medium text-zinc-200">
            このニュースは有効ではありません
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            {invalidMessage}
          </p>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center gap-4 py-12">
          <SprintingStickFigure />
          <p className="text-sm text-zinc-400">{loadingMessage}</p>
        </div>
      )}

      {!loading && result && (
        <>
          {/* 1. タイムライン */}
          {result.timeline && result.timeline.length > 0 && (
            <section className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-6">
              <h2 className="text-lg font-semibold text-zinc-200 mb-6">
                タイムライン
              </h2>
              <div className="relative">
                <div
                  className="absolute left-[0.4375rem] top-3 bottom-3 w-0.5 bg-zinc-600"
                  aria-hidden
                />
                <div className="space-y-0">
                  {result.timeline.map((item, i) => {
                    const isLast = i === result.timeline!.length - 1;
                    return (
                      <div
                        key={i}
                        className="relative flex gap-6 pb-8 last:pb-0 last:mb-0"
                      >
                        <div
                          className={`absolute left-0 flex w-4 justify-center -translate-x-px ${isLast ? "z-10" : ""}`}
                        >
                          <div
                            className={`h-3 w-3 shrink-0 rounded-full ${
                              isLast
                                ? "bg-amber-400 ring-2 ring-amber-400/40 ring-offset-2 ring-offset-zinc-800"
                                : "bg-zinc-500"
                            }`}
                          />
                        </div>
                        <div className="flex min-w-0 flex-1 gap-6 pl-8">
                          <span
                            className={`w-20 shrink-0 text-right text-sm ${
                              isLast ? "font-semibold text-amber-400/90" : "text-zinc-500"
                            }`}
                          >
                            {item.year}
                          </span>
                          <p
                            className={`min-w-0 flex-1 text-sm leading-relaxed ${
                              isLast
                                ? "font-medium text-zinc-100"
                                : "text-zinc-400"
                            }`}
                          >
                            {item.event}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* 2. 視点からの分析 */}
          {currentAnalysis && (
            <section>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {/* 分析対象の選択 */}
                {result.subjects.map((subject) => {
                  const isSelected = selectedSubject === subject;
                  return (
                    <button
                      key={subject}
                      type="button"
                      onClick={() => setSelectedSubject(subject)}
                      className={[
                        "transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900 focus-visible:ring-zinc-400",
                        isSelected
                          ? "px-6 py-3 rounded-xl text-lg font-bold bg-[#F59E0B] text-zinc-900 hover:bg-amber-500"
                          : "px-3 py-1.5 rounded-lg text-sm font-medium bg-zinc-700 text-zinc-300 hover:bg-zinc-600",
                      ].join(" ")}
                    >
                      {subject}
                    </button>
                  );
                })}
                <span className="text-lg font-bold text-zinc-400">の立場で見る</span>
                {result.timeline && result.timeline.length > 0 && (
                  <span className="ml-4 min-w-0 flex-1">
                    <span
                      className="block w-full rounded-lg border border-zinc-600 bg-zinc-800/80 px-4 py-2.5 text-sm leading-relaxed font-medium text-zinc-100"
                      role="presentation"
                    >
                      {result.timeline[result.timeline.length - 1]?.event}
                    </span>
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {LENS_CONFIG.map((config) => (
                  <LensCard
                    key={config.type}
                    type={config.type}
                    label={config.label}
                    purpose={config.purpose}
                    plus={currentAnalysis[config.type].plus}
                    minus={currentAnalysis[config.type].minus}
                    isActive={activeLens === config.type}
                    onClick={() => handleLensClick(config.type)}
                    onPlusClick={() =>
                      openMapModal(config.type, config.label, currentAnalysis[config.type].plus, "plus")
                    }
                    onMinusClick={() =>
                      openMapModal(config.type, config.label, currentAnalysis[config.type].minus, "minus")
                    }
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <MapModal
        isOpen={modalState.isOpen}
        onClose={closeMapModal}
        subject={modalState.subject}
        label={modalState.label}
        content={modalState.content}
        relatedResource={result?.related_resource ?? "none"}
        news={newsText}
        cachedData={cachedDetail}
        isLoading={detailLoading}
      />
    </div>
  );
}
