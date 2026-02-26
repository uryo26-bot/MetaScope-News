/**
 * 精錬・取引の拠点（地形表示時に黒色の円で表示）
 * 座標は [経度 lng, 緯度 lat]
 */
export type RefiningHub = {
  name: string;
  country_code: string;
  coordinates: [number, number];
};

export const REFINING_HUBS: RefiningHub[] = [
  { name: "チューリッヒ", country_code: "CHE", coordinates: [8.54, 47.38] },
  { name: "ロンドン", country_code: "GBR", coordinates: [-0.13, 51.51] },
  { name: "ドバイ", country_code: "ARE", coordinates: [55.27, 25.20] },
  { name: "シンガポール", country_code: "SGP", coordinates: [103.85, 1.28] },
  { name: "香港", country_code: "HKG", coordinates: [114.17, 22.28] },
  { name: "ニューヨーク", country_code: "USA", coordinates: [-74.01, 40.71] },
];
