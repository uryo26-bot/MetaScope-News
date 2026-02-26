import type { Resource, StructureTag } from "../types/resource";

/** 各鉱物の詳細データ（製品・フロー・価格・産出・輸入シェア） */

export const goldResource: Resource = {
  id: "gold",
  name: "金",
  nameEn: "Gold",
  chemicalFormula: "Au",
  products: ["宝飾品", "電子部品", "中央銀行準備", "歯科材料", "メダル・賞牌"],
  productionFlow: ["宇宙での元素合成（超新星等）", "マグマへの取り込み", "熱水による運搬・濃集", "地殻の裂隙への沈殿（鉱脈形成）"],
  supplyFlow: ["鉱山採掘", "選鉱・精錬", "輸送", "加工・製品化"],
  priceHistory: [
    { year: 2019, price: 167000 },
    { year: 2020, price: 203000 },
    { year: 2021, price: 198000 },
    { year: 2022, price: 228000 },
    { year: 2023, price: 273000 },
    { year: 2024, price: 353000 },
  ],
  priceUnit: "円/oz",
  globalProductionShare: [
    { country: "中国", value: 11 },
    { country: "オーストラリア", value: 10 },
    { country: "ロシア", value: 9 },
    { country: "カナダ", value: 5 },
    { country: "アメリカ", value: 5 },
  ],
  japanImportShare: [
    { country: "スイス", value: 28 },
    { country: "オーストラリア", value: 18 },
    { country: "カナダ", value: 12 },
    { country: "南アフリカ", value: 10 },
    { country: "ペルー", value: 8 },
  ],
  structureTags: [
    { emoji: "🌍", label: "国際市場型" },
    { emoji: "🏦", label: "投資需要依存" },
    { emoji: "⚠", label: "政治リスク影響" },
  ],
};

export const silverResource: Resource = {
  id: "silver",
  name: "銀",
  nameEn: "Silver",
  chemicalFormula: "Ag",
  products: ["電子部品", "宝飾品", "太陽光パネル", "医療・抗菌", "写真・映像"],
  productionFlow: ["火山活動・熱水活動", "熱水溶液による金属の運搬", "裂隙・孔隙への沈殿", "銅・鉛・亜鉛鉱床との共生"],
  supplyFlow: ["鉱山採掘", "選鉱・精錬", "輸送", "加工・製品化"],
  priceHistory: [
    { year: 2019, price: 1980 },
    { year: 2020, price: 2570 },
    { year: 2021, price: 2750 },
    { year: 2022, price: 2860 },
    { year: 2023, price: 3360 },
    { year: 2024, price: 4200 },
  ],
  priceUnit: "円/oz",
  globalProductionShare: [
    { country: "メキシコ", value: 23 },
    { country: "中国", value: 14 },
    { country: "ペルー", value: 13 },
    { country: "チリ", value: 6 },
    { country: "オーストラリア", value: 5 },
  ],
  japanImportShare: [
    { country: "メキシコ", value: 22 },
    { country: "チリ", value: 18 },
    { country: "オーストラリア", value: 14 },
    { country: "ペルー", value: 12 },
    { country: "ボリビア", value: 8 },
  ],
  structureTags: [
    { emoji: "🌍", label: "国際市場型" },
    { emoji: "⚡", label: "工業需要連動" },
  ],
};

export const copperResource: Resource = {
  id: "copper",
  name: "銅",
  nameEn: "Copper",
  chemicalFormula: "Cu",
  products: ["スマートフォン", "EV（電気自動車）", "送電線", "家電製品", "建築資材"],
  productionFlow: ["マグマの貫入・斑岩の形成", "熱水による銅の溶脱・運搬", "斑岩体周辺への沈殿（斑岩銅鉱床）", "堆積岩中の層状鉱床（SEDEX型）の形成"],
  supplyFlow: ["鉱山採掘", "選鉱・精錬", "輸送", "加工・製品化"],
  priceHistory: [
    { year: 2019, price: 660000 },
    { year: 2020, price: 621000 },
    { year: 2021, price: 1023000 },
    { year: 2022, price: 1144000 },
    { year: 2023, price: 1176000 },
    { year: 2024, price: 1380000 },
  ],
  priceUnit: "円/t",
  globalProductionShare: [
    { country: "チリ", value: 28 },
    { country: "ペルー", value: 12 },
    { country: "中国", value: 8 },
    { country: "コンゴ", value: 6 },
    { country: "アメリカ", value: 6 },
  ],
  japanImportShare: [
    { country: "チリ", value: 38 },
    { country: "ペルー", value: 15 },
    { country: "オーストラリア", value: 12 },
    { country: "インドネシア", value: 10 },
    { country: "カナダ", value: 8 },
  ],
  structureTags: [
    { emoji: "🌍", label: "国際市場型" },
    { emoji: "⚡", label: "EV・脱炭素需要" },
    { emoji: "⚠", label: "産地集中リスク" },
  ],
};

