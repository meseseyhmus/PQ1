/**
 * Node modül çözümleme kancası: `@/…` yol takma adını seoradar köküne eşler.
 * Next.js'in tsconfig `paths` ayarının test ortamındaki karşılığı.
 *
 * `@/types`          → <seoradar>/types/index.ts
 * `@/lib/format`     → <seoradar>/lib/format.ts
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