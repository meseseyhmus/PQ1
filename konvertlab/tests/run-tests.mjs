/**
 * Tüm konvertlab birim testlerini çalıştıran giriş noktası.
 * Her test dosyasını AYRI bir node sürecinde çalıştırır ki
 * hatalar ve process.exit etkileri izole kalmasın.
 *
 * Kullanım: node tests/run-tests.mjs
 */

import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));

// --import için dosya URL'si şart; Windows'ta "C:\..." yolu şema hatası verir.
const REGISTER = pathToFileURL(join(HERE, "register.mjs")).href;

const testFiles = readdirSync(HERE)
  .filter((f) => f.endsWith(".test.mjs"))
  .sort();

if (testFiles.length === 0) {
  console.error("Çalıştırılacak test dosyası bulunamadı.");
  process.exit(1);
}

let failed = false;
for (const file of testFiles) {
  const entry = join(HERE, file);
  console.log(`\n▶ ${file}`);
  const result = spawnSync(
    process.execPath,
    ["--import", REGISTER, entry],
    { stdio: "inherit", encoding: "utf8" }
  );
  if (result.status !== 0) {
    failed = true;
    console.error(`✗ ${file} BAŞARISIZ (exit ${result.status})`);
  } else {
    console.log(`✓ ${file} geçti`);
  }
}

if (failed) {
  console.error("\nBAZI TESTLER BAŞARISIZ");
  process.exit(1);
}
console.log("\nTÜM TESTLER GEÇTİ");
