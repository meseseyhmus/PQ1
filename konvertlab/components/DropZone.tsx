"use client";

import { useCallback, useRef, useState } from "react";
import { FileUp, FileText, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatBytes } from "@/lib/format";

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

interface DropZoneProps {
  /** HTML accept attribute, e.g. ".txt,.md" */
  accept: string;
  multiple?: boolean;
  files: File[];
  onFiles: (files: File[]) => void;
  onRemove: (index: number) => void;
  label?: string;
  hint?: string;
  className?: string;
}

export default function DropZone({
  accept,
  multiple = false,
  files,
  onFiles,
  onRemove,
  label = "Dosyaları buraya sürükleyin",
  hint = "veya seçmek için tıklayın",
  className,
}: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback(
    (incoming: FileList | File[] | null) => {
      if (!incoming) return;
      const list = Array.from(incoming);
      const tooBig = list.find((f) => f.size > MAX_FILE_SIZE);
      if (tooBig) {
        setError(
          `"${tooBig.name}" dosyası 25 MB sınırını aşıyor (${formatBytes(
            tooBig.size
          )}). Lütfen daha küçük bir dosya seçin.`
        );
        return;
      }
      setError(null);
      onFiles(multiple ? list : list.slice(0, 1));
    },
    [multiple, onFiles]
  );

  return (
    <div className={className}>
      <div
        role="button"
        tabIndex={0}
        aria-label={`${label} — dosya seçme alanı`}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400",
          dragging
            ? "border-cyan-400 bg-cyan-400/10"
            : "border-slate-700 bg-slate-900/40 hover:border-cyan-500/60 hover:bg-slate-900/70"
        )}
      >
        <FileUp className="h-8 w-8 text-cyan-400" aria-hidden="true" />
        <div>
          <p className="text-sm font-medium text-slate-200">{label}</p>
          <p className="mt-1 text-xs text-slate-500">{hint}</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {error && (
        <p role="alert" className="mt-2 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">
          {error}
        </p>
      )}

      {files.length > 0 && (
        <ul className="mt-3 space-y-2">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <FileText className="h-4 w-4 shrink-0 text-cyan-400" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="truncate text-sm text-slate-200">{file.name}</p>
                  <p className="text-xs text-slate-500">{formatBytes(file.size)}</p>
                </div>
              </div>
              <button
                type="button"
                aria-label={`${file.name} dosyasını kaldır`}
                onClick={() => onRemove(index)}
                className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-800 hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
