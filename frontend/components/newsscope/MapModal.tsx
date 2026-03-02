"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { MapMakingStickFigure } from "./MapMakingStickFigure";

const ComposableMap = dynamic(() => import("react-simple-maps").then((m) => m.ComposableMap), {
  ssr: false,
});
const Geographies = dynamic(() => import("react-simple-maps").then((m) => m.Geographies), {
  ssr: false,
});
const Geography = dynamic(() => import("react-simple-maps").then((m) => m.Geography), {
  ssr: false,
});

const GEO_URL = "/api/countries-geojson";

type MapModalProps = {
  isOpen: boolean;
  onClose: () => void;
  subject: string;
  label: string;
  content: string;
  relatedResource: "oil" | "lng" | "coal" | "none";
  news: string;
  cachedData?: { explanation: string; countries: { name: string; role: string; type: string }[] } | null;
  isLoading?: boolean;
};

type CountryItem = {
  name: string;
  role: string;
  type: "ally" | "rival" | "neutral" | "subject";
};

type ExplainDetailResponse = {
  explanation: string;
  countries: CountryItem[];
};

/** API国名 → GeoJSONでマッチさせる名前の候補 */
const COUNTRY_MATCH_NAMES: Record<string, string[]> = {
  "United States": ["united states of america", "united states"],
  Russia: ["russian federation", "russia"],
  UK: ["united kingdom"],
  "South Korea": ["korea, republic of", "republic of korea"],
  "North Korea": ["korea, north", "dem. rep. korea"],
  UAE: ["united arab emirates"],
};

