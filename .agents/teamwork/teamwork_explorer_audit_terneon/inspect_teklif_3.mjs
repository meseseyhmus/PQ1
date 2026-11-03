import fs from 'node:fs';

const contentPath = 'C:/Users/HUAWEI/.gemini/antigravity/brain/b7a42974-f8f6-4268-813c-066c2036c82c/.system_generated/steps/105/content.md';
const text = fs.readFileSync(contentPath, 'utf8');

console.log('--- ASIDE SUMMARY ---');
console.log(text.slice(174862 + 12800, 174862 + 16000));
