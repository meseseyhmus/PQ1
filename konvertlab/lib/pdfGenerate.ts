import { jsPDF } from "jspdf";
import type { TextToPdfOptions } from "@/types";

/**
 * TURKISH CHARACTER SUPPORT — design decision:
 *
 * jsPDF's built-in standard fonts (helvetica/times) are WinAnsi (Latin-1)
 * encoded and cannot render ğ, ş, ı, İ, Ğ, Ş correctly. Instead of
 * transliterating (lossy) or fetching/embedding a third-party TTF (extra
 * runtime dependency), we render the text through jsPDF's `doc.html()`
 * method: the browser's own Unicode-capable font stack (Helvetica/Arial)
 * rasterizes the content via the html2canvas instance bundled with jspdf,
 * so every Turkish glyph is guaranteed to look exactly like on screen.
 * Only ASCII metadata (page numbers, watermark) is drawn with `doc.text()`
 * using the built-in helvetica font, which is ASCII-safe.
 */

const PAGE_W = 210; // A4 mm
const PAGE_H = 297; // A4 mm
const MM_TO_PX = 96 / 25.4;
const PT_TO_PX = 96 / 72;

export interface PdfRenderOptions {
  margin: number;
  pageNumbers?: boolean;
  watermark?: boolean;
  /** CSS font stack used for the rendered body */
  fontSizePx?: number;
  lineHeight?: number;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function nlToBr(text: string): string {
  return escapeHtml(text).replace(/\n/g, "<br/>");
}

async function renderHtmlToPdf(
  html: string,
  options: PdfRenderOptions
): Promise<jsPDF> {
  const margin = options.margin;
  const contentWidthPx = Math.floor((PAGE_W - 2 * margin) * MM_TO_PX);

  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });

  // Offscreen container rendered by the browser (full Unicode support).
  const container = document.createElement("div");
  container.setAttribute("aria-hidden", "true");
  container.style.position = "fixed";
  container.style.left = "-10000px";
  container.style.top = "0";
  container.style.width = `${contentWidthPx}px`;
  container.style.background = "#ffffff";
  container.style.color = "#111827";
  container.style.fontFamily = "Helvetica, Arial, sans-serif";
  container.style.fontSize = `${options.fontSizePx ?? 12}px`;
  container.style.lineHeight = String(options.lineHeight ?? 1.6);
  container.innerHTML = html;
  document.body.appendChild(container);

  try {
    // jsPDF 2.x html() returns a Promise and also supports a callback;
    // resolve on whichever fires first.
    await new Promise<void>((resolve, reject) => {
      let settled = false;
      const done = () => {
        if (!settled) {
          settled = true;
          resolve();
        }
      };
      try {
        const result = doc.html(container, {
          callback: done,
          x: margin,
          y: margin,
          width: PAGE_W - 2 * margin,
          windowWidth: contentWidthPx,
          autoPaging: "text",
          html2canvas: { scale: 2, backgroundColor: "#ffffff" },
        });
        if (result && typeof (result as Promise<void>).then === "function") {
          (result as Promise<void>).then(done).catch(reject);
        }
      } catch (err) {
        reject(err instanceof Error ? err : new Error(String(err)));
      }
    });
  } finally {
    container.remove();
  }

  const pageCount = doc.getNumberOfPages();

  if (options.watermark) {
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(52);
      doc.setTextColor(235, 235, 235);
      doc.text("KonvertLab", PAGE_W / 2, PAGE_H / 2, {
        align: "center",
        angle: 45,
      });
    }
  }

  if (options.pageNumbers) {
    doc.setTextColor(120, 120, 120);
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(`${i} / ${pageCount}`, PAGE_W / 2, PAGE_H - 8, {
        align: "center",
      });
    }
  }

  doc.setTextColor(0, 0, 0);
  return doc;
}

