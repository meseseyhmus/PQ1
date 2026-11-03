export type DemoCategory =
  | 'saglik'
  | 'eticaret'
  | 'guzellik'
  | 'otel'
  | 'kafe'
  | 'kurumsal'

export interface DemoProject {
  id: string
  title: string
  category: DemoCategory
  categoryLabel: string
  description: string
  image: string
  liveUrl: string
  features: string[]
}

export interface PricingItem {
  id: string
  name: string
  description: string
  price: number
  icon: string
}

export interface SubscriptionPlan {
  id: 'monthly' | 'yearly'
  price: number
  period: string
  features: string[]
  discountLabel?: string
}

export const siteConfig = {
  brand: {
    name: 'Terneon',
    tagline: 'Sektörünüze özel, ışıl ışıl web deneyimleri',
    logoText: 'T',
  },
  contact: {
    phone: '+90 555 000 00 00',
    whatsapp: '905550000000',
    email: 'merhaba@terneon.com',
    address: 'İstanbul, Türkiye',
  },
  hero: {
    tag: 'Tasarım ve yazılım stüdyosu, İstanbul',
    title: 'İşletmenize özel. Her ayrıntısıyla.',
    subtitle:
      'Web siteleri, mobil uygulamalar ve işinizi kolaylaştıran yazılımlar geliştiriyoruz. İlk fikirden yayına, birlikte.',
    primaryCta: { label: 'Projeleri incele ↓', href: '#demolar' },
    secondaryCta: { label: 'Fiyat hesapla ↗', href: '#fiyat-hesapla' },
    trustBadges: [
      'Size özel tasarım',
      'Önce ücretsiz demo',
      'Doğrudan iletişim',
    ],
  },
  pricing: {
    services: [
      {
        id: 'kurumsal',
        name: 'Kurumsal Web Sitesi',
        description:
          'Şirketiniz için kapsamlı, hızlı ve SEO uyumlu kurumsal tanıtım sitesi.',
        price: 12000,
        icon: 'Building2',
      },
      {
        id: 'eticaret',
        name: 'E-Ticaret Paketi',
        description:
          'Ürün yönetimi, ödeme entegrasyonları ve sepet sistemi ile tam kapsamlı e-ticaret altyapısı.',
        price: 20000,
        icon: 'ShoppingCart',
      },
      {
        id: 'ozel',
        name: 'Özel Web Uygulaması',
        description:
          'İş süreçlerinize tamamen özel geliştirilmiş, panel destekli web uygulaması.',
        price: 30000,
        icon: 'Code2',
      },
    ] as PricingItem[],
    addons: [
      {
        id: 'panel',
        name: 'Yönetim Paneli',
        description: 'İçerik ve ürünlerinizi kendiniz yönetebileceğiniz kullanışlı panel.',
        price: 3000,
        icon: 'LayoutDashboard',
      },
      {
        id: 'seo',
        name: 'İleri Düzey SEO Paketi',
        description: 'Teknik SEO, içerik optimizasyonu ve Google sıralama takibi.',
        price: 3000,
        icon: 'TrendingUp',
      },
      {
        id: 'coklu-dil',
        name: 'Çoklu Dil Desteği',
        description: 'Sitenizin İngilizce, Arapça ve daha fazla dilde yayınlanması.',
        price: 2500,
        icon: 'Languages',
      },
      {
        id: 'chatbot',
        name: 'Yapay Zeka Chatbot',
        description: '7/24 müşterilerinize yanıt veren akıllı asistan entegrasyonu.',
        price: 4000,
        icon: 'Bot',
      },
      {
        id: 'animasyon',
        name: 'Özel GSAP/3D Animasyon Paketi',
        description: 'Etkileyici scroll animasyonları ve 3D görsel deneyimler.',
        price: 5000,
        icon: 'Sparkles',
      },
    ] as PricingItem[],
    subscription: {
      monthly: {
        id: 'monthly',
        price: 2000,
        period: 'ay',
        features: [
          'Aylık güncelleme ve içerik desteği',
          'SSL, yedekleme ve sunucu barındırma',
          'Hata giderme ve teknik destek',
        ],
      },
      yearly: {
        id: 'yearly',
        price: 20000,
        period: 'yıl',
        features: [
          'Tüm aylık plan özellikleri',
          'Öncelikli destek hattı',
          'Performans ve güvenlik raporları',
        ],
        discountLabel: '2 ay hediye',
      },
    } satisfies Record<'monthly' | 'yearly', SubscriptionPlan>,
  },
  demos: [
    {
      id: 'vita-dental',
      title: 'Vita Dental Klinik',
      category: 'saglik',
      categoryLabel: 'Sağlık & Klinik',
      description:
        'Randevu sistemi ve doktor profilleri ile modern diş kliniği sitesi.',
      image: 'vita-dental',
      liveUrl: 'https://demo.terneon.com/vita-dental',
      features: ['Online randevu', 'Doktor profilleri', 'Blog'],
    },
    {
      id: 'medicana-health',
      title: 'Medicana Sağlık',
      category: 'saglik',
      categoryLabel: 'Sağlık & Klinik',
      description: 'Çoklu dil desteği ve tahlil sonuç sorgulama ile hastane sitesi.',
      image: 'medicana-health',
      liveUrl: 'https://demo.terneon.com/medicana-health',
      features: ['Tahlil sorgulama', 'Çoklu dil', 'E-randevu'],
    },
    {
      id: 'novashop',
      title: 'NovaShop',
      category: 'eticaret',
      categoryLabel: 'E-Ticaret',
      description: 'Kategori filtreleri, sepet ve hızlı ödeme akışı ile moda mağazası.',
      image: 'novashop',
      liveUrl: 'https://demo.terneon.com/novashop',
      features: ['Sepet & ödeme', 'Kategori filtreleri', 'Ürün arama'],
    },
    {
      id: 'teknohub',
      title: 'TeknoHub',
      category: 'eticaret',
      categoryLabel: 'E-Ticaret',
      description: 'Teknoloji ürünleri için karşılaştırma ve taksit seçenekli e-ticaret.',
      image: 'teknohub',
      liveUrl: 'https://demo.terneon.com/teknohub',
      features: ['Ürün karşılaştırma', 'Taksit seçenekleri', 'Kargo takibi'],
    },
    {
      id: 'lumiere-beauty',
      title: 'Lumière Güzellik',
      category: 'guzellik',
      categoryLabel: 'Güzellik Merkezi',
      description: 'Önce/sonra galerisi ve paket fiyat listesi ile güzellik merkezi.',
      image: 'lumiere-beauty',
      liveUrl: 'https://demo.terneon.com/lumiere-beauty',
      features: ['Önce/sonra galerisi', 'Paket fiyatları', 'Online rezervasyon'],
    },
    {
      id: 'aura-spa',
      title: 'Aura Spa & Wellness',
      category: 'guzellik',
      categoryLabel: 'Güzellik Merkezi',
      description: 'Huzurlu tasarımı ve hediye kartı sistemi ile spa merkezi sitesi.',
      image: 'aura-spa',
      liveUrl: 'https://demo.terneon.com/aura-spa',
      features: ['Hediye kartı', 'Terapi listesi', 'Online rezervasyon'],
    },
    {
      id: 'azure-hotel',
      title: 'Azure Otel',
      category: 'otel',
      categoryLabel: 'Otel & Konaklama',
      description: 'Rezervasyon motoru ve oda turu ile butik otel sitesi.',
      image: 'azure-hotel',
      liveUrl: 'https://demo.terneon.com/azure-hotel',
      features: ['Rezervasyon motoru', '360° oda turu', 'Misafir yorumları'],
    },
    {
      id: 'sunset-bay',
      title: 'Sunset Bay Resort',
      category: 'otel',
      categoryLabel: 'Otel & Konaklama',
      description: 'Çoklu dil ve aktivite takvimi ile sahil resortu sitesi.',
      image: 'sunset-bay',
      liveUrl: 'https://demo.terneon.com/sunset-bay',
      features: ['Aktivite takvimi', 'Çoklu dil', 'Promosyon kodları'],
    },
    {
      id: 'sakli-cave-house',
      title: 'Saklı Cave House',
      category: 'otel',
      categoryLabel: 'Otel & Konaklama',
      description: 'Kapadokya mağara oteli için özel taş mimari görsel vitrini, 360° süit turu ve canlı rezervasyon.',
      image: 'sakli-cave-house',
      liveUrl: 'https://demo.terneon.com/sakli-cave-house',
      features: ['Mağara süit turu', 'Canlı rezervasyon', 'VIP transfer'],
    },
    {
      id: 'brew-lab',
      title: 'Brew Lab Kahve',
      category: 'kafe',
      categoryLabel: 'Kafe & Restoran',
      description: 'İnteraktif menü ve masa QR siparişi ile üçüncü nesil kahveci.',
      image: 'brew-lab',
      liveUrl: 'https://demo.terneon.com/brew-lab',
      features: ['QR menü', 'Masa siparişi', 'Sadakat programı'],
    },
    {
      id: 'mangal-evi',
      title: 'Mangal Evi',
      category: 'kafe',
      categoryLabel: 'Kafe & Restoran',
      description: 'Online rezervasyon ve şube haritası ile restoran zinciri sitesi.',
      image: 'mangal-evi',
      liveUrl: 'https://demo.terneon.com/mangal-evi',
      features: ['Online rezervasyon', 'Şube haritası', 'Menü yönetimi'],
    },
    {
      id: 'atlas-holding',
      title: 'Atlas Holding',
      category: 'kurumsal',
      categoryLabel: 'Kurumsal',
      description: 'Yatırımcı ilişkileri ve kurumsal kimlik sunumu ile holding sitesi.',
      image: 'atlas-holding',
      liveUrl: 'https://demo.terneon.com/atlas-holding',
      features: ['Yatırımcı ilişkileri', 'Basın odası', 'Kariyer sayfası'],
    },
    {
      id: 'vertex-danismanlik',
      title: 'Vertex Danışmanlık',
      category: 'kurumsal',
      categoryLabel: 'Kurumsal',
      description: 'Vaka çalışmaları ve danışman formları ile B2B danışmanlık sitesi.',
      image: 'vertex-danismanlik',
      liveUrl: 'https://demo.terneon.com/vertex-danismanlik',
      features: ['Vaka çalışmaları', 'Teklif formu', 'E-bülten'],
    },
  ] as DemoProject[],
  stats: [
    { id: 'stat-1', value: 120, suffix: '+', label: 'Tamamlanan Proje' },
    { id: 'stat-2', value: 98, suffix: '%', label: 'Müşteri Memnuniyeti' },
    { id: 'stat-3', value: 7, suffix: ' Yıl', label: 'Sektör Deneyimi' },
    { id: 'stat-4', value: 40, suffix: '+', label: 'Aktif Abonelik' },
  ],
  process: [
    {
      id: 'kesif',
      step: '01',
      title: 'Keşif',
      description:
        'İhtiyaçlarınızı dinliyor, sektörünüzü analiz ediyor ve hedeflerinizi netleştiriyoruz.',
      icon: 'Search',
    },
    {
      id: 'tasarim',
      step: '02',
      title: 'Tasarım',
      description:
        'Markanıza özel, neon dokunuşlu ve dönüşüm odaklı tasarım konseptleri sunuyoruz.',
      icon: 'PenTool',
    },
    {
      id: 'gelistirme',
      step: '03',
      title: 'Geliştirme',
      description:
        'Modern teknolojilerle hızlı, güvenli ve mobil uyumlu sitenizi geliştiriyoruz.',
      icon: 'Code2',
    },
    {
      id: 'yayin',
      step: '04',
      title: 'Yayın & Bakım',
      description:
        'Sitenizi yayına alıyor, abonelik ile sürekli güncelliyor ve destek veriyoruz.',
      icon: 'Rocket',
    },
  ],
  trustBadges: [
    {
      id: 'badge-demo',
      icon: 'MonitorPlay',
      title: 'Önce Ücretsiz Demo, Sonra Ödeme',
      description:
        'Projeniz yayına girmeden önce canlı demoyu inceleyin, memnun kalırsanız ödeme yapın.',
    },
    {
      id: 'badge-teslim',
      icon: 'Rocket',
      title: '14 Günde Teslim',
      description: 'Onaylanan tasarımlar ortalama 14 gün içinde yayında.',
    },
    {
      id: 'badge-destek',
      icon: 'Headphones',
      title: '7/24 Destek',
      description: 'Abonelik paketlerimize sınırsız teknik destek dahil.',
    },
    {
      id: 'badge-performans',
      icon: 'Gauge',
      title: '%95+ Performans Skoru',
      description: 'Her site Core Web Vitals ölçümleriyle optimize edilir.',
    },
  ],
} as const

export default siteConfig
