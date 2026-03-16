import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { PATHS } from "../../../../lib/dataPaths";

const SOURCE_TO_FILENAME: Record<string, string> = {
  lng: "Natural_Gas_import.csv",
  coal: "Coal_Fuel_import.csv",
  oil: "Oil_Fuel_import.csv",
};

type ImportRow = { country: string; percentage: number; countryCode: string };

function parseImportCsv(csv: string, year: number): ImportRow[] {
  const lines = csv.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const header = lines[0].split(",");
  const yearIdx = header.indexOf("year");
  const countryCodeIdx = header.indexOf("country_code");
  const countryIdx = header.indexOf("country");
  const pctIdx = header.indexOf("volume_percentage");
  if (yearIdx === -1 || countryCodeIdx === -1 || countryIdx === -1 || pctIdx === -1) return [];

  const byCountry = new Map<string, { country: string; countryCode: string; sum: number }>();

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",");
    const rowYear = Number(cols[yearIdx]);
    if (rowYear !== year) continue;
    const countryCode = cols[countryCodeIdx] ?? "";
    const country = cols[countryIdx] ?? "";
    const pct = Number(cols[pctIdx]) || 0;
    const key = `${countryCode}\t${country}`;
    const cur = byCountry.get(key);
    if (cur) {
      cur.sum += pct;
    } else {
      byCountry.set(key, { country, countryCode, sum: pct });
    }
  }

  return Array.from(byCountry.values()).map(({ country, countryCode, sum }) => ({
    country,
    countryCode,
    percentage: Math.round(sum * 100) / 100,
  }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ source: string }> }
) {
  try {
    const { source } = await params;
    const filename = SOURCE_TO_FILENAME[source?.toLowerCase() ?? ""];
    if (!filename) {
      return NextResponse.json([], { status: 200 });
    }

    const base = process.cwd();
    const dir = PATHS.enechartJapanImportShare;
    const pathFromRoot = path.join(base, dir, filename);
    const pathFromFrontend = path.join(base, "..", dir, filename);
    let csvPath: string;
    try {
      await fs.access(pathFromRoot);
      csvPath = pathFromRoot;
    } catch {
      csvPath = pathFromFrontend;
    }

    const url = new URL(_request.url);
    const year = Number(url.searchParams.get("year")) || 2024;

    const csv = await fs.readFile(csvPath, "utf-8");
    const data = parseImportCsv(csv, year);

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("Failed to load import data from extractedData_AFpercentage", err);
    return NextResponse.json([], { status: 200 });
  }
}
