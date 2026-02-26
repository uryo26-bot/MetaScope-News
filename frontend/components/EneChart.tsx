"use client";

import { useState, useMemo } from "react";
import { Year, EnergyType } from "../types/types";
import { ENERGY_COLORS, ENERGY_NAMES, YEAR_STATS } from "../constants/energyDetails";
import { YearPicker } from "./YearPicker";
import { PowerInfoModal } from "./PowerInfoModal";
import { EnergyDetailCard } from "./EnergyDetailCard";
import { FuriganaText } from "./Furigana";

interface EneChartProps {
  energyData: Array<{
    energy: string;
    percentage: number;
    year: number;
    amount?: number;
  }>;
  furiganaEnabled: boolean;
}

// 電源名からEnergyTypeへのマッピング
const ENERGY_NAME_TO_TYPE: Record<string, EnergyType> = {
  天然ガス: "lng",
  石炭: "coal",
  石油: "oil",
  石油等: "oil",
  原子力: "nuclear",
  水力: "hydro",
  風力: "wind",
  地熱: "geothermal",
  バイオマス: "biomass",
  太陽光: "solar",
};

// 詳細カードがない電源用の色（未定義の電源名用）
const FALLBACK_ENERGY_COLORS: Record<string, string> = {};

export function EneChart({ energyData, furiganaEnabled }: EneChartProps) {
  const [selectedYear, setSelectedYear] = useState<Year>(2024);
  const [selectedEnergyName, setSelectedEnergyName] = useState<string | null>(null);

  // 選択年度のデータをフィルタリングし、割合の大きい順にソート
  const displayData = useMemo(() => {
    return energyData
      .filter((d) => d.year === selectedYear)
      .sort((a, b) => b.percentage - a.percentage)
      .map((d) => ({
        ...d,
        energyType: ENERGY_NAME_TO_TYPE[d.energy] ?? null,
      }));
  }, [energyData, selectedYear]);

  // クリックされた電源のEnergyType（詳細カードがある場合のみ非null）
  const selectedEnergyType = selectedEnergyName !== null ? ENERGY_NAME_TO_TYPE[selectedEnergyName] ?? null : null;

  // 年度別統計を取得
  const yearStats = YEAR_STATS[selectedYear];

  // 棒グラフのクリックハンドラ
  const handleBarClick = (entry: { energy: string }) => {
    setSelectedEnergyName(entry.energy);
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-8">
      {/* 年度選択と電力情報 */}
      <div className="flex items-center justify-between mb-8">
        <YearPicker selectedYear={selectedYear} onYearChange={setSelectedYear} furiganaEnabled={furiganaEnabled} />
        <PowerInfoModal
          consumption={yearStats.consumption}
          generation={yearStats.generation}
          year={selectedYear}
          furiganaEnabled={furiganaEnabled}
        />
      </div>

      {/* タイトル */}
      <h1 className="text-4xl font-bold mb-8 text-center">
        <FuriganaText enabled={furiganaEnabled}>{selectedYear}年 日本の電源割合</FuriganaText>
      </h1>

      {/* 棒グラフ */}
      <div className="bg-white rounded-xl p-8 border-4 border-blue-500 shadow-lg mb-8">
        <div className="space-y-4">
          {displayData.map((entry, index) => {
            const isSelected = selectedEnergyName === entry.energy;
            const color =
              entry.energyType !== null
                ? ENERGY_COLORS[entry.energyType]
                : FALLBACK_ENERGY_COLORS[entry.energy] ?? "#94a3b8";
            const showPercentageInside = entry.percentage >= 5;
            const barWidth = (entry.percentage / 40) * 100;
            const percentageDisplay = Math.round(entry.percentage * 10) / 10;

            return (
              <div
                key={index}
                className="flex items-center gap-6 p-4 rounded-lg hover:shadow-md transition-all cursor-pointer"
                onClick={() => handleBarClick(entry)}
                style={{
                  border: isSelected ? `3px solid ${color}` : "none",
                  opacity: isSelected ? 1 : 0.4,
                }}
              >
                {/* 電源名（左） */}
                <div className="w-32 font-bold text-xl">
                  <FuriganaText enabled={furiganaEnabled}>{entry.energy}</FuriganaText>
                </div>

                {/* 棒グラフ（中央） */}
                <div className="flex-1 relative h-12 bg-gray-200 rounded-lg overflow-hidden">
                  <div
                    className="h-full rounded-lg flex items-center transition-all"
                    style={{
                      width: `${barWidth}%`,
                      backgroundColor: color,
                    }}
                  >
                    {showPercentageInside && (
                      <span className="text-white font-bold text-lg ml-4">{percentageDisplay}%</span>
                    )}
                  </div>
                  {!showPercentageInside && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-lg">
                      {percentageDisplay}%
                    </span>
                  )}
                </div>

                {/* 発電量（右） */}
                <div className="w-32 text-right font-bold text-lg">
                  {entry.amount || Math.round((entry.percentage / 100) * yearStats.generation)}
                  <FuriganaText enabled={furiganaEnabled}>億kWh</FuriganaText>
                </div>
              </div>
            );
          })}
        </div>

        {/* 目盛り（0%, 10%, 20%, 30%, 40%）— 棒グラフの幅に合わせて配置 */}
        <div className="flex items-center gap-6 px-4 mt-4">
          <div className="w-32 shrink-0" />
          <div className="flex-1 relative h-6">
            {[0, 10, 20, 30, 40].map((value) => (
              <span
                key={value}
                className="absolute text-sm font-bold -translate-x-1/2"
                style={{ left: `${(value / 40) * 100}%` }}
              >
                {value}%
              </span>
            ))}
          </div>
          <div className="w-32 shrink-0" />
        </div>
      </div>

      {/* ガイダンステキスト */}
      {selectedEnergyType ? (
        <p className="text-center text-lg font-bold mb-4">
          <FuriganaText enabled={furiganaEnabled}>
            {ENERGY_NAMES[selectedEnergyType]}の詳細情報が表示されています
          </FuriganaText>
        </p>
      ) : (
        <p className="text-center text-lg font-bold mb-4">
          <FuriganaText enabled={furiganaEnabled}>各電源をクリックすると詳細情報が表示されます</FuriganaText>
        </p>
      )}

      {/* エネルギー詳細カード */}
      {selectedEnergyType && (
        <EnergyDetailCard
          energyType={selectedEnergyType}
          year={selectedYear}
          onClose={() => setSelectedEnergyName(null)}
          furiganaEnabled={furiganaEnabled}
        />
      )}
    </div>
  );
}
