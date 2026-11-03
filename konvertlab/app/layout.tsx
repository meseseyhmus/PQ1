import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "latin-ext"] });

const SITE_URL = "https://konvertlab.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "KonvertLab — Ücretsiz Doküman Dönüştürücü",
    template: "%s | KonvertLab",
  },
  description:
    "TXT, PDF, Markdown ve YouTube altyazılarını tarayıcınızda ücretsiz dönüştürün. Dosyalarınız sunucuya yüklenmez.",
  keywords: [
    "txt pdf dönüştürücü",
    "pdf txt",
    "pdf metin çıkarma",
    "altyazı temizleme",
    "srt txt",
    "youtube altyazı",
    "ücretsiz dönüştürücü",
    "çevrimiçi pdf aracı",
  ],
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: SITE_URL,
    siteName: "KonvertLab",
    title: "KonvertLab — Ücretsiz Doküman Dönüştürücü",
    description:
      "TXT ↔ PDF, PDF metin çıkarma ve YouTube altyazı temizleme. %100 tarayıcı tarafında; dosyalar sunucuya yüklenmez.",
  },
  twitter: {
    card: "summary_large_image",
    title: "KonvertLab — Ücretsiz Doküman Dönüştürücü",
    description:
      "TXT ↔ PDF, PDF metin çıkarma ve YouTube altyazı temizleme. %100 tarayıcı tarafında; dosyalar sunucuya yüklenmez.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

/**
 * JSON-LD (schema.org) — WebSite + SoftwareApplication ikilisi.
 * "Gizlilik: dosya yüklenmez" iddiasını yapısal olarak da taşır.
 */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "KonvertLab",
      description:
        "TXT, PDF ve YouTube altyazılarını tarayıcıda ücretsiz dönüştüren doküman aracı.",
      inLanguage: "tr-TR",
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/#app`,
      name: "KonvertLab",
      url: SITE_URL,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      inLanguage: "tr-TR",
      description:
        "TXT → PDF, PDF → TXT ve YouTube altyazı temizleme araçları. Tüm dönüşümler tarayıcınızda çalışır; hiçbir dosya sunucuya yüklenmez.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "TRY",
        description: "Ücretsiz temel dönüşümler; toplu dönüşüm Pro kilidi.",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" className="dark">
      <body className={`${inter.className} min-h-screen bg-slate-950 text-slate-200 antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}