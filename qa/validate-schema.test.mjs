#!/usr/bin/env node
/**
 * `qa/validate-schema.mjs` doğrulayıcısının kendi testleri.
 *
 * Amaç: sözleşmeleri tutan aracın doğru çalıştığını kanıtlamak.
 * Örnek yükleri hem geçerli hem geçersiz senaryolarla dener.
 *
 * Kullanım: node qa/validate-schema.test.mjs
 * Çıkış: 0 = hepsi geçti, 1 = en az bir başarısız.
 */

import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, unlinkSync, existsSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const VALIDATOR = join(ROOT, "qa", "validate-schema.mjs");
const SCHEMA_DIR = join(ROOT, "qa", "contracts");
const EXAMPLES = join(SCHEMA_DIR, "examples");
const TMP = join(ROOT, "qa", ".tmp-validate-schema.json");

const ANSI = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  gray: "\x1b[90m",
};
const paint = (c, t) => `${c}${t}${ANSI.reset}`;

const BASE_FOR = {
  "analysis-result.schema.json": "examples/analysis-result.ok.json",
  "usage-response.schema.json": "examples/usage-response.ok.json",
  "analysis-error.schema.json": "examples/analysis-error.rate-limit.json",
};

const CASES = [
  {
    label: "analysis-result.ok → geçerli",
    schema: "analysis-result.schema.json",
    data: "examples/analysis-result.ok.json",
    expectOk: true,
  },
  {
    label: "usage-response.ok → geçerli",
    schema: "usage-response.schema.json",
    data: "examples/usage-response.ok.json",
    expectOk: true,
  },
  {
    label: "analysis-error.rate-limit → geçerli",
    schema: "analysis-error.schema.json",
    data: "examples/analysis-error.rate-limit.json",
    expectOk: true,
  },
  {
    label: "summary invariant kırık (total ≠ passed+warnings+errors)",
    schema: "analysis-result.schema.json",
    mutate: (obj) => {
      obj.summary.total = 999;
      return obj;
    },
    expectOk: false,
    expectError: "toplam",
  },
  {
    label: "eksik zorunlu alan: checks",
    schema: "analysis-result.schema.json",
    mutate: (obj) => {
      delete obj.checks;
      return obj;
    },
    expectOk: false,
    expectError: "checks",
  },
  {
    label: "score sınır dışı (150)",
    schema: "analysis-result.schema.json",
    mutate: (obj) => {
      obj.score = 150;
      return obj;
    },
    expectOk: false,
    expectError: "score",
  },
  {
    label: "bilinmeyen severity değeri",
    schema: "analysis-result.schema.json",
    mutate: (obj) => {
      obj.checks[0].severity = "catastrophic";
      return obj;
    },
    expectOk: false,
    expectError: "severity",
  },
  {
    label: "checks listesi çok kısa (< 10)",
    schema: "analysis-result.schema.json",
    mutate: (obj) => {
      obj.checks = obj.checks.slice(0, 3);
      return obj;
    },
    expectOk: false,
    expectError: "checks",
  },
  {
    label: "usage.limit negatif",
    schema: "usage-response.schema.json",
    mutate: (obj) => {
      obj.usage.limit = -1;
      return obj;
    },
    expectOk: false,
    expectError: "limit",
  },
  {
    label: "plan enum dışı",
    schema: "usage-response.schema.json",
    mutate: (obj) => {
      obj.plan = "enterprise";
      return obj;
    },
    expectOk: false,
    expectError: "plan",
  },
  {
    label: "error.code enum dışı",
    schema: "analysis-error.schema.json",
    mutate: (obj) => {
      obj.code = "NUCLEAR";
      return obj;
    },
    expectOk: false,
    expectError: "code",
  },
  {
    label: "error mesajı boş",
    schema: "analysis-error.schema.json",
    mutate: (obj) => {
      obj.error = "";
      return obj;
    },
    expectOk: false,
    expectError: "error",
  },
];

function runValidator(schemaFile, dataPath) {
  const res = spawnSync(
    process.execPath,
    [VALIDATOR, "--schema", schemaFile, "--data", dataPath],
    { encoding: "utf8" }
  );
  return { code: res.status ?? 1, out: `${res.stdout ?? ""}${res.stderr ?? ""}` };
}

let pass = 0;
let fail = 0;

console.log(paint(ANSI.bold, "\n  validate-schema.mjs — öz-testler\n"));

for (const t of CASES) {
  const schemaPath = join(SCHEMA_DIR, t.schema);
  let dataPath;
  let usedTmp = false;

  if (t.data) {
    dataPath = join(SCHEMA_DIR, t.data);
  } else if (t.mutate) {
    const basePath = join(SCHEMA_DIR, BASE_FOR[t.schema]);
    const base = JSON.parse(readFileSync(basePath, "utf8"));
    const mutated = t.mutate(base);
    writeFileSync(TMP, JSON.stringify(mutated, null, 2));
    dataPath = TMP;
    usedTmp = true;
  } else {
    fail += 1;
    console.log(`  ${paint(ANSI.red, "[FAIL]")} ${t.label} — tanım hatası: data/mutate yok`);
    continue;
  }

  const { code, out } = runValidator(schemaPath, dataPath);
  const ok = t.expectOk ? code === 0 : code !== 0;
  const errorMentioned = !t.expectError || out.includes(t.expectError);
  const good = ok && errorMentioned;

  if (good) {
    pass += 1;
    console.log(`  ${paint(ANSI.green, "[PASS]")} ${t.label}`);
  } else {
    fail += 1;
    console.log(`  ${paint(ANSI.red, "[FAIL]")} ${t.label}`);
    console.log(
      paint(
        ANSI.gray,
        `         beklenen ${t.expectOk ? "geçti" : "kaldı"}${t.expectError ? `, hata mesajında '${t.expectError}'` : ""} · alınan çıkış=${code}`
      )
    );
    if (out.trim()) console.log(paint(ANSI.gray, `         çıktı: ${out.trim().split("\n")[0]}`));
  }

  if (usedTmp && existsSync(TMP)) {
    try {
      unlinkSync(TMP);
    } catch {
      /* yoksay */
    }
  }
}

console.log(
  `\n  ${paint(ANSI.green, `${pass} geçti`)} · ${paint(ANSI.red, `${fail} başarısız`)}\n`
);
process.exit(fail > 0 ? 1 : 0);