#!/usr/bin/env node
/**
 * Dört bağımsız uygulamanın anlık durum tablosu.
 *
 * Gösterilenler:
 *   - dizin / package.json / node_modules / .next
 *   - .ts/.tsx kaynak sayısı
 *   - package.json içindeki next & react majörleri
 *   - port
 *
 * Kullanım: node scripts/status.mjs [--json]
 */

import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const APPS = [
  { name: "seoradar", dir: "seoradar", port: 3002 },
  { name: "konvertlab", dir: "konvertlab", port: 3001 },
  { name: "terneon", dir: "terneon", port: 3003 },
  { name: "parselya", dir: "parselya", port: 3004 },
];

const ANSI = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  gray: "\x1b[90m",
};
const paint = (c, t) => `${c}${t}${ANSI.reset}`;

function countSources(dir) {
  let n = 0;
  const stack = [dir];
  while (stack.length) {
    const cur = stack.pop();
    let entries;
    try {
      entries = readdirSync(cur, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const e of entries) {
      if (e.name === "node_modules" || e.name === ".next" || e.name === ".git") continue;
      const p = join(cur, e.name);
      if (e.isDirectory()) stack.push(p);
      else if (/\.(ts|tsx)$/.test(e.name)) n += 1;
    }
  }
  return n;
}

function majorOf(range) {
  if (!range) return null;
  const cleaned = String(range).replace(/^[\^~>=<\s]+/, "");
  const major = Number.parseInt(cleaned.split(".")[0], 10);
  return Number.isFinite(major) ? major : null;
}

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

const rows = APPS.map((app) => {
  const appDir = join(ROOT, app.dir);
  const dirOk = existsSync(appDir) && statSync(appDir).isDirectory();
  const pkg = dirOk ? readJson(join(appDir, "package.json")) : null;
  const nodeModules = dirOk && existsSync(join(appDir, "node_modules"));
  const built = dirOk && existsSync(join(appDir, ".next", "BUILD_ID"));
  const hasReadme = dirOk && existsSync(join(appDir, "README.md"));
  const hasTests = dirOk && existsSync(join(appDir, "tests"));
  const srcCount = dirOk ? countSources(appDir) : 0;

  return {
    name: app.name,
    dir: app.dir,
    port: app.port,
    dirOk,
    pkgOk: !!pkg && !pkg.__error,
    pkgName: pkg?.name ?? null,
    nodeModules,
    built,
    hasReadme,
    hasTests,
    srcCount,
    next: majorOf(pkg?.dependencies?.next),
    react: majorOf(pkg?.dependencies?.react),
    tailwind: majorOf(pkg?.devDependencies?.tailwindcss ?? pkg?.dependencies?.tailwindcss),
    scripts: pkg?.scripts ? Object.keys(pkg.scripts) : [],
  };
});

if (process.argv.includes("--json")) {
  console.log(JSON.stringify({ root: ROOT, apps: rows }, null, 2));
  process.exit(0);
}

console.log(paint(ANSI.bold, "\n  SaaS Paketi — Durum\n"));
console.log(
  `  ${"Uygulama".padEnd(12)} ${"Port".padEnd(6)} ${"pkg".padEnd(5)} ${"nm".padEnd(5)} ${"build".padEnd(7)} ${"README".padEnd(8)} ${"tests".padEnd(7)} ${"kaynak".padEnd(8)} ${"next".padEnd(6)} ${"react".padEnd(7)} ${"tw".padEnd(4)}`
);
console.log("  " + "─".repeat(84));

const yn = (v) => (v ? paint(ANSI.green, "var") : paint(ANSI.red, "yok"));

for (const r of rows) {
  console.log(
    `  ${r.name.padEnd(12)} ${String(r.port).padEnd(6)} ${yn(r.pkgOk).padEnd(10)} ${yn(r.nodeModules).padEnd(10)} ${yn(r.built).padEnd(12)} ${yn(r.hasReadme).padEnd(13)} ${yn(r.hasTests).padEnd(12)} ${String(r.srcCount).padEnd(8)} ${String(r.next ?? "-").padEnd(6)} ${String(r.react ?? "-").padEnd(7)} ${String(r.tailwind ?? "-").padEnd(4)}`
  );
}

const missing = rows.filter((r) => !r.pkgOk || r.srcCount < 15);
if (missing.length) {
  console.log(
    paint(
      ANSI.yellow,
      `\n  Dikkat: ${missing.map((m) => m.name).join(", ")} — paket eksik veya kaynak sayısı < 15`
    )
  );
}

console.log(
  paint(
    ANSI.gray,
    `\n  Derleme → node scripts/build-all.mjs · Sözleşme → node qa/run-all.mjs · Dev → node scripts/dev-all.mjs\n`
  )
);