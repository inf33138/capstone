/* Remove the stray `adventure-details` spec block from the homepage source,
   matching the reference WKND homepage (which has no such block). Balanced-div
   removal so the sibling carousel-hero and everything else is preserved. */
const fs = require('fs');
const path = require('path');
const DIR = __dirname;

let html = fs.readFileSync(path.join(DIR, 'us-en.html'), 'utf8');

const marker = '<div class="adventure-details">';
const idx = html.indexOf(marker);
if (idx === -1) throw new Error('adventure-details block not found');

const tagRe = /<\/?div\b[^>]*>/g;
tagRe.lastIndex = idx;
let depth = 0; let end = -1; let m;
// eslint-disable-next-line no-cond-assign
while ((m = tagRe.exec(html))) {
  depth += m[0].startsWith('</div') ? -1 : 1;
  if (depth === 0) { end = m.index + m[0].length; break; }
}
if (end === -1) throw new Error('no matching close for adventure-details');

html = html.slice(0, idx) + html.slice(end);
fs.writeFileSync(path.join(DIR, 'us-en.new.html'), html);

console.log('adventure-details blocks now:', (html.match(/adventure-details/g) || []).length);
console.log('carousel-hero preserved:', html.includes('carousel-hero'));
console.log('columns preserved:', html.includes('class="columns"'));
console.log('hero preserved:', html.includes('class="hero"'));
console.log('cards (query-index) preserved:', (html.match(/query-index\.json/g) || []).length);
console.log('metadata preserved:', html.includes('class="metadata"'));
