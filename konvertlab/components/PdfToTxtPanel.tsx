"use client";

import { useState } from "react";
import { FileDown, Copy, Loader2, Check } from "lucide-react";
import DropZone from "@/components/DropZone";
import ProgressBar from "@/components/ProgressBar";
import { extractText } from "@/lib/pdfExtract";
import type { PageText } from "@/types";

function toOutput(pages: PageText[]): string {
  return pages
    .map((p) => `--- Sayfa ${p.page} ---\n${p.text}`)
    .join("\n\n");
}

export default function PdfToTxtPanel() {
  const [files, setFiles] = useState<File[]>([]);
  const [pages, setPages] = useState<PageText[] | null>(null);
  const [output, setOutput] = useState("");
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleFiles = async (incoming: File[]) => {
    const file = incoming[0];
    if (!file) return;
    setFiles(incoming);
    setPages(null);
    setOutput("");
    setError(null);
    setCopied(false);
    setConverting(true);
    setProgress(3);
    try {
      const result = await extractText(file, (p) => setProgress(p));
      setPages(result);
      setOutput(toOutput(result));
      setProgress(100);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Metin çıkarılamadı. Lütfen tekrar deneyin."
      );
    } finally {
      setConverting(false);
      setTimeout(() => setProgress(0), 1200);
    }
  };

  const download = () => {
    const baseName = files[0]?.name.replace(/\.pdf$/i, "") || "cikti";
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${baseName}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Kopyalama başarısız oldu. Metni elle seçip kopyalayabilirsiniz.");
    }
  };

  return (
    <div className="space-y-5">
      <DropZone
        accept="application/pdf,.pdf"
        files={files}
        onFiles={handleFiles}
        onRemove={() => {
          setFiles([]);
          setPages(null);
          setOutput("");
        }}
        label="PDF dosyanızı sürükleyin"
        hint="metin, sayfa sayfa tarayıcınızda çıkarılır (.pdf, maks. 25 MB)"
      />

      {error && (
        <p role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      {(converting || progress > 0) && (
        <ProgressBar value={progress} label="Metin çıkarılıyor…" />
      )}

      {pages && (
        <p className="text-xs text-slate-500">
          {pages.length} sayfa işlendi · {pages.reduce((n, p) => n + p.text.length, 0)}{" "}
          karakter bulundu
        </p>
      )}

      {output && (
        <>
          <div>
            <label htmlFor="pdf-output" className="mb-1.5 block text-xs font-medium text-slate-400">
              Çıkarılan metin (düzenleyebilirsiniz — sayfa ayraçları korunur)
            </label>
            <textarea
              id="pdf-output"
              value={output}
              onChange={(e) => setOutput(e.target.value)}
              rows={14}
              className="w-full resize-y rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 font-mono text-xs leading-relaxed text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={download}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-semibold text-slate-950 transition-transform hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              <FileDown className="h-4 w-4" aria-hidden="true" />
              TXT olarak indir
            </button>
            <button
              type="button"
              onClick={copy}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-700 px-5 py-3 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              {copied ? (
                <Check className="h-4 w-4 text-cyan-400" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Kopyalandı" : "Tümünü kopyala"}
            </button>
          </div>
        </>
      )}

      {!output && !converting && !error && (
        <div className="flex items-start gap-2 rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2.5 text-xs text-slate-500">
          <Loader2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-600" aria-hidden="true" />
          İpucu: Taranmış (görsel) PDF&apos;lerden veya resimlerden metin çıkarmak için üst menüdeki
          &quot;İstemci OCR&quot; sekmesini kullanabilirsiniz.
        </div>
      )}
    </div>
  );
}
