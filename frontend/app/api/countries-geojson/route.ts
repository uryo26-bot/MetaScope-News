import { NextResponse } from "next/server";

const COUNTRIES_GEOJSON_URL =
  "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson";

export async function GET() {
  try {
    const res = await fetch(COUNTRIES_GEOJSON_URL, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) throw new Error("Failed to fetch countries GeoJSON");
    const geojson = await res.json();
    return NextResponse.json(geojson);
  } catch (err) {
    console.error("Countries GeoJSON fetch error:", err);
    return NextResponse.json(
      { type: "FeatureCollection", features: [] },
      { status: 200 }
    );
  }
}
