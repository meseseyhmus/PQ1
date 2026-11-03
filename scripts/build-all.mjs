#!/usr/bin/env node
/**
 * Dört bağımsız uygulamayı sırayla (veya --only ile tekini) derler.
 *
 * Her proje kendi dizininde, kendi package.json + node_modules ile derlenir.
 * Ortak npm workspace kullanılmaz.
 *
 * Kullanım:
 *   node scripts/build-all.mjs
 *   node scripts/build-all.mjs --only seoradar
 *   node scripts/build-all.mjs --skip-install
 *   node scripts/build-all.mjs --concurrent   (paralel derleme; RAM'e dikkat)
 *
 * Çıkış kodu: 0 = tüm derlemeler başarılı, 1 = en az biri başarısız.
 */

import { existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

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
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
};

const paint = (c, t) => `${c}${t}${ANSI.reset}`;

function run(cmd, args, opts = {}) {
  return new Promise((res) => {
    const child = spawn(cmd, args, {
      cwd: opts.cwd,
      shell: true,
      stdio: "inherit",
      env: {
        ...process.env,
        NODE_OPTIONS: "--max-old-space-size=4096",
        ...(opts.env || {}),
      },
    });
    child.on("error", (err) => res({ code: 1, err: String(err) }));
    child.on("close", (code) => res({ code: code ?? 1 }));
  });
}

const argv = process.argv.slice(2);
const flag = (n) => argv.includes(n);
const opt = (n, fb) => {
  const i = argv.indexOf(n);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fb;
};

const only = opt("--only", null);
const skipInstall = flag("--skip-install");
const concurrent = flag("--concurrent");

const selected = only ? APPS.filter((a) => a.name === only) : APPS;
if (only && selected.length === 0) {
  console.error(paint(ANSI.red, `Bilinmeyen uygulama: ${only}`));
  console.error(`Geçerli değerler: ${APPS.map((a) => a.name).join(", ")}`);
  process.exit(2);
}

async function buildApp(app) {
  const appDir = join(ROOT, app.dir);
  const log = (m) => console.log(paint(ANSI.cyan, `[${app.name}]`) + " " + m);

  if (!existsSync(appDir)) {
    console.error(paint(ANSI.red, `[${app.name}] dizin yok: ${app.dir}`));
    return { name: app.name, ok: false, reason: "dizin yok" };
  }

  const hasModules = existsSync(join(appDir, "node_modules"));
  if (!hasModules && !skipInstall) {
    log("npm install…");
    const inst = await run("npm", ["install", "--no-audit", "--no-fund"], {
      cwd: appDir,
    });
    if (inst.code !== 0) {
      console.error(paint(ANSI.red, `[${app.name}] npm install başarısız`));
      return { name: app.name, ok: false, reason: "npm install" };
    }
  } else if (!hasModules && skipInstall) {
    console.error(
      paint(ANSI.yellow, `[${app.name}] node_modules yok ama --skip-install verildi`)
    );
    return { name: app.name, ok: false, reason: "node_modules yok" };
  }

  log("npm run build…");
  const t0 = Date.now();
  const build = await run("npm", ["run", "build"], { cwd: appDir });
  const secs = ((Date.now() - t0) / 1000).toFixed(1);
  if (build.code === 0) {
    log(paint(ANSI.green, `derleme başarılı (${secs} sn)`));
    return { name: app.name, ok: true, secs };
  }
  console.error(paint(ANSI.red, `[${app.name}] derleme başarısız (${secs} sn)`));
  return { name: app.name, ok: false, reason: `build exit ${build.code}` };
}

console.log(
  paint(ANSI.bold, "\n  SaaS Paketi — Toplu Derleme\n") +
    paint(ANSI.gray, `  Kök: ${ROOT}\n`) +
    paint(ANSI.gray, `  Hedefler: ${selected.map((a) => a.name).join(", ")}\n`)
);

const t0 = Date.now();
let results;

if (concurrent) {
  results = await Promise.all(selected.map(buildApp));
} else {
  results = [];
  for (const app of selected) results.push(await buildApp(app));
}

const totalSecs = ((Date.now() - t0) / 1000).toFixed(1);
const ok = results.filter((r) => r.ok);
const bad = results.filter((r) => !r.ok);

console.log(`\n${paint(ANSI.bold, "━━━━━━━━━━━━━━ ÖZET ━━━━━━━━━━━━━━")}`);
for (const r of results) {
  const mark = r.ok ? paint(ANSI.green, "PASS") : paint(ANSI.red, "FAIL");
  const detail = r.ok ? `${r.secs} sn` : r.reason;
  console.log(`  [${mark}] ${r.name} — ${detail}`);
}
console.log(
  `\n  ${paint(ANSI.green, `${ok.length} başarılı`)} · ${paint(ANSI.red, `${bad.length} başarısız`)} · toplam ${totalSecs} sn`
);

if (bad.length) {
  console.log(
    paint(
      ANSI.gray,
      `\n  İpucu: tek uygulama derle →  node scripts/build-all.mjs --only ${bad[0].name}\n`
    )
  );
  process.exit(1);
}
process.exit(0);