import type { Metadata } from 'next'
import { Inter, Sora } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import siteConfig from '@/config/siteConfig'

const SITE_URL = 'https://terneon.com'

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
})

const sora = Sora({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-sora',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${siteConfig.brand.name} — Neon Web Tasarım Ajansı`,
    template: `%s | ${siteConfig.brand.name}`,
  },
  description:
    'Sektörünüze özel, neon dokunuşlu ve animasyonlu web sitesi tasarımı. Önce Ücretsiz Demo, Sonra Ödeme ilkesiyle çalışıyoruz.',
  keywords: [
    'web tasarım',
    'neon web tasarım',
    'web sitesi yapımı',
    'e-ticaret sitesi',
    'kurumsal web sitesi',
    'web ajansı',
    'özel web uygulaması',
    'İstanbul web tasarım',
  ],
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: SITE_URL,
    siteName: siteConfig.brand.name,
    title: `${siteConfig.brand.name} — Neon Web Tasarım Ajansı`,
    description:
      'Sektörünüze özel, neon dokunuşlu ve animasyonlu web siteleri. Önce Ücretsiz Demo, Sonra Ödeme.',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.brand.name} — Neon Web Tasarım Ajansı`,
    description:
      'Sektörünüze özel, neon dokunuşlu ve animasyonlu web siteleri. Önce Ücretsiz Demo, Sonra Ödeme.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

interface JsonLdValue {
  '@type'?: string
  [key: string]: unknown
}

function buildJsonLd(): string {
  const graph: JsonLdValue[] = [
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: siteConfig.brand.name,
      description: siteConfig.brand.tagline,
      inLanguage: 'tr-TR',
    },
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: siteConfig.brand.name,
      url: SITE_URL,
      email: siteConfig.contact.email,
      telephone: siteConfig.contact.phone,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'İstanbul',
        addressCountry: 'TR',
      },
    },
    ...siteConfig.pricing.services.map((service) => ({
      '@type': 'Service',
      '@id': `${SITE_URL}/#service-${service.id}`,
      name: service.name,
      description: service.description,
      provider: { '@id': `${SITE_URL}/#organization` },
      areaServed: 'TR',
      offers: {
        '@type': 'Offer',
        price: service.price,
        priceCurrency: 'TRY',
        availability: 'https://schema.org/InStock',
      },
    })),
  ]

  return JSON.stringify(
    { '@context': 'https://schema.org', '@graph': graph },
    null,
    0
  )
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" className={`${inter.variable} ${sora.variable} dark`}>
      <body className="min-h-screen bg-[#070a12] font-sans text-slate-200">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: buildJsonLd() }}
        />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
