#!/usr/bin/env node
/**
 * Dört uygulamanın birim testlerini sırayla koşturur.
 * Her uygulama kendi `tests/run-tests.mjs` koşucusuna sahiptir (bağımsızlık);
 * bu script yalnızca onları keşfeder ve çalıştırır.
 *
 * Kullanım:
 *   node scripts/test-all.mjs
 *   node scripts/test-all.mjs --only seoradar
 *   node scripts/test-all.mjs --only konvertlab,terneon
 *
 * Çıkış kodu: 0 = hepsi geçti, 1 = en az biri başarısız, 2 = koşacak test yok.
 * Ağ erişimi gerekmez.
 */

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const ANSI = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  gray: "\x1b[90m",
};
const paint = (c, t) => `${c}${t}${ANSI.reset}`;

const APPS = ["seoradar", "konvertlab", "terneon", "parselya"];

const argv = process.argv.slice(2);
const onlyIdx = argv.indexOf("--only");
const onlyRaw = onlyIdx >= 0 ? argv[onlyIdx + 1] : null;
const onlyList = onlyRaw
  ? onlyRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  : null;

const targets = APPS.filter((a) => !onlyList || onlyList.includes(a)).map((app) => ({
  app,
  rel: `${app}/tests/run-tests.mjs`,
}));

const runnable = targets.filter((t) => existsSync(join(ROOT, t.rel)));
const missing = targets.filter((t) => !existsSync(join(ROOT, t.rel)));

console.log(
  paint(ANSI.bold, "\n  SaaS Paketi — Birim Testleri\n") +
    paint(ANSI.gray, `  ${runnable.length}/${targets.length} uygulamada test paketi · Node ${process.version}\n`)
);

for (const m of missing) {
  console.log(paint(ANSI.yellow, `  ATLA  ${m.app.padEnd(12)} ${m.rel} yok`));
}

if (runnable.length === 0) {
  console.error(paint(ANSI.red, "\n  Çalıştırılabilir test paketi yok.\n"));
  process.exit(2);
}

const results = [];
for (const t of runnable) {
  console.log(paint(ANSI.bold, `\n━━━ ${t.app} ━━━`));
  const res = spawnSync(process.execPath, [join(ROOT, t.rel)], {
    cwd: ROOT,
    encoding: "utf8",
    env: { ...process.env, NODE_NO_WARNINGS: "1" },
    stdio: "inherit",
  });
  const code = res.status ?? 1;
  results.push({ app: t.app, code });
}

const failed = results.filter((r) => r.code !== 0);

console.log(`\n${paint(ANSI.bold, "  ──── ÖZET ────")}`);
for (const r of results) {
  console.log(
    `    ${r.code === 0 ? paint(ANSI.green, "GEÇTİ") : paint(ANSI.red, "KALDI ")}  ${r.app.padEnd(12)}`
  );
}
console.log(
  `\n  ${paint(ANSI.green, `${results.length - failed.length} uygulama geçti`)} · ` +
    `${paint(ANSI.red, `${failed.length} uygulama kaldı`)}\n`
);

// Windows'ta process.exit() libuv doğrulamasını tetikleyebilir.
process.exitCode = failed.length > 0 ? 1 : 0;