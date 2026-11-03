"use client";

import { useState } from "react";

export function ParcelSearchSection() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ParcelResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate search
    await new Promise(resolve => setTimeout(resolve, 1000));
    setResults([
      { id: "1", block: "123", parsel: "45/1", area: "500 m²", nature: "Arsa", price: "2.500.000 ₺", status: "Aktif" },
      { id: "2", block: "124", parsel: "45/2", area: "350 m²", nature: "Arsa", price: "1.800.000 ₺", status: "Aktif" },
      { id: "3", block: "125", parsel: "45/3", area: "750 m²", nature: "Bina", price: "4.200.000 ₺", status: "Rezerve" },
    ]);
    setLoading(false);
  };

  return (
    <section className="py-16 bg-[--background]">
      <div className="max-w-7xl mx-auto px-4">
        <form onSubmit={handleSearch} className="grid max-w-2xl mx-auto gap-4">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[--muted]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-6-6l-6 6" />
            </svg>
            <input
              type="text"
              placeholder="Parça numarası, mahalle veya adres..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-14 pr-4 py-4 border border-[var(--border)] rounded-xl text-[--foreground] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-50 transition-colors"
              required
            />
            <label className="absolute left-3 top-1/2 -translate-y-1/2 text-[--muted] text-sm">Parça numarası</label>
          </div>
          <button type="submit" className="w-full py-4 bg-[var(--primary)] text-[--primary-foreground] rounded-xl font-medium hover:opacity-90 transition-opacity">
            <svg className="-inline mr-2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-6-6l6-6" />
            </svg>
            Sorgula
          </button>
        </form>

        {loading && (
          <div className="mt-6 text-center">
            <svg className="mx-auto w-8 h-8 text-[--muted] animate-spin" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="none" strokeWidth="3" />
            </svg>
            <span className="ml-2">Sorgulanıyor...</span>
          </div>
        )}

        {results.length > 0 && (
          <div className="mt-8 space-y-4">
            <h3 className="text-xl font-semibold text-[--foreground]">Sorgulama Sonuçları ({results.length})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((result) => (
                <div key={result.id} className="border rounded-xl p-4 hover:bg-[--card] transition-colors">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><strong>Parça:</strong> {result.parsel}</div>
                    <div><strong>Mahalle:</strong> {result.block}</div>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div><strong>Alan:</strong> {result.area}</div>
                    <div><strong>Doğal Durum:</strong> {result.nature}</div>
                  </div>
                  <div className="mt-3 pt-3 border-t">
                    <div><strong>Fiyat:</strong> {result.price}</div>
                    <div><strong>Durum:</strong> <span className="font-medium">{result.status}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

interface ParcelResult {
  id: string;
  block: string;
  parsel: string;
  area: string;
  nature: string;
  price: string;
  status: string;
}