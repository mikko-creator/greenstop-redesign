// shop.mjs: SHOP lane (docs/BUILD-CONTRACT.md section 6): /products/, /products/<cat>/ for the 8 categories in
// ia.json, /our-brands/, /deals/, /online-ordering/, /in-store-pickup/. Greenstop's own words (captured pages,
// site.json); every new word is neutral glue (D2). In-site shop navigation stays on /products/...; only explicit
// "Order online" buttons leave for Greenstop's cart through cart(ctx, slug) (D4). Lane classes are prefixed s-.
import { esc, escA, linkAttrs, gimg, img, photo, absUrl, cart } from './util.mjs';
import { page, crumbsHtml, icon } from './shell.mjs';

const TAIL = ' | Greenstop Dispensary';
const FAQ = '/about/frequently-asked-questions/';
const pad = (n) => String(n).padStart(2, '0');

// ---------- data ----------
const cats = (ctx) => (((ctx.ia.nav || []).find((n) => n.href === '/products/') || {}).children || [])
  .map((c, i) => ({ ...c, slug: c.href.replace(/^\/products\/|\/$/g, ''), i }));
const blocksOf = (rec) => ((rec && rec.sections) || []).flatMap((s) => s.blocks || []);
const section = (rec, test) => ((rec && rec.sections) || []).find(test) || { blocks: [] };

// Greenstop's own category labels and line icons from the home page "Our Premium Products" icon-boxes.
const HOME_LABEL = { flower: 'Flower', 'pre-rolls': 'PreRolls', edibles: 'Edibles', 'vapes-cartridges': 'Vaporizers', concentrates: 'Concentrates', tinctures: 'Tinctures', topicals: 'Topicals' };
function premium(ctx) {
  const s = section(ctx.content.home, (x) => x.heading === 'Our Premium Products' || x.id === 's3');
  return { heading: (s.blocks.find((b) => b.type === 'h2') || {}).text || 'Our Premium Products', boxes: s.blocks.filter((b) => b.type === 'icon-box') };
}
function gsIcon(ctx, cat) {
  const t = HOME_LABEL[cat.slug];
  const b = t && premium(ctx).boxes.find((x) => x.title === t);
  return b ? { src: b.icon, w: b.iconW, h: b.iconH, label: b.title } : null;
}
const iconImg = (ic, cls = '') => (ic ? img({ src: ic.src, alt: '', w: ic.w, h: ic.h }, { sizes: '64px', cls }) : '');

// Greenstop's FAQ (captured on /about/, moved to the FAQ page by PAGES): quoted verbatim with a link to the full FAQ.
function faqItem(ctx, q) {
  for (const b of blocksOf(ctx.content.about)) if (b.type === 'faq') for (const it of b.items || []) if (it.q === q) return it;
  return null;
}
function faqQuote(ctx, q, { i = 0, cls = '' } = {}) {
  const it = faqItem(ctx, q);
  if (!it) return '';
  return `<figure class="glass s-quote ${cls}" data-reveal style="--i:${i}">
<h3 class="s-quote__q">${esc(it.q)}</h3>
<blockquote class="s-quote__a">${it.a_html}</blockquote>
<figcaption class="s-quote__src">From Greenstop's <a${linkAttrs(FAQ)}>Frequently Asked Questions</a></figcaption>
</figure>`;
}

// Greenstop's home-page service cards (s4): Pickup, Door to Door Delivery, ...
const service = (ctx, title) => blocksOf(ctx.content.home).find((b) => b.type === 'icon-box' && b.title === title);

// Greenstop's deals page words (s2 Special Discounts, s3 Rewards Program).
function dealWords(ctx) {
  const rec = ctx.content.deals;
  const s2 = section(rec, (s) => s.heading === 'Special Discounts');
  const s3 = section(rec, (s) => s.heading === 'Rewards Program');
  return {
    rec,
    flyers: section(rec, (s) => s.id === 's1').blocks.filter((b) => b.type === 'img'),
    discHead: (s2.blocks.find((b) => b.type === 'h3') || {}).text || 'Special Discounts',
    discLine: (s2.blocks.find((b) => b.type === 'p') || {}).html || '',
    groups: s2.blocks.filter((b) => b.type === 'icon-box'),
    idNote: (s2.blocks.filter((b) => b.type === 'h3')[1] || {}).text || '',
    rewHead: (s3.blocks.find((b) => b.type === 'h3') || {}).text || 'Rewards Program',
    rewLine: (s3.blocks.find((b) => b.type === 'p') || {}).html || '',
    join: s3.blocks.find((b) => b.type === 'button'),
    tiers: s3.blocks.filter((b) => b.type === 'icon-box'),
  };
}

