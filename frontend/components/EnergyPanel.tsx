"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  CartesianGrid,
  Cell,
} from "recharts";

import type {FeatureItemProps, ProcessStepProps, Energy, EnergyPanelProps} from "../types/types";
import type {ImportData} from "../types/types";


function FeatureItem({ label, icon, trend, color }: FeatureItemProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-2 rounded-lg shadow-sm border border-white ${color}`}>
      <span className="text-4xl">{icon}</span>
      <span className="text-xl font-bold">{label}</span>
      <span className="text-2xl">{trend}</span>
    </div>
  );
}

function ProcessStep({ icon, label }: ProcessStepProps) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-2xl">{icon}</span>
      <span className="text-xs mt-1">{label}</span>
    </div>
  );
}

export function EnergyPanel({ energy, importData, color = "#ccc", onClose }: EnergyPanelProps) {
  if (!energy) return null;

  return (
    <div
      className="absolute top-4 right-4 p-6 rounded shadow-lg text-black w-[1000px] h-[600px]"
      style={{
        borderColor: color,
        borderWidth: "4px",
        borderStyle: "solid",
        backgroundColor: "#ffffff",
        fontFamily: "Zen Maru Gothic",
        overflowY: "auto",
        position: "absolute",
        zIndex: 10,
      }}
    >
      <h2
        className="text-xl font-bold mb-2 p-2 rounded"
        style={{ backgroundColor: color, color: "#ffffff" }}
      >
        {energy.source}
      </h2>
      <p className="text-gray-700">{energy.description}</p>

      {/* 特徴セクション */}
      <div className="mb-6 rounded-lg p-1 border-2" style={{ borderColor: color }}>
        <h3 className="text-xl font-bold b-2 p-2" style={{ color }}>
          特徴
        </h3>
        <div className="w-full grid grid-cols-3 gap-6">
          {energy.features?.map((f: FeatureItemProps, i: number) => (
            <FeatureItem key={i} {...f} />
          ))}
        </div>
      </div>

      {/* 輸入割合（小さなBarChart） */}
      <div className="mb-6 rounded-lg p-1 border-2" style={{ borderColor: color }}>
        <h3 className="text-xl font-bold b-2 p-2" style={{ color }}>
          輸入割合
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={importData}
            layout="vertical"
            margin={{ top: 20, right: 60, left: 60, bottom: 20 }}
          >
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="country" tick={{ fontSize: 12, fill: color }} />
            <Bar dataKey="percentage" fill={color} radius={[0, 4, 4, 0]}>
              <LabelList
                dataKey="percentage"
                position="right"
                formatter={(value: any) => `${value}%`}
                style={{ fill: color, fontWeight: "bold", fontSize: 14 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 供給プロセス */}
      <div className="flex items-center justify-between text-sm rounded-lg p-1 border" style={{ borderColor: color, color }}>
        <h3 className="text-xl font-bold b-2 p-2" style={{ color }}>
          供給プロセス
        </h3>
        {energy.process?.map((p: ProcessStepProps, i: number) => (
          <ProcessStep key={i} {...p} />
        ))}
      </div>

      <button className="mt-4 px-4 py-2 bg-gray-300 rounded" onClick={onClose}>
        閉じる
      </button>
    </div>
  );
}



