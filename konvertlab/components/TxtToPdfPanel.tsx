"use client";

import { useState } from "react";
import { FileDown, Layers, Loader2, FileText } from "lucide-react";
import DropZone from "@/components/DropZone";
import ProgressBar from "@/components/ProgressBar";
import BatchConvertPanel from "@/components/BatchConvertPanel";
import { textToPdf, savePdf } from "@/lib/pdfGenerate";
import { countWords } from "@/lib/format";
import type { PdfAlign } from "@/types";

const FONT_SIZES = [8, 10, 11, 12, 14, 16, 18, 20, 22, 24];
const MARGINS = [10, 15, 20, 25, 30, 35, 40];
const ALIGNS: { value: PdfAlign; label: string }[] = [
  { value: "left", label: "Sola" },
  { value: "justify", label: "İki Yana" },
  { value: "center", label: "Ortaya" },
];

const inputClass =
  "w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400";
const labelClass = "mb-1.5 block text-xs font-medium text-slate-400";

type Mode = "single" | "batch";

export default function TxtToPdfPanel() {
  const [mode, setMode] = useState<Mode>("single");
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState("");
  const [fontSize, setFontSize] = useState(12);
  const [margin, setMargin] = useState(20);
  const [align, setAlign] = useState<PdfAlign>("left");
  const [pageNumbers, setPageNumbers] = useState(true);
  const [watermark, setWatermark] = useState(true);
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = (incoming: File[]) => {
    setFiles(incoming);
    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      setText(typeof reader.result === "string" ? reader.result : "");
    };
    reader.onerror = () => setError("Dosya okunamadı. Lütfen tekrar deneyin.");
    reader.readAsText(incoming[0], "utf-8");
  };

  const convert = async () => {
    if (!text.trim() || converting) return;
    setConverting(true);
    setError(null);
    setProgress(8);
    try {
      setProgress(25);
      const doc = await textToPdf(text, {
        fontSize,
        margin,
        align,
        title: title || undefined,
        pageNumbers,
        watermark,
      });
      setProgress(85);
      await new Promise((r) => setTimeout(r, 150));
      const baseName =
        files[0]?.name.replace(/\.(txt|md)$/i, "") || title.trim() || "konvertlab";
      savePdf(doc, `${baseName}.pdf`);
      setProgress(100);
    } catch (err) {
      setError(
        err instanceof Error
          ? `PDF oluşturulamadı: ${err.message}`
          : "PDF oluşturulamadı. Lütfen tekrar deneyin."
      );
    } finally {
      setConverting(false);
      setTimeout(() => setProgress(0), 1200);
    }
  };

  return (
    <div className="space-y-5">
      <div
        role="tablist"
        aria-label="Dönüşüm modu"
        className="grid grid-cols-2 gap-1 rounded-xl border border-slate-800 bg-slate-900/60 p-1"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === "single"}
          onClick={() => setMode("single")}
          className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
            mode === "single"
              ? "bg-cyan-500/15 text-cyan-300"
              : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
          }`}
        >
          <FileText className="h-4 w-4" aria-hidden="true" />
          Tek Dosya
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "batch"}
          onClick={() => setMode("batch")}
          className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
            mode === "batch"
              ? "bg-cyan-500/15 text-cyan-300"
              : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
          }`}
        >
          <Layers className="h-4 w-4" aria-hidden="true" />
          Toplu Dönüşüm (Pro)
        </button>
      </div>

      {mode === "batch" ? (
        <BatchConvertPanel />
      ) : (
        <>
      <DropZone
        accept=".txt,.md"
        files={files}
        onFiles={handleFiles}
        onRemove={() => {
          setFiles([]);
          setText("");
        }}
        label="TXT / Markdown dosyanızı sürükleyin"
        hint="veya dosya seçin — içerik aşağıdaki düzenleyiciye yüklenir (.txt, .md, maks. 25 MB)"
      />

      <div>
        <label htmlFor="txt-input" className={labelClass}>
          Metin (dosya yükleyin veya doğrudan yazın/yapıştırın)
        </label>
        <textarea
          id="txt-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          placeholder="Metninizi buraya yapıştırın veya bir .txt dosyası yükleyin…"
          className={`${inputClass} resize-y font-mono text-xs leading-relaxed`}
        />
        <p className="mt-1 text-right text-xs text-slate-500">
          {countWords(text)} kelime · {text.length} karakter
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="opt-fontsize" className={labelClass}>
            Yazı Boyutu (pt)
          </label>
          <select
            id="opt-fontsize"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className={inputClass}
          >
            {FONT_SIZES.map((s) => (
              <option key={s} value={s}>
                {s} pt
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="opt-margin" className={labelClass}>
            Sayfa Kenar Boşluğu
          </label>
          <select
            id="opt-margin"
            value={margin}
            onChange={(e) => setMargin(Number(e.target.value))}
            className={inputClass}
          >
            {MARGINS.map((m) => (
              <option key={m} value={m}>
                {m} mm
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="opt-align" className={labelClass}>
            Hizalama
          </label>
          <select
            id="opt-align"
            value={align}
            onChange={(e) => setAlign(e.target.value as PdfAlign)}
            className={inputClass}
          >
            {ALIGNS.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
        </div>
        <div className="col-span-2 sm:col-span-3">
          <label htmlFor="opt-title" className={labelClass}>
            Başlık (isteğe bağlı)
          </label>
          <input
            id="opt-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="PDF'in ilk satırında görünecek başlık"
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-2">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={pageNumbers}
            onChange={(e) => setPageNumbers(e.target.checked)}
            className="h-4 w-4 rounded border-slate-600 bg-slate-900 accent-cyan-500"
          />
          Sayfa numaraları
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={watermark}
            onChange={(e) => setWatermark(e.target.checked)}
            className="h-4 w-4 rounded border-slate-600 bg-slate-900 accent-cyan-500"
          />
          Filigran (Pro ile kaldırılır)
        </label>
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      {converting || progress > 0 ? (
        <ProgressBar value={progress} label="PDF oluşturuluyor…" />
      ) : null}

      <button
        type="button"
        onClick={convert}
        disabled={!text.trim() || converting}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-semibold text-slate-950 transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
      >
        {converting ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <FileDown className="h-4 w-4" aria-hidden="true" />
        )}
        {converting ? "Dönüştürülüyor…" : "PDF olarak indir"}
      </button>

      <p className="text-xs text-slate-600">
        Ücretsiz planda aynı anda tek dosya dönüştürebilirsiniz. Pro üyelik ile 50
        dosyaya kadar toplu dönüştürme yapabilirsiniz.
      </p>
        </>
      )}
    </div>
  );
}
