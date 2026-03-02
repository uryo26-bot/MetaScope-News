"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { LensCard } from "./LensCard";
import { MapMakingStickFigure } from "./MapMakingStickFigure";
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
  { type: "domestic", label: "国内政治", purpose: "政権の維持と政策実現" },
  { type: "international", label: "国際政治", purpose: "国益の確保と安全保障" },
  { type: "economic", label: "経済", purpose: "成長・安定・資源確保" },
];

const LENS_TO_API: Record<LensType, string> = {
  domestic: "domestic",
  international: "international",
  economic: "economic",
};

const LOADING_MESSAGES = [
  "主題を認識中",
  "タイムラインを整理中",
  "主語を整理中",
  "影響範囲ごとにメリット・デメリットを整理中",
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
            ? "バックエンドに接続できません。backend フォルダで uvicorn backend.app:app --reload を実行しているか確認してください。"
            : `エラーが発生しました（HTTP ${res.status}）`);
        throw new Error(msg);
      }
      if (data.is_valid === false) {
        setInvalidMessage(data.message ?? "構造分析に適したトピックを入力してください。");
        setResult(null);
        return;
      }
      setResult(data);
      setSelectedSubject(data.subjects[0] ?? "");
    } catch (e) {
      console.error(e);
      setResult(null);
      setApiError(e instanceof Error ? e.message : "エラーが発生しました");
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
            [item.key]: { explanation: "取得に失敗しました。", countries: [] },
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
        <label htmlFor="news-input" className="block text-sm font-medium text-zinc-400 mb-2">
          ニューステキスト
        </label>
        <textarea
          id="news-input"
          value={newsText}
          onChange={(e) => setNewsText(e.target.value)}
          placeholder="ニュースのテキストを貼り付けてください…"
          rows={5}
          className="w-full rounded-lg border border-zinc-600 bg-zinc-800/80 text-zinc-100 placeholder-zinc-500 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 resize-y"
          disabled={loading}
        />
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={loading || !newsText.trim()}
          className="mt-3 px-6 py-2.5 rounded-lg bg-zinc-600 text-zinc-100 font-medium hover:bg-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-900 transition-colors"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <span className="inline-block w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
              分析中…
            </span>
          ) : (
            "構造を読む"
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
            🔍
          </span>
          <p className="mb-4 text-lg font-medium text-zinc-200">
            構造を読むのが難しそうです
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            {invalidMessage}
          </p>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center gap-4 py-12">
          {loadingMessage === LOADING_MESSAGES[LOADING_MESSAGES.length - 1] ? (
            <MapMakingStickFigure />
          ) : (
            <span
              className="inline-block h-10 w-10 border-2 border-zinc-500 border-t-zinc-200 rounded-full animate-spin"
              aria-hidden
            />
          )}
          <p className="text-sm text-zinc-400">{loadingMessage}</p>
        </div>
      )}

      {!loading && result && (
        <>
          {/* 1. 主体選択エリア */}
          <section>
            <h2 className="text-sm font-medium text-zinc-500 mb-3">主体を選択</h2>
            <div className="flex flex-wrap gap-2">
              {result.subjects.map((subject) => {
                const isSelected = selectedSubject === subject;
                return (
                  <button
                    key={subject}
                    type="button"
                    onClick={() => setSelectedSubject(subject)}
                    className={[
                      "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900 focus-visible:ring-zinc-400",
                      isSelected
                        ? "bg-[#F59E0B] text-zinc-900 hover:bg-amber-500"
                        : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600",
                    ].join(" ")}
                  >
                    {subject}
                  </button>
                );
              })}
            </div>
          </section>

          {/* 2. タイムライン */}
          {result.timeline && result.timeline.length > 0 && (
            <section className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-6">
              <h2 className="text-lg font-semibold text-zinc-200 mb-6">
                このニュースの経緯
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

          {/* 3. 分析カード */}
          {currentAnalysis && (
            <section>
              <h2 className="text-sm font-medium text-zinc-500 mb-3">
                {selectedSubject} の分析
              </h2>
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
