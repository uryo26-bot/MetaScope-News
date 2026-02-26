import type { Crop, StructureTag } from "../types/crop";

/** 農産物の分類（カードの表示色に使用） */
export type CropCategory =
  | "grain"      // 穀物
  | "bean"       // 豆類
  | "fruit"     // 果実
  | "vegetable"  // 野菜
  | "beverage"   // 飲料作物
  | "sugar"      // 糖料
  | "fiber"      // 繊維
  | "meat"       // 肉類
  | "fish";      // 魚類

/** 分類ごとのカード用スタイル */
export const cropCategoryStyles: Record<
  CropCategory,
  { bg: string; border: string; hover: string; label: string }
> = {
  grain: { bg: "bg-amber-50", border: "border-amber-200", hover: "hover:bg-amber-100", label: "穀物" },
  bean: { bg: "bg-lime-50", border: "border-lime-200", hover: "hover:bg-lime-100", label: "豆類" },
  fruit: { bg: "bg-rose-50", border: "border-rose-200", hover: "hover:bg-rose-100", label: "果実" },
  vegetable: { bg: "bg-green-50", border: "border-green-200", hover: "hover:bg-green-100", label: "野菜" },
  beverage: { bg: "bg-amber-50", border: "border-amber-300", hover: "hover:bg-amber-100", label: "飲料作物" },
  sugar: { bg: "bg-yellow-50", border: "border-yellow-200", hover: "hover:bg-yellow-100", label: "糖料" },
  fiber: { bg: "bg-stone-100", border: "border-stone-300", hover: "hover:bg-stone-200", label: "繊維" },
  meat: { bg: "bg-red-50", border: "border-red-200", hover: "hover:bg-red-100", label: "肉類" },
  fish: { bg: "bg-sky-50", border: "border-sky-200", hover: "hover:bg-sky-100", label: "魚類" },
};

const defaultPrice = [
  { year: 2019, price: 100 },
  { year: 2020, price: 105 },
  { year: 2021, price: 115 },
  { year: 2022, price: 140 },
  { year: 2023, price: 135 },
  { year: 2024, price: 130 },
];
const defaultGlobal = [
  { country: "中国", value: 28 },
  { country: "インド", value: 18 },
  { country: "アメリカ", value: 15 },
  { country: "ブラジル", value: 8 },
  { country: "その他", value: 31 },
];
const defaultImport = [
  { country: "アメリカ", value: 35 },
  { country: "カナダ", value: 18 },
  { country: "オーストラリア", value: 12 },
  { country: "中国", value: 8 },
  { country: "その他", value: 27 },
];

export const riceCrop: Crop = {
  id: "rice",
  name: "米",
  nameEn: "Rice",
  subtitle: "穀物",
  products: ["主食", "日本酒", "米粉", "せんべい", "飼料"],
  productionFlow: ["田んぼの整地・代かき", "種まき・育苗", "田植え・水管理", "穂が出て開花・結実", "収穫・乾燥・もみすり"],
  supplyFlow: ["収穫", "乾燥・調製", "貯蔵・輸送", "精米・加工・小売"],
  priceHistory: [
    { year: 2019, price: 24500 },
    { year: 2020, price: 24800 },
    { year: 2021, price: 25200 },
    { year: 2022, price: 26800 },
    { year: 2023, price: 27500 },
    { year: 2024, price: 28200 },
  ],
  priceUnit: "円/60kg",
  globalProductionShare: [
    { country: "中国", value: 28 },
    { country: "インド", value: 24 },
    { country: "バングラデシュ", value: 7 },
    { country: "インドネシア", value: 7 },
    { country: "ベトナム", value: 5 },
  ],
  japanImportShare: [
    { country: "アメリカ", value: 48 },
    { country: "オーストラリア", value: 22 },
    { country: "タイ", value: 12 },
    { country: "中国", value: 8 },
    { country: "ベトナム", value: 5 },
  ],
  structureTags: [
    { emoji: "🌧", label: "気候依存型" },
    { emoji: "🇯🇵", label: "国内生産中心" },
    { emoji: "📉", label: "価格安定型" },
  ],
};

