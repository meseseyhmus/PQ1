/**
 * SSRF koruması: kullanıcı tarafından verilen (veya taranan sayfadan gelen)
 * URL'lerin sunucu tarafı fetch edilmeden önce "kamuya açık" bir hedefi
 * gösterdiğini doğrular.
 *
 * Engellenen hedefler:
 *  - localhost / *.localhost / *.internal / *.local gibi iç alan adları
 *  - Özel kullanıma ayrılmış IPv4 aralıkları (127/8, 10/8, 172.16/12,
 *    192.168/16, 169.254/16 bağlantı-yerel + bulut metadata, 0/8, 100.64/10)
 *  - IPv6 karşılıkları (::1, fc00::/7, fe80::/10, ::ffff: <IPv4 eşlenmiş>)
 *  - Onluk/sekizlik/onaltılık yazımlar (ör. 2130706433, 0x7f000001, 0177.0.0.1)
 *    — bunlar fetch katmanında 127.0.0.1 olarak çözümlenir.
 *
 * NOT: DNS rebinding (halka açık adın özel IP'ye çözümlenmesi) bu katmanda
 * tam olarak engellenemez; üretimde çözümleme sonrası IP kontrolü yapan bir
 * fetch proxy önerilir. Buradaki koruma bariz iç ağ hedeflerini kapatır.
 */

const BLOCKED_HOST_SUFFIXES = [".localhost", ".internal", ".local", ".home.arpa"];

/** inet_aton benzeri: onluk/sekizlik/onaltılık ve kısa yazımları 32-bit sayıya çevirir. */
function parseIPv4Like(host: string): number | null {
  if (!host) return null;
  const parts = host.split(".");
  if (parts.length < 1 || parts.length > 4) return null;

  const values: number[] = [];
  for (const part of parts) {
    // Sekizlik (0177), onaltılık (0x7f) ve onluk (127) yazımların hepsi
    // fetch/DNS katmanında IP olarak çözümlenebilir — hepsini ayrıştır.
    let n: number;
    if (/^0[xX][0-9a-fA-F]+$/.test(part)) n = parseInt(part, 16);
    else if (/^0[0-7]+$/.test(part)) n = parseInt(part, 8);
    else if (/^\d+$/.test(part)) n = parseInt(part, 10);
    else return null;
    if (!Number.isFinite(n) || n < 0) return null;
    values.push(n);
  }

  const last = values[values.length - 1]!;
  let acc = 0;
  for (let i = 0; i < values.length - 1; i++) {
    const v = values[i]!;
    if (v > 0xff) return null;
    acc = (acc << 8) | v;
  }
  // Son bileşen kalan baytları doldurur (127.1 → 127.0.0.1, 2130706433 → 127.0.0.1).
  // Dikkat: JS bit kaydırması 32 bitte mod alınır; sınır için çarpma kullan.
  const remainingBytes = 4 - (values.length - 1);
  const lastCap = 256 ** remainingBytes;
  if (last >= lastCap) return null;
  if (last > 0xffffffff) return null;
  return (((acc * 256 ** remainingBytes) >>> 0) | last) >>> 0;
}

function isPrivateIPv4(ip: number): boolean {
  const b1 = (ip >>> 24) & 0xff;
  const b2 = (ip >>> 16) & 0xff;
  return (
    b1 === 0 || // 0.0.0.0/8 — "bu makine"
    b1 === 10 || // 10.0.0.0/8
    b1 === 127 || // 127.0.0.0/8 — loopback
    (b1 === 100 && b2 >= 64 && b2 <= 127) || // 100.64.0.0/10 — CGNAT
    (b1 === 169 && b2 === 254) || // 169.254.0.0/16 — bağlantı-yerel / metadata
    (b1 === 172 && b2 >= 16 && b2 <= 31) || // 172.16.0.0/12
    b1 === 192 && b2 === 168 || // 192.168.0.0/16
    (b1 === 198 && (b2 === 18 || b2 === 19)) // 198.18.0.0/15 — benchmark
  );
}

function isBlockedIPv6(host: string): boolean {
  // "[::1]" biçimindeki parantezleri URL zaten soyuyor; yine de temizle.
  const h = host.replace(/^\[|\]$/g, "").toLowerCase();
  if (h === "::" || h === "::1") return true; // belirsiz / loopback
  if (h.startsWith("fc") || h.startsWith("fd")) return true; // fc00::/7 — unique-local
  if (h.startsWith("fe8") || h.startsWith("fe9") || h.startsWith("fea") || h.startsWith("feb"))
    return true; // fe80::/10 — bağlantı-yerel
  // ::ffff:0:0/96 — IPv4 eşlenmiş adresler; iç IPv4'a çevirip kontrol et.
  const mapped = h.match(/^::ffff:(?:0:)?(\d{1,3}(?:\.\d{1,3}){3})$/);
  if (mapped) {
    const ip = parseIPv4Like(mapped[1]!);
    if (ip !== null) return isPrivateIPv4(ip);
  }
  return false;
}

export function isBlockedHostname(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/\.$/, "");
  if (!host) return true;
  if (host === "localhost" || host === "0.0.0.0") return true;
  if (BLOCKED_HOST_SUFFIXES.some((s) => host.endsWith(s))) return true;

  const ipv4 = parseIPv4Like(host);
  if (ipv4 !== null) return isPrivateIPv4(ipv4);
  if (host.includes(":")) return isBlockedIPv6(host);
  return false;
}

/**
 * URL'nin http/https protokollü ve engellenmemiş bir hedefe işaret olduğunu
 * doğrular. Geçersizse BLOCKED_TARGET kodlu hata fırlatır (route katmanı
 * bunu sözleşmedeki INVALID_URL koduna haritalar).
 */
export function assertPublicHttpUrl(raw: string): URL {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    throw Object.assign(new Error("Geçersiz URL."), { code: "BLOCKED_TARGET" });
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") {
    throw Object.assign(
      new Error("Yalnızca http ve https adresleri analiz edilebilir."),
      { code: "BLOCKED_TARGET" }
    );
  }
  if (isBlockedHostname(u.hostname)) {
    throw Object.assign(
      new Error(
        "Bu adres analiz edilemez: iç ağ, loopback veya metadata hedefleri engellenmiştir."
      ),
      { code: "BLOCKED_TARGET" }
    );
  }
  return u;
}
