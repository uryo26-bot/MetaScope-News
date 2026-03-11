/**
 * countries.json を単一ソースとした国情報の取得ユーティル。
 * 人口・GDP 等の年度別データは countries-stats.json / lib/countriesStats を参照。
 */

import countriesData from "../data/countries.json";

export type CountryRecord = {
  iso2: string | null;
  iso3: string;
  nameEn: string;
  nameJa: string;
  region: string;
  regionJa: string;
};

const countries = countriesData as Record<string, CountryRecord>;

/** nameJa → ISO3 の逆引き（国名からISO3を取得） */
let nameToIso3: Record<string, string> | null = null;
function getNameToIso3(): Record<string, string> {
  if (nameToIso3) return nameToIso3;
  nameToIso3 = {};
  for (const [iso3, d] of Object.entries(countries)) {
    if (d?.nameJa) nameToIso3[d.nameJa] = iso3;
  }
  return nameToIso3;
}

/** ISO3 で国情報を取得 */
export function getCountryByIso3(iso3: string): CountryRecord | undefined {
  if (!iso3 || iso3.length !== 3) return undefined;
  return countries[iso3.toUpperCase()];
}

/** 国名の別表記（複数呼び方がある場合のフォールバック） */
const NAME_ALIASES: Record<string, string> = {
  中国: "CHN", 中華人民共和国: "CHN", アメリカ: "USA", アメリカ合衆国: "USA",
  南アフリカ共和国: "ZAF", イギリス: "GBR", 北朝鮮: "PRK", 韓国: "KOR",
};

/** 国名（日本語）から ISO3 を取得。見つからない場合は null */
export function getIso3ByNameJa(nameJa: string): string | null {
  if (!nameJa?.trim()) return null;
  const key = nameJa.trim();
  const map = getNameToIso3();
  return map[key] ?? NAME_ALIASES[key] ?? null;
}

/** ISO3 → 国情報の全件（他コンポーネントで参照用） */
export { countries };
