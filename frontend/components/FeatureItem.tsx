// src/components/FeatureItem.tsx
"use client";

import type { FeatureItemProps } from "../types/types";

export function FeatureItem({ label, icon, trend, color }: FeatureItemProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-2 rounded-lg shadow-sm border border-white ${color}`}
    >
      <span className="text-4xl">{icon}</span>
      <span className="text-xl font-bold">{label}</span>
      <span className="text-2xl">{trend}</span>
    </div>
  );
}