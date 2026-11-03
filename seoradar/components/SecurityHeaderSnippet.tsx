"use client";

import { useState } from "react";
import { Check, Copy, Terminal, Server, Code2, ShieldAlert, Sparkles, FileText } from "lucide-react";
import type { SecurityHeadersAnalysis } from "@/types";
import {
  generateNginxSnippet,
  generateNextJsSnippet,
  generateApacheSnippet,
} from "@/lib/securitySnippets";

interface SecurityHeaderSnippetProps {
  security: SecurityHeadersAnalysis;
}

type SnippetServer = "nginx" | "nextjs" | "apache";

export function SecurityHeaderSnippet({ security }: SecurityHeaderSnippetProps) {
  const [selectedServer, setSelectedServer] = useState<SnippetServer>("nginx");
  const [onlyMissing, setOnlyMissing] = useState(true);
  const [copied, setCopied] = useState(false);

  const missingCount = security.totalCount - security.passedCount;

  const currentSnippet = (() => {
    switch (selectedServer) {
      case "nginx":
        return generateNginxSnippet(security, onlyMissing);
      case "nextjs":
        return generateNextJsSnippet(security, onlyMissing);
      case "apache":
        return generateApacheSnippet(security, onlyMissing);
    }
  })();

  const filePathHint = (() => {
    switch (selectedServer) {
      case "nginx":
        return "/etc/nginx/conf.d/security.conf veya /etc/nginx/nginx.conf";
      case "nextjs":
        return "next.config.js (veya next.config.mjs)";
      case "apache":
        return ".htaccess (kök dizin) veya /etc/apache2/apache2.conf";
    }
  })();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
      const textArea = document.createElement("textarea");
      textArea.value = currentSnippet;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 mt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
            <Terminal className="size-3.5" />
            1-Tıkla Kopyala &amp; Uygula
          </div>
          <h3 className="mt-2 text-xl font-black text-slate-900 tracking-tight">
            Güvenlik Başlıkları Yapılandırma Kodu
          </h3>
          <p className="mt-1 text-xs text-slate-500 max-w-xl">
            Sitenizde eksik olan HTTP güvenlik başlıklarını sunucunuza kolayca eklemeniz için hazır ayar kodları.
          </p>
        </div>

        {/* Missing count badge */}
        <div className="flex items-center gap-2">
          {missingCount > 0 ? (
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">
              <ShieldAlert className="size-4 text-rose-500" />
              {missingCount} Eksik Başlık
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
              <Sparkles className="size-4 text-emerald-500" />
              Tüm Başlıklar Tanımlı
            </span>
          )}
        </div>
      </div>

      {/* Control bar: Server Tabs & Toggle */}
      <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Server tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedServer("nginx")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              selectedServer === "nginx"
                ? "bg-slate-900 text-white shadow-sm"
                : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
            }`}
          >
            <Server className="size-3.5" />
            Nginx (nginx.conf)
          </button>

          <button
            type="button"
            onClick={() => setSelectedServer("nextjs")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              selectedServer === "nextjs"
                ? "bg-slate-900 text-white shadow-sm"
                : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
            }`}
          >
            <Code2 className="size-3.5" />
            Next.js (next.config.js)
          </button>

          <button
            type="button"
            onClick={() => setSelectedServer("apache")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              selectedServer === "apache"
                ? "bg-slate-900 text-white shadow-sm"
                : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
            }`}
          >
            <FileText className="size-3.5" />
            Apache (.htaccess)
          </button>
        </div>

        {/* Filter Toggle */}
        <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1 text-xs">
          <button
            type="button"
            onClick={() => setOnlyMissing(true)}
            className={`rounded-lg px-3 py-1 font-semibold transition ${
              onlyMissing
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Yalnızca Eksikler ({missingCount})
          </button>
          <button
            type="button"
            onClick={() => setOnlyMissing(false)}
            className={`rounded-lg px-3 py-1 font-semibold transition ${
              !onlyMissing
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Tüm Başlıklar (6)
          </button>
        </div>
      </div>

      {/* Code Viewer Panel */}
      <div className="mt-4 relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 text-slate-200 shadow-md">
        {/* Code header bar */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 py-2.5 text-xs">
          <div className="flex items-center gap-2">
            <span className="flex gap-1.5">
              <span className="size-2.5 rounded-full bg-rose-500/80" />
              <span className="size-2.5 rounded-full bg-amber-500/80" />
              <span className="size-2.5 rounded-full bg-emerald-500/80" />
            </span>
            <span className="font-mono text-[11px] text-slate-400 pl-2">
              {filePathHint}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition shadow-sm ${
              copied
                ? "bg-emerald-600 text-white"
                : "bg-brand-600 text-white hover:bg-brand-500 active:scale-95"
            }`}
          >
            {copied ? (
              <>
                <Check className="size-3.5" />
                Kopyalandı!
              </>
            ) : (
              <>
                <Copy className="size-3.5" />
                Kodu Kopyala
              </>
            )}
          </button>
        </div>

        {/* Code snippet text */}
        <div className="p-4 overflow-x-auto max-h-[380px]">
          <pre className="font-mono text-xs leading-relaxed text-slate-200 selection:bg-brand-500 selection:text-white">
            {currentSnippet}
          </pre>
        </div>

        {/* Hint footer */}
        <div className="border-t border-slate-800/80 bg-slate-900/50 px-4 py-2 text-[11px] text-slate-400 flex items-center justify-between">
          <span>
            {selectedServer === "nginx" && "💡 İpucu: Ayarları uyguladıktan sonra 'sudo nginx -t && sudo systemctl reload nginx' komutunu çalıştırın."}
            {selectedServer === "nextjs" && "💡 İpucu: next.config.js güncellendikten sonra 'npm run build' veya sunucunuzu yeniden başlatın."}
            {selectedServer === "apache" && "💡 İpucu: 'sudo a2enmod headers && sudo systemctl restart apache2' ile mod_headers etkinleştirin."}
          </span>
          <span className="font-mono text-slate-500 text-[10px]">UTF-8</span>
        </div>
      </div>
    </div>
  );
}
