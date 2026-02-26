/** 構造タグ（供給構造・市場特性を表す） */
export type StructureTag = { emoji: string; label: string };

export type Resource = {
  id: string;
  name: string;
  nameEn: string;
  chemicalFormula: string;
  products: string[];
  productionFlow: string[];
  supplyFlow: string[];
  priceHistory: { year: number; price: number }[];
  /** 価格の単位（例: "円/t", "円/oz"）。未指定時は "円/t" */
  priceUnit?: string;
  globalProductionShare: { country: string; value: number }[];
  japanImportShare: { country: string; value: number }[];
  /** 構造タグ（国際市場型・政治リスク等） */
  structureTags?: StructureTag[];
};
