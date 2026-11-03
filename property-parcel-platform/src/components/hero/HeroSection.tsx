"use client";

import { useState } from "react";

export function HeroSection() {
  const [showFeatures, setShowFeatures] = useState(false);

  return (
    <section className="min-h-[60vh] bg-gradient-to-b from-[--background] via-[--muted] to-[--background] text-[--foreground] relative overflow-hidden">
      <div className="absolute inset-0">
        <svg className="absolute -top-6 -right-6 w-96 h-96 bg-[var(--accent-blue)] rounded-full opacity-20 blur-3xl" aria-hidden="true" />
      </div>
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="max-w-5xl text-center">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Property & Parcel Management
          </h1>
          <p className="text-2xl md:text-lg text-[--muted-foreground] max-w-2xl mx-auto mb-10">
            Search, analyze, and manage land parcels with precision. From zoning regulations to price comparisons — find any property instantly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              className="inline-flex items-center px-6 py-3 border border-[var(--primary)] rounded-full bg-[var(--primary)] text-[--primary-foreground] hover:bg-[var(--primary-foreground)] hover:text-[var(--primary)] transition-colors font-medium"
            >
              Search Parcels
              <svg className="-ml-1 mr-2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 21l-6-6l6-6"/>
              </svg>
            </button>
            <button 
              className="inline-flex items-center px-6 py-3 border border-[var(--accent-teal)] rounded-full bg-white text-[--accent-teal] hover:bg-[var(--accent-teal)] hover:text-white transition-colors font-medium"
            >
              Browse Properties
              <svg className="-ml-1 mr-2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 21l-6-6l6-6"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}