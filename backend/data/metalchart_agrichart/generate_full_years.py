# -*- coding: utf-8 -*-
"""Generate 2010-2025 dummy data. Writes to MetalChart/ and AgriChart/."""
import os
import csv

HEADER = "year,resource,parent_resource,country_code,country,volume,volume_unit,volume_percentage,value,value_unit,value_percentage,source"
YEARS = list(range(2010, 2026))  # 2010 to 2025
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.normpath(os.path.join(SCRIPT_DIR, ".."))  # data

def trend(year, base_vol, base_val, country_index, num_countries):
    """
    全体トレンド(2010=0.82, 2025=1.18) + 国ごとのドリフトで割合が年度で変わるようにする。
    先頭の国はやや縮小、後ろの国はやや拡大するトレンド。
    """
    t = (year - 2010) / 15.0
    f = 0.82 + 0.36 * t
    # 国インデックスに応じたドリフト: 0番は年とともにやや減、最後はやや増（割合が変わる）
    drift = 1.0 + 0.012 * (year - 2017) * (2.0 * country_index / max(1, num_countries - 1) - 1.0)
    vol = int(base_vol * f * drift)
    val = int(base_val * f * drift)
    return max(1, vol), max(1, val)

def write_csv(filename, resource, parent, rows_by_country, source="MetalChart_AgriChart_Dummy", subdir="MetalChart"):
    # rows_by_country: list of (country_code, country_ja, base_volume, base_value)
    out_dir = os.path.join(BASE_DIR, subdir)
    os.makedirs(out_dir, exist_ok=True)
    path = os.path.join(out_dir, filename)
    n = len(rows_by_country)
    with open(path, "w", encoding="utf-8", newline="") as f:
        w = csv.writer(f)
        w.writerow(HEADER.split(","))
        for year in YEARS:
            year_volumes = []
            for i, (country_code, country_ja, base_vol, base_val) in enumerate(rows_by_country):
                vol, val = trend(year, base_vol, base_val, i, n)
                year_volumes.append((country_code, country_ja, vol, val))
            total_vol = sum(r[2] for r in year_volumes)
            total_val = sum(r[3] for r in year_volumes)
            for country_code, country_ja, vol, val in year_volumes:
                vol_pct = round(100.0 * vol / total_vol, 1) if total_vol else 0
                val_pct = round(100.0 * val / total_val, 1) if total_val else 0
                w.writerow([year, resource, parent, country_code, country_ja, vol, "MT", vol_pct, val, "JPY_1000", val_pct, source])
    print("Wrote", filename)

