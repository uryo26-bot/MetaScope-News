import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const METALCHART_PRODUCTION: Record<string, string> = {
  gold: "Gold_production.csv",
  silver: "Silver_production.csv",
  platinum: "Platinum_production.csv",
  palladium: "Palladium_production.csv",
  copper: "Copper_production.csv",
  aluminum: "Aluminum_production.csv",
  zinc: "Zinc_production.csv",
  lead: "Lead_production.csv",
  tin: "Tin_production.csv",
  iron: "Iron_production.csv",
  nickel: "Nickel_production.csv",
  manganese: "Manganese_production.csv",
  lithium: "Lithium_production.csv",
  cobalt: "Cobalt_production.csv",
  titanium: "Titanium_production.csv",
  tungsten: "Tungsten_production.csv",
  "rare-earth": "RareEarth_production.csv",
  uranium: "Uranium_production.csv",
};

const METALCHART_IMPORT: Record<string, string> = {
  gold: "Gold_import.csv",
  silver: "Silver_import.csv",
  platinum: "Platinum_import.csv",
  palladium: "Palladium_import.csv",
  copper: "Copper_import.csv",
  aluminum: "Aluminum_import.csv",
  zinc: "Zinc_import.csv",
  lead: "Lead_import.csv",
  tin: "Tin_import.csv",
  iron: "Iron_import.csv",
  nickel: "Nickel_import.csv",
  manganese: "Manganese_import.csv",
  lithium: "Lithium_import.csv",
  cobalt: "Cobalt_import.csv",
  titanium: "Titanium_import.csv",
  tungsten: "Tungsten_import.csv",
  "rare-earth": "RareEarth_import.csv",
  uranium: "Uranium_import.csv",
};

/** CSV 1行から year, country_code, volume を取得。volume は数値(MT)。 */
function parseCsvRowForVolume(header: string[], cols: string[]): { year: number; country_code: string; volume: number } | null {
  const yearIdx = header.indexOf("year");
  const codeIdx = header.indexOf("country_code");
  const volIdx = header.indexOf("volume");
  if (yearIdx === -1 || codeIdx === -1 || volIdx === -1) return null;
  const year = Number(cols[yearIdx]);
  const country_code = (cols[codeIdx] ?? "").trim();
  const volume = Number(cols[volIdx]) || 0;
  return { year, country_code, volume };
}

/** 生産CSVから指定年の JPN の volume 合計を返す（無ければ 0） */
async function getJapanProductionVolume(id: string, year: number): Promise<number> {
  const filename = METALCHART_PRODUCTION[id];
  if (!filename) return 0;
  const dataDir = path.join("backend", "data", "MetalChart", "production");
  const csvPathFromCwd = path.join(process.cwd(), dataDir, filename);
  const csvPathFromFrontend = path.join(process.cwd(), "..", dataDir, filename);
  let csvPath: string;
  try {
    await fs.access(csvPathFromCwd);
    csvPath = csvPathFromCwd;
  } catch {
    try {
      await fs.access(csvPathFromFrontend);
      csvPath = csvPathFromFrontend;
    } catch {
      return 0;
    }
  }
  const csv = await fs.readFile(csvPath, "utf-8");
  const lines = csv.trim().split(/\r?\n/);
  if (lines.length < 2) return 0;
  const header = lines[0].split(",");
  let sum = 0;
  for (let i = 1; i < lines.length; i++) {
    const row = parseCsvRowForVolume(header, lines[i].split(","));
    if (row && row.year === year && row.country_code === "JPN") sum += row.volume;
  }
  return sum;
}

/** 輸入CSVから指定年の日本の輸入総量（全国の volume 合計）を返す */
async function getJapanImportTotalVolume(id: string, year: number): Promise<number> {
  const filename = METALCHART_IMPORT[id];
  if (!filename) return 0;
  const dataDir = path.join("backend", "data", "MetalChart", "import");
  const csvPathFromCwd = path.join(process.cwd(), dataDir, filename);
  const csvPathFromFrontend = path.join(process.cwd(), "..", dataDir, filename);
  let csvPath: string;
  try {
    await fs.access(csvPathFromCwd);
    csvPath = csvPathFromCwd;
  } catch {
    try {
      await fs.access(csvPathFromFrontend);
      csvPath = csvPathFromFrontend;
    } catch {
      return 0;
    }
  }
  const csv = await fs.readFile(csvPath, "utf-8");
  const lines = csv.trim().split(/\r?\n/);
  if (lines.length < 2) return 0;
  const header = lines[0].split(",");
  let sum = 0;
  for (let i = 1; i < lines.length; i++) {
    const row = parseCsvRowForVolume(header, lines[i].split(","));
    if (row && row.year === year) sum += row.volume;
  }
  return sum;
}

/** 自給率 = 国内生産 / (国内生産 + 輸入) * 100。分母が 0 のときは 0 を返す。 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id?.toLowerCase();
    if (!id || !METALCHART_PRODUCTION[id]) {
      return NextResponse.json({ rate: null }, { status: 200 });
    }
    const url = new URL(_request.url);
    const year = Number(url.searchParams.get("year")) || 2024;

    const [jpnProduction, importTotal] = await Promise.all([
      getJapanProductionVolume(id, year),
      getJapanImportTotalVolume(id, year),
    ]);

    const totalSupply = jpnProduction + importTotal;
    const rate = totalSupply > 0 ? (jpnProduction / totalSupply) * 100 : 0;

    return NextResponse.json({
      rate: Math.round(rate * 100) / 100,
      year,
      id,
    });
  } catch (err) {
    console.error("Failed to compute self-sufficiency", err);
    return NextResponse.json({ rate: null }, { status: 200 });
  }
}
