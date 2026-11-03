export type ExportProgress = (ratio: number) => void;

export interface ExportResult {
  blob: Blob;
  extension: string;
}

export interface RecordOptions {
  format?: "webm" | "mp4";
  fps?: number;
  bitrateMbps?: number;
}

export function pickMimeType(preferred?: "webm" | "mp4"): { mimeType: string; extension: string } | null {
  if (typeof MediaRecorder === "undefined") return null;
  const candidates: { mimeType: string; extension: string }[] = preferred === "mp4"
    ? [
        { mimeType: "video/mp4", extension: "mp4" },
        { mimeType: "video/webm;codecs=vp9", extension: "webm" },
        { mimeType: "video/webm;codecs=vp8", extension: "webm" },
        { mimeType: "video/webm", extension: "webm" },
      ]
    : [
        { mimeType: "video/webm;codecs=vp9", extension: "webm" },
        { mimeType: "video/webm;codecs=vp8", extension: "webm" },
        { mimeType: "video/webm", extension: "webm" },
        { mimeType: "video/mp4", extension: "mp4" },
      ];

  for (const c of candidates) {
    try {
      if (MediaRecorder.isTypeSupported(c.mimeType)) return c;
    } catch {
      // yok say
    }
  }
  return null;
}

export function isExportSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof MediaRecorder !== "undefined" &&
    typeof HTMLCanvasElement !== "undefined" &&
    typeof HTMLCanvasElement.prototype.captureStream === "function" &&
    pickMimeType() !== null
  );
}

export function isCanvasTainted(canvas: HTMLCanvasElement): boolean {
  try {
    const ctx = canvas.getContext("2d");
    if (!ctx) return false;
    ctx.getImageData(0, 0, 1, 1);
    return false;
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "SecurityError") {
      return true;
    }
    return false;
  }
}

/**
 * Canvas akışını kaydeder. `run` çağrısı kayıt sırasında sahneyi
 * gerçek zamanlı oynatmalıdır (ör. play(0) → duration).
 */
export async function recordCanvas(
  canvas: HTMLCanvasElement,
  durationSec: number,
  run: () => Promise<void>,
  onProgress?: ExportProgress,
  options?: RecordOptions,
): Promise<ExportResult> {
  const picked = pickMimeType(options?.format);
  if (!picked) {
    throw new Error(
      "Tarayıcınız video kaydını desteklemiyor (MediaRecorder bulunamadı). Chrome veya Edge'in güncel bir sürümünü deneyin.",
    );
  }

  // Tainted canvas kontrolü (CORS kaynaklı canvas lekelenmesi güvenlik bariyeri)
  if (isCanvasTainted(canvas)) {
    throw new Error(
      "Tuval güvenlik kısıtlaması (CORS): Harici fayanslar tuvali kilitledi. Lütfen arka plan olarak 'Prosedürel' zemini seçin.",
    );
  }

  const fps = options?.fps ?? 30;
  const bitrate = (options?.bitrateMbps ?? 8) * 1_000_000;
  const stream = canvas.captureStream(fps);
  const recorder = new MediaRecorder(stream, {
    mimeType: picked.mimeType,
    videoBitsPerSecond: bitrate,
  });
  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };

  const done = new Promise<Blob>((resolve, reject) => {
    recorder.onstop = () => resolve(new Blob(chunks, { type: picked.mimeType }));
    recorder.onerror = () => reject(new Error("Kayıt sırasında hata oluştu."));
  });

  recorder.start(250);
  const startedAt = performance.now();
  const progressTimer = window.setInterval(() => {
    const ratio = Math.min(1, (performance.now() - startedAt) / (durationSec * 1000));
    onProgress?.(ratio);
  }, 100);

  try {
    await run();
  } finally {
    window.clearInterval(progressTimer);
    // akışın son kareleri yazılsın diye kısa bekleme
    await new Promise((r) => setTimeout(r, 300));
    recorder.stop();
    stream.getTracks().forEach((t) => t.stop());
  }

  onProgress?.(1);
  const blob = await done;
  return { blob, extension: picked.extension };
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export function estimateSizeMB(durationSec: number, bitrateMbps = 8): number {
  return (bitrateMbps * durationSec) / 8;
}
