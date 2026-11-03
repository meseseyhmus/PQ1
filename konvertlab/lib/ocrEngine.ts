import TesseractPkg, { type LoggerMessage } from "tesseract.js";
import { loadPdfjs } from "@/lib/pdfExtract";
import { countWords } from "@/lib/format";
import type { OcrLanguage, OcrResult } from "@/types";

// Support both ESM and CJS imports across Next.js and Node test runner
const Tesseract = (TesseractPkg as unknown as { default?: typeof TesseractPkg }).default || TesseractPkg;
const recognize = Tesseract.recognize;


export interface OcrProgressUpdate {
  status: string;
  progress: number; // 0 to 100
}

/**
 * Translates Tesseract internal status strings to friendly Turkish labels.
 */
export function formatOcrStatus(status: string): string {
  switch (status) {
    case "loading tesseract core":
      return "OCR motoru yükleniyor…";
    case "initializing tesseract":
      return "OCR motoru başlatılıyor…";
    case "initialized tesseract":
      return "OCR motoru hazır.";
    case "loading language traineddata":
      return "Dil modeli indiriliyor/yükleniyor…";
    case "loaded language traineddata":
      return "Dil modeli yüklendi.";
    case "initializing api":
      return "Metin tanıma API'si başlatılıyor…";
    case "initialized api":
      return "Tanıma API'si hazır.";
    case "recognizing text":
      return "Metin taranıyor ve tanınıyor…";
    default:
      return status;
  }
}

/**
 * Renders a specific PDF page to an offscreen HTMLCanvasElement for OCR.
 */
export async function renderPdfPageToCanvas(
  file: File,
  pageNumber = 1,
  scale = 2.0
): Promise<HTMLCanvasElement> {
  const pdfjs = await loadPdfjs();
  const data = new Uint8Array(await file.arrayBuffer());

  const pdf = await pdfjs.getDocument({
    data,
    isEvalSupported: false,
    useSystemFonts: true,
  }).promise;

  const validPageNum = Math.max(1, Math.min(pageNumber, pdf.numPages));
  const page = await pdf.getPage(validPageNum);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement("canvas");
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas context oluşturulamadı.");
  }

  // Draw white background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  await page.render({
    canvasContext: ctx,
    viewport,
  }).promise;

  page.cleanup();
  return canvas;
}

/**
 * Performs client-side Optical Character Recognition (OCR) on an Image or PDF file.
 */
export async function performClientOcr(
  fileOrCanvas: File | HTMLCanvasElement,
  lang: OcrLanguage = "tur+eng",
  onProgress?: (update: OcrProgressUpdate) => void
): Promise<OcrResult> {
  let source: HTMLCanvasElement | File = fileOrCanvas;

  // If input is a PDF File, render first page to canvas
  if (fileOrCanvas instanceof File && fileOrCanvas.type === "application/pdf") {
    onProgress?.({
      status: "PDF sayfası taranmaya hazırlanıyor…",
      progress: 5,
    });
    source = await renderPdfPageToCanvas(fileOrCanvas, 1, 2.0);
  }

  const result = await recognize(source, lang, {
    logger: (m: LoggerMessage) => {
      if (onProgress && typeof m.progress === "number") {
        onProgress({
          status: formatOcrStatus(m.status),
          progress: Math.round(m.progress * 100),
        });
      }
    },
  });

  const extractedText = (result.data.text || "").trim();
  const confidence = Math.round(result.data.confidence || 0);
  const wordCount = countWords(extractedText);

  return {
    text: extractedText,
    confidence,
    wordCount,
  };
}
