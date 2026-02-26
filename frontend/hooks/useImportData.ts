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

/** 石炭・石油・天然ガスの輸入元割合（backend extractedData_AFpercentage を使用） */
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
        setImportData(withFlag);
      })
      .catch((err) => {
        console.error(err);
        setError(err?.message ?? "Failed to fetch import data");
        setImportData([]);
      })
      .finally(() => setLoading(false));
  }, [selectedSource, year]);

  return { importData, loading, error };
}