export const aluminumResource: Resource = {
  id: "aluminum",
  name: "アルミニウム",
  nameEn: "Aluminum",
  chemicalFormula: "Al",
  products: ["建材・窓枠", "飲料缶・包装", "自動車部品", "航空機", "送電線"],
  productionFlow: ["火山岩・珪酸塩岩の風化", "熱帯・亜熱帯での長期的な雨水による溶脱", "アルミナの残留・濃集（ラテライト化）", "ボーキサイト鉱床の形成"],
  supplyFlow: ["鉱山採掘", "選鉱・精錬", "輸送", "加工・製品化"],
  priceHistory: [
    { year: 2019, price: 197000 },
    { year: 2020, price: 182000 },
    { year: 2021, price: 273000 },
    { year: 2022, price: 309000 },
    { year: 2023, price: 314000 },
    { year: 2024, price: 383000 },
  ],
  priceUnit: "円/t",
  globalProductionShare: [
    { country: "中国", value: 57 },
    { country: "インド", value: 6 },
    { country: "ロシア", value: 5 },
    { country: "カナダ", value: 4 },
    { country: "UAE", value: 4 },
  ],
  japanImportShare: [
    { country: "オーストラリア", value: 24 },
    { country: "マレーシア", value: 18 },
    { country: "インドネシア", value: 14 },
    { country: "ロシア", value: 12 },
    { country: "中国", value: 8 },
  ],
  structureTags: [
    { emoji: "🌍", label: "国際市場型" },
    { emoji: "⚡", label: "電力多消費" },
    { emoji: "⚠", label: "産地集中リスク" },
  ],
};

export const ironResource: Resource = {
  id: "iron",
  name: "鉄",
  nameEn: "Iron",
  chemicalFormula: "Fe",
  products: ["鉄鋼・建設資材", "自動車", "造船", "機械・産業設備", "鉄道"],
  productionFlow: ["海底の熱水噴出・鉄分の供給", "海水中での化学的沈殿（酸化鉄）", "縞状鉄鉱層（BIF）の堆積", "地殻変動による陸上への隆起"],
  supplyFlow: ["鉱山採掘", "製錬", "輸送", "加工・製品化"],
  priceHistory: [
    { year: 2019, price: 10500 },
    { year: 2020, price: 11800 },
    { year: 2021, price: 17600 },
    { year: 2022, price: 15000 },
    { year: 2023, price: 16800 },
    { year: 2024, price: 15800 },
  ],
  priceUnit: "円/t",
  globalProductionShare: [
    { country: "オーストラリア", value: 38 },
    { country: "ブラジル", value: 18 },
    { country: "中国", value: 11 },
    { country: "インド", value: 5 },
    { country: "ロシア", value: 4 },
  ],
  japanImportShare: [
    { country: "オーストラリア", value: 62 },
    { country: "ブラジル", value: 22 },
    { country: "南アフリカ", value: 5 },
    { country: "カナダ", value: 4 },
    { country: "インド", value: 3 },
  ],
  structureTags: [
    { emoji: "🌍", label: "国際市場型" },
    { emoji: "📦", label: "大口・長期契約" },
  ],
};