// Brands named in Greenstop's captured content: the About page staff-pick icon-boxes ("Brand | product...").
function brands(ctx) {
  const map = new Map();
  for (const b of blocksOf(ctx.content.about)) {
    if (b.type !== 'icon-box' || !String(b.title).includes('|')) continue;
    const [name, ...rest] = String(b.title).split('|').map((x) => x.trim());
    // all-caps shorthands in the staff picks (GF, GG, KL, HM FM ...) are not brand names a visitor can read: skip them
    if (!name || /^[A-Z0-9 ]{1,6}$/.test(name)) continue;
    const key = name.toLowerCase();
    if (!map.has(key)) map.set(key, { name, picks: [] });
    const pick = rest.join(' | ').trim();
    if (pick && !map.get(key).picks.some((p) => p.toLowerCase() === pick.toLowerCase())) map.get(key).picks.push(pick);
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }));
}

// ---------- neutral format glue (D2: what the format is, common forms; no effects, health, potency, products,
// brands, prices or stock). Bud Bar has no description on the live site, so it says only what is known. ----------
const FORMAT = {
  flower: ['Flower is the dried and cured bud of the cannabis plant.', 'It is sold by weight and is usually ground before it is rolled into a joint or packed into a pipe or a dry-herb vaporizer.'],
  'pre-rolls': ['A pre-roll is ground cannabis flower already rolled in paper and ready to light, often called a joint.', 'Pre-rolls come as single joints or in packs, in a range of sizes, and some are infused with a concentrate.'],
  edibles: ['Edibles are foods and candies made with cannabis that are eaten rather than smoked or vaped.', 'Common forms include gummies, chocolates, mints and baked goods.'],
  'vapes-cartridges': ['A vape cartridge is a small tank of cannabis oil that attaches to a battery, which heats the oil into a vapor instead of smoke.', 'Common forms include 510-thread cartridges, pods and all-in-one disposable pens.'],
  concentrates: ['Concentrates are made by separating the resin of the cannabis plant from the plant material.', 'They come in many textures, such as shatter, wax, badder, live resin, rosin and hash.'],
  tinctures: ['A tincture is a liquid cannabis extract, usually sold in a small bottle with a dropper so each amount can be measured.', 'Tinctures are taken by mouth, under the tongue or mixed into food and drinks.'],
  topicals: ['Topicals are cannabis-infused products that are applied to the skin rather than inhaled or eaten.', 'Common forms include lotions, balms, salves and sticks.'],
  'bud-bar': ['Bud Bar is a category on Greenstop\'s online menu.', 'Open it on the menu to see what it holds.'],
};
// Education guides that fit a format (linked only when ctx.learn carries the guide).
const LEARN = {
  flower: ['guide-to-strains', 'respiratory-administration'], 'pre-rolls': ['respiratory-administration', 'guide-to-strains'],
  edibles: ['routes-of-administration', 'safe-and-responsible-consumption'], 'vapes-cartridges': ['respiratory-administration', 'safe-and-responsible-consumption'],
  concentrates: ['guide-to-terpenes', 'respiratory-administration'], tinctures: ['routes-of-administration', 'thc-and-cbd'],
  topicals: ['routes-of-administration', 'thc-and-cbd'], 'bud-bar': ['guide-to-strains'],
};
const CUT = { flower: 'g-bud-cut', 'pre-rolls': 'g-leaf-cut', edibles: 'g-leaf-cut', 'vapes-cartridges': 'g-can-cut', concentrates: 'g-bud-cut', tinctures: 'g-leaf-cut', topicals: 'g-leaf-cut', 'bud-bar': 'g-bud-cut' };
function learnLinks(ctx, slug) {
  const nav = ((ctx.ia.nav || []).find((n) => n.href === '/education/') || {}).children || [];
  const have = new Set((ctx.learn || []).map((g) => g.slug));
  return (LEARN[slug] || []).filter((s) => have.has(s)).map((s) => nav.find((n) => n.href === '/education/' + s + '/')).filter(Boolean);
}

// ---------- shared pieces ----------
const ext = (label) => `${esc(label)}${icon('ext', 's-ext')}`;
const arrow = (label) => `${esc(label)}${icon('arrow', 's-arr')}`;
const btn = (u, label, cls = 'btn btn--lime', extra = {}) => `<a class="${cls}"${linkAttrs(u, extra)}>${/^https?:/i.test(u) ? ext(label) : esc(label)}</a>`;
const crumbsLd = (ctx, crumbs) => ({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.label, ...(c.href ? { item: absUrl(ctx, c.href) } : {}) })) });
const clip = (extra = '') => `<div class="band__clip" aria-hidden="true">${extra}<div class="haze"></div><div class="grain"></div></div>`;

function hero({ crumbs, kicker, h1, line, ctas, media, cls = '' }) {
  return `<section class="page-hero s-hero ${cls}" data-spot>
<div class="wrap page-hero__grid s-hero__grid">
<div class="page-hero__text s-hero__text">
${crumbsHtml(crumbs)}
${kicker ? `<p class="kicker sticker s-hero__kicker" data-reveal>${kicker}</p>` : ''}
<h1 class="display s-hero__h1" data-reveal style="--i:1">${h1}</h1>
${line ? `<p class="lede s-hero__line" data-reveal style="--i:2">${line}</p>` : ''}
${ctas ? `<div class="btn-row s-hero__ctas" data-reveal style="--i:3">${ctas}</div>` : ''}
</div>
<div class="page-hero__media s-hero__media" data-reveal style="--i:2">${media}</div>
</div>
</section>`;
}

