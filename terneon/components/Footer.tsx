import siteConfig from '@/config/siteConfig'

export default function Footer() {
  return (
    <footer id="iletisim" className="border-t border-white/10 bg-[#070a12] py-12 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-neon-cyan to-neon-violet font-display font-bold text-[#070a12]">
              {siteConfig.brand.logoText}
            </span>
            <span className="font-display font-bold text-white">
              {siteConfig.brand.name}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs">
            <a href="#anasayfa" className="hover:text-neon-cyan">Ana Sayfa</a>
            <a href="#demolar" className="hover:text-neon-cyan">Demolar</a>
            <a href="#fiyat-hesapla" className="hover:text-neon-cyan">Fiyat Hesapla</a>
            <a href={`mailto:${siteConfig.contact.email}`} className="hover:text-neon-cyan">
              {siteConfig.contact.email}
            </a>
          </div>

          <div className="text-xs text-slate-500">
            © {new Date().getFullYear()} {siteConfig.brand.name}. Tüm hakları saklıdır.
          </div>
        </div>
      </div>
    </footer>
  )
}

