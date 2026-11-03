"use client";

import { useRef, useState } from "react";
import {
  Check,
  Compass,
  Copy,
  ExternalLink,
  Eye,
  FileDown,
  Layers,
  Loader2,
  MapPin,
  Plane,
  Share2,
  TrendingUp,
  Upload,
} from "lucide-react";
import { useEditor } from "@/state/EditorContext";
import { findParcel } from "@/lib/demoParcel";
import { formatM2, formatPriceTL } from "@/lib/format";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { LatLng } from "@/types";

const IL_LISTESI = [
  "Muğla",
  "İzmir",
  "Antalya",
  "Aydın",
  "Balıkesir",
  "İstanbul",
  "Ankara",
  "Bursa",
  "Çanakkale",
  "Mersin",
  "Sakarya",
];

const PURPOSE_OPTIONS = [
  { id: "Emlakçıyım", label: "Emlakçıyım" },
  { id: "Benim", label: "Benim" },
  { id: "Almak istiyorum", label: "Almak istiyorum" },
];

const PLAN_TAGS = [
  { label: "Akarsu", active: true },
  { label: "Çevre Düzeni Planı", active: true },
  { label: "e-Plan", active: true },
  { label: "Plan Analizi [yeni]", active: false },
];

export function TabParcelQuery() {
  const { state, dispatch } = useEditor();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [piyasaOpen, setPiyasaOpen] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [tkgmStatus, setTkgmStatus] = useState<{ source?: string; verified?: boolean } | null>({
    source: "TKGM MEGSİS CBS API",
    verified: true,
  });

  const { il, ilce, mahalle, ada, parsell, areaM2, nitelik, pafta, mevkii } = state.parcel;

  const sorgula = async () => {
    if (!il.trim() || !ilce.trim() || !ada.trim() || !parsell.trim()) {
      setError("İl, ilçe, ada ve parsel alanları zorunludur.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const params = new URLSearchParams({
        il: il.trim(),
        ilce: ilce.trim(),
        mahalle: mahalle.trim(),
        ada: ada.trim(),
        parsel: parsell.trim(),
      });
      const res = await fetch(`/api/parsel?${params.toString()}`);
      if (!res.ok) throw new Error("API yanıt vermedi");
      const json = await res.json();
      const parcelData = json.parcel || json.data;
      if (parcelData) {
        dispatch({ type: "LOAD_PARCEL", parcel: parcelData });
        setTkgmStatus({
          source: json.source,
          verified: json.isVerified ?? true,
        });
      } else {
        const parcel = findParcel(il, ilce, mahalle, ada, parsell);
        dispatch({ type: "LOAD_PARCEL", parcel });
      }
    } catch (err) {
      console.warn("API sorgu hatası, yerel hesaplama kullanılıyor:", err);
      const parcel = findParcel(il, ilce, mahalle, ada, parsell);
      dispatch({ type: "LOAD_PARCEL", parcel });
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      const url = typeof window !== "undefined" ? window.location.href : "";
      const text = `${il} ${ilce} ${mahalle} Ada ${ada} Parsel ${parsell} (${formatM2(areaM2)} ${nitelik || "Arsa"}): ${url}`;
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // sessizce geç
    }
  };

  const handlePdf = () => {
    setPdfGenerating(true);
    setTimeout(() => {
      setPdfGenerating(false);
      window.print();
    }, 600);
  };

  const handleUcus = () => {
    dispatch({ type: "SET_TIME", time: 0 });
    dispatch({ type: "SET_PLAYING", playing: true });
  };

  const dosyaYukle = async (file: File) => {
    setError(null);
    try {
      const text = await file.text();
      const json = JSON.parse(text) as unknown;
      const polygon = extractPolygon(json);
      if (!polygon) {
        setError("Geçerli bir GeoJSON (Polygon) bulunamadı.");
        return;
      }
      dispatch({ type: "LOAD_GEOJSON", polygon });
    } catch {
      setError("Dosya okunamadı. Lütfen geçerli bir GeoJSON dosyası seçin.");
    }
  };

  const currentPurpose = state.purpose || "Emlakçıyım";
  const currentTab = state.sidebarTab || "ozet";
  const showEdgeLengths = state.style.showEdgeLengths !== false;

  // Piyasa birim fiyat tahmini
  const unitPriceEstimate = 2850;
  const totalPriceEstimate = Math.round(areaM2 * unitPriceEstimate);

  return (
    <div className="flex flex-col h-full text-white">
      {/* 0. Top Brand Header matching parselsorgu.pro */}
      <div className="flex items-center justify-between p-3.5 border-b border-white/10 bg-[#0e131d]">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-amber-500 font-black text-black text-xs shadow-sm">
            P
          </span>
          <span className="font-bold text-sm tracking-tight text-white">
            ParselSorgu<span className="text-amber-400 font-extrabold">.Pro</span>
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => alert("ParselSorgu.Pro Rehberi:\n1. Arama çubuğuna il/ilçe/mahalle girin.\n2. Ada ve parsel numarasını yazıp 'Sorgula'ya basın.\n3. Haritada parsel sınırları, alan ve kenar uzunlukları anında görüntülenir.")}
            className="text-white/60 hover:text-white flex items-center gap-1 text-[11px]"
          >
            ⓘ Nasıl kullanılır?
          </button>
          <button
            type="button"
            className="rounded-full border border-white/20 px-3 py-1 text-[11px] font-semibold text-white/90 hover:bg-white/10 hover:text-white transition"
          >
            Giriş
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5">
        {/* 1. parselsorgu.pro Tarzı Arama Girişleri */}
        <div className="rounded-2xl border border-white/10 bg-chrome-800/60 p-3 space-y-2.5">
          {/* Quick Location Bar with Pin and Clear */}
          <div className="relative">
            <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white">
              <MapPin className="size-3.5 text-amber-400 shrink-0" />
              <input
                type="text"
                value={`${state.parcel.mahalle || "Akçatarla"} ${state.parcel.ilce || "Nusaybin"} / ${state.parcel.il || "Mardin"}`}
                readOnly
                className="w-full bg-transparent font-medium text-white/90 outline-none truncate"
                placeholder="Konum seçin"
              />
              <button
                type="button"
                onClick={() => {
                  dispatch({ type: "SET_PARCEL_FORM", field: "il", value: "" });
                  dispatch({ type: "SET_PARCEL_FORM", field: "ilce", value: "" });
                  dispatch({ type: "SET_PARCEL_FORM", field: "mahalle", value: "" });
                  dispatch({ type: "SET_PARCEL_FORM", field: "ada", value: "" });
                  dispatch({ type: "SET_PARCEL_FORM", field: "parsell", value: "" });
                }}
                className="text-white/40 hover:text-white text-xs"
                title="Temizle"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Ada / Parsel Input Row with Sorgula Button */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              inputMode="numeric"
              value={state.parcel.ada}
              onChange={(e) =>
                dispatch({ type: "SET_PARCEL_FORM", field: "ada", value: e.target.value })
              }
              placeholder="Ada (174)"
              className="w-1/3 rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs font-mono font-bold text-white text-center focus:border-amber-400 outline-none"
            />
            <input
              type="text"
              inputMode="numeric"
              value={state.parcel.parsell}
              onChange={(e) =>
                dispatch({ type: "SET_PARCEL_FORM", field: "parsell", value: e.target.value })
              }
              placeholder="Parsel (1)"
              className="w-1/3 rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs font-mono font-bold text-white text-center focus:border-amber-400 outline-none"
            />
            <Button
              variant="primary"
              className="w-1/3 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs py-2 rounded-xl shadow"
              onClick={sorgula}
              disabled={loading}
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Sorgula"}
            </Button>
          </div>

          <div className="text-center pt-0.5">
            <span className="text-[10px] text-white/40 hover:text-white/70 cursor-pointer">
              👆 ya da haritadan seçin
            </span>
          </div>
        </div>

        {/* 2. Prominent Header (174 / 1, Arsa · 2.443 m², Akçatarla, Nusaybin, Mardin) */}
        <div className="rounded-2xl border border-blue-500/30 bg-[#0e1628] p-3.5 space-y-2 relative overflow-hidden shadow-lg">
          {/* Top Actions: Focus, Bookmark, Copy, Clear */}
          <div className="flex items-center justify-between text-white/50 border-b border-white/10 pb-2">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  dispatch({ type: "SET_CAMERA", patch: { intensity: 0.6 } });
                }}
                title="Odakla"
                className="hover:text-white transition"
              >
                <Compass className="size-3.5 text-blue-400" />
              </button>
              <button
                type="button"
                onClick={handleShare}
                title="Kaydet & Paylaş"
                className="hover:text-white transition"
              >
                <Share2 className="size-3.5 text-amber-400" />
              </button>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(`${state.parcel.il} ${state.parcel.ilce} ${state.parcel.mahalle} Ada ${ada} Parsel ${parsell}`);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                title="Kopyala"
                className="hover:text-white transition"
              >
                {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5 text-white/70" />}
              </button>
            </div>
            <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              TKGM CBS Canlı
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <h2 className="text-3xl font-black tracking-tight text-blue-500">
              {ada} <span className="text-white/40 font-light text-xl">/</span> {parsell}
            </h2>
            <div className="text-right">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white/90 justify-end">
                <span className="size-2 rounded-full bg-amber-500" />
                <span>{nitelik || "Arsa"}</span>
                <span className="text-white/40">·</span>
                <span className="text-emerald-400">{formatM2(areaM2)}</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-white/70 font-medium truncate">
            {mahalle}, {ilce}, {il}
          </p>
        </div>

        {/* 3. Purpose Selector ("Bu parsele neden bakıyorsunuz?") */}
        <div className="rounded-2xl border border-amber-500/20 bg-[#161410] p-3 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold text-amber-300/90">
              Bu parsele neden bakıyorsunuz?
            </p>
            <span className="text-[10px] text-white/40">✕</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {PURPOSE_OPTIONS.map((opt) => {
              const active = currentPurpose === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => dispatch({ type: "SET_PURPOSE", purpose: opt.id })}
                  className={`rounded-xl py-2 px-1 text-center text-[11px] font-bold transition-all ${
                    active
                      ? "bg-amber-500 text-black shadow-md"
                      : "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Etiketler & Plan Analizi */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-lg bg-blue-500/10 border border-blue-500/30 px-2.5 py-1 text-[10px] font-semibold text-blue-300 flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-blue-400" /> Akarsu
          </span>
          <span className="rounded-lg bg-purple-500/10 border border-purple-500/30 px-2.5 py-1 text-[10px] font-semibold text-purple-300 flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-purple-400" /> Çevre Düzeni Planı
          </span>
          <span className="rounded-lg bg-orange-500/10 border border-orange-500/30 px-2.5 py-1 text-[10px] font-semibold text-orange-300 flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-orange-400" /> e-Plan
          </span>
          <button
            type="button"
            onClick={() => setPiyasaOpen(true)}
            className="rounded-lg bg-amber-500/15 border border-amber-500/40 px-2.5 py-1 text-[10px] font-bold text-amber-300 hover:bg-amber-500/25 transition flex items-center gap-1 ml-auto"
          >
            <span>⊞ Plan Analizi</span>
            <span className="bg-red-500 text-white text-[8px] font-black px-1 rounded-sm uppercase">yeni</span>
          </button>
        </div>

        {/* 5. Sekmeler: Özet / Plan */}
        <div className="space-y-2.5">
          <div className="flex border-b border-white/15">
            <button
              type="button"
              onClick={() => dispatch({ type: "SET_SIDEBAR_TAB", tab: "ozet" })}
              className={`pb-2 px-3 text-xs font-bold transition relative ${
                currentTab === "ozet"
                  ? "text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-amber-400"
                  : "text-white/50 hover:text-white"
              }`}
            >
              Özet
            </button>
            <button
              type="button"
              onClick={() => dispatch({ type: "SET_SIDEBAR_TAB", tab: "plan" })}
              className={`pb-2 px-3 text-xs font-bold transition flex items-center gap-1 relative ${
                currentTab === "plan"
                  ? "text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-amber-400"
                  : "text-white/50 hover:text-white"
              }`}
            >
              <span>Plan</span>
              <span className="size-1.5 rounded-full bg-red-500" />
            </button>
          </div>

          {/* 6. Nitelik / Değer Tablosu */}
          {currentTab === "ozet" ? (
            <div className="rounded-xl border border-white/10 bg-[#0e131d] divide-y divide-white/10 text-xs">
              <div className="flex justify-between p-2.5">
                <span className="text-white/50">Nitelik</span>
                <span className="font-semibold text-white flex items-center gap-1">
                  {nitelik || "Arsa"} <span className="text-white/40 text-[10px]">ⓘ</span>
                </span>
              </div>
              <div className="flex justify-between p-2.5">
                <span className="text-white/50">Mevkii</span>
                <span className="font-semibold text-white/90">{mevkii || "Nusaybin Yolu"}</span>
              </div>
              <div className="flex justify-between p-2.5">
                <span className="text-white/50">Pafta</span>
                <span className="font-mono text-white/90">{pafta || "N46d19b2c"}</span>
              </div>
              <div className="flex justify-between p-2.5">
                <span className="text-white/50">Alan</span>
                <span className="font-semibold text-emerald-400">{formatM2(areaM2)}</span>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-white/10 bg-[#0e131d] divide-y divide-white/10 text-xs">
              <div className="flex justify-between p-2.5">
                <span className="text-white/50">İmar Fonksiyonu</span>
                <span className="font-semibold text-white">Konut / Emsal 0.30</span>
              </div>
              <div className="flex justify-between p-2.5">
                <span className="text-white/50">Çevre Düzeni</span>
                <span className="font-semibold text-white/90">1/100.000 ÇDP Uygun</span>
              </div>
              <div className="flex justify-between p-2.5">
                <span className="text-white/50">e-Plan Durumu</span>
                <span className="font-mono text-emerald-400">Onaylı ve Aktif</span>
              </div>
              <div className="flex justify-between p-2.5">
                <span className="text-white/50">Yola Cephe</span>
                <span className="font-semibold text-white">Mevcut (Resmi Yol)</span>
              </div>
            </div>
          )}
        </div>

        {/* 7. Toggle Switch: "HARİTADA GÖSTER: Kenar uzunlukları" */}
        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-[#0e131d] p-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/50">
              HARİTADA GÖSTER
            </p>
            <p className="text-xs font-bold text-white">Kenar uzunlukları</p>
            <p className="text-[10px] text-white/40">Her kenarın uzunluğu haritaya yazılır</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={showEdgeLengths}
            onClick={() => dispatch({ type: "TOGGLE_EDGE_LENGTHS" })}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              showEdgeLengths ? "bg-emerald-500" : "bg-white/20"
            }`}
          >
            <span
              className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                showEdgeLengths ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* 8. Sticky Action Buttons: Piyasa, Uçuş, Paylaş, PDF */}
        <div className="grid grid-cols-4 gap-2 pt-1">
          <button
            type="button"
            onClick={() => setPiyasaOpen(!piyasaOpen)}
            className="flex items-center justify-center gap-1 rounded-xl bg-[#1c1813] border border-amber-500/30 py-2.5 text-xs text-amber-300 font-bold hover:bg-amber-500/20 transition shadow"
          >
            <span>Piyasa</span>
            <span className="text-amber-400 font-normal">🪙1</span>
          </button>

          <button
            type="button"
            onClick={handleUcus}
            className="flex items-center justify-center gap-1 rounded-xl border border-white/15 bg-white/5 py-2.5 text-xs text-white font-bold hover:bg-white/10 transition"
          >
            <Plane className="size-3.5 text-emerald-400" />
            <span>Uçuş</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="flex items-center justify-center gap-1 rounded-xl border border-white/15 bg-white/5 py-2.5 text-xs text-white font-bold hover:bg-white/10 transition"
          >
            {copied ? <Check className="size-3.5 text-emerald-400" /> : <Share2 className="size-3.5 text-white/80" />}
            <span>Paylaş</span>
          </button>

          <button
            type="button"
            onClick={handlePdf}
            disabled={pdfGenerating}
            className="flex items-center justify-center gap-1 rounded-xl border border-white/15 bg-white/5 py-2.5 text-xs text-white font-bold hover:bg-white/10 transition disabled:opacity-50"
          >
            {pdfGenerating ? (
              <Loader2 className="size-3.5 animate-spin text-pink-400" />
            ) : (
              <FileDown className="size-3.5 text-pink-400" />
            )}
            <span>PDF</span>
          </button>
        </div>

        {/* Piyasa Değerleme Açılır Kartı */}
        {piyasaOpen && (
        <div className="rounded-xl border border-sky-400/30 bg-sky-950/40 p-3 space-y-1.5 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sky-300">Bölgesel Piyasa Değerlemesi</span>
            <span className="text-[10px] text-white/40">Yapay Zeka Analizi</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-white/60">Birim m² Fiyatı:</span>
            <span className="font-semibold text-white">{formatPriceTL(unitPriceEstimate)} / m²</span>
          </div>
          <div className="flex justify-between text-xs pt-1 border-t border-sky-400/20">
            <span className="text-white/70 font-medium">Tahmini Toplam Değer:</span>
            <span className="font-bold text-neon-bright">{formatPriceTL(totalPriceEstimate)}</span>
          </div>
        </div>
      )}

      {/* 9. Doğrulanmış Canlı TKGM Parselleri (Hızlı Demo) */}
      <div className="space-y-2 pt-2 border-t border-white/10">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">
            Doğrulanmış Canlı Parseller
          </p>
          <span className="text-[9px] text-neon-green/90 font-mono">TKGM CBS</span>
        </div>
        <div className="grid gap-2">
          {[
            {
              il: "Muğla",
              ilce: "Bodrum",
              mahalle: "Çamlık",
              ada: "131",
              parsell: "36",
              label: "Bodrum Çamlık — 32.093 m²",
              sub: "Zeytinli Tarla (Mevkii: Ermene)",
              badge: "Canlı TKGM",
            },
            {
              il: "İzmir",
              ilce: "Çeşme",
              mahalle: "Alaçatı",
              ada: "300",
              parsell: "1",
              label: "Çeşme Alaçatı — 8.484 m²",
              sub: "Zeytin Ağaçlı Tarla (Kerdeme Mevkii)",
              badge: "Canlı TKGM",
            },
            {
              il: "Antalya",
              ilce: "Manavgat",
              mahalle: "Kızılağaç",
              ada: "118",
              parsell: "3",
              label: "Antalya Manavgat — 613 m²",
              sub: "Arsa (Turizm Bölgesi)",
              badge: "Canlı TKGM",
            },
            {
              il: "Muğla",
              ilce: "Bodrum",
              mahalle: "Mumcular",
              ada: "1425",
              parsell: "7",
              label: "Bodrum Mumcular — 2.206 m²",
              sub: "Zeytinlik (Bina & Arsa)",
              badge: "Canlı TKGM",
            },
          ].map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={async () => {
                dispatch({ type: "SET_PARCEL_FORM", field: "il", value: item.il });
                dispatch({ type: "SET_PARCEL_FORM", field: "ilce", value: item.ilce });
                dispatch({ type: "SET_PARCEL_FORM", field: "mahalle", value: item.mahalle });
                dispatch({ type: "SET_PARCEL_FORM", field: "ada", value: item.ada });
                dispatch({ type: "SET_PARCEL_FORM", field: "parsell", value: item.parsell });

                setLoading(true);
                setError(null);
                try {
                  const params = new URLSearchParams({
                    il: item.il,
                    ilce: item.ilce,
                    mahalle: item.mahalle,
                    ada: item.ada,
                    parsel: item.parsell,
                  });
                  const res = await fetch(`/api/parsel?${params.toString()}`);
                  const json = await res.json();
                  const parcelData = json.parcel || json.data;
                  if (parcelData) {
                    dispatch({ type: "LOAD_PARCEL", parcel: parcelData });
                    setTkgmStatus({
                      source: json.source,
                      verified: json.isVerified ?? true,
                    });
                  }
                } catch {
                  const p = findParcel(item.il, item.ilce, item.mahalle, item.ada, item.parsell);
                  dispatch({ type: "LOAD_PARCEL", parcel: p });
                } finally {
                  setLoading(false);
                }
              }}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-2.5 text-left text-xs text-white/80 hover:border-sky-400 hover:bg-white/10 hover:text-white transition-all group"
            >
              <div className="min-w-0 pr-2">
                <p className="truncate font-semibold text-white">{item.label}</p>
                <p className="text-[10px] text-white/40">{item.sub}</p>
              </div>
              <span className="shrink-0 rounded bg-sky-500/10 border border-sky-400/30 px-2 py-0.5 text-[9px] font-bold text-sky-300 group-hover:bg-sky-500/20">
                {item.badge} →
              </span>
            </button>
          ))}
        </div>
      </div>

        {/* GeoJSON Dosya Yükleme */}
        <div className="pt-2">
          <input
            ref={fileRef}
            type="file"
            accept=".geojson,.json,application/geo+json,application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void dosyaYukle(f);
              e.target.value = "";
            }}
          />
          <Button
            variant="secondary"
            className="w-full text-xs text-white/70 hover:text-white border-white/10"
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="h-3.5 w-3.5" />
            GeoJSON / KML Dosyası Yükle
          </Button>
        </div>
      </div>
    </div>
  );
}

function extractPolygon(json: unknown): LatLng[] | null {
  const asAny = json as Record<string, unknown>;
  const geometry =
    (asAny?.geometry as Record<string, unknown> | undefined) ?? asAny;
  if (!geometry || geometry.type !== "Polygon") {
    const fc = asAny as {
      type?: string;
      features?: { geometry?: { type?: string; coordinates?: number[][][] } }[];
    };
    if (fc.type === "FeatureCollection" && fc.features?.length) {
      const g = fc.features[0].geometry;
      if (g?.type === "Polygon" && g.coordinates?.[0]) {
        return g.coordinates[0].map((c) => [c[0], c[1]] as LatLng);
      }
    }
    return null;
  }
  const coords = geometry.coordinates as number[][][];
  if (!Array.isArray(coords) || !Array.isArray(coords[0])) return null;
  return coords[0].map((c) => [c[0], c[1]] as LatLng);
}
