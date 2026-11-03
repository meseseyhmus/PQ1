'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ExternalLink,
  Laptop,
  Smartphone,
  X,
  Sparkles,
  Wifi,
  Battery,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react'
import siteConfig, { type DemoCategory, type DemoProject } from '@/config/siteConfig'
import { cn } from '@/lib/cn'
import {
  SECTOR_DEFINITIONS,
  CyberpunkSaaSTemplate,
  Web3CryptoTemplate,
  NeonECommerceTemplate,
  AiAgencyTemplate,
  FintechTerminalTemplate,
  LuxuryBrandTemplate,
} from './DemoSectorMocks'

const categories: { key: DemoCategory | 'all'; label: string }[] = [
  { key: 'all', label: 'Tümü' },
  { key: 'saglik', label: 'Sağlık & Klinik' },
  { key: 'eticaret', label: 'E-Ticaret' },
  { key: 'guzellik', label: 'Güzellik Merkezi' },
  { key: 'otel', label: 'Otel & Konaklama' },
  { key: 'kafe', label: 'Kafe & Restoran' },
  { key: 'kurumsal', label: 'Kurumsal' },
]

function getSectorForCategory(category: DemoCategory): string {
  switch (category) {
    case 'kurumsal':
      return 'cyberpunk-saas'
    case 'eticaret':
      return 'neon-ecommerce'
    case 'kafe':
      return 'neon-ecommerce'
    case 'saglik':
      return 'fintech-terminal'
    case 'guzellik':
      return 'luxury-concept'
    case 'otel':
      return 'luxury-concept'
    default:
      return 'cyberpunk-saas'
  }
}

