"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { FuriganaText } from "./Furigana";

interface PowerInfoModalProps {
  consumption: number; // 消費電力（億kWh）
  generation: number; // 発電量（億kWh）
  year: number;
  furiganaEnabled: boolean;
}

export function PowerInfoModal({ consumption, generation, year, furiganaEnabled }: PowerInfoModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-6 py-3 rounded-lg border-2 border-blue-500 bg-gradient-to-r from-blue-50 to-green-50 hover:shadow-md transition-all"
      >
        <Info className="w-5 h-5 text-blue-600" />
        <div className="text-left">
          <div className="text-sm font-bold">
            <FuriganaText enabled={furiganaEnabled}>消費電力</FuriganaText>: {consumption}
            <FuriganaText enabled={furiganaEnabled}>億kWh</FuriganaText>
          </div>
          <div className="text-sm font-bold">
            <FuriganaText enabled={furiganaEnabled}>発電量</FuriganaText>: {generation}
            <FuriganaText enabled={furiganaEnabled}>億kWh</FuriganaText>
          </div>
        </div>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white rounded-xl p-8 max-w-2xl mx-4 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold">
                <FuriganaText enabled={furiganaEnabled}>{`${year}年 電力情報`}</FuriganaText>
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-2xl font-bold text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold mb-3">
                  <FuriganaText enabled={furiganaEnabled}>消費電力</FuriganaText>
                </h3>
                <p className="text-lg mb-2">
                  <FuriganaText enabled={furiganaEnabled}>
                    消費電力とは、日本国内で実際に使用された電気の総量です。家庭、工場、オフィスなど、すべての場所で消費された電気を合計した値です。
                  </FuriganaText>
                </p>
                <p className="text-xl font-bold text-blue-600">
                  {consumption}
                  <FuriganaText enabled={furiganaEnabled}>億kWh</FuriganaText>
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-3">
                  <FuriganaText enabled={furiganaEnabled}>発電量</FuriganaText>
                </h3>
                <p className="text-lg mb-2">
                  <FuriganaText enabled={furiganaEnabled}>
                    発電量とは、日本国内の発電所で実際に発電された電気の総量です。消費電力よりも多い場合、余剰電力が生じます。
                  </FuriganaText>
                </p>
                <p className="text-xl font-bold text-green-600">
                  {generation}
                  <FuriganaText enabled={furiganaEnabled}>億kWh</FuriganaText>
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="mt-6 px-6 py-3 bg-gray-300 rounded-lg font-bold hover:bg-gray-400 transition-all"
            >
              <FuriganaText enabled={furiganaEnabled}>閉じる</FuriganaText>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