// caution-tape marquee of words (decorative; the words are links elsewhere on the page)
function tape(words, cls = '') {
  return `<div class="s-tape ${cls}" aria-hidden="true"><div class="caution marquee s-tape__run" data-marquee><div class="marquee__track">${words.map((w) => `<span>${esc(w)}</span>`).join('')}</div></div></div>`;
}

function tile(ctx, c, i, sizes = '(min-width: 1240px) 290px, (min-width: 1024px) 23vw, (min-width: 600px) 45vw, 92vw') {
  const ic = gsIcon(ctx, c);
  return `<li class="s-tiles__item" data-reveal style="--i:${i % 4}"><a class="tile s-tile"${linkAttrs(c.href)}>
<span class="tile__media s-tile__media">${gimg(c.gimg, { alt: '', sizes })}${ic ? `<span class="s-tile__icon" aria-hidden="true">${iconImg(ic)}</span>` : ''}<span class="s-tile__no stencil" aria-hidden="true">${pad(c.i + 1)}</span></span>
<span class="tile__title s-tile__title">${esc(c.label)}</span>
<span class="tile__cta s-tile__cta">${arrow('Explore')}</span>
</a></li>`;
}

function hours(ctx) {
  return `<ul class="s-hours">${(ctx.site.hours || []).map((h) => `<li><span class="s-hours__d">${esc(String(h.days).replace(/\s*[‒-―]\s*/g, ' to '))}</span> <span class="s-hours__t">${esc(h.open)} to ${esc(h.close)}</span></li>`).join('')}</ul>`;
}
function storeCard(ctx, { i = 0 } = {}) {
  const a = ctx.site.address;
  return `<div class="glass glass--strong s-store" data-reveal style="--i:${i}">
<p class="kicker sticker">Visit the store</p>
<h3 class="s-store__name">${esc(ctx.site.name)}</h3>
<ul class="s-store__list">
<li>${icon('pin', 's-store__ico')}<span>${esc(a.street)}, ${esc(a.city)}, ${esc(a.state)} ${esc(a.zip)}</span></li>
<li>${icon('clock', 's-store__ico')}${hours(ctx)}</li>
<li>${icon('phone', 's-store__ico')}<a${linkAttrs(ctx.site.phoneHref)}>${esc(ctx.site.phone)}</a></li>
</ul>
<div class="btn-row">${btn(ctx.site.mapUrl, 'Get Directions', 'btn btn--lime')}${btn('/location/jersey-city-nj/', 'Store details', 'btn btn--glass')}</div>
</div>`;
}

function dealBand(ctx) {
  const d = dealWords(ctx);
  return `<section class="band band--forest s-dealband" aria-labelledby="dealband-h">
${clip(`<div class="band__bg s-dealband__bg">${gimg('g-drips', { alt: '', sizes: '100vw' })}</div>`)}
<div class="wrap s-dealband__grid">
<div class="s-dealband__head" data-reveal><p class="kicker sticker">Deals</p><h2 class="s-h2" id="dealband-h">Deals and rewards</h2></div>
<a class="glass glass--lift s-dealcard" data-reveal style="--i:1"${linkAttrs('/deals/#discounts')}><span class="s-dealcard__ico">${icon('id')}</span><span class="s-dealcard__t">${esc(d.discHead)}</span><span class="s-dealcard__d">${d.discLine}</span><span class="link-arrow s-dealcard__go">${arrow('See the discounts')}</span></a>
<a class="glass glass--lift s-dealcard" data-reveal style="--i:2"${linkAttrs('/deals/#rewards')}><span class="s-dealcard__ico">${icon('gift')}</span><span class="s-dealcard__t">${esc(d.rewHead)}</span><span class="s-dealcard__d">${d.rewLine}</span><span class="link-arrow s-dealcard__go">${arrow('See the rewards')}</span></a>
</div>
</section>`;
}

function shell(ctx, { path, title, description, crumbs, bodyClass, main }) {
  return { path, html: page({ ctx, path, title, description, crumbs, heroCrumbs: true, bodyClass: 'page-shop ' + bodyClass, main, og: { title, description, type: 'website', url: absUrl(ctx, path) }, jsonld: [crumbsLd(ctx, crumbs)] }) };
}