export const nickelResource: Resource = {
  id: "nickel",
  name: "ニッケル",
  nameEn: "Nickel",
  chemicalFormula: "Ni",
  products: ["ステンレス鋼", "EV用電池", "合金・コイン", "めっき", "航空エンジン"],
  productionFlow: ["マントル由来のマグマの上昇", "超塩基性岩の貫入・冷却", "ラテライト風化によるニッケル濃集", "硫化鉱物としての晶出・鉱床形成"],
  supplyFlow: ["鉱山採掘", "選鉱・精錬", "輸送", "加工・製品化"],
  priceHistory: [
    { year: 2019, price: 1520000 },
    { year: 2020, price: 1410000 },
    { year: 2021, price: 2040000 },
    { year: 2022, price: 3380000 },
    { year: 2023, price: 3010000 },
    { year: 2024, price: 2520000 },
  ],
  priceUnit: "円/t",
  globalProductionShare: [
    { country: "インドネシア", value: 48 },
    { country: "フィリピン", value: 11 },
    { country: "ロシア", value: 6 },
    { country: "ニューカレドニア", value: 6 },
    { country: "オーストラリア", value: 5 },
  ],
  japanImportShare: [
    { country: "インドネシア", value: 42 },
    { country: "フィリピン", value: 18 },
    { country: "ニューカレドニア", value: 12 },
    { country: "オーストラリア", value: 10 },
    { country: "カナダ", value: 6 },
  ],
  structureTags: [
    { emoji: "⚡", label: "EV・電池需要" },
    { emoji: "⚠", label: "産地集中リスク" },
  ],
};

export const lithiumResource: Resource = {
  id: "lithium",
  name: "リチウム",
  nameEn: "Lithium",
  chemicalFormula: "Li",
  products: ["リチウムイオン電池", "EV", "スマートフォン", "蓄電池", "医薬品"],
  productionFlow: ["花崗岩質マグマの貫入", "ペグマタイト中のリチウム鉱物の晶出", "火山地帯の温泉・地下水による溶脱", "閉鎖性盆地（塩湖）への流入・蒸発濃集"],
  supplyFlow: ["鉱山・塩湖採掘", "濃縮・精製", "輸送", "加工・電池材料化"],
  priceHistory: [
    { year: 2019, price: 1320000 },
    { year: 2020, price: 663000 },
    { year: 2021, price: 1980000 },
    { year: 2022, price: 7540000 },
    { year: 2023, price: 3080000 },
    { year: 2024, price: 2180000 },
  ],
  priceUnit: "円/t",
  globalProductionShare: [
    { country: "オーストラリア", value: 47 },
    { country: "チリ", value: 30 },
    { country: "中国", value: 15 },
    { country: "アルゼンチン", value: 5 },
    { country: "ジンバブエ", value: 1 },
  ],
  japanImportShare: [
    { country: "チリ", value: 58 },
    { country: "オーストラリア", value: 28 },
    { country: "アルゼンチン", value: 6 },
    { country: "中国", value: 4 },
    { country: "その他", value: 4 },
  ],
  structureTags: [
    { emoji: "⚡", label: "EV・電池需要" },
    { emoji: "🌍", label: "国際市場型" },
    { emoji: "📈", label: "価格変動大" },
  ],
};

export const cobaltResource: Resource = {
  id: "cobalt",
  name: "コバルト",
  nameEn: "Cobalt",
  chemicalFormula: "Co",
  products: ["EV用電池", "スマートフォン電池", "合金・超硬工具", "触媒", "磁性材料"],
  productionFlow: ["マントル・マグマ中のコバルトの濃集", "超塩基性岩・硫化鉱床の形成", "熱水による再分配・沈殿", "銅・ニッケル鉱床との共生"],
  supplyFlow: ["鉱山採掘", "選鉱・精錬", "輸送", "加工・電池材料化"],
  priceHistory: [
    { year: 2019, price: 3520000 },
    { year: 2020, price: 3530000 },
    { year: 2021, price: 5720000 },
    { year: 2022, price: 7150000 },
    { year: 2023, price: 4620000 },
    { year: 2024, price: 4200000 },
  ],
  priceUnit: "円/t",
  globalProductionShare: [
    { country: "コンゴ", value: 73 },
    { country: "インドネシア", value: 5 },
    { country: "ロシア", value: 4 },
    { country: "オーストラリア", value: 3 },
    { country: "カナダ", value: 3 },
  ],
  japanImportShare: [
    { country: "フィンランド", value: 28 },
    { country: "コンゴ", value: 22 },
    { country: "中国", value: 18 },
    { country: "カナダ", value: 12 },
    { country: "ベルギー", value: 8 },
  ],
  structureTags: [
    { emoji: "⚠", label: "政治リスク影響" },
    { emoji: "⚡", label: "EV・電池需要" },
  ],
};

