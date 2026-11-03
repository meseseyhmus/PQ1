#!/usr/bin/env node
/**
 * Dört uygulamanın canlı sağlık kontrolü.
 *
 * Her app kendi portunda (3001–3004) dinliyor olmalı. Betik HTTP 200
 * bekler; SeoRadar için ayrıca GET /api/usage sözleşmesini doğrular.
 *
 * Kullanım:
 *   node qa/health-all.mjs
 *   node qa/health-all.mjs --timeout 3000
 *   node qa/health-all.mjs --skip seoradar
 *
 * Çıkış kodu: 0 = hepsi ayakta, 1 = en az biri yanıt vermedi.
 */

const APPS = [
  { name: "seoradar", port: 3002, path: "/", api: "/api/usage" },
  { name: "konvertlab", port: 3001, path: "/" },
  { name: "terneon", port: 3003, path: "/" },
  { name: "parselya", port: 3004, path: "/" },
];

const ANSI = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  gray: "\x1b[90m",
};
const paint = (c, t) => `${c}${t}${ANSI.reset}`;

const argv = process.argv.slice(2);
function opt(name, fallback) {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
}
function flag(name) {
  return argv.includes(name);
}

const timeoutMs = Number(opt("--timeout", "5000"));
const skip = new Set(
  argv.includes("--skip") ? argv.slice(argv.indexOf("--skip") + 1).filter((a) => !a.startsWith("--")) : []
);

const targets = APPS.filter((a) => !skip.has(a.name));

async function probe(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const t0 = Date.now();
    const res = await fetch(url, { signal: ctrl.signal, redirect: "manual" });
    const ms = Date.now() - t0;
    return { ok: res.status > 0 && res.status < 500, status: res.status, ms };
  } catch (err) {
    return { ok: false, error: err.name === "AbortError" ? "zaman aşımı" : String(err.message || err) };
  } finally {
    clearTimeout(timer);
  }
}

console.log(
  paint(ANSI.bold, "\n  SaaS Paketi — Sağlık Kontrolü\n") +
    paint(ANSI.gray, `  Zaman aşımı: ${timeoutMs} ms · Hedefler: ${targets.map((a) => a.name).join(", ")}\n`)
);

let failCount = 0;

for (const app of targets) {
  const base = `http://127.0.0.1:${app.port}`;
  process.stdout.write(`  ${app.name.padEnd(12)} :${app.port}  `);

  const home = await probe(base + app.path);
  if (!home.ok) {
    failCount += 1;
    console.log(
      paint(ANSI.red, "DOWN") +
        paint(ANSI.gray, ` — ${home.error ?? `HTTP ${home.status}`}`)
    );
    continue;
  }

  let extra = paint(ANSI.green, `UP ${home.status}`) + paint(ANSI.gray, ` ${home.ms}ms`);

  if (app.api) {
    const api = await probe(base + app.api);
    if (!api.ok) {
      failCount += 1;
      extra += paint(ANSI.red, `  api DOWN (${api.error ?? api.status})`);
    } else {
      extra += paint(ANSI.gray, `  api ${api.status}`);
    }
  }

  console.log(extra);
}

console.log(
  `\n  ${paint(ANSI.green, `${targets.length - failCount} ayakta`)} · ${paint(ANSI.red, `${failCount} yanıt vermedi`)}`
);

if (failCount > 0) {
  console.log(
    paint(
      ANSI.gray,
      "  İpucu: uygulamaları başlat →  node scripts/dev-all.mjs\n"
    )
  );
  process.exit(1);
}
process.exit(0);