"use client";

import { useState } from "react";
import {
  FileText,
  FileSpreadsheet,
  FileSearch,
  Youtube,
  FileCode,
  Image as ImageIcon,
  Layers,
  Sparkles,
  ScanText,
  FileEdit,
  QrCode,
} from "lucide-react";
import TxtToPdfPanel from "@/components/TxtToPdfPanel";
import PdfToTxtPanel from "@/components/PdfToTxtPanel";
import PdfToDocxPanel from "@/components/PdfToDocxPanel";
import PdfToExcelPanel from "@/components/PdfToExcelPanel";
import PdfToImagesPanel from "@/components/PdfToImagesPanel";
import ImageToWebpPanel from "@/components/ImageToWebpPanel";
import ImageToPdfPanel from "@/components/ImageToPdfPanel";
import OcrPanel from "@/components/OcrPanel";
import YoutubeToolsPanel from "@/components/YoutubeToolsPanel";
import MarkdownToPdfPanel from "@/components/MarkdownToPdfPanel";
import BatchConvertPanel from "@/components/BatchConvertPanel";
import QrCodePanel from "@/components/QrCodePanel";
import { cn } from "@/lib/cn";
import type { TabId } from "@/types";

interface TabItem {
  id: TabId;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

const TABS: TabItem[] = [
  { id: "pdf2docx", label: "PDF → Word", icon: FileEdit, badge: "Yeni" },
  { id: "pdf2excel", label: "PDF → Excel", icon: FileSpreadsheet, badge: "Yeni" },
  { id: "pdf2img", label: "PDF → Görsel", icon: ImageIcon, badge: "HD" },
  { id: "img2webp", label: "Görsel → WebP", icon: Sparkles, badge: "%80 Tasarruf" },
  { id: "ocr", label: "İstemci OCR", icon: ScanText, badge: "AI" },
  { id: "batch", label: "Toplu ZIP (Pro)", icon: Layers, badge: "ZIP" },
  { id: "qrcode", label: "Hızlı QR Kod", icon: QrCode, badge: "Nashi" },
  { id: "pdf2txt", label: "PDF → TXT", icon: FileSearch },
  { id: "img2pdf", label: "Görsel → PDF", icon: ImageIcon },
  { id: "txt2pdf", label: "TXT → PDF", icon: FileText },
  { id: "md2pdf", label: "MD → PDF", icon: FileCode },
  { id: "youtube", label: "YouTube Altyazı", icon: Youtube },
];

export default function ConverterTabs() {
  const [active, setActive] = useState<TabId>("pdf2docx");

  return (
    <section aria-label="Dönüştürücü araçları">
      <div
        role="tablist"
        aria-label="Dönüştürme araçları"
        className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
      >
        {TABS.map(({ id, label, icon: Icon, badge }) => (
          <button
            key={id}
            role="tab"
            type="button"
            id={`tab-${id}`}
            aria-selected={active === id}
            aria-controls={`panel-${id}`}
            onClick={() => setActive(id)}
            className={cn(
              "relative flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-xs font-semibold transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400",
              active === id
                ? "border-cyan-500 bg-cyan-500/15 text-cyan-300 shadow-md shadow-cyan-500/10"
                : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200"
            )}
          >
            {badge && (
              <span className="absolute -top-1.5 right-1.5 rounded-full bg-cyan-500/20 px-1.5 py-0.2 text-[9px] font-bold text-cyan-300 border border-cyan-500/40">
                {badge}
              </span>
            )}
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{label}</span>
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`panel-${active}`}
        aria-labelledby={`tab-${active}`}
        className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 sm:p-6 shadow-xl shadow-black/40"
      >
        {active === "pdf2docx" && <PdfToDocxPanel />}
        {active === "pdf2excel" && <PdfToExcelPanel />}
        {active === "pdf2img" && <PdfToImagesPanel />}
        {active === "img2webp" && <ImageToWebpPanel />}
        {active === "ocr" && <OcrPanel />}
        {active === "batch" && <BatchConvertPanel />}
        {active === "qrcode" && <QrCodePanel />}
        {active === "pdf2txt" && <PdfToTxtPanel />}
        {active === "img2pdf" && <ImageToPdfPanel />}
        {active === "txt2pdf" && <TxtToPdfPanel />}
        {active === "md2pdf" && <MarkdownToPdfPanel />}
        {active === "youtube" && <YoutubeToolsPanel />}
      </div>
    </section>
  );
}
