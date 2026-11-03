'use client'

import { motion } from 'framer-motion'
import { Search, PenTool, Code2, Rocket, ArrowRight } from 'lucide-react'
import siteConfig from '@/config/siteConfig'

const stepIcons: Record<string, React.ElementType> = {
  Search,
  PenTool,
  Code2,
  Rocket,
}

export default function ProcessSection() {
  return (
    <section id="surec" className="relative py-24 scroll-mt-16 bg-[#070a12]/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-neon-cyan/30 bg-neon-cyan/5 px-3.5 py-1 text-xs font-semibold text-neon-cyan">
            <Rocket className="h-3.5 w-3.5" />
            Çalışma Sürecimiz
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            4 Adımda Yayına Hazır Web Siteniz
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-400 text-sm sm:text-base">
            Karmaşık teknik süreçleri sizin için basitleştiriyoruz. Önce ücretsiz demoyu hazırlıyoruz, onayınızdan sonra yayına alıyoruz.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {siteConfig.process.map((step, idx) => {
            const Icon = stepIcons[step.icon] || Code2
            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="group relative rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md transition-all hover:border-neon-cyan/40 hover:bg-white/[0.04]"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-3xl font-black text-white/20 group-hover:text-neon-cyan/40 transition-colors">
                    {step.step}
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neon-cyan/10 text-neon-cyan">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>

                <h3 className="mt-6 font-display text-lg font-bold text-white">
                  {step.title}
                </h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

