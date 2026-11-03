'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Star,
  ChevronDown,
  MessageCircle,
  Sparkles,
  Send,
  CheckCircle2,
  X,
  Phone,
  Mail,
  User,
} from 'lucide-react'
import siteConfig from '@/config/siteConfig'
import { openWhatsAppDemoRequest } from '@/lib/whatsapp'
import { cn } from '@/lib/cn'

const testimonials = [
  {
    name: 'Dr. Mehmet Yılmaz',
    role: 'Kurucu Ortak',
    company: 'Vita Dental Klinik',
    avatar: '👨‍⚕️',
    text: 'Terneon ile çalışmaya başlamadan önce sitemiz mobilde çok yavaştı. Bize önce ücretsiz bir canlı demo hazırladılar, tasarımın şıklığına hayran kaldık. 2 haftada yayına girdik, online randevularımız %140 arttı.',
    stars: 5,
  },
  {
    name: 'Selin Demir',
    role: 'Pazarlama Direktörü',
    company: 'Aura Spa & Wellness',
    avatar: '💆‍♀️',
    text: 'Güzellik merkezimiz için tam aradığımız neon ve lüks havayı yakaladılar. Hediye kartı ve online rezervasyon sistemi kusursuz çalışıyor. Müşteri desteği her sorumuza dakikalar içinde yanıt veriyor.',
    stars: 5,
  },
  {
    name: 'Caner Özkan',
    role: 'İşletme Sahibi',
    company: 'Brew Lab Kahve',
    avatar: '☕',
    text: 'Masalara koyduğumuz QR menü ve dijital sipariş modülü işletmemizin işleyişini tamamen değiştirdi. Sayfalar o kadar hızlı açılıyor ki müşterilerimizden sürekli övgü alıyoruz.',
    stars: 5,
  },
]

const faqs = [
  {
    q: '“Önce Ücretsiz Demo” süreci tam olarak nasıl işliyor?',
    a: 'Sektörünüzü ve tasarım beklentilerinizi alıyoruz. 48 saat içinde markanıza özel, çalışan canlı bir web sitesi demosu hazırlayıp size iletiyoruz. Demoyu beğenir ve onaylarsanız paket seçip ödeme yapıyorsunuz; beğenmezseniz hiçbir ücret ödemiyorsunuz.',
  },
  {
    q: 'Web sitem ne kadar sürede tamamlanır ve yayına girer?',
    a: 'Onaylanan tasarımlar ortalama 7 ila 14 iş günü içinde tüm içerikleriniz ve ek modüllerinizle birlikte yayına hazır hale getirilir.',
  },
  {
    q: 'Aylık bakım ve sunucu aboneliğine neler dahil?',
    a: 'Hızlı bulut sunucu barındırma, SSL güvenlik sertifikası, günlük yedeklemeler, aylık içerik ve fiyat güncellemeleri ile sınırsız teknik destek aboneliğe dahildir.',
  },
  {
    q: 'Kendi alan adımı (domain) kullanabilir miyim?',
    a: 'Kesinlikle evet. Mevcut alan adınızı kolayca yönlendirebiliriz veya yeni bir alan adı almanıza yardımcı olabiliriz.',
  },
  {
    q: 'Sitenin yönetim panelinden içeriklerimi kendim güncelleyebilir miyim?',
    a: 'Evet, Yönetim Paneli ek modülü seçildiğinde metinleri, fotoğrafları, ürünleri ve menüleri teknik bilgiye gerek kalmadan kolayca yönetebileceğiniz modern bir admin panel teslim ediyoruz.',
  },
]