export const wheatCrop: Crop = {
  id: "wheat",
  name: "小麦",
  nameEn: "Wheat",
  subtitle: "穀物",
  products: ["パン", "麺類", "菓子", "飼料", "醸造"],
  productionFlow: ["畑の準備・播種", "発芽・分げつ", "越冬・春の伸長", "出穂・開花・登熟", "収穫"],
  supplyFlow: ["収穫", "乾燥・調製", "貯蔵・輸送", "製粉・加工・小売"],
  priceHistory: defaultPrice.map((p) => ({ ...p, price: p.price * 35 })),
  priceUnit: "円/t",
  globalProductionShare: [
    { country: "中国", value: 17 },
    { country: "インド", value: 14 },
    { country: "ロシア", value: 11 },
    { country: "アメリカ", value: 6 },
    { country: "カナダ", value: 5 },
  ],
  japanImportShare: [
    { country: "アメリカ", value: 52 },
    { country: "カナダ", value: 32 },
    { country: "オーストラリア", value: 10 },
    { country: "ウクライナ", value: 3 },
    { country: "その他", value: 3 },
  ],
  structureTags: [
    { emoji: "🌧", label: "気候依存型" },
    { emoji: "🌍", label: "輸入依存" },
    { emoji: "📈", label: "国際価格連動" },
  ],
};

export const soybeanCrop: Crop = {
  id: "soybean",
  name: "大豆",
  nameEn: "Soybean",
  subtitle: "豆類",
  products: ["豆腐・納豆", "醤油・味噌", "食用油", "飼料", "バイオ燃料"],
  productionFlow: ["播種・発芽", "栄養成長・開花", "さやの形成・子実の肥大", "黄化・落葉", "収穫"],
  supplyFlow: ["収穫", "乾燥・調製", "貯蔵・輸送", "選別・加工・小売"],
  priceHistory: defaultPrice.map((p) => ({ ...p, price: p.price * 420 })),
  priceUnit: "円/t",
  globalProductionShare: [
    { country: "ブラジル", value: 37 },
    { country: "アメリカ", value: 28 },
    { country: "アルゼンチン", value: 14 },
    { country: "中国", value: 5 },
    { country: "インド", value: 4 },
  ],
  japanImportShare: [
    { country: "アメリカ", value: 72 },
    { country: "ブラジル", value: 12 },
    { country: "カナダ", value: 8 },
    { country: "中国", value: 4 },
    { country: "その他", value: 4 },
  ],
  structureTags: [
    { emoji: "🌍", label: "輸入依存" },
    { emoji: "📦", label: "飼料・加工需要" },
  ],
};

export const coffeeCrop: Crop = {
  id: "coffee",
  name: "コーヒー",
  nameEn: "Coffee",
  subtitle: "飲料作物",
  products: ["焙煎豆", "インスタントコーヒー", "ドリンク", "菓子", "香料"],
  productionFlow: ["苗木の育苗・定植", "開花・結実（チェリー）", "果実の成熟", "収穫（ピッキング）", "精製（乾式・湿式）"],
  supplyFlow: ["収穫・精製", "選別・輸出", "焙煎・加工", "小売・飲食店"],
  priceHistory: defaultPrice.map((p) => ({ ...p, price: p.price * 280 })),
  priceUnit: "円/kg",
  globalProductionShare: [
    { country: "ブラジル", value: 37 },
    { country: "ベトナム", value: 17 },
    { country: "コロンビア", value: 8 },
    { country: "インドネシア", value: 7 },
    { country: "エチオピア", value: 5 },
  ],
  japanImportShare: [
    { country: "ブラジル", value: 22 },
    { country: "コロンビア", value: 18 },
    { country: "ベトナム", value: 14 },
    { country: "グアテマラ", value: 10 },
    { country: "インドネシア", value: 8 },
  ],
  structureTags: [
    { emoji: "🌧", label: "気候依存型" },
    { emoji: "🌍", label: "産地集中" },
    { emoji: "📈", label: "価格変動大" },
  ],
};

