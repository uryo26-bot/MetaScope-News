"use client";

import { usePathname } from "next/navigation";
import { FuriganaProvider } from "../contexts/FuriganaContext";
import { Header } from "./Header";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPortChart = pathname?.startsWith("/portchart");

  return (
    <FuriganaProvider>
      <div className={isPortChart ? "h-screen min-h-0 overflow-hidden bg-gray-50" : "min-h-screen bg-gray-50"}>
        {!isPortChart && <Header />}
        {children}
      </div>
    </FuriganaProvider>
  );
}
