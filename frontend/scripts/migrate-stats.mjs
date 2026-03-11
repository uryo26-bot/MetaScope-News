/**
 * countries.json から人口・GDPを抽出し、countries-stats.json を作成。
 * countries.json から population/gdp を削除。
 * 実行: node scripts/migrate-stats.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");
const COUNTRIES_PATH = path.join(DATA_DIR, "countries.json");
const STATS_PATH = path.join(DATA_DIR, "countries-stats.json");

const DEFAULT_YEAR = "2024";

function main() {
  const countries = JSON.parse(fs.readFileSync(COUNTRIES_PATH, "utf-8"));
  const statsByYear = { [DEFAULT_YEAR]: {} };

  const countriesOut = {};
  for (const [iso3, d] of Object.entries(countries)) {
    const { population, gdp, ...rest } = d;
    countriesOut[iso3] = rest;
    if (population != null || gdp != null) {
      const entry = {};
      if (typeof population === "number") entry.population = population;
      if (typeof gdp === "number") entry.gdp = gdp;
      if (Object.keys(entry).length > 0) statsByYear[DEFAULT_YEAR][iso3] = entry;
    }
  }

  const stats = {
    meta: { defaultYear: DEFAULT_YEAR, description: "年度別の人口・GDPなど。新年度データ追加時は当該年度のオブジェクトを追加し、meta.defaultYear を更新。" },
    ...statsByYear,
  };
  fs.writeFileSync(STATS_PATH, JSON.stringify(stats, null, 2), "utf-8");
  fs.writeFileSync(COUNTRIES_PATH, JSON.stringify(countriesOut, null, 2), "utf-8");
  console.log(`Created ${STATS_PATH} with ${Object.keys(statsByYear[DEFAULT_YEAR]).length} countries for ${DEFAULT_YEAR}`);
  console.log(`Updated ${COUNTRIES_PATH} (removed population/gdp)`);
}

main();
