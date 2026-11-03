// sitemap.mjs - PAGES lane: /sitemap/ + /sitemap.xml. Rendered LAST (index.mjs MODULES), so ctx.pages holds every
// rendered page: each one is listed once, grouped Shop / Visit / About Greenstop / Events / Learn / Legal (a page no rule
// knows lands in About Greenstop, never dropped). Posts, events and team members sit in their own groups.
// Labels: ia.json labels first, then post / event / team titles, then the page's own <h1>. sitemap.xml: every page path
// absolute on site.origin, no lastmod; written straight into the build's out dir (ctx.out) so the build's HTML checks do
// not see it; returned as a page only if ctx.out is absent.
import fs from 'node:fs';
import nodePath from 'node:path';
import { esc, escA, linkAttrs, stripTags, absUrl } from './util.mjs';
import { page, crumbsHtml } from './shell.mjs';

const PATH = '/sitemap/';
const GROUPS = ['Shop', 'Visit', 'About Greenstop', 'Events', 'Learn', 'Legal'];

function labels(ctx) {
  const L = new Map();
  const put = (u, l) => {
    if (!u || !l || typeof u !== 'string' || !u.startsWith('/')) return;
    const p = u.replace(/[?#].*$/, '');
    const k = /\.[a-z0-9]{2,5}$/i.test(p) || p.endsWith('/') ? p : p + '/';
    if (!L.has(k)) L.set(k, stripTags(l).trim());
  };
  put('/', 'Home');
  put('/about/', 'About Greenstop');
  const walk = (o) => {
    if (Array.isArray(o)) o.forEach(walk);
    else if (o && typeof o === 'object') { if (typeof o.href === 'string' && (o.label || o.title)) put(o.href, o.label || o.title); Object.values(o).forEach(walk); }
  };
  walk(ctx.ia && ctx.ia.nav);
  walk(ctx.ia && ctx.ia.footer);
  for (const p of ctx.posts || []) put(p.path || '/' + p.slug + '/', p.title);
  for (const e of ctx.events || []) put('/event/' + e.slug + '/', e.title);
  for (const m of ctx.team || []) put('/team-member/' + m.slug + '/', m.name);
  for (const g of ctx.learn || []) put('/education/' + g.slug + '/', g.title);
  put('/location/jersey-city-nj/', 'Visit the Store (Jersey City, NJ)');
  return L;
}

function groupOf(p, postPaths) {
  if (postPaths.has(p) || p === '/blog/' || p.startsWith('/education/')) return 'Learn';
  if (p.startsWith('/products/') || ['/our-brands/', '/deals/', '/online-ordering/', '/in-store-pickup/'].includes(p)) return 'Shop';
  if (p.startsWith('/location/') || p === '/about/service-areas/' || p === '/contact/') return 'Visit';
  if (p === '/events/' || p.startsWith('/event/')) return 'Events';
  if (p === '/terms-conditions/' || p === '/privacy-policy/' || p === PATH) return 'Legal';
  return 'About Greenstop';
}

const ORDER = ['/', '/products/', '/our-brands/', '/deals/', '/online-ordering/', '/in-store-pickup/', '/location/jersey-city-nj/', '/about/service-areas/', '/contact/', '/about/', '/about/team/', '/about/frequently-asked-questions/', '/events/', '/education/', '/blog/', '/terms-conditions/', '/privacy-policy/', PATH];

export async function render(ctx) {
  const L = labels(ctx);
  const h1Of = (html) => { const m = /<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(html || ''); return m ? stripTags(m[1]).replace(/\s+/g, ' ').trim() : ''; };
  const postPaths = new Set((ctx.posts || []).map((p) => p.path || '/' + p.slug + '/'));
  const all = [...ctx.pages.keys()].filter((p) => p.endsWith('/'));
  if (!all.includes(PATH)) all.push(PATH);
  const rank = (p) => { const i = ORDER.indexOf(p); return i === -1 ? ORDER.length : i; };
  const entries = all.map((p) => ({ path: p, label: L.get(p) || h1Of((ctx.pages.get(p) || {}).html) || p, group: groupOf(p, postPaths), sub: p.startsWith('/event/') || p.startsWith('/team-member/') || postPaths.has(p) }));
  entries.sort((a, b) => rank(a.path) - rank(b.path) || a.label.localeCompare(b.label));
  const li = (e) => `<li><a class="p-sm__link"${linkAttrs(e.path, e.path === PATH ? { 'aria-current': 'page' } : {})}>${esc(e.label)}</a></li>`;

  const groups = GROUPS.map((g, gi) => {
    const items = entries.filter((e) => e.group === g && !e.sub);
    const subs = entries.filter((e) => e.group === g && e.sub);
    if (!items.length && !subs.length) return '';
    const id = 'sm-' + g.toLowerCase().replace(/[^a-z]+/g, '-');
    const subTitle = g === 'Events' ? 'Every event' : g === 'Learn' ? 'Blog posts' : 'Team members';
    return `<section class="p-sm__group glass" data-reveal style="--i:${gi % 3}" aria-labelledby="${id}">
<h2 class="p-sm__title" id="${id}">${esc(g)}<span class="p-count">${items.length + subs.length}</span></h2>
<ul class="p-sm__list" role="list">${items.map(li).join('')}</ul>
${subs.length ? `<details class="p-sm__more"${g === 'About Greenstop' ? ' open' : ''}><summary class="p-sm__sum">${esc(subTitle)} <span class="p-count">${subs.length}</span></summary><ul class="p-sm__list" role="list">${subs.map(li).join('')}</ul></details>` : ''}
</section>`;
  }).join('\n');

  const crumbs = [{ href: '/', label: 'Home' }, { href: PATH, label: 'Sitemap' }];
  const title = 'Sitemap | Greenstop Dispensary';
  const description = 'Every page of the Greenstop Wellness site, grouped: shop, visit, about, events, learn and legal.';
  const home = (entries.find((e) => e.path === '/') || null);
  const main = `<section class="page-hero p-hero p-hero--sitemap" data-spot>
<div class="wrap page-hero__grid p-hero__grid">
<div class="page-hero__text p-hero__text" data-reveal>
${crumbsHtml(crumbs)}
<p class="kicker sticker p-kick">Sitemap</p>
<h1 class="display p-hero__title">Sitemap</h1>
<p class="lede p-hero__lede">Every page of the site, grouped: ${entries.length} in all.</p>
${home ? `<div class="btn-row p-hero__ctas"><a class="btn btn--lime"${linkAttrs('/')}>Home</a></div>` : ''}
</div>
</div>
</section>
<section class="band band--ink p-sm" aria-label="All pages">
<div class="band__clip" aria-hidden="true"><span class="haze"></span><span class="grain"></span></div>
<div class="wrap"><div class="p-sm__grid">${groups}</div></div>
</section>`;

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${all.slice().sort((a, b) => rank(a) - rank(b) || a.localeCompare(b)).map((p) => `  <url><loc>${escA(absUrl(ctx, p))}</loc></url>`).join('\n')}
</urlset>
`;
  const pages = [{ path: PATH, html: page({ ctx, path: PATH, title, description, canonical: absUrl(ctx, PATH), og: { title, description, type: 'website' }, bodyClass: 'p-page p-page--sitemap', main, crumbs, heroCrumbs: true }) }];
  if (ctx.out) { fs.mkdirSync(ctx.out, { recursive: true }); fs.writeFileSync(nodePath.join(ctx.out, 'sitemap.xml'), xml); }
  else pages.push({ path: '/sitemap.xml', html: xml });
  return pages;
}
