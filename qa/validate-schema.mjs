#!/usr/bin/env node
/**
 * JSON Schema (draft-07 alt kümesi) doğrulayıcı — sıfır bağımlılık.
 *
 * Desteklenen anahtarlar:
 *   type, properties, required, additionalProperties, items, enum,
 *   minimum, maximum, exclusiveMinimum, exclusiveMaximum, minLength,
 *   pattern, $ref (yalnızca "#/definitions/<ad>"), definitions,
 *   oneOf / anyOf (yalın), format ("date-time" için yalnızca uyarı),
 *   x-invariants (alanlar arası toplam eşitliği)
 *
 * Kullanım:
 *   node qa/validate-schema.mjs --schema qa/contracts/analysis-result.schema.json --data path/to/payload.json
 *   node qa/validate-schema.mjs --schema ... --data -            (stdin)
 *   curl -s -X POST ... | node qa/validate-schema.mjs --schema ... --data -
 *
 * Çıkış kodu: 0 = geçerli, 1 = geçersiz, 2 = kullanım hatası.
 */

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
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

/* ------------------------------------------------------------------ */
/*  Argümanlar                                                         */
/* ------------------------------------------------------------------ */

const argv = process.argv.slice(2);
function opt(name, fallback = null) {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
}

const schemaPath = opt("--schema");
const dataPath = opt("--data");

if (!schemaPath || !dataPath) {
  console.error(
    paint(
      ANSI.red,
      "Kullanım: node qa/validate-schema.mjs --schema <schema.json> --data <payload.json|->"
    )
  );
  process.exit(2);
}

function loadJson(path) {
  const raw = path === "-" ? readFileSync(0, "utf8") : readFileSync(path, "utf8");
  return JSON.parse(raw);
}

let schema;
let data;
try {
  schema = loadJson(schemaPath);
} catch (err) {
  console.error(paint(ANSI.red, `Şema okunamadı: ${err.message}`));
  process.exit(2);
}
try {
  data = loadJson(dataPath);
} catch (err) {
  console.error(paint(ANSI.red, `Veri okunamadı: ${err.message}`));
  process.exit(2);
}

/* ------------------------------------------------------------------ */
/*  Doğrulayıcı                                                        */
/* ------------------------------------------------------------------ */

const errors = [];

function typeOf(v) {
  if (v === null) return "null";
  if (Array.isArray(v)) return "array";
  if (Number.isInteger(v)) return "integer";
  return typeof v; // string | number | boolean | object
}

function resolveRef(ref, root) {
  if (typeof ref !== "string" || !ref.startsWith("#/")) return null;
  const parts = ref.slice(2).split("/");
  let cur = root;
  for (const p of parts) {
    if (cur && typeof cur === "object" && p in cur) cur = cur[p];
    else return null;
  }
  return cur;
}

