const trFormatter = new Intl.NumberFormat("tr-TR");

export function formatNumberTR(n: number): string {
  return trFormatter.format(Math.round(n));
}

export function formatPriceTL(n: number): string {
  return `${formatNumberTR(n)} ₺`;
}

export function formatM2(n: number): string {
  return `${formatNumberTR(n)} m²`;
}

export function formatSeconds(t: number): string {
  const s = Math.max(0, t);
  const whole = Math.floor(s);
  const tenths = Math.floor((s - whole) * 10);
  return `${String(whole).padStart(2, "0")}:${tenths}`;
}

export function parseAlan(raw: unknown): number {
  if (raw === null || raw === undefined) return 0;
  if (typeof raw === "number") return raw;
  let alanStr = String(raw).trim();
  if (!alanStr) return 0;

  const hasDot = alanStr.includes(".");
  const hasComma = alanStr.includes(",");

  if (hasDot && hasComma) {
    const lastDot = alanStr.lastIndexOf(".");
    const lastComma = alanStr.lastIndexOf(",");
    if (lastComma > lastDot) {
      // Türkçe format: "4.483,39" -> nokta binlik, virgül ondalık
      alanStr = alanStr.replace(/\./g, "").replace(",", ".");
    } else {
      // İngilizce format: "4,483.39" -> virgül binlik, nokta ondalık
      alanStr = alanStr.replace(/,/g, "");
    }
  } else if (hasComma && !hasDot) {
    // Yalnız virgül: "4483,39" -> "4483.39"
    alanStr = alanStr.replace(",", ".");
  }

  const val = parseFloat(alanStr);
  return isNaN(val) ? 0 : val;
}
