import Hero from '@/components/Hero'
import TrustAndStats from '@/components/TrustAndStats'
import DemoShowcase from '@/components/DemoShowcase'
import ProcessSection from '@/components/ProcessSection'
import PriceCalculator from '@/components/PriceCalculator'
import TestimonialsAndFaq from '@/components/TestimonialsAndFaq'

export default function TerneonPage() {
  return (
    <div className="flex flex-col bg-[#070a12] text-slate-100 selection:bg-neon-cyan/30 selection:text-white">
      <Hero />
      <TrustAndStats />
      <DemoShowcase />
      <ProcessSection />
      <PriceCalculator />
      <TestimonialsAndFaq />
    </div>
  )
}

