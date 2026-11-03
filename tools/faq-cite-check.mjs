// faq-cite-check.mjs - every legal fact cited by a home FAQ answer exists in nj-law.json, the answer links that fact's
// own official source URL, and no written copy carries a dash used as a dash. A planted defect (an answer citing a fact
// whose source it does not link) must be reported, or the check is blind and exits 2.
//   node tools/faq-cite-check.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const faq = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/content/home-faq.json'), 'utf8'));
const nj = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/content/nj-law.json'), 'utf8'));
const DASH = /[‒–—―]|\s-\s|--/;

function check(items) {
  const problems = [];
  for (const it of items) {
    const hrefs = [...String(it.a_html).matchAll(/href="([^"]+)"/g)].map((m) => m[1].replace(/&amp;/g, '&'));
    for (const id of it.facts || []) {
      const f = nj.facts.find((x) => x.id === id);
      if (!f) { problems.push(`${it.id}: fact ${id} not in nj-law.json`); continue; }
      const src = nj.sources.find((s) => s.id === f.sourceId);
      if (!src) { problems.push(`${it.id}: fact ${id} has no source record`); continue; }
      if (!hrefs.includes(src.url)) problems.push(`${it.id}: cites ${id} but does not link its source ${src.url}`);
    }
    const text = String(it.q) + ' ' + String(it.a_html).replace(/<[^>]+>/g, ' ');
    if (DASH.test(text)) problems.push(`${it.id}: dash used as punctuation`);
  }
  return problems;
}

const control = check([{ id: 'control', q: 'x', a_html: 'plain text with no links', facts: ['limit-flower'] }]);
if (!control.length) { console.error('faq-cite-check: positive control did not fire'); process.exit(2); }
const problems = check(faq.items);
const cited = new Set(faq.items.flatMap((i) => i.facts || []));
console.log(`faq-cite-check: ${faq.items.length} items, ${cited.size} distinct facts cited, control fired (${control.length}), problems ${problems.length}`);
for (const p of problems) console.log('  ' + p);
process.exit(problems.length ? 1 : 0);
