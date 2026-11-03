"use client";

import { useState } from "react";
import {
  Crown,
  Layers,
  Loader2,
  Trash2,
  Archive,
  CheckCircle2,
  Download,
  Clock,
  AlertCircle,
  Sparkles,
  FileCheck,
} from "lucide-react";
import DropZone from "@/components/DropZone";
import ProgressBar from "@/components/ProgressBar";
import PricingModal from "@/components/PricingModal";
import { textToPdf } from "@/lib/pdfGenerate";
import { convertPdfToDocx } from "@/lib/docxGenerate";
import { convertImageToWebp } from "@/lib/imageConvert";
import { createZipArchive, type ZipArchiveEntry } from "@/lib/zipHelper";
import { downloadBlob } from "@/lib/downloadHelper";
import { formatBytes } from "@/lib/format";
import { createSamplePdf, createSampleImage } from "@/lib/sampleFiles";
import { planBatch, batchProgress, MAX_BATCH_FILES, detectFileType } from "@/lib/batch";
import type { BatchItem, BatchItemStatus } from "@/lib/batch";
import type { PdfAlign } from "@/types";

const STATUS_LABELS: Record<BatchItemStatus, string> = {
  pending: "Kuyrukta",
  running: "Dönüştürülüyor…",
  done: "Tamamlandı",
  error: "Hata",
};

const STATUS_PILLS: Record<BatchItemStatus, string> = {
  pending: "border border-slate-700/80 bg-slate-800/80 text-slate-300",
  running: "border border-cyan-400/50 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 animate-pulse shadow-sm shadow-cyan-500/30",
  done: "border border-emerald-500/40 bg-emerald-500/15 text-emerald-300 font-semibold shadow-sm shadow-emerald-500/10",
  error: "border border-red-500/40 bg-red-500/15 text-red-300 font-medium",
};

interface BatchEntry extends BatchItem {
  file: File;
  outputBlob?: Blob;
}

const BASE_PDF_OPTIONS = {
  fontSize: 12,
  margin: 20,
  align: "left" as PdfAlign,
  pageNumbers: true,
};

