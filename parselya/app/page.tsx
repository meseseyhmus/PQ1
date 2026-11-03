"use client";

import { useEffect, useRef, useState } from "react";
import {
  Coins,
  Download,
  Film,
  Layers,
  MapPin,
  Maximize2,
  Minimize2,
  Palette,
  Pause,
  Play,
  RotateCcw,
  Sliders,
  Sparkles,
  Smartphone,
  Tv,
  X,
  Zap,
  Compass,
  Plane,
} from "lucide-react";
import { EditorProvider, useEditor, usePlaybackClock } from "@/state/EditorContext";
import { TabParcelQuery } from "@/components/TabParcelQuery";
import { TabOverlays } from "@/components/TabOverlays";
import { TabStyleCamera } from "@/components/TabStyleCamera";
import { ParcelCanvas, type ParcelCanvasHandle } from "@/components/ParcelCanvas";
import { CreditBadge } from "@/components/CreditBadge";
import { Tabs } from "@/components/ui/Tabs";
import { CREDIT_PLANS, siteConfig } from "@/config/siteConfig";
import { canvasRegistry } from "@/lib/canvasRegistry";
import { downloadBlob, isExportSupported, recordCanvas } from "@/lib/exportVideo";
import { cn } from "@/lib/cn";

function EditorMain() {
  usePlaybackClock();

  const { state, dispatch } = useEditor();
  const [activeTab, setActiveTab] = useState<string>("query");
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportError, setExportError] = useState<string | null>(null);

  const canvasHandleRef = useRef<ParcelCanvasHandle>(null);

  const { playing, time } = state.playback;
  const duration = state.camera.duration;

  // Format seconds as mm:ss.f
  function formatTime(s: number) {
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    const ms = Math.floor((s % 1) * 10);
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}.${ms}`;
  }

  // Handle Video Export
  async function handleExport() {
    if (state.credits <= 0) {
      setUpgradeOpen(true);
      return;
    }

    const canvas = canvasRegistry.get();
    if (!canvas) {
      setExportError("Canvas sahnesi bulunamadı.");
      return;
    }

    if (!isExportSupported()) {
      setExportError("Tarayıcınız video kaydetme API'sini (MediaRecorder) desteklemiyor.");
      return;
    }

    setExporting(true);
    setExportProgress(0);
    setExportError(null);

    // Pause current preview
    dispatch({ type: "SET_PLAYING", playing: false });
    dispatch({ type: "SET_TIME", time: 0 });

    try {
      const result = await recordCanvas(
        canvas,
        duration,
        async () => {
          // Play scene from 0 to duration
          dispatch({ type: "SET_TIME", time: 0 });
          dispatch({ type: "SET_PLAYING", playing: true });

          // Wait until timeline completes
          await new Promise<void>((resolve) => {
            const check = setInterval(() => {
              const current = canvasRegistry.get();
              if (!current) {
                clearInterval(check);
                resolve();
              }
            }, 500);

            setTimeout(() => {
              clearInterval(check);
              dispatch({ type: "SET_PLAYING", playing: false });
              resolve();
            }, (duration + 0.5) * 1000);
          });
        },
        (ratio) => {
          setExportProgress(Math.round(ratio * 100));
        }
      );

      // Trigger download cleanly with 5s revocation safety
      downloadBlob(
        result.blob,
        `parselya_${state.parcel.ada}_${state.parcel.parsell}.${result.extension}`
      );

      // Decrement credit
      dispatch({ type: "USE_CREDIT" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Video render edilirken hata oluştu.";
      setExportError(msg);
    } finally {
      setExporting(false);
      dispatch({ type: "SET_PLAYING", playing: false });
    }
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-chrome-950 text-white selection:bg-neon-green/30">
      {/* Top Bar */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 bg-chrome-900 px-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <span className="flex size-8 items-center justify-center rounded-xl bg-neon-green font-bold text-chrome-950 shadow-sm">
            P
          </span>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white">
              {siteConfig.name}
            </h1>
            <p className="text-[10px] text-white/50">{siteConfig.tagline}</p>
          </div>
        </div>

        {/* Center: Aspect switcher */}
        <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-chrome-800 p-1">
          <button
            onClick={() => dispatch({ type: "SET_ASPECT", aspect: "9:16" })}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition",
              state.aspect === "9:16"
                ? "bg-neon-green text-chrome-950 font-bold"
                : "text-white/60 hover:text-white"
            )}
            title="Dikey Video (Reels / TikTok / Shorts)"
          >
            <Smartphone className="size-3.5" />
            9:16 Reels
          </button>
          <button
            onClick={() => dispatch({ type: "SET_ASPECT", aspect: "16:9" })}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition",
              state.aspect === "16:9"
                ? "bg-neon-green text-chrome-950 font-bold"
                : "text-white/60 hover:text-white"
            )}
            title="Yatay Video (YouTube / Web)"
          >
            <Tv className="size-3.5" />
            16:9 Yatay
          </button>
        </div>

        {/* Right: Credits + Export */}
        <div className="flex items-center gap-3">
          <CreditBadge onUpgrade={() => setUpgradeOpen(true)} />

          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 rounded-xl bg-neon-green px-4 py-2 text-xs font-bold text-chrome-950 shadow-sm transition hover:bg-neon-bright active:scale-95 disabled:opacity-50"
          >
            <Download className="size-3.5" />
            {exporting
              ? `Dışa Aktarılıyor (%${exportProgress})...`
              : "Videoyu Dışa Aktar"}
          </button>
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Control Panel (Matching parselsorgu.pro sidebar) */}
        <aside className="flex w-[390px] shrink-0 flex-col border-r border-white/10 bg-[#0c1017] z-20 shadow-2xl overflow-y-auto">
          <TabParcelQuery />
        </aside>

        {/* Right: Immersive Fullscreen Satellite Map Stage */}
        <main className="relative flex-1 h-full w-full overflow-hidden bg-black select-none">
          {/* Error Notification Pill */}
          {exportError && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-950/95 px-4 py-2 text-xs text-red-200 shadow-2xl backdrop-blur-md">
              <span>⚠️ {exportError}</span>
              <button
                type="button"
                onClick={() => setExportError(null)}
                className="ml-2 hover:text-white"
              >
                ✕
              </button>
            </div>
          )}

          {/* Fullscreen GIS Map Canvas (100% width and height) */}
          <div className="absolute inset-0 h-full w-full">
            <ParcelCanvas state={state} handleRef={canvasHandleRef} />
          </div>

          {/* Top-Right Map Mode Switcher (Matching parselsorgu.pro: Harita / Katmanlar) */}
          <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-xl border border-white/20 bg-slate-950/80 p-1 backdrop-blur-md shadow-xl">
              <button
                type="button"
                onClick={() =>
                  dispatch({
                    type: "SET_BACKGROUND",
                    patch: { source: "google-satellite" },
                  })
                }
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition",
                  state.background.source === "google-satellite"
                    ? "bg-blue-600 text-white shadow"
                    : "text-white/70 hover:text-white"
                )}
              >
                <span>⚙ Harita</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  dispatch({
                    type: "SET_BACKGROUND",
                    patch: {
                      source:
                        state.background.source === "esri-satellite"
                          ? "google-satellite"
                          : "esri-satellite",
                    },
                  })
                }
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition",
                  state.background.source === "esri-satellite"
                    ? "bg-blue-600 text-white shadow"
                    : "text-white/70 hover:text-white"
                )}
              >
                <span>⊞ Katmanlar</span>
              </button>
            </div>
          </div>

          {/* Right Floating Vertical Control Strip (GPS, Compass, Zoom In, Zoom Out) */}
          <div className="absolute right-4 bottom-24 z-30 flex flex-col gap-1.5 rounded-xl border border-white/20 bg-slate-950/80 p-1 backdrop-blur-md shadow-xl">
            <button
              type="button"
              title="Pusula & Kuzey Yönü"
              className="size-8 flex items-center justify-center rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition"
            >
              <Compass className="size-4 text-sky-400" />
            </button>
            <button
              type="button"
              title="Konuma Odaklan (GPS)"
              onClick={() => {
                dispatch({
                  type: "SET_CAMERA",
                  patch: { intensity: 0.6 },
                });
              }}
              className="size-8 flex items-center justify-center rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition"
            >
              <MapPin className="size-4 text-emerald-400" />
            </button>
            <div className="h-px bg-white/15 my-0.5" />
            <button
              type="button"
              title="Yakınlaştır (+)"
              onClick={() =>
                dispatch({
                  type: "SET_CAMERA",
                  patch: {
                    intensity: Math.min(1.0, state.camera.intensity + 0.1),
                  },
                })
              }
              className="size-8 flex items-center justify-center rounded-lg text-white/90 hover:bg-white/10 hover:text-white font-bold text-base transition"
            >
              +
            </button>
            <button
              type="button"
              title="Uzaklaştır (−)"
              onClick={() =>
                dispatch({
                  type: "SET_CAMERA",
                  patch: {
                    intensity: Math.max(0.2, state.camera.intensity - 0.1),
                  },
                })
              }
              className="size-8 flex items-center justify-center rounded-lg text-white/90 hover:bg-white/10 hover:text-white font-bold text-base transition"
            >
              −
            </button>
          </div>

          {/* Floating Cinematic Timeline Bar (Appears when Uçuş or video timeline is playing) */}
          {(playing || time > 0) && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 rounded-2xl border border-white/20 bg-slate-950/90 px-4 py-2.5 backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-bottom-2">
              <button
                type="button"
                onClick={() => dispatch({ type: "TOGGLE_PLAY" })}
                className="flex size-8 items-center justify-center rounded-xl bg-neon-green text-chrome-950 transition hover:bg-neon-bright shadow"
              >
                {playing ? <Pause className="size-4" /> : <Play className="size-4 fill-current ml-0.5" />}
              </button>
              <button
                type="button"
                onClick={() => dispatch({ type: "RESTART" })}
                className="flex size-8 items-center justify-center rounded-xl border border-white/15 text-white/80 hover:bg-white/10 hover:text-white"
              >
                <RotateCcw className="size-3.5" />
              </button>

              <div className="font-mono text-xs font-semibold text-white/90">
                <span className="text-neon-bright">{formatTime(time)}</span>
                <span className="text-white/40"> / {formatTime(duration)}</span>
              </div>

              {/* Speed Buttons */}
              <div className="flex items-center gap-0.5 rounded-lg border border-white/10 bg-white/5 p-0.5">
                {[0.5, 1, 1.5, 2].map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => dispatch({ type: "SET_SPEED", speed: spd })}
                    className={cn(
                      "rounded px-1.5 py-0.5 text-[10px] font-mono transition",
                      (state.playback.speed ?? 1) === spd
                        ? "bg-neon-green text-black font-bold"
                        : "text-white/60 hover:text-white"
                    )}
                  >
                    {spd}x
                  </button>
                ))}
              </div>

              <div className="h-4 w-px bg-white/20" />

              <button
                type="button"
                onClick={handleExport}
                disabled={exporting}
                className="flex items-center gap-1.5 rounded-xl bg-neon-green px-3 py-1.5 text-xs font-bold text-chrome-950 hover:bg-neon-bright transition disabled:opacity-50"
              >
                <Download className="size-3.5" />
                {exporting ? `İndiriliyor (%${exportProgress})` : "Videoyu İndir (MP4)"}
              </button>
            </div>
          )}
        </main>
      </div>
                  <RotateCcw className="size-3.5" />
                </button>

                <div className="ml-3 font-mono text-xs font-semibold text-white/80">
                  <span className="text-neon-bright">{formatTime(time)}</span>
                  <span className="text-white/40"> / {formatTime(duration)}</span>
                </div>

                {/* Hız Kontrolü (0.5x - 2x) */}
                <div className="flex items-center gap-0.5 rounded-lg border border-white/10 bg-chrome-800/80 p-0.5 ml-2">
                  {[0.5, 1, 1.5, 2].map((spd) => {
                    const active = (state.playback.speed ?? 1) === spd;
                    return (
                      <button
                        key={spd}
                        type="button"
                        onClick={() => dispatch({ type: "SET_SPEED", speed: spd })}
                        className={cn(
                          "rounded px-1.5 py-0.5 text-[10px] font-mono transition-colors",
                          active
                            ? "bg-neon-green text-chrome-950 font-bold"
                            : "text-white/50 hover:text-white"
                        )}
                        aria-label={`Oynatma Hızı ${spd}x`}
                      >
                        {spd}x
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-white/50">
                <span className="flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-0.5">
                  🎥 {state.camera.motion === "zoom-in" ? "Uzaydan Zoom-In" : state.camera.motion === "pan" ? "Sinematik Pan" : "360° Orbit"}
                </span>
                <span className="flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-0.5">
                  📐 {state.aspect === "9:16" ? "1080x1920 (Reels)" : "1920x1080 (HD)"}
                </span>
              </div>
            </div>

            {/* Scrubber Bar */}
            <div
              className="relative h-5 cursor-pointer select-none rounded-lg bg-chrome-800/90 p-0.5"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                dispatch({ type: "SET_TIME", time: pos * duration });
              }}
            >
              {/* Played Progress Bar */}
              <div
                className="absolute inset-y-0.5 left-0.5 rounded bg-neon-green/30"
                style={{ width: `${(time / duration) * 100}%` }}
              />

              {/* Scrubber Playhead Thumb */}
              <div
                className="absolute top-0 bottom-0 w-1.5 rounded-full bg-neon-green shadow-glow"
                style={{ left: `calc(${(time / duration) * 100}% - 3px)` }}
              />

              {/* Track Layers visual cues */}
              <div className="relative flex h-full items-center justify-between px-2 text-[9px] font-mono text-white/40">
                <span>0.0s</span>
                <span>{(duration / 2).toFixed(1)}s</span>
                <span>{duration.toFixed(1)}s</span>
              </div>
            </div>

            {/* Multitrack Layers (CapCut / Remotion Studio style) */}
            <div className="space-y-1 pt-1 font-mono text-[10px]">
              {/* Layer 1: Camera */}
              <div className="flex items-center gap-2">
                <span className="w-20 shrink-0 text-white/40 text-[9px]">🎥 Kamera</span>
                <div className="relative h-3 flex-1 rounded bg-white/5 overflow-hidden">
                  <div className="h-full bg-blue-500/30 rounded border border-blue-400/40 px-2 flex items-center text-[8px] text-blue-200">
                    {state.camera.motion === "zoom-in"
                      ? "Uzaydan Yakınlaşma (Smooth Ease)"
                      : state.camera.motion === "pan"
                        ? "Sinematik Pan & Kaydırma"
                        : "360° Merkez Orbit"}
                  </div>
                </div>
              </div>

              {/* Layer 2: Parcel polygon */}
              <div className="flex items-center gap-2">
                <span className="w-20 shrink-0 text-white/40 text-[9px]">📍 Parsel Çizim</span>
                <div className="relative h-3 flex-1 rounded bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded border px-2 flex items-center text-[8px]"
                    style={{
                      backgroundColor: `${state.style.strokeColor}33`,
                      borderColor: state.style.strokeColor,
                      color: state.style.strokeColor,
                    }}
                  >
                    Ada {state.parcel.ada} / Parsel {state.parcel.parsell} — Neon Parlama
                  </div>
                </div>
              </div>

              {/* Layer 3: Overlays */}
              <div className="flex items-center gap-2">
                <span className="w-20 shrink-0 text-white/40 text-[9px]">🏷️ Etiketler</span>
                <div className="relative h-3 flex-1 rounded bg-white/5 overflow-hidden">
                  {state.overlays.map((o) => {
                    const left = (o.startTime / duration) * 100;
                    const width = ((o.endTime - o.startTime) / duration) * 100;
                    return (
                      <div
                        key={o.id}
                        className="absolute h-full rounded border border-amber-400/50 bg-amber-400/20 px-1 text-[8px] text-amber-200 truncate"
                        style={{ left: `${left}%`, width: `${width}%` }}
                      >
                        {o.label}: {o.value}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Layer 4: Audio Track */}
              <div className="flex items-center gap-2">
                <span className="w-20 shrink-0 text-white/40 text-[9px]">🎵 Ses Dalgası</span>
                <div className="relative h-3 flex-1 rounded bg-white/5 overflow-hidden flex items-center px-1">
                  <div className="flex h-2 w-full items-center gap-0.5 opacity-40">
                    {Array.from({ length: 48 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-full flex-1 rounded-full bg-emerald-400"
                        style={{ height: `${20 + ((i * 17) % 80)}%` }}
                      />
                    ))}
                  </div>
                  <span className="absolute left-2 text-[8px] text-emerald-300 font-sans">
                    Emlak Tanıtım Fon Müziği (Ambient Calm)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Exporting Progress Modal */}
      {exporting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-3xl border border-white/20 bg-chrome-900 p-6 text-center shadow-2xl">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-neon-green/10 text-neon-bright animate-pulse">
              <Film className="size-6" />
            </div>
            <h3 className="mt-4 text-base font-bold text-white">Video Oluşturuluyor...</h3>
            <p className="mt-1 text-xs text-white/60">
              Canvas sahnesi kaydediliyor ve video akışı oluşturuluyor.
            </p>

            <div className="mt-6">
              <div className="flex justify-between text-xs font-semibold text-white/80">
                <span>İlerleme</span>
                <span>%{exportProgress}</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-chrome-800">
                <div
                  className="h-full bg-neon-green transition-all duration-200"
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Credits Modal */}
      {upgradeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-xl rounded-3xl border border-white/20 bg-chrome-900 p-6 shadow-2xl">
            <button
              onClick={() => setUpgradeOpen(false)}
              className="absolute right-5 top-5 rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white"
            >
              <X className="size-4" />
            </button>

            <div className="text-center">
              <span className="inline-flex size-10 items-center justify-center rounded-2xl bg-neon-green/10 text-neon-bright">
                <Sparkles className="size-5" />
              </span>
              <h3 className="mt-3 text-lg font-bold text-white">Video Kredisi Paketleri</h3>
              <p className="mt-1 text-xs text-white/60">
                Filigransız HD/4K arsa reels videoları oluşturmak için paket seçin.
              </p>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {CREDIT_PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className="flex flex-col justify-between rounded-2xl border border-white/10 bg-chrome-800/60 p-4"
                >
                  <div>
                    <h4 className="font-bold text-sm text-white">{plan.name}</h4>
                    <div className="mt-2 text-xl font-black text-neon-bright">{plan.price}</div>
                    <span className="text-[11px] text-white/50">{plan.credits} Video Kredisi</span>
                    <ul className="mt-4 space-y-1 text-[11px] text-white/70">
                      {plan.features.map((f, i) => (
                        <li key={i}>• {f}</li>
                      ))}
                    </ul>
                  </div>
                  <button
                    onClick={() => {
                      setUpgradeOpen(false);
                      // Add demo credits for testing
                      dispatch({ type: "LOAD_PARCEL", parcel: state.parcel });
                    }}
                    className="mt-6 w-full rounded-xl bg-neon-green py-2 text-xs font-bold text-chrome-950 transition hover:bg-neon-bright"
                  >
                    Seç
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ParselyaPage() {
  return (
    <EditorProvider>
      <EditorMain />
    </EditorProvider>
  );
}

