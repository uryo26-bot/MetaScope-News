// 特徴表示用コンポーネント
export type FeatureItemProps = {
  label: string;
  icon: string;
  trend: string;
  color: string;
};

// プロセス表示用コンポーネント
export type ProcessStepProps = {
  icon: string;
  label: string;
  description?: string;
};

// 年度型（2010年度〜対応）
export type Year =
  | 2010 | 2011 | 2012 | 2013 | 2014 | 2015 | 2016 | 2017 | 2018 | 2019
  | 2020 | 2021 | 2022 | 2023 | 2024;

// 電源種類
export type EnergyType = 
  | "lng" // 天然ガス
  | "coal" // 石炭
  | "oil" // 石油
  | "nuclear" // 原子力
  | "hydro" // 水力
  | "wind" // 風力
  | "geothermal" // 地熱
  | "biomass" // バイオマス
  | "solar"; // 太陽光

// 評価指標
export type Metric = {
  value: string; // 例: "13.7円/kWh"
  score: number; // 1-5の星評価
  description: string; // 詳細説明
};

export type Metrics = {
  cost: Metric;
  stability: Metric;
  environmental: Metric;
};

// 輸入元
export type ImportSource = {
  country: string;
  countryCode: string;
  percentage: number;
  color: string;
  flag: string; // 国旗絵文字またはURL
};

// プロセスステップ
export type ProcessStepDetail = {
  name: string;
  icon: string;
  description: string;
};

// エネルギー詳細データ
export type EnergyDetail = {
  metrics: Metrics;
  importSources?: ImportSource[]; // 輸入がある電源のみ
  processSteps: ProcessStepDetail[];
};

// ENERGY_DETAILS型
export type EnergyDetailsMap = Record<EnergyType, EnergyDetail>;

export type Energy = {
  source: string;
  description: string;
  features: FeatureItemProps[];
  process: ProcessStepProps[];
};

export type EnergyPanelProps = {
  energy: Energy | undefined;
  importData: ImportData[];
  color?: string;
  onClose: () => void;
};

export type EnergyData = {
  energy: string;
  percentage: number;
  year: number;
  amount?: number; // 発電量（億kWh）
};

export type ImportData = {
  country: string;
  percentage: number;
  countryCode?: string;
  color?: string;
  flag?: string;
};

// 年度別統計
export type YearStats = {
  year: Year;
  consumption: number; // 消費電力（億kWh）
  generation: number; // 発電量（億kWh）
};
