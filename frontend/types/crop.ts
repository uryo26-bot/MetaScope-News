/** 構造タグ（供給構造・市場特性を表す） */
export type StructureTag = { emoji: string; label: string };

export type Crop = {
  id: string;
  name: string;
  nameEn: string;
  /** 表示用の副題（例: 分類名） */
  subtitle?: string;
  products: string[];
  /** 生育・栽培過程（自然の営み） */
  productionFlow: string[];
  /** 供給過程（収穫から消費者まで） */
  supplyFlow: string[];
  priceHistory: { year: number; price: number }[];
  priceUnit?: string;
  globalProductionShare: { country: string; value: number }[];
  japanImportShare: { country: string; value: number }[];
  /** 構造タグ（気候依存型・国内生産中心等） */
  structureTags?: StructureTag[];
};
