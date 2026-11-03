#!/usr/bin/env node
/**
 * Tek komutla tam doğrulama zinciri (CI girişi).
 *
 * Sıra:
 *   1. Sözleşme denetimi        →  node qa/run-all.mjs
 *   2. Birim testleri           →  her uygulamanın tests/run-tests.mjs'i (varsa)
 *   3. Şema örnek doğrulaması   →  node qa/validate-schema.mjs (örnek yükler)
 *   4. Derleme (dört app)       →  node scripts/build-all.mjs   (--skip-build ile atlanır)
 *
 * Kullanım:
 *   node scripts/verify-all.mjs
 *   node scripts/verify-all.mjs --skip-build          # hızlı, derlemez
 *   node scripts/verify-all.mjs --only seoradar        # tek app'e sınırlı derleme
 *   node scripts/verify-all.mjs --skip-install
 *
 * Çıkış kodu: 0 = her katman geçti, 1 = en az bir katman başarısız.
 * Ağ erişimi gerekmez (yalnızca yerel npm).
 */

import { spawn } from "node:child_process";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const ANSI = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
};
const paint = (c, t) => `${c}${t}${ANSI.reset}`;

const argv = process.argv.slice(2);
const flag = (n) => argv.includes(n);
const opt = (n, fallback) => {
  const i = argv.indexOf(n);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : fallback;
};

const skipBuild = flag("--skip-build");
const skipInstall = flag("--skip-install");
const only = opt("--only", null);

/**
 * @param {string} label
 * @param {string} cmd
 * @param {string[]} args
 * @returns {Promise<number>} exit code
 */
function step(label, cmd, args) {
  return new Promise((res) => {
    const t0 = Date.now();
    console.log(
      `\n${paint(ANSI.bold, "▶")} ${paint(ANSI.cyan, label)} ${paint(ANSI.gray, `(${cmd} ${args.join(" ")})`)}`
    );
    const child = spawn(cmd, args, {
      cwd: ROOT,
      shell: true,
      stdio: "inherit",
      env: { ...process.env, NODE_OPTIONS: "--max-old-space-size=4096" },
    });
    child.on("error", (err) => {
      console.log(paint(ANSI.red, `  başlatılamadı: ${err.message}`));
      res(1);
    });
    child.on("close", (code) => {
      const secs = ((Date.now() - t0) / 1000).toFixed(1);
      const okCode = code === 0;
      console.log(
        okCode
          ? paint(ANSI.green, `✓ ${label} geçti`) + paint(ANSI.gray, ` (${secs} sn)`)
          : paint(ANSI.red, `✗ ${label} başarısız — çıkış ${code}`) + paint(ANSI.gray, ` (${secs} sn)`)
      );
      res(code ?? 1);
    });
  });
}

/* ------------------------------------------------------------------ */
/*  Şema örnek yükleri — her koşu doğrulanır (derlemeden bağımsız)      */
/* ------------------------------------------------------------------ */

const SCHEMA_CASES = [
  {
    label: "analysis-result.ok.json",
    schema: "qa/contracts/analysis-result.schema.json",
    data: "qa/contracts/examples/analysis-result.ok.json",
  },
  {
    label: "usage-response.ok.json",
    schema: "qa/contracts/usage-response.schema.json",
    data: "qa/contracts/examples/usage-response.ok.json",
  },
  {
    label: "analysis-error.rate-limit.json",
    schema: "qa/contracts/analysis-error.schema.json",
    data: "qa/contracts/examples/analysis-error.rate-limit.json",
  },
];

async function validateSchemas() {
  const results = [];
  for (const c of SCHEMA_CASES) {
    const schemaPath = join(ROOT, c.schema);
    const dataPath = join(ROOT, c.data);
    if (!existsSync(schemaPath) || !existsSync(dataPath)) {
      results.push({ ...c, code: 0, skipped: true });
      continue;
    }
    const code = await step(
      `Şema: ${c.label}`,
      "node",
      ["qa/validate-schema.mjs", "--schema", c.schema, "--data", c.data]
    );
    results.push({ ...c, code, skipped: false });
  }
  return results;
}

/* ------------------------------------------------------------------ */
/*  Ana akış                                                           */
/* ------------------------------------------------------------------ */

