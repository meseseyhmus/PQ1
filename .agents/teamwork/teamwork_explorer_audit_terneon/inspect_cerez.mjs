import fs from 'node:fs';

const contentPath = 'C:/Users/HUAWEI/.gemini/antigravity/brain/b7a42974-f8f6-4268-813c-066c2036c82c/.system_generated/steps/105/content.md';
const text = fs.readFileSync(contentPath, 'utf8');

console.log('--- AROUND CEREZ ---');
console.log(text.slice(202809 - 100, 202809 + 2500));

console.log('--- AROUND TEKLIF AL RIGHT COLUMN ---');
console.log(text.slice(174862 + 3500, 174862 + 7500));