// ---------- /products/ ----------
function productsPage(ctx) {
  const path = '/products/';
  const crumbs = [{ label: 'Home', href: '/' }, { label: 'Products' }];
  const all = cats(ctx);
  const pr = premium(ctx);
  const media = `<div class="s-fan">
<div class="frame s-fan__card s-fan__card--b" aria-hidden="true">${gimg('g-edibles', { alt: '', sizes: '(min-width: 1024px) 340px, 50vw' })}</div>
<div class="frame s-fan__card s-fan__card--c" aria-hidden="true">${gimg('g-vapes', { alt: '', sizes: '(min-width: 1024px) 340px, 50vw' })}</div>
<div class="frame s-fan__card s-fan__card--a" data-tilt="5">${gimg('g-flower', { eager: true, sizes: '(min-width: 1024px) 520px, 88vw' })}</div>
<div class="glass glass--strong s-fan__badge"><span class="stencil s-fan__n">${pad(all.length)}</span><span class="s-fan__l">categories on the online menu</span></div>
<div class="s-cutwrap s-fan__cut" data-depth="0.14" aria-hidden="true">${gimg('g-bud-cut', { alt: '', sizes: '(min-width: 1024px) 230px, 32vw', cls: 'cut' })}</div>
</div>`;
  const main = `${hero({
    crumbs,
    kicker: 'Products',
    h1: esc(pr.heading),
    line: 'Flower, pre-rolls, edibles, vapes, concentrates, tinctures, topicals and the Bud Bar, all on Greenstop\'s online menu.',
    ctas: `${btn(cart(ctx), 'Order online')}${btn('/deals/', 'See deals', 'btn btn--glass')}`,
    media,
    cls: 's-hero--hub',
  })}
<section class="band band--ink s-after s-cats" aria-labelledby="cats-h">
${clip('<div class="s-spray s-spray--l"></div>')}
<div class="wrap">
<div class="s-head s-head--row" data-reveal><div><p class="kicker sticker">Shop by category</p><h2 class="s-h2" id="cats-h">Pick your <span class="tag">drop</span></h2></div><p class="s-head__note">Every tile opens a category page with an "Order online" link to that part of Greenstop's menu.</p></div>
<ul class="s-tiles" role="list">
${all.map((c, i) => tile(ctx, c, i)).join('\n')}
</ul>
</div>
</section>
${tape(all.map((c) => c.label))}
<section class="band band--stone s-words" aria-labelledby="words-h">
<div class="wrap s-words__grid">
<div class="s-words__head" data-reveal><p class="kicker sticker">In Greenstop's words</p><h2 class="s-h2" id="words-h">What is on the shelves</h2><p class="s-words__line">Greenstop's own answers, from the store's Frequently Asked Questions.</p></div>
${faqQuote(ctx, 'What types of products do you sell?', { i: 1, cls: 'glass--paper' })}
${faqQuote(ctx, 'How do I choose the right product for me?', { i: 2, cls: 'glass--paper' })}
</div>
</section>
${orderBand(ctx)}
${dealBand(ctx)}`;
  return shell(ctx, { path, title: 'Products' + TAIL, description: 'Shop by category at Greenstop Dispensary, 516 Tonnelle Ave, Jersey City: flower, pre-rolls, edibles, vapes and cartridges, concentrates, tinctures, topicals and the Bud Bar.', crumbs, bodyClass: 'page-products', main });
}

function orderBand(ctx, { title = 'Order online', heading = 'h2' } = {}) {
  return `<section class="band band--forest s-order" aria-labelledby="order-h" data-spot>
${clip('<div class="s-spray s-spray--r"></div>')}
<div class="wrap s-order__grid">
<div class="s-order__text" data-reveal>
<p class="kicker sticker">Online ordering</p>
<${heading} class="s-h2" id="order-h">${esc(title)}</${heading}>
<p class="s-order__line">Greenstop's online menu covers every category. Pick up in store, or see the delivery details.</p>
<div class="btn-row">${btn(cart(ctx), 'Order online')}${btn('/online-ordering/', 'How ordering works', 'btn btn--glass')}${btn('/in-store-pickup/', 'In-store Pickup', 'btn btn--ghost')}</div>
</div>
${faqQuote(ctx, 'Can I place an order online?', { i: 1, cls: 'glass--strong s-quote--big' })}
</div>
</section>`;
}

// ---------- /products/<cat>/ ----------
function categoryPage(ctx, cat, all) {
  const path = cat.href;
  const crumbs = [{ label: 'Home', href: '/' }, { label: 'Products', href: '/products/' }, { label: cat.label }];
  const ic = gsIcon(ctx, cat);
  const isBar = cat.slug === 'bud-bar';
  const order = cart(ctx, cat.cart);
  const media = `<div class="s-drop">
<div class="frame s-drop__frame" data-tilt="5">${gimg(cat.gimg, { eager: true, sizes: '(min-width: 1024px) 580px, 92vw', cls: 's-drop__img' })}</div>
<div class="glass glass--strong s-drop__badge">${ic ? `<span class="s-drop__icon">${iconImg(ic)}</span>` : ''}<span class="s-drop__no"><span class="stencil">${pad(cat.i + 1)}</span><span class="s-drop__of">/ ${pad(all.length)}</span></span>${ic ? `<span class="s-drop__lab">${esc(ic.label)}</span>` : ''}</div>
<div class="s-cutwrap s-drop__cut" data-depth="0.12" aria-hidden="true">${gimg(CUT[cat.slug] || 'g-bud-cut', { alt: '', sizes: '(min-width: 1024px) 240px, 30vw', cls: 'cut' })}</div>
</div>`;
  const learn = learnLinks(ctx, cat.slug);
  const others = all.filter((c) => c.slug !== cat.slug);
  const main = `${hero({
    crumbs,
    kicker: 'Shop by category',
    h1: esc(cat.label),
    line: isBar ? 'A category on Greenstop\'s online menu.' : `Shop ${esc(cat.label.toLowerCase())} on Greenstop's online menu.`,
    ctas: `${btn(order, `Order ${cat.label} online`)}${btn('/products/', 'All products', 'btn btn--glass')}`,
    media,
    cls: 's-hero--cat',
  })}
