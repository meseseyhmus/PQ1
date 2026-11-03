"use client";

import { useState } from "react";
import { FileSpreadsheet, Download, Loader2, Sparkles, CheckCircle2, Table } from "lucide-react";
import DropZone from "@/components/DropZone";
import ProgressBar from "@/components/ProgressBar";
import { convertPdfToExcel } from "@/lib/excelGenerate";
import { downloadBlob } from "@/lib/downloadHelper";
import { formatBytes } from "@/lib/format";
import { createSamplePdf } from "@/lib/sampleFiles";

export default function PdfToExcelPanel() {
  const [files, setFiles] = useState<File[]>([]);
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [convertedBlob, setConvertedBlob] = useState<Blob | null>(null);
  const [meta, setMeta] = useState<{ rowCount: number; sheetCount: number; sampleData: string[][] } | null>(null);
  const [combinedSheet, setCombinedSheet] = useState(false);

  const handleFiles = (incoming: File[]) => {
    const file = incoming[0];
    if (!file) return;
    setFiles([file]);
    setError(null);
    setConvertedBlob(null);
    setMeta(null);
  };

  const handleConvert = async () => {
    const file = files[0];
    if (!file || converting) return;

    setConverting(true);
    setProgress(5);
    setError(null);
    setConvertedBlob(null);
    setMeta(null);

    try {
      const result = await convertPdfToExcel(file, (p) => setProgress(p), {
        combinedSheet,
      });
      setConvertedBlob(result.blob);
      setMeta({
        rowCount: result.rowCount,
        sheetCount: result.sheetCount,
        sampleData: result.sampleData,
      });
      setProgress(100);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "PDF, Excel tablosuna dönüştürülürken bir hata oluştu."
      );
    } finally {
      setConverting(false);
      setTimeout(() => setProgress(0), 1200);
    }
  };

  const handleDownload = () => {
    if (!convertedBlob || !files[0]) return;
    const baseName = files[0].name.replace(/\.pdf$/i, "") || "tablo";
    downloadBlob(convertedBlob, `${baseName}.xlsx`);
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
          setMeta(null);
          setError(null);
        }}
        label="Excel'e dönüştürülecek PDF tablosunu sürükleyin"
        hint="PDF içindeki sütunlar, sayılar ve tablolar .xlsx formatına dönüştürülür (maks. 25 MB)"
      />

      <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
        <button
          type="button"
          data-testid="sample-file-excel"
          onClick={() => {
            const sample = createSamplePdf("table");
            handleFiles([sample]);
          }}
          className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-green-500/10 px-4 py-2.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-400 transition-all shadow-sm active:scale-95"
        >
          <Sparkles className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>Örnek Dosya ile Dene</span>
          <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] font-bold text-emerald-200">
            Finans &amp; Satış Tablosu (1-Tık)
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
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-200">{currentFile.name}</p>
                <p className="text-xs text-slate-500">{formatBytes(currentFile.size)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                <Sparkles className="h-3 w-3" />
                XLSX Hazır
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-400">
              <input
                type="checkbox"
                checked={combinedSheet}
                onChange={(e) => setCombinedSheet(e.target.checked)}
                className="h-4 w-4 rounded border-slate-600 bg-slate-900 accent-emerald-500"
              />
              Tüm sayfaları tek bir çalışma sayfasında (sheet) birleştir
            </label>
          </div>
        </div>
      )}

      {(converting || progress > 0) && (
        <ProgressBar
          value={progress}
          label="PDF koordinatları taranıyor ve Excel hücreleri derleniyor…"
        />
      )}

      {convertedBlob && meta && !converting && (
        <div className="space-y-3">
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-emerald-300">Dönüştürme Başarılı!</p>
                <p className="text-xs text-emerald-400/80">
                  {meta.sheetCount} sayfa, {meta.rowCount} satır veri bulundu ({formatBytes(convertedBlob.size)}).
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-colors"
              >
                <Download className="h-4 w-4" />
                İndir (.xlsx)
              </button>
            </div>
          </div>

          {meta.sampleData.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/70 p-3">
              <div className="flex items-center gap-2 mb-2 text-xs font-medium text-slate-400">
                <Table className="h-3.5 w-3.5 text-emerald-400" />
                Örnek Tablo Önizlemesi (İlk {meta.sampleData.length} satır)
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <tbody>
                    {meta.sampleData.map((row, rIdx) => (
                      <tr
                        key={rIdx}
                        className={rIdx === 0 ? "bg-slate-800/80 font-semibold text-slate-200" : "border-t border-slate-800 text-slate-300"}
                      >
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="px-3 py-1.5 border border-slate-800/60 truncate max-w-[200px]">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={convertedBlob ? handleDownload : handleConvert}
          disabled={!currentFile || converting}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-3 text-sm font-semibold text-slate-950 transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          {converting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Excel Tablosuna Dönüştürülüyor…
            </>
          ) : convertedBlob ? (
            <>
              <Download className="h-4 w-4" />
              Excel (.xlsx) Tablosunu İndir
            </>
          ) : (
            <>
              <FileSpreadsheet className="h-4 w-4" />
              Excel (.xlsx) Formatına Dönüştür
            </>
          )}
        </button>
      </div>

      <p className="text-xs text-slate-500">
        📊 İpucu: PDF tablonuzdaki satırlar ve sütun aralıkları piksel koordinatlarıyla otomatik ayrıştırılır.
      </p>
    </div>
  );
}
