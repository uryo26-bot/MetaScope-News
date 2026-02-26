// src/constants/energies.ts
import { Energy } from "../types/types";
import { processes } from "./processes";

export const energies: Energy[] = [
  {
    source: "天然ガス",
    description: "生物の死骸が分解され地中に生じたガス",
    features: [
      { label: "コスト", icon: "💰", trend: "ー", color: "bg-[#FFC107]" },
      { label: "供給安定度", icon: "🔄", trend: "ー", color: "bg-[#2563EB]" },
      { label: "環境負荷", icon: "🌱", trend: "ー", color: "bg-[#4CAF50]" },
    ],
    process: processes["天然ガス"],
  },
  {
    source: "石炭",
    description: "古代植物が堆積してできた燃料",
    features: [
      { label: "コスト", icon: "💰", trend: "〇", color: "bg-[#FFC107]" },
      { label: "供給安定度", icon: "🔄", trend: "〇", color: "bg-[#2563EB]" },
      { label: "環境負荷", icon: "🌱", trend: "✕", color: "bg-[#4CAF50]" },
    ],
    process: processes["石炭"],
  },
  {
    source: "太陽光",
    description: "太陽の光を利用した再生可能エネルギー",
    features: [
      { label: "コスト", icon: "💰", trend: "〇", color: "bg-[#FFC107]" },
      { label: "供給安定度", icon: "🔄", trend: "✕", color: "bg-[#2563EB]" },
      { label: "環境負荷", icon: "🌱", trend: "〇", color: "bg-[#4CAF50]" },
    ],
    process: processes["太陽光"],
  },
  {
    source: "原子力",
    description: "ウランなどの核燃料を利用した発電方式",
    features: [
      { label: "コスト", icon: "💰", trend: "ー", color: "bg-[#FFC107]" },
      { label: "供給安定度", icon: "🔄", trend: "〇", color: "bg-[#2563EB]" },
      { label: "環境負荷", icon: "🌱", trend: "ー", color: "bg-[#4CAF50]" },
    ],
    process: processes["原子力"],
  },
  {
    source: "水力",
    description: "水の流れを利用した再生可能エネルギー",
    features: [
      { label: "コスト", icon: "💰", trend: "〇", color: "bg-[#FFC107]" },
      { label: "供給安定度", icon: "🔄", trend: "〇", color: "bg-[#2563EB]" },
      { label: "環境負荷", icon: "🌱", trend: "〇", color: "bg-[#4CAF50]" },
    ],
    process: processes["水力"],
  },
  {
    source: "石油等",
    description: "地下資源として採掘される液体燃料",
    features: [
      { label: "コスト", icon: "💰", trend: "✕", color: "bg-[#FFC107]" },
      { label: "供給安定度", icon: "🔄", trend: "ー", color: "bg-[#2563EB]" },
      { label: "環境負荷", icon: "🌱", trend: "✕", color: "bg-[#4CAF50]" },
    ],
    process: processes["石油等"],
  },
  {
    source: "バイオマス",
    description: "動植物由来の有機物を燃料として利用する再生可能エネルギー",
    features: [
      { label: "コスト", icon: "💰", trend: "ー", color: "bg-[#FFC107]" },
      { label: "供給安定度", icon: "🔄", trend: "〇", color: "bg-[#2563EB]" },
      { label: "環境負荷", icon: "🌱", trend: "ー", color: "bg-[#4CAF50]" },
    ],
    process: processes["バイオマス"],
  },
  {
    source: "風力",
    description: "風の力を利用してタービンを回す再生可能エネルギー",
    features: [
      { label: "コスト", icon: "💰", trend: "〇", color: "bg-[#FFC107]" },
      { label: "供給安定度", icon: "🔄", trend: "ー", color: "bg-[#2563EB]" },
      { label: "環境負荷", icon: "🌱", trend: "〇", color: "bg-[#4CAF50]" },
    ],
    process: processes["風力"],
  },
  {
    source: "地熱",
    description: "地中の熱エネルギーを利用した再生可能エネルギー（熱源数に限りがある）",
    features: [
      { label: "コスト", icon: "💰", trend: "〇", color: "bg-[#FFC107]" },
      { label: "供給安定度", icon: "🔄", trend: "〇", color: "bg-[#2563EB]" },
      { label: "環境負荷", icon: "🌱", trend: "〇", color: "bg-[#4CAF50]" },
    ],
    process: processes["地熱"],
  },
];