import { FileDigit } from "lucide-react";

export default function Footer() {
  return (
    <footer id="nasil-calisir" className="border-t border-slate-800/80 bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600">
                <FileDigit className="h-4 w-4 text-slate-950" aria-hidden="true" />
              </span>
              <span className="font-bold text-slate-100">
                Konvert<span className="text-cyan-400">Lab</span>
              </span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-slate-500">
              Tarayıcı tabanlı, gizli ve ücretsiz doküman dönüştürme araçları.
              Dosyalarınız cihazınızdan asla ayrılmaz.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Nasıl Çalışır?</h2>
            <ol className="mt-3 space-y-2 text-sm text-slate-500">
              <li>1. Dosyanızı sürükleyin veya metni yapıştırın</li>
              <li>2. Dönüşüm tarayıcınızda anında gerçekleşir</li>
              <li>3. Sonucu bilgisayarınıza indirin</li>
            </ol>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Gizlilik</h2>
            <p className="mt-3 text-sm text-slate-500">
              KonvertLab tamamen tarayıcıda çalışır. TXT, PDF ve altyazı
              dosyalarınız hiçbir sunucuya gönderilmez, saklanmaz.
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-800/80 pt-6 text-xs text-slate-600">
          © {new Date().getFullYear()} KonvertLab. Tüm hakları saklıdır.
        </div>
      </div>
    </footer>
  );
}