export default function TestimonialsAndFaq() {
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', email: '', note: '' })
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    openWhatsAppDemoRequest(form)
    setSubmitted(true)
    setTimeout(() => {
      setModalOpen(false)
      setSubmitted(false)
      setForm({ name: '', phone: '', email: '', note: '' })
    }, 2000)
  }

  return (
    <section className="relative py-24 bg-[#070a12]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Testimonials */}
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-neon-violet/30 bg-neon-violet/5 px-3.5 py-1 text-xs font-semibold text-neon-violet">
            <Star className="h-3.5 w-3.5 fill-current" />
            Müşteri Deneyimleri
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Mutlu Müşterilerimizin Yorumları
          </h2>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md"
            >
              <div>
                <div className="flex gap-1 text-amber-400">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-4 text-xs text-slate-300 leading-relaxed italic">
                  “{t.text}”
                </p>
              </div>

              <div className="mt-6 flex items-center gap-3 border-t border-white/10 pt-4">
                <span className="text-2xl">{t.avatar}</span>
                <div>
                  <h4 className="font-bold text-xs text-white">{t.name}</h4>
                  <p className="text-[11px] text-slate-400">
                    {t.role} — {t.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-24">
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-neon-cyan/30 bg-neon-cyan/5 px-3.5 py-1 text-xs font-semibold text-neon-cyan">
              <Sparkles className="h-3.5 w-3.5" />
              Merak Edilenler
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Sıkça Sorulan Sorular
            </h2>
          </div>

          <div className="mx-auto mt-12 max-w-3xl space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx
              return (
                <div
                  key={idx}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between p-5 text-left transition hover:bg-white/[0.04]"
                  >
                    <span className="font-semibold text-sm text-white">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 text-slate-400 transition-transform duration-200',
                        isOpen && 'rotate-180 text-neon-cyan'
                      )}
                    />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="border-t border-white/5 p-5 text-xs leading-relaxed text-slate-400">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </div>

        {/* CTA Banner */}
        <div className="mt-20 overflow-hidden rounded-3xl border border-neon-cyan/30 bg-gradient-to-r from-neon-cyan/10 via-neon-violet/10 to-transparent p-8 text-center sm:p-12 shadow-glow-soft">
          <h3 className="font-display text-2xl font-black text-white sm:text-3xl">
            Sektörünüze Özel Canlı Demoyu Şimdi Hazırlayalım
          </h3>
          <p className="mx-auto mt-3 max-w-xl text-xs sm:text-sm text-slate-300">
            Hiçbir ön ödeme yapmadan, firmanıza özel hazırlayacağımız konsepti görün, test edin ve öyle karar verin.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => setModalOpen(true)}
              className="focus-ring flex items-center gap-2 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-violet px-8 py-3.5 text-sm font-bold text-[#070a12] shadow-glow-cyan hover:scale-[1.02] transition-transform"
            >
              <Sparkles className="h-4 w-4" />
              Ücretsiz Demo İste
            </button>
            <a
              href={`https://wa.me/${siteConfig.contact.whatsapp}?text=Merhaba%20Terneon!%20Hizmetleriniz%20hakkında%20bilgi%20almak%20istiyorum.`}
              target="_blank"
              rel="noreferrer"
              className="focus-ring flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/10"
            >
              <MessageCircle className="h-4 w-4 text-emerald-400" />
              WhatsApp Danışma Hattı
            </a>
          </div>
        </div>
      </div>

      {/* Demo Request Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md rounded-3xl border border-white/20 bg-[#070a12] p-6 shadow-2xl"
            >
              <button
                onClick={() => setModalOpen(false)}
                className="absolute right-5 top-5 rounded-lg p-1 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="text-center">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-neon-cyan/10 text-neon-cyan">
                  <Sparkles className="h-5 w-5" />
                </span>
                <h3 className="mt-3 font-display text-lg font-bold text-white">
                  Ücretsiz Demo Talebi
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  Bilgilerinizi bırakın, 48 saat içinde sektörünüze özel çalışan canlı demoyu WhatsApp&apos;tan iletelim.
                </p>
              </div>

              {submitted ? (
                <div className="my-8 text-center text-xs font-semibold text-emerald-400">
                  <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-emerald-400" />
                  Talebiniz WhatsApp üzerinden açılıyor...
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-6 space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400">
                      Ad Soyad / Firma Adı
                    </label>
                    <div className="relative mt-1">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                      <input
                        type="text"
                        required
                        placeholder="Örn: Dr. Ahmet Yılmaz / Vita Klinik"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-neon-cyan"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400">
                      WhatsApp Telefon Numarası
                    </label>
                    <div className="relative mt-1">
                      <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                      <input
                        type="tel"
                        required
                        placeholder="0555 123 45 67"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-neon-cyan"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400">
                      E-Posta Adresi (Opsiyonel)
                    </label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                      <input
                        type="email"
                        placeholder="ahmet@example.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-neon-cyan"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400">
                      Sektörünüz & Beklentileriniz
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Örn: Diş kliniğimiz için online randevulu ve hekim tanıtımlı bir site."
                      value={form.note}
                      onChange={(e) => setForm({ ...form, note: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-neon-cyan"
                    />
                  </div>

                  <button
                    type="submit"
                    className="focus-ring mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-violet py-3 text-xs font-bold text-[#070a12] shadow-glow-cyan"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Demoyu WhatsApp ile Başlat
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  )
}

