"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Sparkles,
  CheckCircle2,
  MessageCircle,
  X,
  Send,
  Globe,
  Phone,
  Mail,
  User,
  Building,
  Copy,
  Check,
  ChevronDown,
} from "lucide-react";

interface AgencyContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultUrl?: string;
  auditScore?: number;
  cwvRating?: string;
  securityScore?: number;
}

export function AgencyContactModal({
  isOpen,
  onClose,
  defaultUrl = "",
  auditScore,
  cwvRating,
  securityScore,
}: AgencyContactModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [website, setWebsite] = useState(defaultUrl);
  const [service, setService] = useState("Teknik SEO & Core Web Vitals Denetimi");
  const [budget, setBudget] = useState("15.000 ₺ - 35.000 ₺ / ay");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  // defaultUrl güncellendiğinde formu senkronize et
  useEffect(() => {
    if (defaultUrl) {
      setWebsite(defaultUrl);
    }
  }, [defaultUrl]);

  // WhatsApp için profesyonel formatlanmış teklif metni
  const formattedProposal = useMemo(() => {
    const lines = [
      "🌟 *SEORADAR AJANS & KURUMSAL SEO DANIŞMANLIK TALEBİ*",
      "──────────────────────────────",
      `👤 *İsim Soyisim:* ${name.trim() || "Belirtilmedi"}`,
      `🏢 *Şirket:* ${company.trim() || "Belirtilmedi"}`,
      `🌐 *Web Sitesi:* ${website.trim() || defaultUrl || "Belirtilmedi"}`,
      `📞 *Telefon:* ${phone.trim() || "Belirtilmedi"}`,
      `✉️ *E-Posta:* ${email.trim() || "Belirtilmedi"}`,
      "",
      "📊 *DENETİM METRİKLERİ & SKORLAR:*",
    ];

    if (typeof auditScore === "number") {
      lines.push(`• Genel SEO Skoru: ${auditScore}/100`);
    }
    if (cwvRating) {
      lines.push(`• Core Web Vitals: ${cwvRating.toUpperCase()}`);
    }
    if (typeof securityScore === "number") {
      lines.push(`• Güvenlik Başlıkları: ${securityScore}/100`);
    }

    lines.push(
      "",
      `🎯 *Talep Edilen Hizmet:* ${service}`,
      `💰 *Bütçe Aralığı:* ${budget}`,
      "",
      `📝 *Özel Not / Hedefler:*`,
      message.trim() ||
        "Web sitemiz için detaylı Core Web Vitals iyileştirmesi, teknik SEO yol haritası ve organik büyüme stratejisi hakkında teklifinizi rica ederiz."
    );

    return lines.join("\n");
  }, [name, company, website, defaultUrl, phone, email, auditScore, cwvRating, securityScore, service, budget, message]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleCopyProposal = async () => {
    try {
      await navigator.clipboard.writeText(formattedProposal);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = formattedProposal;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleWhatsAppDirect = () => {
    const text = encodeURIComponent(formattedProposal);
    const waUrl = `https://wa.me/905320000000?text=${text}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          aria-label="Kapat"
        >
          <X className="h-5 w-5" />
        </button>

        {submitted ? (
          <div className="py-8 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">Teklif Talebiniz Alındı!</h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Web siteniz ({website || defaultUrl}) için hazırlayacağımız 24 sayfalık teknik SEO ve rakip açığı analizi ile birlikte uzmanımız en geç <strong>2 saat içinde</strong> sizinle iletişime geçecektir.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={handleWhatsAppDirect}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp&apos;tan Anında Başlat
              </button>
              <button
                type="button"
                onClick={handleCopyProposal}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-6 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                {copied ? "Kopyalandı!" : "Metni Kopyala"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  onClose();
                }}
                className="rounded-xl border border-slate-200 px-5 py-3 text-xs font-semibold text-slate-500 hover:bg-slate-50 transition"
              >
                Kapat
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 text-brand-600 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="h-4 w-4 text-brand-600" />
              Kurumsal SEO &amp; Büyüme Çözümleri
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              Özel Danışmanlık &amp; Ajans Teklifi Alın
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Uzman ekibimiz sitenizi manuel olarak denetlesin, Google sıralamalarında ilk sayfaya yükselme stratejinizi belirlesin.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Ad Soyad *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      required
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ahmet Yılmaz"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    İş E-Postası *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ahmet@sirketiniz.com"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Telefon / WhatsApp *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      required
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0532 123 45 67"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Şirket / Marka Adı
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Örn: Akın Teknoloji A.Ş."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  İncelenecek Web Sitesi URL
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://sirketiniz.com"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    İhtiyaç Duyulan Hizmet
                  </label>
                  <select
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  >
                    <option>Teknik SEO &amp; Core Web Vitals Denetimi</option>
                    <option>Aylık Tam Kapsamlı SEO Yönetimi</option>
                    <option>E-Ticaret Kategori &amp; Gelir Odaklı SEO</option>
                    <option>Algoritma Cezası &amp; Backlink Temizliği</option>
                    <option>Uluslararası (Global) Çok Dilli SEO</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Tahmini Aylık Bütçe
                  </label>
                  <select
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  >
                    <option>10.000 ₺ - 20.000 ₺ / ay</option>
                    <option>20.000 ₺ - 45.000 ₺ / ay</option>
                    <option>45.000 ₺ - 100.000 ₺ / ay</option>
                    <option>100.000 ₺+ / Kurumsal Özel</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Hedefleriniz veya Karşılaştığınız Sorunlar (Opsiyonel)
                </label>
                <textarea
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Örn: Son Google güncellemesinden sonra organik trafikte %30 düşüş yaşadık..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              {/* Canlı WhatsApp Teklif Önizleme Akordeonu */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
                <button
                  type="button"
                  onClick={() => setPreviewOpen(!previewOpen)}
                  className="flex w-full items-center justify-between text-left text-xs font-bold text-slate-700"
                >
                  <span className="flex items-center gap-1.5 text-emerald-700">
                    <MessageCircle className="h-3.5 w-3.5" />
                    WhatsApp Teklif Mesajı Önizlemesi
                  </span>
                  <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${previewOpen ? "rotate-180" : ""}`} />
                </button>

                {previewOpen && (
                  <div className="mt-3">
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3 font-mono text-[11px] leading-relaxed text-slate-800 whitespace-pre-wrap">
                      {formattedProposal}
                    </div>
                    <div className="mt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={handleCopyProposal}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-slate-900"
                      >
                        {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                        {copied ? "Kopyalandı!" : "Metni Kopyala"}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-brand-600 py-3 text-xs font-bold text-white shadow-glow hover:bg-brand-700 transition flex items-center justify-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Teklif Talebini Gönder
                </button>
                <button
                  type="button"
                  onClick={handleWhatsAppDirect}
                  className="rounded-xl border border-emerald-500/30 bg-emerald-600 text-white px-5 py-3 text-xs font-bold hover:bg-emerald-700 transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp ile Başlat
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
