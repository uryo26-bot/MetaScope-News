import { EnergyDetailsMap, EnergyType } from "../types/types";

// 電源名のマッピング
export const ENERGY_NAMES: Record<EnergyType, string> = {
  lng: "天然ガス",
  coal: "石炭",
  oil: "石油",
  nuclear: "原子力",
  hydro: "水力",
  wind: "風力",
  geothermal: "地熱",
  biomass: "バイオマス",
  solar: "太陽光",
};

// 電源の色（視認性を考慮してやや濃いめに）
export const ENERGY_COLORS: Record<EnergyType, string> = {
  lng: "#2563eb", // blue-600
  coal: "#374151", // gray-700
  oil: "#4f46e5", // indigo-600
  nuclear: "#4ade80", // green-400
  hydro: "#1d4ed8", // blue-700
  wind: "#22c55e", // green-500
  geothermal: "#dc2626", // red-600
  biomass: "#84cc16", // lime-500
  solar: "#ea580c", // orange-600
};

// ENERGY_DETAILSデータ
export const ENERGY_DETAILS: EnergyDetailsMap = {
  lng: {
    metrics: {
      cost: {
        value: "13.7円/kWh",
        score: 3,
        description: "天然ガスの発電コストは中程度です。LNG（液化天然ガス）の輸送・貯蔵コストが含まれます。",
      },
      stability: {
        value: "中",
        score: 3,
        description: "供給安定性は中程度です。輸入に依存するため、国際情勢の影響を受けます。",
      },
      environmental: {
        value: "418g-CO2/kWh",
        score: 3,
        description: "石炭や石油と比べてCO2排出量は少ないですが、再生可能エネルギーよりは多いです。",
      },
    },
    importSources: [
      { country: "オーストラリア", countryCode: "AU", percentage: 40, color: "#3b82f6", flag: "🇦🇺" },
      { country: "マレーシア", countryCode: "MY", percentage: 25, color: "#60a5fa", flag: "🇲🇾" },
      { country: "カタール", countryCode: "QA", percentage: 15, color: "#93c5fd", flag: "🇶🇦" },
      { country: "ロシア", countryCode: "RU", percentage: 10, color: "#bfdbfe", flag: "🇷🇺" },
      { country: "その他", countryCode: "OTHER", percentage: 10, color: "#dbeafe", flag: "🌍" },
    ],
    processSteps: [
      {
        name: "採掘",
        icon: "⛏️",
        description: "地中から天然ガスを採掘します。主に海外のガス田で行われます。",
      },
      {
        name: "輸送",
        icon: "🚢",
        description: "LNG（液化天然ガス）として専用タンカーで輸送されます。冷却して体積を1/600に縮小します。",
      },
      {
        name: "貯蔵",
        icon: "🏭",
        description: "LNGタンクに貯蔵されます。二重構造の特殊なタンクで極低温を保ちます。",
      },
      {
        name: "発電",
        icon: "⚡",
        description: "ガス化して燃焼させ、タービンを回して発電します。効率的なコンバインドサイクル方式が使われます。",
      },
      {
        name: "送電",
        icon: "🔌",
        description: "発電した電気は送電網を通じて各家庭や工場に送られます。",
      },
    ],
  },
  coal: {
    metrics: {
      cost: {
        value: "12.3円/kWh",
        score: 4,
        description: "石炭は比較的安価な発電燃料です。大量輸送によりコストが抑えられます。",
      },
      stability: {
        value: "高",
        score: 4,
        description: "供給安定性は高いです。多くの国から輸入でき、備蓄も容易です。",
      },
      environmental: {
        value: "820g-CO2/kWh",
        score: 1,
        description: "CO2排出量が最も多い電源です。気候変動への影響が大きいです。",
      },
    },
    importSources: [
      { country: "オーストラリア", countryCode: "AU", percentage: 70, color: "#424242", flag: "🇦🇺" },
      { country: "インドネシア", countryCode: "ID", percentage: 15, color: "#616161", flag: "🇮🇩" },
      { country: "ロシア", countryCode: "RU", percentage: 10, color: "#757575", flag: "🇷🇺" },
      { country: "その他", countryCode: "OTHER", percentage: 5, color: "#9e9e9e", flag: "🌍" },
    ],
    processSteps: [
      {
        name: "採掘",
        icon: "⛏️",
        description: "露天掘りや坑内掘りで石炭を採掘します。",
      },
      {
        name: "輸送",
        icon: "🚢",
        description: "専用の石炭運搬船で輸送されます。",
      },
      {
        name: "貯蔵",
        icon: "🏭",
        description: "発電所の石炭ヤードに貯蔵されます。",
      },
      {
        name: "発電",
        icon: "⚡",
        description: "石炭を燃焼させてボイラーで蒸気を作り、タービンを回して発電します。",
      },
      {
        name: "送電",
        icon: "🔌",
        description: "発電した電気は送電網を通じて各家庭や工場に送られます。",
      },
    ],
  },
  oil: {
    metrics: {
      cost: {
        value: "22.5円/kWh",
        score: 2,
        description: "石油は高価な発電燃料です。価格変動も大きいです。",
      },
      stability: {
        value: "低",
        score: 2,
        description: "供給安定性は低めです。国際情勢の影響を大きく受けます。",
      },
      environmental: {
        value: "742g-CO2/kWh",
        score: 2,
        description: "CO2排出量が多く、環境負荷が高いです。",
      },
    },
    importSources: [
      { country: "サウジアラビア", countryCode: "SA", percentage: 35, color: "#5c6bc0", flag: "🇸🇦" },
      { country: "アラブ首長国連邦", countryCode: "AE", percentage: 25, color: "#7986cb", flag: "🇦🇪" },
      { country: "クウェート", countryCode: "KW", percentage: 15, color: "#9fa8da", flag: "🇰🇼" },
      { country: "その他", countryCode: "OTHER", percentage: 25, color: "#c5cae9", flag: "🌍" },
    ],
    processSteps: [
      {
        name: "採掘",
        icon: "⛽",
        description: "油田から原油を採掘します。",
      },
      {
        name: "輸送",
        icon: "🚢",
        description: "タンカーで輸送されます。",
      },
      {
        name: "貯蔵",
        icon: "🏭",
        description: "石油タンクに貯蔵されます。",
      },
      {
        name: "発電",
        icon: "⚡",
        description: "重油を燃焼させてタービンを回して発電します。",
      },
      {
        name: "送電",
        icon: "🔌",
        description: "発電した電気は送電網を通じて各家庭や工場に送られます。",
      },
    ],
  },
  nuclear: {
    metrics: {
      cost: {
        value: "10.1円/kWh",
        score: 4,
        description: "原子力は発電コストが比較的低いです。ただし、建設費や廃炉費用が含まれます。",
      },
      stability: {
        value: "高",
        score: 5,
        description: "供給安定性は非常に高いです。燃料は少量で長期間発電できます。",
      },
      environmental: {
        value: "22g-CO2/kWh",
        score: 5,
        description: "発電時のCO2排出量は非常に少ないです。ただし、放射性廃棄物の処理が課題です。",
      },
    },
    processSteps: [
      {
        name: "採掘",
        icon: "⛏️",
        description: "ウラン鉱石を採掘します。",
      },
      {
        name: "輸送",
        icon: "🚢",
        description: "濃縮ウランとして輸送されます。",
      },
      {
        name: "貯蔵",
        icon: "🏭",
        description: "原子炉に装荷されます。",
      },
      {
        name: "発電",
        icon: "⚡",
        description: "核分裂反応で熱を発生させ、蒸気タービンを回して発電します。",
      },
      {
        name: "送電",
        icon: "🔌",
        description: "発電した電気は送電網を通じて各家庭や工場に送られます。",
      },
    ],
  },
  hydro: {
    metrics: {
      cost: {
        value: "8.5円/kWh",
        score: 5,
        description: "水力は発電コストが低いです。ダム建設費は初期投資が大きいですが、運転費は低いです。",
      },
      stability: {
        value: "高",
        score: 5,
        description: "供給安定性は非常に高いです。水の流れは安定しており、調整も容易です。",
      },
      environmental: {
        value: "11g-CO2/kWh",
        score: 5,
        description: "CO2排出量は非常に少ないです。ただし、ダム建設による環境影響があります。",
      },
    },
    processSteps: [
      {
        name: "採掘",
        icon: "🏞️",
        description: "ダムに水を貯めます。",
      },
      {
        name: "輸送",
        icon: "💧",
        description: "水を導水路で送ります。",
      },
      {
        name: "貯蔵",
        icon: "🏭",
        description: "ダムに水を貯蔵します。",
      },
      {
        name: "発電",
        icon: "⚡",
        description: "落水の力で水車を回し、発電機を動かして発電します。",
      },
      {
        name: "送電",
        icon: "🔌",
        description: "発電した電気は送電網を通じて各家庭や工場に送られます。",
      },
    ],
  },
  wind: {
    metrics: {
      cost: {
        value: "21.6円/kWh",
        score: 2,
        description: "風力は発電コストが比較的高いです。ただし、技術の進歩によりコストは下がっています。",
      },
      stability: {
        value: "低",
        score: 2,
        description: "供給安定性は低めです。風の強さに依存するため、変動が大きいです。",
      },
      environmental: {
        value: "26g-CO2/kWh",
        score: 5,
        description: "CO2排出量は非常に少ないです。発電時にはCO2を排出しません。",
      },
    },
    processSteps: [
      {
        name: "採掘",
        icon: "🌬️",
        description: "風の力を利用します。",
      },
      {
        name: "輸送",
        icon: "⚙️",
        description: "風がタービンに当たります。",
      },
      {
        name: "貯蔵",
        icon: "🏭",
        description: "（貯蔵は不要）",
      },
      {
        name: "発電",
        icon: "⚡",
        description: "風力でタービンを回し、発電機を動かして発電します。",
      },
      {
        name: "送電",
        icon: "🔌",
        description: "発電した電気は送電網を通じて各家庭や工場に送られます。",
      },
    ],
  },
  geothermal: {
    metrics: {
      cost: {
        value: "16.2円/kWh",
        score: 3,
        description: "地熱は発電コストは中程度です。探査や掘削にコストがかかります。",
      },
      stability: {
        value: "高",
        score: 5,
        description: "供給安定性は非常に高いです。24時間365日安定して発電できます。",
      },
      environmental: {
        value: "15g-CO2/kWh",
        score: 5,
        description: "CO2排出量は非常に少ないです。ただし、温泉への影響に注意が必要です。",
      },
    },
    processSteps: [
      {
        name: "採掘",
        icon: "🌋",
        description: "地中の熱源を利用します。",
      },
      {
        name: "輸送",
        icon: "💧",
        description: "蒸気や熱水を地上に導きます。",
      },
      {
        name: "貯蔵",
        icon: "🏭",
        description: "（貯蔵は不要）",
      },
      {
        name: "発電",
        icon: "⚡",
        description: "蒸気でタービンを回し、発電機を動かして発電します。",
      },
      {
        name: "送電",
        icon: "🔌",
        description: "発電した電気は送電網を通じて各家庭や工場に送られます。",
      },
    ],
  },
  biomass: {
    metrics: {
      cost: {
        value: "24.8円/kWh",
        score: 2,
        description: "バイオマスは発電コストが高いです。燃料の調達コストが大きいです。",
      },
      stability: {
        value: "中",
        score: 3,
        description: "供給安定性は中程度です。燃料の調達が安定していれば発電できます。",
      },
      environmental: {
        value: "33g-CO2/kWh",
        score: 4,
        description: "CO2排出量は少ないです。植物が成長時にCO2を吸収するため、カーボンニュートラルとされます。",
      },
    },
    processSteps: [
      {
        name: "採掘",
        icon: "🌾",
        description: "木材や農業廃棄物などのバイオマス資源を収集します。",
      },
      {
        name: "輸送",
        icon: "🚢",
        description: "バイオマスを発電所に輸送します。",
      },
      {
        name: "貯蔵",
        icon: "🏭",
        description: "バイオマスを貯蔵します。",
      },
      {
        name: "発電",
        icon: "⚡",
        description: "バイオマスを燃焼させてタービンを回し、発電します。",
      },
      {
        name: "送電",
        icon: "🔌",
        description: "発電した電気は送電網を通じて各家庭や工場に送られます。",
      },
    ],
  },
  solar: {
    metrics: {
      cost: {
        value: "12.5円/kWh",
        score: 4,
        description: "太陽光発電のコストは年々下がっています。設備価格の低下と効率向上により、再生可能エネルギーの中でも競争力が高まっています。",
      },
      stability: {
        value: "低",
        score: 2,
        description: "供給安定性は天候に依存します。夜間は発電できず、曇りや雨の日は発電量が減ります。",
      },
      environmental: {
        value: "26g-CO2/kWh",
        score: 5,
        description: "発電時のCO2排出量は非常に少ないです。太陽光は再生可能エネルギーの代表的な電源です。",
      },
    },
    processSteps: [
      {
        name: "日照",
        icon: "☀️",
        description: "太陽の光が地上に届きます。日本では地域や季節によって日照時間が異なります。",
      },
      {
        name: "太陽光パネル",
        icon: "🔲",
        description: "太陽電池パネルが光を電気に変換します。半導体の性質を利用しています。",
      },
      {
        name: "発電",
        icon: "⚡",
        description: "直流の電気がパワーコンディショナで交流に変換され、発電量として計測されます。",
      },
      {
        name: "送電",
        icon: "🔌",
        description: "発電した電気は送電網を通じて各家庭や工場に送られます。",
      },
    ],
  },
};

// 年度別統計データ（2010年度〜。消費電力・発電量は概算）
export const YEAR_STATS: Record<number, { consumption: number; generation: number }> = {
  2024: { consumption: 9200, generation: 10500 },
  2023: { consumption: 9100, generation: 10300 },
  2022: { consumption: 9000, generation: 10200 },
  2021: { consumption: 8900, generation: 10100 },
  2020: { consumption: 8800, generation: 10000 },
  2019: { consumption: 9200, generation: 10400 },
  2018: { consumption: 9100, generation: 10300 },
  2017: { consumption: 9000, generation: 10200 },
  2016: { consumption: 8900, generation: 10100 },
  2015: { consumption: 8800, generation: 10000 },
  2014: { consumption: 8700, generation: 9900 },
  2013: { consumption: 9000, generation: 10200 },
  2012: { consumption: 8900, generation: 10100 },
  2011: { consumption: 8800, generation: 10000 },
  2010: { consumption: 9000, generation: 10200 },
};
