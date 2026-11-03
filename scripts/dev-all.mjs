#!/usr/bin/env node
// Tüm SaaS projelerini paralel geliştirme modunda başlatan yardımcı script.
// Sıfır bağımlılık, Node ESM. Windows ve POSIX uyumlu.
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();
const APPS = [
  { name: 'seoradar', port: 3002 },
  { name: 'konvertlab', port: 3001 },
  { name: 'terneon', port: 3003 },
  { name: 'parselya', port: 3004 },
];

// Basit argüman ayrıştırıcı
const args = process.argv.slice(2);
let only = null;
let basePort = null;
let skipInstall = false;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--only' && args[i + 1]) {
    only = args[i + 1];
    i++;
  } else if (args[i] === '--port' && args[i + 1]) {
    basePort = parseInt(args[i + 1], 10);
    i++;
  } else if (args[i] === '--skip-install') {
    skipInstall = true;
  }
}

const COLORS = {
  seoradar: '\x1b[36m', // cyan
  konvertlab: '\x1b[33m', // yellow
  terneon: '\x1b[35m', // magenta
  parselya: '\x1b[32m', // green
};
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';

function colorFor(name) {
  return COLORS[name] ?? '\x1b[90m';
}

function log(name, text) {
  const c = colorFor(name);
  const lines = String(text).split(/\r?\n/);
  for (const line of lines) {
    process.stdout.write(`${c}[${name}]${RESET} ${line}\n`);
  }
}

// Hangi uygulamalar çalışacak?
let selected = APPS;
if (only) {
  const found = APPS.filter((a) => a.name === only);
  if (found.length === 0) {
    console.error(`Hata: "${only}" adında bir uygulama yok. Geçerli isimler: ${APPS.map((a) => a.name).join(', ')}`);
    process.exit(1);
  }
  selected = found;
  if (basePort !== null) selected = selected.map((a) => ({ ...a, port: basePort }));
}

// Dizin/package.json kontrolü
const runnable = [];
for (const app of selected) {
  const dir = path.join(ROOT, app.name);
  const pkg = path.join(dir, 'package.json');
  if (!existsSync(dir) || !existsSync(pkg)) {
    console.warn(`\x1b[33mUyarı: "${app.name}" dizini veya package.json dosyası bulunamadı, atlanıyor.\x1b[0m`);
    continue;
  }
  runnable.push({ ...app, dir });
}
if (runnable.length === 0) {
  console.error('Başlatılacak uygulama kalmadı.');
  process.exit(1);
}

// Başlangıç bandı
console.log('');
console.log(`${BOLD}SaaS Suite — Geliştirme Modu${RESET}`);
console.log(`${DIM}────────────────────────────────────────────${RESET}`);
for (const app of runnable) {
  console.log(`  ${colorFor(app.name)}●${RESET} ${app.name.padEnd(12)} http://localhost:${app.port}`);
}
console.log(`${DIM}────────────────────────────────────────────${RESET}`);
console.log(`${DIM}Durdurmak için Ctrl+C tuşlayın.${RESET}`);
console.log('');

const children = [];
let shuttingDown = false;

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log('\nKapatılıyor...');
  for (const child of children) {
    if (child && !child.killed) {
      try {
        child.kill('SIGTERM');
      } catch {}
    }
  }
  // Windows'ta ağaç sonlandırma için kısa bekleme
  setTimeout(() => process.exit(code), 500);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

function run(cmd, cmdArgs, cwd, env, label) {
  const child = spawn(cmd, cmdArgs, {
    cwd,
    env: { ...process.env, ...env },
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  child.stdout.on('data', (d) => log(label, d.toString().replace(/\r?\n$/, '')));
  child.stderr.on('data', (d) => log(label, d.toString().replace(/\r?\n$/, '')));
  child.on('error', (err) => log(label, `Hata: ${err.message}`));
  child.on('exit', (code2) => {
    if (!shuttingDown) log(label, `süreç sonlandı (kod: ${code2 ?? 'null'})`);
  });
  return child;
}

for (const app of runnable) {
  const nm = path.join(app.dir, 'node_modules');
  if (!existsSync(nm)) {
    if (skipInstall) {
      log(app.name, 'node_modules yok ve --skip-install verildi; npm install atlandı.');
    } else {
      log(app.name, 'node_modules bulunamadı, npm install çalıştırılıyor...');
      const inst = run('npm', ['install'], app.dir, {}, app.name);
      await new Promise((resolve) => inst.on('exit', resolve));
    }
  }
  log(app.name, `başlatılıyor → http://localhost:${app.port}`);
  const child = run(
    'npm',
    ['run', 'dev', '--', '-p', String(app.port)],
    app.dir,
    { PORT: String(app.port), NODE_ENV: 'development' },
    app.name
  );
  children.push(child);
}