console.log(
  paint(ANSI.bold, "\n  SaaS Paketi — Tam Doğrulama Zinciri\n") +
    paint(ANSI.gray, `  Kök: ${ROOT}\n`) +
    paint(ANSI.gray, `  Node: ${process.version} · ${process.platform}\n`) +
    paint(
      ANSI.gray,
      `  Adımlar: sözleşme → birim → şema → ${skipBuild ? paint(ANSI.yellow, "derleme ATLANDI") : "derleme"}\n`
    )
);

const summary = [];
let failed = false;

/* 0. Doğrulayıcı öz-testi (varsa) */
{
  const selfTest = join(ROOT, "qa", "validate-schema.test.mjs");
  if (existsSync(selfTest)) {
    const code = await step("0/4 Şema doğrulayıcı öz-testi", "node", ["qa/validate-schema.test.mjs"]);
    summary.push({ name: "Doğrulayıcı", code });
    if (code !== 0) failed = true;
  } else {
    summary.push({ name: "Doğrulayıcı", code: 0, skipped: true });
  }
}

/* 1. Sözleşme */
{
  const code = await step("1/4 Sözleşme denetimi", "node", ["qa/run-all.mjs"]);
  summary.push({ name: "Sözleşme", code });
  if (code !== 0) failed = true;
}

/* 2. Birim testleri — her uygulamanın kendi tests/run-tests.mjs'i (varsa) */
{
  const APPS = ["seoradar", "konvertlab", "terneon", "parselya"];
  const runners = APPS.map((a) => ({ app: a, rel: `${a}/tests/run-tests.mjs` })).filter(
    (r) => existsSync(join(ROOT, r.rel))
  );
  if (runners.length === 0) {
    console.log(`\n${paint(ANSI.yellow, "▶ 2/4 Birim testleri")} ${paint(ANSI.gray, "— hiçbir uygulamada tests/run-tests.mjs yok, atlandı")}`);
    summary.push({ name: "Birim", code: 0, skipped: true });
  } else {
    let unitCode = 0;
    for (const r of runners) {
      const code = await step(`2/4 Birim testleri · ${r.app}`, "node", [r.rel]);
      if (code !== 0) unitCode = 1;
    }
    summary.push({ name: "Birim", code: unitCode });
    if (unitCode !== 0) failed = true;
  }
}

/* 3. Şema örnekleri */
{
  console.log(`\n${paint(ANSI.bold, "▶")} ${paint(ANSI.cyan, "3/4 Şema örnek doğrulaması")}`);
  const results = await validateSchemas();
  const ran = results.filter((r) => !r.skipped);
  const bad = results.filter((r) => r.code !== 0);
  const code = bad.length ? 1 : 0;
  if (ran.length === 0) {
    console.log(paint(ANSI.gray, "  örnek yük yok, atlandı"));
    summary.push({ name: "Şema", code: 0, skipped: true });
  } else {
    summary.push({ name: "Şema", code, skipped: false });
    if (code !== 0) failed = true;
  }
}

/* 4. Derleme */
{
  if (skipBuild) {
    console.log(`\n${paint(ANSI.yellow, "▶ 4/4 Derleme")} ${paint(ANSI.gray, "— --skip-build ile atlandı")}`);
    summary.push({ name: "Derleme", code: 0, skipped: true });
  } else {
    const args = ["scripts/build-all.mjs"];
    if (only) args.push("--only", only);
    if (skipInstall) args.push("--skip-install");
    const code = await step("4/4 Derleme (dört app)", "node", args);
    summary.push({ name: "Derleme", code });
    if (code !== 0) failed = true;
  }
}

/* ------------------------------------------------------------------ */
/*  Özet                                                               */
/* ------------------------------------------------------------------ */

console.log(`\n${paint(ANSI.bold, "━━━━━━━━━━━━━━ ÖZET ━━━━━━━━━━━━━━")}`);
for (const s of summary) {
  const mark = s.skipped
    ? paint(ANSI.yellow, "ATLA")
    : s.code === 0
      ? paint(ANSI.green, "GEÇTİ")
      : paint(ANSI.red, "KALDI ");
  const note = s.skipped ? paint(ANSI.gray, " (atlandı)") : s.code === 0 ? "" : paint(ANSI.red, ` (çıkış ${s.code})`);
  console.log(`  ${mark}  ${s.name}${note}`);
}

console.log(
  failed
    ? `\n  ${paint(ANSI.red, "Doğrulama zinciri BAŞARISIZ.")}\n`
    : `\n  ${paint(ANSI.green, "Doğrulama zinciri tamamlandı.")}\n`
);

process.exit(failed ? 1 : 0);