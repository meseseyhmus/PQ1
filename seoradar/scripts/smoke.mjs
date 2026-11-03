#!/usr/bin/env node
/**
 * SeoRadar canlı API smoke testi.
 *
 * Çalışan bir SeoRadar örneğine (varsayılan http://localhost:3002) karşı
 * sözleşme testleri yapar:
 *   1. GET  /api/usage    → { ok, usage: {used,limit}, plan }
 *   2. POST /api/analyze  → AnalysisResult (şema + invariant)
 *   3. POST /api/analyze  (geçersiz URL) → 400 AnalyzeError
 *   4. Kota sınırı        → 429 RATE_LIMIT (yalnızca --quota ile)
 *
 * Kullanım:
 *   node scripts/dev-all.mjs --only seoradar        # ayrı terminalde
 *   node seoradar/scripts/smoke.mjs
 *   node seoradar/scripts/smoke.mjs --base http://127.0.0.1:3002
 *   node seoradar/scripts/smoke.mjs --url https://example.com
 *   node seoradar/scripts/smoke.mjs --quota          # 3 istek atıp 429 bekler
 *
 * Çıkış kodu: 0 = hepsi geçti, 1 = en az bir başarısız.
 * Yalnızca localhost / kendi belirlediğiniz hedefe istek atar.
 */

import { spawnSync } from "node:child_process";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..", "..");
const SCHEMA = join(ROOT, "qa", "contracts", "analysis-result.schema.json");
const ERROR_SCHEMA = join(ROOT, "qa", "contracts", "analysis-error.schema.json");
const USAGE_SCHEMA = join(ROOT, "qa", "contracts", "usage-response.schema.json");

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
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : fallback;
}
const flag = (n) => argv.includes(n);

const BASE = (opt("--base", "http://127.0.0.1:3002")).replace(/\/$/, "");
const TARGET_URL = opt("--url", "https://example.com");
const RUN_QUOTA = flag("--quota");
const TIMEOUT_MS = Number(opt("--timeout", "30000"));

let pass = 0;
let fail = 0;

function ok(label, detail = "") {
  pass += 1;
  console.log(`  ${paint(ANSI.green, "[PASS]")} ${label}${detail ? paint(ANSI.gray, ` — ${detail}`) : ""}`);
}
function failCheck(label, detail = "") {
  fail += 1;
  console.log(`  ${paint(ANSI.red, "[FAIL]")} ${label}${detail ? ` — ${detail}` : ""}`);
}
function info(msg) {
  console.log(paint(ANSI.gray, `  [ .... ] ${msg}`));
}

async function fetchJson(path, options = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(BASE + path, {
      ...options,
      signal: ctrl.signal,
      headers: { "content-type": "application/json", ...(options.headers || {}) },
    });
    let body = null;
    const text = await res.text();
    try {
      body = JSON.parse(text);
    } catch {
      body = { __raw: text.slice(0, 200) };
    }
    return { status: res.status, body };
  } catch (err) {
    return { status: 0, error: err.name === "AbortError" ? "zaman aşımı" : String(err.message || err) };
  } finally {
    clearTimeout(timer);
  }
}

function validateAgainstSchema(schemaPath, data) {
  if (spawnSync) {
    const res = spawnSync(
      process.execPath,
      [join(ROOT, "qa", "validate-schema.mjs"), "--schema", schemaPath, "--data", "-"],
      { input: JSON.stringify(data), encoding: "utf8" }
    );
    return {
      ok: (res.status ?? 1) === 0,
      out: `${res.stdout ?? ""}${res.stderr ?? ""}`.trim(),
    };
  }
  return { ok: false, out: "spawnSync yok" };
}

/* ------------------------------------------------------------------ */

console.log(
  paint(ANSI.bold, "\n  SeoRadar — Canlı Smoke Testi\n") +
    paint(ANSI.gray, `  Hedef: ${BASE}\n`) +
    paint(ANSI.gray, `  Analiz URL: ${TARGET_URL}\n`)
);

/* 1. GET /api/usage */
info("GET /api/usage");
const usageRes = await fetchJson("/api/usage");
if (usageRes.status === 0) {
  failCheck("GET /api/usage", `ulaşılamadı: ${usageRes.error}`);
  console.log(
    paint(ANSI.yellow, "\n  Sunucu ayakta değil. Başlatmak için:  node scripts/dev-all.mjs --only seoradar\n")
  );
  process.exit(1);
}
if (usageRes.status !== 200) {
  failCheck("GET /api/usage", `HTTP ${usageRes.status}`);
} else {
  const schemaCheck = validateAgainstSchema(USAGE_SCHEMA, usageRes.body);
  if (!schemaCheck.ok) {
    failCheck("GET /api/usage şeması", schemaCheck.out.split("\n")[0] ?? "uyuşmazlık");
  } else if (usageRes.body.ok !== true) {
    failCheck("GET /api/usage", "ok:true değil");
  } else if (typeof usageRes.body.usage?.used !== "number" || typeof usageRes.body.usage?.limit !== "number") {
    failCheck("GET /api/usage", "usage.used / usage.limit sayı değil");
  } else {
    ok("GET /api/usage", `plan=${usageRes.body.plan} ${usageRes.body.usage.used}/${usageRes.body.usage.limit}`);
  }
}

