import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export type CountryInfo = {
  nameJa: string;
  population: number;
  gdp: number;
};

let cache: Record<string, CountryInfo> | null = null;

async function getCountriesInfo(): Promise<Record<string, CountryInfo>> {
  if (cache) return cache;
  const filePath = path.join(process.cwd(), "data", "countries-info.json");
  const raw = await fs.readFile(filePath, "utf-8");
  cache = JSON.parse(raw) as Record<string, CountryInfo>;
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