export const sugarcaneCrop: Crop = {
  id: "sugarcane",
  name: "さとうきび",
  nameEn: "Sugarcane",
  subtitle: "糖料",
  products: ["砂糖", "糖蜜", "バイオエタノール", "飼料", "紙パルプ"],
  productionFlow: ["植え付け・萌芽", "茎の伸長・分げつ", "日照と水による糖蓄積", "成熟・収穫適期", "刈り取り"],
  supplyFlow: ["収穫", "搬出・圧搾", "精製・結晶化", "輸送・加工・小売"],
  priceHistory: defaultPrice.map((p) => ({ ...p, price: p.price * 8 })),
  priceUnit: "円/kg",
  globalProductionShare: [
    { country: "ブラジル", value: 40 },
    { country: "インド", value: 20 },
    { country: "中国", value: 6 },
    { country: "タイ", value: 5 },
    { country: "パキスタン", value: 4 },
  ],
  japanImportShare: [
    { country: "タイ", value: 68 },
    { country: "オーストラリア", value: 18 },
    { country: "南アフリカ", value: 6 },
    { country: "フィリピン", value: 4 },
    { country: "その他", value: 4 },
  ],
  structureTags: [
    { emoji: "🇯🇵", label: "国内生産あり（沖縄等）" },
    { emoji: "🌧", label: "気候依存型" },
  ],
};

export const cottonCrop: Crop = {
  id: "cotton",
  name: "綿花",
  nameEn: "Cotton",
  subtitle: "繊維",
  products: ["衣料", "糸・布", "タオル", "綿実油", "飼料"],
  productionFlow: ["播種・発芽", "栄養成長・蕾の形成", "開花・受粉", "実（コットンボール）の成熟・開絮", "収穫"],
  supplyFlow: ["収穫", "綿繰り・選別", "圧梱・輸送", "紡績・織布・加工・小売"],
  priceHistory: defaultPrice.map((p) => ({ ...p, price: p.price * 220 })),
  priceUnit: "円/kg",
  globalProductionShare: [
    { country: "中国", value: 24 },
    { country: "インド", value: 23 },
    { country: "アメリカ", value: 14 },
    { country: "ブラジル", value: 6 },
    { country: "パキスタン", value: 5 },
  ],
  japanImportShare: [
    { country: "アメリカ", value: 42 },
    { country: "オーストラリア", value: 18 },
    { country: "ブラジル", value: 12 },
    { country: "インド", value: 8 },
    { country: "その他", value: 20 },
  ],
  structureTags: [
    { emoji: "🌍", label: "国際市場型" },
    { emoji: "📦", label: "繊維・衣料需要" },
  ],
};

export const beefCrop: Crop = {
  id: "beef",
  name: "牛肉",
  nameEn: "Beef",
  subtitle: "肉類",
  products: ["ステーキ", "焼肉", "ハンバーグ", "牛丼", "加工肉"],
  productionFlow: ["繁殖・肥育", "飼料給与・管理", "出荷適期の判断", "と畜・枝肉", "部位別解体・流通"],
  supplyFlow: ["と畜・解体", "格付・冷却", "輸送・加工", "小売・外食"],
  priceHistory: [
    { year: 2019, price: 2850 },
    { year: 2020, price: 2920 },
    { year: 2021, price: 2980 },
    { year: 2022, price: 3150 },
    { year: 2023, price: 3280 },
    { year: 2024, price: 3350 },
  ],
  priceUnit: "円/kg（国産枝肉）",
  globalProductionShare: [
    { country: "アメリカ", value: 20 },
    { country: "ブラジル", value: 15 },
    { country: "中国", value: 11 },
    { country: "アルゼンチン", value: 5 },
    { country: "オーストラリア", value: 4 },
  ],
  japanImportShare: [
    { country: "アメリカ", value: 42 },
    { country: "オーストラリア", value: 32 },
    { country: "ニュージーランド", value: 8 },
    { country: "カナダ", value: 5 },
    { country: "メキシコ", value: 4 },
  ],
  structureTags: [
    { emoji: "🇯🇵", label: "国産志向強い" },
    { emoji: "🌍", label: "輸入も重要" },
  ],
};

