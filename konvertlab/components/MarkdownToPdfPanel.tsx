"use client";

import { useState } from "react";
import { Download, FileCode, Loader2, Sparkles } from "lucide-react";
import DropZone from "@/components/DropZone";
import ProgressBar from "@/components/ProgressBar";
import { textToPdf, savePdf } from "@/lib/pdfGenerate";

export default function MarkdownToPdfPanel() {
  const [content, setContent] = useState(
    "# Başlık\n\nBu **Markdown** belgesi doğrudan tarayıcınızda PDF'e dönüştürülür.\n\n- Madde 1: Hızlı ve güvenli\n- Madde 2: Sunucuya veri gönderilmez\n- Madde 3: Türkçe karakter desteği (ç, ğ, ı, ö, ş, ü)\n\n> Önemli Not: Belgenizi dilediğiniz gibi özelleştirebilirsiniz."
  );
  const [title, setTitle] = useState("Belge");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const [rawFiles, setRawFiles] = useState<File[]>([]);

  const handleFiles = (files: File[]) => {
    setRawFiles(files);
    const file = files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setContent(reader.result);
        setTitle(file.name.replace(/\.(md|markdown|txt)$/i, ""));
      }
    };
    reader.readAsText(file, "utf-8");
  };

  const handleConvert = async () => {
    if (!content.trim() || loading) return;
    setLoading(true);
    setProgress(30);

    try {
      setProgress(60);
      const doc = await textToPdf(content, {
        fontSize: 11,
        margin: 15,
        align: "left",
        title: title || "Belge",
        pageNumbers: true,
        watermark: false,
      });

      setProgress(90);
      savePdf(doc, `${title.trim() || "markdown"}.pdf`);
      setProgress(100);
    } catch {
      alert("PDF oluşturulurken bir hata oluştu.");
    } finally {
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 500);
    }
  };

  return (
    <div className="space-y-6">
      <DropZone
        accept=".md,.markdown,.txt"
        files={rawFiles}
        onFiles={handleFiles}
        onRemove={() => setRawFiles([])}
        label="Markdown (.md) veya metin dosyanızı buraya bırakın"
        hint="veya dosya seçmek için tıklayın"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Editor */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300">
              Markdown İçeriği
            </label>
            <span className="text-[11px] text-slate-500">
              {content.length} karakter
            </span>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3.5 font-mono text-xs text-slate-200 placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
            placeholder="# Başlık girin..."
          />
        </div>

        {/* Live Preview */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300">
              Canlı Önizleme
            </label>
            <span className="text-[11px] text-cyan-400">PDF Taslağı</span>
          </div>
          <div className="h-[285px] overflow-y-auto rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-xs text-slate-300">
            <h1 className="text-lg font-bold text-white mb-2">{title}</h1>
            <div className="whitespace-pre-wrap font-sans leading-relaxed">
              {content}
            </div>
          </div>
        </div>
      </div>

      {loading && <ProgressBar value={progress} label="PDF Derleniyor..." />}

      <div className="flex justify-end">
        <button
          onClick={handleConvert}
          disabled={loading || !content.trim()}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Markdown&apos;u PDF Olarak İndir
        </button>
      </div>
    </div>
  );
}
