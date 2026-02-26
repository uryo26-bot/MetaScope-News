import { NextResponse } from "next/server";

const FLAG_CDN = "https://flagcdn.com";
const SIZE = 64;

/** 国旗画像を flagcdn.com 経由で取得しプロキシ（CORS 回避）。?iso2=xx で指定 */
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const iso2 = searchParams.get("iso2");
    const code = iso2?.toLowerCase();
    if (!code || code.length !== 2 || !/^[a-z]{2}$/.test(code)) {
      return NextResponse.json({ error: "Invalid ISO2" }, { status: 400 });
    }
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