export const zincResource: Resource = {
  id: "zinc",
  name: "亜鉛",
  nameEn: "Zinc",
  chemicalFormula: "Zn",
  products: ["亜鉛めっき鋼板", "黄銅", "乾電池", "医薬・サプリ", "ダイカスト"],
  productionFlow: ["海底熱水活動・金属の供給", "堆積盆地への硫化鉱物の沈殿（SEDEX型）", "石灰岩中の交代鉱床（スカルン型）の形成", "火山岩中の熱水鉱脈の形成"],
  supplyFlow: ["鉱山採掘", "選鉱・精錬", "輸送", "加工・製品化"],
  priceHistory: [
    { year: 2019, price: 277000 },
    { year: 2020, price: 244000 },
    { year: 2021, price: 328000 },
    { year: 2022, price: 465000 },
    { year: 2023, price: 347000 },
    { year: 2024, price: 398000 },
  ],
  priceUnit: "円/t",
  globalProductionShare: [
    { country: "中国", value: 35 },
    { country: "ペルー", value: 12 },
    { country: "オーストラリア", value: 10 },
    { country: "インド", value: 8 },
    { country: "アメリカ", value: 6 },
  ],
  japanImportShare: [
    { country: "オーストラリア", value: 28 },
    { country: "ペルー", value: 22 },
    { country: "ボリビア", value: 14 },
    { country: "スペイン", value: 10 },
    { country: "カザフスタン", value: 8 },
  ],
  structureTags: [
    { emoji: "🌍", label: "国際市場型" },
    { emoji: "⚡", label: "工業需要連動" },
  ],
};

export const leadResource: Resource = {
  id: "lead",
  name: "鉛",
  nameEn: "Lead",
  chemicalFormula: "Pb",
  products: ["車載バッテリー", "放射線遮蔽", "はんだ", "建材・配管", "弾丸"],
  productionFlow: ["熱水による鉛・亜鉛の運搬", "堆積岩中の層状鉱床（SEDEX型）の形成", "スカルン・熱水鉱脈での晶出", "ウラン鉱床との共生（一部）"],
  supplyFlow: ["鉱山採掘", "選鉱・精錬", "輸送", "加工・製品化"],
  priceHistory: [
    { year: 2019, price: 215000 },
    { year: 2020, price: 198000 },
    { year: 2021, price: 251000 },
    { year: 2022, price: 280000 },
    { year: 2023, price: 297000 },
    { year: 2024, price: 342000 },
  ],
  priceUnit: "円/t",
  globalProductionShare: [
    { country: "中国", value: 42 },
    { country: "オーストラリア", value: 12 },
    { country: "アメリカ", value: 8 },
    { country: "ペルー", value: 7 },
    { country: "メキシコ", value: 5 },
  ],
  japanImportShare: [
    { country: "オーストラリア", value: 52 },
    { country: "ペルー", value: 18 },
    { country: "アメリカ", value: 10 },
    { country: "ボリビア", value: 6 },
    { country: "中国", value: 5 },
  ],
  structureTags: [
    { emoji: "🔋", label: "蓄電池需要" },
    { emoji: "🌍", label: "国際市場型" },
  ],
};

export const tinResource: Resource = {
  id: "tin",
  name: "スズ",
  nameEn: "Tin",
  chemicalFormula: "Sn",
  products: ["はんだ", "缶・包装", "スズめっき", "ガラス加工", "合金"],
  productionFlow: ["花崗岩質マグマの貫入・冷却", "ペグマタイト中のスズ石の晶出", "熱水による再濃集・鉱脈の形成", "風化・侵食による砂錫鉱床の形成"],
  supplyFlow: ["鉱山採掘", "選鉱・精錬", "輸送", "加工・製品化"],
  priceHistory: [
    { year: 2019, price: 2040000 },
    { year: 2020, price: 1840000 },
    { year: 2021, price: 4180000 },
    { year: 2022, price: 3190000 },
    { year: 2023, price: 3570000 },
    { year: 2024, price: 4880000 },
  ],
  priceUnit: "円/t",
  globalProductionShare: [
    { country: "中国", value: 32 },
    { country: "インドネシア", value: 22 },
    { country: "ミャンマー", value: 11 },
    { country: "ペルー", value: 6 },
    { country: "ボリビア", value: 5 },
  ],
  japanImportShare: [
    { country: "インドネシア", value: 38 },
    { country: "マレーシア", value: 22 },
    { country: "ペルー", value: 14 },
    { country: "ボリビア", value: 10 },
    { country: "中国", value: 8 },
  ],
  structureTags: [
    { emoji: "⚠", label: "産地集中リスク" },
    { emoji: "📈", label: "価格変動大" },
  ],
};

