"use client";

import { useState } from "react";

export function PropertyComparisonSection() {
  const [properties, setProperties] = useState<ComparisonProperty[]>([
    { id: "1", name: "123/45 Parça", area: "500 m²", nature: "Arsa", price: "2.500.000 ₺", zone: "Yeşil Zone", status: "Aktif" },
    { id: "2", name: "124/45 Parça", area: "350 m²", nature: "Arsa", price: "1.800.000 ₺", zone: "Yeşil Zone", status: "Aktif" },
    { id: "3", name: "125/45 Parça", area: "750 m²", nature: "Bina", price: "4.200.000 ₺", zone: "Kırmızı Zone", status: "Rezerve" },
  ]);
  const [selected, setSelected] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setProperties(properties.filter(p => p.id !== id));
  };

  const handleAdd = () => {
    const newProp: ComparisonProperty = {
      id: String(Date.now()),
      name: `Yeni Parça ${properties.length + 1}`,
      area: "200 m²",
      nature: "Arsa",
      price: "1.200.000 ₺",
      zone: "Yeşil Zone",
      status: "Aktif",
    };
    setProperties([...properties, newProp]);
  };

  return (
    <section className="py-16 bg-[--background]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left: Comparison Table */}
          <div className="bg-[--card] rounded-2xl p-6 border shadow-xl flex-1">
            <h3 className="text-xl font-semibold text-[--foreground] mb-4">Karşılaştırma Tablosu</h3>
            {properties.length === 0 ? (
              <p className="text-[--muted] text-sm">Karşılaştırmak için parça ekleyin</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-sm">
                  <thead>
                    <tr className="border-b border-[--border] bg-[--card] sticky top-0">
                      <th className="text-left py-3 font-medium text-[--muted]">Özellik</th>
                      {properties.map((p) => (
                        <th key={p.id} className="text-left py-3 font-medium text-[--muted]">
                          {p.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[--border]">
                      <td className="py-4 font-medium text-[--foreground]">Alan</td>
                      {properties.map((p) => (
                        <td key={p.id} className="py-4 text-[--muted]">
                          {p.area}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-[--border]">
                      <td className="py-4 font-medium text-[--foreground]">Doğal Durum</td>
                      {properties.map((p) => (
                        <td key={p.id} className="py-4 text-[--muted]">
                          {p.nature}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-[--border]">
                      <td className="py-4 font-medium text-[--foreground]">Fiyat</td>
                      {properties.map((p) => (
                        <td key={p.id} className="py-4 font-medium">
                          {p.price}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-[--border]">
                      <td className="py-4 font-medium text-[--foreground]">Zoning</td>
                      {properties.map((p) => (
                        <td key={p.id} className="py-4 text-[--muted]">
                          {p.zone}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-[--border]">
                      <td className="py-4 font-medium text-[--foreground]">Durum</td>
                      {properties.map((p) => (
                        <td key={p.id} className="py-4">
                          <span className={`px-2 py-1 text-xs rounded ${p.status === "Aktif" ? "bg-[var(--primary)] text-[var(--primary-foreground)]" : p.status === "Rezerve" ? "bg-[var(--accent-green)] text-[var(--accent-green)]" : "bg-[--muted] text-white"}`}>
                            {p.status}
                          </span>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right: Add Property + Selection */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-[--foreground] mb-4">Parça Ekle</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  // In real app: would collect form data
                  handleAdd();
                }}
              >
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm text-[--muted] mb-1">Parça Adı</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-[--border] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-50 transition-colors"
                      placeholder="Örn: 126/45 Parça"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[--muted] mb-1">Fiyat</label>
                    <input
                      type="number"
                      className="w-full px-4 py-3 border border-[--border] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-50 transition-colors"
                      placeholder="0"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[--muted] mb-1">Alan</label>
                    <input
                      type="number"
                      className="w-full px-4 py-3 border border-[--border] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-50 transition-colors"
                      placeholder="m²"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[--muted] mb-1">Doğal Durum</label>
                    <select
                      className="w-full px-4 py-3 border border-[--border] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-50 transition-colors"
                      required
                    >
                      <option value="Arsa">Arsa</option>
                      <option value="Bina">Bina</option>
                      <option value="Konut">Konut</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-[--muted] mb-1">Zoning Bölge</label>
                  <select
                    className="w-full px-4 py-3 border border-[--border] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-50 transition-colors"
                    required
                  >
                    <option value="Yeşil Zone">Yeşil Zone</option>
                    <option value="Kırmızı Zone">Kırmızı Zone</option>
                    <option value="Sarı Zone">Sarı Zone</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full py-4 bg-[var(--primary)] text-[--primary-foreground] rounded-xl font-medium hover:opacity-90 transition-opacity mt-4"
                >
                  Parça Ekle
                </button>
              </form>
            </div>

            {selected && (
              <div>
                <h3 className="text-xl font-semibold text-[--foreground] mb-4">Seçili Parça Detayları</h3>
                {(() => {
                  const selectedProp = properties.find(p => p.id === selected);
                  return (
                    <>
                      <p className="text-[--muted] text-sm">Seçili: {selectedProp?.name}</p>
                      <p className="text-[--foreground] font-medium">{selectedProp?.area} · {selectedProp?.nature}</p>
                      <p className="text-[--muted] font-medium">Fiyat: {selectedProp?.price}</p>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

interface ComparisonProperty {
  id: string;
  name: string;
  area: string;
  nature: string;
  price: string;
  zone: string;
  status: string;
}