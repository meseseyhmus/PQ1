export interface PageText {
  page: number;
  text: string;
}

export type PdfAlign = "left" | "justify" | "center";

export interface TextToPdfOptions {
  /** Font size in pt (8-24) */
  fontSize: number;
  /** Page margin in mm (10-40) */
  margin: number;
  align: PdfAlign;
  /** Optional title line rendered above the body */
  title?: string;
  /** Render page numbers at the bottom of each page */
  pageNumbers?: boolean;
  /** Add a diagonal "KonvertLab" watermark (free tier) */
  watermark?: boolean;
}

export interface SubtitleStats {
  cueCount: number;
  wordCount: number;
  readingMinutes: number;
}

export type TabId =
  | "txt2pdf"
  | "pdf2txt"
  | "pdf2docx"
  | "pdf2excel"
  | "pdf2img"
  | "img2pdf"
  | "img2webp"
  | "ocr"
  | "md2pdf"
  | "youtube"
  | "batch"
  | "qrcode";

export type OcrLanguage = "tur" | "eng" | "tur+eng";

export interface OcrResult {
  text: string;
  confidence: number;
  wordCount: number;
}

export interface PdfImageItem {
  pageNumber: number;
  dataUrl: string;
  blob: Blob;
  filename: string;
  width: number;
  height: number;
}

export interface WebpConvertResult {
  blob: Blob;
  dataUrl: string;
  originalSize: number;
  newSize: number;
  savingsPercent: number;
  width?: number;
  height?: number;
  originalWidth?: number;
  originalHeight?: number;
}

