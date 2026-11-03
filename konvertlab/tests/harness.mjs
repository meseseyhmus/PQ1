/**
 * Küçük, bağımlılıksız test koşucusu (describe / it / expect).
 * Hiçbir npm paketi kullanmaz; saf Node ile çalışır.
 *
 * Kullanım:
 *   import { describe, it, expect, run } from "./harness.mjs";
 *   describe("konu", () => { it("durum", () => { expect(1).toBe(1); }); });
 *   run();
 */

let currentSuite = null;
const suites = [];

export function describe(name, fn) {
  const suite = { name, tests: [] };
  suites.push(suite);
  const previous = currentSuite;
  currentSuite = suite;
  try {
    fn();
  } finally {
    currentSuite = previous;
  }
}

export function it(name, fn) {
  if (!currentSuite) {
    throw new Error(`it("${name}") bir describe() bloğu içinde çağrılmalı`);
  }
  currentSuite.tests.push({ name, fn });
}

function fail(message) {
  const err = new Error(message);
  err.name = "AssertionError";
  throw err;
}

export function expect(actual) {
  const matchers = {
    toBe(expected) {
      if (actual !== expected) {
        fail(`beklenen: ${inspect(expected)}, gelen: ${inspect(actual)}`);
      }
    },
    toEqual(expected) {
      if (!deepEqual(actual, expected)) {
        fail(`beklenen (derin): ${inspect(expected)}, gelen: ${inspect(actual)}`);
      }
    },
    toBeTruthy() {
      if (!actual) fail(`doğruluk bekleniyordu, gelen: ${inspect(actual)}`);
    },
    toBeFalsy() {
      if (actual) fail(`yanlışlık bekleniyordu, gelen: ${inspect(actual)}`);
    },
    toBeNull() {
      if (actual !== null) fail(`null bekleniyordu, gelen: ${inspect(actual)}`);
    },
    toContain(item) {
      const found =
        typeof actual === "string"
          ? actual.includes(item)
          : Array.isArray(actual) && actual.some((x) => deepEqual(x, item));
      if (!found) {
        fail(`${inspect(actual)} içinde ${inspect(item)} bulunamadı`);
      }
    },
    toHaveLength(n) {
      if (actual == null || actual.length !== n) {
        fail(`uzunluk ${n} bekleniyordu, gelen: ${inspect(actual?.length)}`);
      }
    },
    toMatch(re) {
      if (typeof re === "string" ? !actual.includes(re) : !re.test(actual)) {
        fail(`${inspect(actual)} kalıbı karşılamıyor: ${re}`);
      }
    },
    toBeCloseTo(expected, precision = 2) {
      if (Math.abs(actual - expected) > Math.pow(10, -precision) / 2) {
        fail(`${actual}, ${expected} değerine yeterince yakın değil`);
      }
    },
    toThrow() {
      let threw = false;
      try {
        actual();
      } catch {
        threw = true;
      }
      if (!threw) fail("hata fırlatılması bekleniyordu");
    },
  };

  // `expect(x).not.toContain(y)` gibi olumsuz doğrulamalar.
  matchers.not = {
    toBe(expected) {
      if (actual === expected) fail(`beklenmiyordu: ${inspect(expected)}`);
    },
    toEqual(expected) {
      if (deepEqual(actual, expected)) fail(`beklenmiyordu (derin): ${inspect(expected)}`);
    },
    toBeTruthy() {
      if (actual) fail(`yanlışlık bekleniyordu, gelen: ${inspect(actual)}`);
    },
    toBeFalsy() {
      if (!actual) fail(`doğruluk beklenmiyordu, gelen: ${inspect(actual)}`);
    },
    toBeNull() {
      if (actual === null) fail("null beklenmiyordu");
    },
    toContain(item) {
      const found =
        typeof actual === "string"
          ? actual.includes(item)
          : Array.isArray(actual) && actual.some((x) => deepEqual(x, item));
      if (found) fail(`${inspect(actual)} içinde ${inspect(item)} bulundu (beklenmiyordu)`);
    },
    toHaveLength(n) {
      if (actual != null && actual.length === n) fail(`uzunluk ${n} beklenmiyordu`);
    },
    toMatch(re) {
      const hit = typeof re === "string" ? actual.includes(re) : re.test(actual);
      if (hit) fail(`${inspect(actual)} kalıbıyla eşleşti (beklenmiyordu): ${re}`);
    },
    toThrow() {
      try {
        actual();
      } catch {
        fail("hata fırlattı (beklenmiyordu)");
      }
    },
  };

  return matchers;
}

function inspect(value) {
  try {
    return typeof value === "string" ? JSON.stringify(value) : String(value);
  } catch {
    return String(value);
  }
}

function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== typeof b || a === null || b === null) return false;
  if (typeof a !== "object") return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  return ka.every(
    (k) => Object.hasOwn(b, k) && deepEqual(a[k], b[k])
  );
}

/** Tüm kayıtlı suitleri çalıştırır; hata varsa süreç 1 ile, yoksa 0 ile biter. */
export async function run() {
  let passed = 0;
  const failures = [];
  for (const suite of suites) {
    for (const test of suite.tests) {
      try {
        await test.fn();
        passed++;
        console.log(`  ✓ ${suite.name} › ${test.name}`);
      } catch (err) {
        failures.push({ suite: suite.name, test: test.name, err });
        console.error(`  ✗ ${suite.name} › ${test.name}`);
        console.error(`      ${err.message}`);
      }
    }
  }
  const total = passed + failures.length;
  console.log(`\n${total} test: ${passed} geçti, ${failures.length} kaldı`);
  if (failures.length > 0) {
    process.exitCode = 1;
  }
}