export const platinumResource: Resource = {
  id: "platinum",
  name: "プラチナ",
  nameEn: "Platinum",
  chemicalFormula: "Pt",
  products: ["自動車触媒", "宝飾品", "医療機器", "燃料電池", "ガラス製造"],
  productionFlow: ["マントル深部での元素の濃集", "マグマの上昇・超塩基性岩の貫入", "冷却時の硫化鉱物との共晶出（PGM鉱床）", "ブッシュフェルド複合岩体などの層状貫入岩での濃集"],
  supplyFlow: ["鉱山採掘", "選鉱・精錬", "輸送", "加工・製品化"],
  priceHistory: [
    { year: 2019, price: 99000 },
    { year: 2020, price: 105000 },
    { year: 2021, price: 119000 },
    { year: 2022, price: 127000 },
    { year: 2023, price: 143000 },
    { year: 2024, price: 143000 },
  ],
  priceUnit: "円/oz",
  globalProductionShare: [
    { country: "南アフリカ", value: 74 },
    { country: "ロシア", value: 12 },
    { country: "ジンバブエ", value: 6 },
    { country: "カナダ", value: 3 },
    { country: "アメリカ", value: 1 },
  ],
  japanImportShare: [
    { country: "南アフリカ", value: 58 },
    { country: "ロシア", value: 18 },
    { country: "ジンバブエ", value: 8 },
    { country: "スイス", value: 6 },
    { country: "イギリス", value: 4 },
  ],
  structureTags: [
    { emoji: "🚗", label: "自動車触媒需要" },
    { emoji: "⚠", label: "産地集中・政治リスク" },
  ],
};

export const palladiumResource: Resource = {
  id: "palladium",
  name: "パラジウム",
  nameEn: "Palladium",
  chemicalFormula: "Pd",
  products: ["自動車触媒", "電子部品", "宝飾品", "歯科", "水素精製"],
  productionFlow: ["マントル由来のマグマへの濃集", "ニッケル・銅硫化鉱床との共生", "超塩基性岩中のPGM鉱物の晶出", "プラチナ族元素として同一鉱床に共存"],
  supplyFlow: ["鉱山採掘", "選鉱・精錬", "輸送", "加工・製品化"],
  priceHistory: [
    { year: 2019, price: 167000 },
    { year: 2020, price: 255000 },
    { year: 2021, price: 295000 },
    { year: 2022, price: 283000 },
    { year: 2023, price: 193000 },
    { year: 2024, price: 147000 },
  ],
  priceUnit: "円/oz",
  globalProductionShare: [
    { country: "ロシア", value: 40 },
    { country: "南アフリカ", value: 39 },
    { country: "カナダ", value: 7 },
    { country: "アメリカ", value: 6 },
    { country: "ジンバブエ", value: 3 },
  ],
  japanImportShare: [
    { country: "ロシア", value: 42 },
    { country: "南アフリカ", value: 28 },
    { country: "スイス", value: 12 },
    { country: "イギリス", value: 8 },
    { country: "アメリカ", value: 4 },
  ],
  structureTags: [
    { emoji: "🚗", label: "自動車触媒需要" },
    { emoji: "⚠", label: "政治リスク影響" },
  ],
};

