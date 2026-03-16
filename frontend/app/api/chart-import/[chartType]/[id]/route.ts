import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { PATHS } from "../../../../../lib/dataPaths";

/** resource/crop id → CSV filename (import: 日本の輸入元 / production: 世界の生産国) */
const METALCHART_IMPORT: Record<string, string> = {
  gold: "Gold_import.csv", silver: "Silver_import.csv", platinum: "Platinum_import.csv", palladium: "Palladium_import.csv",
  copper: "Copper_import.csv", aluminum: "Aluminum_import.csv", zinc: "Zinc_import.csv", lead: "Lead_import.csv",
  tin: "Tin_import.csv", iron: "Iron_import.csv", nickel: "Nickel_import.csv", manganese: "Manganese_import.csv",
  lithium: "Lithium_import.csv", cobalt: "Cobalt_import.csv", titanium: "Titanium_import.csv", tungsten: "Tungsten_import.csv",
  "rare-earth": "RareEarth_import.csv", uranium: "Uranium_import.csv",
};
const METALCHART_PRODUCTION: Record<string, string> = {
  gold: "Gold_production.csv", silver: "Silver_production.csv", platinum: "Platinum_production.csv", palladium: "Palladium_production.csv",
  copper: "Copper_production.csv", aluminum: "Aluminum_production.csv", zinc: "Zinc_production.csv", lead: "Lead_production.csv",
  tin: "Tin_production.csv", iron: "Iron_production.csv", nickel: "Nickel_production.csv", manganese: "Manganese_production.csv",
  lithium: "Lithium_production.csv", cobalt: "Cobalt_production.csv", titanium: "Titanium_production.csv", tungsten: "Tungsten_production.csv",
  "rare-earth": "RareEarth_production.csv", uranium: "Uranium_production.csv",
};

const AGRICHART_IMPORT: Record<string, string> = {
  rice: "Rice_import.csv", wheat: "Wheat_import.csv", corn: "Corn_import.csv", soybean: "Soybean_import.csv",
  coffee: "Coffee_import.csv", cocoa: "Cocoa_import.csv", sugarcane: "Sugarcane_import.csv", cotton: "Cotton_import.csv",
  beef: "Beef_import.csv", pork: "Pork_import.csv", chicken: "Chicken_import.csv",
  tuna: "Tuna_import.csv", salmon: "Salmon_import.csv", shrimp: "Shrimp_import.csv",
};
const AGRICHART_PRODUCTION: Record<string, string> = {
  rice: "Rice_production.csv", wheat: "Wheat_production.csv", corn: "Corn_production.csv", soybean: "Soybean_production.csv",
  coffee: "Coffee_production.csv", cocoa: "Cocoa_production.csv", sugarcane: "Sugarcane_production.csv", cotton: "Cotton_production.csv",
  beef: "Beef_production.csv", pork: "Pork_production.csv", chicken: "Chicken_production.csv",
  tuna: "Tuna_production.csv", salmon: "Salmon_production.csv", shrimp: "Shrimp_production.csv",
};

/** EneChart: 電源 id → 輸入元 CSV（extractedData_AFpercentage） */
const ENECHART_IMPORT: Record<string, string> = {
  lng: "Natural_Gas_import.csv",
  coal: "Coal_Fuel_import.csv",
  oil: "Oil_Fuel_import.csv",
};

/** EneChart: 天然ガス産出国割合（LNG_export_AFpercentage） */
const ENECHART_PRODUCTION: Record<string, string> = {
  lng: "LNG_export_AFpercentage.csv",
};

export type ImportShareItem = { country: string; value: number; country_code?: string };

function parseImportCsv(csv: string, year: number): ImportShareItem[] {
  const lines = csv.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const header = lines[0].split(",");
  const yearIdx = header.indexOf("year");
  const countryIdx = header.indexOf("country");
  const codeIdx = header.indexOf("country_code");
  const pctIdx = header.indexOf("value_percentage");
  if (yearIdx === -1 || countryIdx === -1 || pctIdx === -1) return [];

  const byCountry = new Map<string, { value: number; code?: string }>();

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",");
    const rowYear = Number(cols[yearIdx]);
    if (rowYear !== year) continue;
    const country = cols[countryIdx] ?? "";
    const code = codeIdx >= 0 ? (cols[codeIdx] ?? "").trim() : undefined;
    const pct = Number(cols[pctIdx]) || 0;
    const cur = byCountry.get(country);
    const prevValue = cur?.value ?? 0;
    byCountry.set(country, { value: prevValue + pct, code: code || cur?.code });
  }

  return Array.from(byCountry.entries())
    .map(([country, { value, code }]) => ({
      country,
      value: Math.round(value * 100) / 100,
      ...(code ? { country_code: code } : {}),
    }))
    .sort((a, b) => b.value - a.value);
}

/** EneChart 用 CSV（volume_percentage, country_code） */
function parseEnechartImportCsv(csv: string, year: number): ImportShareItem[] {
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
    const countryCode = (cols[countryCodeIdx] ?? "").trim();
    const country = cols[countryIdx] ?? "";
    const pct = Number(cols[pctIdx]) || 0;
    const key = countryCode || country;
    const cur = byCountry.get(key);
    if (cur) {
      cur.sum += pct;
    } else {
      byCountry.set(key, { country, countryCode, sum: pct });
    }
  }
  return Array.from(byCountry.values())
    .map(({ country, countryCode, sum }) => ({
      country,
      value: Math.round(sum * 100) / 100,
      ...(countryCode ? { country_code: countryCode } : {}),
    }))
    .sort((a, b) => b.value - a.value);
}

