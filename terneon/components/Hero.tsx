'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ExternalLink,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Wifi,
  Battery,
  ArrowDown,
  ArrowUpRight,
  Check,
} from 'lucide-react'
import siteConfig from '@/config/siteConfig'
import { NeonCanvasBackground } from '@/components/NeonCanvasBackground'
import { cn } from '@/lib/cn'

interface ShowcaseProject {
  id: string
  title: string
  category: string
  url: string
  badge: string
  previewType: 'cave' | 'saas' | 'defi' | 'ecommerce' | 'ai' | 'gaming'
}

const SHOWCASE_PROJECTS: ShowcaseProject[] = [
  {
    id: 'sakli-cave-house',
    title: 'Saklı Cave House',
    category: 'Otel & Konaklama',
    url: 'demo.terneon.com/sakli-cave-house',
    badge: 'Kapadokya Butik Otel',
    previewType: 'cave',
  },
  {
    id: 'cyberpunk-saas',
    title: 'Terneon Cloud Grid',
    category: 'SaaS Analytics',
    url: 'demo.terneon.com/cloud-grid',
    badge: 'Edge Telemetri',
    previewType: 'saas',
  },
  {
    id: 'web3-crypto',
    title: 'Auralis DeFi & Swap',
    category: 'FinTech / DeFi',
    url: 'demo.terneon.com/auralis-defi',
    badge: 'Web3 & Varlık',
    previewType: 'defi',
  },
  {
    id: 'neon-ecommerce',
    title: 'Nova CyberStore',
    category: 'E-Commerce',
    url: 'demo.terneon.com/nova-cyberstore',
    badge: 'Siber Donanım',
    previewType: 'ecommerce',
  },
  {
    id: 'ai-agency',
    title: 'Synth-AI Studio',
    category: 'AI Creative Studio',
    url: 'demo.terneon.com/synth-ai',
    badge: 'Nöral Sentez',
    previewType: 'ai',
  },
  {
    id: 'fintech-terminal',
    title: 'Apex High-Freq Terminal',
    category: 'Cyberpunk Gaming & Borsa',
    url: 'demo.terneon.com/apex-terminal',
    badge: 'Yüksek Hızlı Borsa',
    previewType: 'gaming',
  },
]

