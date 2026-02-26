"use client";

import { Year } from "../types/types";
import { FuriganaText } from "./Furigana";

interface YearPickerProps {
  selectedYear: Year;
  onYearChange: (year: Year) => void;
  furiganaEnabled: boolean;
}

const YEARS: Year[] = [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010];

export function YearPicker({ selectedYear, onYearChange, furiganaEnabled }: YearPickerProps) {
  const years = YEARS;

  return (
    <div className="flex items-center gap-4 mb-6">
      <FuriganaText enabled={furiganaEnabled}>年度選択</FuriganaText>
      <select
        value={selectedYear}
        onChange={(e) => onYearChange(Number(e.target.value) as Year)}
        className="px-4 py-2 rounded-lg border-2 border-blue-500 text-lg font-bold bg-white hover:border-blue-600 transition-all"
      >
        {years.map((year) => (
          <option key={year} value={year}>
            {year}年
          </option>
        ))}
      </select>
    </div>
  );
}