<section class="band band--ink s-after s-format" aria-labelledby="format-h">
${clip('<div class="s-spray s-spray--l"></div>')}
<div class="wrap s-format__grid">
<div class="s-format__text" data-reveal>
<p class="kicker sticker">${isBar ? 'On the menu' : 'The format'}</p>
<h2 class="s-h2" id="format-h">About ${esc(cat.label)}</h2>
<div class="prose s-format__prose">${(FORMAT[cat.slug] || []).map((s) => `<p>${esc(s)}</p>`).join('')}</div>
${learn.length ? `<p class="s-label">Learn more</p><ul class="s-learn" role="list">${learn.map((g) => `<li><a class="link-arrow"${linkAttrs(g.href)}>${arrow(g.label)}</a></li>`).join('')}</ul>` : ''}
</div>
<div class="glass glass--strong s-panel" data-reveal style="--i:1">
<p class="kicker sticker">Order online</p>
<h3 class="s-panel__t">Order ${esc(cat.label)} online</h3>
<p class="s-panel__d">${isBar ? 'The Bud Bar opens on Greenstop\'s online menu.' : `The ${esc(cat.label)} category opens on Greenstop's online menu.`}</p>
${faqItem(ctx, 'Can I place an order online?') ? `<blockquote class="s-panel__q">${faqItem(ctx, 'Can I place an order online?').a_html}<footer>From Greenstop's <a${linkAttrs(FAQ)}>Frequently Asked Questions</a></footer></blockquote>` : ''}
<div class="btn-row">${btn(order, `Order ${cat.label} online`)}${btn('/in-store-pickup/', 'In-store Pickup', 'btn btn--glass')}</div>
</div>
</div>
</section>
${tape(all.map((c) => c.label))}
<section class="band band--stone s-others" aria-labelledby="others-h">
<div class="wrap">
<div class="s-head s-head--row" data-reveal><div><p class="kicker sticker">Keep browsing</p><h2 class="s-h2" id="others-h">Other categories</h2></div><a class="link-arrow s-head__link"${linkAttrs('/products/')}>${arrow('All products')}</a></div>
<ul class="s-tiles s-tiles--others" role="list">
${others.map((c, i) => tile(ctx, c, i, '(min-width: 1240px) 290px, (min-width: 1024px) 23vw, (min-width: 600px) 45vw, 92vw')).join('\n')}
</ul>
</div>
</section>
${dealBand(ctx)}`;
  const description = isBar
    ? 'Bud Bar is a category on the online menu of Greenstop Dispensary, 516 Tonnelle Ave, Jersey City. Open it on the menu to see what it holds.'
    : `${cat.label} at Greenstop Dispensary, 516 Tonnelle Ave, Jersey City: what the format is, and a link to order ${cat.label.toLowerCase()} on Greenstop's online menu.`;
  return shell(ctx, { path, title: cat.label + TAIL, description, crumbs, bodyClass: 'page-category cat-' + cat.slug, main });
}

// ---------- /our-brands/ ----------
function brandsPage(ctx) {
  const path = '/our-brands/';
  const crumbs = [{ label: 'Home', href: '/' }, { label: 'Brands' }];
  const list = brands(ctx);
  const media = `<div class="s-slap">
<div class="frame s-slap__frame" data-tilt="4">${gimg('g-glass-bud', { eager: true, sizes: '(min-width: 1024px) 420px, 72vw' })}</div>
<ul class="s-slap__stickers" aria-hidden="true">${list.slice(0, 6).map((b, i) => `<li class="sticker s-slap__s s-slap__s--${i + 1}">${esc(b.name)}</li>`).join('')}</ul>
</div>`;
  const cards = list.map((b, i) => `<li class="s-brands__item" data-reveal style="--i:${i % 4}"><article class="glass glass--lift s-brand">
<p class="sticker s-brand__sticker">${b.picks.length > 1 ? `${b.picks.length} staff picks` : 'Staff pick'}</p>
<h3 class="s-brand__name">${esc(b.name)}</h3>
<ul class="s-brand__picks" role="list">${b.picks.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
<a class="link-arrow s-brand__go"${linkAttrs('/about/')}>${arrow('Where it is mentioned')}</a>
</article></li>`).join('\n');
  const main = `${hero({
    crumbs,
    kicker: 'Brands',
    h1: 'Our Brands',
    line: 'Brands named in the staff picks on Greenstop\'s About page.',
    ctas: `${btn(cart(ctx), 'Order online')}${btn('/about/', 'About Greenstop', 'btn btn--glass')}`,
    media,
    cls: 's-hero--brands',
  })}
<section class="band band--ink s-after s-brands" aria-labelledby="brands-h">
${clip('<div class="s-spray s-spray--r"></div>')}
<div class="wrap">
<div class="s-head s-head--row" data-reveal><div><p class="kicker sticker">A to Z</p><h2 class="s-h2" id="brands-h">${list.length} brands from the staff picks</h2></div><p class="s-head__note">Each card lists the picks as they are named on the About page, with a link to where they are mentioned.</p></div>
<ul class="s-brands__grid" role="list">
${cards}
</ul>
</div>
</section>
${tape(list.map((b) => b.name), 's-tape--brands')}
<section class="band band--stone s-lineup" aria-labelledby="lineup-h">
<div class="wrap s-lineup__inner" data-reveal>
<h2 class="s-h2" id="lineup-h">The full lineup</h2>
<p class="s-lineup__line">This page lists only the brands named on Greenstop's About page. The full lineup is on Greenstop's online menu.</p>
<div class="btn-row">${btn(cart(ctx), 'Order online')}${btn('/products/', 'All products', 'btn btn--dark')}</div>
</div>
</section>`;
  return shell(ctx, { path, title: 'Our Brands' + TAIL, description: 'Brands named in the staff picks on the About page of Greenstop Dispensary, 516 Tonnelle Ave, Jersey City, with a link to the full lineup on the online menu.', crumbs, bodyClass: 'page-brands', main });
}

