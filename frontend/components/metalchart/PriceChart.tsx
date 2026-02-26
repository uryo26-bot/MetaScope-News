"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export type PricePoint = { year: number; price: number };

interface PriceChartProps {
  data: PricePoint[];
  /** 価格の単位（例: "円/t", "円/oz"） */
  unit?: string;
}

export function PriceChart({ data, unit = "円/t" }: PriceChartProps) {
  const chartData = data.map((d) => ({ year: d.year, price: d.price }));
  const formatPrice = (v: number) =>
    v >= 10000 ? `${(v / 10000).toFixed(0)}万` : v.toLocaleString();

  return (
    <div className="bg-gray-100 rounded-2xl shadow-md p-6 h-full flex flex-col">
      <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-4">
        価格推移
      </h3>
      <div className="flex-1 min-w-0" style={{ minWidth: 320, height: 220 }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={320} minHeight={200}>
          <LineChart data={chartData} margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="year" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={formatPrice} />
            <Tooltip
              formatter={(value: number) => [typeof value === "number" ? value.toLocaleString() : value, `価格（${unit}）`]}
              labelFormatter={(label) => `${label}年`}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#475569"
              strokeWidth={2}
              dot={{ fill: "#475569" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
