/**
 * Node modül çözümleme kancası: `@/…` takma adını parselya köküne eşler.
 * Next.js tsconfig `paths` ayarının test ortamındaki karşılığı
 * (Node 24 yerleşik tip soymasıyla `.ts` dosyaları doğrudan yüklenir).
 *
 * `@/types`        → <parselya>/types/index.ts
 * `@/lib/geo`      → <parselya>/lib/geo.ts
 */

import { existsSync } from "node:fs";
import { dirname, resolve as resolvePath, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const APP_ROOT = resolvePath(HERE, "..");

const CANDIDATES = [".ts", ".tsx", "/index.ts", "/index.tsx", ".js", ".mjs", ""];

export async function resolve(specifier, context, next) {
  if (specifier.startsWith("@/")) {
    const rel = specifier.slice(2);
    const base = join(APP_ROOT, rel);
    for (const suffix of CANDIDATES) {
      const candidate = base + suffix;
      if (existsSync(candidate)) {
        return next(pathToFileURL(candidate).href, context);
      }
    }
  }
  return next(specifier, context);
}
