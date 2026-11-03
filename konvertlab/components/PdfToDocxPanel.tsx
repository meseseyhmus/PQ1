"use client";

import { useState } from "react";
import { FileText, Download, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import DropZone from "@/components/DropZone";
import ProgressBar from "@/components/ProgressBar";
import { convertPdfToDocx } from "@/lib/docxGenerate";
import { downloadBlob } from "@/lib/downloadHelper";
import { formatBytes } from "@/lib/format";
import { createSamplePdf } from "@/lib/sampleFiles";

export default function PdfToDocxPanel() {
  const [files, setFiles] = useState<File[]>([]);
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [convertedBlob, setConvertedBlob] = useState<Blob | null>(null);
  const [docTitle, setDocTitle] = useState("");

  const handleFiles = (incoming: File[]) => {
    const file = incoming[0];
    if (!file) return;
    setFiles([file]);
    setError(null);
    setConvertedBlob(null);
    const suggested = file.name.replace(/\.pdf$/i, "");
    setDocTitle(suggested);
  };

  const handleConvert = async () => {
    const file = files[0];
    if (!file || converting) return;

    setConverting(true);
    setProgress(5);
    setError(null);
    setConvertedBlob(null);

    try {
      const blob = await convertPdfToDocx(
        file,
        (p) => setProgress(p),
        { title: docTitle || undefined }
      );
      setConvertedBlob(blob);
      setProgress(100);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "PDF, Word belgesine dönüştürülürken bir hata oluştu."
      );
    } finally {
      setConverting(false);
      setTimeout(() => setProgress(0), 1200);
    }
  };

  const handleDownload = () => {
    if (!convertedBlob || !files[0]) return;
    const baseName = (docTitle || files[0].name.replace(/\.pdf$/i, "")).trim() || "belge";
    downloadBlob(convertedBlob, `${baseName}.docx`);
  };

  const currentFile = files[0];

  return (
    <div className="space-y-5">
      <DropZone
        accept="application/pdf,.pdf"
        files={files}
        onFiles={handleFiles}
        onRemove={() => {
          setFiles([]);
          setConvertedBlob(null);
          setError(null);
        }}
        label="Word'e dönüştürülecek PDF dosyasını sürükleyin"
        hint="Tüm metinler, başlıklar ve paragraflar .docx formatına aktarılır (maks. 25 MB)"
      />

      <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
        <button
          type="button"
          data-testid="sample-file-docx"
          onClick={() => {
            const sample = createSamplePdf("document");
            handleFiles([sample]);
          }}
          className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-indigo-500/10 px-4 py-2.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400 transition-all shadow-sm active:scale-95"
        >
          <Sparkles className="h-4 w-4 text-cyan-400 shrink-0" />
          <span>Örnek Dosya ile Dene</span>
          <span className="rounded-full bg-cyan-400/20 px-2 py-0.5 text-[10px] font-bold text-cyan-200">
            Kurumsal Rapor (1-Tık)
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
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-200">{currentFile.name}</p>
                <p className="text-xs text-slate-500">{formatBytes(currentFile.size)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-400">
                <Sparkles className="h-3 w-3" />
                DOCX Hazır
              </span>
            </div>
          </div>

          <div>
            <label htmlFor="docx-title" className="mb-1 block text-xs font-medium text-slate-400">
              Belge Başlığı (isteğe bağlı)
            </label>
            <input
              id="docx-title"
              type="text"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              placeholder="Örn: 2026 Raporu"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            />
          </div>
        </div>
      )}

      {(converting || progress > 0) && (
        <ProgressBar
          value={progress}
          label="PDF metinleri ayrıştırılıyor ve Word belgesi (.docx) derleniyor…"
        />
      )}

      {convertedBlob && !converting && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-emerald-300">Dönüştürme Tamamlandı!</p>
              <p className="text-xs text-emerald-400/80">
                Word belgesi oluşturuldu ({formatBytes(convertedBlob.size)}).
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-colors"
            >
              <Download className="h-4 w-4" />
              İndir
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={convertedBlob ? handleDownload : handleConvert}
          disabled={!currentFile || converting}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          {converting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Word&apos;e Dönüştürülüyor…
            </>
          ) : convertedBlob ? (
            <>
              <Download className="h-4 w-4" />
              Word (.docx) Dosyasını İndir
            </>
          ) : (
            <>
              <FileText className="h-4 w-4" />
              Word (.docx) Formatına Dönüştür
            </>
          )}
        </button>
      </div>

      <p className="text-xs text-slate-500">
        💡 Not: Tüm işlem %100 tarayıcınızda (istemci taraflı) gerçekleştirilir. Dosyalarınız hiçbir harici sunucuya iletilmez.
      </p>
    </div>
  );
}
