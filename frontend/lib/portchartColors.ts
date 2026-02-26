import type { ResourceCategory } from "../data/resources";
import type { CropCategory } from "../data/crops";
import type { EnergyType } from "../types/types";
import { resourceList } from "../data/resources";
import { cropList } from "../data/crops";
import { ENERGY_COLORS } from "../constants/energyDetails";

/** MetalChart カテゴリ別の地図塗りつぶし色（選択ボタン・カードのテーマに合わせた HEX） */
const resourceCategoryFill: Record<ResourceCategory, string> = {
  precious: "#f59e0b",   // amber-500（貴金属）
  base: "#0ea5e9",       // sky-500（ベースメタル）
  ferrous: "#71717a",    // zinc-500（鉄鋼・合金）
  battery: "#10b981",   // emerald-500（バッテリー）
  light: "#06b6d4",     // cyan-500（軽金属・特殊）
  strategic: "#8b5cf6", // violet-500（戦略物資）
  nuclear: "#f97316",   // orange-500（原子力）
};

/** AgriChart カテゴリ別の地図塗りつぶし色（選択ボタン・カードのテーマに合わせた HEX） */
const cropCategoryFill: Record<CropCategory, string> = {
  grain: "#f59e0b",     // amber-500（穀物）
  bean: "#84cc16",      // lime-500（豆類）
  fruit: "#f43f5e",     // rose-500（果実）
  vegetable: "#22c55e", // green-500（野菜）
  beverage: "#f59e0b",  // amber-500（飲料作物）
  sugar: "#eab308",     // yellow-500（糖料）
  fiber: "#78716c",     // stone-500（繊維）
  meat: "#ef4444",      // red-500（肉類）
  fish: "#0ea5e9",      // sky-500（魚類）
};

const DEFAULT_FILL = "#64748b";

const ENECHART_IDS: EnergyType[] = ["lng", "coal", "oil", "nuclear", "hydro", "wind", "geothermal", "biomass", "solar"];

/** HEX を白とブレンドしてパステル色（矢印用）を返す */
function hexToPastel(hex: string, blend = 0.6): string {
  const n = hex.replace(/^#/, "");
  if (n.length !== 6) return hex;
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  const wr = Math.round(r * (1 - blend) + 255 * blend);
  const wg = Math.round(g * (1 - blend) + 255 * blend);
  const wb = Math.round(b * (1 - blend) + 255 * blend);
  return `#${wr.toString(16).padStart(2, "0")}${wg.toString(16).padStart(2, "0")}${wb.toString(16).padStart(2, "0")}`;
}

/**
 * PortChart 地図上の該当国を塗りつぶす色を取得する。
 * MetalChart / AgriChart / EneChart の選択ボタン（カード）の色に合わせる。
 */
export function getChartItemFillColor(chart: string, id: string): string {
  if (chart === "metalchart") {
    const item = resourceList.find((r) => r.id === id);
    return item ? resourceCategoryFill[item.category] : DEFAULT_FILL;
  }
  if (chart === "agrichart") {
    const item = cropList.find((c) => c.id === id);
    return item ? cropCategoryFill[item.category] : DEFAULT_FILL;
  }
  if (chart === "enechart" && ENECHART_IDS.includes(id as EnergyType)) {
    return ENERGY_COLORS[id as EnergyType] ?? DEFAULT_FILL;
  }
  return DEFAULT_FILL;
}

/**
 * 流れ線（矢印）用のパステル色を取得する。
 * EneChart は該当電源の色、MetalChart/AgriChart は資源ボタンの色をパステル化したもの。
 */
export function getChartItemPastelColor(chart: string, id: string): string {
  return hexToPastel(getChartItemFillColor(chart, id));
}

/**
 * 流れ線用の視認性の高い色（白ブレンドを抑えてコントラストを確保）。
 */
export function getChartItemFlowLineColor(chart: string, id: string): string {
  return hexToPastel(getChartItemFillColor(chart, id), 0.35);
}
