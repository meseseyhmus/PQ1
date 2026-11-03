"use client";

import { useState, useEffect } from "react";

export function ParcelDetailSection() {
  const [parcelId, setParcelId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [parcelData, setParcelData] = useState<ParcelDetail | null>(null);
  const [regulations, setRegulations] = useState<Regulation[]>([]);
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([]);

  useEffect(() => {
    if (!parcelId) return;
    setLoading(true);
    // Simulate API call
    const simulateLoad = async () => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setParcelData({
        id: parcelId,
        block: "123/45",
        parsel: "45/1",
        area: "500 m²",
        nature: "Arsa",
        owner: "Mehmet Yılmaz",
        titleDeedStatus: "Tam",
        zoningStatus: "Kırmızı Zone - İmar Yasaklı",
        coordinates: "28°58'46\" N, 41°02'13\" E",
        infrastructure: "Su: City Water | Elektrik: 220V | Yolu: Asfalt",
        proximity: "Şehir merkezine 5 km, Havaalanına 45 km",
      });
      setRegulations([
        { id: "1", type: "ÇDP", description: "Kabul Edilmiş Plan", status: "Aktif", date: "2024-03-15" },
        { id: "2", type: "e-Plan", description: "Eşdeğer Plan", status: "Aktif", date: "2024-02-20" },
        { id: "3", type: "Sit", description: "Sit Kalkanı", status: "Uyarı", date: "2024-01-10" },
      ]);
      setPriceHistory([
        { id: "1", date: "2023-01", price: "2.100.000 ₺" },
        { id: "2", date: "2023-06", price: "2.350.000 ₺" },
        { id: "3", date: "2023-11", price: "2.500.000 ₺" },
        { id: "4", date: "2024-05", price: "2.500.000 ₺" },
      ]);
      setLoading(false);
    };
    simulateLoad();
  }, [parcelId]);

  if (loading) {
    return (
      <section className="py-16 bg-[--background]">
        <div className="max-w-4xl mx-auto text-center">
          <svg className="mx-auto w-16 h-16 text-[--muted] mb-4 animate-spin" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" fill="none" strokeWidth="3" />
          </svg>
          <h3 className="text-xl font-semibold text-[--foreground]">Parça Bilgileri Yükleniyor...</h3>
          <p className="text-[--muted-foreground]">Parça detayları hazırlanıyor...</p>
        </div>
      </section>
    );
  }

  if (!parcelData) return null;

  // Compute regulation classes
  const regulationClasses = regulations.map((reg) => {
    if (reg.status === "Aktif") {
      return "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary-foreground)]";
    }
    if (reg.status === "Uyarı") {
      return "border-[var(--accent-green)] bg-[var(--accent-green)]/10 text-[var(--accent-green)]";
    }
    return "border-[var(--border)] bg-[--card] text-[--foreground]";
  });

  return (
    <section className="py-16 bg-[--background]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Parcel Info Card */}
          <div className="bg-[--card] rounded-2xl p-6 border shadow-xl">
            <h3 className="text-xl font-semibold text-[--foreground] mb-6">Parça Bilgileri</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[--muted] text-sm">Parça Numarası</p>
                <p className="text-[--foreground] font-large mt-1">{parcelData.parsel}</p>
              </div>
              <div>
                <p className="text-[--muted] text-sm">Blok</p>
                <p className="text-[--foreground] font-medium mt-1">{parcelData.block}</p>
              </div>
              <div>
                <p className="text-[--muted] text-sm">Toplam Alan</p>
                <p className="text-[--foreground] font-medium mt-1">{parcelData.area}</p>
              </div>
              <div>
                <p className="text-[--muted] text-sm">Doğal Durum</p>
                <p className="text-[--foreground] font-medium mt-1">{parcelData.nature}</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t">
              <p className="text-[--muted] text-sm">Başlık Değişim Durumu</p>
              <p className="text-[--foreground] font-medium">{parcelData.titleDeedStatus}</p>
            </div>

            <div className="mt-6 pt-6 border-t">
              <p className="text-[--muted] text-sm">Zoning Durumu</p>
              <p className="text-[--foreground] font-medium">{parcelData.zoningStatus}</p>
            </div>
          </div>

          {/* Right: Regulations & Pricing */}
          <div className="space-y-6">
            {/* Regulations */}
            <div>
              <h3 className="text-xl font-semibold text-[--foreground] mb-4">İmar & Regulatif Bilgiler</h3>
              <div className="grid grid-cols-2 gap-4">
                {regulations.map((reg, idx) => (
                  <div
                    key={reg.id}
                    className={`p-4 rounded-xl border ${regulationClasses[idx]}`}
                  >
                    <p className="text-[--muted] text-sm">{reg.type}</p>
                    <h4 className="font-medium">{reg.description}</h4>
                    <p className="text-[--muted] text-xs">{reg.status} · {reg.date}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Price History */}
            <div>
              <h3 className="text-xl font-semibold text-[--foreground] mb-4">Fiyat Tarih Çizelgesi</h3>
              <div className="h-64 rounded-xl bg-[--card] p-6">
                <svg className="w-full h-full" viewBox="0 0 200 120">
                  {/* Axes */}
                  <line x1={40} y1={20} x2={160} y2={20} stroke="var(--muted)" strokeWidth={1} />
                  <line x1={40} y1={20} x2={40} y2={100} stroke="var(--muted)" strokeWidth={1} />

                  {/* Price points */}
                  {priceHistory.map((point, idx) => {
                    const x = 40 + (idx / (priceHistory.length - 1)) * 120;
                    const y = 20 + ((1 - (idx / (priceHistory.length - 1))) * 80); // Inverted
                    const prev = priceHistory[idx - 1];
                    const prevX =
                      idx > 0
                        ? 40 + ((idx - 1) / (priceHistory.length - 1)) * 120
                        : x;
                    const prevY =
                      idx > 0
                        ? 20 + ((1 - ((idx - 1) / (priceHistory.length - 1))) * 80)
                        : y;

                    return (
                      <g key={point.id}>
                        <circle
                          cx={x}
                          cy={y}
                          r={6}
                          fill="var(--primary)"
                          className="hover:opacity-90 transition-opacity"
                        />
                        <text
                          x={x}
                          y={y - 10}
                          textAnchor="middle"
                          fontSize="10"
                          fill="var(--primary)"
                        >
                          {point.date.split("-")[1]}/{point.date.split("-")[0]}
                        </text>
                        {idx > 0 && (
                          <line
                            x1={prevX}
                            y1={prevY}
                            x2={x}
                            y2={y}
                            stroke="var(--primary)"
                            strokeWidth={2}
                          />
                        )}
                      </g>
                    );
                  })}
                </svg>
                <p className="text-[--muted] text-center mt-4">Fiyat artışı: %19 (2023-2024)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

interface ParcelDetail {
  id: string;
  block: string;
  parsel: string;
  area: string;
  nature: string;
  owner: string;
  titleDeedStatus: string;
  zoningStatus: string;
  coordinates: string;
  infrastructure: string;
  proximity: string;
}

interface Regulation {
  id: string;
  type: string;
  description: string;
  status: "Aktif" | "Uyarı" | "Pasif";
  date: string;
}

interface PricePoint {
  id: string;
  date: string;
  price: string;
}