import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

type EnergyRecord = {
  energy: string;
  year: number;
  percentage: number;
};

// 電源割合CSV: backend/data/energy_mix_percentage.csv をパースしてEnergyRecord配列に変換
function parseCsv(csv: string): EnergyRecord[] {
  const lines = csv.trim().split(/\r?\n/);
  const [, ...rows] = lines; // ヘッダー除去

  return rows
    .map((line) => line.split(","))
    .map(([energy, year, percentage]) => ({
      energy,
      year: Number(year),
      percentage: Number(percentage),
    }))
    .filter((r) => r.energy && !Number.isNaN(r.year) && !Number.isNaN(r.percentage));
}

// C:\...\EneChart11\backend\data\energy_mix_percentage.csv を参照（cwd が frontend またはリポジトリルートのどちらでも可）
const CSV_NAME = "energy_mix_percentage.csv";
const CSV_RELATIVE = path.join("backend", "data", CSV_NAME);

export async function GET() {
  try {
    const base = process.cwd();
    const pathFromRoot = path.join(base, CSV_RELATIVE);
    const pathFromFrontend = path.join(base, "..", CSV_RELATIVE);
    let csvPath: string;
    try {
      await fs.access(pathFromRoot);
      csvPath = pathFromRoot;
    } catch {
      csvPath = pathFromFrontend;
    }
    const csv = await fs.readFile(csvPath, "utf-8");
    const data = parseCsv(csv);

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("Failed to load backend/data/energy_mix_percentage.csv", err);
    return NextResponse.json(
      { error: "Failed to load energy data" },
      { status: 500 },
    );
  }
}