function normalize(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

function geoMatchesCountry(
  geoProps: { NAME?: string; ADMIN?: string; name?: string },
  country: CountryItem
): boolean {
  const geoNorm = normalize(geoProps.NAME ?? geoProps.ADMIN ?? geoProps.name ?? "");
  const candidates = COUNTRY_MATCH_NAMES[country.name]
    ? [normalize(country.name), ...COUNTRY_MATCH_NAMES[country.name].map(normalize)]
    : [normalize(country.name)];
  return candidates.some(
    (cn) => geoNorm === cn || geoNorm.includes(cn) || cn.includes(geoNorm)
  );
}

function getCountryForGeo(
  geoProps: { NAME?: string; ADMIN?: string; name?: string },
  countries: CountryItem[]
): CountryItem | null {
  const geoNorm = normalize(geoProps.NAME ?? geoProps.ADMIN ?? geoProps.name ?? "");
  for (const c of countries) {
    const candidates = COUNTRY_MATCH_NAMES[c.name]
      ? [normalize(c.name), ...COUNTRY_MATCH_NAMES[c.name].map(normalize)]
      : [normalize(c.name)];
    const matched = candidates.some(
      (cn) => geoNorm === cn || geoNorm.includes(cn) || cn.includes(geoNorm)
    );
    if (matched) return c;
  }
  return null;
}

function getCountryFill(
  geoProps: { NAME?: string; ADMIN?: string; name?: string },
  countries: CountryItem[],
  hoveredCountry: CountryItem | null
): { fill: string; opacity: number } {
  const geoNorm = normalize(geoProps.NAME ?? geoProps.ADMIN ?? geoProps.name ?? "");
  const baseFill = "#3f3f46";

  if (hoveredCountry && geoMatchesCountry(geoProps, hoveredCountry)) {
    return { fill: getColorByType(hoveredCountry.type), opacity: 1 };
  }

  for (const c of countries) {
    const candidates = COUNTRY_MATCH_NAMES[c.name]
      ? [normalize(c.name), ...COUNTRY_MATCH_NAMES[c.name].map(normalize)]
      : [normalize(c.name)];
    const matched = candidates.some(
      (cn) => geoNorm === cn || geoNorm.includes(cn) || cn.includes(geoNorm)
    );
    if (matched) {
      const opacity = hoveredCountry ? 0.4 : 1;
      return { fill: getColorByType(c.type), opacity };
    }
  }
  return { fill: baseFill, opacity: hoveredCountry ? 0.5 : 1 };
}

function getColorByType(type: CountryItem["type"]): string {
  switch (type) {
    case "ally":
      return "#22c55e";
    case "rival":
      return "#ef4444";
    case "subject":
      return "#F59E0B";
    case "neutral":
    default:
      return "#71717a";
  }
}

export function MapModal({
  isOpen,
  onClose,
  subject,
  label,
  content,
  news,
  cachedData,
  isLoading = false,
}: MapModalProps) {
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<string>("");
  const [countries, setCountries] = useState<CountryItem[]>([]);
  const useCached = Boolean(cachedData);
  const displayExplanation = useCached ? (cachedData?.explanation ?? "") : explanation;
  const displayCountries = useCached
    ? (cachedData?.countries ?? []).map((c) => ({
        name: c.name,
        role: c.role,
        type: c.type as CountryItem["type"],
      }))
    : countries;
  /** 親のバックグラウンド取得中、またはモーダル自身の取得中（未キャッシュ時）*/
  const showMapMakingLoading = !cachedData && (isLoading || loading);
  const [hoveredCountry, setHoveredCountry] = useState<CountryItem | null>(null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    country: CountryItem;
    geoName: string;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapSize, setMapSize] = useState({ width: 720, height: 560 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      setMapSize({ width: el.clientWidth || 720, height: el.clientHeight || 560 });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [isOpen, loading, displayCountries.length]);

  const fetchDetail = useCallback(async () => {
    if (!content || !news || cachedData) return;
    setLoading(true);
    setExplanation("");
    setCountries([]);
    setHoveredCountry(null);
    setTooltip(null);
    try {
      const res = await fetch("/api/explain-detail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          lens: label === "国内政治" ? "domestic" : label === "国際政治" ? "international" : "economic",
          content,
          news,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: ExplainDetailResponse = await res.json();
      setExplanation(data.explanation ?? "");
      setCountries(data.countries ?? []);
    } catch (e) {
      console.error(e);
      setExplanation("詳細の取得に失敗しました。");
    } finally {
      setLoading(false);
    }
  }, [subject, label, content, news, cachedData]);

  useEffect(() => {
    if (isOpen && content && news && !cachedData && !isLoading) {
      fetchDetail();
    }
  }, [isOpen, content, news, cachedData, isLoading, fetchDetail]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="map-modal-title"
    >
      <div
        className="relative flex h-[90vh] w-full max-w-[1200px] overflow-hidden rounded-xl border border-zinc-600 bg-zinc-900 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 左側 40% */}
        <div className="flex w-[40%] min-w-0 flex-col border-r border-zinc-700">
          {/* ヘッダー */}
          <div className="flex shrink-0 items-center justify-between border-b border-zinc-700 px-4 py-3">
            <h2 id="map-modal-title" className="text-base font-semibold text-zinc-100">
              {subject} の {label}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded p-2 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
              aria-label="閉じる"
            >
              <span className="text-xl leading-none">×</span>
            </button>
          </div>

          {/* 説明文 */}
          <div className="shrink-0 border-b border-zinc-700 px-4 py-4">
            {showMapMakingLoading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-8">
                <MapMakingStickFigure />
                <p className="text-sm text-zinc-400">地図で整理中</p>
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center py-8">
                <span
                  className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-zinc-500 border-t-zinc-200"
                  aria-hidden
                />
              </div>
            ) : displayExplanation ? (
              <p className="text-sm leading-relaxed text-zinc-300">{displayExplanation}</p>
            ) : null}
          </div>

          {/* 国リスト */}
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            {!showMapMakingLoading && !loading && displayCountries.length > 0 && (
              <div className="space-y-2">
                <p className="mb-2 text-xs font-medium text-zinc-500">関連する国</p>
                {displayCountries.map((c) => (
                  <div
                    key={`${c.name}-${c.role}`}
                    onMouseEnter={() => setHoveredCountry(c)}
                    onMouseLeave={() => setHoveredCountry(null)}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-zinc-800"
                  >
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: getColorByType(c.type) }}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-zinc-200">
                        {c.name}
                      </span>
                      <span className="block text-xs text-zinc-400">{c.role}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 右側 60% - 地図 */}
        <div
          ref={containerRef}
          className="relative flex min-h-0 w-[60%] flex-col bg-zinc-800"
        >
          {!showMapMakingLoading && !loading && displayCountries.length > 0 ? (
            <div className="relative h-full w-full">
              <ComposableMap
                projection="geoMercator"
                projectionConfig={{ scale: 140, center: [20, 20] }}
                width={mapSize.width}
                height={mapSize.height}
                style={{ width: "100%", height: "100%" }}
                className="h-full w-full"
              >
                <Geographies geography={GEO_URL}>
                  {({ geographies }) =>
                    geographies.map((geo) => {
                      const props = geo.properties as { NAME?: string; ADMIN?: string };
                      const country = getCountryForGeo(props, displayCountries);
                      const { fill, opacity } = getCountryFill(props, displayCountries, hoveredCountry);
                      const isHovered = hoveredCountry && country && hoveredCountry.name === country.name;

                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          fill={fill}
                          fillOpacity={opacity}
                          stroke={isHovered ? "#fbbf24" : "#52525b"}
                          strokeWidth={isHovered ? 1.5 : 0.5}
                          style={{
                            default: { outline: "none", cursor: country ? "pointer" : "default" },
                            hover: { outline: "none", opacity: 1 },
                            pressed: { outline: "none" },
                          }}
                          onMouseEnter={(e) => {
                            if (country && containerRef.current) {
                              const rect = containerRef.current.getBoundingClientRect();
                              setTooltip({
                                x: e.clientX - rect.left,
                                y: e.clientY - rect.top,
                                country,
                                geoName: props.NAME ?? props.ADMIN ?? country.name,
                              });
                            }
                          }}
                          onMouseMove={(e) => {
                            if (country && containerRef.current) {
                              const rect = containerRef.current.getBoundingClientRect();
                              setTooltip((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      x: e.clientX - rect.left,
                                      y: e.clientY - rect.top,
                                    }
                                  : null
                              );
                            }
                          }}
                          onMouseLeave={() => setTooltip(null)}
                        />
                      );
                    })
                  }
                </Geographies>
              </ComposableMap>

              {/* ツールチップ */}
              {tooltip && (
                <div
                  className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full"
                  style={{
                    left: tooltip.x,
                    top: tooltip.y,
                    marginTop: -8,
                  }}
                >
                  <div className="rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 shadow-lg">
                    <p className="text-sm font-medium text-zinc-100">{tooltip.geoName}</p>
                    <p className="text-xs text-zinc-400">{tooltip.country.role}</p>
                  </div>
                </div>
              )}
            </div>
          ) : !showMapMakingLoading && !loading && displayCountries.length === 0 && displayExplanation ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-zinc-500">地図に表示する国がありません</p>
            </div>
          ) : showMapMakingLoading ? (
            <div className="flex h-full flex-col items-center justify-center gap-4">
              <MapMakingStickFigure />
              <p className="text-sm text-zinc-400">地図で整理中</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
