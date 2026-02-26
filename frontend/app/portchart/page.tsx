import { Suspense } from "react";
import { PortChartClient } from "@/components/portchart/PortChartClient";

export default function PortChartPage() {
  return (
    <div className="flex h-screen w-full flex-col overflow-hidden">
      <div className="min-h-0 flex-1 overflow-hidden">
        <Suspense fallback={<div className="flex h-full min-h-[400px] items-center justify-center text-slate-500">読み込み中...</div>}>
          <PortChartClient />
        </Suspense>
      </div>
    </div>
  );
}
