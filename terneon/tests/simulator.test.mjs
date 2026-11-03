/**
 * terneon/tests/simulator.test.mjs
 *
 * İnteraktif Cihaz Simülatörü ve 6 Sektör Şablonu Testleri.
 * DemoShowcase ve DemoSectorMocks bileşenlerinin sözleşme ve veri yapısını doğrular.
 */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, expect, run } from "./harness.mjs";
import { SECTOR_DEFINITIONS } from "../config/sectors.ts";

const HERE = dirname(fileURLToPath(import.meta.url));
const DEMO_SHOWCASE_PATH = resolve(HERE, "../components/DemoShowcase.tsx");
const showcaseSource = readFileSync(DEMO_SHOWCASE_PATH, "utf8");

describe("İnteraktif Simülatör — 6 Sektör Tanımları", () => {
  it("tam olarak 6 adet sektör şablonu tanımlıdır", () => {
    expect(SECTOR_DEFINITIONS.length).toBe(6);
  });

  it("sektör numaraları 1'den 6'ya kadar sıralı ve benzersizdir", () => {
    const nums = SECTOR_DEFINITIONS.map((s) => s.number);
    expect(nums).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("sektör id'leri benzersizdir", () => {
    const ids = SECTOR_DEFINITIONS.map((s) => s.id);
    expect(new Set(ids).size).toBe(6);
  });

  it("Sektör 1: Cyberpunk SaaS Dashboard", () => {
    const s1 = SECTOR_DEFINITIONS.find((s) => s.number === 1);
    expect(s1).toBeTruthy();
    expect(s1.name).toContain("SaaS Dashboard");
    expect(s1.id).toBe("cyberpunk-saas");
  });

  it("Sektör 2: Web3 / Crypto Portfolio", () => {
    const s2 = SECTOR_DEFINITIONS.find((s) => s.number === 2);
    expect(s2).toBeTruthy();
    expect(s2.name).toContain("Web3 / Crypto");
    expect(s2.id).toBe("web3-crypto");
  });

  it("Sektör 3: Neon E-Commerce Shop", () => {
    const s3 = SECTOR_DEFINITIONS.find((s) => s.number === 3);
    expect(s3).toBeTruthy();
    expect(s3.name).toContain("Neon E-Commerce");
    expect(s3.id).toBe("neon-ecommerce");
  });

  it("Sektör 4: AI Creative Agency", () => {
    const s4 = SECTOR_DEFINITIONS.find((s) => s.number === 4);
    expect(s4).toBeTruthy();
    expect(s4.name).toContain("AI Creative Agency");
    expect(s4.id).toBe("ai-agency");
  });

  it("Sektör 5: Fintech Terminal", () => {
    const s5 = SECTOR_DEFINITIONS.find((s) => s.number === 5);
    expect(s5).toBeTruthy();
    expect(s5.name).toContain("Fintech Terminal");
    expect(s5.id).toBe("fintech-terminal");
  });

  it("Sektör 6: Luxury Brand Concept", () => {
    const s6 = SECTOR_DEFINITIONS.find((s) => s.number === 6);
    expect(s6).toBeTruthy();
    expect(s6.name).toContain("Luxury Brand");
    expect(s6.id).toBe("luxury-concept");
  });

  it("her sektörün renk kodu, rozet metni ve açıklaması doludur", () => {
    for (const s of SECTOR_DEFINITIONS) {
      expect(s.accentColor.startsWith("#")).toBeTruthy();
      expect(s.badge.length > 0).toBeTruthy();
      expect(s.description.length > 0).toBeTruthy();
    }
  });
});

describe("İnteraktif Simülatör — Cihaz Çerçevesi ve Görünüm Modları", () => {
  it("DemoShowcase hem 'desktop' hem 'mobile' görünüm modunu destekler", () => {
    expect(showcaseSource).toContain("'desktop'");
    expect(showcaseSource).toContain("'mobile'");
  });

  it("Mobil görünümde 375x667 boyutunda cihaz çerçevesi kullanılır", () => {
    expect(showcaseSource).toContain("w-[375px]");
    expect(showcaseSource).toContain("h-[667px]");
  });

  it("Simülatör içinde 6 sektör arasında geçiş sağlayan buton çubuğu mevcuttur", () => {
    expect(showcaseSource).toContain("SECTOR_DEFINITIONS.map");
    expect(showcaseSource).toContain("setActiveSectorId");
  });

  it("6 sektörün interaktif bileşenlerinin tümü simülatörde render edilir", () => {
    expect(showcaseSource).toContain("CyberpunkSaaSTemplate");
    expect(showcaseSource).toContain("Web3CryptoTemplate");
    expect(showcaseSource).toContain("NeonECommerceTemplate");
    expect(showcaseSource).toContain("AiAgencyTemplate");
    expect(showcaseSource).toContain("FintechTerminalTemplate");
    expect(showcaseSource).toContain("LuxuryBrandTemplate");
  });
});

run();
