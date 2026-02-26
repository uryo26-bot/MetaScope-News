/**
 * 資源別の主な鉱山（地形表示時にマーク・鉱山名表示用）
 * 座標は [経度 lng, 緯度 lat]
 */
export type ResourceMine = {
  name: string;
  nameEn?: string;
  country_code: string;
  coordinates: [number, number];
};

/** 金鉱山 */
const GOLD_MINES: ResourceMine[] = [
  { name: "佐渡金山", nameEn: "Sado", country_code: "JPN", coordinates: [138.41, 38.04] },
  { name: "菱刈鉱山", nameEn: "Hishikari", country_code: "JPN", coordinates: [130.72, 32.05] },
  { name: "土肥鉱山", nameEn: "Toi", country_code: "JPN", coordinates: [138.78, 34.92] },
  { name: "カールリン鉱山", nameEn: "Carlin", country_code: "USA", coordinates: [-116.04, 41.11] },
  { name: "ホームステイク鉱山", nameEn: "Homestake", country_code: "USA", coordinates: [-103.72, 44.35] },
  { name: "コート・ダロール", nameEn: "Cortez", country_code: "USA", coordinates: [-116.47, 40.33] },
  { name: "スーパーピット", nameEn: "Super Pit", country_code: "AUS", coordinates: [121.48, -30.78] },
  { name: "ボダイン鉱山", nameEn: "Boddington", country_code: "AUS", coordinates: [116.39, -32.69] },
  { name: "オリンピックダム", nameEn: "Olympic Dam", country_code: "AUS", coordinates: [136.88, -30.43] },
  { name: "カディア鉱山", nameEn: "Cadia", country_code: "AUS", coordinates: [148.97, -33.46] },
  { name: "ポーチェフストロイ", nameEn: "Pavlik", country_code: "RUS", coordinates: [161.39, 59.62] },
  { name: "ナタルカ鉱山", nameEn: "Natalka", country_code: "RUS", coordinates: [147.49, 62.28] },
  { name: "オリンピアダ", nameEn: "Olimpiada", country_code: "RUS", coordinates: [88.56, 61.33] },
  { name: "ポンティアック", nameEn: "Pontiac", country_code: "CAN", coordinates: [-78.36, 48.14] },
  { name: "マラルティック", nameEn: "Malartic", country_code: "CAN", coordinates: [-78.12, 48.14] },
  { name: "カークランドレイク", nameEn: "Kirkland Lake", country_code: "CAN", coordinates: [-79.87, 48.15] },
  { name: "ダトン鉱山", nameEn: "Daton", country_code: "CHN", coordinates: [90.27, 42.52] },
  { name: "ジャディン金鉱", nameEn: "Jiaojia", country_code: "CHN", coordinates: [120.48, 37.35] },
  { name: "ヤンシャー鉱山", nameEn: "Yangshan", country_code: "CHN", coordinates: [104.62, 33.42] },
  { name: "ムポネン鉱山", nameEn: "Mponeng", country_code: "ZAF", coordinates: [26.51, -26.42] },
  { name: "ドリーフォンテイン", nameEn: "Driefontein", country_code: "ZAF", coordinates: [27.49, -26.41] },
  { name: "ヤナコチャ", nameEn: "Yanacocha", country_code: "PER", coordinates: [-78.52, -11.53] },
  { name: "プエブロビエホ", nameEn: "Pueblo Viejo", country_code: "DOM", coordinates: [-70.99, 19.00] },
  { name: "グラスバーグ", nameEn: "Grasberg", country_code: "IDN", coordinates: [137.11, -4.05] },
  { name: "ムルンタウ鉱山", nameEn: "Muruntau", country_code: "UZB", coordinates: [64.60, 41.67] },
  { name: "クリオロ", nameEn: "Cripple Creek", country_code: "USA", coordinates: [-105.18, 38.75] },
];

/** 銀鉱山 */
const SILVER_MINES: ResourceMine[] = [
  { name: "ペニャスキート", nameEn: "Peñasquito", country_code: "MEX", coordinates: [-103.0, 23.0] },
  { name: "フレスニージョ", nameEn: "Fresnillo", country_code: "MEX", coordinates: [-102.87, 23.18] },
  { name: "サビーナス", nameEn: "Saucito", country_code: "MEX", coordinates: [-102.7, 23.1] },
  { name: "ウチュチャクア", nameEn: "Uchucchacua", country_code: "PER", coordinates: [-76.5, -10.4] },
  { name: "アンティミナ", nameEn: "Antamina", country_code: "PER", coordinates: [-77.05, -9.53] },
  { name: "カニングトン", nameEn: "Cannington", country_code: "AUS", coordinates: [140.88, -21.87] },
  { name: "マウントアイザ", nameEn: "Mount Isa", country_code: "AUS", coordinates: [139.49, -20.73] },
  { name: "ポルコビツェ", nameEn: "Polkowice-Sieroszowice", country_code: "POL", coordinates: [16.07, 51.50] },
  { name: "ルブシュ", nameEn: "Lubin", country_code: "POL", coordinates: [16.20, 51.40] },
  { name: "杜家荘", nameEn: "Ying", country_code: "CHN", coordinates: [111.5, 34.6] },
  { name: "白銀", nameEn: "Baiyin", country_code: "CHN", coordinates: [104.14, 36.55] },
  { name: "ドゥカト", nameEn: "Dukat", country_code: "RUS", coordinates: [155.55, 62.55] },
  { name: "エスコンディーダ", nameEn: "Escondida", country_code: "CHL", coordinates: [-68.9, -24.27] },
  { name: "サンクリストバル", nameEn: "San Cristóbal", country_code: "BOL", coordinates: [-67.12, -21.08] },
  { name: "グリーンクリーク", nameEn: "Greens Creek", country_code: "USA", coordinates: [-134.75, 58.08] },
  { name: "ロチェスター", nameEn: "Rochester", country_code: "USA", coordinates: [-118.12, 40.28] },
  { name: "レッドレイク", nameEn: "Red Lake", country_code: "CAN", coordinates: [-93.82, 51.03] },
  { name: "エスケイビー", nameEn: "Eskay Creek", country_code: "CAN", coordinates: [-130.25, 57.37] },
];

const MINES_BY_RESOURCE: Record<string, ResourceMine[]> = {
  gold: GOLD_MINES,
  silver: SILVER_MINES,
};

/**
 * 指定した資源・国に紐づく鉱山一覧を返す。
 * MetalChart の資源 id（gold, silver など）に対応。
 */
export function getMinesByResourceAndCountry(
  resourceId: string,
  countryCode: string
): ResourceMine[] {
  const list = MINES_BY_RESOURCE[resourceId.toLowerCase()];
  if (!list) return [];
  const code = countryCode.toUpperCase();
  return list.filter((m) => m.country_code === code);
}

/** 資源 id に鉱山データがあるか */
export function hasMineDataForResource(resourceId: string): boolean {
  return resourceId != null && MINES_BY_RESOURCE[resourceId.toLowerCase()] != null;
}

/** 指定した資源の全世界の鉱山一覧を返す（産出地表示用） */
export function getAllMinesForResource(resourceId: string): ResourceMine[] {
  const list = MINES_BY_RESOURCE[resourceId.toLowerCase()];
  return list ? [...list] : [];
}
