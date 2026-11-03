#!/usr/bin/env node
/**
 * SeoRadar / KonvertLab / Terneon / Parselya — uçtan uca sözleşmeler
 * (contract) denetleyici.
 *
 * Bu betik her uygulamayı AYRI AYRI doğrular:
 *   1. Dizin + package.json + beklenen script'ler var mı?
 *   2. package.json'daki bağımlılık sürümleri beklenen majörler mi?
 *   3. Temel kaynak dosyaları yerinde mi?
 *   4. (opsiyonel) --run-build ile her app tek tek `npm run build` edilir.
 *
 * Kullanım:
 *   node qa/run-all.mjs
 *   node qa/run-all.mjs --only seoradar
 *   node qa/run-all.mjs --run-build
 *   node qa/run-all.mjs --skip-install --run-build
 *
 * Çıkış kodu: 0 = hepsi geçti, 1 = en az bir denetim başarısız.
 */

import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

/* ------------------------------------------------------------------ */
/*  Uygulama sözleşmeleri (her proje ayrıdır — bağımsız package.json)  */
/* ------------------------------------------------------------------ */

const APPS = [
  {
    name: "seoradar",
    dir: "seoradar",
    port: 3002,
    deps: {
      next: 15,
      react: 19,
      "react-dom": 19,
      cheerio: 1,
      jspdf: 2,
      "lucide-react": 0,
    },
    devDeps: { tailwindcss: 3, typescript: 5 },
    scripts: ["dev", "build", "start"],
    requiredFiles: [
      "app/page.tsx",
      "app/layout.tsx",
      "app/globals.css",
      "app/robots.ts",
      "app/sitemap.ts",
      "app/api/analyze/route.ts",
      "lib/analyze.ts",
      "lib/pdf.ts",
      "lib/rateLimit.ts",
      "types/index.ts",
      "tailwind.config.ts",
    ],
  },
  {
    name: "konvertlab",
    dir: "konvertlab",
    port: 3001,
    deps: {
      next: 15,
      react: 19,
      "react-dom": 19,
      jspdf: 2,
      "pdfjs-dist": 4,
      "lucide-react": 0,
    },
    devDeps: { tailwindcss: 3, typescript: 5 },
    scripts: ["dev", "build", "start"],
    requiredFiles: [
      "app/page.tsx",
      "app/layout.tsx",
      "app/robots.ts",
      "app/sitemap.ts",
      "components/TxtToPdfPanel.tsx",
      "components/PdfToTxtPanel.tsx",
      "components/YoutubeToolsPanel.tsx",
      "lib/pdfGenerate.ts",
      "lib/pdfExtract.ts",
      "lib/srtParse.ts",
    ],
    // %100 istemci tarafı: sunucu API'si olmamalı, dosyalar yüklenmemeli.
    forbidApiRoutes: true,
  },
  {
    name: "terneon",
    dir: "terneon",
    port: 3003,
    deps: {
      next: 15,
      react: 19,
      "react-dom": 19,
      "framer-motion": 11,
      "lucide-react": 0,
    },
    devDeps: { tailwindcss: 3, typescript: 5 },
    scripts: ["dev", "build", "start"],
    requiredFiles: [
      "app/page.tsx",
      "app/layout.tsx",
      "app/robots.ts",
      "app/sitemap.ts",
      "config/siteConfig.ts",
      "lib/whatsapp.ts",
      "components/Hero.tsx",
      "components/Footer.tsx",
    ],
  },
  {
    name: "parselya",
    dir: "parselya",
    port: 3004,
    deps: { next: 15, react: 19, "react-dom": 19, "lucide-react": 0 },
    devDeps: { tailwindcss: 3, typescript: 5 },
    scripts: ["dev", "build", "start"],
    requiredFiles: [
      "app/page.tsx",
      "app/layout.tsx",
      "app/robots.ts",
      "app/sitemap.ts",
      "state/EditorContext.tsx",
      "lib/exportVideo.ts",
      "lib/geo.ts",
      "lib/camera.ts",
      "components/ParcelCanvas.tsx",
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Yardımcılar                                                        */
/* ------------------------------------------------------------------ */

const ANSI = {
  reset: "[0m",
  dim: "[2m",
  bold: "[1m",
  red: "[31m",
  green: "[32m",
  yellow: "[33m",
  blue: "[34m",
  magenta: "[35m",
  cyan: "[36m",
  gray: "[90m",
};

const COLOR_BY_APP = {
  seoradar: ANSI.cyan,
  konvertlab: ANSI.magenta,
  terneon: ANSI.blue,
  parselya: ANSI.green,
};

function paint(color, text) {
  return `${color}${text}${ANSI.reset}`;
}

let passCount = 0;
let failCount = 0;
const failures = [];

function ok(label, detail = "") {
  passCount += 1;
  console.log(`  ${paint(ANSI.green, "[PASS]")} ${label}${detail ? paint(ANSI.gray, ` — ${detail}`) : ""}`);
}

function fail(label, detail = "") {
  failCount += 1;
  failures.push({ label, detail });
  console.log(`  ${paint(ANSI.red, "[FAIL]")} ${label}${detail ? ` — ${detail}` : ""}`);
}

function info(label) {
  console.log(`  ${paint(ANSI.gray, "[ .... ]")} ${label}`);
}

function majorOf(range) {
  // "^15.1.6" | "15.1.6" | "~3.4.17" → 15 | 15 | 3
  const cleaned = String(range).replace(/^[\^~>=<\s]+/, "");
  const major = Number.parseInt(cleaned.split(".")[0], 10);
  return Number.isFinite(major) ? major : null;
}

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (err) {
    return { __error: err.message };
  }
}

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

function listSourceFiles(dir) {
  const out = [];
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
      else if (/\.(ts|tsx|mjs|js)$/.test(e.name)) out.push(p);
    }
  }
  return out;
}

