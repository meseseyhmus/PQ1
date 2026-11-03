'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Sparkles } from 'lucide-react'
import siteConfig from '@/config/siteConfig'
import { cn } from '@/lib/cn'

const navItems = [
  { label: 'Çalışmalar', href: '#demolar' },
  { label: 'Demolar', href: '#demolar' },
  { label: 'Hizmetler', href: '#fiyat-hesapla' },
  { label: 'Süreç', href: '#surec' },
  { label: 'Sorular', href: '#sss' },
  { label: 'İletişim', href: '#iletisim' },
]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'border-b border-white/10 bg-[#070a12]/80 backdrop-blur-xl'
          : 'bg-transparent'
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="#anasayfa" className="focus-ring group flex items-center gap-2.5 rounded-lg">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-neon-cyan to-neon-violet font-display text-lg font-bold text-[#070a12] shadow-glow-cyan">
            {siteConfig.brand.logoText}
          </span>
          <span className="font-display text-lg font-semibold tracking-tight text-white">
            {siteConfig.brand.name}
          </span>
        </a>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Ana menü">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="focus-ring rounded-lg px-3 py-2 text-sm text-slate-300 transition-colors hover:text-neon-cyan"
            >
              {item.label}
            </a>
          ))}
          <div className="flex items-center gap-3 ml-2 border-l border-white/10 pl-3">
            <span className="text-xs font-semibold text-slate-400 hover:text-white cursor-pointer transition">
              EN
            </span>
            <span className="text-xs text-slate-400 hover:text-white cursor-pointer transition" title="Tema">
              ☾
            </span>
            <a
              href="#fiyat-hesapla"
              className="focus-ring inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-xs font-bold text-black shadow-lg hover:bg-slate-200 transition-all"
            >
              Teklif al
            </a>
          </div>
        </nav>

        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="focus-ring rounded-lg p-2 text-slate-300 md:hidden"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Menüyü kapat' : 'Menüyü aç'}
        >
          {menuOpen ? <X className="h-6 w-6" aria-hidden /> : <Menu className="h-6 w-6" aria-hidden />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-b border-white/10 bg-[#070a12]/95 backdrop-blur-xl md:hidden"
            aria-label="Mobil menü"
          >
            <div className="space-y-1 px-4 py-4">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="focus-ring block rounded-lg px-3 py-2.5 text-sm text-slate-200 hover:bg-white/5 hover:text-neon-cyan"
                >
                  {item.label}
                </a>
              ))}
              <a
                href="#fiyat-hesapla"
                onClick={() => setMenuOpen(false)}
                className="focus-ring mt-2 block rounded-xl bg-gradient-to-r from-neon-cyan to-neon-violet px-3 py-2.5 text-center text-sm font-semibold text-[#070a12]"
              >
                Ücretsiz Demo
              </a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