# MetalChart
METAL = [
    ("Gold_import.csv", "Gold", "precious", [
        ("CHE", "スイス", 102, 242000000),
        ("AUS", "オーストラリア", 81, 168000000),
        ("CAN", "カナダ", 75, 149000000),
        ("ZAF", "南アフリカ共和国", 55, 112000000),
        ("PER", "ペルー", 45, 83000000),
    ]),
    ("Silver_import.csv", "Silver", "precious", [
        ("MEX", "メキシコ", 442, 15700000),
        ("PER", "ペルー", 408, 14300000),
        ("CHN", "中華人民共和国", 272, 9500000),
        ("AUS", "オーストラリア", 238, 8320000),
        ("CHL", "チリ", 204, 7140000),
    ]),
    ("Platinum_import.csv", "Platinum", "precious", [
        ("ZAF", "南アフリカ共和国", 106, 157000000),
        ("RUS", "ロシア", 19, 27600000),
        ("ZWE", "ジンバブエ", 13, 18900000),
        ("CAN", "カナダ", 7, 10000000),
    ]),
    ("Palladium_import.csv", "Palladium", "precious", [
        ("RUS", "ロシア", 70, 157000000),
        ("ZAF", "南アフリカ共和国", 61, 137000000),
        ("CAN", "カナダ", 19, 42100000),
        ("USA", "アメリカ合衆国", 13, 28700000),
    ]),
    ("Copper_import.csv", "Copper", "base", [
        ("CHL", "チリ", 242000, 265000000),
        ("PER", "ペルー", 129000, 143000000),
        ("AUS", "オーストラリア", 106000, 116000000),
        ("USA", "アメリカ合衆国", 57800, 63700000),
        ("ZAF", "南アフリカ共和国", 34000, 37400000),
    ]),
    ("Aluminum_import.csv", "Aluminum", "base", [
        ("AUS", "オーストラリア", 157000, 242000000),
        ("RUS", "ロシア", 106000, 163000000),
        ("ARE", "アラブ首長国連邦", 83200, 128000000),
        ("IND", "インド", 61200, 94000000),
        ("BRA", "ブラジル", 49200, 75800000),
    ]),
    ("Zinc_import.csv", "Zinc", "base", [
        ("PER", "ペルー", 157000, 106000000),
        ("AUS", "オーストラリア", 129000, 86700000),
        ("USA", "アメリカ合衆国", 83200, 55900000),
        ("IND", "インド", 61200, 41100000),
        ("MEX", "メキシコ", 49200, 33000000),
    ]),
    ("Lead_import.csv", "Lead", "base", [
        ("CHN", "中華人民共和国", 208000, 83700000),
        ("AUS", "オーストラリア", 106000, 42600000),
        ("USA", "アメリカ合衆国", 72200, 29000000),
        ("PER", "ペルー", 52600, 21100000),
        ("MEX", "メキシコ", 49200, 19800000),
    ]),
    ("Tin_import.csv", "Tin", "base", [
        ("IDN", "インドネシア", 70100, 242000000),
        ("MYS", "マレーシア", 55400, 191000000),
        ("PER", "ペルー", 36100, 125000000),
        ("BOL", "ボリビア", 32500, 112000000),
        ("BRA", "ブラジル", 24200, 83700000),
    ]),
    ("Iron_import.csv", "Iron", "ferrous", [
        ("BRA", "ブラジル", 157000000, 2420000000),
        ("AUS", "オーストラリア", 146000000, 2250000000),
        ("IND", "インド", 83700000, 1290000000),
        ("RUS", "ロシア", 61200000, 943000000),
        ("ZAF", "南アフリカ共和国", 49400000, 761000000),
    ]),
    ("Nickel_import.csv", "Nickel", "ferrous", [
        ("IDN", "インドネシア", 667000, 106000000),
        ("PHL", "フィリピン", 361000, 57800000),
        ("AUS", "オーストラリア", 327000, 52300000),
        ("RUS", "ロシア", 253000, 40400000),
        ("NCL", "ニューカレドニア（仏）", 157000, 25200000),
    ]),
    ("Manganese_import.csv", "Manganese", "ferrous", [
        ("ZAF", "南アフリカ共和国", 4970000, 106000000),
        ("AUS", "オーストラリア", 2760000, 59100000),
        ("GAB", "ガボン", 2420000, 51800000),
        ("BRA", "ブラジル", 1850000, 39700000),
        ("CHN", "中華人民共和国", 1570000, 33600000),
    ]),
    ("Lithium_import.csv", "Lithium", "battery", [
        ("CHL", "チリ", 15700, 24200000),
        ("AUS", "オーストラリア", 12100, 19400000),
        ("ARG", "アルゼンチン", 2380, 3820000),
        ("CHN", "中華人民共和国", 42, 65000),
    ]),
    ("Cobalt_import.csv", "Cobalt", "battery", [
        ("COD", "コンゴ民主共和国", 80800, 242000000),
        ("RUS", "ロシア", 5180, 15500000),
        ("AUS", "オーストラリア", 4680, 14000000),
        ("PHL", "フィリピン", 3820, 11500000),
        ("CAN", "カナダ", 3230, 9690000),
    ]),
    ("Titanium_import.csv", "Titanium", "light", [
        ("CHN", "中華人民共和国", 242000, 106000000),
        ("JPN", "日本", 157000, 69000000),
        ("RUS", "ロシア", 129000, 56800000),
        ("KAZ", "カザフスタン", 106000, 46700000),
        ("USA", "アメリカ合衆国", 83200, 36600000),
    ]),
    ("Tungsten_import.csv", "Tungsten", "light", [
        ("CHN", "中華人民共和国", 58200, 106000000),
        ("VNM", "ベトナム", 5260, 9600000),
        ("RUS", "ロシア", 2420, 4420000),
        ("BOL", "ボリビア", 1570, 2870000),
        ("AUT", "オーストリア", 1020, 1860000),
    ]),
    ("RareEarth_import.csv", "RareEarth", "strategic", [
        ("CHN", "中華人民共和国", 112000, 242000000),
        ("USA", "アメリカ合衆国", 22100, 49300000),
        ("MYS", "マレーシア", 18700, 41200000),
        ("AUS", "オーストラリア", 15700, 34700000),
        ("IND", "インド", 10600, 23400000),
    ]),
    ("Uranium_import.csv", "Uranium", "nuclear", [
        ("KAZ", "カザフスタン", 18500, 106000000),
        ("AUS", "オーストラリア", 5260, 30100000),
        ("CAN", "カナダ", 5010, 28700000),
        ("NAM", "ナミビア", 4680, 26800000),
        ("NER", "ニジェール", 2530, 14500000),
    ]),
]

