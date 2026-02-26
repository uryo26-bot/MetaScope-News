import { ProcessStepProps } from "../types/types";

export const processes: Record<string, ProcessStepProps[]> = {
  "天然ガス": [
    { icon: "⛏️", label: "採掘" },
    { icon: "🚢", label: "輸送" },
    { icon: "⚡", label: "発電" },
    { icon: "🔌", label: "送電" },
    { icon: "🏠", label: "消費" },
  ],
  "石炭": [
    { icon: "⛏️", label: "採掘" },
    { icon: "🚢", label: "輸送" },
    { icon: "⚡", label: "発電" },
    { icon: "🔌", label: "送電" },
    { icon: "🏠", label: "消費" },
  ],
  "太陽光": [
    { icon: "☀️", label: "発電" },
    { icon: "🔌", label: "送電" },
    { icon: "🏠", label: "消費" },
  ],
  "原子力": [
    { icon: "⚛️", label: "原始エネルギー"},
    { icon: "🏭", label: "原子炉"},
    { icon: "♨️", label: "タービン"},
  ],
  "水力": [
    { icon: "🏞", label: "ダム"},
    { icon: "💧", label: "落水"},
    { icon: "🔄", label: "水車"},
  ],
  "石油等":[
    { icon: "⛽", label: "採掘" },
    { icon: "🚢", label: "輸送" },
    { icon: "⚡", label: "発電" },
    { icon: "🔌", label: "送電" },
    { icon: "🏠", label: "消費" },
  ],
  "バイオマス":[
    { icon: "🌾", label: "収集" },
    { icon: "🔥", label: "燃焼" },
    { icon: "⚡", label: "発電" },
    { icon: "🔌", label: "送電" },
    { icon: "🏠", label: "消費" },
  ],
  "風力":[
    { icon: "🌬️", label: "風力" },
    { icon: "⚙️", label: "タービン" },
    { icon: "⚡", label: "発電" },
    { icon: "🔌", label: "送電" },
    { icon: "🏠", label: "消費" },
  ],
  "地熱":[
    { icon: "🌋", label: "熱源" },
    { icon: "💧", label: "蒸気" },
    { icon: "⚡", label: "発電" },
    { icon: "🔌", label: "送電" },
    { icon: "🏠", label: "消費" },
  ],
};