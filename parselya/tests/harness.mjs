/**
 * Sıfır-bağımlılık test koşucusu — Parselya birim testleri için.
 *
 * Kullanım:
 *   import { describe, it, expect, run } from "./harness.mjs";
 *   describe("formatSeconds", () => {
 *     it("0 saniye", () => { expect(formatSeconds(0)).toBe("00:0"); });
 *   });
 *   run();   // en sonda — süreci yönetir
 */

const suites = [];
let current = null;

export function describe(name, fn) {
  current = { name, tests: [] };
  suites.push(current);
  fn();
  current = null;
}

export function it(name, fn) {
  if (!current) throw new Error("it() yalnızca describe() içinde çağrılabilir");
  current.tests.push({ name, fn });
}

export function expect(actual) {
  return {
    toBe(expected) {
      if (!Object.is(actual, expected)) {
        throw new Error(`beklenen ${fmt(expected)}, gelen ${fmt(actual)}`);
      }
    },
    toEqual(expected) {
      const a = JSON.stringify(sortKeys(actual));
      const b = JSON.stringify(sortKeys(expected));
      if (a !== b) throw new Error(`beklenen ${b}, gelen ${a}`);
    },
    toBeCloseTo(expected, precision = 6) {
      const diff = Math.abs(actual - expected);
      const tol = Math.pow(10, -precision) / 2;
      if (!(diff <= tol)) {
        throw new Error(
          `beklenen ${fmt(expected)} ± ${tol}, gelen ${fmt(actual)} (fark ${diff})`,
        );
      }
    },
    toBeTruthy() {
      if (!actual) throw new Error(`doğru değer bekleniyordu, gelen ${fmt(actual)}`);
    },
    toBeFalsy() {
      if (actual) throw new Error(`yanlış değer bekleniyordu, gelen ${fmt(actual)}`);
    },
    toContain(item) {
      const ok =
        typeof actual === "string"
          ? actual.includes(item)
          : Array.isArray(actual) && actual.includes(item);
      if (!ok) throw new Error(`${fmt(item)} ${fmt(actual)} içinde bulunamadı`);
    },
    toBeGreaterThan(n) {
      if (!(actual > n)) throw new Error(`${fmt(actual)} > ${n} olmalı`);
    },
    toBeGreaterThanOrEqual(n) {
      if (!(actual >= n)) throw new Error(`${fmt(actual)} >= ${n} olmalı`);
    },
    toBeLessThan(n) {
      if (!(actual < n)) throw new Error(`${fmt(actual)} < ${n} olmalı`);
    },
    toBeLessThanOrEqual(n) {
      if (!(actual <= n)) throw new Error(`${fmt(actual)} <= ${n} olmalı`);
    },
    toMatch(re) {
      const regex = re instanceof RegExp ? re : new RegExp(re);
      if (!regex.test(String(actual))) {
        throw new Error(`${fmt(actual)} /${regex}/ ile eşleşmedi`);
      }
    },
    toThrow(substring) {
      let threw = false;
      let message = "";
      try {
        actual();
      } catch (err) {
        threw = true;
        message = String(err && err.message ? err.message : err);
      }
      if (!threw) throw new Error("fonksiyon hata fırlatmadı");
      if (substring && !message.includes(substring)) {
        throw new Error(`hata mesajı '${substring}' içermiyor: ${message}`);
      }
    },
  };
}

function fmt(v) {
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}

function sortKeys(v) {
  if (Array.isArray(v)) return v.map(sortKeys);
  if (v && typeof v === "object") {
    const out = {};
    for (const k of Object.keys(v).sort()) out[k] = sortKeys(v[k]);
    return out;
  }
  return v;
}

export async function run() {
  const ANSI = {
    reset: "\x1b[0m",
    bold: "\x1b[1m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    gray: "\x1b[90m",
  };
  const paint = (c, t) => `${c}${t}${ANSI.reset}`;

  let pass = 0;
  let fail = 0;
  const failures = [];

  for (const suite of suites) {
    console.log(paint(ANSI.bold, `\n  ${suite.name}`));
    for (const t of suite.tests) {
      try {
        await t.fn();
        pass += 1;
        console.log(`    ${paint(ANSI.green, "✓")} ${t.name}`);
      } catch (err) {
        fail += 1;
        failures.push({ suite: suite.name, name: t.name, err });
        console.log(`    ${paint(ANSI.red, "✗")} ${t.name}`);
        console.log(
          paint(ANSI.gray, `      ${err && err.message ? err.message : err}`),
        );
      }
    }
  }

  console.log(
    `\n  ${paint(ANSI.green, `${pass} geçti`)} · ${paint(ANSI.red, `${fail} başarısız`)}\n`,
  );
  process.exit(fail > 0 ? 1 : 0);
}
