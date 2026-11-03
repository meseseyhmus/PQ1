"use client";

import { useState } from "react";

export function FileToolsSection() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [conversionType, setConversionType] = useState<"pdf-to-image" | "image-to-pdf" | "crop" | "resize">("pdf-to-image");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setStatus("");
      setProgress(0);
    }
  };

  const startConversion = async () => {
    if (!selectedFile) return;
    
    setProgress(0);
    setStatus("İşleniyor...");
    
    // Simulate conversion process
    const steps = [
      "Dosya analiz ediliyor...",
      "Dönüştürme başlatılıyor...", 
      "İşlem tamamlanıyor..."
    ];
    
    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setProgress((i + 1) * 33);
      setStatus(steps[i]);
    }
    
    setStatus("Başarılı!");
    setTimeout(() => setStatus(""), 2000);
  };

  return (
    <section className="py-16 bg-[--background]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid max-w-4xl mx-auto grid-cols-1 lg:grid-cols-2 gap-6">
          {/* File Upload Area */}
          <div className="border-2 border-dashed rounded-2xl p-12 text-center border-[--muted] hover:border-[var(--primary)] transition-colors cursor-pointer">
            <svg className="mx-auto w-12 h-12 text-[--muted] mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 21l-6-6l6-6"/>
            </svg>
            <p className="text-[--muted] text-lg">Dosya seç veya sürükle</p>
            <p className="text-[--muted-foreground] text-sm mt-1">PDF, JPG, PNG, TIFF destekli</p>
            <input
              type="file"
              hidden
              onChange={handleFileChange}
            />
            <p className="text-[--muted-foreground] text-xs mt-2">Veya tıklayarak dosya seç</p>
          </div>

          {/* Conversion Controls */}
          <div>
            <h3 className="text-xl font-semibold text-[--foreground] mb-4">Dönüştürme Türü</h3>
            <div className="space-y-3">
              {["pdf-to-image", "image-to-pdf", "crop", "resize"].map((type) => (
                <label key={type} className="flex items-center px-4 py-2 rounded-full border border-[--border] hover:border-[var(--primary)] transition-colors cursor-pointer select-none">
                  <input
                    type="radio"
                    value={type}
                    checked={conversionType === type}
                    onChange={() => setConversionType(type as any)}
                    className="w-4 h-4 rounded bg-[--primary] cursor-pointer"
                  />
                  <span className="ml-3 text-[--foreground] capitalize">{type.replace("-", " ")}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Progress & Status */}
        {selectedFile && (
          <div className="mt-8 p-6 rounded-2xl bg-[--card] border border-[--border]">
            <h3 className="text-xl font-semibold text-[--foreground] mb-4">İşlem Progress</h3>
            <div className="space-y-4">
              <div>
                <p className="text-[--muted] text-sm">{status || "Dosya seçili, işlem bekiyor..."}</p>
                <div className="mt-2 h-2 rounded-full bg-[--muted] overflow-hidden">
                  <div
                    className="h-full rounded-lg bg-[var(--primary)] transition-width"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm mt-1 text-[--muted-foreground]">{progress}%</p>
              </div>
              {progress > 0 && progress < 100 && (
                <button
                  onClick={() => setProgress(0)}
                  className="w-full py-2 bg-[--border] text-sm rounded font-medium hover:bg-[--muted] transition-colors"
                >
                  Sıfırla
                </button>
              )}
              {progress >= 100 && (
                <button
                  onClick={() => {
                    // In real app: download converted file
                    alert("Dosya başarıyla dönüştürüldü! İndirme başlamak için aşağıya indir butonu eklenebilir.")
                  }}
                  className="w-full py-2 bg-[var(--primary)] text-[--primary-foreground] rounded-xl font-medium hover:opacity-90 transition-opacity"
                >
                  İndir
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}