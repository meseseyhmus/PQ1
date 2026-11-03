#!/usr/bin/env node
/**
 * Sayfa içerik smoke'u — dört uygulamanın ana sayfasını indirir ve
 * markaya özgü ayırt edici içerik parçalarının HTML'de bulunduğunu doğrular.
 *
 * `qa/health-all.mjs` yalnızca "200 dönüyor mu"ya bakar; bu betik
 * "doğru uygulama ayakta mı, gövde boş mu, indexlenebilir mi" sorusunu cevaplar:
 * ayırt edici Türkçe içerik + SEO meta (title/description/OG/JSON-LD) +
 * `/robots.txt` + `/sitemap.xml`.
 *
 * Kullanım:
 *   node scripts/smoke-pages.mjs
 *   node scripts/smoke-pages.mjs --only seoradar,terneon
 *   node scripts/smoke-pages.mjs --timeout 15000
 *
 * Çıkış kodu: 0 = hepsi geçti, 1 = en az bir başarısız.
 * Yalnızca localhost'a istek atar (3001–3004). Harici ağ yok.
 */

const ANSI = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  gray: "\x1b[90m",
};
const paint = (c, t) => `${c}${t}${ANSI.reset}`;

/**
 * Her uygulama için: port, yol ve HTML'de BULUNMASI gereken parçalar.
 * Parçalar Türkçe metinden veya veri niteliğinden seçilmiştir; kurulum
 * gerektirmez, sabit bir şekilde doğrulanabilir.
 */
const APPS = [
  {
    name: "seoradar",
    port: 3002,
    path: "/",
    mustContain: ["SEO", "analiz", "http"],
  },
  {
    name: "konvertlab",
    port: 3001,
    path: "/",
    mustContain: ["PDF", "TXT"],
  },
  {
    name: "terneon",
    port: 3003,
    path: "/",
    mustContain: ["fiyat", "WhatsApp"],
  },
  {
    name: "parselya",
    port: 3004,
    path: "/",
    mustContain: ["ada", "video", "animasyon"],
  },
];

/**
 * Her canlı sayfada bulunması gereken SEO/JSON-LD işaretleri.
 * Bunlar "uygulama ayakta mı"nın ötesinde "indexlenebilir mi" sorusunu
 * doğrular — organik trafik gelir modelinin temeli.
 */
const META_MARKERS = [
  { label: "<title>", needle: "<title" },
  { label: "meta description", needle: 'name="description"' },
  { label: "Open Graph", needle: 'property="og:' },
  { label: "JSON-LD", needle: "application/ld+json" },
];

const argv = process.argv.slice(2);
const opt = (n, fallback) => {
  const i = argv.indexOf(n);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : fallback;
};
const onlyRaw = opt("--only", null);
const onlyList = onlyRaw
  ? onlyRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  : null;
const timeoutMs = Number(opt("--timeout", "15000")) || 15000;

const targets = APPS.filter((a) => !onlyList || onlyList.includes(a.name));
if (targets.length === 0) {
  console.error(paint(ANSI.red, `Hiç uygulama seçilmedi (--only ${onlyRaw})`));
  process.exit(2);
}

console.log(
  paint(ANSI.bold, "\n  SaaS Paketi — Sayfa İçerik Smoke'u\n") +
    paint(ANSI.gray, `  ${targets.length} uygulama · zaman aşımı ${timeoutMs} ms\n`)
);

/**
 * @param {string} url
 * @returns {Promise<{status:number, body:string}>}
 */
async function fetchPage(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      redirect: "follow",
      headers: { accept: "text/html,application/xhtml+xml" },
    });
    const body = await res.text();
    return { status: res.status, body };
  } finally {
    clearTimeout(timer);
  }
}

const results = [];