export default function BatchConvertPanel() {
  const [entries, setEntries] = useState<BatchEntry[]>([]);
  const [rejectedNotice, setRejectedNotice] = useState<string | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [converting, setConverting] = useState(false);
  const [zipping, setZipping] = useState(false);
  const [zipBlob, setZipBlob] = useState<Blob | null>(null);

  const progress = batchProgress(entries);
  const hasPending = entries.some((e) => e.status === "pending" || e.status === "error");
  const allDone = entries.length > 0 && entries.every((e) => e.status === "done" || e.status === "error");
  const successfulCount = entries.filter((e) => e.status === "done").length;

  const handleFiles = (incoming: File[]) => {
    const plan = planBatch(incoming);
    const existing = new Set(entries.map((e) => e.name));
    const fresh: BatchEntry[] = [];
    for (const item of plan.items) {
      const file = incoming.find((f) => f.name === item.name);
      if (file && !existing.has(item.name)) {
        fresh.push({ ...item, file });
      }
    }
    setEntries((prev) => [...prev, ...fresh]);
    setRejectedNotice(plan.reason ?? null);
    setZipBlob(null);
  };

  const removeEntry = (index: number) => {
    setEntries((prev) => prev.filter((_, i) => i !== index));
    setZipBlob(null);
  };

  const clearAll = () => {
    setEntries([]);
    setZipBlob(null);
  };

  const updateStatus = (
    id: string,
    status: BatchItemStatus,
    error?: string,
    outputBlob?: Blob,
    outputName?: string
  ) => {
    setEntries((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, status, error, outputBlob, outputName } : e
      )
    );
  };

  const handleConvertClick = () => {
    void convertAll();
  };

  const convertAll = async () => {
    if (converting) return;
    const queue = entries.filter((e) => e.status === "pending" || e.status === "error");
    if (queue.length === 0) return;

    setConverting(true);
    setZipBlob(null);

    const generatedArchiveEntries: ZipArchiveEntry[] = [];

    try {
      for (const entry of queue) {
        updateStatus(entry.id, "running");
        try {
          const type = entry.fileType || detectFileType(entry.name);
          const rawBaseName = entry.name.replace(/\.[a-zA-Z0-9]+$/i, "") || "dosya";

          let blob: Blob;
          let outName: string;

          if (type === "txt" || type === "md") {
            const text = await entry.file.text();
            const doc = await textToPdf(text, {
              ...BASE_PDF_OPTIONS,
              watermark: !isPro,
            });
            outName = `${rawBaseName}.pdf`;
            const docArrayBuf = doc.output("arraybuffer");
            blob = new Blob([docArrayBuf], { type: "application/pdf" });
          } else if (type === "pdf") {
            blob = await convertPdfToDocx(entry.file);
            outName = `${rawBaseName}.docx`;
          } else if (type === "image") {
            const res = await convertImageToWebp(entry.file, { quality: 85 });
            blob = res.blob;
            outName = `${rawBaseName}.webp`;
          } else {
            // fallback plain text to pdf
            const text = await entry.file.text();
            const doc = await textToPdf(text, {
              ...BASE_PDF_OPTIONS,
              watermark: !isPro,
            });
            outName = `${rawBaseName}.pdf`;
            const docArrayBuf = doc.output("arraybuffer");
            blob = new Blob([docArrayBuf], { type: "application/pdf" });
          }

          updateStatus(entry.id, "done", undefined, blob, outName);
          generatedArchiveEntries.push({ name: outName, content: blob });
        } catch (err) {
          updateStatus(
            entry.id,
            "error",
            err instanceof Error ? err.message : "Dönüştürme başarısız"
          );
        }
      }

      // Bundle all successful converted files into a ZIP archive with JSZip
      if (generatedArchiveEntries.length > 0) {
        setZipping(true);
        const zip = await createZipArchive(generatedArchiveEntries);
        setZipBlob(zip);
        downloadBlob(zip, "konvertlab_toplu_arsiv.zip");
      }
    } finally {
      setConverting(false);
      setZipping(false);
    }
  };

  const handleDownloadZipManual = () => {
    if (!zipBlob) return;
    downloadBlob(zipBlob, "konvertlab_toplu_arsiv.zip");
  };

  const handleLoadSamples = async () => {
    const samplePdf = createSamplePdf("document");
    const sampleTable = createSamplePdf("table");
    const sampleImg = await createSampleImage("ÖRNEK BELGE GÖRSELİ");
    handleFiles([samplePdf, sampleTable, sampleImg]);
  };

  return (
    <div className="space-y-5">
      <DropZone
        accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.md"
        multiple
        files={[]}
        onFiles={handleFiles}
        onRemove={() => undefined}
        label="Toplu dönüştürülecek dosyalarınızı sürükleyin (PDF, Görsel, TXT, MD)"
        hint={`Karışık formatlar desteklenir — en fazla ${MAX_BATCH_FILES} dosya tek ZIP arşivi olarak indirilir`}
      />

      <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
        <button
          type="button"
          data-testid="sample-file-batch"
          onClick={handleLoadSamples}
          className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-indigo-500/10 px-4 py-2.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400 transition-all shadow-sm active:scale-95"
        >
          <Sparkles className="h-4 w-4 text-cyan-400 shrink-0" />
          <span>Örnek Dosyalar ile Dene</span>
          <span className="rounded-full bg-cyan-400/20 px-2 py-0.5 text-[10px] font-bold text-cyan-200">
            3 Farklı Dosya (PDF, Tablo, Görsel) (1-Tık)
          </span>
        </button>
      </div>

      {rejectedNotice && (
        <p role="alert" className="rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-400">
          {rejectedNotice}
        </p>
      )}

      {entries.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Layers className="h-4 w-4 text-cyan-400" />
              <span>{entries.length} / {MAX_BATCH_FILES} dosya kuyrukta</span>
              {successfulCount > 0 && (
                <span className="text-xs text-emerald-400 font-semibold">
                  ({successfulCount} tamamlandı)
                </span>
              )}
            </p>
            <button
              type="button"
              onClick={clearAll}
              disabled={converting}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-2.5 py-1.5 text-xs text-slate-400 transition-colors hover:bg-slate-800 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              Listeyi temizle
            </button>
          </div>

          <ul className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {entries.map((entry, index) => (
              <li
                key={entry.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/60 px-3.5 py-2.5 transition-all hover:border-slate-700"
              >
                <div className="min-w-0 flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-400 shrink-0">
                    <FileCheck className="h-4 w-4 text-cyan-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-200">{entry.name}</p>
                    <p className="text-xs text-slate-500">
                      {formatBytes(entry.size)}
                      {entry.outputName ? (
                        <span className="text-emerald-400 font-medium"> → {entry.outputName}</span>
                      ) : (
                        <span> → {entry.targetFormat?.toUpperCase()}</span>
                      )}
                      {entry.error ? ` — ${entry.error}` : ""}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {/* Animated Status Badges */}
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs transition-all ${STATUS_PILLS[entry.status]}`}
                  >
                    {entry.status === "running" && (
                      <Loader2
                        className="h-3 w-3 animate-spin text-cyan-300"
                        aria-hidden="true"
                      />
                    )}
                    {entry.status === "done" && (
                      <CheckCircle2
                        className="h-3.5 w-3.5 text-emerald-400 shrink-0"
                        aria-hidden="true"
                      />
                    )}
                    {entry.status === "pending" && (
                      <Clock
                        className="h-3 w-3 text-slate-400 shrink-0"
                        aria-hidden="true"
                      />
                    )}
                    {entry.status === "error" && (
                      <AlertCircle
                        className="h-3 w-3 text-red-400 shrink-0"
                        aria-hidden="true"
                      />
                    )}
                    <span>{STATUS_LABELS[entry.status]}</span>
                  </span>

                  <button
                    type="button"
                    aria-label={`${entry.name} dosyasını listeden çıkar`}
                    onClick={() => removeEntry(index)}
                    disabled={converting && entry.status === "running"}
                    className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-800 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <ProgressBar
            value={progress.percent}
            label={`Toplu ilerleme — ${progress.done} / ${progress.total} dosya işlendi (%${progress.percent})`}
          />
        </div>
      )}

      {/* Prominent 1-Click JSZip Archive Download Card */}
      {zipBlob && allDone && !converting && (
        <div className="rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/30 p-5 shadow-xl shadow-emerald-950/30">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                <Archive className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-300">
                  Tüm Dosyalar Dönüştürüldü ve ZIP Arşivine Eklendi!
                </p>
                <p className="text-xs text-emerald-400/90 mt-0.5">
                  {successfulCount} dosya sıkıştırıldı • ZIP Arşiv Boyutu:{" "}
                  <strong className="text-emerald-200">{formatBytes(zipBlob.size)}</strong>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownloadZipManual}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3 text-xs font-bold text-slate-950 hover:from-emerald-400 hover:to-teal-400 transition-all shadow-lg shadow-emerald-500/25 active:scale-95"
            >
              <Download className="h-4 w-4" />
              <span>Tek Tıkla ZIP Arşivini İndir</span>
            </button>
          </div>
        </div>
      )}

      <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-400">
        <input
          type="checkbox"
          checked={isPro}
          onChange={(e) => setIsPro(e.target.checked)}
          className="h-4 w-4 rounded border-slate-600 bg-slate-900 accent-cyan-500"
        />
        <span>
          <strong className="text-slate-200">Pro Sürüm:</strong> Filigransız yüksek hızlı toplu dönüştürme ve ZIP arşivi indirme
        </span>
      </label>

      <button
        type="button"
        onClick={handleConvertClick}
        disabled={entries.length === 0 || converting || (!hasPending && !!zipBlob)}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3.5 text-sm font-bold text-slate-950 transition-all hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 active:scale-98 shadow-lg shadow-cyan-500/20"
      >
        {converting || zipping ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : isPro ? (
          <Archive className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Crown className="h-4 w-4" aria-hidden="true" />
        )}
        {converting
          ? "Dosyalar İstemci Tarafında Dönüştürülüyor…"
          : zipping
            ? "ZIP Arşivi Paketleniyor (JSZip)…"
            : isPro
              ? "Toplu Dönüştür & ZIP Olarak İndir (Pro)"
              : "Toplu Dönüştür & ZIP Olarak İndir"}
      </button>

      <p className="text-xs text-slate-500">
        <Layers className="mr-1 inline h-3.5 w-3.5 align-[-3px]" aria-hidden="true" />
        Tüm dosyalar eşzamanlı olarak istemci tarafında dönüştürülür ve JSZip ile tek bir ZIP dosyası haline getirilerek anında indirilir. Hiçbir veri harici sunucuya iletilmez.
      </p>

      {showPricing && <PricingModal onClose={() => setShowPricing(false)} />}
    </div>
  );
}
