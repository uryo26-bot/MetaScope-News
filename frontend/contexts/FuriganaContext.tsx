"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type FuriganaContextValue = {
  enabled: boolean;
  setEnabled: (v: boolean) => void;
};

const FuriganaContext = createContext<FuriganaContextValue | null>(null);

export function FuriganaProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  return (
    <FuriganaContext.Provider value={{ enabled, setEnabled }}>
      {children}
    </FuriganaContext.Provider>
  );
}

export function useFurigana(): FuriganaContextValue {
  const ctx = useContext(FuriganaContext);
  if (!ctx) throw new Error("useFurigana must be used within FuriganaProvider");
  return ctx;
}
