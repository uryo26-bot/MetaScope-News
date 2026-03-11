/**
 * countries-stats.json の読み込み・マージ用。
 * 年度ごとの人口・GDPなどを一元管理。
 */

import countriesData from "../data/countries.json";
import statsData from "../data/countries-stats.json";

export type CountryBase = {
  iso2: string | null;
  iso3: string;
  nameEn: string;
  nameJa: string;
  region: string;
  regionJa: string;
};

export type CountryStats = {
  population: number | null;
  gdp?: number | null;
};

export type CountryWithStats = CountryBase & CountryStats;

const countries = countriesData as Record<string, CountryBase>;
const stats = statsData as { meta?: { defaultYear?: string }; [year: string]: Record<string, CountryStats> };

/** デフォルト年度（stats の meta.defaultYear、なければ最新年度） */
function getDefaultYear(): string {
  return stats.meta?.defaultYear ?? (Object.keys(stats).filter((k) => k !== "meta").sort().reverse()[0] ?? "2024");
}

/** 指定年度の国別統計を取得。年度省略時は defaultYear */
function getStatsByYear(year?: string): Record<string, CountryStats> {
  const y = year ?? getDefaultYear();
  return stats[y] ?? {};
}

/** ISO3 で国情報＋統計を取得（マージ済み）。年度省略時は defaultYear */
export function getCountryWithStats(iso3: string, year?: string): CountryWithStats | undefined {
  const base = countries[iso3?.toUpperCase()];
  if (!base) return undefined;
  const yearStats = getStatsByYear(year);
  const s = yearStats[iso3.toUpperCase()] ?? {};
  return {
    ...base,
    population: s.population ?? null,
    gdp: s.gdp ?? null,
  };
}

/** 利用可能な年度一覧（meta を除く） */
export function getAvailableYears(): string[] {
  return Object.keys(stats)
    .filter((k) => k !== "meta")
    .sort()
    .reverse();
}
