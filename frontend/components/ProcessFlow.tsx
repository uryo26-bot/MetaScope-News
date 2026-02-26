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
        {/* ステップ（3秒ごとに選択状態が切り替わる疑似的アニメーション + クリックでジャンプ） */}
        {steps.map((step, index) => {
          const isSelected = index === activeIndex;
          return (
            <button
              key={index}
              type="button"
              onClick={() => handleStepClick(index)}
              className={`w-full flex gap-4 p-3 rounded-xl bg-white shadow-sm text-left transition-all duration-200 ${
                isSelected ? "border-4" : "border-2"
              }`}
              style={{ borderColor: isSelected ? borderColor : `${borderColor}99` }}
            >
              <div
                className="w-14 h-14 shrink-0 flex items-center justify-center text-3xl bg-white rounded-full border-2 shadow-sm"
                style={{ borderColor }}
              >
                {step.icon}
              </div>
              <div className="flex-1 flex flex-col gap-2 min-w-0">
                <div className="font-bold text-base py-1">
                  <FuriganaText enabled={furiganaEnabled}>{step.name}</FuriganaText>
                </div>
                {/* クリック時のみ四角の内側に詳細説明を表示 */}
                {isSelected && (
                  <p
                    className="py-2 px-0 text-sm text-gray-700 border-t pt-2"
                    style={{ borderTopColor: `${borderColor}40` }}
                  >
                    <FuriganaText enabled={furiganaEnabled}>{step.description}</FuriganaText>
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
