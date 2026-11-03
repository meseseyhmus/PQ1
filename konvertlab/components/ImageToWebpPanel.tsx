"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Sliders,
  Download,
  Loader2,
  Sparkles,
  Image as ImageIcon,
  ArrowRight,
  CheckCircle2,
  Eye,
  Columns,
  RefreshCw,
} from "lucide-react";
import DropZone from "@/components/DropZone";
import ProgressBar from "@/components/ProgressBar";
import { convertImageToWebp } from "@/lib/imageConvert";
import { downloadBlob } from "@/lib/downloadHelper";
import { formatBytes } from "@/lib/format";
import { createSampleImage } from "@/lib/sampleFiles";
import type { WebpConvertResult } from "@/types";

export default function ImageToWebpPanel() {
  const [files, setFiles] = useState<File[]>([]);
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);
  const [originalDims, setOriginalDims] = useState<{ width: number; height: number } | null>(null);
  const [quality, setQuality] = useState<number>(85);
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<WebpConvertResult | null>(null);
  const [viewMode, setViewMode] = useState<"side-by-side" | "single">("side-by-side");

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentFile = files[0];

  // Clean up object URL helper
  const clearOriginalPreview = useCallback(() => {
    if (originalPreview) {
      URL.revokeObjectURL(originalPreview);
      setOriginalPreview(null);
    }
  }, [originalPreview]);

  useEffect(() => {
    return () => {
      clearOriginalPreview();
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [clearOriginalPreview]);

  const handleFiles = (incoming: File[]) => {
    const file = incoming[0];
    if (!file) return;

    clearOriginalPreview();
    const url = URL.createObjectURL(file);
    setOriginalPreview(url);

    const img = new Image();
    img.onload = () => {
      setOriginalDims({
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height,
      });
    };
    img.src = url;

    setFiles([file]);
    setError(null);
    setResult(null);
  };

  const executeConvert = useCallback(
    async (file: File, q: number) => {
      setConverting(true);
      setProgress(25);
      setError(null);

      try {
        setProgress(60);
        const converted = await convertImageToWebp(file, { quality: q });
        setResult(converted);
        setProgress(100);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Görsel WebP formatına dönüştürülürken bir hata oluştu."
        );
      } finally {
        setConverting(false);
        setTimeout(() => setProgress(0), 800);
      }
    },
    []
  );

  const handleInitialConvert = () => {
    if (!currentFile || converting) return;
    void executeConvert(currentFile, quality);
  };

  // Live interactive quality slider update
  const handleQualityChange = (newQuality: number) => {
    setQuality(newQuality);

    if (result && currentFile && !converting) {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        void executeConvert(currentFile, newQuality);
      }, 250);
    }
  };

  const handleDownload = () => {
    if (!result || !currentFile) return;
    const baseName = currentFile.name.replace(/\.[a-zA-Z0-9]+$/i, "") || "gorsel";
    downloadBlob(result.blob, `${baseName}.webp`);
  };

  const handleLoadSample = async () => {
    const sample = await createSampleImage("ÖRNEK BELGE / WEB GRAFİĞİ");
    handleFiles([sample]);
  };

  return (
    <div className="space-y-5">
      <DropZone
        accept="image/*,.jpg,.jpeg,.png,.bmp,.gif"
        files={files}
        onFiles={handleFiles}
        onRemove={() => {
          clearOriginalPreview();
          setFiles([]);
          setOriginalDims(null);
          setResult(null);
          setError(null);
        }}
        label="WebP'ye dönüştürülecek görseli sürükleyin"
        hint="JPG, PNG, GIF, BMP dosyaları yeni nesil ultra hafif WebP formatına sıkıştırılır"
      />

      <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
        <button
          type="button"
          data-testid="sample-file-webp"
          onClick={handleLoadSample}
          className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-indigo-500/10 px-4 py-2.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400 transition-all shadow-sm active:scale-95"
        >
          <Sparkles className="h-4 w-4 text-cyan-400 shrink-0" />
          <span>Örnek Dosya ile Dene</span>
          <span className="rounded-full bg-cyan-400/20 px-2 py-0.5 text-[10px] font-bold text-cyan-200">
            Fatura &amp; Grafik (1-Tık)
          </span>
        </button>
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      {currentFile && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
                <ImageIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-200">{currentFile.name}</p>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>Orijinal: {formatBytes(currentFile.size)}</span>
                  {originalDims && (
                    <>
                      <span>•</span>
                      <span>
                        {originalDims.width} × {originalDims.height} px
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/10 px-2.5 py-1 text-xs font-medium text-cyan-400 border border-cyan-500/20">
              <Sparkles className="h-3 w-3" />
              WebP Sıkıştırma Motoru
            </span>
          </div>

          <div className="space-y-2 border-t border-slate-800 pt-3">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-medium text-slate-300">
                <Sliders className="h-3.5 w-3.5 text-cyan-400" />
                İnteraktif Sıkıştırma Kalitesi (%{quality})
              </span>
              <span className="text-cyan-400 font-semibold">
                {quality >= 90
                  ? "En Yüksek Kalite"
                  : quality >= 70
                    ? "Önerilen Web Dengesi"
                    : "Maksimum Boyut Tasarrufu"}
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={quality}
              onChange={(e) => handleQualityChange(Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-cyan-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>%10 (Ultra Küçük)</span>
              <span>%80 - %85 (İdeal Denge)</span>
              <span>%100 (Kayıpsıza Yakın)</span>
            </div>
            {result && (
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <RefreshCw className="h-3 w-3 text-cyan-400 inline" />
                Kalite çubuğunu kaydırdığınızda WebP görseli ve tasarruf oranı anında canlı güncellenir.
              </p>
            )}
          </div>
        </div>
      )}

      {(converting || progress > 0) && (
        <ProgressBar value={progress} label="WebP sıkıştırma matrisi uygulanıyor…" />
      )}

      {result && !converting && (
        <div className="space-y-4">
          {/* Visual Savings Hero Card */}
          <div className="rounded-xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/30 p-4 shadow-lg shadow-emerald-950/20">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start sm:items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-emerald-500/20 px-3 py-0.5 text-sm font-extrabold text-emerald-300 border border-emerald-500/40 shadow-sm">
                      -%{result.savingsPercent} Tasarruf
                    </span>
                    <span className="text-xs text-emerald-400 font-medium">
                      ({formatBytes(Math.max(0, result.originalSize - result.newSize))} daha hafif)
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 mt-1.5">
                    <span className="line-through text-slate-400">
                      {formatBytes(result.originalSize)}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="font-bold text-emerald-300 text-sm">
                      {formatBytes(result.newSize)}
                    </span>
                    {result.width && result.height && (
                      <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300 border border-slate-700">
                        {result.width} × {result.height} px
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:from-emerald-400 hover:to-teal-400 transition-all shadow-lg shadow-emerald-500/25 active:scale-95"
              >
                <Download className="h-4 w-4" />
                WebP Dosyasını İndir
              </button>
            </div>
          </div>

          {/* Interactive Quality Preview & Comparison */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5 text-cyan-400" />
                Görsel Kalite ve Boyut Karşılaştırması
              </span>
              <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 p-0.5">
                <button
                  type="button"
                  onClick={() => setViewMode("side-by-side")}
                  className={`flex items-center gap-1 rounded px-2.5 py-1 text-[11px] font-medium transition-colors ${
                    viewMode === "side-by-side"
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Columns className="h-3 w-3" />
                  Yan Yana
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("single")}
                  className={`flex items-center gap-1 rounded px-2.5 py-1 text-[11px] font-medium transition-colors ${
                    viewMode === "single"
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Eye className="h-3 w-3" />
                  Yalnızca WebP
                </button>
              </div>
            </div>

            {viewMode === "side-by-side" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {/* Original side */}
                <div className="flex flex-col items-center justify-between rounded-lg border border-slate-800 bg-slate-900/40 p-3">
                  <div className="w-full flex items-center justify-between text-[11px] text-slate-400 mb-2">
                    <span className="font-semibold text-slate-300">Orijinal Görsel</span>
                    <span>{formatBytes(result.originalSize)}</span>
                  </div>
                  <div className="w-full h-56 flex items-center justify-center bg-slate-950/80 rounded-md border border-slate-800/60 overflow-hidden p-2">
                    {originalPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={originalPreview}
                        alt="Orijinal Görsel Önizleme"
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <span className="text-xs text-slate-600">Önizleme yüklenemedi</span>
                    )}
                  </div>
                  <div className="w-full mt-2 text-center text-[11px] text-slate-500">
                    Boyutlar: {originalDims ? `${originalDims.width} × ${originalDims.height} px` : "—"}
                  </div>
                </div>

                {/* WebP side */}
                <div className="flex flex-col items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-950/10 p-3">
                  <div className="w-full flex items-center justify-between text-[11px] text-slate-400 mb-2">
                    <span className="font-semibold text-emerald-300 flex items-center gap-1">
                      WebP Çıktısı (%{quality} Kalite)
                    </span>
                    <span className="font-bold text-emerald-400">
                      {formatBytes(result.newSize)} (-%{result.savingsPercent})
                    </span>
                  </div>
                  <div className="w-full h-56 flex items-center justify-center bg-slate-950/80 rounded-md border border-emerald-500/20 overflow-hidden p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={result.dataUrl}
                      alt="WebP Canlı Önizleme"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div className="w-full mt-2 text-center text-[11px] text-emerald-400/80">
                    Boyutlar: {result.width && result.height ? `${result.width} × ${result.height} px` : "—"}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-950/10 p-4">
                <div className="w-full max-w-md h-72 flex items-center justify-center bg-slate-950/80 rounded-lg border border-emerald-500/20 overflow-hidden p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={result.dataUrl}
                    alt="WebP Canlı Önizleme"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="mt-3 flex items-center gap-3 text-xs text-slate-300">
                  <span>WebP: <strong>{formatBytes(result.newSize)}</strong></span>
                  <span>•</span>
                  <span>-%{result.savingsPercent} Tasarruf</span>
                  <span>•</span>
                  <span>{result.width} × {result.height} px</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={result ? handleDownload : handleInitialConvert}
          disabled={!currentFile || converting}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-semibold text-slate-950 transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 active:scale-98"
        >
          {converting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              WebP Sıkıştırılıyor…
            </>
          ) : result ? (
            <>
              <Download className="h-4 w-4" />
              Sıkıştırılmış WebP Dosyasını İndir
            </>
          ) : (
            <>
              <ImageIcon className="h-4 w-4" />
              WebP Formatına Dönüştür
            </>
          )}
        </button>
      </div>

      <p className="text-xs text-slate-500">
        🚀 WebP formatı, JPEG ve PNG görsellere göre %30 ila %80 daha küçük dosya boyutuyla sayfa yüklenme hızınızı ve SEO performansınızı artırır.
      </p>
    </div>
  );
}