function findCrossImports(appDir, appNames) {
  // Bir uygulamanın kaynak kodu başka bir uygulamanın dizinine dokunmamalı.
  const offenders = [];
  const others = appNames.filter((n) => n !== undefined);
  for (const file of listSourceFiles(appDir)) {
    let text;
    try {
      text = readFileSync(file, "utf8");
    } catch {
      continue;
    }
    for (const other of others) {
      // ../konvertlab, @/../terneon, "..\\\\parselya" gibi kalıplar
      const re = new RegExp(
        String.raw`(\.\./)+${other}|@/${other}|['"\`]${other}/|from\s+['"][^'"]*${other}`,
        "i"
      );
      if (re.test(text)) {
        offenders.push({ file, other });
      }
    }
  }
  return offenders;
}

function hasApiRoutes(appDir) {
  const apiDir = join(appDir, "app", "api");
  if (!existsSync(apiDir)) return false;
  return listSourceFiles(apiDir).some((f) => /route\.(ts|tsx|js|mjs)$/.test(f));
}

function run(cmd, args, opts = {}) {
  return new Promise((resolvePromise) => {
    const child = spawn(cmd, args, {
      cwd: opts.cwd,
      shell: true,
      stdio: opts.quiet ? "pipe" : "inherit",
      env: { ...process.env, ...(opts.env || {}) },
    });
    let out = "";
    if (opts.quiet && child.stdout) {
      child.stdout.on("data", (d) => (out += d.toString()));
      child.stderr?.on("data", (d) => (out += d.toString()));
    }
    child.on("error", (err) => resolvePromise({ code: 1, out: String(err) }));
    child.on("close", (code) => resolvePromise({ code: code ?? 1, out }));
  });
}

/* ------------------------------------------------------------------ */
/*  Argümanlar                                                         */
/* ------------------------------------------------------------------ */

