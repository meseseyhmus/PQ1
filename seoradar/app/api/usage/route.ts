import { NextRequest, NextResponse } from "next/server";
import { getUsage } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clientKey(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "local";
}

export async function GET(req: NextRequest) {
  const usage = getUsage(clientKey(req));
  return NextResponse.json({
    ok: true,
    usage,
    plan: req.headers.get("x-seoradar-plan") === "pro" ? "pro" : "free",
  });
}