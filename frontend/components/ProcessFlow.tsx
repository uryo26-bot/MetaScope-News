"use client";

import { useState, useEffect } from "react";
import { ProcessStepDetail } from "../types/types";
import { FuriganaText } from "./Furigana";

const INTERVAL_MS = 3000;

interface ProcessFlowProps {
  steps: ProcessStepDetail[];
  furiganaEnabled: boolean;
  borderColor: string;
}

export function ProcessFlow({ steps, furiganaEnabled, borderColor }: ProcessFlowProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (steps.length === 0) return;
    const id = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % steps.length);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, [steps.length]);

  const handleStepClick = (index: number) => {
    setActiveIndex(index);
  };

  return (
    <div className="w-full flex flex-col min-h-0">
      <div className="flex flex-col gap-5 flex-1 min-h-0 overflow-hidden pt-6">
        {steps.map((step, index) => {
          const isSelected = index === activeIndex;
          const borderColorStyle = isSelected ? borderColor : borderColor + "99";
          const descBorderColor = borderColor + "40";
          return (
            <button
              key={index}
              type="button"
              onClick={() => handleStepClick(index)}
              className="w-full flex gap-4 p-3 rounded-xl bg-white shadow-sm text-left transition-colors duration-200 border-4"
              style={{ borderColor: borderColorStyle }}
            >
              <div
                className="w-14 h-14 shrink-0 flex items-center justify-center text-3xl bg-white rounded-full border-2 shadow-sm"
                style={{ borderColor }}
              >
                {step.icon}
              </div>
              <div className="flex-1 flex flex-col gap-2 min-w-0">
                <div className="font-bold text-base py-1 shrink-0 text-slate-800">
                  <FuriganaText enabled={furiganaEnabled}>{step.name}</FuriganaText>
                </div>
                <div
                  className="min-h-[3.5rem] overflow-y-auto border-t pt-2"
                  style={{ borderTopColor: descBorderColor }}
                >
                  <p
                    className={`text-sm text-slate-700 ${isSelected ? "font-semibold" : ""}`}
                  >
                    <FuriganaText enabled={furiganaEnabled}>{step.description}</FuriganaText>
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