/** ISO3 → 日本語国名（countries.json） */
let countriesNameJa: Record<string, string> | null = null;
async function getCountryNameJa(iso3: string): Promise<string | null> {
  if (!countriesNameJa) {
    try {
      const candidates = [
        path.join(process.cwd(), "data", "countries.json"),
        path.join(process.cwd(), "frontend", "data", "countries.json"),
      ];
      let raw: string | null = null;
      for (const p of candidates) {
        try {
          raw = await fs.readFile(p, "utf-8");
          break;
        } catch {
          /* try next */
        }
      }
      if (!raw) throw new Error("countries.json not found");
      const data = JSON.parse(raw) as Record<string, { nameJa?: string }>;
      countriesNameJa = {};
      for (const [k, v] of Object.entries(data)) {
        if (v && typeof v === "object" && "nameJa" in v) countriesNameJa[k] = (v as { nameJa: string }).nameJa;
      }
    } catch {
      countriesNameJa = {};
    }
  }
  return countriesNameJa[iso3] ?? null;
}

/** LNG産出国割合CSV解析（LNG_export_AFpercentage: 国名, ISOコード, 年度, volume_percentage） */
async function parseLngExportAfCsv(
  csv: string,
  year: number
): Promise<ImportShareItem[]> {
  const lines = csv.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const header = lines[0].split(",").map((h) => h.trim());
  const colName = header.indexOf("国名");
  const colIso = header.indexOf("ISOコード");
  const colYear = header.indexOf("年度");
  const colPct = header.indexOf("volume_percentage");
  if (colName === -1 || colIso === -1 || colYear === -1 || colPct === -1) return [];

  const rows: ImportShareItem[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map((c) => c.trim());
    const rowYear = Number(cols[colYear]);
    if (rowYear !== year) continue;
    const pct = Number(cols[colPct]);
    if (Number.isNaN(pct) || pct <= 0) continue;
    const countryEn = cols[colName] ?? "";
    const iso3 = (cols[colIso] ?? "").toUpperCase();
    const nameJa = await getCountryNameJa(iso3);
    rows.push({
      country: nameJa ?? countryEn,
      value: Math.round(pct * 100) / 100,
      country_code: iso3 || undefined,
    });
  }
  return rows.sort((a, b) => b.value - a.value);
}

/** 2文字国コード → ISO 3文字（Natural Earth 用） */
const ISO2_TO_3: Record<string, string> = {
  AU: "AUS", MY: "MYS", QA: "QAT", RU: "RUS", AE: "ARE", SA: "SAU", KW: "KWT", ID: "IDN",
  US: "USA", CN: "CHN", SG: "SGP", CA: "CAN", GB: "GBR", NL: "NLD", IT: "ITA", KR: "KOR",
  TH: "THA", TW: "TWN", IQ: "IRQ", IR: "IRN", PH: "PHL", VN: "VNM", IN: "IND", MX: "MEX",
  CO: "COL", NG: "NGA", PE: "PER", BR: "BRA", DZ: "DZA", LY: "LBY", OM: "OMN", BN: "BRN",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ chartType: string; id: string }> }
) {
  try {
    const { chartType, id } = await params;
    const chart = chartType?.toLowerCase();
    const idLower = id?.toLowerCase() ?? "";

    const isMetal = chart === "metalchart";
    const isAgri = chart === "agrichart";
    const isEne = chart === "enechart";
    const url = new URL(_request.url);
    const dataType = (url.searchParams.get("type") ?? "import").toLowerCase();
    const useProduction = dataType === "production";
    const year = Number(url.searchParams.get("year")) || 2024;

    if (isEne && dataType === "production" && ENECHART_PRODUCTION[idLower]) {
      const filename = ENECHART_PRODUCTION[idLower];
      const dataDir = PATHS.enechartWorldExportShare;
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
          return NextResponse.json([], { status: 200 });
        }
      }
      const csv = await fs.readFile(csvPath, "utf-8");
      const data = await parseLngExportAfCsv(csv, year);
      return NextResponse.json(data, { status: 200 });
    }

    if (isEne && dataType === "import" && ENECHART_IMPORT[idLower]) {
      const filename = ENECHART_IMPORT[idLower];
      const dataDir = PATHS.enechartJapanImportShare;
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
          return NextResponse.json([], { status: 200 });
        }
      }
      const csv = await fs.readFile(csvPath, "utf-8");
      const raw = parseEnechartImportCsv(csv, year);
      const data = raw.map((d) => ({
        ...d,
        country_code: d.country_code && d.country_code.length === 2
          ? (ISO2_TO_3[d.country_code] ?? d.country_code)
          : d.country_code,
      }));
      return NextResponse.json(data, { status: 200 });
    }

    const fileMap = isMetal
      ? (useProduction ? METALCHART_PRODUCTION : METALCHART_IMPORT)
      : isAgri
        ? (useProduction ? AGRICHART_PRODUCTION : AGRICHART_IMPORT)
        : null;
    const dirName = isMetal ? "MetalChart" : isAgri ? "AgriChart" : null;

    if (!fileMap || !dirName || !fileMap[idLower]) {
      return NextResponse.json([], { status: 200 });
    }

    const filename = fileMap[idLower];
    const dataDir =
      dirName === "MetalChart"
        ? useProduction
          ? PATHS.metalchartProduction
          : PATHS.metalchartImport
        : useProduction
          ? PATHS.agricchartProduction
          : PATHS.agricchartImport;
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
        return NextResponse.json([], { status: 200 });
      }
    }

    const csv = await fs.readFile(csvPath, "utf-8");
    const data = parseImportCsv(csv, year);

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("Failed to load chart import data", err);
    return NextResponse.json([], { status: 200 });
  }
}
