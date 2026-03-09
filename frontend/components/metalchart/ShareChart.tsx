"use client";

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

const BAR_COLORS = ["#64748b", "#94a3b8", "#cbd5e1", "#e2e8f0", "#f1f5f9"];

/** 国名（日本語）→ ISO3。静的データ・CSV用フォールバック */
const NAME_TO_ISO3: Record<string, string> = {
  中国: "CHN", オーストラリア: "AUS", ロシア: "RUS", カナダ: "CAN", アメリカ: "USA",
  スイス: "CHE", 南アフリカ: "ZAF", "南アフリカ共和国": "ZAF", ペルー: "PER", メキシコ: "MEX", チリ: "CHL",
  ボリビア: "BOL", インドネシア: "IDN", マレーシア: "MYS", フィリピン: "PHL",
  タイ: "THA", ベトナム: "VNM", インド: "IND", ブラジル: "BRA", アルゼンチン: "ARG",
  コロンビア: "COL", エクアドル: "ECU", コンゴ民主共和国: "COD", ザンビア: "ZMB",
  ガーナ: "GHA", コートジボワール: "CIV", 日本: "JPN", 韓国: "KOR", オランダ: "NLD",
  ドイツ: "DEU", イギリス: "GBR", フランス: "FRA", イタリア: "ITA", ベルギー: "BEL",
  中華人民共和国: "CHN", アメリカ合衆国: "USA", サウジアラビア: "SAU",
  カタール: "QAT", アラブ首長国連邦: "ARE", クウェート: "KWT",
};

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
}

function getIso3ForCountry(name: string, countryCode?: string): string | null {
  if (countryCode && countryCode.length === 3) return countryCode.toUpperCase();
  if (countryCode && countryCode.length === 2) return getIso3FromIso2(countryCode);
  return NAME_TO_ISO3[name] ?? null;
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

export function ShareChart({ title, data, action, variant = "default", accentColor }: ShareChartProps) {
  const chartData = [...data]
    .map((d) => ({ name: d.country, value: d.value, country_code: (d as ShareItem).country_code }))
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

  const isEneChart = variant === "enechart" && accentColor;
  const barColors = isEneChart && accentColor
    ? [1, 0.85, 0.7, 0.55, 0.4].map((a) => withAlpha(accentColor, a))
    : BAR_COLORS;

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
      <div className="flex-1 min-w-0" style={{ minWidth: 280, height: 260 }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={280} minHeight={240}>
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
            <Bar dataKey="value" radius={[0, 4, 4, 0]} isAnimationActive={false}>
              {chartData.map((_, i) => (
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
    </div>
  );
}
