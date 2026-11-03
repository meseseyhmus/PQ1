'use client'

import { motion } from 'framer-motion'
import {
  MonitorPlay,
  Rocket,
  Headphones,
  Gauge,
  CheckCircle2,
} from 'lucide-react'
import siteConfig from '@/config/siteConfig'

const badgeIcons: Record<string, React.ElementType> = {
  MonitorPlay,
  Rocket,
  Headphones,
  Gauge,
}

export default function TrustAndStats() {
  return (
    <section id="guven" className="relative py-16 border-y border-white/10 bg-white/[0.01]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {siteConfig.stats.map((stat, i) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 text-center"
            >
              <div className="font-display text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-violet sm:text-4xl">
                {stat.value}
                {stat.suffix}
              </div>
              <div className="mt-2 text-xs font-medium text-slate-400">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {siteConfig.trustBadges.map((badge, i) => {
            const Icon = badgeIcons[badge.icon] || CheckCircle2
            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neon-cyan/10 text-neon-cyan">
                  <Icon className="h-5 w-5" />
                </div>
                <h4 className="mt-4 font-display font-bold text-sm text-white">
                  {badge.title}
                </h4>
                <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                  {badge.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