// ---------- /deals/ (Greenstop's captured deals page, every word) ----------
function dealsPage(ctx) {
  const d = dealWords(ctx);
  const rec = d.rec;
  const path = rec.path || '/deals/';
  const crumbs = [{ label: 'Home', href: '/' }, { label: 'Deals' }];
  const flyer = (b, i, sizes, extra = {}) => img({ src: b.src, alt: 'Greenstop promotion graphic', w: b.w, h: b.h }, { sizes, ...extra });
  const media = `<div class="s-flyers">${d.flyers.slice(0, 3).map((b, i) => `<div class="taped s-flyers__item s-flyers__item--${i + 1}"${i === 0 ? ' data-tilt="4"' : ''}>${flyer(b, i, '(min-width: 1024px) 520px, 88vw', i === 0 ? { eager: true } : {})}</div>`).join('')}
<div class="s-cutwrap s-flyers__cut" data-depth="0.14" aria-hidden="true">${gimg('g-can-cut', { alt: '', sizes: '(min-width: 1024px) 180px, 26vw', cls: 'cut' })}</div>
</div>`;
  const groups = d.groups.map((g, i) => `<li data-reveal style="--i:${i % 3}"><article class="glass glass--paper glass--lift s-offer">
<span class="s-offer__ico">${img({ src: g.icon, alt: '', w: g.iconW, h: g.iconH }, { sizes: '48px' })}</span>
<h3 class="s-offer__t">${esc(g.title)}</h3>
<p class="s-offer__d">${g.html}</p>
<span class="s-offer__pct" aria-hidden="true">5%</span>
</article></li>`).join('\n');
  const tiers = d.tiers.map((t, i) => {
    const amt = (String(t.title).match(/\$\d+/) || [''])[0];
    return `<li data-reveal style="--i:${i % 3}"><article class="glass glass--lift s-tier">
<span class="s-tier__amt stencil" aria-hidden="true">${esc(amt)}</span>
<span class="s-tier__ico">${img({ src: t.icon, alt: '', w: t.iconW, h: t.iconH }, { sizes: '44px' })}</span>
<h3 class="s-tier__t">${esc(t.title)}</h3>
<p class="s-tier__d">${t.html}</p>
</article></li>`;
  }).join('\n');
  const gallery = d.flyers.map((b, i) => `<li class="s-gallery__item" data-reveal style="--i:${i % 3}"><figure class="taped s-gallery__fig">${flyer(b, i, '(min-width: 1024px) 380px, (min-width: 600px) 46vw, 84vw')}</figure></li>`).join('\n');
  const main = `${hero({
    crumbs,
    kicker: 'Deals',
    h1: 'Deals',
    line: 'Extra savings for community heroes and points on every dollar, straight from Greenstop.',
    ctas: `${btn('#rewards', d.rewHead, 'btn btn--lime')}${btn('#discounts', d.discHead, 'btn btn--glass')}`,
    media,
    cls: 's-hero--deals',
  })}
<section class="band band--stone s-after s-disc" id="discounts" aria-labelledby="disc-h">
<div class="wrap">
<div class="s-head s-head--center" data-reveal><p class="kicker sticker">Community heroes</p><h2 class="s-h2" id="disc-h">${esc(d.discHead)}</h2><p class="lede s-disc__line">${d.discLine}</p></div>
<ul class="s-offers" role="list">
${groups}
</ul>
${d.idNote ? `<h3 class="s-idnote" data-reveal>${icon('id', 's-idnote__ico')}<span>${esc(d.idNote)}</span></h3>` : ''}
</div>
</section>
${tape(d.groups.map((g) => g.title), 's-tape--deals')}
<section class="band band--forest s-rew" id="rewards" aria-labelledby="rew-h" data-spot>
${clip(`<div class="band__bg s-rew__bg">${gimg('g-spray-haze', { alt: '', sizes: '100vw', cls: 'screen' })}</div>`)}
<div class="wrap">
<div class="s-rew__head" data-reveal>
<div><p class="kicker sticker">Loyalty</p><h2 class="s-h2" id="rew-h">${esc(d.rewHead)}</h2><p class="lede s-rew__line">${d.rewLine}</p></div>
${d.join ? `<div class="btn-row">${btn(d.join.href, d.join.text, 'btn btn--lime')}</div>` : ''}
</div>
<ol class="s-tiers" role="list">
${tiers}
</ol>
<div class="s-rew__faq">
${faqQuote(ctx, 'Do you have a loyalty program?', { i: 0, cls: 'glass--strong' })}
${faqQuote(ctx, 'Are there any discounts available?', { i: 1, cls: 'glass--strong' })}
</div>
</div>
</section>
<section class="band band--ink s-gallery" aria-labelledby="gallery-h">
${clip()}
<div class="wrap">
<div class="s-head s-head--row" data-reveal><div><p class="kicker sticker">Promo wall</p><h2 class="s-h2" id="gallery-h">Deal flyers</h2></div><p class="s-head__note">Promotion graphics from Greenstop's site, pasted up on one wall.</p></div>
<ul class="s-gallery__grid" role="list">
${gallery}
</ul>
<div class="btn-row s-gallery__cta">${btn(cart(ctx), 'Order online')}${btn('/products/', 'All products', 'btn btn--glass')}</div>
</div>
</section>`;
  return shell(ctx, { path, title: rec.title || 'Deals' + TAIL, description: rec.description || 'Deals at Greenstop Dispensary, 516 Tonnelle Ave, Jersey City: Special Discounts for veterans, police, medical workers, firefighters, students and senior citizens, and the Greenstop Rewards Program.', crumbs, bodyClass: 'page-deals', main });
}