const argv = process.argv.slice(2);
function flag(name) {
  return argv.includes(name);
}
function opt(name, fallback) {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
}

const only = opt("--only", null);
const runBuild = flag("--run-build");
const skipInstall = flag("--skip-install");

const selected = only ? APPS.filter((a) => a.name === only) : APPS;

if (only && selected.length === 0) {
  console.error(paint(ANSI.red, `Bilinmeyen uygulama: ${only}`));
  console.error(`Geçerli değerler: ${APPS.map((a) => a.name).join(", ")}`);
  process.exit(2);
}

/* ------------------------------------------------------------------ */
/*  Ana akış                                                           */
/* ------------------------------------------------------------------ */

console.log(
  paint(ANSI.bold, "\n  SaaS Paketi — Sözleşme Denetimi\n") +
    paint(ANSI.gray, `  Kök: ${ROOT}\n`) +
    paint(ANSI.gray, `  Node: ${process.version} · ${process.platform}\n`)
);

for (const app of selected) {
  const color = COLOR_BY_APP[app.name] ?? ANSI.gray;
  console.log(
    `\n${paint(color, "━━━")} ${paint(ANSI.bold, app.name)} ${paint(ANSI.gray, `(${app.dir}/ · port ${app.port})`)} ${paint(color, "━━━")}`
  );

  const appDir = join(ROOT, app.dir);

  /* 1. dizin */
  if (!existsSync(appDir) || !statSync(appDir).isDirectory()) {
    fail("Dizin mevcut", app.dir);
    continue;
  }
  ok("Dizin mevcut", app.dir);

  /* 2. package.json */
  const pkgPath = join(appDir, "package.json");
  if (!existsSync(pkgPath)) {
    fail("package.json mevcut");
    continue;
  }
  const pkg = readJson(pkgPath);
  if (pkg.__error) {
    fail("package.json parse edilebilir", pkg.__error);
    continue;
  }
  ok("package.json parse edilebilir", `name=${pkg.name ?? "?"}`);

  /* 3. script'ler */
  const missingScripts = app.scripts.filter((s) => !pkg.scripts?.[s]);
  if (missingScripts.length) {
    fail("Gerekli npm script'leri", `eksik: ${missingScripts.join(", ")}`);
  } else {
    ok("Gerekli npm script'leri", app.scripts.join(", "));
  }

  /* 3b. port sabitlemesi — dev/start komutları kendi portunu yazmalı */
  for (const scriptName of ["dev", "start"]) {
    const cmd = pkg.scripts?.[scriptName];
    if (!cmd) continue;
    const portMatch = String(cmd).match(/-p\s+(\d+)/);
    if (!portMatch) {
      fail(
        `Port sabiti: ${scriptName}`,
        `"${cmd}" içinde -p yok (beklenen -p ${app.port})`
      );
    } else if (Number(portMatch[1]) !== app.port) {
      fail(
        `Port sabiti: ${scriptName}`,
        `bulunan -p ${portMatch[1]}, beklenen -p ${app.port}`
      );
    } else {
      ok(`Port sabiti: ${scriptName}`, `-p ${app.port}`);
    }
  }

  /* 4. bağımlılık sürümleri */
  for (const [dep, expectedMajor] of Object.entries(app.deps)) {
    const range = pkg.dependencies?.[dep];
    if (!range) {
      fail(`Bağımlılık: ${dep}`, "package.json'da yok");
      continue;
    }
    const major = majorOf(range);
    if (major !== expectedMajor) {
      fail(`Bağımlılık: ${dep}`, `beklenen majör ${expectedMajor}, bulunan ${range}`);
    } else {
      ok(`Bağımlılık: ${dep}`, range);
    }
  }
  for (const [dep, expectedMajor] of Object.entries(app.devDeps)) {
    const range = pkg.devDependencies?.[dep] ?? pkg.dependencies?.[dep];
    if (!range) {
      fail(`Dev bağımlılık: ${dep}`, "package.json'da yok");
      continue;
    }
    const major = majorOf(range);
    if (major !== expectedMajor) {
      fail(`Dev bağımlılık: ${dep}`, `beklenen majör ${expectedMajor}, bulunan ${range}`);
    } else {
      ok(`Dev bağımlılık: ${dep}`, range);
    }
  }

  /* 5. beklenen kaynak dosyaları */
  const missingFiles = app.requiredFiles.filter(
    (f) => !existsSync(join(appDir, f))
  );
  if (missingFiles.length) {
    fail("Beklenen kaynak dosyaları", `eksik: ${missingFiles.join(", ")}`);
  } else {
    ok("Beklenen kaynak dosyaları", `${app.requiredFiles.length} dosya`);
  }

  /* 6. kaynak dosyası sayısı */
  const srcCount = countSources(appDir);
  if (srcCount >= 15) {
    ok("Kaynak dosyası sayısı", `${srcCount} .ts/.tsx`);
  } else {
    fail("Kaynak dosyası sayısı", `çok az: ${srcCount}`);
  }

  /* 7. node_modules */
  const hasNodeModules = existsSync(join(appDir, "node_modules"));
  ok("node_modules", hasNodeModules ? "kurulu" : "kurulu değil (npm install gerekli)");

  /* 7a. README — her bağımsız app kendi belgesini taşır */
  const readmePath = join(appDir, "README.md");
  if (existsSync(readmePath)) {
    ok("README.md mevcut", `${app.dir}/README.md`);
  } else {
    fail("README.md mevcut", `${app.dir}/README.md yok`);
  }

  /* 7d. konteyner sözleşmesi — Dockerfile + .dockerignore + docker-compose.yml ve port sabitleri */
  const containerFiles = ["Dockerfile", ".dockerignore", "docker-compose.yml"];
  const missingContainer = containerFiles.filter((f) => !existsSync(join(appDir, f)));
  if (missingContainer.length) {
    fail("Konteyner dosyaları", `eksik: ${missingContainer.join(", ")}`);
  } else {
    ok("Konteyner dosyaları", "Dockerfile + .dockerignore + docker-compose.yml");
  }

  const dockerfilePath = join(appDir, "Dockerfile");
  if (existsSync(dockerfilePath)) {
    const content = readFileSync(dockerfilePath, "utf8");
    const portStr = String(app.port);
    const hasExpose = content.includes(`EXPOSE ${portStr}`);
    const hasEnvPort = content.includes(`PORT=${portStr}`);
    const hasHealth = content.includes(`:${portStr}/`);
    if (hasExpose && hasEnvPort && hasHealth) {
      ok("Konteyner port sabiti: Dockerfile", `EXPOSE/PORT/HEALTHCHECK ${app.port}`);
    } else {
      fail(
        "Konteyner port sabiti: Dockerfile",
        `beklenen port ${app.port} (EXPOSE:${hasExpose}, PORT:${hasEnvPort}, HEALTH:${hasHealth})`
      );
    }
  }

  const composePath = join(appDir, "docker-compose.yml");
  if (existsSync(composePath)) {
    const content = readFileSync(composePath, "utf8");
    const portStr = String(app.port);
    const hasPortMap = content.includes(`"${portStr}:${portStr}"`);
    const hasEnvPort = new RegExp(`PORT:\\s*${portStr}`).test(content);
    const hasHealth = content.includes(`:${portStr}/`);
    if (hasPortMap && hasEnvPort && hasHealth) {
      ok("Konteyner port sabiti: docker-compose.yml", `ports/PORT/healthcheck ${app.port}`);
    } else {
      fail(
        "Konteyner port sabiti: docker-compose.yml",
        `beklenen port ${app.port} (ports:${hasPortMap}, PORT:${hasEnvPort}, healthcheck:${hasHealth})`
      );
    }
  }

  /* 7b. izolelik: başka uygulamaya çapraz import */
  const otherNames = APPS.map((a) => a.dir).filter((d) => d !== app.dir);
  const cross = findCrossImports(appDir, otherNames);
  if (cross.length) {
    fail(
      "Uygulamalar arası izolelik",
      cross
        .slice(0, 3)
        .map((c) => `${c.file.replace(ROOT, "")} → ${c.other}`)
        .join("; ")
    );
  } else {
    ok("Uygulamalar arası izolelik", "çapraz import yok");
  }

  /* 7c. yasaklar (opsiyonel) */
  if (app.forbidApiRoutes) {
    if (hasApiRoutes(appDir)) {
      fail("Sunucu API'si yasak", "app/api altında route.ts bulundu (istemci-side olmalı)");
    } else {
      ok("Sunucu API'si yasak", "app/api yok — %100 istemci tarafı");
    }
  }

  /* 7e. SEO meta sözleşmesi — layout'ta JSON-LD + Open Graph bulunmalı */
  const layoutPath = join(appDir, "app", "layout.tsx");
  if (existsSync(layoutPath)) {
    let layoutText = "";
    try {
      layoutText = readFileSync(layoutPath, "utf8");
    } catch {
      /* okunamadıysa aşağıda fail düşer */
    }
    const seoMissing = [];
    if (!/application\/ld\+json/i.test(layoutText)) seoMissing.push("JSON-LD");
    if (!/openGraph/i.test(layoutText)) seoMissing.push("Open Graph");
    if (!/name:\s*["']description["']|description:/i.test(layoutText)) {
      seoMissing.push("description");
    }
    if (seoMissing.length) {
      fail("SEO meta sözleşmesi", `layout.tsx eksik: ${seoMissing.join(", ")}`);
    } else {
      ok("SEO meta sözleşmesi", "JSON-LD + Open Graph + description");
    }
  } else {
    fail("SEO meta sözleşmesi", "app/layout.tsx yok");
  }

  /* 8. derleme */
  if (runBuild) {
    if (!hasNodeModules && !skipInstall) {
      info(`${app.name}: npm install çalıştırılıyor…`);
      const install = await run("npm", ["install", "--no-audit", "--no-fund"], {
        cwd: appDir,
      });
      if (install.code !== 0) {
        fail("npm install", `çıkış kodu ${install.code}`);
        continue;
      }
      ok("npm install");
    }
    info(`${app.name}: npm run build…`);
    const t0 = Date.now();
    const build = await run("npm", ["run", "build"], {
      cwd: appDir,
      env: { NODE_OPTIONS: "--max-old-space-size=4096" },
    });
    const secs = ((Date.now() - t0) / 1000).toFixed(1);
    if (build.code === 0) {
      ok("npm run build", `${secs} sn`);
    } else {
      fail("npm run build", `çıkış kodu ${build.code} (${secs} sn)`);
    }
  }
}

/* ------------------------------------------------------------------ */
/*  Özet                                                               */
/* ------------------------------------------------------------------ */

console.log(`\n${paint(ANSI.bold, "━━━━━━━━━━━━━━ ÖZET ━━━━━━━━━━━━━━")}`);
console.log(
  `  ${paint(ANSI.green, `${passCount} geçti`)} · ${paint(ANSI.red, `${failCount} başarısız`)}`
);

if (failCount > 0) {
  console.log(`\n  ${paint(ANSI.red, "Başarısız denetimler:")}`);
  for (const f of failures) {
    console.log(`   • ${f.label}${f.detail ? ` — ${f.detail}` : ""}`);
  }
}

console.log(
  paint(
    ANSI.gray,
    `\n  İpucu: her projeyi ayrı çalıştırın →  node scripts/dev-all.mjs --only ${selected[0]?.name ?? "seoradar"}\n`
  )
);

process.exit(failCount > 0 ? 1 : 0);