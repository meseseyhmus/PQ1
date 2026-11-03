"use client";

import { useCallback, useState } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ConverterTabs from "@/components/ConverterTabs";
import AdBanner from "@/components/AdBanner";
import Footer from "@/components/Footer";
import PricingModal from "@/components/PricingModal";

export default function Home() {
  const [pricingOpen, setPricingOpen] = useState(false);

  const scrollToConverter = useCallback(() => {
    document
      .getElementById("donusturucu")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Header onOpenPricing={() => setPricingOpen(true)} />
      <Hero onCta={scrollToConverter} />

      <main id="donusturucu" className="mx-auto w-full max-w-7xl flex-1 px-4 pb-16 sm:px-6">
        <div className="flex gap-6">
          {/* Left sidebar ad column — hidden below xl */}
          <aside className="hidden w-[300px] shrink-0 xl:block" aria-label="Sol reklam alanı">
            <AdBanner slot="left" />
          </aside>

          <div className="min-w-0 flex-1">
            <ConverterTabs />
            {/* Wide leaderboard ad below the converter */}
            <AdBanner slot="bottom" className="mt-8" />
          </div>

          {/* Right sidebar ad column — hidden below xl */}
          <aside className="hidden w-[300px] shrink-0 xl:block" aria-label="Sağ reklam alanı">
            <AdBanner slot="right" />
          </aside>
        </div>
      </main>

      <Footer />

      {pricingOpen && <PricingModal onClose={() => setPricingOpen(false)} />}
    </div>
  );
}
