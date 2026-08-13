/* Re-author the reverted FAQ doc: replace the hardcoded accordion (Q&A rows)
   with a single-cell index block naming the faqs.json sheet. Balanced-div
   replacement preserves the rest of the page (title, hero image, intro,
   "Need more help?", metadata). */
const fs = require('fs');
const path = require('path');
const DIR = __dirname;

let html = fs.readFileSync(path.join(DIR, 'faqs.html'), 'utf8');

const marker = '<div class="accordion">';
const idx = html.indexOf(marker);
if (idx === -1) throw new Error('accordion block not found');

const tagRe = /<\/?div\b[^>]*>/g;
tagRe.lastIndex = idx;
let depth = 0; let end = -1; let m;
// eslint-disable-next-line no-cond-assign
while ((m = tagRe.exec(html))) {
  depth += m[0].startsWith('</div') ? -1 : 1;
  if (depth === 0) { end = m.index + m[0].length; break; }
}
if (end === -1) throw new Error('no matching close for accordion');

const replacement = '<div class="accordion"><div><div>/us/en/faqs/faqs.json</div></div></div>';
html = html.slice(0, idx) + replacement + html.slice(end);
fs.writeFileSync(path.join(DIR, 'faqs.new.html'), html);

console.log('accordion blocks:', (html.match(/<div class="accordion">/g) || []).length);
console.log('faqs.json ref:', html.includes('/us/en/faqs/faqs.json'));
console.log('hardcoded Q&A gone:', !html.includes("Who is WKND's intended audience"));
console.log('Need more help preserved:', html.includes('Need more help') || html.includes('need-more-help'));
console.log('metadata preserved:', html.includes('class="metadata"'));