for (const app of targets) {
  const url = `http://127.0.0.1:${app.port}${app.path}`;
  process.stdout.write(`  ${paint(ANSI.gray, "▶")} ${app.name.padEnd(12)} :${app.port}${app.path} … `);

  let status = 0;
  let body = "";
  try {
    const r = await fetchPage(url);
    status = r.status;
    body = r.body;
  } catch (err) {
    const reason = err?.name === "AbortError" ? "zaman aşımı" : (err?.cause?.code || err?.message || "bağlantı hatası");
    console.log(paint(ANSI.red, "KALDI") + paint(ANSI.gray, ` — ${reason}`));
    results.push({ app: app.name, ok: false, reason });
    continue;
  }

  if (status !== 200) {
    console.log(paint(ANSI.red, "KALDI") + paint(ANSI.gray, ` — HTTP ${status}`));
    results.push({ app: app.name, ok: false, reason: `HTTP ${status}` });
    continue;
  }

  // Büyük/küçük harf duyarsız arama; Türkçe metinler HTML'de farklı
  // kodlanmış olabilir (ör. doğrudan UTF-8), bu yüzden ham gövdede bakıyoruz.
  const haystack = body.toLowerCase();
  const missing = app.mustContain.filter((needle) => !haystack.includes(needle.toLowerCase()));

  if (body.trim().length < 200) {
    console.log(paint(ANSI.red, "KALDI") + paint(ANSI.gray, ` — gövde boş (${body.trim().length} bayt)`));
    results.push({ app: app.name, ok: false, reason: "boş gövde" });
    continue;
  }

  if (missing.length > 0) {
    console.log(
      paint(ANSI.red, "KALDI") +
        paint(ANSI.gray, ` — eksik içerik: ${missing.map((m) => `"${m}"`).join(", ")}`)
    );
    results.push({ app: app.name, ok: false, reason: `eksik: ${missing.join(", ")}` });
    continue;
  }

  // SEO / JSON-LD işaretleri — sayfa indexlenebilir olmalı.
  const missingMeta = META_MARKERS.filter((m) => !haystack.includes(m.needle.toLowerCase()));
  if (missingMeta.length > 0) {
    console.log(
      paint(ANSI.red, "KALDI") +
        paint(
          ANSI.gray,
          ` — eksik SEO meta: ${missingMeta.map((m) => m.label).join(", ")}`
        )
    );
    results.push({
      app: app.name,
      ok: false,
      reason: `eksik meta: ${missingMeta.map((m) => m.label).join(", ")}`,
    });
    continue;
  }

  // robots.txt + sitemap.xml — tarayıcılar sayfayı bulamıyorsa meta boştur.
  const origin = `http://127.0.0.1:${app.port}`;
  const robotsFail = await checkRobots(origin);
  if (robotsFail) {
    console.log(paint(ANSI.red, "KALDI") + paint(ANSI.gray, ` — ${robotsFail}`));
    results.push({ app: app.name, ok: false, reason: robotsFail });
    continue;
  }
  const sitemapFail = await checkSitemap(origin);
  if (sitemapFail) {
    console.log(paint(ANSI.red, "KALDI") + paint(ANSI.gray, ` — ${sitemapFail}`));
    results.push({ app: app.name, ok: false, reason: sitemapFail });
    continue;
  }

  console.log(
    paint(ANSI.green, "GEÇTİ") +
      paint(
        ANSI.gray,
        ` — HTTP 200 · ${body.length} bayt · ${app.mustContain.length} işaret · ${META_MARKERS.length} meta · robots+sitemap`
      )
  );
  results.push({
    app: app.name,
    ok: true,
    reason: `HTTP 200 · ${body.length} bayt · meta ${META_MARKERS.length}/${META_MARKERS.length} · robots+sitemap`,
  });
}

/**
 * `GET /robots.txt` 200 dönmeli ve `user-agent` / `allow` (veya `disallow`)
 * satırı içermeli. Next.js `app/robots.ts` bunu üretir.
 * @param {string} origin
 * @returns {Promise<string|null>} başarısızlık nedeni, yoksa null
 */
async function checkRobots(origin) {
  try {
    const res = await fetch(`${origin}/robots.txt`, {
      headers: { accept: "text/plain" },
    });
    if (res.status !== 200) return `robots.txt HTTP ${res.status}`;
    const text = (await res.text()).toLowerCase();
    if (!text.includes("user-agent")) return "robots.txt User-Agent satırı yok";
    return null;
  } catch (err) {
    return `robots.txt alınamadı: ${err?.message || "hata"}`;
  }
}

/**
 * `GET /sitemap.xml` 200 dönmeli, `<urlset` veya `<sitemapindex` köküne ve
 * en az bir `<loc>` girdisine sahip olmalı.
 * @param {string} origin
 * @returns {Promise<string|null>} başarısızlık nedeni, yoksa null
 */
async function checkSitemap(origin) {
  try {
    const res = await fetch(`${origin}/sitemap.xml`, {
      headers: { accept: "application/xml,text/xml" },
    });
    if (res.status !== 200) return `sitemap.xml HTTP ${res.status}`;
    const text = await res.text();
    const lower = text.toLowerCase();
    if (!lower.includes("<urlset") && !lower.includes("<sitemapindex")) {
      return "sitemap.xml urlset/sitemapindex kökü yok";
    }
    if (!lower.includes("<loc>")) return "sitemap.xml <loc> girdisi yok";
    return null;
  } catch (err) {
    return `sitemap.xml alınamadı: ${err?.message || "hata"}`;
  }
}

const failed = results.filter((r) => !r.ok);

console.log(`\n${paint(ANSI.bold, "  ──── ÖZET ────")}`);
for (const r of results) {
  console.log(
    `    ${r.ok ? paint(ANSI.green, "GEÇTİ") : paint(ANSI.red, "KALDI ")}  ${r.app.padEnd(12)} ${r.reason}`
  );
}
console.log(
  `\n  ${paint(ANSI.green, `${results.length - failed.length} geçti`)} · ` +
    `${paint(ANSI.red, `${failed.length} kaldı`)}\n` +
    paint(ANSI.gray, "  İpucu: uygulamaları başlat →  node scripts/dev-all.mjs\n")
);

// Windows'ta process.exit() bekleyen handle'lar kapanırken libuv
// doğrulaması tetikleyebiliyor. process.exitCode bırakıp doğal çıkışı bekle.
process.exitCode = failed.length > 0 ? 1 : 0;