export const porkCrop: Crop = {
  id: "pork",
  name: "豚肉",
  nameEn: "Pork",
  subtitle: "肉類",
  products: ["とんかつ", "焼き豚", "ハム・ベーコン", "餃子", "加工品"],
  productionFlow: ["繁殖・分娩", "哺乳・離乳", "肥育・飼料給与", "出荷", "と畜・解体"],
  supplyFlow: ["と畜・解体", "冷却・加工", "輸送", "小売・外食"],
  priceHistory: [
    { year: 2019, price: 620 },
    { year: 2020, price: 650 },
    { year: 2021, price: 680 },
    { year: 2022, price: 720 },
    { year: 2023, price: 750 },
    { year: 2024, price: 740 },
  ],
  priceUnit: "円/kg（枝肉）",
  globalProductionShare: [
    { country: "中国", value: 44 },
    { country: "EU", value: 21 },
    { country: "アメリカ", value: 10 },
    { country: "ブラジル", value: 4 },
    { country: "ベトナム", value: 3 },
  ],
  japanImportShare: [
    { country: "アメリカ", value: 35 },
    { country: "カナダ", value: 22 },
    { country: "デンマーク", value: 14 },
    { country: "スペイン", value: 10 },
    { country: "その他", value: 19 },
  ],
  structureTags: [
    { emoji: "🌍", label: "輸入依存" },
    { emoji: "📉", label: "価格変動あり" },
  ],
};

export const chickenCrop: Crop = {
  id: "chicken",
  name: "鶏肉",
  nameEn: "Chicken",
  subtitle: "肉類",
  products: ["唐揚げ", "親子丼", "サラダチキン", "加工品", "卵"],
  productionFlow: ["ふ化・初生雛", "育雛・育成", "肥育・飼料給与", "出荷", "と畜・解体"],
  supplyFlow: ["と畜・解体", "冷却・パック", "輸送", "小売・外食"],
  priceHistory: [
    { year: 2019, price: 480 },
    { year: 2020, price: 490 },
    { year: 2021, price: 520 },
    { year: 2022, price: 580 },
    { year: 2023, price: 600 },
    { year: 2024, price: 590 },
  ],
  priceUnit: "円/kg（むね肉）",
  globalProductionShare: [
    { country: "アメリカ", value: 20 },
    { country: "中国", value: 15 },
    { country: "ブラジル", value: 14 },
    { country: "EU", value: 12 },
    { country: "インドネシア", value: 5 },
  ],
  japanImportShare: [
    { country: "ブラジル", value: 78 },
    { country: "タイ", value: 12 },
    { country: "チリ", value: 5 },
    { country: "中国", value: 2 },
    { country: "その他", value: 3 },
  ],
  structureTags: [
    { emoji: "🌍", label: "輸入依存大" },
    { emoji: "📦", label: "加工・外食需要" },
  ],
};

export const tunaCrop: Crop = {
  id: "tuna",
  name: "マグロ",
  nameEn: "Tuna",
  subtitle: "魚類",
  products: ["刺身", "寿司", "ツナ缶", "丼もの", "加工品"],
  productionFlow: ["産卵・孵化", "稚魚の成長", "回遊・索餌", "水揚げ適期", "漁獲"],
  supplyFlow: ["水揚げ", "選別・競り", "冷凍・加工", "輸送", "小売・飲食店"],
  priceHistory: [
    { year: 2019, price: 3200 },
    { year: 2020, price: 2800 },
    { year: 2021, price: 3500 },
    { year: 2022, price: 4200 },
    { year: 2023, price: 3800 },
    { year: 2024, price: 3600 },
  ],
  priceUnit: "円/kg（クロマグロ）",
  globalProductionShare: [
    { country: "日本", value: 12 },
    { country: "インドネシア", value: 10 },
    { country: "台湾", value: 8 },
    { country: "韓国", value: 6 },
    { country: "スペイン", value: 5 },
  ],
  japanImportShare: [
    { country: "台湾", value: 18 },
    { country: "韓国", value: 14 },
    { country: "インドネシア", value: 12 },
    { country: "中国", value: 10 },
    { country: "その他", value: 46 },
  ],
  structureTags: [
    { emoji: "🇯🇵", label: "国内漁業・養殖" },
    { emoji: "🌍", label: "国際取引" },
    { emoji: "📈", label: "高級魚・価格変動" },
  ],
};

