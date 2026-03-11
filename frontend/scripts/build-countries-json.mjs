/**
 * REST Countries API から1回だけデータを取得し、
 * 名前・ISOコード・地域・人口を整理した countries.json を生成する。
 * 実行: node scripts/build-countries-json.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_PATH = path.join(__dirname, "..", "data", "countries.json");
const EXISTING_PATH = path.join(__dirname, "..", "data", "countries-info.json");

// 既存の countries-info.json の日本語名・GDP をマージ
let existing = {};
try {
  existing = JSON.parse(fs.readFileSync(EXISTING_PATH, "utf-8"));
} catch {
  /* ignore */
}

// ISO3 → 日本語名（主要国・REST Countries にない追加分）
const NAME_JA = {
  ...Object.fromEntries(
    Object.entries(existing).map(([k, v]) => [k, v.nameJa ?? v.name])
  ),
  AFG: "アフガニスタン", ALB: "アルバニア", DZA: "アルジェリア", ASM: "アメリカ領サモア",
  AND: "アンドラ", AGO: "アンゴラ", AIA: "アンギラ", ATG: "アンティグア・バーブーダ",
  ARG: "アルゼンチン", ARM: "アルメニア", ABW: "アルバ", AUS: "オーストラリア",
  AUT: "オーストリア", AZE: "アゼルバイジャン", BHS: "バハマ", BHR: "バーレーン",
  BGD: "バングラデシュ", BRB: "バルバドス", BLR: "ベラルーシ", BEL: "ベルギー",
  BLZ: "ベリーズ", BEN: "ベナン", BMU: "バミューダ", BTN: "ブータン",
  BOL: "ボリビア", BES: "カリブ・オランダ", BIH: "ボスニア・ヘルツェゴビナ",
  BWA: "ボツワナ", BRA: "ブラジル", VGB: "イギリス領ヴァージン諸島", BRN: "ブルネイ",
  BGR: "ブルガリア", BFA: "ブルキナファソ", BDI: "ブルンジ", CPV: "カーボベルデ",
  KHM: "カンボジア", CMR: "カメルーン", CAN: "カナダ", CYM: "ケイマン諸島",
  CAF: "中央アフリカ共和国", TCD: "チャド", CHL: "チリ", CHN: "中国",
  COL: "コロンビア", COM: "コモロ", COG: "コンゴ共和国", COD: "コンゴ民主共和国",
  COK: "クック諸島", CRI: "コスタリカ", CIV: "コートジボワール", HRV: "クロアチア",
  CUB: "キューバ", CUW: "キュラソー", CYP: "キプロス", CZE: "チェコ",
  DNK: "デンマーク", DJI: "ジブチ", DMA: "ドミニカ国", DOM: "ドミニカ共和国",
  ECU: "エクアドル", EGY: "エジプト", SLV: "エルサルバドル", GNQ: "赤道ギニア",
  ERI: "エリトリア", EST: "エストニア", SWZ: "エスワティニ", ETH: "エチオピア",
  FLK: "フォークランド諸島", FRO: "フェロー諸島", FJI: "フィジー", FIN: "フィンランド",
  FRA: "フランス", GUF: "フランス領ギアナ", PYF: "フランス領ポリネシア", GAB: "ガボン",
  GMB: "ガンビア", GEO: "ジョージア", DEU: "ドイツ", GHA: "ガーナ", GIB: "ジブラルタル",
  GRC: "ギリシャ", GRL: "グリーンランド", GRD: "グレナダ", GLP: "グアドループ",
  GUM: "グアム", GTM: "グアテマラ", GGY: "ガーンジー", GIN: "ギニア",
  GNB: "ギニアビサウ", GUY: "ガイアナ", HTI: "ハイチ", HND: "ホンジュラス",
  HKG: "香港", HUN: "ハンガリー", ISL: "アイスランド", IND: "インド",
  IDN: "インドネシア", IRN: "イラン", IRQ: "イラク", IRL: "アイルランド",
  IMN: "マン島", ISR: "イスラエル", ITA: "イタリア", JAM: "ジャマイカ",
  JPN: "日本", JEY: "ジャージー", JOR: "ヨルダン", KAZ: "カザフスタン",
  KEN: "ケニア", KIR: "キリバス", PRK: "北朝鮮", KOR: "韓国",
  KWT: "クウェート", KGZ: "キルギス", LAO: "ラオス", LVA: "ラトビア",
  LBN: "レバノン", LSO: "レソト", LBR: "リベリア", LBY: "リビア",
  LIE: "リヒテンシュタイン", LTU: "リトアニア", LUX: "ルクセンブルク",
  MAC: "マカオ", MDG: "マダガスカル", MWI: "マラウイ", MYS: "マレーシア",
  MDV: "モルディブ", MLI: "マリ", MLT: "マルタ", MHL: "マーシャル諸島",
  MTQ: "マルティニーク", MRT: "モーリタニア", MUS: "モーリシャス", MYT: "マヨット",
  MEX: "メキシコ", FSM: "ミクロネシア連邦", MDA: "モルドバ", MCO: "モナコ",
  MNG: "モンゴル", MNE: "モンテネグロ", MSR: "モントセラト", MAR: "モロッコ",
  MOZ: "モザンビーク", MMR: "ミャンマー", NAM: "ナミビア", NRU: "ナウル",
  NPL: "ネパール", NLD: "オランダ", NCL: "ニューカレドニア", NZL: "ニュージーランド",
  NIC: "ニカラグア", NER: "ニジェール", NGA: "ナイジェリア", NIU: "ニウエ",
  MKD: "北マケドニア", NOR: "ノルウェー", OMN: "オマーン", PAK: "パキスタン",
  PLW: "パラオ", PSE: "パレスチナ", PAN: "パナマ", PNG: "パプアニューギニア",
  PRY: "パラグアイ", PER: "ペルー", PHL: "フィリピン", PCN: "ピトケアン諸島",
  POL: "ポーランド", PRT: "ポルトガル", PRI: "プエルトリコ", QAT: "カタール",
  REU: "レユニオン", ROU: "ルーマニア", RUS: "ロシア", RWA: "ルワンダ",
  BLM: "サン・バルテルミー", SHN: "セントヘレナ", KNA: "セントクリストファー・ネイビス",
  LCA: "セントルシア", MAF: "サン・マルタン", SPM: "サンピエール島・ミクロン島",
  VCT: "セントビンセント・グレナディーン", WSM: "サモア", SMR: "サンマリノ",
  STP: "サントメ・プリンシペ", SAU: "サウジアラビア", SEN: "セネガル",
  SRB: "セルビア", SYC: "セーシェル", SLE: "シエラレオネ", SGP: "シンガポール",
  SXM: "シント・マールテン", SVK: "スロバキア", SVN: "スロベニア", SLB: "ソロモン諸島",
  SOM: "ソマリア", ZAF: "南アフリカ", SSD: "南スーダン", ESP: "スペイン",
  LKA: "スリランカ", SDN: "スーダン", SUR: "スリナム", SWE: "スウェーデン",
  CHE: "スイス", SYR: "シリア", TWN: "台湾", TJK: "タジキスタン",
  TZA: "タンザニア", THA: "タイ", TLS: "東ティモール", TGO: "トーゴ",
  TKL: "トケラウ", TON: "トンガ", TTO: "トリニダード・トバゴ", TUN: "チュニジア",
  TUR: "トルコ", TKM: "トルクメニスタン", TCA: "タークス・カイコス諸島",
  TUV: "ツバル", UGA: "ウガンダ", UKR: "ウクライナ", ARE: "アラブ首長国連邦",
  GBR: "イギリス", USA: "アメリカ合衆国", UMI: "合衆国領有小離島", URY: "ウルグアイ",
  UZB: "ウズベキスタン", VUT: "バヌアツ", VAT: "バチカン市国", VEN: "ベネズエラ",
  VNM: "ベトナム", WLF: "ウォリス・フツナ", ESH: "西サハラ", YEM: "イエメン",
  ZMB: "ザンビア", ZWE: "ジンバブエ",
};

