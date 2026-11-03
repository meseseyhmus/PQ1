"use client";

import { useState } from "react";
import {
  ScanText,
  Download,
  Copy,
  Check,
  Loader2,
  Sparkles,
  Languages,
  FileText,
  FileDown,
} from "lucide-react";
import DropZone from "@/components/DropZone";
import ProgressBar from "@/components/ProgressBar";
import { performClientOcr } from "@/lib/ocrEngine";
import { convertTextToDocx } from "@/lib/docxGenerate";
import { textToPdf } from "@/lib/pdfGenerate";
import { downloadBlob } from "@/lib/downloadHelper";
import { formatBytes } from "@/lib/format";
import { createSampleImage } from "@/lib/sampleFiles";
import type { OcrLanguage, OcrResult } from "@/types";

export default function OcrPanel() {
  const [files, setFiles] = useState<File[]>([]);
  const [lang, setLang] = useState<OcrLanguage>("tur+eng");
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<OcrResult | null>(null);
  const [editableText, setEditableText] = useState("");
  const [copied, setCopied] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingDocx, setExportingDocx] = useState(false);

  const handleFiles = (incoming: File[]) => {
    const file = incoming[0];
    if (!file) return;
    setFiles([file]);
    setError(null);
    setResult(null);
    setEditableText("");
  };

  const handleRunOcr = async () => {
    const file = files[0];
    if (!file || running) return;

    setRunning(true);
    setProgress(5);
    setStatusMessage("OCR motoru ve Türkçe dil modeli hazırlanıyor…");
    setError(null);
    setResult(null);
    setEditableText("");

    try {
      const ocrRes = await performClientOcr(file, lang, (update) => {
        setProgress(update.progress);
        setStatusMessage(update.status);
      });

      if (!ocrRes.text) {
        throw new Error(
          "Görsel veya PDF sayfasında okunabilir metin bulunamadı. Lütfen daha net bir doküman deneyin."
        );
      }

      setResult(ocrRes);
      setEditableText(ocrRes.text);
      setProgress(100);
      setStatusMessage("Metin tanıma başarıyla tamamlandı.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "OCR işlemi sırasında bir hata oluştu."
      );
    } finally {
      setRunning(false);
      setTimeout(() => setProgress(0), 1200);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editableText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Kopyalama başarısız oldu. Metni elle seçebilirsiniz.");
    }
  };

  const handleDownloadTxt = () => {
    if (!editableText || !files[0]) return;
    const baseName = files[0].name.replace(/\.[a-zA-Z0-9]+$/i, "") || "ocr_metin";
    const blob = new Blob([editableText], { type: "text/plain;charset=utf-8" });
    downloadBlob(blob, `${baseName}_ocr.txt`);
  };

  const handleDownloadPdf = async () => {
    if (!editableText || !files[0]) return;
    const baseName = files[0].name.replace(/\.[a-zA-Z0-9]+$/i, "") || "ocr_metin";
    setExportingPdf(true);
    try {
      const doc = await textToPdf(editableText, {
        fontSize: 12,
        margin: 20,
        align: "left",
        title: `${baseName} — OCR Metin Raporu`,
        pageNumbers: true,
      });
      doc.save(`${baseName}_ocr.pdf`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "PDF raporu oluşturulurken bir hata oluştu."
      );
    } finally {
      setExportingPdf(false);
    }
  };

  const handleDownloadDocx = async () => {
    if (!editableText || !files[0]) return;
    const baseName = files[0].name.replace(/\.[a-zA-Z0-9]+$/i, "") || "ocr_metin";
    setExportingDocx(true);
    try {
      const docxBlob = await convertTextToDocx(editableText, baseName);
      downloadBlob(docxBlob, `${baseName}_ocr.docx`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "DOCX belgesi oluşturulurken bir hata oluştu."
      );
    } finally {
      setExportingDocx(false);
    }
  };

  const handleLoadSample = async () => {
    const sample = await createSampleImage(
      "RESMİ FATURA NO: 2026-9812 / 14.500 TL\nTÜRKÇE KARAKTER TESTİ: ğüşiöç"
    );
    handleFiles([sample]);
  };

  const currentFile = files[0];

  return (
    <div className="space-y-5">
      <DropZone
        accept="image/*,application/pdf,.pdf,.jpg,.jpeg,.png,.webp,.bmp"
        files={files}
        onFiles={handleFiles}
        onRemove={() => {
          setFiles([]);
          setResult(null);
          setEditableText("");
          setError(null);
        }}
        label="Taranmış PDF veya Görseli sürükleyin (OCR)"
        hint="Taranmış faturalar, fişler, kitap sayfaları ve resimler içerisindeki metinler taranır (.pdf, .jpg, .png)"
      />

      <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
        <button
          type="button"
          data-testid="sample-file-ocr"
          onClick={handleLoadSample}
          className="inline-flex items-center gap-2 rounded-xl border border-violet-500/40 bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-amber-500/10 px-4 py-2.5 text-xs font-semibold text-violet-300 hover:bg-violet-500/20 hover:border-violet-400 transition-all shadow-sm active:scale-95"
        >
          <Sparkles className="h-4 w-4 text-violet-400 shrink-0" />
          <span>Örnek Dosya ile Dene</span>
          <span className="rounded-full bg-violet-400/20 px-2 py-0.5 text-[10px] font-bold text-violet-200">
            Taranmış Fatura (Türkçe OCR 1-Tık)
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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                <ScanText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-200">{currentFile.name}</p>
                <p className="text-xs text-slate-500">{formatBytes(currentFile.size)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Languages className="h-4 w-4 text-amber-400" />
              <label htmlFor="ocr-lang-select" className="text-xs text-slate-400">
                Tanıma Dili:
              </label>
              <select
                id="ocr-lang-select"
                value={lang}
                onChange={(e) => setLang(e.target.value as OcrLanguage)}
                className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                <option value="tur+eng">Türkçe + İngilizce (Önerilen)</option>
                <option value="tur">Yalnızca Türkçe</option>
                <option value="eng">Yalnızca İngilizce</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {(running || progress > 0) && (
        <div className="space-y-2 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-amber-300">
              {statusMessage || "Metin taranıyor ve tanınıyor…"}
            </span>
            <span className="font-bold text-amber-400">%{progress}</span>
          </div>
          <ProgressBar
            value={progress}
            label={statusMessage || "Metin taranıyor ve tanınıyor…"}
          />
        </div>
      )}

      {editableText && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label htmlFor="ocr-text-output" className="text-xs font-semibold text-slate-300">
                Çıkarılan Metin (Düzenlenebilir)
              </label>
              {result && (
                <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400 border border-emerald-500/30">
                  %{result.confidence} Tanıma Doğruluğu
                </span>
              )}
            </div>
            <span className="text-xs text-slate-500">
              {editableText.length} karakter · {result?.wordCount || 0} kelime
            </span>
          </div>

          <textarea
            id="ocr-text-output"
            value={editableText}
            onChange={(e) => setEditableText(e.target.value)}
            rows={12}
            className="w-full resize-y rounded-xl border border-slate-700 bg-slate-900 p-3 font-mono text-xs leading-relaxed text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          />

          {/* Instant Actions Toolbar */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/80 px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 transition-colors active:scale-95 shadow-sm"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span className="text-emerald-300 font-semibold">Panoya Kopyalandı</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 text-slate-400" />
                  <span>Panoya Kopyala</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadTxt}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/80 px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 transition-colors active:scale-95 shadow-sm"
            >
              <Download className="h-4 w-4 text-slate-400" />
              <span>TXT İndir</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={exportingPdf}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/40 bg-red-500/10 px-3.5 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/20 transition-colors active:scale-95 shadow-sm disabled:opacity-50"
            >
              {exportingPdf ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileDown className="h-4 w-4 text-red-400" />
              )}
              <span>PDF İndir</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadDocx}
              disabled={exportingDocx}
              className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/40 bg-blue-500/10 px-3.5 py-2 text-xs font-semibold text-blue-300 hover:bg-blue-500/20 transition-colors active:scale-95 shadow-sm disabled:opacity-50"
            >
              {exportingDocx ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileText className="h-4 w-4 text-blue-400" />
              )}
              <span>Word (DOCX) İndir</span>
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleRunOcr}
          disabled={!currentFile || running}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-3 text-sm font-semibold text-slate-950 transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 active:scale-98"
        >
          {running ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Türkçe OCR ile Metin Çıkarılıyor…
            </>
          ) : (
            <>
              <ScanText className="h-4 w-4" />
              OCR ile Metin Çıkar (Tesseract.js)
            </>
          )}
        </button>
      </div>

      <p className="text-xs text-slate-500">
        ⚡ Tesseract.js yapay zeka OCR kütüphanesi ile taranmış belgeler ve fotoğraflar tarayıcınızda doğrudan işlenir. Türkçe karakterler (ç, ğ, ı, ö, ş, ü) eksiksiz tanınır.
      </p>
    </div>
  );
}
