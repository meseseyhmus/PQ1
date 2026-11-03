import type { PageText } from "@/types";

/**
 * pdfjs-dist worker setup for Next.js 15 / webpack 5:
 * `new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url)` lets
 * webpack bundle the worker file as an asset and gives us a stable URL
 * at runtime. The module itself is imported dynamically so it only loads
 * in the browser (client components), never during SSR/prerender.
 */

let pdfjsPromise: Promise<typeof import("pdfjs-dist")> | null = null;

export async function loadPdfjs(): Promise<typeof import("pdfjs-dist")> {
  if (!pdfjsPromise) {
    pdfjsPromise = import("pdfjs-dist").then((pdfjs) => {
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url
      ).toString();
      return pdfjs;
    });
  }
  return pdfjsPromise;
}


export class PdfExtractError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PdfExtractError";
  }
}

/**
 * Extracts text from a PDF file page by page, entirely in the browser.
 * `onProgress` receives a 0-100 value as pages are processed.
 */
export async function extractText(
  file: File,
  onProgress?: (percent: number) => void
): Promise<PageText[]> {
  const pdfjs = await loadPdfjs();
  const data = new Uint8Array(await file.arrayBuffer());

  let pdf: Awaited<ReturnType<typeof pdfjs.getDocument>["promise"]>;
  try {
    pdf = await pdfjs.getDocument({
      data,
      isEvalSupported: false,
      useSystemFonts: true,
    }).promise;
  } catch (err) {
    const name = (err as { name?: string })?.name ?? "";
    if (name === "PasswordException") {
      throw new PdfExtractError(
        "Bu PDF dosyası şifreli/korumalı. Lütfen şifresi kaldırılmış bir kopya yükleyin."
      );
    }
    if (name === "InvalidPDFException") {
      throw new PdfExtractError(
        "Bu dosya geçerli bir PDF değil gibi görünüyor. Dosyayı kontrol edip tekrar deneyin."
      );
    }
    throw new PdfExtractError(
      "PDF açılırken beklenmeyen bir hata oluştu. Lütfen tekrar deneyin."
    );
  }

  const pages: PageText[] = [];
  let foundText = false;

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    let text = "";
    for (const item of content.items as Array<{ str?: string }>) {
      if (typeof item.str === "string") {
        text += item.str;
        // getTextContent items do not include line breaks; approximate them
        // with hasEOL when available.
        if ("hasEOL" in item && (item as { hasEOL?: boolean }).hasEOL) {
          text += "\n";
        }
      }
    }
    const cleaned = text.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
    if (cleaned) foundText = true;
    pages.push({ page: pageNumber, text: cleaned });
    page.cleanup();
    onProgress?.(Math.round((pageNumber / pdf.numPages) * 100));
  }

  if (!foundText) {
    throw new PdfExtractError(
      "Bu PDF'de seçilebilir metin bulunamadı. Dosya taranmış veya yalnızca görsel içerebilir (OCR desteklenmez)."
    );
  }

  return pages;
}

export interface RawTextItem {
  str: string;
  transform?: number[];
  width?: number;
  height?: number;
}

/**
 * Clusters PDF text items by vertical position (Y) and then separates into columns by horizontal gap (X).
 * Suitable for converting PDF tables to structured 2D arrays (e.g. for Excel).
 */
