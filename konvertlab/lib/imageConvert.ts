import type { WebpConvertResult } from "@/types";

export interface ImageConvertOptions {
  quality: number; // 10 to 100
  maxWidth?: number;
  maxHeight?: number;
}

/**
 * Pure calculation for storage savings.
 */
export function calculateSavings(
  originalSize: number,
  newSize: number
): { bytesSaved: number; percentSaved: number } {
  if (originalSize <= 0) return { bytesSaved: 0, percentSaved: 0 };
  const bytesSaved = Math.max(0, originalSize - newSize);
  const percentSaved = Math.round((bytesSaved / originalSize) * 100);
  return { bytesSaved, percentSaved };
}

/**
 * Converts an image file (JPG, PNG, GIF, BMP) to WebP using HTML5 Canvas entirely on the client.
 */
export async function convertImageToWebp(
  file: File,
  options: ImageConvertOptions = { quality: 80 }
): Promise<WebpConvertResult> {
  if (typeof window === "undefined") {
    throw new Error("Client-side environment required for Canvas conversion.");
  }

  const originalSize = file.size;
  const qualityDecimal = Math.max(0.1, Math.min(1.0, options.quality / 100));

  const objectUrl = URL.createObjectURL(file);

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Görsel yüklenemedi. Lütfen geçerli bir görsel dosyası seçin."));
      el.src = objectUrl;
    });

    const origW = img.naturalWidth || img.width;
    const origH = img.naturalHeight || img.height;
    let width = origW;
    let height = origH;

    // Optional max dimension constraint
    if (options.maxWidth && width > options.maxWidth) {
      height = Math.round((height * options.maxWidth) / width);
      width = options.maxWidth;
    }
    if (options.maxHeight && height > options.maxHeight) {
      width = Math.round((width * options.maxHeight) / height);
      height = options.maxHeight;
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Canvas 2D context oluşturulamadı.");
    }

    ctx.drawImage(img, 0, 0, width, height);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (b) resolve(b);
          else reject(new Error("WebP formatına dönüştürme başarısız oldu."));
        },
        "image/webp",
        qualityDecimal
      );
    });

    const dataUrl = canvas.toDataURL("image/webp", qualityDecimal);
    const newSize = blob.size;
    const { percentSaved } = calculateSavings(originalSize, newSize);

    return {
      blob,
      dataUrl,
      originalSize,
      newSize,
      savingsPercent: percentSaved,
      width,
      height,
      originalWidth: origW,
      originalHeight: origH,
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
