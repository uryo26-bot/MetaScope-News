"use client";

import { useState } from "react";
import Link from "next/link";
import type { Crop } from "../../types/crop";
import { FlowCard } from "../metalchart/FlowCard";
import { ShareChart } from "../metalchart/ShareChart";
import { PriceChart } from "../metalchart/PriceChart";
import { useChartImportShare, useChartProductionShare } from "../../hooks/useChartImportShare";

const DATA_YEARS = [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];

const CROP_ICONS: Record<string, string> = {
  rice: "🍚",
  wheat: "🌾",
  corn: "🌽",
  soybean: "🫘",
  coffee: "☕",
  cocoa: "🍫",
  sugarcane: "🎋",
  cotton: "🧵",
  beef: "🥩",
  pork: "🐷",
  chicken: "🍗",
  tuna: "🐟",
  salmon: "🐟",
  shrimp: "🦐",
};

export function CropDetailView({ crop }: { crop: Crop }) {
  const icon = CROP_ICONS[crop.id] ?? "🌱";
  const [dataYear, setDataYear] = useState(2024);
  const { data: productionShareData, loading: productionShareLoading } = useChartProductionShare("agrichart", crop.id, dataYear);
  const { data: importShareData, loading: importShareLoading } = useChartImportShare("agrichart", crop.id, dataYear);
  const globalProductionData = productionShareData.length > 0 ? productionShareData : crop.globalProductionShare;
  const japanImportData = importShareData.length > 0 ? importShareData : crop.japanImportShare;

  return (
    <main className="min-h-screen bg-white p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <Link href="/agricchart" className="inline-flex items-center text-slate-600 hover:text-slate-800 text-sm">
          ← AgriChart 一覧へ
        </Link>

        <section className="bg-gray-100 rounded-2xl shadow-md p-6 flex flex-col sm:flex-row gap-6 items-start">
          <div className="flex items-center gap-4 flex-shrink-0">
            <div
              className="w-20 h-20 rounded-full bg-green-200 flex items-center justify-center text-4xl"
              aria-hidden
            >
              {icon}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">{crop.name}</h1>
              <p className="text-slate-600">{crop.nameEn}</p>
              {crop.subtitle && (
                <p className="text-sm text-slate-500 mt-1">{crop.subtitle}</p>
              )}
              {crop.structureTags && crop.structureTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {crop.structureTags.map((tag) => (
                    <span
                      key={tag.label}
                      className="inline-flex items-center gap-1 rounded-lg bg-white/90 px-2.5 py-1 text-xs font-medium text-slate-700 border border-slate-200"
                    >
                      <span aria-hidden>{tag.emoji}</span>
                      <span>{tag.label}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-2">
              主な用途
            </h2>
            <ul className="flex flex-wrap gap-2">
              {crop.products.map((p) => (
                <li
                  key={p}
                  className="px-3 py-1.5 rounded-lg bg-white/80 text-slate-800 text-sm"
                >
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-slate-600">
              世界の生産国割合・日本の輸入元割合は、選択した年度で切り替わります。
            </p>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              表示年度
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
            <ShareChart
              title={productionShareLoading ? "世界の生産国割合（読み込み中）" : "世界の生産国割合"}
              data={globalProductionData}
              action={
                <Link
                  href={`/portchart?chart=agrichart&id=${encodeURIComponent(crop.id)}&year=${dataYear}&type=production`}
                  className="px-3 py-1.5 rounded-lg bg-slate-700 text-white text-xs font-bold hover:bg-slate-600 transition-colors whitespace-nowrap"
                >
                  PortChartへ（産出国）
                </Link>
              }
            />
            <ShareChart
              title={importShareLoading ? "日本の輸入元割合（読み込み中）" : `日本の輸入元割合（${dataYear}年）`}
              data={japanImportData}
              action={
                <Link
                  href={`/portchart?chart=agrichart&id=${encodeURIComponent(crop.id)}&year=${dataYear}&type=import`}
                  className="px-3 py-1.5 rounded-lg bg-slate-700 text-white text-xs font-bold hover:bg-slate-600 transition-colors whitespace-nowrap"
                >
                  PortChartへ（輸入元）
                </Link>
              }
            />
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FlowCard title="生育・栽培過程" steps={crop.productionFlow} />
          <FlowCard title="供給過程" steps={crop.supplyFlow} />
          <div className="min-h-[240px]">
            <PriceChart data={crop.priceHistory} unit={crop.priceUnit} />
          </div>
        </section>
      </div>
    </main>
  );
}
