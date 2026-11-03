/**
 * terneon/tests/neonCanvas.test.mjs
 *
 * NeonCanvas, DPR ölçekleme ve Retro WhatsApp Fiyat Terminali Testleri.
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, expect, run } from "./harness.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const CANVAS_PATH = resolve(HERE, "../components/NeonCanvas.tsx");
const CANVAS_BG_PATH = resolve(HERE, "../components/NeonCanvasBackground.tsx");
const PRICE_CALC_PATH = resolve(HERE, "../components/PriceCalculator.tsx");
const HERO_PATH = resolve(HERE, "../components/Hero.tsx");

const canvasSource = readFileSync(CANVAS_PATH, "utf8");
const priceCalcSource = readFileSync(PRICE_CALC_PATH, "utf8");
const heroSource = readFileSync(HERO_PATH, "utf8");

describe("NeonCanvas — Yüksek DPR (Retina/4K) Ölçekleme ve Performans", () => {
  it("NeonCanvas.tsx dosyası mevcuttur", () => {
    expect(existsSync(CANVAS_PATH)).toBeTruthy();
  });

  it("NeonCanvas hem adlandırılmış hem varsayılan dışa aktarım sağlar", () => {
    expect(canvasSource).toContain("export function NeonCanvas");
    expect(canvasSource).toContain("export default NeonCanvas");
    expect(canvasSource).toContain("export const NeonCanvasBackground = NeonCanvas");
  });

  it("Geriye dönük uyumluluk için NeonCanvasBackground.tsx NeonCanvas'ı yeniden ihraç eder", () => {
    expect(existsSync(CANVAS_BG_PATH)).toBeTruthy();
    const bgSource = readFileSync(CANVAS_BG_PATH, "utf8");
    expect(bgSource).toContain("export { NeonCanvas, NeonCanvasBackground, default } from './NeonCanvas'");
  });

  it("DPR ölçeklemesinde devicePixelRatio okunur ve 2.5 tavanı ile sınırlandırılır", () => {
    expect(canvasSource).toContain("window.devicePixelRatio");
    expect(canvasSource).toContain("Math.min(");
    expect(canvasSource).toContain("2.5");
  });

  it("Canvas genişlik ve yüksekliği DPR ile çarpılarak keskin piksel tamponu oluşturulur", () => {
    expect(canvasSource).toContain("canvas.width = Math.floor(width * dpr)");
    expect(canvasSource).toContain("canvas.height = Math.floor(height * dpr)");
  });

  it("CSS çizim koordinatları ctx.setTransform(dpr, 0, 0, dpr, 0, 0) ile ölçeklenir", () => {
    expect(canvasSource).toContain("ctx.setTransform(dpr, 0, 0, dpr, 0, 0)");
  });

  it("ResizeObserver ve matchMedia ile çözünürlük değişiklikleri dinlenir", () => {
    expect(canvasSource).toContain("ResizeObserver");
    expect(canvasSource).toContain("matchMedia");
  });

  it("Animasyon döngüsü unmount anında cancelAnimationFrame ile temizlenir", () => {
    expect(canvasSource).toContain("cancelAnimationFrame(animationFrameId)");
  });
});

describe("PriceCalculator — Retro-Fütüristik Typewriter Terminal & WhatsApp CTA", () => {
  it("PriceCalculator gerçek zamanlı typewriter terminal durumunu barındırır", () => {
    expect(priceCalcSource).toContain("displayedTerminalText");
    expect(priceCalcSource).toContain("isTyping");
  });

  it("Typewriter çıktısında TERNEON-PRICING-KERNEL başlığı ve log formatı yer alır", () => {
    expect(priceCalcSource).toContain("TERNEON-PRICING-KERNEL");
    expect(priceCalcSource).toContain("UTF-8 URL-ENCODED");
  });

  it("Terminal paneli CRT fosfor yeşili / siber tema ile biçimlendirilmiştir", () => {
    expect(priceCalcSource).toContain("text-emerald-300");
    expect(priceCalcSource).toContain("font-mono");
    expect(priceCalcSource).toContain("STREAM: LIVE");
  });

  it("WhatsApp 1-tık doğrudan teklif butonu wa.me linki ile entegredir", () => {
    expect(priceCalcSource).toContain("whatsAppHref");
    expect(priceCalcSource).toContain("openWhatsAppQuote");
    expect(priceCalcSource).toContain("WhatsApp Teklifi Oluştur & Gönder");
  });

  it("Kullanıcıya ücretsiz demo ve güven garantisi bildirilir", () => {
    expect(priceCalcSource).toContain("Önce ücretsiz demo incelenir, ödeme onay sonrasıdır");
  });
});

describe("Hero — Eraslan Software Editoryal Tipografi ve Çift Mockup Vitrini", () => {
  it("Editoryal başlık 'İşletmenize özel. Her ayrıntısıyla.' mevcuttur", () => {
    expect(heroSource).toContain("İşletmenize özel.");
    expect(heroSource).toContain("Her ayrıntısıyla.");
  });

  it("Konum etiketi 'Tasarım ve yazılım stüdyosu, İstanbul' yer alır", () => {
    expect(heroSource).toContain("Tasarım ve yazılım stüdyosu, İstanbul");
  });

  it("CTA butonları 'Projeleri incele ↓' ve 'Fiyat hesapla ↗' mevcuttur", () => {
    expect(heroSource).toContain("Projeleri incele ↓");
    expect(heroSource).toContain("Fiyat hesapla ↗");
  });

  it("Güven rozetleri (Size özel tasarım, Önce ücretsiz demo, Doğrudan iletişim) yer alır", () => {
    expect(heroSource).toContain("Size özel tasarım");
    expect(heroSource).toContain("Önce ücretsiz demo");
    expect(heroSource).toContain("Doğrudan iletişim");
  });

  it("Sağ tarafta masaüstü Safari çerçevesi ve üst üste binen iPhone çerçevesi mevcuttur", () => {
    expect(heroSource).toContain("Safari Traffic Lights");
    expect(heroSource).toContain("https://");
    expect(heroSource).toContain("Dynamic Island");
  });

  it("Vitrinde Saklı Cave House ve 6 sektör projesi arasında < 01 / 06 > sayfalama yer alır", () => {
    expect(heroSource).toContain("Saklı Cave House");
    expect(heroSource).toContain("SHOWCASE_PROJECTS");
    expect(heroSource).toContain("ChevronLeft");
    expect(heroSource).toContain("ChevronRight");
  });
});

run();