AGRI = [
    ("Rice_import.csv", "Rice", "grain", [
        ("USA", "アメリカ合衆国", 412000, 242000000),
        ("AUS", "オーストラリア", 191000, 112000000),
        ("THA", "タイ", 106000, 62500000),
        ("VNM", "ベトナム", 83200, 48900000),
        ("CHN", "中華人民共和国", 61200, 35900000),
    ], "AgriChart_Dummy"),
    ("Wheat_import.csv", "Wheat", "grain", [
        ("USA", "アメリカ合衆国", 2760000, 242000000),
        ("CAN", "カナダ", 1680000, 147000000),
        ("AUS", "オーストラリア", 531000, 46600000),
        ("UKR", "ウクライナ", 157000, 13800000),
        ("RUS", "ロシア", 106000, 9260000),
    ], "AgriChart_Dummy"),
    ("Corn_import.csv", "Corn", "grain", [
        ("USA", "アメリカ合衆国", 13400000, 1060000000),
        ("BRA", "ブラジル", 1060000, 83700000),
        ("ARG", "アルゼンチン", 497000, 39200000),
        ("UKR", "ウクライナ", 157000, 12400000),
        ("RUS", "ロシア", 80800, 6380000),
    ], "AgriChart_Dummy"),
    ("Soybean_import.csv", "Soybean", "bean", [
        ("USA", "アメリカ合衆国", 2760000, 242000000),
        ("BRA", "ブラジル", 701000, 61500000),
        ("CAN", "カナダ", 242000, 21200000),
        ("CHN", "中華人民共和国", 106000, 9260000),
        ("ARG", "アルゼンチン", 72200, 6330000),
    ], "AgriChart_Dummy"),
    ("Coffee_import.csv", "Coffee", "beverage", [
        ("BRA", "ブラジル", 157000, 106000000),
        ("COL", "コロンビア", 140000, 95200000),
        ("VNM", "ベトナム", 129000, 86700000),
        ("GTM", "グアテマラ", 83700, 56800000),
        ("IDN", "インドネシア", 61600, 41800000),
    ], "AgriChart_Dummy"),
    ("Cocoa_import.csv", "Cocoa", "beverage", [
        ("ECU", "エクアドル", 24200, 106000000),
        ("GHA", "ガーナ", 19100, 83700000),
        ("VEN", "ベネズエラ", 10600, 46600000),
        ("DOM", "ドミニカ共和国", 8370, 36700000),
        ("IDN", "インドネシア", 6160, 27000000),
    ], "AgriChart_Dummy"),
    ("Sugarcane_import.csv", "Sugarcane", "sugar", [
        ("THA", "タイ", 5820000, 106000000),
        ("AUS", "オーストラリア", 1570000, 28700000),
        ("ZAF", "南アフリカ共和国", 531000, 9690000),
        ("PHL", "フィリピン", 242000, 4420000),
        ("FJI", "フィジー", 106000, 1940000),
    ], "AgriChart_Dummy"),
    ("Cotton_import.csv", "Cotton", "fiber", [
        ("USA", "アメリカ合衆国", 157000, 83700000),
        ("AUS", "オーストラリア", 106000, 56800000),
        ("BRA", "ブラジル", 53100, 28400000),
        ("IND", "インド", 32700, 17400000),
        ("EGY", "エジプト", 19100, 10200000),
    ], "AgriChart_Dummy"),
    ("Beef_import.csv", "Beef", "meat", [
        ("USA", "アメリカ合衆国", 242000, 242000000),
        ("AUS", "オーストラリア", 191000, 191000000),
        ("NZL", "ニュージーランド", 72200, 72200000),
        ("CAN", "カナダ", 41200, 41200000),
        ("MEX", "メキシコ", 19100, 19100000),
    ], "AgriChart_Dummy"),
    ("Pork_import.csv", "Pork", "meat", [
        ("USA", "アメリカ合衆国", 327000, 157000000),
        ("CAN", "カナダ", 191000, 91800000),
        ("DNK", "デンマーク", 140000, 67300000),
        ("ESP", "スペイン", 106000, 51000000),
        ("MEX", "メキシコ", 83700, 40100000),
    ], "AgriChart_Dummy"),
    ("Chicken_import.csv", "Chicken", "meat", [
        ("BRA", "ブラジル", 412000, 106000000),
        ("THA", "タイ", 61600, 15900000),
        ("CHL", "チリ", 24200, 6240000),
        ("CHN", "中華人民共和国", 10600, 2730000),
        ("FRA", "フランス", 7220, 1860000),
    ], "AgriChart_Dummy"),
    ("Tuna_import.csv", "Tuna", "fish", [
        ("TWN", "台湾", 106000, 106000000),
        ("KOR", "大韓民国", 83700, 83700000),
        ("IDN", "インドネシア", 72400, 72400000),
        ("CHN", "中華人民共和国", 61600, 61600000),
        ("ESP", "スペイン", 49700, 49700000),
    ], "AgriChart_Dummy"),
    ("Salmon_import.csv", "Salmon", "fish", [
        ("CHL", "チリ", 242000, 106000000),
        ("NOR", "ノルウェー", 140000, 61600000),
        ("RUS", "ロシア", 19100, 8380000),
        ("GBR", "英国", 10600, 4660000),
        ("CAN", "カナダ", 7220, 3170000),
    ], "AgriChart_Dummy"),
    ("Shrimp_import.csv", "Shrimp", "fish", [
        ("VNM", "ベトナム", 106000, 106000000),
        ("IND", "インド", 83700, 83700000),
        ("IDN", "インドネシア", 72400, 72400000),
        ("THA", "タイ", 53100, 53100000),
        ("ECU", "エクアドル", 32700, 32700000),
    ], "AgriChart_Dummy"),
]

