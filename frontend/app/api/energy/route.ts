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

// backend/data/energy_mix_percentage.csv を参照
// - Vercel (Root=frontend): トレースされたファイルは cwd/../backend 付近に配置される
// - ローカル: cwd が frontend またはリポジトリルートのどちらでも可
const CSV_NAME = "energy_mix_percentage.csv";
const CANDIDATES = [
  path.join(process.cwd(), "..", "backend", "data", CSV_NAME), // Vercel / frontend から実行時
  path.join(process.cwd(), "backend", "data", CSV_NAME), // リポジトリルートから実行時
];

export async function GET() {
  try {
    let csvPath: string | null = null;
    for (const p of CANDIDATES) {
      try {
        await fs.access(p);
        csvPath = p;
        break;
      } catch {
        /* 次の候補を試す */
      }
    }
    if (!csvPath) {
      throw new Error("energy_mix_percentage.csv not found in any candidate path");
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