function validate(node, sch, path, root) {
  if (!sch || typeof sch !== "object") return;

  // $ref
  if (sch.$ref) {
    const target = resolveRef(sch.$ref, root);
    if (!target) {
      errors.push({ path, message: `çözülemeyen $ref: ${sch.$ref}` });
      return;
    }
    validate(node, target, path, root);
    return;
  }

  // type
  if (sch.type) {
    const allowed = Array.isArray(sch.type) ? sch.type : [sch.type];
    const actual = typeOf(node);
    const ok = allowed.some((t) => {
      if (t === "number") return actual === "number" || actual === "integer";
      return t === actual;
    });
    if (!ok) {
      errors.push({
        path,
        message: `type uyuşmazlığı: beklenen ${allowed.join("|")}, gelen ${actual}`,
      });
      return; // alt anahtarları kontrol etme
    }
  }

  // enum
  if (Array.isArray(sch.enum) && !sch.enum.includes(node)) {
    errors.push({
      path,
      message: `enum dışında: ${JSON.stringify(node)} (izin: ${sch.enum.map((e) => JSON.stringify(e)).join(", ")})`,
    });
  }

  // string
  if (typeof node === "string") {
    if (typeof sch.minLength === "number" && node.length < sch.minLength) {
      errors.push({ path, message: `minLength ${sch.minLength}, uzunluk ${node.length}` });
    }
    if (typeof sch.maxLength === "number" && node.length > sch.maxLength) {
      errors.push({ path, message: `maxLength ${sch.maxLength}, uzunluk ${node.length}` });
    }
    if (typeof sch.pattern === "string") {
      let re;
      try {
        re = new RegExp(sch.pattern);
      } catch {
        re = null;
      }
      if (re && !re.test(node)) {
        errors.push({ path, message: `pattern eşleşmedi: /${sch.pattern}/` });
      }
    }
  }

  // number / integer
  if (typeof node === "number") {
    if (typeof sch.minimum === "number" && node < sch.minimum) {
      errors.push({ path, message: `minimum ${sch.minimum}, gelen ${node}` });
    }
    if (typeof sch.maximum === "number" && node > sch.maximum) {
      errors.push({ path, message: `maximum ${sch.maximum}, gelen ${node}` });
    }
    if (typeof sch.exclusiveMinimum === "number" && node <= sch.exclusiveMinimum) {
      errors.push({
        path,
        message: `exclusiveMinimum ${sch.exclusiveMinimum}, gelen ${node}`,
      });
    }
    if (typeof sch.exclusiveMaximum === "number" && node >= sch.exclusiveMaximum) {
      errors.push({
        path,
        message: `exclusiveMaximum ${sch.exclusiveMaximum}, gelen ${node}`,
      });
    }
    if (sch.type === "integer" && !Number.isInteger(node)) {
      errors.push({ path, message: `integer olmalı, gelen ${node}` });
    }
  }

  // array
  if (Array.isArray(node)) {
    if (typeof sch.minItems === "number" && node.length < sch.minItems) {
      errors.push({ path, message: `minItems ${sch.minItems}, uzunluk ${node.length}` });
    }
    if (typeof sch.maxItems === "number" && node.length > sch.maxItems) {
      errors.push({ path, message: `maxItems ${sch.maxItems}, uzunluk ${node.length}` });
    }
    if (sch.items) {
      node.forEach((item, i) => validate(item, sch.items, `${path}[${i}]`, root));
    }
  }

  // object
  if (node && typeof node === "object" && !Array.isArray(node)) {
    const props = sch.properties || {};
    const required = Array.isArray(sch.required) ? sch.required : [];

    for (const key of required) {
      if (!(key in node)) {
        errors.push({ path: `${path}.${key}`, message: "zorunlu alan eksik" });
      }
    }

    for (const [key, value] of Object.entries(node)) {
      if (props[key]) {
        validate(value, props[key], `${path}.${key}`, root);
      } else if (sch.additionalProperties === false) {
        errors.push({
          path: `${path}.${key}`,
          message: "additionalProperties=false — tanımsız alan",
        });
      } else if (
        sch.additionalProperties &&
        typeof sch.additionalProperties === "object"
      ) {
        validate(value, sch.additionalProperties, `${path}.${key}`, root);
      }
    }
  }

  // oneOf / anyOf (yalın: en az biri geçerli olmalı)
  for (const key of ["oneOf", "anyOf"]) {
    if (Array.isArray(sch[key])) {
      const before = errors.length;
      let matched = false;
      for (const sub of sch[key]) {
        const mark = errors.length;
        validate(node, sub, path, root);
        if (errors.length === mark) {
          matched = true;
          break;
        }
        // başarısız denemeleri geri al
        errors.length = mark;
      }
      if (!matched) {
        errors.push({ path, message: `${key} dallarından hiçbiri geçerli değil` });
      }
      void before;
    }
  }
}

validate(data, schema, "$", schema);

/* ------------------------------------------------------------------ */
/*  x-invariants — alanlar arası kurallar (JSON Schema ile ifade edilemeyen) */
/*                                                                      */
/*  Şemada:                                                              */
/*    "x-invariants": [                                                  */
/*      { "sum": ["summary.passed", "summary.warnings", "summary.errors"], */
/*        "equals": "summary.total",                                     */
/*        "message": "summary toplamı tutarlı olmalı" }                  */
/*    ]                                                                  */
/* ------------------------------------------------------------------ */

function getPath(obj, dotted) {
  let cur = obj;
  for (const part of dotted.split(".")) {
    if (cur === null || cur === undefined || typeof cur !== "object") return undefined;
    cur = cur[part];
  }
  return cur;
}

if (Array.isArray(schema["x-invariants"])) {
  for (const inv of schema["x-invariants"]) {
    if (inv && inv.sum && inv.equals) {
      const parts = inv.sum.map((p) => getPath(data, p));
      const target = getPath(data, inv.equals);
      const missing = inv.sum.some((p) => getPath(data, p) === undefined);
      const targetMissing = target === undefined;
      if (missing || targetMissing) {
        errors.push({
          path: "$",
          message: inv.message || `x-invariant: eksik alan (${inv.sum.join(", ")} / ${inv.equals})`,
        });
        continue;
      }
      const total = parts.reduce((a, b) => a + Number(b), 0);
      if (total !== Number(target)) {
        errors.push({
          path: `$.${inv.equals}`,
          message:
            inv.message ||
            `x-invariant: ${inv.sum.join(" + ")} = ${total}, fakat ${inv.equals} = ${target}`,
        });
      }
    }
  }
}

/* ------------------------------------------------------------------ */
/*  Çıktı                                                              */
/* ------------------------------------------------------------------ */

if (errors.length === 0) {
  console.log(
    paint(ANSI.green, "[PASS]") +
      ` Şema doğrulaması geçti — ${paint(ANSI.gray, schema.title || schemaPath)}`
  );
  process.exit(0);
}

console.log(
  paint(ANSI.red, "[FAIL]") +
    ` ${errors.length} şema hatası — ${paint(ANSI.gray, schema.title || schemaPath)}`
);
for (const e of errors.slice(0, 50)) {
  console.log(`  ${paint(ANSI.yellow, e.path)}: ${e.message}`);
}
if (errors.length > 50) {
  console.log(paint(ANSI.gray, `  … ve ${errors.length - 50} hata daha`));
}
process.exit(1);