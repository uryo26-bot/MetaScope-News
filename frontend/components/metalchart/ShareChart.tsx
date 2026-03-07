"use client";

import {
  PieChart,
  Pie,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";

const PIE_COLORS = ["#64748b", "#94a3b8", "#cbd5e1", "#e2e8f0", "#f1f5f9"];

export type ShareItem = { country: string; value: number };

interface ShareChartProps {
  title: string;
  data: ShareItem[];
  /** タイトル右側に表示する要素（例: PortChart へのリンク） */
  action?: React.ReactNode;
}

export function ShareChart({ title, data, action }: ShareChartProps) {
  const chartData = data.map((d) => ({ name: d.country, value: d.value }));

  return (
    <div className="bg-gray-100 rounded-2xl shadow-md p-6 h-full flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wide">{title}</h3>
        {action}
      </div>
      <div className="flex-1 min-w-0" style={{ minWidth: 280, height: 260 }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={280} minHeight={240}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={0}
              outerRadius="75%"
              paddingAngle={1}
              startAngle={90}
              label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(1)}%`}
              labelLine={{ stroke: "#64748b", strokeWidth: 1 }}
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="#fff" strokeWidth={1.5} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => [`${value}%`, "割合"]} />
            <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ fontSize: 12 }} formatter={(value, entry: { payload?: { value?: number } }) => <span className="text-slate-700">{value}（{entry?.payload?.value ?? 0}%）</span>} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
