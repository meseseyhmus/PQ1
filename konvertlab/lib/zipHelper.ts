import JSZip from "jszip";

export interface ZipArchiveEntry {
  name: string;
  content: Blob | string | Uint8Array | ArrayBuffer;
}

/**
 * Creates a .zip archive from an array of files/blobs using JSZip entirely in the browser.
 */
export async function createZipArchive(
  entries: ZipArchiveEntry[],
  onProgress?: (percent: number) => void
): Promise<Blob> {
  const zip = new JSZip();

  for (const entry of entries) {
    zip.file(entry.name, entry.content);
  }

  const blob = await zip.generateAsync(
    {
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    },
    (metadata) => {
      if (onProgress && typeof metadata.percent === "number") {
        onProgress(Math.round(metadata.percent));
      }
    }
  );

  return blob;
}
