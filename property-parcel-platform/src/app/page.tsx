"use client";

import { useState } from "react";
import { HeroSection } from "@/components/hero/HeroSection";
import { ParcelSearchSection } from "@/components/search/ParcelSearchSection";
import { InteractiveMap } from "@/components/map/InteractiveMap";
import { ParcelDetailSection } from "@/components/parcel-detail/ParcelDetailSection";
import { FileToolsSection } from "@/components/file-tools/FileToolsSection";
import { PropertyComparisonSection } from "@/components/comparison/PropertyComparisonSection";

export default function Home() {
  const [activeSection, setActiveSection] = useState<
    "hero" | "search" | "map" | "detail" | "files" | "comparison"
  >("hero");

  const sections = [
    { key: "hero", label: "Ana Sayfa", icon: "🏠" },
    { key: "search", label: "Parça Sorgula", icon: "🔍" },
    { key: "map", label: "Harita Görünümü", icon: "🗺️" },
    { key: "detail", label: "Parça Detayları", icon: "📋" },
    { key: "files", label: "Dosyalar & Dönüşüm", icon: "📁" },
    { key: "comparison", label: "Karşılaştırma", icon: "📊" },
  ];

  return (
    <section className="min-h-screen bg-[--background] text-[--foreground]">
      {/* Navigation */}
      <nav className="border-b border-[--border] bg-[--card] sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-8">
          {sections.map((section) => (
            <button
              key={section.key}
              onClick={() => setActiveSection(section.key as any)}
              className={activeSection === section.key
                ? "border-b-2 border-[var(--primary)] text-[var(--primary)]"
                : "text-[--muted] hover:text-[--foreground] transition-colors"}
            >
              {section.icon} {section.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {activeSection === "hero" && <HeroSection />}
        {activeSection === "search" && <ParcelSearchSection />}
        {activeSection === "map" && <InteractiveMap />}
        {activeSection === "detail" && <ParcelDetailSection />}
        {activeSection === "files" && <FileToolsSection />}
        {activeSection === "comparison" && <PropertyComparisonSection />}
      </div>
    </section>
  );
}