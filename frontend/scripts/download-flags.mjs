/**
 * flagcdn から国旗 SVG を取得し public/flags/ に保存する。
 * 平面・歪みなし（Wikimedia Commons 由来・利用可）。初回または更新時: node scripts/download-flags.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "public", "flags");
const CDN = "https://flagcdn.com";

// lib/countryFlags.ts の ISO3_TO_ISO2 の value 一覧（重複除去）
const ISO2_CODES = [
  "AF", "AL", "DZ", "AS", "AD", "AO", "AI", "AG", "AR", "AM", "AW", "AU", "AT", "AZ", "BS", "BH", "BD", "BB", "BY", "BE",
  "BZ", "BJ", "BM", "BT", "BO", "BQ", "BA", "BW", "BR", "VG", "BN", "BG", "BF", "BI", "CV", "KH", "CM", "CA", "KY", "CF",
  "TD", "CL", "CN", "CO", "KM", "CG", "CD", "CK", "CR", "CI", "HR", "CU", "CW", "CY", "CZ", "DK", "DJ", "DM", "DO", "EC",
  "EG", "SV", "GQ", "ER", "EE", "SZ", "ET", "FK", "FO", "FJ", "FI", "FR", "GF", "PF", "GA", "GM", "GE", "DE", "GH", "GI",
  "GR", "GL", "GD", "GP", "GU", "GT", "GG", "GN", "GW", "GY", "HT", "HN", "HK", "HU", "IS", "IN", "ID", "IR", "IQ", "IE",
  "IM", "IL", "IT", "JM", "JP", "JE", "JO", "KZ", "KE", "KI", "KP", "KR", "KW", "KG", "LA", "LV", "LB", "LS", "LR", "LY",
  "LI", "LT", "LU", "MO", "MG", "MW", "MY", "MV", "ML", "MT", "MH", "MQ", "MR", "MU", "YT", "MX", "FM", "MD", "MC", "MN",
  "ME", "MS", "MA", "MZ", "MM", "NA", "NR", "NP", "NL", "NC", "NZ", "NI", "NE", "NG", "NU", "MK", "NO", "OM", "PK", "PW",
  "PS", "PA", "PG", "PY", "PE", "PH", "PN", "PL", "PT", "PR", "QA", "RE", "RO", "RU", "RW", "BL", "SH", "KN", "LC", "MF",
  "PM", "VC", "WS", "SM", "ST", "SA", "SN", "RS", "SC", "SL", "SG", "SX", "SK", "SI", "SB", "SO", "ZA", "SS", "ES", "LK",
  "SD", "SR", "SE", "CH", "SY", "TW", "TJ", "TZ", "TH", "TL", "TG", "TK", "TO", "TT", "TN", "TR", "TM", "TC", "TV", "UG",
  "UA", "AE", "GB", "US", "UM", "UY", "UZ", "VU", "VA", "VE", "VN", "WF", "EH", "YE", "ZM", "ZW",
];

async function download(code) {
  const lower = code.toLowerCase();
  const url = `${CDN}/${lower}.svg`;
  const res = await fetch(url, { headers: { "User-Agent": "EneChart/1.0" } });
  if (!res.ok) {
    console.warn(`Skip ${code}: ${res.status}`);
    return false;
  }
  const buf = Buffer.from(await res.arrayBuffer());
  const outPath = path.join(OUT_DIR, `${lower}.svg`);
  fs.writeFileSync(outPath, buf);
  return true;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  let ok = 0;
  for (const code of ISO2_CODES) {
    if (await download(code)) ok++;
  }
  console.log(`Done: ${ok}/${ISO2_CODES.length} flags in ${OUT_DIR}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
