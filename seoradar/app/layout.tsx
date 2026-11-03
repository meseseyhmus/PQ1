import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-inter",
});

const SITE_URL = "https://seoradar.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "SeoRadar — Ücretsiz SEO Analiz Aracı",
    template: "%s | SeoRadar",
  },
  description:
    "Web sitenizin SEO skorunu ücretsiz hesaplayın. On-Page kontroller, teknik SEO, kırık link taraması ve detaylı PDF rapor.",
  keywords: [
    "seo analiz",
    "seo aracı",
    "site analizi",
    "kırık link kontrol",
    "seo skoru",
    "pdf seo raporu",
  ],
  openGraph: {
    title: "SeoRadar — Ücretsiz SEO Analiz Aracı",
    description:
      "URL girin, saniyeler içinde 0–100 SEO skoru, kritik hatalar ve nasıl çözülür önerileri alın.",
    type: "website",
    locale: "tr_TR",
    url: SITE_URL,
    siteName: "SeoRadar",
  },
  twitter: {
    card: "summary_large_image",
    title: "SeoRadar — Ücretsiz SEO Analiz Aracı",
    description:
      "URL girin, saniyeler içinde 0–100 SEO skoru, kritik hatalar ve nasıl çözülür önerileri alın.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

/**
 * JSON-LD (schema.org) — arama motorları için makine-okunur kimlik.
 * WebSite + SoftwareApplication ikilisi hem markayı hem aracı tanıtır.
 */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "SeoRadar",
      description:
        "Web siteleri için ücretsiz SEO analiz aracı: 20 otomatik kontrol, 0–100 skor ve PDF rapor.",
      inLanguage: "tr-TR",
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/#app`,
      name: "SeoRadar",
      url: SITE_URL,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      inLanguage: "tr-TR",
      description:
        "URL girin; başlık, meta açıklama, başlık hiyerarşisi, alt metinler ve bağlantılar dahil 20 SEO kontrolü çalışsın. 0–100 ağırlıklı skor ve PDF rapor üretir.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "TRY",
        description: "Ücretsiz plan günde 3 analiz; Pro 149₺/ay.",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" className={inter.variable}>
      <body className="min-h-screen font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}