const REGION_JA = {
  Africa: "アフリカ", Americas: "アメリカ州", Asia: "アジア", Europe: "ヨーロッパ",
  Oceania: "オセアニア", Antarctic: "南極",
};
const SUBREGION_JA = {
  "Eastern Asia": "東アジア", "South-Eastern Asia": "東南アジア", "Southern Asia": "南アジア",
  "Western Asia": "西アジア", "Central Asia": "中央アジア", "Northern Europe": "北ヨーロッパ",
  "Western Europe": "西ヨーロッパ", "Southern Europe": "南ヨーロッパ", "Eastern Europe": "東ヨーロッパ",
  "Central Europe": "中央ヨーロッパ", "Southeast Europe": "南東ヨーロッパ",
  "North America": "北アメリカ", "Central America": "中央アメリカ", "South America": "南アメリカ",
  Caribbean: "カリブ海", "Eastern Africa": "東アフリカ", "Western Africa": "西アフリカ",
  "Northern Africa": "北アフリカ", "Southern Africa": "南部アフリカ", "Middle Africa": "中部アフリカ",
  "Australia and New Zealand": "オーストラリア・ニュージーランド",
  Melanesia: "メラネシア", Micronesia: "ミクロネシア", Polynesia: "ポリネシア",
};

function toRegionJa(region, subregion) {
  const r = REGION_JA[region] ?? region;
  if (subregion && subregion.trim()) {
    const s = SUBREGION_JA[subregion] ?? subregion;
    return `${r}（${s}）`;
  }
  return r;
}

async function main() {
  const res = await fetch(
    "https://restcountries.com/v3.1/all?fields=name,cca2,cca3,population,region,subregion"
  );
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  const data = await res.json();

  const out = {};
  for (const c of data) {
    const iso3 = c.cca3?.toUpperCase();
    if (!iso3 || iso3 === "UNK") continue;
    const nameEn = c.name?.common ?? "";
    const region = c.region ?? "";
    const subregion = c.subregion ?? "";
    const regionJa = toRegionJa(region, subregion);
    const nameJa = existing[iso3]?.nameJa ?? NAME_JA[iso3] ?? nameEn;

    out[iso3] = {
      iso2: c.cca2 ?? null,
      iso3,
      nameEn,
      nameJa,
      region,
      regionJa,
    };
  }

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2), "utf-8");
  console.log(`Created ${OUT_PATH} with ${Object.keys(out).length} countries`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
