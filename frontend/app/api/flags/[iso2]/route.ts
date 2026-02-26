import { NextResponse } from "next/server";

const FLAG_CDN = "https://flagcdn.com";
const SIZE = 64;

/** GET /api/flags/:iso2 → flagcdn の画像をプロキシ（CORS 回避） */
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ iso2: string }> }
) {
  const { iso2 } = await context.params;
  const code = iso2?.toLowerCase();
  if (!code || code.length !== 2 || !/^[a-z]{2}$/.test(code)) {
    return NextResponse.json({ error: "Invalid ISO2" }, { status: 400 });
  }
  try {
    const res = await fetch(`${FLAG_CDN}/w${SIZE}/${code}.png`, {
      cache: "no-store",
      headers: { "User-Agent": "EneChart/1.0" },
    });
    if (!res.ok) return new NextResponse(null, { status: res.status });
    const blob = await res.arrayBuffer();
    return new NextResponse(blob, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}