/** TXT / Markdown -> PDF with Turkish character support. */
export async function textToPdf(
  text: string,
  options: TextToPdfOptions
): Promise<jsPDF> {
  const fontPx = Math.round(options.fontSize * PT_TO_PX);
  const parts: string[] = [];

  if (options.title && options.title.trim()) {
    parts.push(
      `<h1 style="font-size:${fontPx * 1.6}px; font-weight:700; margin:0 0 24px 0; line-height:1.3; text-align:center;">${escapeHtml(
        options.title.trim()
      )}</h1>`
    );
  }

  parts.push(
    `<div style="text-align:${options.align}; white-space:normal; word-wrap:break-word;">${nlToBr(
      text
    )}</div>`
  );

  return renderHtmlToPdf(parts.join(""), {
    margin: options.margin,
    pageNumbers: options.pageNumbers,
    watermark: options.watermark,
    fontSizePx: fontPx,
  });
}

function titlePageHtml(title: string, subtitle: string, contentHeightPx: number): string {
  return `
    <div style="height:${contentHeightPx}px; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center;">
      <div style="font-size:34px; font-weight:700; line-height:1.3; margin-bottom:18px;">${escapeHtml(title)}</div>
      <div style="font-size:15px; color:#4b5563;">${escapeHtml(subtitle)}</div>
      <div style="font-size:12px; color:#9ca3af; margin-top:36px;">KonvertLab ile oluşturuldu</div>
    </div>`;
}

/** Cleaned subtitle text -> e-book style PDF (title page + chapter paragraphs). */
export async function srtToPdf(
  cleanedText: string,
  title: string,
  options: { margin: number; pageNumbers?: boolean; watermark?: boolean }
): Promise<jsPDF> {
  const margin = options.margin;
  const contentHeightPx = Math.floor((PAGE_H - 2 * margin) * MM_TO_PX);
  const paragraphs = cleanedText
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  // Group paragraphs into chapters of ~12 paragraphs.
  const chapters: string[][] = [];
  for (let i = 0; i < paragraphs.length; i += 12) {
    chapters.push(paragraphs.slice(i, i + 12));
  }

  const date = new Date().toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const html =
    titlePageHtml(title || "E-Kitap", date, contentHeightPx) +
    chapters
      .map(
        (chapter, index) =>
          `<h2 style="font-size:20px; font-weight:700; margin:28px 0 16px 0;">Bölüm ${index + 1}</h2>` +
          chapter
            .map(
              (p) =>
                `<p style="margin:0 0 14px 0; text-align:justify;">${escapeHtml(p)}</p>`
            )
            .join("")
      )
      .join("");

  return renderHtmlToPdf(html, {
    margin,
    pageNumbers: options.pageNumbers,
    watermark: options.watermark,
    fontSizePx: 12,
    lineHeight: 1.7,
  });
}

/** Cleaned subtitle text -> presentation-style bullet-point PDF. */
export async function summaryToPdf(
  bullets: string[],
  title: string,
  options: { margin: number; pageNumbers?: boolean; watermark?: boolean }
): Promise<jsPDF> {
  const margin = options.margin;
  const date = new Date().toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const html =
    `<h1 style="font-size:26px; font-weight:700; margin:0 0 6px 0; line-height:1.3;">${escapeHtml(
      title || "Sunum Özeti"
    )}</h1>` +
    `<div style="font-size:12px; color:#6b7280; margin-bottom:26px;">${escapeHtml(date)} — KonvertLab</div>` +
    `<ul style="list-style:none; margin:0; padding:0;">` +
    bullets
      .map(
        (bullet) =>
          `<li style="margin:0 0 14px 0; padding-left:18px; border-left:4px solid #06b6d4; font-size:14px; line-height:1.6;">${escapeHtml(
            bullet
          )}</li>`
      )
      .join("") +
    `</ul>`;

  return renderHtmlToPdf(html, {
    margin,
    pageNumbers: options.pageNumbers,
    watermark: options.watermark,
    fontSizePx: 14,
    lineHeight: 1.6,
  });
}

export function savePdf(doc: jsPDF, filename: string): void {
  doc.save(filename);
}
