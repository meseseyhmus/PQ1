import { NextRequest, NextResponse } from "next/server";
import { analyzeUrl } from "@/lib/analyze";
import { consume, getUsage } from "@/lib/rateLimit";
import { isValidUrl, normalizeUrl } from "@/lib/format";
import type { AnalysisResult, AnalyzeError } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * İstemci anahtarı — günlük kullanım kotasına göre.
 *
 * BİLİNEN SINIR (Orta önem): X-Forwarded-For / X-Real-IP başlıkları istemci
 * tarafından taklit edilebilir; doğrudan gelen bir istemci sahte başlıkla
 * her çağrıda "yeni" bir anahtar üretip kotayı aşabilir. Next.js route
 * içinden soket adresine güvenilir erişim yoktur; doğru çözüm ters vekilin
 * (ör. nginx/CDN) bu başlıkları zorla üzerine yazması VE sayacın Redis/KV'ye
 * taşınmasıdır. Mevcut bellek-içi sayaç zaten süreç yeniden başlayınca
 * sıfırlandığından bu, tek-kişilik demo için kabul edilmiş bir sınırdır.
 */
function clientKey(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "local";
}

function jsonError(
  message: string,
  code: AnalyzeError["code"],
  status: number
) {
  const body: AnalyzeError = { error: message, code };
  return NextResponse.json(body, { status });
}

export async function POST(req: NextRequest) {
  let payload: { url?: string };
  try {
    payload = await req.json();
  } catch {
    return jsonError("Geçersiz JSON gövdesi.", "INVALID_URL", 400);
  }

  const raw = payload?.url ?? "";
  if (!raw || typeof raw !== "string" || !isValidUrl(raw)) {
    return jsonError(
      "Geçerli bir URL girin (örn. https://ornek.com).",
      "INVALID_URL",
      400
    );
  }

  const key = clientKey(req);
  const usage = getUsage(key);
  const pro = req.headers.get("x-seoradar-plan") === "pro";

  if (!pro && usage.used >= usage.limit) {
    return NextResponse.json(
      {
        error: `Ücretsiz günlük analiz limitine ulaştınız (${usage.limit}/${usage.limit}). Pro'ya yükselterek sınırsız analiz yapabilirsiniz.`,
        code: "RATE_LIMIT",
        dailyUsage: usage,
      } satisfies AnalyzeError & { dailyUsage: { used: number; limit: number } },
      { status: 429 }
    );
  }

  const consumption = consume(key);

  try {
    const result: AnalysisResult = await analyzeUrl(normalizeUrl(raw));
    result.plan = pro ? "pro" : "free";
    result.dailyUsage = {
      used: consumption.used,
      limit: consumption.limit,
    };
    return NextResponse.json(result);
  } catch (err) {
    // Engelli hedef (iç ağ / metadata / protokol) sözleşmedeki INVALID_URL
    // koduna haritalanır; kalan hatalar FETCH_FAILED/502 olarak döner.
    if ((err as { code?: string }).code === "BLOCKED_TARGET") {
      return jsonError(
        err instanceof Error ? err.message : "Bu adres analiz edilemez.",
        "INVALID_URL",
        400
      );
    }
    const message =
      err instanceof Error ? err.message : "Analiz sırasında beklenmeyen bir hata oluştu.";
    const code = (err as { code?: AnalyzeError["code"] }).code ?? "FETCH_FAILED";
    return jsonError(message, code, 502);
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "SeoRadar Analyze API",
    usage: getUsage("local"),
  });
}