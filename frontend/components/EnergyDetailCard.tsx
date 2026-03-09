"use client";

import { useState } from "react";
import Link from "next/link";
import { X, DollarSign, Activity, Leaf } from "lucide-react";
import { EnergyType, ImportSource } from "../types/types";
import { ENERGY_DETAILS, ENERGY_NAMES, ENERGY_COLORS } from "../constants/energyDetails";
import { useImportData } from "../hooks/useImportData";
import { getIso2FromIso3 } from "../lib/countryFlags";
import { ProcessFlow } from "./ProcessFlow";
import { MetricTooltip } from "./MetricTooltip";
import { FuriganaText } from "./Furigana";

interface EnergyDetailCardProps {
  energyType: EnergyType;
  year: number;
  onClose: () => void;
  furiganaEnabled: boolean;
}

export function EnergyDetailCard({ energyType, year, onClose, furiganaEnabled }: EnergyDetailCardProps) {
  const detail = ENERGY_DETAILS[energyType];
  const energyName = ENERGY_NAMES[energyType];
  const color = ENERGY_COLORS[energyType];
  const shouldFetchImportData = energyType === "lng" || energyType === "coal" || energyType === "oil";
  const { importData, loading: importLoading, error: importError } = useImportData(
    shouldFetchImportData ? energyType : null,
    year
  );
  const importSources = shouldFetchImportData && importData.length > 0
    ? importData.map((d) => ({ ...d, color }))
    : detail.importSources;

  const [showAllImportSources, setShowAllImportSources] = useState(false);

  // 5か国以上のときは上位4か国＋「その他」（5位以下を合算）
  const sortedSources = importSources
    ? [...importSources].sort((a, b) => b.percentage - a.percentage)
    : [];
  const toImportSource = (s: typeof sortedSources[number]): ImportSource => ({
    ...s,
    countryCode: s.countryCode ?? "",
    flag: s.flag ?? "🌍",
  });
  const displaySources: ImportSource[] =
    sortedSources.length >= 5
      ? [
          ...sortedSources.slice(0, 4).map(toImportSource),
          {
            country: "その他",
            percentage: Math.round(sortedSources.slice(4).reduce((sum, x) => sum + x.percentage, 0) * 100) / 100,
            countryCode: "OTHER",
            flag: "🌍",
            color,
          },
        ]
      : sortedSources.map(toImportSource);

  // 星評価の表示
  const renderStars = (score: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < score ? "text-yellow-400" : "text-gray-300"}>
        ★
      </span>
    ));
  };

  return (
    <div
      className="mt-4 p-6 rounded-xl shadow-lg w-full bg-white border-4"
      style={{ borderColor: color }}
    >
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
            style={{ backgroundColor: color }}
          >
            {energyType === "lng" && "🔥"}
            {energyType === "coal" && "⛏️"}
            {energyType === "oil" && "⛽"}
            {energyType === "nuclear" && "⚛️"}
            {energyType === "hydro" && "💧"}
            {energyType === "wind" && "🌬️"}
            {energyType === "geothermal" && "🌋"}
            {energyType === "biomass" && "🌾"}
            {energyType === "solar" && "☀️"}
          </div>
          <h2 className="text-2xl font-bold">
            <FuriganaText enabled={furiganaEnabled}>{energyName}の詳細</FuriganaText>
          </h2>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 transition-all"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* 3カラムレイアウト：評価指標 / 輸入元の割合 / 発電プロセスフロー */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* セクション1: 評価指標 */}
        <div className="rounded-2xl p-5 border-2 h-full flex flex-col min-w-0 overflow-hidden bg-blue-50/40" style={{ borderColor: color }}>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FuriganaText enabled={furiganaEnabled}>評価指標</FuriganaText>
          </h3>
          <div className="flex flex-col gap-3">
            {/* コスト */}
            <div className="flex gap-3 p-3 rounded-xl bg-white shadow-sm border border-blue-100">
              <div className="flex items-start justify-center">
                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold">
                    <FuriganaText enabled={furiganaEnabled}>コスト</FuriganaText>
                  </span>
                  <MetricTooltip description={detail.metrics.cost.description} furiganaEnabled={furiganaEnabled} />
                </div>
                <div className="text-lg font-bold mb-1">
                  <FuriganaText enabled={furiganaEnabled}>{detail.metrics.cost.value}</FuriganaText>
                </div>
                <div className="flex items-center gap-1 text-sm mb-1">{renderStars(detail.metrics.cost.score)}</div>
                <p className="text-xs text-gray-600 leading-snug">
                  <FuriganaText enabled={furiganaEnabled}>{detail.metrics.cost.description}</FuriganaText>
                </p>
              </div>
            </div>

            {/* 供給安定性 */}
            <div className="flex gap-3 p-3 rounded-xl bg-white shadow-sm border border-green-100">
              <div className="flex items-start justify-center">
                <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold">
                    <FuriganaText enabled={furiganaEnabled}>供給安定性</FuriganaText>
                  </span>
                  <MetricTooltip description={detail.metrics.stability.description} furiganaEnabled={furiganaEnabled} />
                </div>
                <div className="text-lg font-bold mb-1">
                  <FuriganaText enabled={furiganaEnabled}>{detail.metrics.stability.value}</FuriganaText>
                </div>
                <div className="flex items-center gap-1 text-sm mb-1">{renderStars(detail.metrics.stability.score)}</div>
                <p className="text-xs text-gray-600 leading-snug">
                  <FuriganaText enabled={furiganaEnabled}>{detail.metrics.stability.description}</FuriganaText>
                </p>
              </div>
            </div>

            {/* 環境負荷 */}
            <div className="flex gap-3 p-3 rounded-xl bg-white shadow-sm border border-emerald-100">
              <div className="flex items-start justify-center">
                <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold">
                    <FuriganaText enabled={furiganaEnabled}>環境負荷</FuriganaText>
                  </span>
                  <MetricTooltip
                    description={detail.metrics.environmental.description}
                    furiganaEnabled={furiganaEnabled}
                  />
                </div>
                <div className="text-lg font-bold mb-1">
                  <FuriganaText enabled={furiganaEnabled}>{detail.metrics.environmental.value}</FuriganaText>
                </div>
                <div className="flex items-center gap-1 text-sm mb-1">
                  {renderStars(detail.metrics.environmental.score)}
                </div>
                <p className="text-xs text-gray-600 leading-snug">
                  <FuriganaText enabled={furiganaEnabled}>{detail.metrics.environmental.description}</FuriganaText>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* セクション2: 輸入元の割合（電源割合と同様の棒グラフ形式） */}
        <div className="rounded-2xl p-5 border-2 h-full flex flex-col min-w-0 overflow-hidden bg-sky-50/40" style={{ borderColor: color }}>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h3 className="text-xl font-bold">
              <FuriganaText enabled={furiganaEnabled}>
                {shouldFetchImportData ? `日本の輸入元割合（${year}年）` : "輸入元の割合"}
              </FuriganaText>
            </h3>
            {(energyType === "lng" || energyType === "coal" || energyType === "oil") && (
              <Link
                href={`/portchart?chart=enechart&id=${energyType}&year=${year}&type=import`}
                className="px-3 py-1.5 rounded-lg text-white text-xs font-bold transition-colors whitespace-nowrap hover:opacity-90"
                style={{ backgroundColor: color }}
              >
                PortChartへ（輸入元）
              </Link>
            )}
          </div>
          {importLoading ? (
            <p className="text-sm text-gray-600">
              <FuriganaText enabled={furiganaEnabled}>読み込み中...</FuriganaText>
            </p>
          ) : importError ? (
            <p className="text-sm text-red-600">
              <FuriganaText enabled={furiganaEnabled}>エラー: {importError}</FuriganaText>
            </p>
          ) : displaySources.length > 0 ? (
            <div className="space-y-3 flex-1 min-h-0 overflow-y-auto">
              {displaySources.map((source, index) => {
                const barWidth = Math.min(source.percentage, 100);
                const percentageDisplay = Math.round(source.percentage * 10) / 10;
                const isOther = source.countryCode === "OTHER";
                const otherSources = sortedSources.length >= 5 ? sortedSources.slice(4) : [];
                return (
                  <div
                    key={isOther ? "other" : index}
                    role={isOther ? "button" : undefined}
                    tabIndex={isOther ? 0 : undefined}
                    onClick={isOther ? () => setShowAllImportSources((v) => !v) : undefined}
                    onKeyDown={isOther ? (e) => e.key === "Enter" && setShowAllImportSources((v) => !v) : undefined}
                    className={`flex items-center gap-4 p-3 rounded-lg bg-white shadow-sm border border-slate-100 ${isOther ? "cursor-pointer hover:bg-slate-50 transition-colors" : ""}`}
                  >
                    {/* 国名と国旗（棒グラフの左側・固定幅で開始位置を揃える） */}
                    <div className="flex items-center gap-2 w-[10rem] shrink-0">
                      {source.countryCode && source.countryCode !== "OTHER" && getIso2FromIso3(source.countryCode) ? (
                        <img
                          src={`/flags/${getIso2FromIso3(source.countryCode)!.toLowerCase()}.svg`}
                          alt=""
                          className="h-5 w-8 shrink-0 rounded object-cover"
                          aria-hidden
                        />
                      ) : (
                        <span className="text-lg shrink-0">{source.flag}</span>
                      )}
                      <span className="font-bold text-base break-words whitespace-normal">
                        <FuriganaText enabled={furiganaEnabled}>{source.country}</FuriganaText>
                      </span>
                    </div>

                    {/* 棒グラフ（中央） */}
                    <div className="flex-1 relative h-10 min-w-0">
                      <div
                        className="h-full rounded-lg transition-all"
                        style={{
                          width: barWidth + "%",
                          backgroundColor: color,
                        }}
                      />
                    </div>

                    {/* 割合（右） */}
                    <div className="text-right font-bold text-base shrink-0" style={{ width: "3rem" }}>
                      {percentageDisplay}%
                    </div>
                  </div>
                );
              })}
              {/* その他（5位以下）の展開リスト */}
              {showAllImportSources && sortedSources.length >= 5 && (
                <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-slate-600">その他（5位以下）</span>
                    <button
                      onClick={() => setShowAllImportSources(false)}
                      className="text-xs font-bold px-2 py-1 rounded hover:bg-slate-200 transition-colors"
                    >
                      閉じる
                    </button>
                  </div>
                  {sortedSources.slice(4).map((source, idx) => {
                    const s = toImportSource(source);
                    const barWidth = Math.min(s.percentage, 100);
                    const pct = Math.round(s.percentage * 10) / 10;
                    const iso2 = s.countryCode && s.countryCode !== "OTHER" ? getIso2FromIso3(s.countryCode) : null;
                    return (
                      <div
                        key={s.countryCode || idx}
                        className="flex items-center gap-4 p-2 rounded-lg bg-slate-50 border border-slate-100"
                      >
                        {/* 国名と国旗（棒グラフの左側・固定幅で開始位置を揃える） */}
                        <div className="flex items-center gap-2 w-[10rem] shrink-0">
                          {iso2 ? (
                            <img
                              src={`/flags/${iso2.toLowerCase()}.svg`}
                              alt=""
                              className="h-4 w-6 shrink-0 rounded object-cover"
                              aria-hidden
                            />
                          ) : (
                            <span className="text-base shrink-0">{s.flag}</span>
                          )}
                          <span className="font-bold text-base break-words whitespace-normal">
                            <FuriganaText enabled={furiganaEnabled}>{s.country}</FuriganaText>
                          </span>
                        </div>
                        <div className="flex-1 relative h-8 min-w-0">
                          <div
                            className="h-full rounded-lg transition-all"
                            style={{ width: barWidth + "%", backgroundColor: color }}
                          />
                        </div>
                        <div className="text-right font-bold text-base shrink-0" style={{ width: "3rem" }}>
                          {pct}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <p className="text-lg font-bold">
              <FuriganaText enabled={furiganaEnabled}>国内エネルギー源</FuriganaText>
            </p>
          )}
        </div>

        {/* セクション3: 供給プロセス */}
        <div className="rounded-2xl p-5 border-2 h-full flex flex-col min-w-0 overflow-hidden bg-orange-50/40" style={{ borderColor: color }}>
          <h3 className="text-xl font-bold mb-4 shrink-0">
            <FuriganaText enabled={furiganaEnabled}>供給プロセス</FuriganaText>
          </h3>
          <ProcessFlow steps={detail.processSteps} furiganaEnabled={furiganaEnabled} borderColor={color} />
        </div>
      </div>
    </div>
  );
}
