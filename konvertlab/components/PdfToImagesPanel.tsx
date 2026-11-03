"use client";

import { useState } from "react";
import { Image as ImageIcon, Download, Loader2, Archive, Eye } from "lucide-react";
import DropZone from "@/components/DropZone";
import ProgressBar from "@/components/ProgressBar";
import { renderPdfToImages, bundlePdfImagesToZip } from "@/lib/pdfToImages";
import { downloadBlob, downloadDataUrl } from "@/lib/downloadHelper";
import { formatBytes } from "@/lib/format";
import { createSamplePdf } from "@/lib/sampleFiles";
import type { PdfImageItem } from "@/types";

export default function PdfToImagesPanel() {
  const [files, setFiles] = useState<File[]>([]);
  const [format, setFormat] = useState<"png" | "jpeg">("png");
  const [scale, setScale] = useState<number>(2.0);
  const [converting, setConverting] = useState(false);
  const [zipping, setZipping] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<PdfImageItem[]>([]);
  const [selectedImage, setSelectedImage] = useState<PdfImageItem | null>(null);

  const handleFiles = (incoming: File[]) => {
    const file = incoming[0];
    if (!file) return;
    setFiles([file]);
    setError(null);
    setImages([]);
    setSelectedImage(null);
  };

  const handleConvert = async () => {
    const file = files[0];
    if (!file || converting) return;

    setConverting(true);
    setProgress(5);
    setStatusText("PDF sayfaları taranıyor…");
    setError(null);
    setImages([]);

    try {
      const rendered = await renderPdfToImages(file, {
        format,
        scale,
        quality: 0.92,
        onProgress: (p, current, total) => {
          setProgress(p);
          setStatusText(`Sayfa ${current} / ${total} görsele dönüştürülüyor…`);
        },
      });
      setImages(rendered);
      setProgress(100);
      setStatusText("Tüm sayfalar başarıyla dönüştürüldü.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "PDF sayfaları görsele dönüştürülürken bir hata oluştu."
      );
    } finally {
      setConverting(false);
      setTimeout(() => setProgress(0), 1200);
    }
  };

  const handleDownloadSingle = (img: PdfImageItem) => {
    downloadDataUrl(img.dataUrl, img.filename);
  };

  const handleDownloadAllZip = async () => {
    if (images.length === 0 || zipping) return;
    setZipping(true);
    setProgress(10);
    setStatusText("Görseller ZIP arşivine paketleniyor…");

    try {
      const baseName = files[0]?.name.replace(/\.pdf$/i, "") || "pdf_sayfalari";
      const zipBlob = await bundlePdfImagesToZip(
        images,
        `${baseName}_gorseller.zip`,
        (p) => setProgress(p)
      );
      downloadBlob(zipBlob, `${baseName}_gorseller.zip`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ZIP arşivi oluşturulamadı.");
    } finally {
      setZipping(false);
      setTimeout(() => setProgress(0), 1200);
    }
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
          setImages([]);
          setError(null);
        }}
        label="Görsele dönüştürülecek PDF dosyasını sürükleyin"
        hint="Her sayfa yüksek çözünürlüklü PNG veya JPG görseline çevrilir"
      />

      {files.length === 0 && (
        <div className="flex items-center justify-center pt-1">
          <button
            type="button"
            onClick={() => {
              const sample = createSamplePdf("document");
              handleFiles([sample]);
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/20 hover:border-indigo-500/50 transition-all shadow-sm"
          >
            <ImageIcon className="h-3.5 w-3.5" />
            Örnek PDF ile Hemen Görsel Çıkar
          </button>
        </div>
      )}

      {error && (
        <p role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      {currentFile && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
                <ImageIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-200">{currentFile.name}</p>
                <p className="text-xs text-slate-500">{formatBytes(currentFile.size)}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex rounded-lg border border-slate-700 bg-slate-900 p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setFormat("png")}
                  className={`rounded-md px-3 py-1 font-medium transition-colors ${
                    format === "png"
                      ? "bg-purple-500 text-slate-950 font-bold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  PNG (Kayıpsız)
                </button>
                <button
                  type="button"
                  onClick={() => setFormat("jpeg")}
                  className={`rounded-md px-3 py-1 font-medium transition-colors ${
                    format === "jpeg"
                      ? "bg-purple-500 text-slate-950 font-bold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  JPG (Kompakt)
                </button>
              </div>

              <div className="flex rounded-lg border border-slate-700 bg-slate-900 p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setScale(1.5)}
                  className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                    scale === 1.5 ? "bg-slate-700 text-white" : "text-slate-400"
                  }`}
                >
                  Standart (1.5x)
                </button>
                <button
                  type="button"
                  onClick={() => setScale(2.0)}
                  className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                    scale === 2.0 ? "bg-slate-700 text-white" : "text-slate-400"
                  }`}
                >
                  HD (2.0x)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {(converting || zipping || progress > 0) && (
        <ProgressBar value={progress} label={statusText || "İşleniyor…"} />
      )}

      {images.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">
              Dönüştürülen Sayfalar ({images.length} Sayfa)
            </span>
            <button
              type="button"
              onClick={handleDownloadAllZip}
              disabled={zipping}
              className="inline-flex items-center gap-1.5 rounded-lg bg-purple-500 px-3.5 py-1.5 text-xs font-bold text-slate-950 hover:bg-purple-400 transition-colors disabled:opacity-50"
            >
              {zipping ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Archive className="h-3.5 w-3.5" />}
              Tümünü ZIP Olarak İndir
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {images.map((img) => (
              <div
                key={img.pageNumber}
                className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-950 p-2 text-center"
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-slate-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.dataUrl}
                    alt={img.filename}
                    className="h-full w-full object-contain"
                  />
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-slate-950/60 opacity-0 backdrop-blur-xs transition group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => setSelectedImage(img)}
                      className="rounded-lg bg-slate-800 p-2 text-slate-200 hover:bg-slate-700"
                      title="Büyük Görünüm"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadSingle(img)}
                      className="rounded-lg bg-purple-500 p-2 text-slate-950 hover:bg-purple-400"
                      title="Görseli İndir"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between px-1 text-[11px] text-slate-400">
                  <span>Sayfa {img.pageNumber}</span>
                  <span>{formatBytes(img.blob.size)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {images.length === 0 && (
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleConvert}
            disabled={!currentFile || converting}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 px-5 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
          >
            {converting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Görsellere Dönüştürülüyor…
              </>
            ) : (
              <>
                <ImageIcon className="h-4 w-4" />
                PDF Sayfalarını {format.toUpperCase()}&apos;e Dönüştür
              </>
            )}
          </button>
        </div>
      )}

      {/* Modal Preview */}
      {selectedImage && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-sm font-semibold text-slate-200">
                {selectedImage.filename} ({selectedImage.width}x{selectedImage.height} px)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadSingle(selectedImage)}
                  className="inline-flex items-center gap-1 rounded-lg bg-purple-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-purple-400"
                >
                  <Download className="h-3.5 w-3.5" />
                  İndir
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
                >
                  Kapat
                </button>
              </div>
            </div>
            <div className="mt-3 max-h-[75vh] overflow-auto flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedImage.dataUrl}
                alt={selectedImage.filename}
                className="rounded-lg object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
