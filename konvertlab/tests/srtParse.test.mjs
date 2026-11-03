/**
 * konvertlab/lib/srtParse.ts birim testleri.
 * Çalıştırma: node --import ./tests/register.mjs tests/srtParse.test.mjs
 */
import { describe, it, expect, run } from "./harness.mjs";
import {
  parseSubtitles,
  subtitleStats,
  toBulletPoints,
} from "../lib/srtParse.ts";

describe("parseSubtitles — SRT ayrıştırma", () => {
  it("tek bloklu SRT metni düz metne çevirir", () => {
    const srt = "1\n00:00:01,000 --> 00:00:03,000\nMerhaba dünya.";
    expect(parseSubtitles(srt)).toBe("Merhaba dünya.");
  });

  it("çok bloklu SRT'de sıra numaralarını ve zaman damgalarını atar", () => {
    const srt = [
      "1",
      "00:00:01,000 --> 00:00:02,000",
      "Birinci satır.",
      "",
      "2",
      "00:00:02,000 --> 00:00:04,000",
      "İkinci satır.",
    ].join("\n");
    const out = parseSubtitles(srt);
    expect(out).toContain("Birinci satır.");
    expect(out).toContain("İkinci satır.");
    expect(out.includes("-->")).toBeFalsy();
    expect(out.includes("00:00")).toBeFalsy();
  });

  it("tek cue içindeki çoklu altyazı satırlarını boşlukla birleştirir", () => {
    const srt = "1\n00:00:01,000 --> 00:00:04,000\nBu bir\nçok satırlı\naltyazıdır.";
    expect(parseSubtitles(srt)).toBe("Bu bir çok satırlı altyazıdır.");
  });

  it("CRLF satır sonlarını doğru işler", () => {
    const srt = "1\r\n00:00:01,000 --> 00:00:02,000\r\nSatır bir.\r\n\r\n2\r\n00:00:02,000 --> 00:00:03,000\r\nSatır iki.";
    const out = parseSubtitles(srt);
    expect(out).toContain("Satır bir.");
    expect(out).toContain("Satır iki.");
    expect(out.includes("\r")).toBeFalsy();
  });

  it("BOM karakterini temizler", () => {
    const srt = "﻿1\n00:00:01,000 --> 00:00:02,000\nBOM'lu metin.";
    expect(parseSubtitles(srt)).toBe("BOM'lu metin.");
  });
});

describe("parseSubtitles — WebVTT ve etiketler", () => {
  it("WEBVTT başlık ve NOTE bloklarını tamamen atar", () => {
    const vtt = [
      "WEBVTT",
      "",
      "NOTE Bu bir not.",
      "",
      "1",
      "00:00:01.000 --> 00:00:02.000",
      "Gerçek içerik.",
    ].join("\n");
    const out = parseSubtitles(vtt);
    expect(out).toBe("Gerçek içerik.");
    expect(out.includes("WEBVTT")).toBeFalsy();
    expect(out.includes("not")).toBeFalsy();
  });

  it("satır içi etiketleri (<i>, <b> vb.) kaldırır", () => {
    const srt = "1\n00:00:01,000 --> 00:00:02,000\n<i>Vurgulu</i> ve <b>kalın</b> metin.";
    expect(parseSubtitles(srt)).toBe("Vurgulu ve kalın metin.");
  });

  it("ASS süslü etiketlerini ({\\...}) kaldırır", () => {
    const srt = '1\n00:00:01,000 --> 00:00:02,000\n{\\an8}Konumlu metin.';
    expect(parseSubtitles(srt)).toBe("Konumlu metin.");
  });

  it("'>>' konuşmacı önekini kaldırır", () => {
    const srt = "1\n00:00:01,000 --> 00:00:02,000\n>> SPEAKER: Merhaba.";
    // SPEAKER: büyük harf blok etiketi olduğu için kaldırılır
    expect(parseSubtitles(srt)).toBe("Merhaba.");
  });
});

