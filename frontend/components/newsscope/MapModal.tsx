"use client";

import { useState, useEffect, useCallback } from "react";
import { MapMakingStickFigure } from "./MapMakingStickFigure";

type MapModalProps = {
  isOpen: boolean;
  onClose: () => void;
  subject: string;
  label: string;
  content: string;
  relatedResource: "oil" | "lng" | "coal" | "none";
  news: string;
  cachedData?: { explanation: string; countries: { name: string; role: string; type: string }[] } | null;
  isLoading?: boolean;
};

type CountryItem = {
  name: string;
  role: string;
  type: "ally" | "rival" | "neutral" | "subject";
};

type ExplainDetailResponse = {
  explanation: string;
  countries: CountryItem[];
};

function getColorByType(type: CountryItem["type"]): string {
  switch (type) {
    case "ally":
      return "#22c55e";
    case "rival":
      return "#ef4444";
    case "subject":
      return "#F59E0B";
    case "neutral":
    default:
      return "#71717a";
  }
}

export function MapModal({
  isOpen,
  onClose,
  subject,
  label,
  content,
  news,
  cachedData,
  isLoading = false,
}: MapModalProps) {
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<string>("");
  const [countries, setCountries] = useState<CountryItem[]>([]);
  const useCached = Boolean(cachedData);
  const displayExplanation = useCached ? (cachedData?.explanation ?? "") : explanation;
  const displayCountries = useCached
    ? (cachedData?.countries ?? []).map((c) => ({
        name: c.name,
        role: c.role,
        type: c.type as CountryItem["type"],
      }))
    : countries;
  const showMapMakingLoading = !cachedData && (isLoading || loading);

  const fetchDetail = useCallback(async () => {
    if (!content || !news || cachedData) return;
    setLoading(true);
    setExplanation("");
    setCountries([]);
    try {
      const res = await fetch("/api/explain-detail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          lens: label === "国内政治" ? "domestic" : label === "国際政治" ? "international" : "economic",
          content,
          news,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: ExplainDetailResponse = await res.json();
      setExplanation(data.explanation ?? "");
      setCountries(data.countries ?? []);
    } catch (e) {
      console.error(e);
      setExplanation("詳細の取得に失敗しました。");
    } finally {
      setLoading(false);
    }
  }, [subject, label, content, news, cachedData]);

  useEffect(() => {
    if (isOpen && content && news && !cachedData && !isLoading) {
      fetchDetail();
    }
  }, [isOpen, content, news, cachedData, isLoading, fetchDetail]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="map-modal-title"
    >
      <div
        className="relative flex h-[90vh] w-full max-w-[1200px] overflow-hidden rounded-xl border border-zinc-600 bg-zinc-900 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 左側 40% */}
        <div className="flex w-[40%] min-w-0 flex-col border-r border-zinc-700">
          {/* ヘッダー */}
          <div className="flex shrink-0 items-center justify-between border-b border-zinc-700 px-4 py-3">
            <h2 id="map-modal-title" className="text-base font-semibold text-zinc-100">
              {subject} の {label}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded p-2 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
              aria-label="閉じる"
            >
              <span className="text-xl leading-none">×</span>
            </button>
          </div>

          {/* 説明文 */}
          <div className="shrink-0 border-b border-zinc-700 px-4 py-4">
            {showMapMakingLoading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-8">
                <MapMakingStickFigure />
                <p className="text-sm text-zinc-400">地図で整理中</p>
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center py-8">
                <span
                  className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-zinc-500 border-t-zinc-200"
                  aria-hidden
                />
              </div>
            ) : displayExplanation ? (
              <p className="text-sm leading-relaxed text-zinc-300">{displayExplanation}</p>
            ) : null}
          </div>
        </div>

        {/* 右側 60% - 関連する国リスト */}
        <div className="relative flex min-h-0 w-[60%] flex-col overflow-y-auto bg-zinc-800 p-4">
          {showMapMakingLoading ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4">
              <MapMakingStickFigure />
              <p className="text-sm text-zinc-400">地図で整理中</p>
            </div>
          ) : !loading && displayCountries.length > 0 ? (
            <div className="countries-list space-y-2">
              <p className="mb-3 text-xs font-medium text-zinc-500">関連する国</p>
              {displayCountries.map((country) => (
                <div
                  key={`${country.name}-${country.role}`}
                  className="country-item flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-zinc-700"
                >
                  <span
                    className={`dot ${country.type} h-3 w-3 shrink-0 rounded-full`}
                    style={{ backgroundColor: getColorByType(country.type) }}
                    aria-hidden
                  />
                  <span className="name truncate text-sm font-medium text-zinc-200">{country.name}</span>
                  <span className="role text-xs text-zinc-400">{country.role}</span>
                </div>
              ))}
            </div>
          ) : !loading && displayCountries.length === 0 && displayExplanation ? (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-sm text-zinc-500">関連する国がありません</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