/* 2. POST /api/analyze — geçerli URL */
info(`POST /api/analyze → ${TARGET_URL}`);
const analyzeRes = await fetchJson("/api/analyze", {
  method: "POST",
  body: JSON.stringify({ url: TARGET_URL }),
});

if (analyzeRes.status !== 200) {
  failCheck("POST /api/analyze", `HTTP ${analyzeRes.status} — ${JSON.stringify(analyzeRes.body)?.slice(0, 160)}`);
} else {
  const r = analyzeRes.body;

  const schemaCheck = validateAgainstSchema(SCHEMA, r);
  if (!schemaCheck.ok) {
    failCheck("AnalysisResult şeması", schemaCheck.out.split("\n").slice(0, 3).join(" | "));
  } else {
    ok("AnalysisResult şeması");
  }

  // invariant: passed + warnings + errors === total
  const s = r.summary ?? {};
  if ((s.passed ?? 0) + (s.warnings ?? 0) + (s.errors ?? 0) !== (s.total ?? -1)) {
    failCheck(
      "summary invariant",
      `${s.passed}+${s.warnings}+${s.errors} ≠ ${s.total}`
    );
  } else {
    ok("summary invariant", `${s.passed}+${s.warnings}+${s.errors} = ${s.total}`);
  }

  // stabil check id'leri
  const REQUIRED_IDS = [
    "title", "meta-description", "h1", "heading-hierarchy",
    "images-alt", "images-dimensions", "links-structure", "links-broken",
    "https", "robots-txt", "sitemap", "open-graph", "twitter-card",
    "structured-data", "viewport", "html-lang", "canonical",
    "content-length", "hreflang", "html-weight",
  ];
  const ids = new Set((r.checks ?? []).map((c) => c.id));
  const missing = REQUIRED_IDS.filter((id) => !ids.has(id));
  if (missing.length) {
    failCheck("stabil check id'leri", `eksik: ${missing.join(", ")}`);
  } else {
    ok("stabil check id'leri", `${ids.size} kontrol`);
  }

  // skor / not
  if (typeof r.score !== "number" || r.score < 0 || r.score > 100) {
    failCheck("score aralığı", `gelen ${r.score}`);
  } else {
    ok("score aralığı", `${r.score} (${r.grade})`);
  }

  // plan / dailyUsage
  if (r.plan !== "free" && r.plan !== "pro") {
    failCheck("plan", `gelen ${r.plan}`);
  } else {
    ok("plan", r.plan);
  }
  if (typeof r.dailyUsage?.used !== "number" || typeof r.dailyUsage?.limit !== "number") {
    failCheck("dailyUsage", JSON.stringify(r.dailyUsage));
  } else {
    ok("dailyUsage", `${r.dailyUsage.used}/${r.dailyUsage.limit}`);
  }
}

/* 3. POST /api/analyze — geçersiz URL → 400 */
info("POST /api/analyze (geçersiz URL)");
const badRes = await fetchJson("/api/analyze", {
  method: "POST",
  body: JSON.stringify({ url: "javascript:alert(1)" }),
});
if (badRes.status !== 400) {
  failCheck("geçersiz URL → 400", `HTTP ${badRes.status}`);
} else {
  const schemaCheck = validateAgainstSchema(ERROR_SCHEMA, badRes.body);
  if (!schemaCheck.ok) {
    failCheck("AnalyzeError şeması", schemaCheck.out.split("\n")[0] ?? "uyuşmazlık");
  } else if (badRes.body.code !== "INVALID_URL") {
    failCheck("INVALID_URL kodu", `gelen ${badRes.body.code}`);
  } else {
    ok("geçersiz URL → 400 INVALID_URL");
  }
}

/* 4. Kota sınırı (opsiyonel) */
if (RUN_QUOTA) {
  info("kota sınırı testi (3+ istek)");
  let sawLimit = false;
  for (let i = 0; i < 6; i++) {
    const r = await fetchJson("/api/analyze", {
      method: "POST",
      body: JSON.stringify({ url: TARGET_URL }),
      headers: { "x-seoradar-plan": "free" },
    });
    if (r.status === 429) {
      sawLimit = true;
      const schemaCheck = validateAgainstSchema(ERROR_SCHEMA, r.body);
      if (!schemaCheck.ok) {
        failCheck("429 şeması", schemaCheck.out.split("\n")[0] ?? "uyuşmazlık");
      } else if (r.body.code !== "RATE_LIMIT") {
        failCheck("RATE_LIMIT kodu", `gelen ${r.body.code}`);
      } else {
        ok("429 RATE_LIMIT", `${r.body.dailyUsage?.used}/${r.body.dailyUsage?.limit}`);
      }
      break;
    }
  }
  if (!sawLimit) failCheck("kota sınırı", "6 istekte 429 görülmedi");
}

/* ------------------------------------------------------------------ */

console.log(
  `\n  ${paint(ANSI.green, `${pass} geçti`)} · ${paint(ANSI.red, `${fail} başarısız`)}\n`
);
if (fail > 0) {
  console.log(paint(ANSI.gray, "  İpucu: sunucu ayakta mı? →  node qa/health-all.mjs\n"));
}
process.exit(fail > 0 ? 1 : 0);