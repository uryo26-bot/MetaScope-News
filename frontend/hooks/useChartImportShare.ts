"use client";

import { useEffect, useState } from "react";

export type ShareItem = { country: string; value: number; country_code?: string };

function useChartShare(
  chartType: "metalchart" | "agrichart" | "enechart",
  id: string | undefined,
  year: number,
  type: "import" | "production"
) {
  const [data, setData] = useState<ShareItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !chartType) {
      setData([]);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    fetch(`/api/chart-import/${chartType}/${encodeURIComponent(id)}?year=${year}&type=${type}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((items: ShareItem[]) => {
        setData(Array.isArray(items) ? items : []);
      })
      .catch((err) => {
        console.error(err);
        setError(err?.message ?? "Failed to fetch share data");
        setData([]);
      })
      .finally(() => setLoading(false));
  }, [chartType, id, year, type]);

  return { data, loading, error };
}

/** 日本の輸入元割合（CSV 由来・年度指定） */
export function useChartImportShare(
  chartType: "metalchart" | "agrichart" | "enechart",
  id: string | undefined,
  year: number = 2024
) {
  return useChartShare(chartType, id, year, "import");
}

/** 世界の生産国割合（CSV 由来・年度指定）。EneChart の場合は LNG 生産量（MTOE） */
export function useChartProductionShare(
  chartType: "metalchart" | "agrichart" | "enechart",
  id: string | undefined,
  year: number = 2024
) {
  return useChartShare(chartType, id, year, "production");
}