# 世界の生産国割合（国別シェア・年度別ドリフトあり）
METAL_PRODUCTION = [
    ("Gold_production.csv", "Gold", "precious", [
        ("CHN", "中華人民共和国", 380, 120000000),
        ("AUS", "オーストラリア", 320, 101000000),
        ("RUS", "ロシア", 310, 98000000),
        ("USA", "アメリカ合衆国", 200, 63000000),
        ("ZAF", "南アフリカ共和国", 110, 35000000),
    ]),
    ("Silver_production.csv", "Silver", "precious", [
        ("MEX", "メキシコ", 6200, 22000000),
        ("PER", "ペルー", 3100, 11000000),
        ("CHN", "中華人民共和国", 3100, 11000000),
        ("CHL", "チリ", 1400, 5000000),
        ("AUS", "オーストラリア", 1300, 4600000),
    ]),
    ("Platinum_production.csv", "Platinum", "precious", [
        ("ZAF", "南アフリカ共和国", 140, 210000000),
        ("RUS", "ロシア", 22, 33000000),
        ("ZWE", "ジンバブエ", 15, 22500000),
    ]),
    ("Palladium_production.csv", "Palladium", "precious", [
        ("RUS", "ロシア", 91, 205000000),
        ("ZAF", "南アフリカ共和国", 80, 180000000),
    ]),
    ("Copper_production.csv", "Copper", "base", [
        ("CHL", "チリ", 5700000, 3500000000),
        ("PER", "ペルー", 2400000, 1470000000),
        ("CHN", "中華人民共和国", 1700000, 1040000000),
        ("USA", "アメリカ合衆国", 1200000, 736000000),
        ("COD", "コンゴ民主共和国", 1300000, 798000000),
    ]),
    ("Aluminum_production.csv", "Aluminum", "base", [
        ("CHN", "中華人民共和国", 3700000, 4500000000),
        ("IND", "インド", 3900000, 4750000000),
        ("RUS", "ロシア", 3600000, 4380000000),
        ("CAN", "カナダ", 2900000, 3530000000),
        ("ARE", "アラブ首長国連邦", 2600000, 3170000000),
    ]),
    ("Zinc_production.csv", "Zinc", "base", [
        ("CHN", "中華人民共和国", 4200000, 2800000000),
        ("PER", "ペルー", 1600000, 1070000000),
        ("AUS", "オーストラリア", 1300000, 867000000),
        ("IND", "インド", 830000, 553000000),
        ("USA", "アメリカ合衆国", 760000, 507000000),
    ]),
    ("Lead_production.csv", "Lead", "base", [
        ("CHN", "中華人民共和国", 2100000, 840000000),
        ("AUS", "オーストラリア", 500000, 200000000),
        ("USA", "アメリカ合衆国", 300000, 120000000),
        ("PER", "ペルー", 310000, 124000000),
        ("MEX", "メキシコ", 240000, 96000000),
    ]),
    ("Tin_production.csv", "Tin", "base", [
        ("CHN", "中華人民共和国", 110000, 380000000),
        ("IDN", "インドネシア", 80000, 276000000),
        ("PER", "ペルー", 18000, 62100000),
        ("BOL", "ボリビア", 17000, 58700000),
        ("BRA", "ブラジル", 12000, 41400000),
    ]),
    ("Iron_production.csv", "Iron", "ferrous", [
        ("AUS", "オーストラリア", 900000000, 90000000000),
        ("BRA", "ブラジル", 410000000, 41000000000),
        ("CHN", "中華人民共和国", 380000000, 38000000000),
        ("IND", "インド", 260000000, 26000000000),
        ("RUS", "ロシア", 100000000, 10000000000),
    ]),
    ("Nickel_production.csv", "Nickel", "ferrous", [
        ("IDN", "インドネシア", 1600000, 256000000),
        ("PHL", "フィリピン", 330000, 52800000),
        ("RUS", "ロシア", 220000, 35200000),
        ("NCL", "ニューカレドニア（仏）", 200000, 32000000),
        ("AUS", "オーストラリア", 160000, 25600000),
    ]),
    ("Manganese_production.csv", "Manganese", "ferrous", [
        ("ZAF", "南アフリカ共和国", 7400000, 158000000),
        ("CHN", "中華人民共和国", 2900000, 61900000),
        ("GAB", "ガボン", 2700000, 57600000),
        ("AUS", "オーストラリア", 3300000, 70400000),
        ("BRA", "ブラジル", 1200000, 25600000),
    ]),
    ("Lithium_production.csv", "Lithium", "battery", [
        ("AUS", "オーストラリア", 61000, 94000000),
        ("CHL", "チリ", 39000, 60100000),
        ("CHN", "中華人民共和国", 33000, 50900000),
        ("ARG", "アルゼンチン", 6200, 9550000),
    ]),
    ("Cobalt_production.csv", "Cobalt", "battery", [
        ("COD", "コンゴ民主共和国", 130000, 390000000),
        ("IND", "インド", 3200, 9600000),
        ("RUS", "ロシア", 8900, 26700000),
        ("AUS", "オーストラリア", 5900, 17700000),
        ("CAN", "カナダ", 3900, 11700000),
    ]),
    ("Titanium_production.csv", "Titanium", "light", [
        ("CHN", "中華人民共和国", 350000, 154000000),
        ("JPN", "日本", 280000, 123000000),
        ("RUS", "ロシア", 180000, 79200000),
        ("KAZ", "カザフスタン", 150000, 66000000),
        ("USA", "アメリカ合衆国", 120000, 52800000),
    ]),
    ("Tungsten_production.csv", "Tungsten", "light", [
        ("CHN", "中華人民共和国", 71000, 129000000),
        ("VNM", "ベトナム", 4500, 8200000),
        ("RUS", "ロシア", 2400, 4370000),
        ("BOL", "ボリビア", 1300, 2370000),
    ]),
    ("RareEarth_production.csv", "RareEarth", "strategic", [
        ("CHN", "中華人民共和国", 240000, 520000000),
        ("USA", "アメリカ合衆国", 43000, 93000000),
        ("MMR", "ミャンマー", 26000, 56400000),
        ("AUS", "オーストラリア", 18000, 39000000),
        ("THA", "タイ", 7100, 15400000),
    ]),
    ("Uranium_production.csv", "Uranium", "nuclear", [
        ("KAZ", "カザフスタン", 22000, 126000000),
        ("NAM", "ナミビア", 5300, 30300000),
        ("CAN", "カナダ", 7300, 41800000),
        ("AUS", "オーストラリア", 6200, 35500000),
        ("UZB", "ウズベキスタン", 3500, 20000000),
    ]),
]

