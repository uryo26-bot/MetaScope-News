"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import mapboxgl from "mapbox-gl";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import { getIso2FromIso3 } from "../../lib/countryFlags";
import { getChartItemFillColor } from "../../lib/portchartColors";
import { getMinesByResourceAndCountry, hasMineDataForResource, getAllMinesForResource } from "../../data/resourceMines";
import { REFINING_HUBS } from "../../data/refiningHubs";
import { getResourceById, resourceList } from "../../data/resources";
import { getCropById, cropList } from "../../data/crops";
import countriesInfoJson from "../../data/countries-info.json";

/** ISO3 → 基礎情報（人口・GDP は countries-info.json の値。GDP は十億USD） */
const countriesInfo = countriesInfoJson as Record<string, { nameJa?: string; population?: number; gdp?: number }>;

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

type ShareItem = { country: string; value: number; country_code?: string };

type CountryInfo = {
  nameJa: string;
  iso: string;
  population: number | null;
  gdp: number | null;
  region: string | null;
};

/** 人口を日本語表記にする（例: 41651163 → "4165万1163人"） */
function formatPopulationJa(n: number): string {
  if (n >= 100000000) {
    const oku = Math.floor(n / 100000000);
    const man = Math.floor((n % 100000000) / 10000);
    const rest = n % 10000;
    if (man === 0 && rest === 0) return `${oku}億人`;
    if (rest === 0) return `${oku}億${man}万人`;
    return `${oku}億${man}万${rest}人`;
  }
  if (n >= 10000) {
    const man = Math.floor(n / 10000);
    const rest = n % 10000;
    if (rest === 0) return `${man}万人`;
    return `${man}万${rest}人`;
  }
  return `${n}人`;
}

/** REST Countries の region を日本語に */
const REGION_JA: Record<string, string> = {
  Africa: "アフリカ",
  Americas: "アメリカ州",
  Asia: "アジア",
  Europe: "ヨーロッパ",
  Oceania: "オセアニア",
  Antarctic: "南極",
};
/** REST Countries の subregion を日本語に */
const SUBREGION_JA: Record<string, string> = {
  "Eastern Asia": "東アジア",
  "South-Eastern Asia": "東南アジア",
  "Southern Asia": "南アジア",
  "Western Asia": "西アジア",
  "Central Asia": "中央アジア",
  "Northern Europe": "北ヨーロッパ",
  "Western Europe": "西ヨーロッパ",
  "Southern Europe": "南ヨーロッパ",
  "Eastern Europe": "東ヨーロッパ",
  "Central Europe": "中央ヨーロッパ",
  "Southeast Europe": "南東ヨーロッパ",
  "North America": "北アメリカ",
  "Central America": "中央アメリカ",
  "South America": "南アメリカ",
  Caribbean: "カリブ海",
  "Eastern Africa": "東アフリカ",
  "Western Africa": "西アフリカ",
  "Northern Africa": "北アフリカ",
  "Southern Africa": "南部アフリカ",
  "Middle Africa": "中部アフリカ",
  "Australia and New Zealand": "オーストラリア・ニュージーランド",
  Melanesia: "メラネシア",
  Micronesia: "ミクロネシア",
  Polynesia: "ポリネシア",
};
function formatRegionJa(region: string, subregion?: string): string {
  const regionJa = REGION_JA[region] ?? region;
  if (subregion && subregion.trim()) {
    const subJa = SUBREGION_JA[subregion] ?? subregion;
    return `${regionJa}（${subJa}）`;
  }
  return regionJa;
}

/** GDP（十億USD）を日本円で表記する（1USD=150円で換算） */
const USD_JPY = 150;
function formatGdpJa(gdpBillionUsd: number): string {
  const yen = gdpBillionUsd * 1e9 * USD_JPY;
  if (yen >= 1e12) {
    const cho = Math.floor(yen / 1e12);
    const oku = Math.round((yen % 1e12) / 1e8);
    if (oku === 0) return `約${cho}兆円`;
    return `約${cho}兆${oku}億円`;
  }
  if (yen >= 1e8) return `約${Math.round(yen / 1e8)}億円`;
  return `約${Math.round(yen / 1e4)}万円`;
}

/** 地図上のデフォルト塗り（上位5以外は白＝非強調） */
const DEFAULT_FILL = "#ffffff";
const LAND_GRAY = "#e5e7eb";
/** 海をほんのわずか青寄り（冷静で知的な空気・やりすぎ厳禁） */
const WATER_WHITE = "#eef4f9";
/** 強調色ベース（濃紺系・単色で段階的濃度） */
const ACCENT_NAVY = "#1e3a5f";
/** 国の塗り：最大依存国を強く・3〜5位はわずかに薄く（視線の入り口を明確に） */
const FILL_TIER_3 = "#131b30"; // 30%以上 最も濃い（明度をわずかに下げてコントラストアップ）
const FILL_TIER_2 = "#243b5c"; // 15〜30% やや濃い
const FILL_TIER_1 = "#3a5570"; // 5〜15% 中程度（わずかに薄く）
/** 流れ線：空気化（気づいたら繋がっている・説明ではなく気配） */
const FLOW_LINE_OPACITY = 0.5;
const FLOW_LINE_OPACITY_SELECTED = 0.7;
/** 地図上のオーバーレイ：半透明・枠なし・ブラー・存在感を下げる */
const PANEL_BG = "bg-white/70 backdrop-blur-sm";
/** 表示する上位国数（差を見せる設計） */
const TOP_N = 5;
/** 流れ線を表示する最小割合（%未満は非表示） */
const FLOW_MIN_PERCENT = 5;

/** PortChart v1: 物理構造のみ。フローライン・取引拠点・アニメーションは表示しない */
const PORTCHART_V1 = true;
/** v1: 代表鉱山の最大表示数 */
const REPRESENTATIVE_MINES_MAX = 8;

/** 面積保存型：日本円の半径（100%＝総量）。輸入元円の面積合計＝日本円の面積になるよう各国は sqrt(割合)*R_JAPAN */
const R_JAPAN = 3.8;
/** 輸入元円の最小半径（視認性確保） */
const R_ORIGIN_MIN = 0.9;

/** 選択時の抽象→具体トランジション（静かな切り替え・ズームしない） */
const FOCUS_TRANSITION_MS = 250;
/** 選択時・非選択国の塗り（背景化・彩度を落とす） */
const DESELECTED_FILL = "#e8eaed";
/** 選択国のみやや彩度を戻す（5〜10%・リアルにしすぎない）※chart/id 未設定時フォールバック */
const SELECTED_TIER_3 = "#17233a";
const SELECTED_TIER_2 = "#283f5e";
const SELECTED_TIER_1 = "#3d5975";