// ---------- /online-ordering/ ----------
function orderingPage(ctx) {
  const path = '/online-ordering/';
  const crumbs = [{ label: 'Home', href: '/' }, { label: 'Online Ordering' }];
  const all = cats(ctx);
  const del = service(ctx, 'Door to Door Delivery');
  const media = `<div class="s-fan s-fan--order">
<div class="frame s-fan__card s-fan__card--b" aria-hidden="true">${gimg('g-edibles', { alt: '', sizes: '(min-width: 1024px) 340px, 50vw' })}</div>
<div class="frame s-fan__card s-fan__card--c" aria-hidden="true">${gimg('g-flower', { alt: '', sizes: '(min-width: 1024px) 340px, 50vw' })}</div>
<div class="frame s-fan__card s-fan__card--a" data-tilt="5">${gimg('g-prerolls', { eager: true, sizes: '(min-width: 1024px) 520px, 88vw' })}</div>
<div class="s-cutwrap s-fan__cut" data-depth="0.14" aria-hidden="true">${gimg('g-leaf-cut', { alt: '', sizes: '(min-width: 1024px) 230px, 32vw', cls: 'cut' })}</div>
</div>`;
  const main = `${hero({
    crumbs,
    kicker: 'Services',
    h1: 'Online Ordering',
    line: 'Place your order on Greenstop\'s online menu, then pick it up in store.',
    ctas: `${btn(cart(ctx), 'Order online')}${btn('/in-store-pickup/', 'In-store Pickup', 'btn btn--glass')}`,
    media,
    cls: 's-hero--order',
  })}
<section class="band band--ink s-after s-faqs" aria-labelledby="faqs-h">
${clip('<div class="s-spray s-spray--l"></div>')}
<div class="wrap">
<div class="s-head" data-reveal><p class="kicker sticker">In Greenstop's words</p><h2 class="s-h2" id="faqs-h">How ordering works</h2></div>
<div class="s-faqs__grid">
${faqQuote(ctx, 'Can I place an order online?', { i: 0 })}
${faqQuote(ctx, 'How does in-store pickup work?', { i: 1 })}
</div>
<p class="s-more" data-reveal><a class="link-arrow"${linkAttrs(FAQ)}>${arrow('Read the full FAQ')}</a></p>
</div>
</section>
<section class="band band--forest s-deliv" id="delivery" aria-labelledby="deliv-h">
${clip(`<div class="band__bg s-deliv__bg">${gimg('g-drips', { alt: '', sizes: '100vw' })}</div>`)}
<div class="wrap s-deliv__grid">
<div class="s-deliv__media" data-reveal>
<figure class="taped s-deliv__photo">${del ? photo(ctx, del.icon.replace(/^\/assets\/photos\//, ''), { alt: 'A hand passing a paper bag printed with a cannabis leaf to another hand.', sizes: '(min-width: 1024px) 380px, 70vw' }) : ''}</figure>
</div>
<div class="s-deliv__text">
<article class="glass glass--strong s-svc" data-reveal style="--i:1">
<p class="kicker sticker">Delivery</p>
<h2 class="s-svc__t" id="deliv-h">${esc(del ? del.title : 'Door to Door Delivery')}</h2>
${del && del.html ? `<p class="s-svc__d">${del.html}</p>` : ''}
</article>
${faqQuote(ctx, 'Do you offer delivery?', { i: 2, cls: 'glass--strong' })}
</div>
</div>
</section>
<section class="band band--stone s-menu" aria-labelledby="menu-h">
<div class="wrap s-menu__grid">
<div class="s-menu__text" data-reveal>
<p class="kicker sticker">The menu</p>
<h2 class="s-h2" id="menu-h">Order online</h2>
<p class="s-menu__line">Start with a category, or open the whole menu.</p>
<div class="btn-row">${btn(cart(ctx), 'Order online')}${btn('/products/', 'All products', 'btn btn--dark')}</div>
<ul class="s-chips" role="list">${all.map((c) => `<li><a class="chip s-chip"${linkAttrs(c.href)}>${esc(c.label)}</a></li>`).join('')}</ul>
</div>
${storeCard(ctx, { i: 1 })}
</div>
</section>`;
  return shell(ctx, { path, title: 'Online Ordering' + TAIL, description: 'Order online from Greenstop Dispensary, 516 Tonnelle Ave, Jersey City: how online ordering, in-store pickup and delivery work, in Greenstop\'s own words, with store hours and address.', crumbs, bodyClass: 'page-ordering', main });
}

