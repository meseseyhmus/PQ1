import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const x = searchParams.get("x");
  const y = searchParams.get("y");
  const z = searchParams.get("z");
  const source = searchParams.get("source") || "google";

  if (!x || !y || !z) {
    return new NextResponse("Missing x, y, z params", { status: 400 });
  }

  const ix = parseInt(x, 10);
  const iy = parseInt(y, 10);
  const iz = parseInt(z, 10);

  let tileUrl = "";
  if (source === "google") {
    const s = (ix + iy) % 4;
    tileUrl = `https://mt${s}.google.com/vt/lyrs=s&x=${ix}&y=${iy}&z=${iz}`;
  } else if (source === "esri") {
    tileUrl = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${iz}/${iy}/${ix}`;
  } else if (source === "osm") {
    tileUrl = `https://tile.openstreetmap.org/${iz}/${ix}/${iy}.png`;
  } else {
    tileUrl = `https://basemaps.cartocdn.com/dark_all/${iz}/${ix}/${iy}.png`;
  }

  try {
    const res = await fetch(tileUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      },
    });

    if (!res.ok) {
      return new NextResponse(`Tile server error: ${res.status}`, { status: res.status });
    }

    const contentType = res.headers.get("content-type") || "image/jpeg";
    const buffer = await res.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=604800, immutable",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal tile error";
    return new NextResponse(msg, { status: 502 });
  }
}

