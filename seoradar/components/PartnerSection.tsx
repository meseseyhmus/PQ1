import {
  ArrowUpRight,
  BadgeCheck,
  Mail,
  Server,
  Search,
  Globe,
  type LucideIcon,
} from "lucide-react";
import {
  CATEGORY_LABELS,
  PARTNERS,
  type PartnerCategory,
} from "@/config/partners";

const CATEGORY_ICONS: Record<PartnerCategory, LucideIcon> = {
  hosting: Server,
  seo: Search,
  domain: Globe,
  other: Mail,
};

const CATEGORY_STYLES: Record<PartnerCategory, string> = {
  hosting: "bg-brand-50 text-brand-700 border-brand-200",
  seo: "bg-indigo-50 text-indigo-700 border-indigo-200",
  domain: "bg-emerald-50 text-emerald-700 border-emerald-200",
  other: "bg-amber-50 text-amber-700 border-amber-200",
};

export function PartnerSection() {
  return (
    <section id="ortaklar" className="border-t border-slate-200 bg-slate-50 py-16">
      <div className="container-x">
        <div className="text-center">
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
            İş Ortaklarımız
          </span>
          <h2 className="mt-3 text-3xl font-black text-slate-900">
            Önerilen Hosting &amp; SEO Araçları
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-600">
            SeoRadar raporunuzda eksik bulduğunuz altyapı ve araçları tamamlamak
            için derlediğimiz, SEO dostu hizmetler.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PARTNERS.map((partner) => {
            const Icon = CATEGORY_ICONS[partner.category];
            return (
              <div
                key={partner.id}
                className="flex flex-col rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${CATEGORY_STYLES[partner.category]}`}
                  >
                    <Icon className="size-3" />
                    {CATEGORY_LABELS[partner.category]}
                  </span>
                  <BadgeCheck className="size-4 shrink-0 text-brand-500" />
                </div>

                <h3 className="mt-4 text-base font-bold text-slate-900">
                  {partner.name}
                </h3>
                <p className="mt-2 flex-1 text-xs leading-relaxed text-slate-600">
                  {partner.description}
                </p>

                <a
                  href={partner.href}
                  target="_blank"
                  rel="sponsored noopener noreferrer"
                  className="mt-5 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800"
                >
                  {partner.cta}
                  <ArrowUpRight className="size-3.5" />
                </a>
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-center text-xs text-slate-400">
          Bağlantılar ortaklık (affiliate) bağlantısıdır; sizin için ek maliyet
          oluşturmaz.
        </p>
      </div>
    </section>
  );
}
