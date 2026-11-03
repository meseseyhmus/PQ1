'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2,
  ShoppingCart,
  Code2,
  LayoutDashboard,
  TrendingUp,
  Languages,
  Bot,
  Sparkles,
  CheckCircle2,
  Send,
  ShieldCheck,
  Check,
  Copy,
  Terminal,
  Zap,
} from 'lucide-react'
import siteConfig, {
  type PricingItem,
} from '@/config/siteConfig'
import { formatCurrencyTL } from '@/lib/format'
import {
  openWhatsAppQuote,
  buildQuoteMessage,
  buildWhatsAppQuoteHref,
} from '@/lib/whatsapp'
import type { SubscriptionChoice } from '@/types'
import { cn } from '@/lib/cn'

const serviceIcons: Record<string, React.ElementType> = {
  Building2,
  ShoppingCart,
  Code2,
}

const addonIcons: Record<string, React.ElementType> = {
  LayoutDashboard,
  TrendingUp,
  Languages,
  Bot,
  Sparkles,
}

export default function PriceCalculator() {
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    siteConfig.pricing.services[0].id
  )
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([
    'panel',
    'seo',
  ])
  const [subscriptionChoice, setSubscriptionChoice] =
    useState<SubscriptionChoice>('monthly')
  const [copyFeedback, setCopyFeedback] = useState(false)
  const [displayedTerminalText, setDisplayedTerminalText] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const selectedService =
    siteConfig.pricing.services.find((s) => s.id === selectedServiceId) ?? null

  const selectedAddons = siteConfig.pricing.addons.filter((a) =>
    selectedAddonIds.includes(a.id)
  )

  const selectedSub =
    subscriptionChoice === 'monthly'
      ? siteConfig.pricing.subscription.monthly
      : siteConfig.pricing.subscription.yearly

  const oneOffTotal =
    (selectedService?.price ?? 0) +
    selectedAddons.reduce((sum, a) => sum + a.price, 0)

  const quoteMessage = buildQuoteMessage({
    service: selectedService,
    addons: selectedAddons,
    subscription: selectedSub,
  })

  const whatsAppHref = buildWhatsAppQuoteHref({
    service: selectedService,
    addons: selectedAddons,
    subscription: selectedSub,
  })

  // Dynamic Typewriter Effect for the Retro-Futuristic Terminal
  useEffect(() => {
    let currentIdx = 0
    setIsTyping(true)
    setDisplayedTerminalText('')

    const fullTerminalLog = [
      `// TERNEON-PRICING-KERNEL v4.8 [REALTIME ENGINE]`,
      `// Hedef Paket: ${selectedService?.name || 'Seçilmedi'}`,
      `----------------------------------------`,
      quoteMessage,
      `----------------------------------------`,
      `// Durum: %100 Hazır · 1 Tıkla WhatsApp'a Aktarılabilir.`,
    ].join('\n')

    const timer = setInterval(() => {
      currentIdx += 5 // Fast & responsive typewriter stream
      if (currentIdx >= fullTerminalLog.length) {
        setDisplayedTerminalText(fullTerminalLog)
        setIsTyping(false)
        clearInterval(timer)
      } else {
        setDisplayedTerminalText(fullTerminalLog.slice(0, currentIdx))
      }
    }, 10)

    return () => clearInterval(timer)
  }, [quoteMessage, selectedService?.name])

  function toggleAddon(id: string) {
    setSelectedAddonIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  function handleSendQuote(e?: React.MouseEvent) {
    if (e) e.preventDefault()
    openWhatsAppQuote({
      service: selectedService,
      addons: selectedAddons,
      subscription: selectedSub,
    })
  }

  function handleCopyQuote() {
    navigator.clipboard.writeText(quoteMessage)
    setCopyFeedback(true)
    setTimeout(() => setCopyFeedback(false), 2500)
  }

  return (
    <section id="fiyat-hesapla" className="relative py-24 scroll-mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-neon-violet/40 bg-neon-violet/10 px-3.5 py-1 text-xs font-semibold text-neon-violet">
            <Sparkles className="h-3.5 w-3.5" />
            İnteraktif Paket & Fiyat Hesaplayıcı
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Kendi Web Paketinizi Oluşturun
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-400 text-sm sm:text-base">
            Sürpriz maliyetler yok. 3 temel hizmet ve 5 ek modül arasından seçiminizi yapın; anlık retro terminalde typewriter efektiyle teklifinizi görün ve tek tıkla doğrudan WhatsApp'a aktarın.
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-12">
          {/* Left Column: 3 Steps */}
          <div className="space-y-12 lg:col-span-7">
            {/* Step 1: Base Service */}
            <div>
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-neon-cyan text-xs font-black text-[#070a12]">
                  1
                </span>
                <div>
                  <h3 className="font-display text-xl font-bold text-white">
                    Temel Hizmet Paketi (3 Çözüm)
                  </h3>
                  <p className="text-xs text-slate-400">
                    İşletmenizin ölçeğine ve hedeflerinize uygun çekirdek altyapıyı seçin.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {siteConfig.pricing.services.map((srv) => {
                  const Icon = serviceIcons[srv.icon] || Building2
                  const isSelected = selectedServiceId === srv.id

                  return (
                    <button
                      key={srv.id}
                      type="button"
                      onClick={() => setSelectedServiceId(srv.id)}
                      className={cn(
                        'focus-ring group relative flex flex-col justify-between rounded-2xl border p-5 text-left transition-all',
                        isSelected
                          ? 'border-neon-cyan bg-neon-cyan/[0.08] shadow-glow-cyan'
                          : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
                      )}
                    >
                      {isSelected && (
                        <span className="absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full bg-neon-cyan text-[#070a12]">
                          <Check className="h-3.5 w-3.5 stroke-[3]" />
                        </span>
                      )}
                      <div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-neon-cyan">
                          <Icon className="h-5 w-5" />
                        </div>
                        <h4 className="mt-4 font-display text-base font-bold text-white">
                          {srv.name}
                        </h4>
                        <p className="mt-1.5 text-xs text-slate-400 line-clamp-3">
                          {srv.description}
                        </p>
                      </div>
                      <div className="mt-6 border-t border-white/10 pt-4 font-display text-lg font-extrabold text-neon-cyan">
                        {formatCurrencyTL(srv.price)}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Step 2: Addons */}
            <div>
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-neon-violet text-xs font-black text-white">
                  2
                </span>
                <div>
                  <h3 className="font-display text-xl font-bold text-white">
                    Modüler Ek Hizmetler (5 Seçenek)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Sitenizin dönüşüm oranını ve işlevselliğini güçlendirecek modülleri işaretleyin.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {siteConfig.pricing.addons.map((addon) => {
                  const Icon = addonIcons[addon.icon] || Sparkles
                  const isChecked = selectedAddonIds.includes(addon.id)

                  return (
                    <div
                      key={addon.id}
                      onClick={() => toggleAddon(addon.id)}
                      className={cn(
                        'focus-ring flex cursor-pointer items-start justify-between rounded-2xl border p-4 transition-all',
                        isChecked
                          ? 'border-neon-violet bg-neon-violet/[0.08] shadow-glow-soft'
                          : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors',
                            isChecked
                              ? 'border-neon-violet bg-neon-violet text-white'
                              : 'border-white/20 bg-white/5'
                          )}
                        >
                          {isChecked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-neon-violet" />
                            <h4 className="font-semibold text-sm text-white">
                              {addon.name}
                            </h4>
                          </div>
                          <p className="mt-1 text-xs text-slate-400">
                            {addon.description}
                          </p>
                        </div>
                      </div>
                      <span className="shrink-0 font-display text-xs font-bold text-neon-violet">
                        +{formatCurrencyTL(addon.price)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Step 3: Maintenance & Hosting Subscription Toggle */}
            <div>
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-neon-cyan text-xs font-black text-[#070a12]">
                  3
                </span>
                <div>
                  <h3 className="font-display text-xl font-bold text-white">
                    Bakım, Sunucu & Teknik Destek Aboneliği
                  </h3>
                  <p className="text-xs text-slate-400">
                    Sitenizin 7/24 kesintisiz, güvenli ve güncel kalması için periyodunuzu seçin.
                  </p>
                </div>
              </div>

              {/* Billing Cycle Toggle */}
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {/* Monthly */}
                <div
                  onClick={() => setSubscriptionChoice('monthly')}
                  className={cn(
                    'cursor-pointer rounded-2xl border p-5 transition-all',
                    subscriptionChoice === 'monthly'
                      ? 'border-neon-cyan bg-neon-cyan/[0.08] shadow-glow-cyan'
                      : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white">Aylık Abonelik</h4>
                      <span className="text-[11px] text-slate-400">Esnek iptal edilebilir</span>
                    </div>
                    <span className="font-display font-bold text-neon-cyan">
                      {formatCurrencyTL(siteConfig.pricing.subscription.monthly.price)} / ay
                    </span>
                  </div>
                  <ul className="mt-4 space-y-1.5 text-xs text-slate-400">
                    {siteConfig.pricing.subscription.monthly.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Yearly */}
                <div
                  onClick={() => setSubscriptionChoice('yearly')}
                  className={cn(
                    'relative cursor-pointer rounded-2xl border p-5 transition-all',
                    subscriptionChoice === 'yearly'
                      ? 'border-neon-cyan bg-neon-cyan/[0.08] shadow-glow-cyan'
                      : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                  )}
                >
                  <span className="absolute -top-2.5 right-4 rounded-full bg-gradient-to-r from-neon-cyan to-neon-violet px-3 py-0.5 text-[10px] font-black text-[#070a12] shadow-glow-cyan">
                    2 Ay Hediye (%17 İndirim)
                  </span>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white">Yıllık Abonelik</h4>
                      <span className="text-[11px] text-slate-400">Yıllık peşin tasarruflu</span>
                    </div>
                    <span className="font-display font-bold text-neon-cyan">
                      {formatCurrencyTL(siteConfig.pricing.subscription.yearly.price)} / yıl
                    </span>
                  </div>
                  <ul className="mt-4 space-y-1.5 text-xs text-slate-400">
                    {siteConfig.pricing.subscription.yearly.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Retro-Futuristic Live WhatsApp Pricing Terminal */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 overflow-hidden rounded-3xl border border-emerald-500/30 bg-[#060b11] p-5 sm:p-6 shadow-2xl backdrop-blur-xl ring-1 ring-emerald-500/20">
              {/* Terminal Top Bar */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3 select-none">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-[#ff5f56]" />
                  <div className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
                  <div className="h-3 w-3 rounded-full bg-[#27c93f]" />
                  <span className="ml-2 font-mono text-[11px] text-slate-400">
                    terneon-pricing:~#
                  </span>
                </div>

                <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-mono text-emerald-400 font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>STREAM: LIVE</span>
                </div>
              </div>

              {/* Dynamic Financial Totals Bar */}
              <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3 text-left">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">
                    Tek Seferlik Kurulum
                  </span>
                  <div className="font-display text-xl sm:text-2xl font-black text-white">
                    {formatCurrencyTL(oneOffTotal)}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">
                    Sunucu & Bakım
                  </span>
                  <div className="font-display text-base sm:text-lg font-bold text-neon-cyan">
                    {formatCurrencyTL(selectedSub.price)} / {selectedSub.period}
                  </div>
                </div>
              </div>

              {/* CRT Phosphor Terminal Output Area with Real-Time Typewriter */}
              <div className="relative mt-4 overflow-hidden rounded-xl border border-emerald-500/20 bg-black/90 p-3.5 font-mono text-[11px] text-emerald-300 shadow-inner">
                {/* Subtle CRT Scanline */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.06]"
                  style={{
                    backgroundImage:
                      'linear-gradient(rgba(16, 185, 129, 0.4) 1px, transparent 1px)',
                    backgroundSize: '100% 3px',
                  }}
                />

                <div className="flex items-center justify-between text-[10px] text-slate-500 border-b border-white/10 pb-1.5 mb-2">
                  <span>TERMINAL_OUTPUT.log</span>
                  <span className="text-emerald-400 font-semibold">UTF-8 URL-ENCODED</span>
                </div>

                <pre className="whitespace-pre-wrap leading-relaxed select-all min-h-[140px] text-emerald-200">
                  {displayedTerminalText}
                  <span className="inline-block animate-pulse text-emerald-400 font-bold ml-0.5">
                    ▋
                  </span>
                </pre>

                <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2.5">
                  <span className="text-[10px] text-slate-500">
                    Karakter: {displayedTerminalText.length} bayt
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyQuote}
                    className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold text-white hover:border-emerald-400/40 hover:bg-white/10 transition"
                  >
                    <Copy className="h-3 w-3 text-emerald-400" />
                    {copyFeedback ? 'Kopyalandı!' : 'Metni Kopyala'}
                  </button>
                </div>
              </div>

              {/* 1-Click WhatsApp CTA Button */}
              <a
                href={whatsAppHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleSendQuote}
                className="focus-ring mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 via-neon-cyan to-neon-violet py-3.5 text-sm font-bold text-[#070a12] shadow-glow-cyan transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <Send className="h-4 w-4" />
                <span>WhatsApp Teklifi Oluştur & Gönder ↗</span>
              </a>

              <div className="mt-3 flex items-center justify-center gap-1.5 text-center text-[11px] text-slate-400">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>Önce ücretsiz demo incelenir, ödeme onay sonrasıdır.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