describe("parseSubtitles — tekrar ve paragraflama", () => {
  it("birbirinin aynısı olan ardışık cue'ları tekilleştirir", () => {
    const srt = [
      "1",
      "00:00:01,000 --> 00:00:02,000",
      "Tekrarlanan cümle.",
      "",
      "2",
      "00:00:02,000 --> 00:00:03,000",
      "Tekrarlanan cümle.",
    ].join("\n");
    expect(parseSubtitles(srt)).toBe("Tekrarlanan cümle.");
  });

  it("önceki cue'un sonunu tekrar eden cue'ları atar (örtüşen satırlar)", () => {
    const srt = [
      "1",
      "00:00:01,000 --> 00:00:02,000",
      "Uzun cümle burada.",
      "",
      "2",
      "00:00:02,000 --> 00:00:03,000",
      "burada.",
    ].join("\n");
    expect(parseSubtitles(srt)).toBe("Uzun cümle burada.");
  });

  it("önceki cue'un tamamını içeren (onunla biten) cue gelirse öncekiyle değiştirir", () => {
    const srt = [
      "1",
      "00:00:01,000 --> 00:00:02,000",
      "cümle bu.",
      "",
      "2",
      "00:00:02,000 --> 00:00:03,000",
      "Tam cümle bu.",
    ].join("\n");
    expect(parseSubtitles(srt)).toBe("Tam cümle bu.");
  });

  it("cümleleri üçerli paragraflara böler", () => {
    const srt = [
      "1",
      "00:00:01,000 --> 00:00:02,000",
      "Bir. İki. Üç.",
      "",
      "2",
      "00:00:02,000 --> 00:00:03,000",
      "Dört. Beş. Altı.",
    ].join("\n");
    const out = parseSubtitles(srt);
    const paragraphs = out.split("\n\n");
    expect(paragraphs).toHaveLength(2);
    expect(paragraphs[0]).toBe("Bir. İki. Üç.");
    expect(paragraphs[1]).toBe("Dört. Beş. Altı.");
  });

  it("boş veyalnızca zaman damgası içeren girdide boş dizgi döner", () => {
    expect(parseSubtitles("")).toBe("");
    expect(parseSubtitles("1\n00:00:01,000 --> 00:00:02,000\n\n2\n00:00:03,000 --> 00:00:04,000")).toBe("");
  });

  it("düz transkript metnini (altyazı olmayan) olduğu gibi paragraflar", () => {
    const out = parseSubtitles("Bu düz bir transkript. İkinci cümle.");
    expect(out).toBe("Bu düz bir transkript. İkinci cümle.");
  });

  it("çoklu boşlukları tekilleştirir", () => {
    const srt = "1\n00:00:01,000 --> 00:00:02,000\nÇok    boşluklu    metin.";
    expect(parseSubtitles(srt)).toBe("Çok boşluklu metin.");
  });
});

describe("subtitleStats — istatistikler", () => {
  it("cue sayısını, kelime sayısını ve okuma süresini döndürür", () => {
    const raw = [
      "1",
      "00:00:01,000 --> 00:00:02,000",
      "Bir iki üç",
      "",
      "2",
      "00:00:02,000 --> 00:00:03,000",
      "dört beş",
    ].join("\n");
    const stats = subtitleStats(raw, "Bir iki üç dört beş");
    expect(stats.cueCount).toBe(2);
    expect(stats.wordCount).toBe(5);
    expect(stats.readingMinutes).toBe(1);
  });

  it("okuma süresi en az 1 dakikadır", () => {
    const stats = subtitleStats("", "az kelime");
    expect(stats.readingMinutes).toBe(1);
  });

  it("250 kelime ~ 1 dakika, 450 kelime ~ 2 dakika okuma verir", () => {
    expect(subtitleStats("", "kelime ".repeat(250).trim()).readingMinutes).toBe(1);
    expect(subtitleStats("", "kelime ".repeat(450).trim()).readingMinutes).toBe(2);
  });
});

describe("toBulletPoints — maddeleme", () => {
  it("her paragraftan ilk iki cümleyi madde olarak alır", () => {
    const cleaned = "Bir. İki. Üç.\n\nDört. Beş. Altı.";
    const bullets = toBulletPoints(cleaned);
    expect(bullets).toHaveLength(2);
    // Cümle ayırıcıları arasında boşluk kalabilir; anlam kontrolü için normalize ediyoruz.
    expect(bullets[0].replace(/\s+/g, " ").trim()).toBe("Bir. İki.");
    expect(bullets[1].replace(/\s+/g, " ").trim()).toBe("Dört. Beş.");
  });

  it("nokta içermeyen paragrafı tek madde olarak döndürür", () => {
    const bullets = toBulletPoints("Noktalama yok");
    expect(bullets).toHaveLength(1);
    expect(bullets[0]).toBe("Noktalama yok");
  });

  it("maxBullets sınırına uyar", () => {
    const cleaned = Array.from({ length: 10 }, (_, i) => `Madde ${i + 1}.`).join("\n\n");
    expect(toBulletPoints(cleaned, 3)).toHaveLength(3);
  });

  it("boş girdide boş dizi döner", () => {
    expect(toBulletPoints("")).toHaveLength(0);
  });
});

run();