export const manganeseResource: Resource = {
  id: "manganese",
  name: "マンガン",
  nameEn: "Manganese",
  chemicalFormula: "Mn",
  products: ["鉄鋼（フェロマンガン）", "乾電池", "アルミ合金", "肥料", "水処理"],
  productionFlow: ["海底での酸化・沈殿（マンガン団塊・クラスト）", "熱水活動による酸化マンガンの堆積", "浅海での化学的沈殿（層状マンガン鉱床）", "残留鉱床（ラテライト型）の形成"],
  supplyFlow: ["鉱山採掘", "選鉱・製錬", "輸送", "加工・製品化"],
  priceHistory: [
    { year: 2019, price: 572 },
    { year: 2020, price: 514 },
    { year: 2021, price: 605 },
    { year: 2022, price: 806 },
    { year: 2023, price: 700 },
    { year: 2024, price: 675 },
  ],
  priceUnit: "円/kg",
  globalProductionShare: [
    { country: "南アフリカ", value: 37 },
    { country: "ガボン", value: 20 },
    { country: "オーストラリア", value: 15 },
    { country: "中国", value: 14 },
    { country: "ガーナ", value: 5 },
  ],
  japanImportShare: [
    { country: "南アフリカ", value: 28 },
    { country: "オーストラリア", value: 24 },
    { country: "ガボン", value: 18 },
    { country: "中国", value: 12 },
    { country: "ガーナ", value: 8 },
  ],
  structureTags: [
    { emoji: "🌍", label: "国際市場型" },
    { emoji: "📦", label: "鉄鋼・合金需要" },
  ],
};

export const titaniumResource: Resource = {
  id: "titanium",
  name: "チタン",
  nameEn: "Titanium",
  chemicalFormula: "Ti",
  products: ["航空機・ジェットエンジン", "医療インプラント", "スポーツ用品", "海水淡水化", "化工機器"],
  productionFlow: ["マグマの分化・かんらん石等からのチタン濃集", "イルメナイト・ルチル等の晶出", "風化・侵食による砂鉱床の形成", "海岸・河川での重鉱物の濃集"],
  supplyFlow: ["鉱山採掘", "精製・加工", "輸送", "加工・製品化"],
  priceHistory: [
    { year: 2019, price: 528 },
    { year: 2020, price: 482 },
    { year: 2021, price: 572 },
    { year: 2022, price: 754 },
    { year: 2023, price: 700 },
    { year: 2024, price: 630 },
  ],
  priceUnit: "円/kg",
  globalProductionShare: [
    { country: "中国", value: 48 },
    { country: "モザンビーク", value: 10 },
    { country: "南アフリカ", value: 8 },
    { country: "オーストラリア", value: 8 },
    { country: "ケニア", value: 5 },
  ],
  japanImportShare: [
    { country: "オーストラリア", value: 22 },
    { country: "南アフリカ", value: 18 },
    { country: "ベトナム", value: 14 },
    { country: "中国", value: 12 },
    { country: "インド", value: 10 },
  ],
  structureTags: [
    { emoji: "🇯🇵", label: "国内生産あり" },
    { emoji: "🌍", label: "国際市場型" },
  ],
};

export const tungstenResource: Resource = {
  id: "tungsten",
  name: "タングステン",
  nameEn: "Tungsten",
  chemicalFormula: "W",
  products: ["切削工具・超硬合金", "電球フィラメント", "電子部品", "防弾材", "合金鋼"],
  productionFlow: ["花崗岩質マグマの貫入", "ペグマタイト・スカルン中の灰重石の晶出", "熱水鉱脈でのタングステン鉱物の沈殿", "接触変成帯での鉱床形成"],
  supplyFlow: ["鉱山採掘", "選鉱・精錬", "輸送", "加工・製品化"],
  priceHistory: [
    { year: 2019, price: 29200 },
    { year: 2020, price: 25100 },
    { year: 2021, price: 35200 },
    { year: 2022, price: 46200 },
    { year: 2023, price: 43400 },
    { year: 2024, price: 42800 },
  ],
  priceUnit: "円/t",
  globalProductionShare: [
    { country: "中国", value: 84 },
    { country: "ベトナム", value: 4 },
    { country: "ロシア", value: 3 },
    { country: "ボリビア", value: 2 },
    { country: "ルワンダ", value: 1 },
  ],
  japanImportShare: [
    { country: "中国", value: 38 },
    { country: "ボリビア", value: 18 },
    { country: "ベトナム", value: 14 },
    { country: "オーストラリア", value: 10 },
    { country: "ロシア", value: 8 },
  ],
  structureTags: [
    { emoji: "⚠", label: "中国集中・戦略物資" },
    { emoji: "⚡", label: "EV・脱炭素需要" },
  ],
};

