"use client";

import type { ReactNode } from "react";
import { useRef } from "react";
import { Grid3x3, Layers, Upload, Trash2, Globe, Sparkles } from "lucide-react";
import { useEditor } from "@/state/EditorContext";
import { ColorPicker } from "@/components/ColorPicker";
import { CameraPicker } from "@/components/CameraPicker";
import { Slider } from "@/components/ui/Slider";
import { cn } from "@/lib/cn";
import type { BackgroundSource } from "@/types";

const BG_OPTIONS: Array<{ id: BackgroundSource; name: string; desc: string }> = [
  { id: "google-satellite", name: "Google Uydu", desc: "Google Maps gerçek uydu" },
  { id: "esri-satellite", name: "Esri HD", desc: "ArcGIS World ortofoto" },
  { id: "osm", name: "OpenStreetMap", desc: "Vektör sokak haritası" },
  { id: "dark-satellite", name: "Koyu Harita", desc: "Minimalist gece modu" },
  { id: "custom", name: "Özel Drone", desc: "Kendi görselini yükle" },
  { id: "procedural", name: "Prosedürel", desc: "3D sentetik topoğrafya" },
];

export function TabStyleCamera() {
  const { state, dispatch } = useEditor();
  const { style, camera, background } = state;
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const result = evt.target?.result as string;
      if (result) {
        dispatch({ type: "SET_CUSTOM_BG_IMAGE", url: result });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6 p-3">
      {/* Arka Plan & Uydu Katmanı */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/40">
            <Layers className="h-3.5 w-3.5 text-neon-bright" />
            Arka Plan & Uydu Katmanı
          </h3>
          <span className="text-[10px] text-white/40 font-mono">
            {background.source === "google-satellite" ? "Google Maps Canlı" : background.source}
          </span>
        </div>

        {/* Katman Seçimi */}
        <div className="grid grid-cols-2 gap-1.5">
          {BG_OPTIONS.map((opt) => {
            const active = background.source === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => dispatch({ type: "SET_BACKGROUND", patch: { source: opt.id } })}
                className={cn(
                  "flex flex-col text-left rounded-md border p-2 transition-all",
                  active
                    ? "border-neon-green/60 bg-neon-green/10 text-white shadow-[0_0_12px_rgba(34,197,94,0.15)]"
                    : "border-white/10 bg-chrome-850/80 text-white/60 hover:border-white/20 hover:text-white/90"
                )}
              >
                <span className="text-xs font-medium text-white flex items-center justify-between">
                  {opt.name}
                  {active && <span className="h-1.5 w-1.5 rounded-full bg-neon-green animate-pulse" />}
                </span>
                <span className="text-[9px] text-white/40 mt-0.5">{opt.desc}</span>
              </button>
            );
          })}
        </div>

        {/* Özel Drone / Görsel Yükleyici */}
        {background.source === "custom" && (
          <div className="rounded-lg border border-neon-cyan/30 bg-neon-cyan/5 p-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-neon-cyan flex items-center gap-1.5">
                <Upload className="h-3.5 w-3.5" />
                Drone / Ortofoto Fotoğrafı
              </span>
              {background.customImageUrl && (
                <button
                  type="button"
                  onClick={() => dispatch({ type: "SET_CUSTOM_BG_IMAGE", url: null })}
                  className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1"
                >
                  <Trash2 className="h-3 w-3" /> Sil
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />

            {background.customImageUrl ? (
              <div className="relative rounded border border-white/10 overflow-hidden bg-black/40 h-24 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={background.customImageUrl}
                  alt="Özel drone arka planı"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center text-xs font-semibold text-white transition-opacity"
                >
                  Görseli Değiştir
                </button>
              </div>
            ) : (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (evt) => {
                    const result = evt.target?.result as string;
                    if (result) dispatch({ type: "SET_CUSTOM_BG_IMAGE", url: result, name: file.name });
                  };
                  reader.readAsDataURL(file);
                }}
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-4 border-2 border-dashed border-neon-cyan/40 hover:border-neon-cyan rounded-xl flex flex-col items-center justify-center gap-1.5 text-white/70 hover:text-white transition-all bg-neon-cyan/[0.03] cursor-pointer"
              >
                <Upload className="h-5 w-5 text-neon-cyan animate-pulse" />
                <span className="text-xs font-medium">Drone veya Parsel Fotoğrafını Sürükle ya da Seç</span>
                <span className="text-[10px] text-white/40">JPG, PNG, WebP desteklenir (FileReader API)</span>
              </div>
            )}

            {/* Drone Görsel Hizalama & Boyut Kontrolleri */}
            {background.customImageUrl && (
              <div className="space-y-2.5 pt-2 border-t border-white/10">
                <div>
                  <div className="mb-1 flex justify-between text-[10px] uppercase tracking-wider text-white/40">
                    <span>Drone Fotoğrafı Açısı (Döndürme)</span>
                    <span className="text-neon-cyan font-mono">{background.customRotation ?? 0}°</span>
                  </div>
                  <Slider
                    min={0}
                    max={360}
                    step={1}
                    value={background.customRotation ?? 0}
                    onValueChange={(customRotation) =>
                      dispatch({ type: "SET_BACKGROUND", patch: { customRotation } })
                    }
                  />
                </div>

                <div>
                  <div className="mb-1 flex justify-between text-[10px] uppercase tracking-wider text-white/40">
                    <span>Drone Görsel Ölçeği (Yakınlaştırma)</span>
                    <span className="text-neon-cyan font-mono">{(background.customScale ?? 1).toFixed(2)}x</span>
                  </div>
                  <Slider
                    min={0.5}
                    max={3.0}
                    step={0.05}
                    value={background.customScale ?? 1}
                    onValueChange={(customScale) =>
                      dispatch({ type: "SET_BACKGROUND", patch: { customScale } })
                    }
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Katman Ayarları */}
        <div className="space-y-2.5 pt-1">
          <div>
            <div className="mb-1 flex justify-between text-[10px] uppercase tracking-wider text-white/40">
              <span>Arka Plan Opaklığı</span>
              <span className="text-white/60">%{Math.round(background.opacity * 100)}</span>
            </div>
            <Slider
              min={0.1}
              max={1}
              step={0.05}
              value={background.opacity}
              onValueChange={(opacity) => dispatch({ type: "SET_BACKGROUND", patch: { opacity } })}
            />
          </div>

          <div>
            <div className="mb-1 flex justify-between text-[10px] uppercase tracking-wider text-white/40">
              <span>Parlaklık</span>
              <span className="text-white/60">%{background.brightness}</span>
            </div>
            <Slider
              min={50}
              max={150}
              step={5}
              value={background.brightness}
              onValueChange={(brightness) =>
                dispatch({ type: "SET_BACKGROUND", patch: { brightness } })
              }
            />
          </div>
        </div>
      </section>

      {/* Stil */}
      <section className="space-y-3 pt-2 border-t border-white/10">
        <h3 className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
          Parsel Sınır Stili
        </h3>
        <ColorPicker
          value={style.strokeColor}
          onChange={(strokeColor) => dispatch({ type: "SET_STYLE", patch: { strokeColor } })}
        />
        <div>
          <div className="mb-1 flex justify-between text-[10px] uppercase tracking-wider text-white/40">
            <span>Çizgi Kalınlığı</span>
            <span className="text-white/60">{style.strokeWidth.toFixed(0)} px</span>
          </div>
          <Slider
            min={1}
            max={8}
            step={1}
            value={style.strokeWidth}
            onValueChange={(strokeWidth) => dispatch({ type: "SET_STYLE", patch: { strokeWidth } })}
          />
        </div>
        <div>
          <div className="mb-1 flex justify-between text-[10px] uppercase tracking-wider text-white/40">
            <span>Dolgu Opaklığı</span>
            <span className="text-white/60">%{Math.round(style.fillOpacity * 100)}</span>
          </div>
          <Slider
            min={0}
            max={1}
            step={0.02}
            value={style.fillOpacity}
            onValueChange={(fillOpacity) => dispatch({ type: "SET_STYLE", patch: { fillOpacity } })}
          />
        </div>
        <div className="flex gap-2">
          <ToggleChip
            active={style.showGrid}
            onClick={() => dispatch({ type: "SET_STYLE", patch: { showGrid: !style.showGrid } })}
            icon={<Grid3x3 className="h-3.5 w-3.5" />}
            label="Izgara"
          />
          <ToggleChip
            active={style.showWatermark}
            onClick={() =>
              dispatch({ type: "SET_STYLE", patch: { showWatermark: !style.showWatermark } })
            }
            icon={<span className="text-[11px] font-bold">P</span>}
            label="Filigran"
          />
        </div>
      </section>

      {/* Kamera */}
      <section className="space-y-3 pt-2 border-t border-white/10">
        <h3 className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
          Kamera Hareketi
        </h3>
        <CameraPicker
          value={camera.motion}
          onChange={(motion) => dispatch({ type: "SET_CAMERA", patch: { motion } })}
        />
        <div>
          <div className="mb-1 flex justify-between text-[10px] uppercase tracking-wider text-white/40">
            <span>Süre</span>
            <span className="text-white/60">{camera.duration.toFixed(0)} s</span>
          </div>
          <Slider
            min={5}
            max={30}
            step={1}
            value={camera.duration}
            onValueChange={(duration) => dispatch({ type: "SET_CAMERA", patch: { duration } })}
          />
        </div>
        <div>
          <div className="mb-1 flex justify-between text-[10px] uppercase tracking-wider text-white/40">
            <span>Hareket Yoğunluğu</span>
            <span className="text-white/60">%{Math.round(camera.intensity * 100)}</span>
          </div>
          <Slider
            min={0}
            max={1}
            step={0.05}
            value={camera.intensity}
            onValueChange={(intensity) => dispatch({ type: "SET_CAMERA", patch: { intensity } })}
          />
        </div>
      </section>
    </div>
  );
}

function ToggleChip({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-green/60",
        active
          ? "border-neon-green/50 bg-neon-green/10 text-neon-bright"
          : "border-white/10 bg-chrome-850 text-white/50 hover:text-white/80",
      )}
    >
      {icon}
      {label}
    </button>
  );
}


