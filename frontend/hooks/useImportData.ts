"use client";
import { useEffect, useState } from "react";
import { ImportData } from "../types/types";

/** 国コード→旗のマッピング（輸入元表示用） */
const COUNTRY_FLAGS: Record<string, string> = {
  AUS: "🇦🇺", IDN: "🇮🇩", MYS: "🇲🇾", QAT: "🇶🇦", RUS: "🇷🇺", ARE: "🇦🇪", USA: "🇺🇸",
  SAU: "🇸🇦", KWT: "🇰🇼", BRN: "🇧🇳", OMN: "🇴🇲", CHN: "🇨🇳", SGP: "🇸🇬", CAN: "🇨🇦",
  PER: "🇵🇪", NGA: "🇳🇬", PNG: "🇵🇬", PHL: "🇵🇭", IND: "🇮🇳", VNM: "🇻🇳", MMR: "🇲🇲",
  ZAF: "🇿🇦", COL: "🇨🇴", MEX: "🇲🇽", GNB: "🇬🇼", MOZ: "🇲🇿", IRQ: "🇮🇶",
  IRN: "🇮🇷", KOR: "🇰🇷", THA: "🇹🇭", TWN: "🇹🇼", GBR: "🇬🇧", NLD: "🇳🇱", ITA: "🇮🇹",
};

/** モジュールレベルキャッシュ：同じ energyType+year では初回のみフェッチ */
const importDataCache: Record<string, ImportData[] | { error: string }> = {};

/** 石炭・石油・天然ガスの輸入元割合（backend extractedData_AFpercentage を使用）
 * 初回ロードのみフェッチ。供給プロセス更新時などの再フェッチを防ぐ */
export function useImportData(
  selectedSource: "lng" | "coal" | "oil" | null,
  year: number
) {
  const [importData, setImportData] = useState<ImportData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedSource) {
      setImportData([]);
      setLoading(false);
      setError(null);
      return;
    }
    const key = `${selectedSource}-${year}`;
    const cached = importDataCache[key];
    if (cached) {
      if ("error" in cached) {
        setError(cached.error);
        setImportData([]);
      } else {
        setImportData(cached);
        setError(null);
      }
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    fetch(`/api/import-data/${selectedSource}?year=${year}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((data: Array<{ country: string; percentage: number; countryCode?: string }>) => {
        const withFlag: ImportData[] = data.map((d) => ({
          country: d.country,
          percentage: d.percentage,
          countryCode: d.countryCode,
          flag: d.countryCode ? COUNTRY_FLAGS[d.countryCode] ?? "🌍" : "🌍",
        }));
        importDataCache[key] = withFlag;
        setImportData(withFlag);
      })
      .catch((err) => {
        console.error(err);
        const errMsg = err?.message ?? "Failed to fetch import data";
        importDataCache[key] = { error: errMsg };
        setError(errMsg);
        setImportData([]);
      })
      .finally(() => setLoading(false));
  }, [selectedSource, year]);

  return { importData, loading, error };
}