// ---------- /in-store-pickup/ ----------
function pickupPage(ctx) {
  const path = '/in-store-pickup/';
  const crumbs = [{ label: 'Home', href: '/' }, { label: 'In-store Pickup' }];
  const pick = service(ctx, 'Pickup');
  const it = faqItem(ctx, 'How does in-store pickup work?');
  const steps = ['Place your order online', 'Select in-store pickup', 'Wait for the notification', 'Pick it up in store'];
  const media = `<div class="s-room">
<figure class="taped s-room__frame" data-tilt="4">${photo(ctx, 'gs/greenstop-room.jpg', { alt: 'A green-walled room with a GREENSTOP graffiti mural, a painted cannabis leaf and two large murals.', eager: true, sizes: '(min-width: 1024px) 560px, 92vw' })}</figure>
<div class="s-cutwrap s-room__cut" data-depth="0.14" aria-hidden="true">${gimg('g-leaf-cut', { alt: '', sizes: '(min-width: 1024px) 220px, 30vw', cls: 'cut' })}</div>
</div>`;
  const main = `${hero({
    crumbs,
    kicker: 'Services',
    h1: 'In-store Pickup',
    line: 'Order online, then pick it up at 516 Tonnelle Ave during business hours.',
    ctas: `${btn(cart(ctx), 'Order online')}${btn(ctx.site.mapUrl, 'Get Directions', 'btn btn--glass')}`,
    media,
    cls: 's-hero--pickup',
  })}
<section class="band band--ink s-after s-how" aria-labelledby="how-h">
${clip('<div class="s-spray s-spray--r"></div>')}
<div class="wrap">
<div class="s-head" data-reveal><p class="kicker sticker">In Greenstop's words</p><h2 class="s-h2" id="how-h">How pickup works</h2></div>
<div class="s-how__grid">
${it ? faqQuote(ctx, it.q, { i: 0, cls: 's-quote--big' }) : ''}
<ol class="s-steps" role="list">${steps.map((s, i) => `<li class="s-step" data-reveal style="--i:${i}"><span class="stencil s-step__n" aria-hidden="true">${pad(i + 1)}</span><span class="s-step__t">${esc(s)}</span></li>`).join('')}</ol>
</div>
<p class="s-more" data-reveal><a class="link-arrow"${linkAttrs(FAQ)}>${arrow('Read the full FAQ')}</a></p>
</div>
</section>
<section class="band band--stone s-visit" aria-labelledby="visit-h">
<div class="wrap s-visit__grid">
<article class="glass glass--paper glass--lift s-svc s-svc--pickup" data-reveal>
${pick ? `<span class="s-svc__ico">${img({ src: pick.icon, alt: '', w: pick.iconW, h: pick.iconH }, { sizes: '72px' })}</span>` : ''}
<p class="kicker sticker">Service</p>
<h2 class="s-svc__t" id="visit-h">${esc(pick ? pick.title : 'Pickup')}</h2>
<p class="s-svc__d">Order on the online menu and choose in-store pickup.</p>
<div class="btn-row">${btn(cart(ctx), 'Order online')}${btn('/online-ordering/', 'Online Ordering', 'btn btn--dark')}</div>
</article>
${storeCard(ctx, { i: 1 })}
</div>
</section>`;
  return shell(ctx, { path, title: 'In-store Pickup' + TAIL, description: 'In-store pickup at Greenstop Dispensary, 516 Tonnelle Ave, Jersey City: how it works in Greenstop\'s own words, with store hours, address and directions.', crumbs, bodyClass: 'page-pickup', main });
}

export async function render(ctx) {
  const all = cats(ctx);
  return [
    productsPage(ctx),
    ...all.map((c) => categoryPage(ctx, c, all)),
    brandsPage(ctx),
    dealsPage(ctx),
    orderingPage(ctx),
    pickupPage(ctx),
  ];
}
