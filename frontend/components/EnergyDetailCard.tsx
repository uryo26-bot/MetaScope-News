"use client";

import { useState } from "react";
import Link from "next/link";
import { X, DollarSign, Activity, Leaf } from "lucide-react";
import { EnergyType, ImportSource } from "../types/types";
import { ENERGY_DETAILS, ENERGY_NAMES, ENERGY_COLORS } from "../constants/energyDetails";
import { useImportData } from "../hooks/useImportData";
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
  const [selectedCountry, setSelectedCountry] = useState<ImportSource | null>(null);
  const [showAllImportSources, setShowAllImportSources] = useState(false);

  const shouldFetchImportData = energyType === "lng" || energyType === "coal" || energyType === "oil";
  const { importData, loading: importLoading, error: importError } = useImportData(
    shouldFetchImportData ? energyType : null,
    year
  );
  const importSources = shouldFetchImportData && importData.length > 0
    ? importData.map((d) => ({ ...d, color }))
    : detail.importSources;

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
  const isOther = (s: ImportSource) => s.countryCode === "OTHER" && s.country === "その他";

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
        <div className="rounded-2xl p-5 border-2 h-full flex flex-col bg-blue-50/40" style={{ borderColor: color }}>
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

        {/* セクション2: 輸入元の割合（石炭・石油・天然ガスは extractedData_AFpercentage のCSVを使用） */}
        <div className="rounded-2xl p-5 border-2 h-full flex flex-col bg-sky-50/40" style={{ borderColor: color }}>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h3 className="text-xl font-bold">
              <FuriganaText enabled={furiganaEnabled}>輸入元の割合</FuriganaText>
            </h3>
            {(energyType === "lng" || energyType === "coal" || energyType === "oil") && (
              <Link
                href={`/portchart?chart=enechart&id=${energyType}&year=${year}&type=import`}
                className="px-3 py-1.5 rounded-lg bg-slate-700 text-white text-xs font-bold hover:bg-slate-600 transition-colors whitespace-nowrap"
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
            <>
              {!selectedCountry && !showAllImportSources && (
                <p className="text-sm text-gray-600 mb-4">
                  <FuriganaText enabled={furiganaEnabled}>
                    {displaySources.some(isOther) ? "クリックで詳細・その他で一覧表示" : "クリックで各国の詳細情報へ"}
                  </FuriganaText>
                </p>
              )}
              <div className="space-y-3 overflow-y-auto pr-1">
                {displaySources.map((source, index) => (
                  <button
                    key={source.countryCode === "OTHER" ? "other" : index}
                    onClick={() =>
                      isOther(source) ? setShowAllImportSources((v) => !v) : setSelectedCountry(source)
                    }
                    className="w-full flex items-center gap-4 p-3 rounded-xl border-2 bg-white hover:shadow-md transition-all"
                    style={{ borderColor: source.color }}
                  >
                    <div className="flex flex-col items-center gap-1 min-w-[3.5rem]">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                        {source.countryCode}
                      </span>
                      <span className="text-xl">{source.flag}</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-bold mb-1 text-sm">
                        <FuriganaText enabled={furiganaEnabled}>{source.country}</FuriganaText>
                      </div>
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(source.percentage, 100)}%`,
                            backgroundColor: source.color,
                          }}
                        />
                      </div>
                    </div>
                    <div className="font-bold text-sm">{source.percentage}%</div>
                  </button>
                ))}
              </div>

              {/* その他クリック時：下側に残りの国を表示 */}
              {showAllImportSources && sortedSources.length >= 5 && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <p className="text-xs font-bold text-slate-500 mb-3">
                    <FuriganaText enabled={furiganaEnabled}>その他（5位以下）</FuriganaText>
                  </p>
                  <div className="space-y-2">
                    {sortedSources.slice(4).map((source, index) => (
                      <button
                        key={`${source.countryCode ?? ""}-${index}`}
                        onClick={() => setSelectedCountry(toImportSource(source))}
                        className="w-full flex items-center gap-4 p-2 rounded-lg border border-slate-200 bg-white hover:shadow-sm transition-all text-left"
                        style={{ borderColor: source.color }}
                      >
                        <div className="flex flex-col items-center gap-0.5 min-w-[3rem]">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">
                            {source.countryCode}
                          </span>
                          <span className="text-base">{source.flag}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-xs">
                            <FuriganaText enabled={furiganaEnabled}>{source.country}</FuriganaText>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${Math.min(source.percentage, 100)}%`,
                                backgroundColor: source.color,
                              }}
                            />
                          </div>
                        </div>
                        <div className="font-bold text-xs shrink-0">{source.percentage}%</div>
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAllImportSources(false)}
                    className="mt-3 w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg"
                  >
                    <FuriganaText enabled={furiganaEnabled}>閉じる</FuriganaText>
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="text-lg font-bold">
              <FuriganaText enabled={furiganaEnabled}>国内エネルギー源</FuriganaText>
            </p>
          )}
        </div>

        {/* セクション3: 供給プロセス */}
        <div className="rounded-2xl p-5 border-2 h-full flex flex-col bg-orange-50/40" style={{ borderColor: color }}>
          <h3 className="text-xl font-bold mb-4 shrink-0">
            <FuriganaText enabled={furiganaEnabled}>供給プロセス</FuriganaText>
          </h3>
          <ProcessFlow steps={detail.processSteps} furiganaEnabled={furiganaEnabled} borderColor={color} />
        </div>
      </div>

      {/* 拡大カード（輸入元詳細） */}
      {selectedCountry && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setSelectedCountry(null)}
        >
          <div
            className="bg-white rounded-xl p-8 max-w-2xl mx-4 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <div className="text-6xl">{selectedCountry.flag}</div>
                <h2 className="text-3xl font-bold">
                  <FuriganaText enabled={furiganaEnabled}>{selectedCountry.country}</FuriganaText>
                </h2>
              </div>
              <button
                onClick={() => setSelectedCountry(null)}
                className="text-2xl font-bold text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="mb-6">
              <div className="text-2xl font-bold mb-2" style={{ color: selectedCountry.color }}>
                {selectedCountry.percentage}%
              </div>
              <p className="text-lg">
                <FuriganaText enabled={furiganaEnabled}>
                  {selectedCountry.country}から{selectedCountry.percentage}%の{energyName}を輸入しています。
                </FuriganaText>
              </p>
            </div>

            <button
              onClick={() => setSelectedCountry(null)}
              className="px-6 py-3 bg-gray-300 rounded-lg font-bold hover:bg-gray-400 transition-all"
            >
              <FuriganaText enabled={furiganaEnabled}>閉じる</FuriganaText>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
