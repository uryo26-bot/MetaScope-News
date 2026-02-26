/**
 * ISO 3166-1 alpha-3 → alpha-2 の対応（国旗絵文字用）。
 * 主要国・貿易で出現しうる国を中心に登録。
 */
const ISO3_TO_ISO2: Record<string, string> = {
  AFG: "AF", ALB: "AL", DZA: "DZ", ASM: "AS", AND: "AD", AGO: "AO", AIA: "AI", ATG: "AG", ARG: "AR", ARM: "AM",
  ABW: "AW", AUS: "AU", AUT: "AT", AZE: "AZ", BHS: "BS", BHR: "BH", BGD: "BD", BRB: "BB", BLR: "BY", BEL: "BE",
  BLZ: "BZ", BEN: "BJ", BMU: "BM", BTN: "BT", BOL: "BO", BES: "BQ", BIH: "BA", BWA: "BW", BRA: "BR", VGB: "VG",
  BRN: "BN", BGR: "BG", BFA: "BF", BDI: "BI", CPV: "CV", KHM: "KH", CMR: "CM", CAN: "CA", CYM: "KY", CAF: "CF",
  TCD: "TD", CHL: "CL", CHN: "CN", COL: "CO", COM: "KM", COG: "CG", COD: "CD", COK: "CK", CRI: "CR", CIV: "CI",
  HRV: "HR", CUB: "CU", CUW: "CW", CYP: "CY", CZE: "CZ", DNK: "DK", DJI: "DJ", DMA: "DM", DOM: "DO", ECU: "EC",
  EGY: "EG", SLV: "SV", GNQ: "GQ", ERI: "ER", EST: "EE", SWZ: "SZ", ETH: "ET", FLK: "FK", FRO: "FO", FJI: "FJ",
  FIN: "FI", FRA: "FR", GUF: "GF", PYF: "PF", GAB: "GA", GMB: "GM", GEO: "GE", DEU: "DE", GHA: "GH", GIB: "GI",
  GRC: "GR", GRL: "GL", GRD: "GD", GLP: "GP", GUM: "GU", GTM: "GT", GGY: "GG", GIN: "GN", GNB: "GW", GUY: "GY",
  HTI: "HT", HND: "HN", HKG: "HK", HUN: "HU", ISL: "IS", IND: "IN", IDN: "ID", IRN: "IR", IRQ: "IQ", IRL: "IE",
  IMN: "IM", ISR: "IL", ITA: "IT", JAM: "JM", JPN: "JP", JEY: "JE", JOR: "JO", KAZ: "KZ", KEN: "KE", KIR: "KI",
  PRK: "KP", KOR: "KR", KWT: "KW", KGZ: "KG", LAO: "LA", LVA: "LV", LBN: "LB", LSO: "LS", LBR: "LR", LBY: "LY",
  LIE: "LI", LTU: "LT", LUX: "LU", MAC: "MO", MDG: "MG", MWI: "MW", MYS: "MY", MDV: "MV", MLI: "ML", MLT: "MT",
  MHL: "MH", MTQ: "MQ", MRT: "MR", MUS: "MU", MYT: "YT", MEX: "MX", FSM: "FM", MDA: "MD", MCO: "MC", MNG: "MN",
  MNE: "ME", MSR: "MS", MAR: "MA", MOZ: "MZ", MMR: "MM", NAM: "NA", NRU: "NR", NPL: "NP", NLD: "NL", NCL: "NC",
  NZL: "NZ", NIC: "NI", NER: "NE", NGA: "NG", NIU: "NU", MKD: "MK", NOR: "NO", OMN: "OM", PAK: "PK", PLW: "PW",
  PSE: "PS", PAN: "PA", PNG: "PG", PRY: "PY", PER: "PE", PHL: "PH", PCN: "PN", POL: "PL", PRT: "PT", PRI: "PR",
  QAT: "QA", REU: "RE", ROU: "RO", RUS: "RU", RWA: "RW", BLM: "BL", SHN: "SH", KNA: "KN", LCA: "LC", MAF: "MF",
  SPM: "PM", VCT: "VC", WSM: "WS", SMR: "SM", STP: "ST", SAU: "SA", SEN: "SN", SRB: "RS", SYC: "SC", SLE: "SL",
  SGP: "SG", SXM: "SX", SVK: "SK", SVN: "SI", SLB: "SB", SOM: "SO", ZAF: "ZA", SSD: "SS", ESP: "ES", LKA: "LK",
  SDN: "SD", SUR: "SR", SWE: "SE", CHE: "CH", SYR: "SY", TWN: "TW", TJK: "TJ", TZA: "TZ", THA: "TH", TLS: "TL",
  TGO: "TG", TKL: "TK", TON: "TO", TTO: "TT", TUN: "TN", TUR: "TR", TKM: "TM", TCA: "TC", TUV: "TV", UGA: "UG",
  UKR: "UA", ARE: "AE", GBR: "GB", USA: "US", UMI: "UM", URY: "UY", UZB: "UZ", VUT: "VU", VAT: "VA", VEN: "VE",
  VNM: "VN", WLF: "WF", ESH: "EH", YEM: "YE", ZMB: "ZM", ZWE: "ZW",
};

/** ISO 3166-1 alpha-2（2文字）から国旗絵文字を返す */
export function getFlagEmoji(iso2: string): string {
  if (!iso2 || iso2.length !== 2) return "";
  return iso2
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(0x1f1e6 - 65 + c.charCodeAt(0)))
    .join("");
}

/** ISO 3166-1 alpha-3（3文字）から国旗絵文字を返す。未対応の場合は空文字 */
export function getFlagEmojiFromISO3(iso3: string): string {
  if (!iso3 || iso3.length !== 3) return "";
  const iso2 = ISO3_TO_ISO2[iso3.toUpperCase()];
  return iso2 ? getFlagEmoji(iso2) : "";
}

/** ISO 3166-1 alpha-3 → alpha-2。未対応は null */
export function getIso2FromIso3(iso3: string): string | null {
  if (!iso3 || iso3.length !== 3) return null;
  return ISO3_TO_ISO2[iso3.toUpperCase()] ?? null;
}

/** 国旗画像用にサポートしている ISO 3166-1 alpha-2 コード一覧 */
export const ISO2_CODES = [...new Set(Object.values(ISO3_TO_ISO2))] as string[];
