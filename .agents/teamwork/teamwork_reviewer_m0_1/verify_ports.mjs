import fs from 'node:fs';
import path from 'node:path';

const root = 'c:\\Users\\HUAWEI\\Desktop\\saas';

function walk(dir) {
  let results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.next', '.git', '.agents'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walk(full));
    } else {
      results.push(full);
    }
  }
  return results;
}

const files = walk(root);
const matches3000 = [];
const portOccurrences = [];

const pattern3000 = /(localhost:3000|127\.0\.0\.1:3000|port[:\s=]+3000\b|PORT[:\s=]+3000\b|\"3000\"|-p\s+3000\b)/i;
const generalPortPattern = /(3000|3001|3002|3003|3004)/;

for (const file of files) {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      if (pattern3000.test(line)) {
        matches3000.push({ file: path.relative(root, file), line: idx + 1, text: line.trim() });
      }
      if (generalPortPattern.test(line) && (file.endsWith('.json') || file.endsWith('.mjs') || file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.yml') || file.endsWith('.md'))) {
        // filter out dates, versions or random numbers
        if (/port|localhost|127\.0\.0\.1|-p\s+\d+|PORT/i.test(line)) {
          portOccurrences.push({ file: path.relative(root, file), line: idx + 1, text: line.trim() });
        }
      }
    });
  } catch (err) {}
}

console.log('=== MATCHES FOR 3000 ===');
console.log(JSON.stringify(matches3000, null, 2));

console.log('\n=== PORT CONFIGURATIONS FOUND ===');
console.log(JSON.stringify(portOccurrences, null, 2));
