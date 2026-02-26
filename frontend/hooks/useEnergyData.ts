"use client";

import { useEffect, useState } from "react";
import type { EnergyData } from "../types/types";

export function useEnergyData() {
  const [energyData, setEnergyData] = useState<EnergyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/energy");
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data: EnergyData[] = await res.json();
        setEnergyData(data);
      } catch (err: any) {
        console.error("API fetch error:", err);
        setError(err.message ?? "Failed to fetch energy data");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return { energyData, loading, error };
}
