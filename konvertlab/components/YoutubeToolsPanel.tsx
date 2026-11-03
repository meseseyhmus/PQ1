"use client";

import { useState } from "react";
import { BookOpen, Presentation, Sparkles, Loader2 } from "lucide-react";
import DropZone from "@/components/DropZone";
import ProgressBar from "@/components/ProgressBar";
import { srtToPdf, summaryToPdf, savePdf } from "@/lib/pdfGenerate";
import { parseSubtitles, subtitleStats, toBulletPoints } from "@/lib/srtParse";
import { formatDuration } from "@/lib/format";

type ExportMode = "ebook" | "summary";

function readingDuration(minutes: number): string {
  return formatDuration(minutes * 60);
}

export default function YoutubeToolsPanel() {
  const [raw, setRaw] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [cleaned, setCleaned] = useState("");
  const [title, setTitle] = useState("");
  const [stats, setStats] = useState<{ cueCount: number; wordCount: number; readingMinutes: number } | null>(null);
  const [exporting, setExporting] = useState<ExportMode | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = (incoming: File[]) => {
    const file = incoming[0];
    if (!file) return;
    setFiles(incoming);
    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setRaw(reader.result);
        if (!title) setTitle(file.name.replace(/\.(srt|vtt|txt)$/i, ""));
      }
    };
    reader.onerror = () => setError("Dosya okunamadı. Lütfen tekrar deneyin.");
    reader.readAsText(file, "utf-8");
  };

  const clean = () => {
    if (!raw.trim()) return;
    try {
      const result = parseSubtitles(raw);
      if (!result) {
        setError("Metinden temizlenecek içerik çıkarılamadı. Girdiyi kontrol edin.");
        return;
      }
      setCleaned(result);
      setStats(subtitleStats(raw, result));
      setError(null);
    } catch {
      setError("Metin temizlenirken bir hata oluştu.");
    }
  };

  const exportPdf = async (mode: ExportMode) => {
    if (!cleaned.trim() || exporting) return;
    setExporting(mode);
    setError(null);
    setProgress(15);
    try {
      const doc =
        mode === "ebook"
          ? await srtToPdf(cleaned, title.trim(), {
              margin: 20,
              pageNumbers: true,
            })
          : await summaryToPdf(toBulletPoints(cleaned), title.trim(), {
              margin: 20,
              pageNumbers: true,
            });
      setProgress(85);
      await new Promise((r) => setTimeout(r, 150));
      savePdf(doc, `${(title.trim() || "konvertlab").replace(/[\\/:*?"<>|]/g, "_")}-${mode === "ebook" ? "ekitap" : "ozet"}.pdf`);
      setProgress(100);
    } catch (err) {
      setError(
        err instanceof Error ? `PDF oluşturulamadı: ${err.message}` : "PDF oluşturulamadı."
      );
    } finally {
      setExporting(null);
      setTimeout(() => setProgress(0), 1200);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400";

  return (
    <div className="space-y-5">
      <DropZone
        accept=".srt,.vtt,.txt"
        files={files}
        onFiles={handleFiles}
        onRemove={() => {
          setFiles([]);
          setRaw("");
        }}
        label="YouTube altyazı (.srt/.vtt) veya metin dosyanızı sürükleyin"
        hint="veya dosya seçin — içerik aşağıdaki alana yüklenir"
      />

      <div>
        <label htmlFor="yt-raw" className="mb-1.5 block text-xs font-medium text-slate-400">
          Altyazı / senaryo metni (yapıştırın veya dosya yükleyin)
        </label>
        <textarea
          id="yt-raw"
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          rows={8}
          placeholder={"1\n00:00:01,000 --> 00:00:04,000\nMerhaba, bu videoda…\n\n2\n00:00:04,000 --> 00:00:07,500\n…konuşulan her şeyi yazıya dönüştüreceğiz."}
          className={`${inputClass} resize-y font-mono text-xs leading-relaxed`}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="yt-title" className="mb-1.5 block text-xs font-medium text-slate-400">
            Eser başlığı
          </label>
          <input
            id="yt-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Örn: Kanal Adı — Video Başlığı"
            className={inputClass}
          />
        </div>
        <div className="flex items-end">
          <button
            type="button"
            onClick={clean}
            disabled={!raw.trim()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-500/60 bg-cyan-500/10 px-5 py-2.5 text-sm font-semibold text-cyan-300 transition-colors hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Metni Temizle
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      {stats && cleaned && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Kelime", value: stats.wordCount.toLocaleString("tr-TR") },
            { label: "Okuma Süresi", value: readingDuration(stats.readingMinutes) },
            { label: "Alt Yazı Bloğu", value: stats.cueCount.toLocaleString("tr-TR") },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2.5 text-center"
            >
              <p className="text-lg font-bold text-cyan-300">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {cleaned && (
        <>
          <div>
            <label htmlFor="yt-clean" className="mb-1.5 block text-xs font-medium text-slate-400">
              Temiz Metin (düzenleyebilirsiniz)
            </label>
            <textarea
              id="yt-clean"
              value={cleaned}
              onChange={(e) => setCleaned(e.target.value)}
              rows={10}
              className={`${inputClass} resize-y text-sm leading-relaxed`}
            />
          </div>

          {(exporting || progress > 0) && (
            <ProgressBar value={progress} label="PDF hazırlanıyor…" />
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => exportPdf("ebook")}
              disabled={exporting !== null}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-semibold text-slate-950 transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              {exporting === "ebook" ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <BookOpen className="h-4 w-4" aria-hidden="true" />
              )}
              PDF E-kitap indir
            </button>
            <button
              type="button"
              onClick={() => exportPdf("summary")}
              disabled={exporting !== null}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-700 px-5 py-3 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              {exporting === "summary" ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Presentation className="h-4 w-4" aria-hidden="true" />
              )}
              Sunum Özeti indir
            </button>
          </div>
        </>
      )}
    </div>
  );
}