/** HEX を暗くする（0〜1、黒にブレンド） */
function darkenHex(hex: string, pct: number): string {
  const n = hex.replace(/^#/, "");
  if (n.length !== 6) return hex;
  const r = Math.round(parseInt(n.slice(0, 2), 16) * (1 - pct));
  const g = Math.round(parseInt(n.slice(2, 4), 16) * (1 - pct));
  const b = Math.round(parseInt(n.slice(4, 6), 16) * (1 - pct));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

/** HEX を明るくする（0〜1、白にブレンド） */
function lightenHex(hex: string, pct: number): string {
  const n = hex.replace(/^#/, "");
  if (n.length !== 6) return hex;
  const r = Math.round(parseInt(n.slice(0, 2), 16) + (255 - parseInt(n.slice(0, 2), 16)) * pct);
  const g = Math.round(parseInt(n.slice(2, 4), 16) + (255 - parseInt(n.slice(2, 4), 16)) * pct);
  const b = Math.round(parseInt(n.slice(4, 6), 16) + (255 - parseInt(n.slice(4, 6), 16)) * pct);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

/** HEX を rgba(r,g,b,alpha) に変換 */
function hexToRgba(hex: string, alpha: number): string {
  const n = hex.replace(/^#/, "");
  if (n.length !== 6) return `rgba(30,58,95,${alpha})`;
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/** MetalChart / AgriChart / EneChart の資源色から地図用 tier 色を導出 */
function getThemeTiers(chart: string, id: string): {
  tier3: string;
  tier2: string;
  tier1: string;
  selectedTier3: string;
  selectedTier2: string;
  selectedTier1: string;
} {
  const base = getChartItemFillColor(chart, id);
  return {
    tier3: darkenHex(base, 0.35),
    tier2: darkenHex(base, 0.12),
    tier1: lightenHex(base, 0.25),
    selectedTier3: darkenHex(base, 0.18),
    selectedTier2: base,
    selectedTier1: lightenHex(base, 0.15),
  };
}

const CENTER_JAPAN: [number, number] = [138, 36];
/** 初期表示: さらに約1.5倍ズームアウト (2^(-1.17) ≈ 1/2.25) */
const INITIAL_ZOOM = -1.17;
const MAX_BOUNDS: [[number, number], [number, number]] = [
  [-180, -85.051129],
  [180, 85.051129],
];

/** GeoJSON から指定した ISO_A3 の国の bounds [[west,south],[east,north]] を返す */
function getCountryBounds(
  fc: GeoJSON.FeatureCollection | null,
  iso3: string
): [[number, number], [number, number]] | null {
  if (!fc?.features) return null;
  const feature = fc.features.find(
    (f) => f.properties && (f.properties as { ISO_A3?: string }).ISO_A3 === iso3
  );
  if (!feature?.geometry || feature.geometry.type === "Point") return null;
  let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
  const addCoords = (coords: number[] | number[][] | number[][][]) => {
    if (typeof coords[0] === "number") {
      const [lng, lat] = coords as number[];
      minLng = Math.min(minLng, lng); minLat = Math.min(minLat, lat);
      maxLng = Math.max(maxLng, lng); maxLat = Math.max(maxLat, lat);
      return;
    }
    (coords as (number[] | number[][] | number[][])[]).forEach(addCoords);
  };
  if (feature.geometry.type === "Polygon") {
    feature.geometry.coordinates.forEach(addCoords);
  } else if (feature.geometry.type === "MultiPolygon") {
    feature.geometry.coordinates.forEach((poly) => poly.forEach(addCoords));
  }
  if (minLng === Infinity) return null;
  return [[minLng, minLat], [maxLng, maxLat]];
}

/** GeoJSON から指定した ISO_A3 の国の Feature を返す */
function getCountryFeature(
  fc: GeoJSON.FeatureCollection | null,
  iso3: string
): GeoJSON.Feature | null {
  if (!fc?.features) return null;
  const feature = fc.features.find(
    (f) => f.properties && (f.properties as { ISO_A3?: string }).ISO_A3 === iso3
  );
  return feature?.geometry && feature.geometry.type !== "Point" ? feature : null;
}

/** GeoJSON から指定した ISO_A3 の国の重心 [lng, lat] を返す（国土の幾何学的重心） */
function getCountryCentroid(
  fc: GeoJSON.FeatureCollection | null,
  iso3: string
): [number, number] | null {
  const feature = getCountryFeature(fc, iso3);
  if (!feature?.geometry || (feature.geometry.type !== "Polygon" && feature.geometry.type !== "MultiPolygon"))
    return null;
  const rings = getExteriorRings(feature.geometry);
  let sumCx = 0;
  let sumCy = 0;
  let sumArea = 0;
  for (const ring of rings) {
    const { cx, cy, area } = ringCentroidAndArea(ring);
    sumCx += cx * area;
    sumCy += cy * area;
    sumArea += area;
  }
  if (sumArea <= 0) return null;
  return [sumCx / sumArea, sumCy / sumArea];
}

/** 1つの閉じたリングから重心 [lng, lat] と符号付き面積を求める（平面近似） */
function ringCentroidAndArea(ring: GeoJSON.Position[]): { cx: number; cy: number; area: number } {
  let area = 0;
  let cx = 0;
  let cy = 0;
  const n = ring.length - 1;
  if (n < 2) return { cx: ring[0][0], cy: ring[0][1], area: 0 };
  for (let i = 0; i < n; i++) {
    const [x0, y0] = ring[i];
    const [x1, y1] = ring[i + 1];
    const cross = x0 * y1 - x1 * y0;
    area += cross;
    cx += (x0 + x1) * cross;
    cy += (y0 + y1) * cross;
  }
  area *= 0.5;
  const k = 1 / (6 * area);
  return { cx: cx * k, cy: cy * k, area: Math.abs(area) };
}

/** Polygon / MultiPolygon の外環を Position[][] の形で返す */
function getExteriorRings(geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon): GeoJSON.Position[][] {
  if (geometry.type === "Polygon") return [geometry.coordinates[0]];
  return geometry.coordinates.map((poly) => poly[0]);
}

/**
 * 2点を結ぶ線に立体感用の反りを付けた中間点を1つ追加する（二次ベジェの制御点を経由）。
 * 戻り値は [start, ...quadraticBezierPoints, end] の座標配列。
 */
function curvedLineToJapan(from: [number, number], to: [number, number], segments = 8): [number, number][] {
  const mid: [number, number] = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2];
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const bulge = 0.06 * dist; // さらに穏やかに（交通アプリ感を排し・静かな抽象曲線）
  const perpLng = (-dy / dist) * bulge;
  const perpLat = (dx / dist) * bulge;
  const control: [number, number] = [mid[0] + perpLng, mid[1] + perpLat];
  const out: [number, number][] = [from];
  for (let i = 1; i < segments; i++) {
    const t = i / segments;
    const mt = 1 - t;
    const lng = mt * mt * from[0] + 2 * mt * t * control[0] + t * t * to[0];
    const lat = mt * mt * from[1] + 2 * mt * t * control[1] + t * t * to[1];
    out.push([lng, lat]);
  }
  out.push(to);
  return out;
}

/** 割合に応じた塗り色（4段階）。theme が渡されれば Metal/Agri/EneChart の資源色に対応。 */
function getFillColorByTier(value: number, _iso3: string | undefined, theme?: { tier3: string; tier2: string; tier1: string }): string {
  const t3 = theme?.tier3 ?? FILL_TIER_3;
  const t2 = theme?.tier2 ?? FILL_TIER_2;
  const t1 = theme?.tier1 ?? FILL_TIER_1;
  if (value >= 30) return t3;
  if (value >= 15) return t2;
  if (value >= 5) return t1;
  return t1;
}

/** 選択時のみ使用する塗り色（ほんの少し彩度を戻す）。theme が渡されれば資源色に対応。 */
function getSelectedFillColorByTier(value: number, _iso3: string | undefined, theme?: { selectedTier3: string; selectedTier2: string; selectedTier1: string }): string {
  const t3 = theme?.selectedTier3 ?? SELECTED_TIER_3;
  const t2 = theme?.selectedTier2 ?? SELECTED_TIER_2;
  const t1 = theme?.selectedTier1 ?? SELECTED_TIER_1;
  if (value >= 30) return t3;
  if (value >= 15) return t2;
  if (value >= 5) return t1;
  return t1;
}

/** 上位5か国の重心ポイント GeoJSON（面積比例用に value を含む） */
function buildCentroidsGeoJSON(
  fc: GeoJSON.FeatureCollection | null,
  shareData: ShareItem[]
): GeoJSON.FeatureCollection {
  const features: GeoJSON.Feature<GeoJSON.Point, { country_code: string; value: number }>[] = [];
  shareData.forEach((d) => {
    if (!d.country_code || d.country_code === "JPN" || d.value < FLOW_MIN_PERCENT) return;
    const centroid = getCountryCentroid(fc, d.country_code);
    if (!centroid) return;
    features.push({
      type: "Feature",
      properties: { country_code: d.country_code, value: d.value },
      geometry: { type: "Point", coordinates: centroid },
    });
  });
  return { type: "FeatureCollection", features };
}

/** 産出国割合用：各国重心に「国名 XX%」ラベルを持つポイント GeoJSON */
function buildProductionLabelsGeoJSON(
  fc: GeoJSON.FeatureCollection | null,
  shareData: ShareItem[]
): GeoJSON.FeatureCollection<GeoJSON.Point, { label: string }> {
  const features: GeoJSON.Feature<GeoJSON.Point, { label: string }>[] = [];
  shareData.forEach((d) => {
    if (!d.country_code || d.country_code === "JPN") return;
    const centroid = getCountryCentroid(fc, d.country_code);
    if (!centroid) return;
    const value = typeof d.value === "number" ? d.value : 0;
    const name = d.country ?? d.country_code;
    features.push({
      type: "Feature",
      properties: { label: `${name} ${value}%` },
      geometry: { type: "Point", coordinates: centroid },
    });
  });
  return { type: "FeatureCollection", features };
}

/** 該当国から日本への流れ線 GeoJSON（上位5か国・5%未満は非表示・順位で太さ・日本側濃いグラデ用） */
function buildFlowToJapanGeoJSON(
  fc: GeoJSON.FeatureCollection | null,
  shareData: ShareItem[]
): GeoJSON.FeatureCollection {
  const features: GeoJSON.Feature<GeoJSON.LineString, { value: number; country_code: string; rank: number }>[] = [];
  shareData.forEach((d, index) => {
    if (!d.country_code || d.country_code === "JPN") return;
    if (d.value < FLOW_MIN_PERCENT) return;
    const centroid = getCountryCentroid(fc, d.country_code);
    if (!centroid) return;
    const coordinates = curvedLineToJapan(centroid, CENTER_JAPAN);
    features.push({
      type: "Feature",
      properties: { value: d.value, country_code: d.country_code, rank: index + 1 },
      geometry: { type: "LineString", coordinates },
    });
  });
  return { type: "FeatureCollection", features };
}

/** 選択国の国境（やや太め） */
const SELECTED_BORDER_WIDTH = 2.5;

/** 北アメリカ・南アメリカの国（ISO_A3）。これらは基礎情報を画面右側に表示 */
const AMERICAS_ISO3 = new Set([
  "USA", "CAN", "MEX", "GTM", "BLZ", "SLV", "HND", "NIC", "CRI", "PAN", "CUB", "HTI", "DOM", "JAM", "PRI",
  "BHS", "BRB", "DMA", "GRD", "LCA", "VCT", "TTO", "KNA", "ATG", "COL", "VEN", "GUY", "SUR", "ECU", "PER",
  "BRA", "BOL", "PRY", "CHL", "ARG", "URY", "FLK", "GRL", "SPM", "SXM", "CUR", "ABW", "MAF", "GLP", "MTQ",
  "BLM", "GUF", "CYM", "TCA", "VGB", "AIA", "MSR", "BES",
]);

function isAmericasCountry(iso3: string): boolean {
  return AMERICAS_ISO3.has(iso3.toUpperCase());
}

/** EneChart の PortChart 表示名（輸入元データがある電源） */
const ENECHART_DISPLAY_NAMES: Record<string, string> = {
  lng: "天然ガス",
  coal: "石炭",
  oil: "石油",
};

/** chart に応じた品目 id 一覧（輸出入割合内訳の取得用） */
function getItemIdsForChart(chart: string): string[] {
  if (chart === "metalchart") return resourceList.map((r) => r.id);
  if (chart === "agrichart") return cropList.map((c) => c.id);
  if (chart === "enechart") return Object.keys(ENECHART_DISPLAY_NAMES);
  return [];
}

/** 品目 id の表示名を取得 */
function getItemDisplayName(chart: string, itemId: string): string {
  if (chart === "metalchart") return getResourceById(itemId)?.name ?? itemId;
  if (chart === "agrichart") return getCropById(itemId)?.name ?? itemId;
  if (chart === "enechart") return ENECHART_DISPLAY_NAMES[itemId] ?? itemId;
  return itemId;
}

export function PortChartClient() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const sourceAddedRef = useRef(false);
  const highlightColorRef = useRef("#64748b");
  const shareDataRef = useRef<ShareItem[]>([]);
  const handleCountrySelectRef = useRef<(code: string, nameJa: string) => void>(() => {});
  const countryLayerHandlersRef = useRef<{
    click?: (e: mapboxgl.MapMouseEvent) => void;
    mouseenter?: () => void;
    mouseleave?: () => void;
  }>({});

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const chart = searchParams.get("chart") ?? "";
  const id = searchParams.get("id") ?? "";
  const year = searchParams.get("year") ?? "2024";
  const type = searchParams.get("type") ?? "import";

  const setType = useCallback(
    (newType: "import" | "production") => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("type", newType);
      router.replace(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  const setYear = useCallback(
    (newYear: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("year", newYear);
      router.replace(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  const [shareData, setShareData] = useState<ShareItem[]>([]);
  const [countriesGeojson, setCountriesGeojson] = useState<GeoJSON.FeatureCollection | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<{ code: string; nameJa: string } | null>(null);
  const [countryInfo, setCountryInfo] = useState<CountryInfo | null>(null);
  const [countryInfoLoading, setCountryInfoLoading] = useState(false);
  /** 日本中心のピクセル位置（依存の中心オーバーレイ用） */
  const [japanPixel, setJapanPixel] = useState<{ x: number; y: number } | null>(null);
  /** 国名・シェアラベルのピクセル位置（高緯度国では上に出ると見切れるため placement で上下を切替） */
  const [productionLabelPixel, setProductionLabelPixel] = useState<{ x: number; y: number; placement: "above" | "below" } | null>(null);
  /** 地形レイヤーを表示中か */
  const [showTerrain, setShowTerrain] = useState(false);
  /** 産出地（鉱山・精錬拠点）を全世界表示するか */
  const [showProductionLocations, setShowProductionLocations] = useState(false);
  /** 構造理解用アニメーション段階（0=地図のみ, 1=鉱山, 2=+精錬拠点, 3=+フローライン） */
  const [animationStep, setAnimationStep] = useState(0);
  const animationHasRunRef = useRef(false);
  const animationTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const terrainSourceAddedRef = useRef(false);
  /** 輸出入割合を表示ボタンで開いた品目別内訳 */
  const [showShareBreakdown, setShowShareBreakdown] = useState(false);
  const [shareBreakdownData, setShareBreakdownData] = useState<{ itemId: string; itemName: string; value: number }[] | null>(null);
  const [shareBreakdownLoading, setShareBreakdownLoading] = useState(false);
  /** 日本における金の自給率（%）。metalchart & id=gold のときのみ取得 */
  const [goldSelfSufficiency, setGoldSelfSufficiency] = useState<number | null>(null);

  useEffect(() => {
    if (!chart || !id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const typeLabel = type === "production" ? "産出国" : "輸入元";
    const name =
      chart === "enechart"
        ? (ENECHART_DISPLAY_NAMES[id] ?? decodeURIComponent(id))
        : decodeURIComponent(id);
    setTitle(`${name} → ${typeLabel}割合（${year}年）`);

    Promise.all([
      fetch(`/api/chart-import/${chart}/${encodeURIComponent(id)}?year=${year}&type=${type}`).then(
        (r) => r.json() as Promise<ShareItem[]>
      ),
      fetch("/api/countries-geojson").then((r) => r.json() as Promise<GeoJSON.FeatureCollection>),
    ])
      .then(([data, geojson]) => {
        setShareData(Array.isArray(data) ? data : []);
        setCountriesGeojson(geojson?.features ? geojson : null);
      })
      .catch(() => {
        setShareData([]);
        setCountriesGeojson(null);
      })
      .finally(() => setLoading(false));
  }, [chart, id, year, type]);

  // 金の自給率を取得（metalchart & id=gold のとき）
  useEffect(() => {
    if (chart !== "metalchart" || id !== "gold") {
      setGoldSelfSufficiency(null);
      return;
    }
    fetch(`/api/self-sufficiency/metalchart/gold?year=${year}`)
      .then((r) => r.json() as Promise<{ rate: number | null }>)
      .then((data) => setGoldSelfSufficiency(data.rate ?? null))
      .catch(() => setGoldSelfSufficiency(null));
  }, [chart, id, year]);

  /** 構造アニメーションを再生（0→1→2→3）。再生ボタンまたは初回ロードで使用 */
  const playAnimation = useCallback(() => {
    animationTimeoutsRef.current.forEach(clearTimeout);
    animationTimeoutsRef.current = [];
    setAnimationStep(0);
    setShowProductionLocations(false);
    const t1 = setTimeout(() => {
      setAnimationStep(1);
      animationHasRunRef.current = true;
    }, 500);
    const t2 = setTimeout(() => setAnimationStep(2), 1000);
    const t3 = setTimeout(() => {
      setAnimationStep(3);
      setShowProductionLocations(true);
    }, 1500);
    animationTimeoutsRef.current = [t1, t2, t3];
  }, []);

  // 構造理解用アニメーション: 初回ロード時に1回だけ自動再生（v1では無効）
  useEffect(() => {
    if (PORTCHART_V1 || !mapReady || !countriesGeojson || chart !== "metalchart" || !id || animationHasRunRef.current) return;
    playAnimation();
    return () => animationTimeoutsRef.current.forEach(clearTimeout);
  }, [mapReady, countriesGeojson, chart, id, playAnimation]);

  /** 上位5か国のみ（差を見せる設計）。価値で降順ソート済みを前提 */
  const shareDataTop5 = [...shareData]
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))
    .slice(0, TOP_N);

  const countryCodes = shareDataTop5
    .map((d) => d.country_code)
    .filter((c): c is string => !!c && c.length === 3);

  /** 強調色は資源色 or 濃紺 */
  highlightColorRef.current = chart && id ? getChartItemFillColor(chart, id) : ACCENT_NAVY;
  shareDataRef.current = shareDataTop5;
  handleCountrySelectRef.current = (code: string, nameJa: string) => {
    setSelectedCountry({ code, nameJa });
    // ズームはしない（思考UI・焦点を見せるのみ）
  };

  const focusMapOnCountry = useCallback(
    (countryCode: string) => {
      const map = mapRef.current;
      if (!map || !countriesGeojson) return;
      const bounds = getCountryBounds(countriesGeojson, countryCode);
      if (!bounds) return;
      const [[west, south], [east, north]] = bounds;
      const zoomOutBy = 3 * Math.log2(1.5) + Math.log2(3);
      const expand = Math.pow(2, zoomOutBy / 2);
      const centerLng = (west + east) / 2;
      const centerLat = (south + north) / 2;
      const halfW = ((east - west) / 2) * expand;
      const halfH = ((north - south) / 2) * expand;
      const swLat = Math.max(-90, centerLat - halfH);
      const neLat = Math.min(90, centerLat + halfH);
      let swLng = centerLng - halfW;
      let neLng = centerLng + halfW;
      if (neLng - swLng >= 360) {
        swLng = -180;
        neLng = 180;
      } else {
        swLng = Math.max(-180, swLng);
        neLng = Math.min(180, neLng);
      }
      const expandedBounds: [[number, number], [number, number]] = [
        [swLng, swLat],
        [neLng, neLat],
      ];
      map.fitBounds(expandedBounds, { padding: 48, maxZoom: 8, duration: 800 });
    },
    [countriesGeojson]
  );

  // 選択国の基礎情報を取得（静的な人口・GDP は countries-info.json、人口は REST Countries で補完）
  useEffect(() => {
    if (!selectedCountry) {
      setCountryInfo(null);
      return;
    }
    setCountryInfoLoading(true);
    const code = selectedCountry.code.toUpperCase();
    const staticData = countriesInfo[code];
    setCountryInfo({
      nameJa: selectedCountry.nameJa,
      iso: selectedCountry.code,
      population: typeof staticData?.population === "number" ? staticData.population : null,
      gdp: typeof staticData?.gdp === "number" ? staticData.gdp : null,
      region: null,
    });
    const codeLower = selectedCountry.code.toLowerCase();
    fetch(`https://restcountries.com/v3.1/alpha/${codeLower}?fields=name,population,region,subregion`)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        const one = Array.isArray(data) ? data[0] : data;
        if (one && typeof one === "object") {
          const updates: Partial<CountryInfo> = {};
          if (typeof one.population === "number") updates.population = one.population;
          if (typeof one.region === "string") {
            updates.region = formatRegionJa(one.region, typeof one.subregion === "string" ? one.subregion : undefined);
          }
          if (Object.keys(updates).length > 0) {
            setCountryInfo((prev) => prev ? { ...prev, ...updates } : null);
          }
        }
      })
      .catch(() => {})
      .finally(() => setCountryInfoLoading(false));
  }, [selectedCountry?.code]);

  // 選択国が変わったら輸出入割合内訳を閉じる
  useEffect(() => {
    if (!selectedCountry) {
      setShowShareBreakdown(false);
      setShareBreakdownData(null);
    }
  }, [selectedCountry?.code]);

  // 輸出入割合を表示 ON のとき、選択国の品目別割合を取得
  useEffect(() => {
    if (!showShareBreakdown || !selectedCountry || !chart || !id) {
      if (!showShareBreakdown) setShareBreakdownData(null);
      return;
    }
    const itemIds = getItemIdsForChart(chart);
    if (itemIds.length === 0) {
      setShareBreakdownData(null);
      setShareBreakdownLoading(false);
      return;
    }
    setShareBreakdownLoading(true);
    const code = selectedCountry.code.toUpperCase();
    const dataType = type;
    const y = year;
    Promise.all(
      itemIds.map((itemId) =>
        fetch(`/api/chart-import/${chart}/${encodeURIComponent(itemId)}?year=${y}&type=${dataType}`).then(
          (r) => r.json() as Promise<ShareItem[]>
        )
      )
    )
      .then((responses) => {
        const out: { itemId: string; itemName: string; value: number }[] = [];
        itemIds.forEach((itemId, i) => {
          const data = Array.isArray(responses[i]) ? responses[i] : [];
          const row = data.find((d) => (d.country_code ?? "").toUpperCase() === code);
          const value = row?.value ?? 0;
          if (value > 0) {
            out.push({ itemId, itemName: getItemDisplayName(chart, itemId), value });
          }
        });
        out.sort((a, b) => b.value - a.value);
        setShareBreakdownData(out);
      })
      .catch(() => setShareBreakdownData([]))
      .finally(() => setShareBreakdownLoading(false));
  }, [showShareBreakdown, selectedCountry?.code, chart, id, year, type]);

  // 地図を mapbox-gl で直接作成（日本中心・世界1枚・スクロール可能）
  useEffect(() => {
    if (!MAPBOX_TOKEN || !containerRef.current) return;

    const container = containerRef.current;
    const map = new mapboxgl.Map({
      container,
      accessToken: MAPBOX_TOKEN,
      style: "mapbox://styles/mapbox/streets-v12",
      center: CENTER_JAPAN,
      zoom: INITIAL_ZOOM,
      minZoom: -2,
      renderWorldCopies: false,
      maxBounds: MAX_BOUNDS,
    });

    map.on("load", () => {
      if ("setProjection" in map && typeof (map as mapboxgl.Map & { setProjection?: (p: string) => void }).setProjection === "function") {
        (map as mapboxgl.Map & { setProjection: (p: string) => void }).setProjection("mercator");
      }
      map.resize();
      setMapReady(true);
      const style = map.getStyle();
      if (style?.layers) {
        const waterIds = /water|ocean|sea|waterway|marine/;
        for (const layer of style.layers) {
          try {
            if (layer.type === "background") {
              map.setPaintProperty(layer.id, "background-color", WATER_WHITE);
              continue;
            }
            if (layer.type === "fill") {
              const isWater = waterIds.test(layer.id);
              map.setPaintProperty(layer.id, "fill-color", isWater ? WATER_WHITE : LAND_GRAY);
              continue;
            }
            if (layer.type === "line" || layer.type === "symbol" || layer.type === "circle" || layer.type === "raster") {
              map.setLayoutProperty(layer.id, "visibility", "none");
            }
          } catch {
            /* レイヤーごとのプロパティ差は無視 */
          }
        }
      }
    });

    mapRef.current = map;

    const resize = () => map.resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
      sourceAddedRef.current = false;
      setMapReady(false);
    };
  }, []);

  // 国境 GeoJSON レイヤー追加・ハイライト更新
  useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || !map || !countriesGeojson) return;

    // 割合元グラフに含まれる国だけ地図上の国名ラベルを表示（Mapbox の country-label をフィルター）
    try {
      const countryLabelLayers = ["country-label", "country-label-sm", "place-label-country"];
      const iso2Codes =
        chart && id && shareDataTop5.length > 0
          ? shareDataTop5.map((d) => getIso2FromIso3(d.country_code ?? '')).filter((c): c is string => !!c)
          : null;
      const filter = iso2Codes?.length
        ? (["in", ["get", "iso_3166_1"], ["literal", iso2Codes]] as mapboxgl.FilterSpecification)
        : undefined;
      for (const layerId of countryLabelLayers) {
        if (map.getLayer(layerId)) map.setFilter(layerId, filter);
      }
    } catch {
      // スタイルによってはレイヤー名・プロパティが異なる場合がある
    }

    if (map.getSource("countries")) {
      (map.getSource("countries") as mapboxgl.GeoJSONSource).setData(countriesGeojson as GeoJSON.GeoJSON);
      const selectedCode = selectedCountry?.code ?? null;
      const transition = (PORTCHART_V1 ? { duration: 0 } : { duration: FOCUS_TRANSITION_MS }) as any;
      const themeTiers = chart && id ? getThemeTiers(chart, id) : undefined;
      const accentColor = chart && id ? getChartItemFillColor(chart, id) : ACCENT_NAVY;
      const flowLineGradient = (chart && id
        ? [
            "interpolate",
            ["linear"],
            ["line-progress"],
            0,
            hexToRgba(lightenHex(accentColor, 0.25), 0.45),
            1,
            hexToRgba(darkenHex(accentColor, 0.08), 0.78),
          ]
        : [
            "interpolate",
            ["linear"],
            ["line-progress"],
            0,
            "rgba(48,62,82,0.4)",
            1,
            "rgba(42,58,78,0.7)",
          ]) as mapboxgl.Expression;

      const fillColorMatch =
        countryCodes.length > 0
          ? selectedCode
            ? ["match", ["get", "ISO_A3"], ...shareDataTop5.flatMap((d) => [d.country_code!, d.country_code === selectedCode ? getSelectedFillColorByTier(d.value, d.country_code, themeTiers) : DESELECTED_FILL]), DEFAULT_FILL]
            : ["match", ["get", "ISO_A3"], ...shareDataTop5.flatMap((d) => [d.country_code!, getFillColorByTier(d.value, d.country_code, themeTiers)]), DEFAULT_FILL]
          : DEFAULT_FILL;

      const fillOpacityValue: number | mapboxgl.Expression = showTerrain
        ? 0
        : selectedCode
          ? (["match", ["get", "ISO_A3"], selectedCode, 0.95, 0.55] as mapboxgl.Expression)
          : 0.85;

      const outlineWidth: number | mapboxgl.Expression = showTerrain
        ? 0
        : selectedCode
          ? (["match", ["get", "ISO_A3"], selectedCode, 0.35, 0.12] as mapboxgl.Expression)
          : 0.18;
      const outlineColor: string | mapboxgl.Expression = selectedCode
        ? (["match", ["get", "ISO_A3"], selectedCode, "#94a3b8", "#eaecef"] as mapboxgl.Expression)
        : "#e2e6ea";

      map.setPaintProperty("countries-fill", "fill-color", fillColorMatch, transition);
      map.setPaintProperty("countries-fill", "fill-opacity", fillOpacityValue, transition);
      if (map.getLayer("countries-outline")) {
        map.setPaintProperty("countries-outline", "line-width", outlineWidth, transition);
        map.setPaintProperty("countries-outline", "line-color", outlineColor, transition);
      }
      if (!map.getSource("selected-country")) {
        map.addSource("selected-country", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });
        map.addLayer({
          id: "selected-country-glow",
          type: "line",
          source: "selected-country",
          paint: {
            "line-color": accentColor,
            "line-width": SELECTED_BORDER_WIDTH,
          },
        });
      } else if (map.getLayer("selected-country-glow")) {
        map.setPaintProperty("selected-country-glow", "line-color", accentColor);
      }
      const showFlow = type === "import";
      const showFlowLayer = !PORTCHART_V1 && type === "import" && (animationStep >= 3 || !(chart === "metalchart" && id));
      const showJapanMarker = PORTCHART_V1 ? type === "import" : showFlowLayer;
      const emptyFlow = { type: "FeatureCollection" as const, features: [] };
      const flowGeoJSONFull = showFlow ? buildFlowToJapanGeoJSON(countriesGeojson, shareDataTop5) : emptyFlow;
      const flowGeoJSON =
        showFlow && selectedCode && flowGeoJSONFull.features.length > 0
          ? {
              type: "FeatureCollection" as const,
              features: flowGeoJSONFull.features.filter(
                (f) => (f.properties as { country_code?: string }).country_code === selectedCode
              ),
            }
          : flowGeoJSONFull;
      const isFlowSelected = Boolean(selectedCode && flowGeoJSON.features.length > 0);
      const flowWidthByValue = [
        "interpolate",
        ["linear"],
        ["get", "value"],
        5,
        1.3,
        10,
        1.9,
        20,
        2.6,
        30,
        3.2,
        50,
        4,
        100,
        4.8,
      ] as mapboxgl.Expression;
      const flowOpacityByValue = [
        "interpolate",
        ["linear"],
        ["get", "value"],
        5,
        isFlowSelected ? 0.65 : 0.5,
        15,
        isFlowSelected ? 0.8 : 0.62,
        30,
        isFlowSelected ? 0.92 : 0.78,
        50,
        isFlowSelected ? 1 : 0.9,
      100,
      1,
      ] as mapboxgl.Expression;
      const centroidsGeoJSON = showFlow ? buildCentroidsGeoJSON(countriesGeojson, shareDataTop5) : { type: "FeatureCollection" as const, features: [] };
      if (map.getSource("top5-centroids")) {
        (map.getSource("top5-centroids") as mapboxgl.GeoJSONSource).setData(centroidsGeoJSON as GeoJSON.GeoJSON);
        if (map.getLayer("top5-origins")) {
          map.setLayoutProperty("top5-origins", "visibility", showFlowLayer ? "visible" : "none");
          map.setPaintProperty("top5-origins", "circle-color", accentColor);
          map.setPaintProperty("top5-origins", "circle-stroke-color", hexToRgba(accentColor, 0.25));
        }
      } else if (centroidsGeoJSON.features.length > 0) {
        map.addSource("top5-centroids", { type: "geojson", data: centroidsGeoJSON as GeoJSON.GeoJSON });
        map.addLayer(
          {
            id: "top5-origins",
            type: "circle",
            source: "top5-centroids",
            paint: {
              "circle-radius": ["max", R_ORIGIN_MIN, ["*", ["sqrt", ["/", ["get", "value"], 100]], R_JAPAN]],
              "circle-color": accentColor,
              "circle-opacity": 0.85,
              "circle-stroke-width": 0.25,
              "circle-stroke-color": hexToRgba(accentColor, 0.25),
            },
          },
          "selected-country-glow"
        );
      }
      if (map.getSource("flow-to-japan")) {
        (map.getSource("flow-to-japan") as mapboxgl.GeoJSONSource).setData(flowGeoJSON as GeoJSON.GeoJSON);
        if (map.getLayer("flow-to-japan-lines")) {
          map.setLayoutProperty("flow-to-japan-lines", "visibility", showFlowLayer ? "visible" : "none");
          map.setLayoutProperty("flow-to-japan-lines", "line-cap", "round");
          map.setLayoutProperty("flow-to-japan-lines", "line-join", "round");
          map.setPaintProperty("flow-to-japan-lines", "line-gradient", flowLineGradient);
          map.setPaintProperty("flow-to-japan-lines", "line-width", flowWidthByValue);
          map.setPaintProperty("flow-to-japan-lines", "line-opacity", flowOpacityByValue, showFlowLayer ? { duration: 400 } : undefined);
        }
      } else if (flowGeoJSON.features.length > 0) {
        map.addSource("flow-to-japan", { type: "geojson", data: flowGeoJSON as GeoJSON.GeoJSON, lineMetrics: true });
        map.addLayer(
          {
            id: "flow-to-japan-lines",
            type: "line",
            source: "flow-to-japan",
            layout: { "line-cap": "round", "line-join": "round" },
            paint: {
              "line-gradient": flowLineGradient,
              "line-width": flowWidthByValue,
              "line-opacity": flowOpacityByValue,
            },
          },
          "selected-country-glow"
        );
      }
      if (!map.getSource("japan-center")) {
        map.addSource("japan-center", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [{ type: "Feature", geometry: { type: "Point", coordinates: CENTER_JAPAN }, properties: {} }],
          },
        });
        map.addLayer(
          {
            id: "japan-glow",
            type: "circle",
            source: "japan-center",
            paint: {
              "circle-radius": 7.5,
              "circle-color": accentColor,
              "circle-opacity": 0.08,
              "circle-blur": 0.4,
            },
          },
          "selected-country-glow"
        );
        map.addLayer(
          {
            id: "japan-circle",
            type: "circle",
            source: "japan-center",
            paint: {
              "circle-radius": R_JAPAN,
              "circle-color": accentColor,
              "circle-opacity": 0.82,
              "circle-stroke-width": 0.2,
              "circle-stroke-color": hexToRgba(accentColor, 0.2),
            },
          },
          "selected-country-glow"
        );
      } else {
        if (map.getLayer("japan-glow")) {
          map.setLayoutProperty("japan-glow", "visibility", showJapanMarker ? "visible" : "none");
          map.setPaintProperty("japan-glow", "circle-color", accentColor);
        }
        if (map.getLayer("japan-circle")) {
          map.setLayoutProperty("japan-circle", "visibility", showJapanMarker ? "visible" : "none");
          map.setPaintProperty("japan-circle", "circle-color", accentColor);
          map.setPaintProperty("japan-circle", "circle-stroke-color", hexToRgba(accentColor, 0.2));
        }
      }
      // 輸入元・産出国割合時: 国土に国名と割合を常時表示
      const productionLabelsGeoJSON = shareDataTop5.length > 0
        ? buildProductionLabelsGeoJSON(countriesGeojson, shareDataTop5)
        : { type: "FeatureCollection" as const, features: [] as GeoJSON.Feature<GeoJSON.Point, { label: string }>[] };
      const showProductionLabels = productionLabelsGeoJSON.features.length > 0;
      if (map.getSource("production-country-labels")) {
        (map.getSource("production-country-labels") as mapboxgl.GeoJSONSource).setData(productionLabelsGeoJSON as GeoJSON.GeoJSON);
        if (map.getLayer("production-country-labels-symbol")) {
          map.setLayoutProperty("production-country-labels-symbol", "visibility", showProductionLabels ? "visible" : "none");
        }
      } else if (productionLabelsGeoJSON.features.length > 0) {
        map.addSource("production-country-labels", { type: "geojson", data: productionLabelsGeoJSON as GeoJSON.GeoJSON });
        map.addLayer(
          {
            id: "production-country-labels-symbol",
            type: "symbol",
            source: "production-country-labels",
            layout: {
              "text-field": ["get", "label"],
              "text-size": 13,
              "text-anchor": "center",
              "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
              "text-max-width": 12,
              visibility: showProductionLabels ? "visible" : "none",
            },
            paint: {
              "text-color": "#1e293b",
              "text-halo-color": "#ffffff",
              "text-halo-width": 2,
            },
          },
          "selected-country-glow"
        );
      }
      attachCountryClickHandler(map);
      return;
    }
    map.addSource("countries", {
      type: "geojson",
      data: countriesGeojson as GeoJSON.GeoJSON,
    });
    const accentColor = chart && id ? getChartItemFillColor(chart, id) : ACCENT_NAVY;
    const flowLineGradientInit = (chart && id
      ? [
          "interpolate",
          ["linear"],
          ["line-progress"],
          0,
          hexToRgba(lightenHex(accentColor, 0.25), 0.45),
          1,
          hexToRgba(darkenHex(accentColor, 0.08), 0.78),
        ]
      : [
          "interpolate",
          ["linear"],
          ["line-progress"],
          0,
          "rgba(48,62,82,0.4)",
          1,
          "rgba(42,58,78,0.7)",
        ]) as mapboxgl.Expression;
    const flowWidthByValueInit = [
      "interpolate",
      ["linear"],
      ["get", "value"],
      5,
      1.3,
      10,
      1.9,
      20,
      2.6,
      30,
      3.2,
      50,
      4,
      100,
      4.8,
    ] as mapboxgl.Expression;
    const fillColorMatch: mapboxgl.Expression =
      countryCodes.length > 0
        ? ["match", ["get", "ISO_A3"], ...shareDataTop5.flatMap((d) => [d.country_code!, getFillColorByTier(d.value, d.country_code, chart && id ? getThemeTiers(chart, id) : undefined)]), DEFAULT_FILL]
        : DEFAULT_FILL;
    map.addLayer({
      id: "countries-fill",
      type: "fill",
      source: "countries",
      paint: {
        "fill-color": fillColorMatch,
        "fill-opacity": 0.85,
      },
    });
    map.addLayer({
      id: "countries-outline",
      type: "line",
      source: "countries",
      paint: { "line-color": "#e2e6ea", "line-width": 0.18 },
    });
    if (!map.getSource("selected-country")) {
      map.addSource("selected-country", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
      map.addLayer({
        id: "selected-country-glow",
        type: "line",
        source: "selected-country",
        paint: {
          "line-color": accentColor,
          "line-width": SELECTED_BORDER_WIDTH,
        },
      });
    }
    const productionLabelsGeoJSONInit = shareDataTop5.length > 0
      ? buildProductionLabelsGeoJSON(countriesGeojson, shareDataTop5)
      : { type: "FeatureCollection" as const, features: [] as GeoJSON.Feature<GeoJSON.Point, { label: string }>[] };
    map.addSource("production-country-labels", { type: "geojson", data: productionLabelsGeoJSONInit as GeoJSON.GeoJSON });
    map.addLayer(
      {
        id: "production-country-labels-symbol",
        type: "symbol",
        source: "production-country-labels",
        layout: {
          "text-field": ["get", "label"],
          "text-size": 13,
          "text-anchor": "center",
          "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
          "text-max-width": 12,
          visibility: productionLabelsGeoJSONInit.features.length > 0 ? "visible" : "none",
        },
        paint: {
          "text-color": "#1e293b",
          "text-halo-color": "#ffffff",
          "text-halo-width": 2,
        },
      },
      "selected-country-glow"
    );
    const showFlow = type === "import";
    const flowGeoJSONFull = showFlow ? buildFlowToJapanGeoJSON(countriesGeojson, shareDataTop5) : { type: "FeatureCollection" as const, features: [] };
    const selectedCode = selectedCountry?.code;
    const flowGeoJSON =
      showFlow && selectedCode && flowGeoJSONFull.features.length > 0
        ? {
            type: "FeatureCollection" as const,
            features: flowGeoJSONFull.features.filter(
              (f) => (f.properties as { country_code?: string }).country_code === selectedCode
            ),
          }
        : flowGeoJSONFull;
    const isFlowSelected = Boolean(selectedCode && flowGeoJSON.features.length > 0);
    const flowOpacityByValueInit = [
      "interpolate",
      ["linear"],
      ["get", "value"],
      5,
      isFlowSelected ? 0.65 : 0.5,
      15,
      isFlowSelected ? 0.8 : 0.62,
      30,
      isFlowSelected ? 0.92 : 0.78,
      50,
      isFlowSelected ? 1 : 0.9,
      100,
      1,
    ] as mapboxgl.Expression;
    const hideFlowAndTop5 = PORTCHART_V1 || (chart === "metalchart" && id);
    const initialJapanVisible = PORTCHART_V1 ? type === "import" : !(chart === "metalchart" && id);
    if (flowGeoJSON.features.length > 0) {
      map.addSource("flow-to-japan", { type: "geojson", data: flowGeoJSON as GeoJSON.GeoJSON, lineMetrics: true });
      map.addLayer(
        {
          id: "flow-to-japan-lines",
          type: "line",
          source: "flow-to-japan",
          layout: { "line-cap": "round", "line-join": "round", visibility: hideFlowAndTop5 ? "none" : "visible" },
          paint: {
            "line-gradient": flowLineGradientInit,
            "line-width": flowWidthByValueInit,
            "line-opacity": flowOpacityByValueInit,
          },
        },
        "selected-country-glow"
      );
    }
    const centroidsGeoJSON = showFlow ? buildCentroidsGeoJSON(countriesGeojson, shareDataTop5) : { type: "FeatureCollection" as const, features: [] };
    const originRadiusExpr = ["max", R_ORIGIN_MIN, ["*", ["sqrt", ["/", ["get", "value"], 100]], R_JAPAN]] as mapboxgl.Expression;
    if (centroidsGeoJSON.features.length > 0) {
      map.addSource("top5-centroids", { type: "geojson", data: centroidsGeoJSON as GeoJSON.GeoJSON });
      map.addLayer(
        {
          id: "top5-origins",
          type: "circle",
          source: "top5-centroids",
          layout: hideFlowAndTop5 ? { visibility: "none" as const } : undefined,
          paint: {
            "circle-radius": originRadiusExpr,
            "circle-color": accentColor,
            "circle-opacity": 0.85,
            "circle-stroke-width": 0.25,
            "circle-stroke-color": hexToRgba(accentColor, 0.25),
          },
        },
        "selected-country-glow"
      );
    }
    if (!map.getSource("japan-center")) {
      map.addSource("japan-center", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [{ type: "Feature", geometry: { type: "Point", coordinates: CENTER_JAPAN }, properties: {} }],
        },
      });
        map.addLayer(
          {
            id: "japan-glow",
            type: "circle",
            source: "japan-center",
            layout: initialJapanVisible ? {} : { visibility: "none" as const },
            paint: {
              "circle-radius": 7.5,
              "circle-color": accentColor,
              "circle-opacity": 0.08,
              "circle-blur": 0.4,
            },
          },
          "selected-country-glow"
        );
      map.addLayer(
        {
            id: "japan-circle",
            type: "circle",
            source: "japan-center",
            layout: initialJapanVisible ? {} : { visibility: "none" as const },
            paint: {
            "circle-radius": R_JAPAN,
            "circle-color": accentColor,
            "circle-opacity": 0.82,
            "circle-stroke-width": 0.2,
            "circle-stroke-color": hexToRgba(accentColor, 0.2),
          },
        },
        "selected-country-glow"
      );
    }
    attachCountryClickHandler(map);
    sourceAddedRef.current = true;
  }, [mapReady, countriesGeojson, countryCodes.join(","), chart, id, type, shareDataTop5, selectedCountry?.code, showTerrain, animationStep]);

  function attachCountryClickHandler(map: mapboxgl.Map) {
    if (!map.getLayer("countries-fill")) return;
    const prev = countryLayerHandlersRef.current;
    if (prev.click) map.off("click", "countries-fill", prev.click);
    if (prev.mouseenter) map.off("mouseenter", "countries-fill", prev.mouseenter);
    if (prev.mouseleave) map.off("mouseleave", "countries-fill", prev.mouseleave);
    const handler = (e: mapboxgl.MapMouseEvent) => {
      const features = map.queryRenderedFeatures(e.point, { layers: ["countries-fill"] });
      const f = features[0];
      if (!f?.properties) return;
      const iso3 = (f.properties as { ISO_A3?: string }).ISO_A3;
      if (!iso3) return;
      const nameJa =
        shareDataRef.current?.find((d) => d.country_code === iso3)?.country ??
        (f.properties as { NAME?: string }).NAME ??
        iso3;
      handleCountrySelectRef.current(iso3, nameJa);
    };
    const cursorEnter = () => { map.getCanvas().style.cursor = "pointer"; };
    const cursorLeave = () => { map.getCanvas().style.cursor = ""; };
    countryLayerHandlersRef.current = { click: handler, mouseenter: cursorEnter, mouseleave: cursorLeave };
    map.on("click", "countries-fill", handler);
    map.on("mouseenter", "countries-fill", cursorEnter);
    map.on("mouseleave", "countries-fill", cursorLeave);
  }

  // 日本中心のピクセル位置を同期（依存の中心オーバーレイ・弱いフェード用）
  useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || !map) return;
    const update = () => {
      const p = map.project(CENTER_JAPAN);
      setJapanPixel({ x: p.x, y: p.y });
    };
    update();
    map.on("move", update);
    return () => { map.off("move", update); };
  }, [mapReady]);

  // 選択国が変わったら地形をオフに
  useEffect(() => {
    if (!selectedCountry) {
      setShowTerrain(false);
      const map = mapRef.current;
      try {
        map?.setTerrain(null);
      } catch {
        // 地形未設定時は無視
      }
    }
  }, [selectedCountry?.code]);

  /** 地形を表示 / 非表示（選択国にズームして地形 ON、または地形 OFF） */
  const handleToggleTerrain = useCallback(() => {
    const map = mapRef.current;
    if (!map || !selectedCountry?.code || !countriesGeojson) return;
    if (showTerrain) {
      map.setTerrain(null);
      setShowTerrain(false);
      return;
    }
    if (!terrainSourceAddedRef.current) {
      try {
        if (!map.getSource("mapbox-dem")) {
          map.addSource("mapbox-dem", {
            type: "raster-dem",
            url: "mapbox://mapbox.mapbox-terrain-dem-v1",
            tileSize: 512,
            maxzoom: 14,
          });
        }
        terrainSourceAddedRef.current = true;
      } catch {
        return;
      }
    }
    map.setTerrain({ source: "mapbox-dem", exaggeration: 1.2 });
    const bounds = getCountryBounds(countriesGeojson, selectedCountry.code);
    if (bounds) {
      const [[west, south], [east, north]] = bounds;
      map.fitBounds(
        [
          [west, south],
          [east, north],
        ],
        { padding: 80, maxZoom: 12, duration: 600 }
      );
    }
    setShowTerrain(true);
  }, [selectedCountry?.code, countriesGeojson, showTerrain]);

  // 地形表示時: 選択中の資源に応じて選択国内の鉱山マーク・鉱山名を表示 / 非表示時に削除（世界地図UIでは鉱山を表示しない）
  useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || !map || !map.getSource("countries")) return;
    const showMines = false; // 世界地図UIでは鉱山・精錬拠点を表示しない
    if (showMines && selectedCountry) {
      const mines = getMinesByResourceAndCountry(id, selectedCountry.code);
      const features: GeoJSON.Feature<GeoJSON.Point, { name: string; label: string }>[] = mines.map(
        (m) => ({
          type: "Feature",
          geometry: { type: "Point", coordinates: m.coordinates },
          properties: { name: m.name, label: m.name },
        })
      );
      const geojson: GeoJSON.FeatureCollection<GeoJSON.Point, { name: string; label: string }> = {
        type: "FeatureCollection",
        features,
      };
      const markerColor = getChartItemFillColor(chart, id);
      const markerStroke = markerColor; // 枠は同じ色で濃くする場合は darken 可
      if (map.getSource("resource-mines")) {
        (map.getSource("resource-mines") as mapboxgl.GeoJSONSource).setData(geojson as GeoJSON.GeoJSON);
        if (map.getLayer("resource-mines-circles")) {
          map.setPaintProperty("resource-mines-circles", "circle-color", markerColor);
          map.setPaintProperty("resource-mines-circles", "circle-stroke-color", markerStroke);
        }
      } else {
        map.addSource("resource-mines", { type: "geojson", data: geojson as GeoJSON.GeoJSON });
        map.addLayer({
          id: "resource-mines-circles",
          type: "circle",
          source: "resource-mines",
          paint: {
            "circle-radius": 8,
            "circle-color": markerColor,
            "circle-stroke-width": 1.5,
            "circle-stroke-color": markerStroke,
          },
        });
        map.addLayer({
          id: "resource-mines-labels",
          type: "symbol",
          source: "resource-mines",
          layout: {
            "text-field": ["get", "label"],
            "text-size": 12,
            "text-anchor": "top",
            "text-offset": [0, 0.8],
            "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
            "text-max-width": 10,
          },
          paint: {
            "text-color": "#1f2937",
            "text-halo-color": "#ffffff",
            "text-halo-width": 2,
          },
        });
      }
    } else {
      if (map.getLayer("resource-mines-labels")) map.removeLayer("resource-mines-labels");
      if (map.getLayer("resource-mines-circles")) map.removeLayer("resource-mines-circles");
      if (map.getSource("resource-mines")) map.removeSource("resource-mines");
    }
    if (false) {
      // 世界地図UIでは精錬拠点を表示しない（showTerrain 時も非表示）
      const hubFeatures: GeoJSON.Feature<GeoJSON.Point, { name: string }>[] = REFINING_HUBS.map(
        (h) => ({
          type: "Feature",
          geometry: { type: "Point", coordinates: h.coordinates },
          properties: { name: h.name },
        })
      );
      const hubGeojson: GeoJSON.FeatureCollection<GeoJSON.Point, { name: string }> = {
        type: "FeatureCollection",
        features: hubFeatures,
      };
      if (map.getSource("refining-hubs")) {
        (map.getSource("refining-hubs") as mapboxgl.GeoJSONSource).setData(hubGeojson as GeoJSON.GeoJSON);
      } else {
        map.addSource("refining-hubs", { type: "geojson", data: hubGeojson as GeoJSON.GeoJSON });
        map.addLayer({
          id: "refining-hubs-circles",
          type: "circle",
          source: "refining-hubs",
          paint: {
            "circle-radius": 7,
            "circle-color": "#1f2937",
            "circle-stroke-width": 1.2,
            "circle-stroke-color": "#374151",
          },
        });
        map.addLayer({
          id: "refining-hubs-labels",
          type: "symbol",
          source: "refining-hubs",
          layout: {
            "text-field": ["get", "name"],
            "text-size": 11,
            "text-anchor": "top",
            "text-offset": [0, 0.7],
            "text-font": ["Open Sans Regular", "Arial Unicode MS Regular"],
          },
          paint: {
            "text-color": "#1f2937",
            "text-halo-color": "#ffffff",
            "text-halo-width": 1.5,
          },
        });
      }
    } else {
      if (map.getLayer("refining-hubs-labels")) map.removeLayer("refining-hubs-labels");
      if (map.getLayer("refining-hubs-circles")) map.removeLayer("refining-hubs-circles");
      if (map.getSource("refining-hubs")) map.removeSource("refining-hubs");
    }
  }, [mapReady, showTerrain, selectedCountry?.code, chart, id]);

  // 産出地: 世界地図UIでは鉱山・精錬拠点を表示しない（v1=代表鉱山のみだったが無効化）
  useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || !map || !map.getSource("countries")) return;
    const isMetalWithId = chart === "metalchart" && id;
    const showMines = false; // 世界地図UIでは鉱山を表示しない
    const showHubs = false; // 世界地図UIでは精錬拠点を表示しない

    if (isMetalWithId) {
      const allMines = getAllMinesForResource(id);
      const mines = PORTCHART_V1 ? allMines.slice(0, REPRESENTATIVE_MINES_MAX) : allMines;
      const mineFeatures: GeoJSON.Feature<GeoJSON.Point, { type: string; name: string }>[] = mines.map(
        (m) => ({
          type: "Feature",
          geometry: { type: "Point", coordinates: m.coordinates },
          properties: { type: "mine", name: m.name },
        })
      );
      const hubFeatures: GeoJSON.Feature<GeoJSON.Point, { type: string; name: string }>[] = PORTCHART_V1
        ? []
        : REFINING_HUBS.map((h) => ({
            type: "Feature",
            geometry: { type: "Point", coordinates: h.coordinates },
            properties: { type: "hub", name: h.name },
          }));
      const allFeatures = [...mineFeatures, ...hubFeatures];
      const geojson: GeoJSON.FeatureCollection<GeoJSON.Point, { type: string; name: string }> = {
        type: "FeatureCollection",
        features: allFeatures,
      };
      const accentColor = getChartItemFillColor(chart, id);
      const transition = (PORTCHART_V1 ? { duration: 0 } : { duration: 400 }) as any;

      if (map.getSource("production-locations-global")) {
        (map.getSource("production-locations-global") as mapboxgl.GeoJSONSource).setData(geojson as GeoJSON.GeoJSON);
        if (map.getLayer("production-locations-mines")) {
          map.setLayoutProperty("production-locations-mines", "visibility", showMines ? "visible" : "none");
          map.setPaintProperty("production-locations-mines", "circle-opacity", showMines ? 1 : 0, transition);
        }
        if (map.getLayer("production-locations-hubs")) {
          map.setLayoutProperty("production-locations-hubs", "visibility", showHubs ? "visible" : "none");
          map.setPaintProperty("production-locations-hubs", "circle-opacity", showHubs ? 1 : 0, transition);
        }
        if (map.getLayer("production-locations-global-labels")) {
          map.setLayoutProperty("production-locations-global-labels", "visibility", showMines ? "visible" : "none");
          map.setFilter(
            "production-locations-global-labels",
            animationStep >= 2 ? (["in", ["get", "type"], ["literal", ["mine", "hub"]]] as mapboxgl.FilterSpecification) : (["==", ["get", "type"], "mine"] as mapboxgl.FilterSpecification)
          );
        }
      } else {
        map.addSource("production-locations-global", { type: "geojson", data: geojson as GeoJSON.GeoJSON });
        map.addLayer({
          id: "production-locations-mines",
          type: "circle",
          source: "production-locations-global",
          filter: ["==", ["get", "type"], "mine"],
          layout: { visibility: showMines ? "visible" : "none" },
          paint: {
            "circle-radius": 7,
            "circle-color": accentColor,
            "circle-opacity": showMines ? 1 : 0,
            "circle-stroke-width": 1.2,
            "circle-stroke-color": accentColor,
          },
        });
        map.addLayer({
          id: "production-locations-hubs",
          type: "circle",
          source: "production-locations-global",
          filter: ["==", ["get", "type"], "hub"],
          layout: { visibility: showHubs ? "visible" : "none" },
          paint: {
            "circle-radius": 6,
            "circle-color": "#1f2937",
            "circle-opacity": showHubs ? 1 : 0,
            "circle-stroke-width": 1.2,
            "circle-stroke-color": "#374151",
          },
        });
        map.addLayer({
          id: "production-locations-global-labels",
          type: "symbol",
          source: "production-locations-global",
          filter: animationStep >= 2 ? (["in", ["get", "type"], ["literal", ["mine", "hub"]]] as mapboxgl.FilterSpecification) : (["==", ["get", "type"], "mine"] as mapboxgl.FilterSpecification),
          layout: {
            "text-field": ["get", "name"],
            "text-size": 11,
            "text-anchor": "top",
            "text-offset": [0, 0.65],
            "text-font": ["Open Sans Regular", "Arial Unicode MS Regular"],
            visibility: showMines ? "visible" : "none",
          },
          paint: {
            "text-color": "#1f2937",
            "text-halo-color": "#ffffff",
            "text-halo-width": 1.5,
          },
        });
      }
    } else {
      if (map.getLayer("production-locations-global-labels")) map.removeLayer("production-locations-global-labels");
      if (map.getLayer("production-locations-hubs")) map.removeLayer("production-locations-hubs");
      if (map.getLayer("production-locations-mines")) map.removeLayer("production-locations-mines");
      if (map.getSource("production-locations-global")) map.removeSource("production-locations-global");
    }
  }, [mapReady, showProductionLocations, chart, id, animationStep, type]);

  // 国選択時のラベル位置を同期（高緯度では下に表示）
  useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || !map || !countriesGeojson || !selectedCountry?.code) {
      setProductionLabelPixel(null);
      return;
    }
    const update = () => {
      const bounds = getCountryBounds(countriesGeojson, selectedCountry.code);
      if (!bounds) {
        setProductionLabelPixel(null);
        return;
      }
      const container = map.getContainer();
      const viewWidth = container.clientWidth ?? 600;
      const MARGIN_TOP = 56;
      const MARGIN_SIDE = 24;
      const [[west, south], [east, north]] = bounds;
      const centerLng = (west + east) / 2;
      const bottomCenter = map.project([centerLng, south]);
      const topCenter = map.project([centerLng, north]);
      const PADDING_ABOVE = 36;
      const PADDING_LABEL_BELOW = 8;
      // ラベルを国土の上に出すと画面上部で見切れる場合は国土の下に表示（カナダ・ロシア等の高緯度国）
      const labelYAbove = topCenter.y - PADDING_ABOVE;
      const placement: "above" | "below" = labelYAbove >= MARGIN_TOP ? "above" : "below";
      const labelY = placement === "above" ? labelYAbove : bottomCenter.y + PADDING_LABEL_BELOW;
      const labelX = Math.max(MARGIN_SIDE, Math.min(viewWidth - MARGIN_SIDE, topCenter.x));
      setProductionLabelPixel({ x: labelX, y: labelY, placement });
    };
    update();
    map.on("move", update);
    map.on("moveend", update);
    return () => {
      map.off("move", update);
      map.off("moveend", update);
    };
  }, [mapReady, countriesGeojson, selectedCountry?.code, type]);

  // 選択した国の国境を光らせる
  useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || !map || !countriesGeojson || !map.getSource("selected-country")) return;
    const source = map.getSource("selected-country") as mapboxgl.GeoJSONSource;
    if (!source) return;
    const feature = selectedCountry ? getCountryFeature(countriesGeojson, selectedCountry.code) : null;
    source.setData(
      feature ? { type: "FeatureCollection", features: [feature] } : { type: "FeatureCollection", features: [] }
    );
  }, [mapReady, countriesGeojson, selectedCountry?.code]);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-red-600">
          NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN が設定されていません。.env.local にトークンを追加してください。
        </p>
      </div>
    );
  }

  const resourceName =
    chart && id
      ? chart === "enechart"
        ? (ENECHART_DISPLAY_NAMES[id] ?? decodeURIComponent(id))
        : decodeURIComponent(id)
      : "";

  const barFillColor = chart && id ? getChartItemFillColor(chart, id) : ACCENT_NAVY;

  const productionLabelItemName =
    chart && id
      ? chart === "metalchart"
        ? getResourceById(id)?.name
        : chart === "agrichart"
          ? getCropById(id)?.name
          : chart === "enechart"
            ? (ENECHART_DISPLAY_NAMES[id] ?? decodeURIComponent(id))
            : decodeURIComponent(id)
      : "";
  const productionCountryShare =
    type === "production" && selectedCountry
      ? shareData.find((d) => d.country_code === selectedCountry.code)?.value
      : undefined;
  const importShareFromSelected =
    type === "import" && selectedCountry
      ? shareData.find((d) => d.country_code === selectedCountry.code)?.value
      : undefined;

  return (
    <div className="flex h-full w-full flex-col overflow-hidden" style={{ minHeight: "400px" }}>
      {/* 左上: タイトル（○○年 ○○の 輸入元/産出国割合）とナビ */}
      <div className="flex flex-shrink-0 flex-col gap-2 border-b border-slate-200 bg-white/95 px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          {chart && id ? (
            <p className="text-base font-bold text-slate-800 flex flex-wrap items-center gap-x-1.5 gap-y-1">
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="rounded border border-slate-200 bg-white px-2 py-1 text-base font-bold text-slate-800 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300"
                aria-label="表示年"
              >
                {[2020, 2021, 2022, 2023, 2024].map((y) => (
                  <option key={y} value={String(y)}>{y}</option>
                ))}
              </select>
              <span>年</span>
              <span>{productionLabelItemName}の</span>
              <span className="inline-flex rounded-md border border-slate-200 bg-slate-50 p-1" role="tablist" aria-label="割合モード">
                <button
                  type="button"
                  role="tab"
                  aria-selected={type === "import"}
                  onClick={() => setType("import")}
                  className={`rounded px-2.5 py-1 text-sm font-medium transition-colors ${
                    type === "import" ? "bg-white text-slate-800 shadow-sm" : "text-slate-600 hover:text-slate-800"
                  }`}
                >
                  輸入元割合
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={type === "production"}
                  onClick={() => setType("production")}
                  className={`rounded px-2.5 py-1 text-sm font-medium transition-colors ${
                    type === "production" ? "bg-white text-slate-800 shadow-sm" : "text-slate-600 hover:text-slate-800"
                  }`}
                >
                  産出国割合
                </button>
              </span>
            </p>
          ) : (
            <p className="text-base text-slate-600">MetalChart / AgriChart の詳細ページから「PortChart」でアクセスしてください</p>
          )}
            {chart && id && (
            <div className="flex flex-wrap items-center gap-3">
            {chart === "metalchart" && id === "gold" && goldSelfSufficiency != null && (
              <span className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900">
                日本における金の自給率: <strong>{goldSelfSufficiency}%</strong>
              </span>
            )}
            {chart === "metalchart" && !PORTCHART_V1 && (
              <>
                <button
                  type="button"
                  onClick={playAnimation}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-1"
                  title="鉱山→精錬拠点→日本への流れを順に表示"
                >
                  再生
                </button>
                <div
                  className={`flex items-center rounded-lg border text-sm font-medium transition-colors ${
                    showProductionLocations
                      ? "border-slate-300 bg-slate-200 text-slate-800"
                      : "border-slate-200 bg-white text-slate-600"
                  }`}
                >
                <button
                  type="button"
                  onClick={() => setShowProductionLocations((v) => !v)}
                  className="rounded-l-lg px-3 py-2 text-left hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-1"
                >
                  産出地表示
                </button>
                {showProductionLocations && (
                  <>
                    <span className="h-5 w-px shrink-0 bg-slate-300" aria-hidden />
                    <span className="flex items-center gap-3 py-2 pl-2 pr-3 text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <span
                          className="h-3 w-3 shrink-0 rounded-full border border-slate-300"
                          style={{ backgroundColor: barFillColor }}
                          aria-hidden
                        />
                        <span>鉱山</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span
                          className="h-3 w-3 shrink-0 rounded-full bg-[#1f2937]"
                          aria-hidden
                        />
                        <span>精錬・取引の拠点</span>
                      </span>
                    </span>
                  </>
                )}
              </div>
              </>
            )}
            {chart && id && shareDataTop5.length > 0 && PORTCHART_V1 && (
              <>
                <span className="text-sm text-slate-600">
                  濃＝割合高　薄＝割合低
                </span>
                {type === "import" && (
                  <span className="text-sm text-slate-600">
                    日本の主な輸入元: {shareDataTop5.map((d) => d.country).join("、")}
                  </span>
                )}
              </>
            )}
            </div>
          )}
        </div>
        <span className="flex gap-3 text-sm text-slate-500">
          <Link href="/metalchart" className="hover:underline">MetalChart</Link>
          <Link href="/agricchart" className="hover:underline">AgriChart</Link>
          <Link href="/" className="hover:underline">EneChart</Link>
        </span>
      </div>

      {/* 世界地図UI: 地図が主役・依存構造だけが浮かび上がる */}
      <div className="relative min-h-0 flex-1 overflow-hidden rounded-b-lg bg-slate-100 shadow-inner">
        <style dangerouslySetInnerHTML={{ __html: "@keyframes portchart-japan-pulse{0%,100%{opacity:.88}50%{opacity:.78}}" }} />
        {/* 地図キャンバス（全面） */}
        <div className="absolute inset-0">
          <div
            ref={containerRef}
            className="absolute inset-0 h-full w-full [&_.mapboxgl-canvas]:!min-h-[200px]"
          />
          {/* 日本＝依存の中心（半径を縮め・外側リングはさらに透明・演出に気づかない） */}
          {mapReady && japanPixel && !PORTCHART_V1 && (
            <div
              className="pointer-events-none absolute left-0 top-0 z-[1]"
              style={{ transform: `translate(${japanPixel.x}px,${japanPixel.y}px) translate(-50%,-50%)` }}
              aria-hidden
            >
              <div
                className="h-1 w-1 rounded-full bg-[#1e3a5f]"
                style={{ animation: "portchart-japan-pulse 1.2s ease-in-out infinite" }}
              />
              <div
                className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#1e3a5f] opacity-[0.05]"
                style={{ animation: "portchart-japan-pulse 1.2s ease-in-out infinite" }}
              />
            </div>
          )}
          {/* 産出国割合時: 国選択で国土の少し上に「国名 世界における○○の〇％を産出」 */}
          {mapReady &&
            type === "production" &&
            selectedCountry &&
            productionLabelPixel != null &&
            productionLabelItemName &&
            productionCountryShare != null && (
              <div
                className="absolute z-10 max-w-[90vw] rounded-lg border border-slate-200 bg-white/95 px-3 py-2 text-center shadow-sm"
                style={{
                  left: productionLabelPixel.x,
                  top: productionLabelPixel.y,
                  transform: productionLabelPixel.placement === "above" ? "translate(-50%, -100%)" : "translate(-50%, 0)",
                }}
              >
                <p className="text-sm font-medium text-slate-800">
                  {selectedCountry.nameJa}{" "}
                  <span className="text-slate-600">
                    世界における{productionLabelItemName}の{productionCountryShare}%を産出
                  </span>
                </p>
                {chart === "metalchart" &&
                  id &&
                  hasMineDataForResource(id) &&
                  getMinesByResourceAndCountry(id, selectedCountry.code).length === 0 && (
                    <p className="mt-1 text-xs text-slate-500">（この国には登録された鉱山はありません）</p>
                  )}
              </div>
            )}
          {/* 輸入元割合時: 国選択で国土の少し上に「日本は○○から〇％の○○を輸入」 */}
          {mapReady &&
            type === "import" &&
            selectedCountry &&
            productionLabelPixel != null &&
            productionLabelItemName &&
            importShareFromSelected != null && (
              <div
                className="absolute z-10 max-w-[90vw] rounded-lg border border-slate-200 bg-white/95 px-3 py-2 text-center shadow-sm"
                style={{
                  left: productionLabelPixel.x,
                  top: productionLabelPixel.y,
                  transform: productionLabelPixel.placement === "above" ? "translate(-50%, -100%)" : "translate(-50%, 0)",
                }}
              >
                <p className="text-sm font-medium text-slate-800">
                  <span className="text-slate-600">
                    日本は{selectedCountry.nameJa}から{importShareFromSelected}%の{productionLabelItemName}を輸入
                  </span>
                </p>
                {chart === "metalchart" &&
                  id &&
                  hasMineDataForResource(id) &&
                  getMinesByResourceAndCountry(id, selectedCountry.code).length === 0 && (
                    <p className="mt-1 text-xs text-slate-500">
                      {selectedCountry.code.toUpperCase() === "CHE"
                        ? "スイスには精錬・取引の拠点が存在するため、輸入元国の上位となっています。"
                        : "この国には登録された鉱山がありません（精錬・取引の拠点は鉱山として登録していません）"}
                    </p>
                  )}
              </div>
            )}
          {/* 選択国に鉱山が登録されていない場合（産出/輸入の割合データはあるが鉱山リストにはないとき） */}
          {mapReady &&
            selectedCountry &&
            productionLabelPixel != null &&
            chart === "metalchart" &&
            id &&
            hasMineDataForResource(id) &&
            getMinesByResourceAndCountry(id, selectedCountry.code).length === 0 &&
            !(type === "production" && productionCountryShare != null) &&
            !(type === "import" && importShareFromSelected != null) && (
              <div
                className="absolute z-10 max-w-[90vw] rounded-lg border border-slate-200 bg-white/95 px-3 py-2 text-center shadow-sm"
                style={{
                  left: productionLabelPixel.x,
                  top: productionLabelPixel.y,
                  transform: productionLabelPixel.placement === "above" ? "translate(-50%, -100%)" : "translate(-50%, 0)",
                }}
              >
                <p className="text-sm text-slate-600">
                  この国には登録された{productionLabelItemName}鉱山がありません
                  <span className="block mt-0.5 text-xs text-slate-500">（精錬・取引の拠点は鉱山として登録していません）</span>
                </p>
              </div>
            )}
        </div>

        {loading && (
          <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white/95 px-6 py-3 shadow-md">
            <p className="font-bold text-slate-700">読み込み中...</p>
          </div>
        )}
        {selectedCountry && (
          <div
            className={`absolute top-4 z-10 flex ${isAmericasCountry(selectedCountry.code) ? "right-4" : "left-4"}`}
          >
            <div className={`w-64 shrink-0 rounded-xl ${PANEL_BG} p-3 shadow`}>
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  {(() => {
                    const iso2 = getIso2FromIso3(selectedCountry.code);
                    return iso2 ? (
                      <img
                        src={`/flags/${iso2.toLowerCase()}.svg`}
                        alt=""
                        className="h-7 w-9 shrink-0 rounded border border-slate-200 object-contain"
                        loading="lazy"
                      />
                    ) : null;
                  })()}
                  <h3 className="text-[10px] font-bold uppercase tracking-wide text-slate-500">選択国</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCountry(null)}
                  className="shrink-0 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-300"
                  aria-label="選択を解除"
                >
                  <span className="text-lg leading-none">×</span>
                </button>
              </div>
              <dl className="space-y-1.5 text-xs">
                <div>
                  <dt className="text-slate-500">国名</dt>
                  <dd className="font-medium text-slate-800">{countryInfo?.nameJa ?? selectedCountry.nameJa}（{selectedCountry.code}）</dd>
                </div>
                <div>
                  <dt className="text-slate-500">地域</dt>
                  <dd className="text-slate-800">{countryInfo?.region ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">人口</dt>
                  <dd className="text-slate-800">
                    {countryInfoLoading ? "—" : countryInfo?.population != null ? formatPopulationJa(countryInfo.population) : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">GDP</dt>
                  <dd className="text-slate-800">{countryInfo?.gdp != null ? formatGdpJa(countryInfo.gdp) : "—"}</dd>
                </div>
              </dl>
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => setShowShareBreakdown((v) => !v)}
                  className={`w-full rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors ${
                    showShareBreakdown
                      ? "border-slate-300 bg-slate-200 text-slate-800"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {showShareBreakdown ? "輸出入割合を非表示" : "輸出入割合を表示"}
                </button>
              </div>
            </div>
            {showShareBreakdown && chart && (
              <div className={`ml-3 w-80 min-w-0 shrink-0 rounded-xl ${PANEL_BG} p-3 shadow`}>
                <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  {type === "import" ? "輸入" : "産出"}割合（品目別）
                </p>
                {shareBreakdownLoading ? (
                  <p className="py-4 text-center text-xs text-slate-500">読み込み中...</p>
                ) : shareBreakdownData && shareBreakdownData.length > 0 ? (
                  <div className="h-64 w-full min-w-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          {
                            name: type === "import" ? "輸入" : "産出",
                            ...Object.fromEntries(shareBreakdownData.map((d) => [d.itemId, d.value])),
                          },
                        ]}
                        layout="vertical"
                        margin={{ top: 4, right: 8, left: 4, bottom: 4 }}
                      >
                        <XAxis type="number" domain={[0, "dataMax"]} unit="%" tick={{ fontSize: 10 }} />
                        <YAxis type="category" dataKey="name" width={36} tick={{ fontSize: 10 }} />
                        {shareBreakdownData.map((d) => (
                          <Bar
                            key={d.itemId}
                            dataKey={d.itemId}
                            stackId="a"
                            fill={getChartItemFillColor(chart, d.itemId)}
                            name={d.itemName}
                            legendType="square"
                          />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="py-4 text-center text-xs text-slate-500">データがありません</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
