import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const BASE_URL = "https://parselya.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Parselya — Arsa & Parsel Video Animasyon Editörü",
    template: "%s | Parselya",
  },
  description:
    "Ada ve parsel bilgisiyle uydu üzerinde arsa sınırlarını otomatik çizin, kamera animasyonu ekleyin ve sosyal medya reels/video formatında dışa aktarın. Tümü tarayıcınızda, çevrimdışı çalışır.",
  keywords: [
    "parsel",
    "ada",
    "uydu",
    "emlak videosu",
    "reels",
    "arsa",
    "animasyon",
    "arsa video",
    "parsel animasyon",
    "uydu görüntüsü",
    "emlak reels",
    "video editör",
  ],
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: BASE_URL,
    siteName: "Parselya",
    title: "Parselya — Arsa & Parsel Video Animasyon Editörü",
    description:
      "Ada ve parsel bilgisiyle uydu üzerinde arsa sınırlarını otomatik çizin, kamera animasyonu ekleyin ve sosyal medya reels/video formatında dışa aktarın.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Parselya — Arsa & Parsel Video Animasyon Editörü",
    description:
      "Ada ve parsel bilgisiyle uydu üzerinde arsa sınırlarını otomatik çizin, kamera animasyonu ekleyin ve sosyal medya reels/video formatında dışa aktarın.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${BASE_URL}/#website`,
      url: BASE_URL,
      name: "Parselya",
      description:
        "Ada ve parsel bilgisiyle uydu üzerinde arsa sınırlarını otomatik çizen, kamera animasyonu ekleyen ve sosyal medya videoları üreten çevrimiçi editör.",
      inLanguage: "tr",
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${BASE_URL}/#app`,
      name: "Parselya",
      url: BASE_URL,
      applicationCategory: "MultimediaApplication",
      operatingSystem: "Web",
      inLanguage: "tr",
      description:
        "Ada ve parsel bilgisiyle uydu üzerinde arsa sınırlarını otomatik çizen, kamera animasyonu ekleyen ve sosyal medya reels/video formatında dışa aktaran tarayıcı tabanlı editör.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "TRY",
        description: "Ücretsiz başlangıç, kredi sistemiyle devam.",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="dark">
      <body className={inter.className}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
