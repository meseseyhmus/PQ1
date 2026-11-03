import { loadPdfjs } from "@/lib/pdfExtract";
import { createZipArchive } from "@/lib/zipHelper";
import type { PdfImageItem } from "@/types";

export interface RenderPdfImagesOptions {
  format?: "png" | "jpeg";
  scale?: number; // e.g. 1.5 or 2.0 for high-res
  quality?: number; // 0.1 to 1.0 (for jpeg)
  onProgress?: (percent: number, currentPage: number, totalPages: number) => void;
}

/**
 * Renders all pages of a PDF to high-resolution PNG or JPEG images using HTML5 Canvas.
 */
export async function renderPdfToImages(
  file: File,
  options?: RenderPdfImagesOptions
): Promise<PdfImageItem[]> {
  if (typeof window === "undefined") {
    return [];
  }

  const pdfjs = await loadPdfjs();
  const data = new Uint8Array(await file.arrayBuffer());

  const pdf = await pdfjs.getDocument({
    data,
    isEvalSupported: false,
    useSystemFonts: true,
  }).promise;

  const totalPages = pdf.numPages;
  const format = options?.format || "png";
  const mimeType = format === "png" ? "image/png" : "image/jpeg";
  const scale = options?.scale || 2.0;
  const quality = options?.quality ?? 0.92;
  const baseName = file.name.replace(/\.pdf$/i, "");

  const items: PdfImageItem[] = [];

  for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);

    const ctx = canvas.getContext("2d", { alpha: format === "png" });
    if (!ctx) {
      throw new Error("Canvas context 2D oluşturulamadı.");
    }

    // White background for JPEG
    if (format === "jpeg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    await page.render({
      canvasContext: ctx,
      viewport,
    }).promise;

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (b) resolve(b);
          else reject(new Error(`Sayfa ${pageNumber} görsele dönüştürülemedi.`));
        },
        mimeType,
        quality
      );
    });

    const dataUrl = canvas.toDataURL(mimeType, quality);
    const filename = `${baseName}_sayfa_${pageNumber}.${format === "png" ? "png" : "jpg"}`;

    items.push({
      pageNumber,
      dataUrl,
      blob,
      filename,
      width: canvas.width,
      height: canvas.height,
    });

    page.cleanup();
    options?.onProgress?.(Math.round((pageNumber / totalPages) * 100), pageNumber, totalPages);
  }

  return items;
}

/**
 * Zips all rendered PDF page images into a single .zip download.
 */
export async function bundlePdfImagesToZip(
  images: PdfImageItem[],
  zipFilename = "pdf_sayfalari.zip",
  onProgress?: (percent: number) => void
): Promise<Blob> {
  const entries = images.map((img) => ({
    name: img.filename,
    content: img.blob,
  }));
  return createZipArchive(entries, onProgress);
}
