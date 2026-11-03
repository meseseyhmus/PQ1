"use client";

import { useState } from "react";
import { Download, Image as ImageIcon, Loader2, Trash2 } from "lucide-react";
import DropZone from "@/components/DropZone";
import ProgressBar from "@/components/ProgressBar";
import { jsPDF } from "jspdf";

interface ImageItem {
  id: string;
  name: string;
  dataUrl: string;
  width: number;
  height: number;
}

export default function ImageToPdfPanel() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const [rawFiles, setRawFiles] = useState<File[]>([]);

  const handleFiles = (files: File[]) => {
    setRawFiles(files);
    for (const f of files) {
      if (!f.type.startsWith("image/")) continue;
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          setImages((prev) => [
            ...prev,
            {
              id: Math.random().toString(36).slice(2, 9),
              name: f.name,
              dataUrl,
              width: img.width,
              height: img.height,
            },
          ]);
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(f);
    }
  };

  const removeImage = (id: string, index?: number) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
    if (typeof index === "number") {
      setRawFiles((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const convertToPdf = () => {
    if (images.length === 0 || loading) return;
    setLoading(true);
    setProgress(20);

    setTimeout(() => {
      try {
        const doc = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
        });

        images.forEach((img, idx) => {
          if (idx > 0) doc.addPage();
          setProgress(20 + Math.round(((idx + 1) / images.length) * 70));

          // Calculate fit into A4 (210 x 297 mm, 15 mm margins)
          const pageW = 210 - 30;
          const pageH = 297 - 30;
          const ratio = img.width / img.height;
          let drawW = pageW;
          let drawH = drawW / ratio;

          if (drawH > pageH) {
            drawH = pageH;
            drawW = drawH * ratio;
          }

          const x = 15 + (pageW - drawW) / 2;
          const y = 15 + (pageH - drawH) / 2;

          doc.addImage(img.dataUrl, "JPEG", x, y, drawW, drawH);
        });

        doc.save("konvertlab_gorseller.pdf");
        setProgress(100);
      } catch {
        alert("Görseller PDF'e dönüştürülürken bir hata oluştu.");
      } finally {
        setTimeout(() => {
          setLoading(false);
          setProgress(0);
        }, 500);
      }
    }, 100);
  };

  return (
    <div className="space-y-6">
      <DropZone
        accept="image/*"
        multiple
        files={rawFiles}
        onFiles={handleFiles}
        onRemove={(i) => {
          if (images[i]) removeImage(images[i].id, i);
        }}
        label="Görsellerinizi buraya sürükleyin"
        hint="JPG, PNG, WebP desteklenir (Çoklu seçim yapabilirsiniz)"
      />

      {images.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">
              Yüklenen Görseller ({images.length})
            </span>
            <button
              onClick={() => setImages([])}
              className="text-xs text-rose-400 hover:underline"
            >
              Tümünü Temizle
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {images.map((img) => (
              <div
                key={img.id}
                className="group relative overflow-hidden rounded-xl border border-slate-800 bg-slate-950 p-2 text-center"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.dataUrl}
                  alt={img.name}
                  className="aspect-square w-full rounded-lg object-cover"
                />
                <span className="mt-1 block truncate text-[11px] text-slate-400">
                  {img.name}
                </span>
                <button
                  onClick={() => removeImage(img.id)}
                  className="absolute right-3 top-3 rounded-md bg-rose-600/80 p-1 text-white opacity-0 transition group-hover:opacity-100"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading && <ProgressBar value={progress} label="Görseller PDF'e Birleştiriliyor..." />}

      <div className="flex justify-end">
        <button
          onClick={convertToPdf}
          disabled={loading || images.length === 0}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          {images.length} Görseli Tek PDF Olarak İndir
        </button>
      </div>
    </div>
  );
}
