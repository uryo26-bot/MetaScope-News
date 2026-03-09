"use client";

import { Year } from "../types/types";
import { FuriganaText } from "./Furigana";

interface YearPickerProps {
  selectedYear: Year;
  onYearChange: (year: Year) => void;
  furiganaEnabled: boolean;
}

const YEARS: Year[] = [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];
const MIN_INDEX = 0;
const MAX_INDEX = YEARS.length - 1;

export function YearPicker({ selectedYear, onYearChange, furiganaEnabled }: YearPickerProps) {
  const selectedIndex = YEARS.indexOf(selectedYear);
  const safeIndex = selectedIndex >= 0 ? selectedIndex : MIN_INDEX;
  const value = Math.max(MIN_INDEX, Math.min(MAX_INDEX, safeIndex));

  return (
    <div className="flex flex-col gap-2 mb-6">
      <div className="flex items-center justify-between">
        <FuriganaText enabled={furiganaEnabled}>年度選択</FuriganaText>
        <span className="text-lg font-bold text-blue-600">{selectedYear}年</span>
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={MIN_INDEX}
            max={MAX_INDEX}
            value={value}
            onChange={(e) => onYearChange(YEARS[Number(e.target.value)] as Year)}
            className="flex-1 h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:hover:bg-blue-600 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-blue-500 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
          />
        </div>
        {/* 各年度のメモリ（スライダー位置に合わせて絶対配置） */}
        <div className="relative h-8 mt-1">
          {YEARS.map((year, i) => (
            <div
              key={year}
              className="absolute flex flex-col items-center gap-0.5 -translate-x-1/2"
              style={{ left: `${(i / MAX_INDEX) * 100}%` }}
            >
              <span
                className={`w-px h-2 shrink-0 ${
                  year === selectedYear ? "bg-blue-500" : "bg-slate-300"
                }`}
                aria-hidden
              />
              <button
                type="button"
                onClick={() => onYearChange(year)}
                className={`text-[10px] sm:text-xs font-medium transition-colors whitespace-nowrap ${
                  year === selectedYear ? "text-blue-600 font-bold" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {year}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