export function clusterItemsIntoTableRows(items: RawTextItem[], yTolerance = 4, colGapThreshold = 14): string[][] {
  const lineGroups: Array<{ y: number; items: Array<{ str: string; x: number; width: number }> }> = [];

  for (const item of items) {
    if (!item.str || item.str.trim() === "") continue;
    const x = item.transform ? item.transform[4] : 0;
    const y = item.transform ? item.transform[5] : 0;
    const width = item.width || (item.str.length * 6);

    let targetGroup = lineGroups.find((g) => Math.abs(g.y - y) <= yTolerance);
    if (!targetGroup) {
      targetGroup = { y, items: [] };
      lineGroups.push(targetGroup);
    }
    targetGroup.items.push({ str: item.str, x, width });
  }

  // Sort lines top-to-bottom (PDF Y increases upwards, so higher Y is higher on page)
  lineGroups.sort((a, b) => b.y - a.y);

  const rows: string[][] = [];
  for (const group of lineGroups) {
    group.items.sort((a, b) => a.x - b.x);

    // Merge adjacent text items that belong to the same cell/word
    const cells: string[] = [];
    let currentCell = "";
    let lastRight = -9999;

    for (const piece of group.items) {
      if (lastRight === -9999) {
        currentCell = piece.str;
        lastRight = piece.x + piece.width;
      } else {
        const gap = piece.x - lastRight;
        if (gap > colGapThreshold) {
          // New column
          if (currentCell.trim()) cells.push(currentCell.trim());
          currentCell = piece.str;
        } else {
          // Same cell, append with space if needed
          const needsSpace = !currentCell.endsWith(" ") && !piece.str.startsWith(" ") && gap > 2;
          currentCell += (needsSpace ? " " : "") + piece.str;
        }
        lastRight = Math.max(lastRight, piece.x + piece.width);
      }
    }
    if (currentCell.trim()) cells.push(currentCell.trim());
    if (cells.length > 0) rows.push(cells);
  }

  return rows;
}

/**
 * Splits plain text lines into cells by tab, multi-space (>= 2), or common table delimiters (| ; ,).
 */
export function parseDelimitedTextToRows(text: string): string[][] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  return lines.map((line) => {
    // If pipe-separated markdown table
    if (line.includes("|")) {
      const parts = line.split("|").map((p) => p.trim()).filter((p, i, a) => {
        // filter out leading/trailing empty cells from "| a | b |"
        if ((i === 0 || i === a.length - 1) && p === "") return false;
        return true;
      });
      // ignore markdown divider lines e.g. "--- | ---"
      if (parts.every((p) => /^:?-+:?$/.test(p))) return [];
      if (parts.length > 0) return parts;
    }
    // Tab separated
    if (line.includes("\t")) {
      return line.split("\t").map((c) => c.trim()).filter(Boolean);
    }
    // Semicolon separated
    if (line.includes(";")) {
      return line.split(";").map((c) => c.trim()).filter(Boolean);
    }
    // 2 or more spaces separated
    const spaced = line.split(/\s{2,}/).map((c) => c.trim()).filter(Boolean);
    if (spaced.length > 1) return spaced;

    return [line];
  }).filter((row) => row.length > 0);
}

export interface StructuredPageData {
  pageNumber: number;
  text: string;
  tableRows: string[][];
}

/**
 * Extracts structured data (raw text + clustered table rows) for each page in PDF.
 */
export async function extractStructuredPages(
  file: File,
  onProgress?: (percent: number) => void
): Promise<StructuredPageData[]> {
  const pdfjs = await loadPdfjs();
  const data = new Uint8Array(await file.arrayBuffer());

  const pdf = await pdfjs.getDocument({
    data,
    isEvalSupported: false,
    useSystemFonts: true,
  }).promise;

  const result: StructuredPageData[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();

    const rawItems: RawTextItem[] = (content.items as Array<{ str?: string; transform?: number[]; width?: number; height?: number }>).map((i) => ({
      str: i.str || "",
      transform: i.transform,
      width: i.width,
      height: i.height,
    }));

    const tableRows = clusterItemsIntoTableRows(rawItems);

    let text = "";
    for (const item of content.items as Array<{ str?: string; hasEOL?: boolean }>) {
      if (typeof item.str === "string") {
        text += item.str;
        if (item.hasEOL) text += "\n";
      }
    }
    const cleanedText = text.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();

    result.push({
      pageNumber,
      text: cleanedText || tableRows.map((r) => r.join("  ")).join("\n"),
      tableRows: tableRows.length > 0 ? tableRows : parseDelimitedTextToRows(cleanedText),
    });

    page.cleanup();
    onProgress?.(Math.round((pageNumber / pdf.numPages) * 100));
  }

  return result;
}
