import fs from 'node:fs';

const contentPath = 'C:/Users/HUAWEI/.gemini/antigravity/brain/b7a42974-f8f6-4268-813c-066c2036c82c/.system_generated/steps/105/content.md';
const text = fs.readFileSync(contentPath, 'utf8');

console.log('Total length:', text.length);

function extractAround(term, len = 2000) {
  let pos = 0;
  while ((pos = text.indexOf(term, pos)) !== -1) {
    console.log(`\n=== MATCH FOR "${term}" AT ${pos} ===\n`);
    console.log(text.slice(Math.max(0, pos - 100), Math.min(text.length, pos + len)));
    pos += term.length;
  }
}

extractAround('teklif-al', 1500);
extractAround('Çerez', 1000);
extractAround('Kapadokya', 1000);
extractAround('Dokuz oda', 1000);
extractAround('Saklı Cave House', 1000);