export const rareEarthResource: Resource = {
  id: "rare-earth",
  name: "レアアース",
  nameEn: "Rare Earth",
  chemicalFormula: "REE",
  products: ["永久磁石（EV・風力）", "ディスプレイ", "蛍光体", "触媒", "研磨材"],
  productionFlow: ["花崗岩質マグマ・炭酸塩岩の関与", "ペグマタイト・風化殻（イオン吸着型）での濃集", "モナズ石・バストネサイト等の鉱物の形成", "中国南部型など風化花崗岩中のレアアース鉱床"],
  supplyFlow: ["鉱山採掘", "精製・加工", "輸送", "加工・製品化"],
  priceHistory: [
    { year: 2019, price: 5280 },
    { year: 2020, price: 4490 },
    { year: 2021, price: 10500 },
    { year: 2022, price: 10700 },
    { year: 2023, price: 8120 },
    { year: 2024, price: 7800 },
  ],
  priceUnit: "円/kg",
  globalProductionShare: [
    { country: "中国", value: 70 },
    { country: "アメリカ", value: 14 },
    { country: "ミャンマー", value: 9 },
    { country: "オーストラリア", value: 4 },
    { country: "マダガスカル", value: 1 },
  ],
  japanImportShare: [
    { country: "中国", value: 58 },
    { country: "ベトナム", value: 12 },
    { country: "マレーシア", value: 10 },
    { country: "アメリカ", value: 8 },
    { country: "オーストラリア", value: 6 },
  ],
  structureTags: [
    { emoji: "⚠", label: "中国集中・戦略物資" },
    { emoji: "🔬", label: "先端産業必須" },
  ],
};

export const uraniumResource: Resource = {
  id: "uranium",
  name: "ウラン",
  nameEn: "Uranium",
  chemicalFormula: "U",
  products: ["原子力発電", "医療用放射性同位体", "軍事・研究", "原子力艦船"],
  productionFlow: ["花崗岩質ペグマタイトでの晶出", "堆積岩中の還元環境での濃集（砂岩型鉱床）", "不整合面型・脈状ウラン鉱床の形成", "火山岩中の層状・浸透型鉱床"],
  supplyFlow: ["鉱山採掘", "精製・濃縮", "輸送", "燃料加工"],
  priceHistory: [
    { year: 2019, price: 5720 },
    { year: 2020, price: 5140 },
    { year: 2021, price: 4620 },
    { year: 2022, price: 6500 },
    { year: 2023, price: 9100 },
    { year: 2024, price: 13200 },
  ],
  priceUnit: "円/lb",
  globalProductionShare: [
    { country: "カザフスタン", value: 43 },
    { country: "カナダ", value: 15 },
    { country: "ナミビア", value: 11 },
    { country: "オーストラリア", value: 9 },
    { country: "ウズベキスタン", value: 5 },
  ],
  japanImportShare: [
    { country: "オーストラリア", value: 32 },
    { country: "カナダ", value: 28 },
    { country: "カザフスタン", value: 18 },
    { country: "ナミビア", value: 10 },
    { country: "ウズベキスタン", value: 6 },
  ],
  structureTags: [
    { emoji: "☢", label: "原子力・規制" },
    { emoji: "⚠", label: "地政学リスク" },
  ],
};

/** 鉱物の分類（トップページの表示色に使用） */
export type ResourceCategory =
  | "precious"    // 貴金属
  | "base"        // ベースメタル
  | "ferrous"     // 鉄鋼・合金
  | "battery"     // バッテリー材料
  | "light"       // 軽金属・特殊
  | "strategic"   // 戦略物資
  | "nuclear";    // 原子力

/** 分類ごとのカード用スタイル（背景・枠・ホバー） */
export const categoryStyles: Record<
  ResourceCategory,
  { bg: string; border: string; hover: string; label: string }
