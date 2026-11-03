/**
 * Toplu dönüşüm yardımcıları — saf, DOM'dan bağımsız (birim test edilebilir).
 * Pro planın vaat ettiği "Toplu Dönüşüm (50 Dosyaya Kadar)" özelliğinin
 * çekirdek mantığı: dosya listesini planlamak ve ilerlemeyi hesaplamak.
 */

/** File-like input accepted by batch planner (compatible with both File and plain objects). */
export interface BatchFileLike {
  readonly name: string;
  readonly size: number;
}

export const MAX_BATCH_FILES = 50;

export type BatchItemStatus = "pending" | "running" | "done" | "error";

export type SupportedFileType = "txt" | "md" | "pdf" | "image" | "unknown";

export function detectFileType(filename: string): SupportedFileType {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  if (ext === "txt") return "txt";
  if (ext === "md" || ext === "markdown") return "md";
  if (ext === "pdf") return "pdf";
  if (["png", "jpg", "jpeg", "webp", "bmp", "gif", "svg"].includes(ext)) return "image";
  return "unknown";
}

export function recommendTargetFormat(fileType: SupportedFileType): string {
  switch (fileType) {
    case "txt":
    case "md":
      return "pdf";
    case "pdf":
      return "docx";
    case "image":
      return "webp";
    default:
      return "pdf";
  }
}

export interface BatchItem {
  id: string;
  name: string;
  size: number;
  status: BatchItemStatus;
  error?: string;
  fileType?: SupportedFileType;
  targetFormat?: string;
  outputName?: string;
}


export interface BatchPlan {
  items: BatchItem[];
  rejected: number;
  reason?: string;
}

export interface BatchProgressInfo {
  done: number;
  total: number;
  percent: number;
}

let idCounter = 0;

/** Kararlı ama tekrarlanabilir olmayan benzersiz kimlik üretir (saf sayılır: sadece sayaca dokunur). */
function nextId(): string {
  idCounter += 1;
  return `batch-${idCounter}`;
}

/**
 * Dosya listesini toplu dönüşüm kuyruğuna çevirir.
 * - En fazla MAX_BATCH_FILES dosya kabul edilir.
 * - Fazlası reddedilir ve red sayısı + nedeni döndürülür.
 */
export function planBatch(
  files: readonly BatchFileLike[] | File[]
): BatchPlan {
  const list = Array.from(files as readonly BatchFileLike[]);
  const accepted = list.slice(0, MAX_BATCH_FILES);
  const rejected = list.length - accepted.length;

  const items: BatchItem[] = accepted.map((f) => {
    const fileType = detectFileType(f.name);
    return {
      id: nextId(),
      name: f.name,
      size: f.size,
      status: "pending",
      fileType,
      targetFormat: recommendTargetFormat(fileType),
    };
  });

  if (rejected > 0) {
    return {
      items,
      rejected,
      reason: `Tek seferde en fazla ${MAX_BATCH_FILES} dosya dönüştürülebilir. ${rejected} dosya listeye alınmadı.`,
    };
  }
  return { items, rejected: 0 };
}

/** Kuyruktaki dosyalardan tamamlanan (done + error) sayısını ve yüzdeyi hesaplar. */
export function batchProgress(items: readonly BatchItem[]): BatchProgressInfo {
  const total = items.length;
  const done = items.filter((i) => i.status === "done" || i.status === "error").length;
  if (total === 0) return { done: 0, total: 0, percent: 0 };
  const percent = Math.round((done / total) * 100);
  return { done, total, percent };
}
