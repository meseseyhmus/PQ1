import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "SeoRadar — Ücretsiz SEO Analiz Aracı";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background:
            "linear-gradient(135deg, #0b1220 0%, #142757 42%, #1b69f5 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "rgba(255,255,255,0.14)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(255,255,255,0.25)",
            }}
          >
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="8" stroke="white" strokeWidth="1.8" opacity="0.6" />
              <circle cx="12" cy="12" r="4" stroke="white" strokeWidth="1.8" />
              <path d="M12 12 L18 6" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: -0.5 }}>
              SeoRadar
            </div>
            <div style={{ fontSize: 18, opacity: 0.75, letterSpacing: 2, textTransform: "uppercase" }}>
              SEO Analiz Platformu
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div
            style={{
              fontSize: 76,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -2,
              maxWidth: 980,
            }}
          >
            Web sitenizin SEO sağlığını 30 saniyede öğrenin
          </div>
          <div style={{ fontSize: 30, opacity: 0.82, maxWidth: 900, lineHeight: 1.35 }}>
            0–100 skor · kırık link taraması · teknik SEO · PDF rapor
          </div>
        </div>

        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          {["Ücretsiz analiz", "3 tarama / gün", "Kredi kartı gerekmez"].map((t) => (
            <div
              key={t}
              style={{
                padding: "12px 22px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.22)",
                fontSize: 22,
              }}
            >
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}