export const salmonCrop: Crop = {
  id: "salmon",
  name: "サケ",
  nameEn: "Salmon",
  subtitle: "魚類",
  products: ["刺身", "焼き魚", "ルイベ", "缶詰", "燻製"],
  productionFlow: ["産卵・孵化", "河川生活", "降海・回遊", "成長・遡上", "漁獲・養殖"],
  supplyFlow: ["水揚げ・養殖出荷", "選別・加工", "冷凍・輸送", "小売・飲食店"],
  priceHistory: [
    { year: 2019, price: 850 },
    { year: 2020, price: 820 },
    { year: 2021, price: 900 },
    { year: 2022, price: 950 },
    { year: 2023, price: 920 },
    { year: 2024, price: 880 },
  ],
  priceUnit: "円/kg",
  globalProductionShare: [
    { country: "ノルウェー", value: 52 },
    { country: "チリ", value: 28 },
    { country: "スコットランド", value: 8 },
    { country: "カナダ", value: 4 },
    { country: "日本", value: 3 },
  ],
  japanImportShare: [
    { country: "チリ", value: 58 },
    { country: "ノルウェー", value: 32 },
    { country: "ロシア", value: 5 },
    { country: "カナダ", value: 2 },
    { country: "その他", value: 3 },
  ],
  structureTags: [
    { emoji: "🌍", label: "輸入依存（養殖中心）" },
    { emoji: "📦", label: "冷凍・加工流通" },
  ],
};

export const shrimpCrop: Crop = {
  id: "shrimp",
  name: "エビ",
  nameEn: "Shrimp",
  subtitle: "魚類",
  products: ["天ぷら", "寿司", "エビチリ", "冷凍むきエビ", "加工品"],
  productionFlow: ["産卵・孵化", "稚エビの成長", "養殖池・自然海域で育成", "収穫適期", "水揚げ"],
  supplyFlow: ["水揚げ・養殖出荷", "選別・冷凍", "輸送", "解凍・小売・外食"],
  priceHistory: [
    { year: 2019, price: 1200 },
    { year: 2020, price: 1150 },
    { year: 2021, price: 1300 },
    { year: 2022, price: 1450 },
    { year: 2023, price: 1380 },
    { year: 2024, price: 1320 },
  ],
  priceUnit: "円/kg（ブラックタイガー）",
  globalProductionShare: [
    { country: "中国", value: 35 },
    { country: "インドネシア", value: 18 },
    { country: "エクアドル", value: 16 },
    { country: "インド", value: 12 },
    { country: "ベトナム", value: 8 },
  ],
  japanImportShare: [
    { country: "ベトナム", value: 28 },
    { country: "インド", value: 24 },
    { country: "インドネシア", value: 18 },
    { country: "タイ", value: 12 },
    { country: "その他", value: 18 },
  ],
  structureTags: [
    { emoji: "🌍", label: "輸入依存（養殖）" },
    { emoji: "📦", label: "冷凍・外食需要" },
  ],
};

/** 一覧用ベース（cropMap 定義後に cropList を生成） */
const cropListBase = [
  { id: "rice", name: "米", nameEn: "Rice", icon: "🍚", category: "grain" as const },
  { id: "wheat", name: "小麦", nameEn: "Wheat", icon: "🌾", category: "grain" as const },
  { id: "corn", name: "トウモロコシ", nameEn: "Corn", icon: "🌽", category: "grain" as const },
  { id: "soybean", name: "大豆", nameEn: "Soybean", icon: "🫘", category: "bean" as const },
  { id: "coffee", name: "コーヒー", nameEn: "Coffee", icon: "☕", category: "beverage" as const },
  { id: "cocoa", name: "カカオ", nameEn: "Cocoa", icon: "🍫", category: "beverage" as const },
  { id: "sugarcane", name: "さとうきび", nameEn: "Sugarcane", icon: "🎋", category: "sugar" as const },
  { id: "cotton", name: "綿花", nameEn: "Cotton", icon: "🧵", category: "fiber" as const },
  { id: "beef", name: "牛肉", nameEn: "Beef", icon: "🥩", category: "meat" as const },
  { id: "pork", name: "豚肉", nameEn: "Pork", icon: "🐷", category: "meat" as const },
  { id: "chicken", name: "鶏肉", nameEn: "Chicken", icon: "🍗", category: "meat" as const },
  { id: "tuna", name: "マグロ", nameEn: "Tuna", icon: "🐟", category: "fish" as const },
  { id: "salmon", name: "サケ", nameEn: "Salmon", icon: "🐟", category: "fish" as const },
  { id: "shrimp", name: "エビ", nameEn: "Shrimp", icon: "🦐", category: "fish" as const },
] as const;

