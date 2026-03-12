"use client";

import { useState } from "react";
import Link from "next/link";
import { X, DollarSign, Activity, Leaf } from "lucide-react";

type ExpandedMetric = "cost" | "stability" | "environmental" | null;
import { EnergyType } from "../types/types";
import { ENERGY_DETAILS, ENERGY_NAMES, ENERGY_COLORS } from "../constants/energyDetails";
import { useChartImportShare } from "../hooks/useChartImportShare";
import { ShareChart } from "./metalchart/ShareChart";
import { FuriganaText } from "./Furigana";

const DATA_YEARS = [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];

const ENERGY_ICONS: Record<EnergyType, string> = {
  lng: "🔥",
  coal: "⛏️",
  oil: "⛽",
  nuclear: "⚛️",
  hydro: "💧",
  wind: "🌬️",
  geothermal: "🌋",
  biomass: "🌾",
  solar: "☀️",
};

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
  const icon = ENERGY_ICONS[energyType];
  const hasImportData = energyType === "lng" || energyType === "coal" || energyType === "oil";

  const [dataYear, setDataYear] = useState(year);
  const [expandedMetric, setExpandedMetric] = useState<ExpandedMetric>(null);
  const { data: importShareData, loading: importShareLoading } = useChartImportShare(
    "enechart",
    hasImportData ? energyType : undefined,
    dataYear
  );
  // APIデータが空の場合は静的データ（ENERGY_DETAILS）をフォールバック
  const staticImportData =
    hasImportData && detail.importSources
      ? detail.importSources.map((s) => ({
          country: s.country,
          value: s.percentage,
          country_code: s.countryCode !== "OTHER" ? s.countryCode : undefined,
        }))
      : [];
  const japanImportData = importShareData.length > 0 ? importShareData : staticImportData;

  // 星評価の表示（size: sm=ヘッダー用コンパクト, md=通常）
  const renderStars = (score: number, size: "sm" | "md" = "md") => {
    const sizeClass = size === "sm" ? "text-xs" : "text-sm";
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`${i < score ? "text-yellow-400" : "text-gray-300"} ${sizeClass}`}>
        ★
      </span>
    ));
  };

  return (
    <div className="mt-4 w-full max-w-6xl mx-auto space-y-8">
      {/* ヘッダー（MetalChart/AgriChart形式）+ 評価指標（右側） */}
      <section className="bg-gray-100 rounded-2xl shadow-md p-6 flex flex-col sm:flex-row gap-6 items-start justify-between">
        <div className="flex items-center gap-4 flex-shrink-0 min-w-0">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-4xl shrink-0"
            style={{ backgroundColor: color + "40" }}
            aria-hidden
          >
            {icon}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-slate-800">
                <FuriganaText enabled={furiganaEnabled}>{energyName}の詳細</FuriganaText>
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 transition-all text-slate-800 shrink-0"
                aria-label="閉じる"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-slate-600 text-sm mt-1">
              <FuriganaText enabled={furiganaEnabled}>発電電源</FuriganaText>
            </p>
          </div>
        </div>
        <div className="inline-flex flex-col items-end shrink-0">
          <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setExpandedMetric((m) => (m === "cost" ? null : "cost"))}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-base font-medium transition-colors whitespace-nowrap ${
              expandedMetric === "cost" ? "bg-blue-100 ring-1 ring-blue-300" : "bg-white/80 hover:bg-slate-100"
            }`}
          >
            <DollarSign className="w-5 h-5 text-blue-600 shrink-0" />
            <span className="text-slate-700">コスト</span>
            <span className="flex gap-0.5">{renderStars(detail.metrics.cost.score, "sm")}</span>
          </button>
          <button
            type="button"
            onClick={() => setExpandedMetric((m) => (m === "stability" ? null : "stability"))}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-base font-medium transition-colors whitespace-nowrap ${
              expandedMetric === "stability" ? "bg-green-100 ring-1 ring-green-300" : "bg-white/80 hover:bg-slate-100"
            }`}
          >
            <Activity className="w-5 h-5 text-green-600 shrink-0" />
            <span className="text-slate-700">供給安定性</span>
            <span className="flex gap-0.5">{renderStars(detail.metrics.stability.score, "sm")}</span>
          </button>
          <button
            type="button"
            onClick={() => setExpandedMetric((m) => (m === "environmental" ? null : "environmental"))}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-base font-medium transition-colors whitespace-nowrap ${
              expandedMetric === "environmental" ? "bg-emerald-100 ring-1 ring-emerald-300" : "bg-white/80 hover:bg-slate-100"
            }`}
          >
            <Leaf className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-slate-700">環境負荷</span>
            <span className="flex gap-0.5">{renderStars(detail.metrics.environmental.score, "sm")}</span>
          </button>
          </div>
          {expandedMetric && (
            <div className="mt-3 w-full p-3 rounded-lg bg-white/90 text-sm text-slate-700 text-left">
              <FuriganaText enabled={furiganaEnabled}>
                {expandedMetric === "cost" && detail.metrics.cost.description}
                {expandedMetric === "stability" && detail.metrics.stability.description}
                {expandedMetric === "environmental" && detail.metrics.environmental.description}
              </FuriganaText>
            </div>
          )}
        </div>
      </section>

      {/* ShareChart セクション（MetalChart/AgriChart形式） */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-slate-600">
            <FuriganaText enabled={furiganaEnabled}>
              日本の輸入元割合は、選択した年度で切り替わります。
            </FuriganaText>
          </p>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <FuriganaText enabled={furiganaEnabled}>表示年度</FuriganaText>
            <select
              value={dataYear}
              onChange={(e) => setDataYear(Number(e.target.value))}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              {DATA_YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}年
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 世界の産出国割合：電源のため該当なし */}
          <div className="bg-gray-100 rounded-2xl shadow-md p-6 flex flex-col justify-center min-h-[300px]">
            <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-4">
              <FuriganaText enabled={furiganaEnabled}>世界の産出国割合</FuriganaText>
            </h3>
            <p className="text-slate-600 text-sm">
              <FuriganaText enabled={furiganaEnabled}>
                電源のため、世界の産出国割合は該当しません。
              </FuriganaText>
            </p>
          </div>

          {/* 日本の輸入元割合 */}
          {hasImportData ? (
            <ShareChart
              key={`import-${dataYear}`}
              title={
                importShareLoading
                  ? "日本の輸入元割合（読み込み中）"
                  : `日本の輸入元割合（${dataYear}年）`
              }
              data={japanImportData}
              variant="enechart"
              accentColor={color}
              collapsible
              powerStyleBar
              action={
                <Link
                  href={`/portchart?chart=enechart&id=${energyType}&year=${dataYear}&type=import`}
                  className="px-3 py-1.5 rounded-lg bg-slate-700 text-white text-xs font-bold hover:bg-slate-600 transition-colors whitespace-nowrap"
                >
                  PortChartへ（輸入元）
                </Link>
              }
            />
          ) : (
            <div className="bg-gray-100 rounded-2xl shadow-md p-6 flex flex-col justify-center min-h-[300px]">
              <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-4">
                <FuriganaText enabled={furiganaEnabled}>日本の輸入元割合</FuriganaText>
              </h3>
              <p className="text-lg font-bold text-slate-800">
                <FuriganaText enabled={furiganaEnabled}>国内エネルギー源</FuriganaText>
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 世界地図UIへ */}
      <div className="flex justify-center pt-4">
        <Link
          href={
            hasImportData
              ? `/portchart?chart=enechart&id=${energyType}&year=${dataYear}&type=import`
              : "/portchart"
          }
          className="px-6 py-3 rounded-lg bg-slate-700 text-white font-medium hover:bg-slate-600 transition-colors"
        >
          世界地図UIへ
        </Link>
      </div>
    </div>
  );
}
