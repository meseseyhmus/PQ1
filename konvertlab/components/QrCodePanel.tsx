"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  QrCode,
  Download,
  Copy,
  Check,
  Sparkles,
  Sliders,
  Globe,
  Wifi,
  User,
  Share2,
} from "lucide-react";
import QRCode from "qrcode";
import { downloadBlob } from "@/lib/downloadHelper";

type QrPreset = "url" | "wifi" | "vcard" | "text";

export default function QrCodePanel() {
  const [text, setText] = useState("https://konvertlab.com");
  const [preset, setPreset] = useState<QrPreset>("url");
  const [size, setSize] = useState(320);
  const [darkColor, setDarkColor] = useState("#000000");
  const [lightColor, setLightColor] = useState("#ffffff");
  const [errorCorrection, setErrorCorrection] = useState<"L" | "M" | "Q" | "H">("M");
  const [margin, setMargin] = useState(2);
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const generateQr = useCallback(async () => {
    if (!text.trim()) return;
    try {
      if (canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, text, {
          width: size,
          margin,
          color: {
            dark: darkColor,
            light: lightColor,
          },
          errorCorrectionLevel: errorCorrection,
        });

        const url = canvasRef.current.toDataURL("image/png");
        setQrDataUrl(url);
      }
    } catch (err) {
      console.error("QR Code generation error:", err);
    }
  }, [text, size, margin, darkColor, lightColor, errorCorrection]);

  useEffect(() => {
    void generateQr();
  }, [generateQr]);

  const handleDownloadPng = () => {
    if (!canvasRef.current) return;
    canvasRef.current.toBlob((blob) => {
      if (blob) {
        downloadBlob(blob, "konvertlab_qr_kod.png");
      }
    }, "image/png");
  };

  const handleDownloadSvg = async () => {
    try {
      const svgString = await QRCode.toString(text, {
        type: "svg",
        margin,
        color: {
          dark: darkColor,
          light: lightColor,
        },
        errorCorrectionLevel: errorCorrection,
      });
      const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      downloadBlob(blob, "konvertlab_qr_kod.svg");
    } catch (err) {
      console.error("SVG generation failed:", err);
    }
  };

  const handleCopy = async () => {
    if (!canvasRef.current) return;
    try {
      canvasRef.current.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob }),
          ]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          // fallback copy text
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      });
    } catch {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePresetChange = (p: QrPreset) => {
    setPreset(p);
    if (p === "url") {
      setText("https://konvertlab.com/araclar");
    } else if (p === "wifi") {
      setText("WIFI:T:WPA;S:KonvertLab_Ofis;P:GuvenliSifre2026;;");
    } else if (p === "vcard") {
      setText(
        "BEGIN:VCARD\nVERSION:3.0\nN:Yılmaz;Ahmet;;;\nFN:Ahmet Yılmaz\nORG:KonvertLab Teknoloji\nTITLE:Yazılım Mimarı\nTEL:+905551234567\nEMAIL:ahmet@konvertlab.com\nURL:https://konvertlab.com\nEND:VCARD"
      );
    } else {
      setText("KonvertLab İstemci Taraflı Güvenli Dosya ve Doküman Dönüştürücü");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Preset Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <QrCode className="h-5 w-5 text-cyan-400" />
            Hızlı QR Kod Üretici &amp; Özelleştirici
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            URL, metin, Wi-Fi ve vCard bilgilerinizi yüksek çözünürlüklü vektör QR koda dönüştürün.
          </p>
        </div>

        <div className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/80 p-1">
          <button
            type="button"
            onClick={() => handlePresetChange("url")}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
              preset === "url"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Globe className="h-3.5 w-3.5" />
            URL
          </button>
          <button
            type="button"
            onClick={() => handlePresetChange("wifi")}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
              preset === "wifi"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Wifi className="h-3.5 w-3.5" />
            Wi-Fi
          </button>
          <button
            type="button"
            onClick={() => handlePresetChange("vcard")}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
              preset === "vcard"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <User className="h-3.5 w-3.5" />
            vCard
          </button>
        </div>
      </div>

      {/* Try with sample button */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          data-testid="sample-file-qr"
          onClick={() => handlePresetChange("vcard")}
          className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-indigo-500/10 px-4 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400 transition-all shadow-sm active:scale-95"
        >
          <Sparkles className="h-4 w-4 text-cyan-400 shrink-0" />
          <span>Örnek Veri ile Dene</span>
          <span className="rounded-full bg-cyan-400/20 px-2 py-0.5 text-[10px] font-bold text-cyan-200">
            Kurumsal vCard &amp; Wi-Fi (1-Tık)
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left column: Controls */}
        <div className="lg:col-span-7 space-y-4">
          <div>
            <label htmlFor="qr-text-input" className="mb-1.5 block text-xs font-semibold text-slate-300">
              QR Kod İçeriği (URL, Metin veya Veri)
            </label>
            <textarea
              id="qr-text-input"
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="QR kodun yönlendireceği URL veya metni buraya yazın…"
              className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 font-mono text-xs text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 shadow-inner"
            />
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-4">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <Sliders className="h-3.5 w-3.5 text-cyan-400" />
              Görsel Özelleştirme Ayarları
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">
                  QR Kod Rengi
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={darkColor}
                    onChange={(e) => setDarkColor(e.target.value)}
                    className="h-8 w-12 rounded cursor-pointer border border-slate-700 bg-transparent p-0.5"
                  />
                  <input
                    type="text"
                    value={darkColor}
                    onChange={(e) => setDarkColor(e.target.value)}
                    className="w-24 rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">
                  Arka Plan Rengi
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={lightColor}
                    onChange={(e) => setLightColor(e.target.value)}
                    className="h-8 w-12 rounded cursor-pointer border border-slate-700 bg-transparent p-0.5"
                  />
                  <input
                    type="text"
                    value={lightColor}
                    onChange={(e) => setLightColor(e.target.value)}
                    className="w-24 rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-300"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Çözünürlük</span>
                  <span className="text-cyan-400 font-semibold">{size} × {size} px</span>
                </div>
                <input
                  type="range"
                  min="160"
                  max="640"
                  step="32"
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-cyan-500"
                />
              </div>

              <div>
                <label htmlFor="qr-error-correction" className="text-[11px] font-medium text-slate-400 block mb-1">
                  Hata Düzeltme Seviyesi
                </label>
                <select
                  id="qr-error-correction"
                  value={errorCorrection}
                  onChange={(e) => setErrorCorrection(e.target.value as "L" | "M" | "Q" | "H")}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                >
                  <option value="L">Düşük (L - %7 tolerans)</option>
                  <option value="M">Orta (M - %15 tolerans, Önerilen)</option>
                  <option value="Q">Yüksek (Q - %25 tolerans)</option>
                  <option value="H">En Yüksek (H - %30 tolerans, Logo için)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Interactive Preview & Instant Actions */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-950 p-6 text-center space-y-4 shadow-xl">
          <div className="relative p-4 rounded-xl bg-white/5 border border-slate-800 flex items-center justify-center shadow-inner">
            <canvas
              ref={canvasRef}
              className="max-w-full h-auto rounded-lg shadow-md"
            />
          </div>

          <div className="text-xs text-slate-400 space-y-0.5">
            <p className="font-semibold text-slate-200">Canlı QR Kod Önizleme</p>
            <p className="text-[11px] text-slate-500">{size} × {size} px • Seviye {errorCorrection}</p>
          </div>

          <div className="w-full flex flex-wrap gap-2 justify-center pt-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition-colors active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span className="text-emerald-300">Kopyalandı</span>
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
              onClick={handleDownloadPng}
              className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-1.5 rounded-xl bg-cyan-500 px-3.5 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-colors active:scale-95 shadow-md shadow-cyan-500/20"
            >
              <Download className="h-4 w-4" />
              <span>PNG İndir</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadSvg}
              className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-3.5 py-2.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 transition-colors active:scale-95"
            >
              <Download className="h-4 w-4" />
              <span>SVG (Vektör)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
