import fs from 'node:fs';

const contentPath = 'C:/Users/HUAWEI/.gemini/antigravity/brain/b7a42974-f8f6-4268-813c-066c2036c82c/.system_generated/steps/105/content.md';
const text = fs.readFileSync(contentPath, 'utf8');

console.log('--- TEKLIF AL CONTINUED ---');
console.log(text.slice(174862 + 7400, 174862 + 13000));