export default function DemoShowcase() {
  const [activeCat, setActiveCat] = useState<DemoCategory | 'all'>('all')
  const [selectedDemo, setSelectedDemo] = useState<DemoProject | null>(null)
  const [activeSectorId, setActiveSectorId] = useState<string>('cyberpunk-saas')
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop')

  const filtered = siteConfig.demos.filter(
    (d) => activeCat === 'all' || d.category === activeCat
  )

  const activeSector =
    SECTOR_DEFINITIONS.find((s) => s.id === activeSectorId) || SECTOR_DEFINITIONS[0]

  function openDemoModal(demo: DemoProject) {
    setSelectedDemo(demo)
    setActiveSectorId(getSectorForCategory(demo.category))
  }

  function openDirectSector(sectorId: string) {
    const matchingDemo = siteConfig.demos.find(
      (d) => getSectorForCategory(d.category) === sectorId
    )
    setSelectedDemo(matchingDemo || siteConfig.demos[0])
    setActiveSectorId(sectorId)
  }

  return (
    <section id="demolar" className="relative py-24 scroll-mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-neon-cyan/30 bg-neon-cyan/5 px-3.5 py-1 text-xs font-semibold text-neon-cyan">
            <Sparkles className="h-3.5 w-3.5" />
            Canlı Demo Vitrini & Simülatör
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Sektörünüze Özel İnteraktif Çözümler
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-400 text-sm sm:text-base">
            6 ana sektör şablonunu cihaz simülatöründe (Masaüstü & Mobil) canlı olarak test edin; sepet, cüzdan, grafik ve yapay zeka deneyimini doğrudan keşfedin.
          </p>
        </div>

        {/* Quick Launch Bar for 6 Sectors */}
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-3 backdrop-blur-md">
          <div className="mb-2 text-center text-[11px] font-semibold uppercase tracking-wider text-neon-cyan">
            Hızlı Sektör Simülasyonu Seçin
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {SECTOR_DEFINITIONS.map((sector) => (
              <button
                key={sector.id}
                onClick={() => openDirectSector(sector.id)}
                className="group flex flex-col items-center justify-center rounded-xl border border-white/5 bg-white/[0.02] p-2.5 text-center transition hover:border-neon-cyan/40 hover:bg-white/[0.06] hover:shadow-glow-soft"
              >
                <span className="text-[10px] font-bold text-neon-cyan">
                  0{sector.number}
                </span>
                <span className="mt-0.5 text-xs font-bold text-white group-hover:text-neon-cyan">
                  {sector.shortName}
                </span>
                <span className="mt-0.5 text-[9px] text-slate-400">
                  {sector.tag}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Filter buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
          {categories.map((c) => (
            <button
              key={c.key}
              onClick={() => setActiveCat(c.key)}
              className={cn(
                'focus-ring rounded-xl px-4 py-2 text-xs font-semibold transition-all',
                activeCat === c.key
                  ? 'bg-gradient-to-r from-neon-cyan to-neon-violet text-[#070a12] shadow-glow-cyan'
                  : 'border border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:text-white'
              )}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Demo Cards Grid */}
        <motion.div
          layout
          className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence>
            {filtered.map((demo) => {
              const matchedSector = SECTOR_DEFINITIONS.find(
                (s) => s.id === getSectorForCategory(demo.category)
              )

              return (
                <motion.div
                  key={demo.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-md transition-all hover:border-neon-cyan/40 hover:bg-white/[0.05] hover:shadow-glow-soft"
                >
                  {/* Visual placeholder box */}
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 flex flex-col items-center justify-center p-4 text-center">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#070a12] via-transparent to-transparent opacity-80" />
                    <span className="relative z-10 text-xs font-semibold uppercase tracking-wider text-neon-cyan">
                      {demo.categoryLabel}
                    </span>
                    <h4 className="relative z-10 mt-1 font-display text-lg font-bold text-white">
                      {demo.title}
                    </h4>
                    <span className="relative z-10 mt-2 inline-flex items-center gap-1 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 px-2.5 py-0.5 text-[10px] text-neon-cyan">
                      Canlı Simülasyon: {matchedSector?.shortName}
                    </span>
                  </div>

                  <div className="mt-4">
                    <p className="text-xs text-slate-400 line-clamp-2">
                      {demo.description}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {demo.features.map((feat, idx) => (
                        <span
                          key={idx}
                          className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] text-slate-300"
                        >
                          {feat}
                        </span>
                      ))}
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                      <button
                        onClick={() => openDemoModal(demo)}
                        className="focus-ring inline-flex items-center gap-1.5 text-xs font-semibold text-neon-cyan hover:underline"
                      >
                        Cihazda Canlı İncele
                        <ExternalLink className="h-3.5 w-3.5" />
                      </button>
                      <a
                        href="#fiyat-hesapla"
                        className="text-xs text-slate-400 hover:text-white"
                      >
                        Fiyat Al →
                      </a>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Upgraded Interactive Device Simulator Modal */}
      <AnimatePresence>
        {selectedDemo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-2 sm:p-4 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative flex h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-white/20 bg-[#070a12] shadow-2xl"
            >
              {/* Modal Top Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-neon-cyan to-neon-violet font-display font-bold text-[#070a12]">
                    T
                  </span>
                  <div>
                    <h3 className="font-display text-sm sm:text-base font-bold text-white">
                      {activeSector.name}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {selectedDemo.title} · {selectedDemo.categoryLabel}
                    </p>
                  </div>
                </div>

                {/* Viewport switcher: Desktop vs Mobile */}
                <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
                  <button
                    onClick={() => setViewMode('desktop')}
                    className={cn(
                      'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition',
                      viewMode === 'desktop'
                        ? 'bg-neon-cyan text-[#070a12] font-bold shadow-glow-cyan'
                        : 'text-slate-400 hover:text-white'
                    )}
                  >
                    <Laptop className="h-3.5 w-3.5" /> Masaüstü (100%)
                  </button>
                  <button
                    onClick={() => setViewMode('mobile')}
                    className={cn(
                      'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition',
                      viewMode === 'mobile'
                        ? 'bg-neon-cyan text-[#070a12] font-bold shadow-glow-cyan'
                        : 'text-slate-400 hover:text-white'
                    )}
                  >
                    <Smartphone className="h-3.5 w-3.5" /> Mobil (375x667)
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href="#fiyat-hesapla"
                    onClick={() => setSelectedDemo(null)}
                    className="hidden sm:inline-flex rounded-xl bg-gradient-to-r from-neon-cyan to-neon-violet px-3 py-1.5 text-xs font-bold text-[#070a12]"
                  >
                    Fiyat Al
                  </a>
                  <button
                    onClick={() => setSelectedDemo(null)}
                    className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white transition"
                    aria-label="Kapat"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Sector Switcher Bar Inside Modal */}
              <div className="flex overflow-x-auto border-b border-white/10 bg-slate-900/60 px-4 py-2 scrollbar-none gap-2">
                {SECTOR_DEFINITIONS.map((sector) => {
                  const isActive = activeSectorId === sector.id
                  return (
                    <button
                      key={sector.id}
                      onClick={() => setActiveSectorId(sector.id)}
                      className={cn(
                        'flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition',
                        isActive
                          ? 'border border-neon-cyan/50 bg-neon-cyan/15 text-neon-cyan shadow-glow-soft'
                          : 'border border-transparent text-slate-400 hover:border-white/10 hover:bg-white/5 hover:text-white'
                      )}
                    >
                      <span className="font-mono text-[10px] text-slate-500">
                        0{sector.number}
                      </span>
                      <span>{sector.name}</span>
                    </button>
                  )
                })}
              </div>

              {/* Viewport Simulation Area with Smooth Morphing Transition */}
              <div className="flex flex-1 items-center justify-center overflow-auto bg-slate-950 p-3 sm:p-6">
                <motion.div
                  layout
                  initial={false}
                  animate={{
                    maxWidth: viewMode === 'desktop' ? '100%' : '375px',
                    height: viewMode === 'desktop' ? '100%' : '667px',
                    borderRadius: viewMode === 'desktop' ? '16px' : '44px',
                  }}
                  transition={{ type: 'spring', stiffness: 220, damping: 25 }}
                  className={cn(
                    'relative flex flex-col overflow-hidden bg-[#070a12] shadow-2xl transition-all duration-300',
                    viewMode === 'desktop'
                      ? 'h-full w-full rounded-2xl border border-white/10'
                      : 'h-[667px] w-[375px] shrink-0 rounded-[44px] border-[8px] border-slate-800 ring-1 ring-white/20'
                  )}
                >
                  {viewMode === 'desktop' ? (
                    /* Safari Desktop Browser Bar */
                    <div className="flex items-center justify-between border-b border-white/10 bg-slate-900/90 px-4 py-2.5 select-none">
                      <div className="flex items-center gap-3">
                        {/* Safari Traffic Lights */}
                        <div className="flex gap-2">
                          <div className="h-3 w-3 rounded-full bg-[#ff5f56] hover:opacity-80 transition cursor-pointer" title="Kapat" />
                          <div className="h-3 w-3 rounded-full bg-[#ffbd2e] hover:opacity-80 transition cursor-pointer" title="Simge Durumuna Küçült" />
                          <div className="h-3 w-3 rounded-full bg-[#27c93f] hover:opacity-80 transition cursor-pointer" title="Tam Ekran" />
                        </div>
                        {/* Safari Navigation Controls */}
                        <div className="ml-2 hidden sm:flex items-center gap-1.5 text-slate-500 font-mono text-[11px]">
                          <span className="rounded p-0.5 hover:bg-white/5 hover:text-slate-300 transition cursor-default">◀</span>
                          <span className="rounded p-0.5 hover:bg-white/5 hover:text-slate-300 transition cursor-default">▶</span>
                        </div>
                      </div>

                      {/* Safari Address Bar */}
                      <div className="flex items-center gap-2 rounded-lg bg-black/60 px-4 py-1 text-xs font-mono text-slate-300 border border-white/10 shadow-inner w-full max-w-md justify-between">
                        <div className="flex items-center gap-2 truncate">
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                          <span className="truncate">https://demo.terneon.com/{activeSector.id}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 hidden sm:inline">Safari 18.0</span>
                      </div>

                      <div className="text-[10px] font-semibold text-neon-cyan hidden sm:block">
                        {activeSector.badge}
                      </div>
                    </div>
                  ) : (
                    /* Mobile iPhone Top Notch / Dynamic Island */
                    <>
                      <div className="relative flex items-center justify-between border-b border-white/5 bg-slate-900/90 px-6 py-2 text-[10px] font-bold text-white select-none">
                        <span>09:41</span>
                        {/* Dynamic Island */}
                        <div className="absolute left-1/2 -translate-x-1/2 top-1.5 h-4 w-28 rounded-full bg-black flex items-center justify-between px-3">
                          <div className="h-2 w-2 rounded-full bg-slate-900 ring-1 ring-slate-800" />
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <Wifi className="h-3 w-3" />
                          <span className="text-[9px]">5G</span>
                          <Battery className="h-3.5 w-3.5" />
                        </div>
                      </div>

                      {/* Mobile URL Sub-bar */}
                      <div className="border-b border-white/10 bg-slate-900/50 px-3 py-1 text-center font-mono text-[10px] text-slate-400">
                        demo.terneon.com/{activeSector.id}
                      </div>
                    </>
                  )}

                  {/* Scrollable Screen Content */}
                  <div className="flex-1 overflow-y-auto">
                    {activeSectorId === 'cyberpunk-saas' && (
                      <CyberpunkSaaSTemplate isMobile={viewMode === 'mobile'} />
                    )}
                    {activeSectorId === 'web3-crypto' && (
                      <Web3CryptoTemplate isMobile={viewMode === 'mobile'} />
                    )}
                    {activeSectorId === 'neon-ecommerce' && (
                      <NeonECommerceTemplate isMobile={viewMode === 'mobile'} />
                    )}
                    {activeSectorId === 'ai-agency' && (
                      <AiAgencyTemplate isMobile={viewMode === 'mobile'} />
                    )}
                    {activeSectorId === 'fintech-terminal' && (
                      <FintechTerminalTemplate isMobile={viewMode === 'mobile'} />
                    )}
                    {activeSectorId === 'luxury-concept' && (
                      <LuxuryBrandTemplate isMobile={viewMode === 'mobile'} />
                    )}
                  </div>

                  {/* Bottom Home Indicator Bar for Mobile */}
                  {viewMode === 'mobile' && (
                    <div className="flex h-5 items-center justify-center bg-black/60">
                      <div className="h-1 w-28 rounded-full bg-white/40" />
                    </div>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  )
}
