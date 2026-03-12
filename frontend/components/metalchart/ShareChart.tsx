"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Cell,
} from "recharts";
import { getIso2FromIso3, getIso3FromIso2 } from "../../lib/countryFlags";
import { getIso3ByNameJa } from "../../lib/countries";

const BAR_COLORS = ["#64748b", "#94a3b8", "#cbd5e1", "#e2e8f0", "#f1f5f9"];

export type ShareItem = { country: string; value: number; country_code?: string };

/** hexにalphaを追加（0-1） */
function withAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const a = Math.round(alpha * 255).toString(16).padStart(2, "0");
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}${a}`;
}

interface ShareChartProps {
  title: string;
  data: ShareItem[];
  /** タイトル右側に表示する要素（例: PortChart へのリンク） */
  action?: React.ReactNode;
  /** EneChart用: 詳細カードのUIに合わせたスタイル */
  variant?: "default" | "enechart";
  /** EneChart用: 電源色（棒グラフ・ボーダーに使用） */
  accentColor?: string;
  /** 4か国+その他で表示し、その他クリックで全件を棒グラフ表示 */
  collapsible?: boolean;
  /** 電源割合と同じ横棒グラフ形式で表示（EneChart用） */
  powerStyleBar?: boolean;
}

function getIso3ForCountry(name: string, countryCode?: string): string | null {
  if (countryCode && countryCode.length === 3) return countryCode.toUpperCase();
  if (countryCode && countryCode.length === 2) return getIso3FromIso2(countryCode);
  return getIso3ByNameJa(name);
}

type TickProps = {
  x?: number;
  y?: number;
  payload?: { value: string };
  chartData: { name: string; value: number; country_code?: string }[];
};

function TickWithFlag(props: TickProps) {
  const { x = 0, y = 0, payload, chartData } = props;
  const name = payload?.value ?? "";
  const item = chartData.find((d) => d.name === name);
  const iso3 = item ? getIso3ForCountry(item.name, item.country_code) : null;
  const iso2 = iso3 ? getIso2FromIso3(iso3) : null;

  return (
    <g transform={`translate(${x},${y})`}>
      <foreignObject x={-150} y={-10} width={145} height={24}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            overflow: "hidden",
            fontSize: "13px",
            fontWeight: 500,
            color: "#475569",
          }}
        >
          {iso2 ? (
            <img
              src={`/flags/${iso2.toLowerCase()}.svg`}
              alt=""
              style={{
                height: 16,
                width: 24,
                flexShrink: 0,
                objectFit: "cover",
                borderRadius: 2,
              }}
              aria-hidden
            />
          ) : null}
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {name}
          </span>
        </div>
      </foreignObject>
    </g>
  );
}

export function ShareChart({
  title,
  data,
  action,
  variant = "default",
  accentColor,
  collapsible = false,
  powerStyleBar = false,
}: ShareChartProps) {
  const [showWheelView, setShowWheelView] = useState(false);

  const fullChartData = [...data]
    .map((d) => ({ name: d.country, value: d.value, country_code: (d as ShareItem).country_code }))
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

  // collapsible かつ 5件超: 4か国 + その他
  const shouldCollapse = collapsible && fullChartData.length > 4;
  const chartData = shouldCollapse
    ? [
        ...fullChartData.slice(0, 4),
        {
          name: "その他",
          value: Math.round(fullChartData.slice(4).reduce((s, d) => s + (d.value ?? 0), 0) * 100) / 100,
          country_code: "OTHER" as const,
        },
      ]
    : fullChartData;

  const isEneChart = variant === "enechart" && accentColor;
  const barColors = isEneChart && accentColor
    ? [1, 0.85, 0.7, 0.55, 0.4].map((a) => withAlpha(accentColor, a))
    : BAR_COLORS;

  const usePowerStyle = powerStyleBar && isEneChart && accentColor;

  return (
    <div
      className={`h-full flex flex-col rounded-xl p-4 ${
        isEneChart
          ? "bg-white shadow-sm border-2"
          : "bg-gray-100 rounded-2xl shadow-md p-6"
      }`}
      style={isEneChart && accentColor ? { borderColor: accentColor } : undefined}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h3
          className={
            isEneChart
              ? "text-xl font-bold"
              : "text-sm font-bold text-slate-600 uppercase tracking-wide"
          }
        >
          {title}
        </h3>
        {action}
      </div>
      <div className="flex-1 min-w-0 flex flex-col" style={{ minWidth: 280, minHeight: 280 }}>
        {usePowerStyle ? (
          <>
            <div className="space-y-2">
              {(showWheelView ? fullChartData : chartData).map((entry, index) => {
                const value = entry.value ?? 0;
                const showPercentageInside = value >= 5;
                const percentageDisplay = Math.round(value * 10) / 10;
                const iso3 = getIso3ForCountry(entry.name, entry.country_code);
                const iso2 = iso3 ? getIso2FromIso3(iso3) : null;

                return (
                  <div
                    key={`${entry.name}-${index}`}
                    className={`flex items-center gap-4 py-2 px-1 rounded ${
                      entry.name === "その他" && shouldCollapse && !showWheelView
                        ? "cursor-pointer hover:shadow-md"
                        : ""
                    }`}
                    onClick={
                      entry.name === "その他" && shouldCollapse && !showWheelView
                        ? () => setShowWheelView(true)
                        : undefined
                    }
                  >
                    <div className="min-w-[155px] w-[155px] pr-3 flex items-center gap-1.5 font-medium text-[13px] text-slate-800 shrink-0">
                      {iso2 ? (
                        <img
                          src={`/flags/${iso2.toLowerCase()}.svg`}
                          alt=""
                          className="h-4 w-6 shrink-0 rounded object-cover"
                          aria-hidden
                        />
                      ) : (
                        <span className="text-xs">🌍</span>
                      )}
                      <span className="truncate">{entry.name}</span>
                    </div>
                    <div className="w-[140px] max-w-[140px] relative h-8 bg-gray-200 rounded overflow-hidden shrink-0">
                      <div
                        className="h-full rounded flex items-center transition-all"
                        style={{
                          width: `${Math.min(value, 100)}%`,
                          backgroundColor: accentColor!,
                        }}
                      >
                        {showPercentageInside && (
                          <span className="text-white font-semibold text-xs ml-2">{percentageDisplay}%</span>
                        )}
                      </div>
                      {!showPercentageInside && (
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 font-semibold text-xs text-slate-800">
                          {percentageDisplay}%
                        </span>
                      )}
                    </div>
                    <div className="w-12 text-right font-semibold text-xs text-slate-800 shrink-0">
                      {percentageDisplay}%
                    </div>
                  </div>
                );
              })}
            </div>
            {shouldCollapse && !showWheelView && (
              <button
                type="button"
                onClick={() => setShowWheelView(true)}
                className="mt-2 flex-shrink-0 flex items-start gap-2 text-xs text-slate-600 hover:text-slate-800 py-2 px-3 rounded border border-slate-300 hover:border-slate-400 hover:bg-slate-100 cursor-pointer w-full text-left leading-snug"
              >
                <span className="shrink-0 mt-0.5">🌍</span>
                <span>クリックで全件表示</span>
              </button>
            )}
            {showWheelView && (
              <button
                type="button"
                onClick={() => setShowWheelView(false)}
                className="mt-2 py-2 px-3 text-xs text-slate-600 hover:text-slate-800 rounded border border-slate-300 hover:border-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                ← 4か国+その他に戻る
              </button>
            )}
          </>
        ) : showWheelView && fullChartData.length > 0 ? (
          <>
            <div className="min-h-[400px] max-h-[500px] overflow-y-auto">
              <ResponsiveContainer width="100%" height={Math.max(240, fullChartData.length * 36)} minWidth={280}>
                <BarChart
                  key={`full-${fullChartData.map((d) => `${d.name}:${d.value}`).join("|")}`}
                  data={fullChartData}
                  layout="vertical"
                  margin={{ top: 8, right: 48, left: 12, bottom: 8 }}
                  barCategoryGap="15%"
                >
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={165}
                    tick={<TickWithFlag chartData={fullChartData} />}
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                  />
                  <Tooltip formatter={(value: number) => [`${value}%`, "割合"]} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} isAnimationActive={false}>
                    {fullChartData.map((_, i) => (
                      <Cell key={i} fill={barColors[i % barColors.length]} />
                    ))}
                    <LabelList
                      dataKey="value"
                      position="right"
                      formatter={(value: unknown) => `${value ?? 0}%`}
                      style={{ fill: isEneChart ? accentColor : "#475569", fontWeight: 600, fontSize: 12 }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <button
              type="button"
              onClick={() => setShowWheelView(false)}
              className="mt-2 py-2 px-3 text-xs text-slate-600 hover:text-slate-800 rounded border border-slate-300 hover:border-slate-400 hover:bg-slate-100 cursor-pointer"
            >
              ← 4か国+その他に戻る
            </button>
          </>
        ) : (
          <>
            <div className="flex-1 min-h-0" style={{ minHeight: 220 }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={280} minHeight={220}>
                <BarChart
                key={chartData.map((d) => `${d.name}:${d.value}`).join("|")}
                data={chartData}
                layout="vertical"
                margin={{ top: 8, right: 48, left: 12, bottom: 8 }}
                barCategoryGap="20%"
              >
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={165}
                  tick={<TickWithFlag chartData={chartData} />}
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                />
                <Tooltip formatter={(value: number) => [`${value}%`, "割合"]} />
                <Bar
                  dataKey="value"
                  radius={[0, 4, 4, 0]}
                  isAnimationActive={false}
                  onClick={
                    shouldCollapse && chartData[4]
                      ? (_, index) => index === 4 && setShowWheelView(true)
                      : undefined
                  }
                  style={shouldCollapse && chartData[4] ? { cursor: "pointer" } : undefined}
                >
                  {chartData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={barColors[i % barColors.length]}
                      style={
                        shouldCollapse && entry.name === "その他"
                          ? { cursor: "pointer" }
                          : undefined
                      }
                    />
                  ))}
                  <LabelList
                    dataKey="value"
                    position="right"
                    formatter={(value: unknown) => `${value ?? 0}%`}
                    style={{ fill: isEneChart ? accentColor : "#475569", fontWeight: 600, fontSize: 12 }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            </div>
            {shouldCollapse && (
              <button
                type="button"
                onClick={() => setShowWheelView(true)}
                className="mt-2 flex-shrink-0 flex items-start gap-2 text-xs text-slate-600 hover:text-slate-800 py-2 px-3 rounded border border-slate-300 hover:border-slate-400 hover:bg-slate-100 cursor-pointer w-full text-left leading-snug"
              >
                <span className="shrink-0 mt-0.5">🌍</span>
                <span>
                  クリックで全件表示
                </span>
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
