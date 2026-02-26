"use client";

import { EneChart } from "./EneChart";
import { FuriganaText } from "./Furigana";
import { useEnergyData } from "../hooks/useEnergyData";
import { useFurigana } from "../contexts/FuriganaContext";

export default function HomeClient() {
  const { enabled: furiganaEnabled } = useFurigana();
  const { energyData, loading, error } = useEnergyData();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl font-bold">
          <FuriganaText enabled={furiganaEnabled}>読み込み中...</FuriganaText>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl font-bold text-red-600">
          <FuriganaText enabled={furiganaEnabled}>{`エラー: ${error}`}</FuriganaText>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto">
      <EneChart energyData={energyData} furiganaEnabled={furiganaEnabled} />
    </main>
  );
}