const cropMap: Record<string, Crop> = {
  rice: riceCrop,
  wheat: wheatCrop,
  soybean: soybeanCrop,
  coffee: coffeeCrop,
  sugarcane: sugarcaneCrop,
  cotton: cottonCrop,
  beef: beefCrop,
  pork: porkCrop,
  chicken: chickenCrop,
  tuna: tunaCrop,
  salmon: salmonCrop,
  shrimp: shrimpCrop,
  corn: {
    ...wheatCrop,
    id: "corn",
    name: "トウモロコシ",
    nameEn: "Corn",
    subtitle: "穀物",
    products: ["飼料", "でんぷん", "食用油", "バイオエタノール", "食品"],
    productionFlow: ["播種・発芽", "栄養成長・雌穂・雄穂の形成", "受粉・子実の肥大", "成熟・乾燥", "収穫"],
    supplyFlow: ["収穫", "乾燥・調製", "貯蔵・輸送", "加工・小売"],
    structureTags: [
      { emoji: "🌧", label: "気候依存型" },
      { emoji: "🌍", label: "輸入依存（飼料）" },
      { emoji: "📈", label: "国際価格連動" },
    ],
    globalProductionShare: [
      { country: "アメリカ", value: 31 },
      { country: "中国", value: 23 },
      { country: "ブラジル", value: 9 },
      { country: "アルゼンチン", value: 5 },
      { country: "ウクライナ", value: 3 },
    ],
    japanImportShare: [
      { country: "アメリカ", value: 88 },
      { country: "ブラジル", value: 5 },
      { country: "アルゼンチン", value: 3 },
      { country: "その他", value: 4 },
    ],
  },
  cocoa: {
    ...coffeeCrop,
    id: "cocoa",
    name: "カカオ",
    nameEn: "Cocoa",
    subtitle: "飲料作物",
    products: ["チョコレート", "ココア", "菓子", "化粧品"],
    productionFlow: ["苗木の定植", "幹・枝への開花・結実", "カカオポッドの成熟", "収穫・割果", "発酵・乾燥"],
    supplyFlow: ["収穫・発酵・乾燥", "選別・輸出", "焙煎・粉砕", "チョコレート・ココア製造・小売"],
    structureTags: [
      { emoji: "🌧", label: "気候依存型" },
      { emoji: "🌍", label: "産地集中" },
      { emoji: "📈", label: "価格変動大" },
    ],
    globalProductionShare: [
      { country: "コートジボワール", value: 44 },
      { country: "ガーナ", value: 18 },
      { country: "インドネシア", value: 11 },
      { country: "エクアドル", value: 5 },
      { country: "カメルーン", value: 4 },
    ],
    japanImportShare: [
      { country: "エクアドル", value: 28 },
      { country: "ガーナ", value: 22 },
      { country: "ベネズエラ", value: 12 },
      { country: "ドミニカ", value: 8 },
      { country: "その他", value: 30 },
    ],
  },
};

/** 一覧用：主要農産物・畜産物・水産物（structureTags は cropMap から付与） */
export const cropList = cropListBase.map((item) => ({
  ...item,
  structureTags: (cropMap[item.id]?.structureTags ?? []) as StructureTag[],
}));

export function getCropById(id: string): Crop | undefined {
  return cropMap[id];
}