export default function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0) // Sakli Cave House is 01 in this showcase

  const current = SHOWCASE_PROJECTS[currentIndex]

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? SHOWCASE_PROJECTS.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === SHOWCASE_PROJECTS.length - 1 ? 0 : prev + 1))
  }

  return (
    <section
      id="anasayfa"
      className="relative flex min-h-screen items-center overflow-hidden pt-20 pb-16 lg:pt-24 lg:pb-24"
    >
      {/* High-DPR Cyberpunk Aurora Background Canvas */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <NeonCanvasBackground />
        <div className="absolute -top-1/4 left-1/2 h-[38rem] w-[54rem] -translate-x-1/2 animate-aurora rounded-full bg-gradient-to-br from-neon-cyan/20 via-transparent to-neon-violet/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 animate-float rounded-full bg-neon-violet/10 blur-3xl" />
        <div className="absolute left-0 top-1/3 h-80 w-80 animate-pulse-glow rounded-full bg-neon-cyan/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-14">
          {/* Left Column: Editorial Typography & Copy */}
          <div className="text-left lg:col-span-5">
            {/* Tag Pill */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-1.5 text-xs font-medium text-slate-300 backdrop-blur-md"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-neon-cyan animate-pulse" />
              <span>{siteConfig.hero.tag || 'Tasarım ve yazılım stüdyosu, İstanbul'}</span>
            </motion.div>

            {/* Headline with High-End Editorial Typography */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-6 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-[3.25rem] lg:leading-[1.15]"
            >
              İşletmenize özel.{' '}
              <span className="block text-gradient-neon font-extrabold">
                Her ayrıntısıyla.
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-5 text-base leading-relaxed text-slate-300 sm:text-lg"
            >
              {siteConfig.hero.subtitle}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8 flex flex-wrap items-center gap-3.5"
            >
              {/* Projeleri incele ↓ (dark pill) */}
              <a
                href={siteConfig.hero.primaryCta.href}
                className="focus-ring group inline-flex items-center gap-2 rounded-full border border-white/20 bg-slate-900/90 px-6 py-3.5 text-sm font-semibold text-white shadow-xl backdrop-blur-md transition hover:border-neon-cyan/50 hover:bg-slate-800"
              >
                <span>{siteConfig.hero.primaryCta.label}</span>
                <ArrowDown className="h-4 w-4 text-neon-cyan transition-transform group-hover:translate-y-0.5" />
              </a>

              {/* Fiyat hesapla ↗ (light rounded) */}
              <a
                href={siteConfig.hero.secondaryCta.href}
                className="focus-ring group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-neon-cyan to-neon-violet px-6 py-3.5 text-sm font-bold text-[#070a12] shadow-glow-cyan transition-transform hover:scale-105"
              >
                <span>{siteConfig.hero.secondaryCta.label}</span>
                <ArrowUpRight className="h-4 w-4 stroke-[2.5] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/10 pt-6 text-xs text-slate-400"
            >
              {siteConfig.hero.trustBadges?.map((badge, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-400 stroke-[3]" />
                  <span className="text-slate-300 font-medium">{badge}</span>
                </div>
              )) || (
                <>
                  <div className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-400 stroke-[3]" />
                    <span className="text-slate-300 font-medium">Size özel tasarım</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-400 stroke-[3]" />
                    <span className="text-slate-300 font-medium">Önce ücretsiz demo</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-400 stroke-[3]" />
                    <span className="text-slate-300 font-medium">Doğrudan iletişim</span>
                  </div>
                </>
              )}
            </motion.div>
          </div>

          {/* Right Column: Hero Dual-Mockup Showcase (Safari Desktop + Overlapping iPhone) */}
          <div className="relative lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative mx-auto max-w-2xl"
            >
              {/* Main Desktop Safari Browser Frame */}
              <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-[#070a12] shadow-2xl backdrop-blur-xl">
                {/* Safari Browser Header */}
                <div className="flex items-center justify-between border-b border-white/10 bg-slate-900/90 px-4 py-3 select-none">
                  {/* Safari Traffic Lights */}
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-[#ff5f56]" />
                    <div className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
                    <div className="h-3 w-3 rounded-full bg-[#27c93f]" />
                    <div className="ml-2 hidden sm:flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                      <span>◀</span>
                      <span>▶</span>
                    </div>
                  </div>

                  {/* Safari Address Bar */}
                  <div className="flex items-center gap-2 rounded-lg bg-black/60 px-3 py-1 text-xs font-mono text-slate-300 border border-white/10 max-w-xs sm:max-w-md w-full justify-between">
                    <div className="flex items-center gap-1.5 truncate">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">https://{current.url}</span>
                    </div>
                    <ExternalLink className="h-3 w-3 text-slate-500 shrink-0" />
                  </div>

                  <span className="hidden sm:inline-block rounded-full bg-neon-cyan/10 border border-neon-cyan/30 px-2 py-0.5 text-[10px] font-semibold text-neon-cyan">
                    {current.badge}
                  </span>
                </div>

                {/* Desktop Content Screen Preview */}
                <div className="relative h-[340px] sm:h-[400px] w-full overflow-hidden bg-gradient-to-b from-slate-950 via-[#070a12] to-black p-4 sm:p-6 text-left">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={current.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="h-full flex flex-col justify-between"
                    >
                      {current.previewType === 'cave' && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <div>
                              <span className="font-serif text-xs uppercase tracking-widest text-amber-300">
                                Kapadokya · Uçhisar
                              </span>
                              <h3 className="font-serif text-2xl font-light text-white">
                                Saklı Cave House
                              </h3>
                            </div>
                            <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-3 py-1 font-serif text-xs text-amber-300">
                              Lüks Mağara Süiti
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                              <span className="text-[10px] uppercase text-slate-400">Doğal Taş Mimari</span>
                              <div className="mt-1 font-serif text-sm text-white">360° Panoramik Vadi</div>
                              <div className="mt-2 text-[11px] text-amber-300 font-mono">₺7.500 / gece</div>
                            </div>
                            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                              <span className="text-[10px] uppercase text-slate-400">Özel Şömine & Jakuzi</span>
                              <div className="mt-1 font-serif text-sm text-white">VIP Balayı Süiti</div>
                              <div className="mt-2 text-[11px] text-emerald-400 font-mono">Müsaitlik: Onaylı</div>
                            </div>
                          </div>

                          <div className="rounded-xl border border-amber-500/20 bg-amber-950/20 p-3 text-xs text-slate-300 flex items-center justify-between">
                            <span>Özel Mağara Rezervasyonu & Havalimanı VIP Transfer</span>
                            <span className="rounded bg-amber-400 px-2.5 py-1 text-[10px] font-bold text-black font-serif">
                              Hemen Ayırt
                            </span>
                          </div>
                        </div>
                      )}

                      {current.previewType === 'saas' && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <div>
                              <span className="text-xs font-mono text-neon-cyan">TERNEON-GRID TELEMETRY</span>
                              <h3 className="text-xl font-bold text-white">64 Düğüm Kümesi Aktif</h3>
                            </div>
                            <span className="rounded bg-emerald-500/20 px-2.5 py-0.5 text-xs text-emerald-300 font-mono">
                              99.99% Uptime
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="rounded-xl bg-white/5 p-3">
                              <span className="text-[10px] text-slate-400">Bant Genişliği</span>
                              <div className="font-bold text-white text-base">148.4 TH/s</div>
                            </div>
                            <div className="rounded-xl bg-white/5 p-3">
                              <span className="text-[10px] text-slate-400">Edge Gecikme</span>
                              <div className="font-bold text-neon-cyan text-base">12 ms</div>
                            </div>
                            <div className="rounded-xl bg-white/5 p-3">
                              <span className="text-[10px] text-slate-400">Aylık Hacim</span>
                              <div className="font-bold text-white text-base">$84.2K</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {current.previewType === 'defi' && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <span className="text-xs font-bold text-neon-violet">AURALIS LIQUIDITY DEFI</span>
                            <span className="text-xs font-mono text-white">$64,559.61 TVL</span>
                          </div>
                          <div className="rounded-xl border border-neon-violet/30 bg-neon-violet/10 p-3">
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-300">Ödenen: 1.5 ETH</span>
                              <span className="font-bold text-neon-cyan">Alınan: 121.8 NEON</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {current.previewType === 'ecommerce' && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <span className="text-xs font-black tracking-wider text-neon-cyan">NOVA CYBERSTORE</span>
                            <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] text-slate-300">Sepet (2)</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="rounded-xl bg-white/5 p-3">
                              <div className="font-bold text-white">Cyber Goggles MK-IV</div>
                              <div className="text-neon-cyan mt-1">₺4.200</div>
                            </div>
                            <div className="rounded-xl bg-white/5 p-3">
                              <div className="font-bold text-white">Neural Link V2</div>
                              <div className="text-neon-cyan mt-1">₺8.900</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {current.previewType === 'ai' && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <span className="text-xs font-bold text-pink-400">SYNTH-AI CREATIVE</span>
                            <span className="text-[10px] text-slate-400 font-mono">Diffusion-X 2099</span>
                          </div>
                          <div className="rounded-xl border border-pink-500/30 bg-pink-950/20 p-3 text-xs">
                            <span className="text-pink-300">Prompt: "Cyberpunk Neo-Tokyo Rain Reflections"</span>
                            <div className="mt-2 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                              <div className="h-full w-4/5 bg-gradient-to-r from-pink-500 to-neon-violet" />
                            </div>
                          </div>
                        </div>
                      )}

                      {current.previewType === 'gaming' && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <span className="text-xs font-mono font-bold text-emerald-400">APEX TRADING & GAMING</span>
                            <span className="font-mono text-white text-xs">BTC/USDT $91,420</span>
                          </div>
                          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-3">
                            <div className="flex justify-between text-xs font-mono">
                              <span className="text-emerald-400">▲ 240 FPS Ultra-Low Ping (8ms)</span>
                              <span className="text-slate-400">Order Depth: 95%</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Bottom Direct Link CTA inside Preview */}
                      <div className="border-t border-white/10 pt-3 flex items-center justify-between text-xs text-slate-400">
                        <span className="truncate">{current.title} · {current.category}</span>
                        <a
                          href="#demolar"
                          className="inline-flex items-center gap-1 font-semibold text-neon-cyan hover:underline"
                        >
                          Cihazda Canlı Test Et →
                        </a>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* Overlapping Sleek iPhone Mobile Mockup (Bottom-Right) */}
              <motion.div
                initial={{ opacity: 0, x: 20, y: 20 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.6, delay: 0.35 }}
                className="absolute -bottom-6 -right-2 sm:-bottom-8 sm:-right-6 z-20 w-[170px] sm:w-[210px] h-[310px] sm:h-[370px] rounded-[36px] sm:rounded-[40px] border-[6px] border-slate-800 bg-[#070a12] shadow-2xl ring-1 ring-white/20 overflow-hidden flex flex-col justify-between"
              >
                {/* iPhone Dynamic Island Bar */}
                <div className="relative flex items-center justify-between bg-slate-900/90 px-3 py-1.5 text-[9px] font-bold text-white select-none border-b border-white/5">
                  <span>09:41</span>
                  {/* Dynamic Island pill */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-1 h-3 w-16 rounded-full bg-black flex items-center justify-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-slate-800 ml-4" />
                  </div>
                  <div className="flex items-center gap-1 text-slate-300">
                    <Wifi className="h-2.5 w-2.5" />
                    <span className="text-[8px]">5G</span>
                    <Battery className="h-2.5 w-2.5" />
                  </div>
                </div>

                {/* iPhone Screen Content */}
                <div className="flex-1 overflow-hidden p-2.5 text-left text-[10px] flex flex-col justify-between bg-gradient-to-b from-slate-950 to-black">
                  <div>
                    <div className="font-mono text-[8px] text-neon-cyan truncate">
                      {current.url.split('/')[1] || current.id}
                    </div>
                    <div className="mt-1 font-bold text-white truncate text-xs">
                      {current.title}
                    </div>
                    <div className="text-[9px] text-slate-400">
                      {current.category}
                    </div>

                    <div className="mt-2.5 rounded-lg border border-white/10 bg-white/5 p-2">
                      <div className="text-[8px] text-slate-400">Mobil Görünüm</div>
                      <div className="mt-0.5 font-semibold text-white text-[10px] truncate">
                        {current.badge}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg bg-neon-cyan/15 border border-neon-cyan/30 p-1.5 text-center text-[9px] font-bold text-neon-cyan">
                    Mobil Deneyim Canlı
                  </div>
                </div>

                {/* iPhone Home Indicator */}
                <div className="flex h-3.5 items-center justify-center bg-black">
                  <div className="h-1 w-16 rounded-full bg-white/40" />
                </div>
              </motion.div>

              {/* Showcase Footer Bar with Title, Category, and < 03 / 06 > Pagination */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3 backdrop-blur-md">
                <div>
                  <h4 className="font-display text-sm font-bold text-white">
                    {current.title}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {current.category}
                  </p>
                </div>

                {/* Pagination with Arrows (< 01 / 06 >) */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrev}
                    aria-label="Önceki Proje"
                    className="focus-ring flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition hover:border-neon-cyan/40 hover:bg-white/10 hover:text-white"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <span className="font-mono text-xs font-semibold text-neon-cyan px-2">
                    0{currentIndex + 1} / 0{SHOWCASE_PROJECTS.length}
                  </span>

                  <button
                    type="button"
                    onClick={handleNext}
                    aria-label="Sonraki Proje"
                    className="focus-ring flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition hover:border-neon-cyan/40 hover:bg-white/10 hover:text-white"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Sector Tags matching Eraslan Software reference */}
        <div className="mt-14 flex items-center justify-end text-xs text-slate-500 font-mono tracking-wider border-t border-white/5 pt-4">
          <span>Web sitesi &nbsp;/&nbsp; E-ticaret &nbsp;/&nbsp; Mobil uygulama &nbsp;/&nbsp; Özel yazılım</span>
        </div>
      </div>

      {/* Cookie Consent Banner matching reference */}
      <div className="fixed bottom-4 left-4 z-50 max-w-sm rounded-2xl border border-white/10 bg-slate-950/95 p-4 text-xs text-slate-300 shadow-2xl backdrop-blur-xl">
        <div className="font-bold text-white mb-1 flex items-center justify-between">
          <span>Çerez tercihiniz</span>
          <span className="text-[10px] text-emerald-400 font-mono">KVKK Uyumlu</span>
        </div>
        <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
          Sitenin çalışması için gerekli olmayan analitik çerezleri (ziyaret kaydı ve ısı haritası) yalnız izninizle kullanırız.{' '}
          <a href="#cerez" className="underline text-slate-300 hover:text-white">Çerez Politikası</a>
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              const el = e.currentTarget.closest('.fixed') as HTMLElement
              if (el) el.style.display = 'none'
            }}
            className="flex-1 rounded-xl border border-white/15 bg-white/5 py-1.5 text-center font-semibold text-slate-300 hover:bg-white/10 transition"
          >
            Reddet
          </button>
          <button
            type="button"
            onClick={(e) => {
              const el = e.currentTarget.closest('.fixed') as HTMLElement
              if (el) el.style.display = 'none'
            }}
            className="flex-1 rounded-xl bg-white text-black py-1.5 text-center font-bold hover:bg-slate-200 transition"
          >
            Kabul et
          </button>
        </div>
      </div>
    </section>
  )
}
