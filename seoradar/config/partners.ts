export type PartnerCategory = "hosting" | "seo" | "domain" | "other";

export interface PartnerLink {
  id: string;
  name: string;
  category: PartnerCategory;
  description: string;
  href: string;
  cta: string;
}

export const CATEGORY_LABELS: Record<PartnerCategory, string> = {
  hosting: "Hosting",
  seo: "SEO Aracı",
  domain: "Alan Adı",
  other: "E-Posta",
};

export const PARTNERS: PartnerLink[] = [
  {
    id: "hizli-hosting",
    name: "Hızlı Hosting",
    category: "hosting",
    description:
      "Türkiye lokasyonlu sunucularıyla düşük gecikme süreleri sunan hosting paketi. Sayfa hızının SEO skoruna doğrudan etkisi düşünülerek NVMe disk ve LiteSpeed altyapısı ile yapılandırılmıştır.",
    href: "https://example.com/hizli-hosting?ref=seoradar",
    cta: "Hosting Paketlerini İncele",
  },
  {
    id: "bulut-sunucu",
    name: "Bulut Sunucu TR",
    category: "hosting",
    description:
      "Trafiği büyüyen siteler için ölçeklenebilir bulut altyapısı. Trafik artışlarında otomatik kaynak artırımı sayesinde kesinti yaşamadan ziyaretçi yoğunluğunu karşılar.",
    href: "https://example.com/bulut-sunucu-tr?ref=seoradar",
    cta: "Bulut Planına Geç",
  },
  {
    id: "seo-arac-seti",
    name: "SEO Araç Seti",
    category: "seo",
    description:
      "Anahtar kelime araştırması, rakip takibi ve backlink analizi tek panelde. SeoRadar raporunuzda eksik çıkan başlıkları tamamlamak için günlük konum takibi özelliği içerir.",
    href: "https://example.com/seo-arac-seti?ref=seoradar",
    cta: "Ücretsiz Denemeyi Başlat",
  },
  {
    id: "icerik-lab",
    name: "İçerik Lab",
    category: "seo",
    description:
      "Arama niyetine uygun içerik taslakları üreten yapay zekâ destekli editör. Kelime sayısı ve başlık yapısı gibi SEO metriklerini yazarken gerçek zamanlı olarak puanlar.",
    href: "https://example.com/icerik-lab?ref=seoradar",
    cta: "İçerik Aracını Dene",
  },
  {
    id: "alan-adi-merkezi",
    name: "Alan Adı Merkezi",
    category: "domain",
    description:
      "Uygun fiyatlı alan adı tescili ve ücretsiz WHOIS gizliliği. Yeni projeler için `.com.tr` ve `.com` uzantılarında toplu sorgulama imkânı sunar.",
    href: "https://example.com/alan-adi-merkezi?ref=seoradar",
    cta: "Alan Adı Sorgula",
  },
  {
    id: "eposta-plus",
    name: "E-posta Plus",
    category: "other",
    description:
      "Kendi alan adınızla profesyonel e-posta adresi oluşturun. Bülten ve abonelik mailleri için yüksek teslim edilirlik oranına sahip altyapıyla gelir.",
    href: "https://example.com/eposta-plus?ref=seoradar",
    cta: "Profesyonel E-posta Al",
  },
];
