import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export type CountryInfo = {
  nameJa: string;
  population: number | null;
  gdp: number | null;
  region?: string | null;
};

let cache: Record<string, CountryInfo> | null = null;

async function getCountriesInfo(): Promise<Record<string, CountryInfo>> {
  if (cache) return cache;
  const dataDir = path.join(process.cwd(), "data");
  const [countriesRaw, statsRaw] = await Promise.all([
    fs.readFile(path.join(dataDir, "countries.json"), "utf-8"),
    fs.readFile(path.join(dataDir, "countries-stats.json"), "utf-8"),
  ]);
  const countries = JSON.parse(countriesRaw) as Record<string, { nameJa: string; regionJa?: string }>;
  const stats = JSON.parse(statsRaw) as { meta?: { defaultYear?: string }; [y: string]: Record<string, { population?: number; gdp?: number }> };
  const year = stats.meta?.defaultYear ?? Object.keys(stats).filter((k) => k !== "meta").sort().reverse()[0] ?? "2024";
  const yearStats = stats[year] ?? {};
  cache = {};
  for (const [iso3, d] of Object.entries(countries)) {
    const s = yearStats[iso3] ?? {};
    cache[iso3] = {
      nameJa: d.nameJa ?? "",
      population: s.population ?? null,
      gdp: s.gdp ?? null,
      region: d.regionJa ?? null,
    };
  }
  return cache;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const upper = code?.toUpperCase();
    if (!upper || upper.length !== 3) {
      return NextResponse.json({ error: "Invalid code" }, { status: 400 });
    }
    const data = await getCountriesInfo();
    const info = data[upper] ?? null;
    return NextResponse.json(info);
  } catch (err) {
    console.error("Country info fetch error:", err);
    return NextResponse.json(null, { status: 200 });
  }
}
