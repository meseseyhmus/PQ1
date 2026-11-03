"use client";

import { useState } from "react";

export function InteractiveMap() {
  const [selectedParcel, setSelectedParcel] = useState<{ id: string; coordinates: [number, number]; name: string } | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const parcels = [
    { id: "1", coordinates: [28.9795, 41.0369] as [number, number], name: "123/45 Parça" },
    { id: "2", coordinates: [28.9810, 41.0375] as [number, number], name: "124/45 Parça" },
    { id: "3", coordinates: [28.9825, 41.0382] as [number, number], name: "125/45 Parça" },
  ];

  const handleParcelClick = (parcel: { id: string; coordinates: [number, number]; name: string }) => {
    setSelectedParcel(parcel);
    setShowDetails(true);
  };

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="h-96 rounded-2xl overflow-hidden bg-[--card] shadow-lg" aria-label="Interactive parcel map">
          {/* Map container - would use Leaflet/Mapbox in production */}
          <svg className="w-full h-full" viewBox="0 0 1200 600">
            <rect width="1200" height="600" fill="var(--background)" />
            {/* Grid lines */}
            <g stroke="var(--muted)" strokeWidth={1} opacity={0.3}>
              {Array.from({ length: 10 }, (_, i) => (
                <line key={i} x1={0} y1={i * 60} x2={1200} y2={i * 60} />
              ))}
              {Array.from({ length: 20 }, (_, i) => (
                <line key={i} x1={i * 60} y1={0} x2={i * 60} y2={600} />
              ))}
            </g>
            {/* Parcel markers */}
            {parcels.map((parcel) => (
              <g key={parcel.id} onClick={() => handleParcelClick(parcel)} cursor="pointer">
                <circle
                  cx={parcel.coordinates[0]}
                  cy={parcel.coordinates[1]}
                  r={12}
                  fill="var(--primary)"
                  className="hover:opacity-90 transition-opacity"
                />
                <text
                  x={parcel.coordinates[0]}
                  y={parcel.coordinates[1] - 20}
                  textAnchor="middle"
                  fontSize="10"
                  fill="white"
                  fontWeight="bold"
                  className="drop-shadow(0 2 4 rgba(0,0,0,0.5))"
                >
                  {parcel.name}
                </text>
              </g>
            ))}
            {/* Selected parcel highlight */}
            {selectedParcel && (
              <g>
                <circle
                  cx={selectedParcel.coordinates[0]}
                  cy={selectedParcel.coordinates[1]}
                  r={20}
                  fill="var(--accent-teal)"
                  className="opacity-50 animate-pulse"
                />
                <text
                  x={selectedParcel.coordinates[0]}
                  y={selectedParcel.coordinates[1] + 30}
                  textAnchor="middle"
                  fontSize="12"
                  fill="var(--accent-teal)"
                  fontWeight="bold"
                >
                  {selectedParcel.name} detayları
                </text>
              </g>
            )}
          </svg>
        </div>

        {selectedParcel && (
          <div className="mt-8 max-w-2xl mx-auto px-4">
            <div className="bg-[--card] rounded-2xl p-6 border shadow-xl">
              <h3 className="text-xl font-semibold text-[--foreground] mb-4">
                {selectedParcel.name} - Detay Bilgileri
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[--muted] text-sm">Parça Numarası</p>
                  <p className="text-[--foreground] font-medium mt-1">123/45</p>
                </div>
                <div>
                  <p className="text-[--muted] text-sm">Koordinatlar</p>
                  <p className="text-[--foreground] font-medium mt-1">28°58'46" N, 41°02'13" E</p>
                </div>
                <div>
                  <p className="text-[--muted] text-sm">Toplam Alan</p>
                  <p className="text-[--foreground] font-medium mt-1">500 m²</p>
                </div>
                <div>
                  <p className="text-[--muted] text-sm">Doğal Durum</p>
                  <p className="text-[--foreground] font-medium mt-1">Arazi</p>
                </div>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="mt-4 w-full py-3 bg-[var(--primary)] text-[--primary-foreground] rounded-xl font-medium hover:opacity-90 transition-opacity"
              >
                Kapat
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}