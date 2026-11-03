// data.mjs - load every content file once.
//   ctx.site     src/content/site.json   Greenstop's facts (main session; every value traced to facts/greenstop-facts.json)
//   ctx.ia       src/content/ia.json     the adopted architecture mapped onto Greenstop: nav, footer, page map
//   ctx.images   src/content/images.json generated media registry (IMAGERY lane)
//   ctx.content  src/content/pages/<slug>.json   Greenstop's captured pages ({ path, title, description, sections, ... })
//   ctx.posts    src/content/posts/<slug>.json   Greenstop's blog posts, newest first
//   ctx.events   src/content/events/<slug>.json  Greenstop's events, newest first (by start date)
//   ctx.team     src/content/team/<slug>.json    Greenstop's team-member pages
//   ctx.learn    src/content/learn/<slug>.json   NEW education guides written for the adopted Education pattern
//   ctx.nj       src/content/nj-law.json         New Jersey law facts with official sources
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './paths.mjs';
import { normaliseDashes } from './punct.mjs';

const readJson = (rel, fallback) => {
  const f = path.join(ROOT, rel);
  return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : fallback;
};
const readDir = (rel) => {
  const dir = path.join(ROOT, rel);
  const out = {};
  if (!fs.existsSync(dir)) return out;
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json')).sort()) out[f.replace(/\.json$/, '')] = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  return out;
};
// newest first; events carry a display date ("January 21, 2026") plus startISO, posts an ISO date: compare as times
const when = (x) => { const t = Date.parse(x.startISO || x.date || x.start || ''); return Number.isNaN(t) ? 0 : t; };
const byDate = (a, b) => when(b) - when(a);

export function loadAll() {
  const site = normaliseDashes(readJson('src/content/site.json'));
  const ia = readJson('src/content/ia.json');
  const images = readJson('src/content/images.json', { photos: {}, media: {} });
  // punctuation-only dash normalisation of every copy source (src/lib/punct.mjs); words are unchanged.
  const content = normaliseDashes(readDir('src/content/pages'));
  const posts = normaliseDashes(Object.values(readDir('src/content/posts')).sort(byDate));
  // source defect: every live post's meta description opens with another brand's template line ("Find the latest
  // updates from <other brand>!"); drop that sentence, keep Greenstop's own remainder (docs/OPEN-DECISIONS.md A8)
  // the whole template line is foreign ("... CBD product releases, news, and health benefits."), so such a post gets
  // its own excerpt (Greenstop's opening words), cut at a word boundary near 155 characters
  for (const p of posts) {
    if (typeof p.description !== 'string' || !/^Find the latest updates from /.test(p.description)) continue;
    const ex = String(p.excerpt || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    p.description = ex.length > 158 ? ex.slice(0, 155).replace(/\s+\S*$/, '') + '...' : ex;
  }
  const events = normaliseDashes(Object.values(readDir('src/content/events')).sort(byDate));
  const team = normaliseDashes(Object.values(readDir('src/content/team')));
  const learn = normaliseDashes(Object.values(readDir('src/content/learn')).sort((a, b) => (a.order ?? 99) - (b.order ?? 99)));
  const nj = normaliseDashes(readJson('src/content/nj-law.json', { facts: [], sources: [] }));
  // home page FAQ for local dispensary searches (main session; claims traced per item, see the file's "about")
  const homeFaq = normaliseDashes(readJson('src/content/home-faq.json', null));
  return { site, ia, images, content, posts, events, team, learn, nj, homeFaq };
}
