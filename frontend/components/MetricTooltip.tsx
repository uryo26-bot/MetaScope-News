"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { FuriganaText } from "./Furigana";

interface MetricTooltipProps {
  description: string;
  furiganaEnabled: boolean;
}

export function MetricTooltip({ description, furiganaEnabled }: MetricTooltipProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="cursor-help"
      >
        <Info className="w-4 h-4 text-gray-500 hover:text-blue-600 transition-colors" />
      </div>

      {isHovered && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg z-10">
          <FuriganaText enabled={furiganaEnabled}>{description}</FuriganaText>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
}