> = {
  precious: { bg: "bg-amber-50", border: "border-amber-200", hover: "hover:bg-amber-100", label: "貴金属" },
  base: { bg: "bg-sky-50", border: "border-sky-200", hover: "hover:bg-sky-100", label: "ベースメタル" },
  ferrous: { bg: "bg-zinc-100", border: "border-zinc-300", hover: "hover:bg-zinc-200", label: "鉄鋼・合金" },
  battery: { bg: "bg-emerald-50", border: "border-emerald-200", hover: "hover:bg-emerald-100", label: "バッテリー材料" },
  light: { bg: "bg-cyan-50", border: "border-cyan-200", hover: "hover:bg-cyan-100", label: "軽金属・特殊" },
  strategic: { bg: "bg-violet-50", border: "border-violet-200", hover: "hover:bg-violet-100", label: "戦略物資" },
  nuclear: { bg: "bg-orange-50", border: "border-orange-200", hover: "hover:bg-orange-100", label: "原子力" },
};

/** トップページ用：主要鉱物の一覧（カード表示用・structureTags は resourceMap から付与） */
const resourceListBase = [
  { id: "gold", name: "金", nameEn: "Gold", chemicalFormula: "Au", icon: "🥇", category: "precious" as const },
  { id: "silver", name: "銀", nameEn: "Silver", chemicalFormula: "Ag", icon: "🥈", category: "precious" as const },
  { id: "platinum", name: "プラチナ", nameEn: "Platinum", chemicalFormula: "Pt", icon: "💎", category: "precious" as const },
  { id: "palladium", name: "パラジウム", nameEn: "Palladium", chemicalFormula: "Pd", icon: "💎", category: "precious" as const },
  { id: "copper", name: "銅", nameEn: "Copper", chemicalFormula: "Cu", icon: "🥉", category: "base" as const },
  { id: "aluminum", name: "アルミニウム", nameEn: "Aluminum", chemicalFormula: "Al", icon: "⚙️", category: "base" as const },
  { id: "zinc", name: "亜鉛", nameEn: "Zinc", chemicalFormula: "Zn", icon: "🛡️", category: "base" as const },
  { id: "lead", name: "鉛", nameEn: "Lead", chemicalFormula: "Pb", icon: "⚖️", category: "base" as const },
  { id: "tin", name: "スズ", nameEn: "Tin", chemicalFormula: "Sn", icon: "📦", category: "base" as const },
  { id: "iron", name: "鉄", nameEn: "Iron", chemicalFormula: "Fe", icon: "🔩", category: "ferrous" as const },
  { id: "nickel", name: "ニッケル", nameEn: "Nickel", chemicalFormula: "Ni", icon: "🔋", category: "ferrous" as const },
  { id: "manganese", name: "マンガン", nameEn: "Manganese", chemicalFormula: "Mn", icon: "⚙️", category: "ferrous" as const },
  { id: "lithium", name: "リチウム", nameEn: "Lithium", chemicalFormula: "Li", icon: "🔋", category: "battery" as const },
  { id: "cobalt", name: "コバルト", nameEn: "Cobalt", chemicalFormula: "Co", icon: "🔋", category: "battery" as const },
  { id: "titanium", name: "チタン", nameEn: "Titanium", chemicalFormula: "Ti", icon: "✈️", category: "light" as const },
  { id: "tungsten", name: "タングステン", nameEn: "Tungsten", chemicalFormula: "W", icon: "💡", category: "light" as const },
  { id: "rare-earth", name: "レアアース", nameEn: "Rare Earth", chemicalFormula: "REE", icon: "🌐", category: "strategic" as const },
  { id: "uranium", name: "ウラン", nameEn: "Uranium", chemicalFormula: "U", icon: "☢️", category: "nuclear" as const },
] as const;

/** id から Resource を取得（詳細ページ用） */
const resourceMap: Record<string, Resource> = {
  gold: goldResource,
  silver: silverResource,
  copper: copperResource,
  aluminum: aluminumResource,
  iron: ironResource,
  nickel: nickelResource,
  lithium: lithiumResource,
  cobalt: cobaltResource,
  zinc: zincResource,
  lead: leadResource,
  tin: tinResource,
  platinum: platinumResource,
  palladium: palladiumResource,
  manganese: manganeseResource,
  titanium: titaniumResource,
  tungsten: tungstenResource,
  "rare-earth": rareEarthResource,
  uranium: uraniumResource,
};

/** 一覧用（structureTags は resourceMap から付与） */
export const resourceList = resourceListBase.map((item) => ({
  ...item,
  structureTags: (resourceMap[item.id]?.structureTags ?? []) as StructureTag[],
}));

export function getResourceById(id: string): Resource | undefined {
  return resourceMap[id] ?? undefined;
}
