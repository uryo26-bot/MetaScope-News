// src/components/ProcessStep.tsx
"use client";

import type { ProcessStepProps } from "../types/types";

export function ProcessStep({ label, icon }: ProcessStepProps) {
  return (
    <div className="flex flex-col items-center justify-center px-2">
      <span className="text-2xl">{icon}</span>
      <span className="text-sm font-bold">{label}</span>
    </div>
  );
}