AGRI_PRODUCTION = [
    ("Rice_production.csv", "Rice", "grain", [
        ("CHN", "中華人民共和国", 210000000, 4200000000),
        ("IND", "インド", 195000000, 3900000000),
        ("IDN", "インドネシア", 55000000, 1100000000),
        ("BGD", "バングラデシュ", 55000000, 1100000000),
        ("VNM", "ベトナム", 43000000, 860000000),
    ], "AgriChart_Dummy"),
    ("Wheat_production.csv", "Wheat", "grain", [
        ("CHN", "中華人民共和国", 140000000, 2800000000),
        ("IND", "インド", 110000000, 2200000000),
        ("RUS", "ロシア", 91000000, 1820000000),
        ("USA", "アメリカ合衆国", 49000000, 980000000),
        ("FRA", "フランス", 35000000, 700000000),
    ], "AgriChart_Dummy"),
    ("Corn_production.csv", "Corn", "grain", [
        ("USA", "アメリカ合衆国", 380000000, 38000000000),
        ("CHN", "中華人民共和国", 280000000, 28000000000),
        ("BRA", "ブラジル", 130000000, 13000000000),
        ("ARG", "アルゼンチン", 58000000, 5800000000),
        ("UKR", "ウクライナ", 30000000, 3000000000),
    ], "AgriChart_Dummy"),
    ("Soybean_production.csv", "Soybean", "bean", [
        ("BRA", "ブラジル", 150000000, 15000000000),
        ("USA", "アメリカ合衆国", 120000000, 12000000000),
        ("ARG", "アルゼンチン", 48000000, 4800000000),
        ("CHN", "中華人民共和国", 18000000, 1800000000),
        ("IND", "インド", 12000000, 1200000000),
    ], "AgriChart_Dummy"),
    ("Coffee_production.csv", "Coffee", "beverage", [
        ("BRA", "ブラジル", 3700000, 2500000000),
        ("VNM", "ベトナム", 1850000, 1250000000),
        ("COL", "コロンビア", 850000, 575000000),
        ("IDN", "インドネシア", 720000, 487000000),
        ("ETH", "エチオピア", 480000, 324000000),
    ], "AgriChart_Dummy"),
    ("Cocoa_production.csv", "Cocoa", "beverage", [
        ("CIV", "コートジボワール", 2200000, 960000000),
        ("GHA", "ガーナ", 850000, 372000000),
        ("IDN", "インドネシア", 740000, 324000000),
        ("ECU", "エクアドル", 330000, 144000000),
        ("CMR", "カメルーン", 290000, 127000000),
    ], "AgriChart_Dummy"),
    ("Sugarcane_production.csv", "Sugarcane", "sugar", [
        ("BRA", "ブラジル", 750000000, 13700000000),
        ("IND", "インド", 405000000, 7400000000),
        ("CHN", "中華人民共和国", 108000000, 1970000000),
        ("THA", "タイ", 105000000, 1920000000),
        ("PAK", "パキスタン", 83000000, 1520000000),
    ], "AgriChart_Dummy"),
    ("Cotton_production.csv", "Cotton", "fiber", [
        ("CHN", "中華人民共和国", 6100000, 3050000000),
        ("IND", "インド", 5100000, 2550000000),
        ("USA", "アメリカ合衆国", 3400000, 1700000000),
        ("BRA", "ブラジル", 2300000, 1150000000),
        ("AUS", "オーストラリア", 1100000, 550000000),
    ], "AgriChart_Dummy"),
    ("Beef_production.csv", "Beef", "meat", [
        ("USA", "アメリカ合衆国", 12500000, 12500000000),
        ("BRA", "ブラジル", 10200000, 10200000000),
        ("CHN", "中華人民共和国", 6700000, 6700000000),
        ("ARG", "アルゼンチン", 3200000, 3200000000),
        ("AUS", "オーストラリア", 2100000, 2100000000),
    ], "AgriChart_Dummy"),
    ("Pork_production.csv", "Pork", "meat", [
        ("CHN", "中華人民共和国", 54000000, 27000000000),
        ("EU", "EU", 24000000, 12000000000),
        ("USA", "アメリカ合衆国", 13000000, 6500000000),
        ("BRA", "ブラジル", 4200000, 2100000000),
        ("RUS", "ロシア", 2400000, 1200000000),
    ], "AgriChart_Dummy"),
    ("Chicken_production.csv", "Chicken", "meat", [
        ("USA", "アメリカ合衆国", 21000000, 21000000000),
        ("CHN", "中華人民共和国", 15000000, 15000000000),
        ("BRA", "ブラジル", 14500000, 14500000000),
        ("EU", "EU", 13000000, 13000000000),
        ("IND", "インド", 4700000, 4700000000),
    ], "AgriChart_Dummy"),
    ("Tuna_production.csv", "Tuna", "fish", [
        ("IDN", "インドネシア", 1200000, 12000000000),
        ("JPN", "日本", 450000, 4500000000),
        ("PHL", "フィリピン", 380000, 3800000000),
        ("PNG", "パプアニューギニア", 320000, 3200000000),
        ("ESP", "スペイン", 280000, 2800000000),
    ], "AgriChart_Dummy"),
    ("Salmon_production.csv", "Salmon", "fish", [
        ("NOR", "ノルウェー", 1400000, 14000000000),
        ("CHL", "チリ", 1100000, 11000000000),
        ("CHN", "中華人民共和国", 180000, 1800000000),
        ("CAN", "カナダ", 170000, 1700000000),
        ("GBR", "英国", 160000, 1600000000),
    ], "AgriChart_Dummy"),
    ("Shrimp_production.csv", "Shrimp", "fish", [
        ("CHN", "中華人民共和国", 1800000, 18000000000),
        ("IDN", "インドネシア", 920000, 9200000000),
        ("ECU", "エクアドル", 580000, 5800000000),
        ("IND", "インド", 710000, 7100000000),
        ("VNM", "ベトナム", 720000, 7200000000),
    ], "AgriChart_Dummy"),
]

if __name__ == "__main__":
    for filename, resource, parent, rows in METAL:
        write_csv(filename, resource, parent, rows, subdir="MetalChart/import")
    for item in AGRI:
        filename, resource, parent, rows, source = item
        write_csv(filename, resource, parent, rows, source, subdir="AgriChart/import")
    for filename, resource, parent, rows in METAL_PRODUCTION:
        write_csv(filename, resource, parent, rows, subdir="MetalChart/production")
    for item in AGRI_PRODUCTION:
        filename, resource, parent, rows, source = item
        write_csv(filename, resource, parent, rows, source, subdir="AgriChart/production")
    print("Done. 2010-2025 data written to MetalChart/import, MetalChart/production, AgriChart/import, AgriChart/production.")
