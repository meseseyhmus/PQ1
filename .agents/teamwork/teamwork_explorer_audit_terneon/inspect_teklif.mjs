import fs from 'node:fs';

const contentPath = 'C:/Users/HUAWEI/.gemini/antigravity/brain/b7a42974-f8f6-4268-813c-066c2036c82c/.system_generated/steps/105/content.md';
const text = fs.readFileSync(contentPath, 'utf8');

const idMatch = text.indexOf('id="teklif-al"');
console.log('id="teklif-al" position:', idMatch);
if (idMatch !== -1) {
  console.log(text.slice(idMatch, idMatch + 4000));
}

// Let's also search for cookie consent
const cookieMatch = text.indexOf('Çerez tercihiniz');
console.log('Cookie match:', cookieMatch);
if (cookieMatch !== -1) {
  console.log(text.slice(cookieMatch - 100, cookieMatch + 1500));
} else {
  const cerezMatch = text.indexOf('cerez') || text.indexOf('çerez');
  console.log('cerez match:', cerezMatch);
}
