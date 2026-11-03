// learn.mjs - LEARN lane: /blog/ (the adopted Blog hub with Greenstop's "The Greenstop Journal"), every post at its own
// /<slug>/ (article template), /education/ (the adopted Education hub) and /education/<slug>/ for every ctx.learn guide
// (article template with a sticky table of contents, NJ facts with their official source links, FAQ accordions).
// Classes are prefixed n- (FOUNDATION's component classes are used as is). No cross-lane imports. Guides that are not
// written yet are simply not rendered (the hub and the related lists use whatever exists).
import { esc, escA, href, linkAttrs, gimg, img, stripTags, absUrl, hasGenerated, imgUrl } from './util.mjs';
import { page, icon, crumbsHtml } from './shell.mjs';

const ORG = 'Greenstop Wellness';
const BRAND = 'Greenstop Dispensary';
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const fmtDate = (iso) => { const m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? `${MONTHS[+m[2] - 1]} ${+m[3]}, ${m[1]}` : ''; };
const ymd = (iso) => String(iso || '').slice(0, 10);
const wordCount = (html) => stripTags(html).split(/\s+/).filter(Boolean).length;
const readMin = (html) => Math.max(1, Math.round(wordCount(html) / 225));
function clip160(s) {
  const t = stripTags(s).replace(/\s+/g, ' ').trim();
  if (t.length <= 160) return t;
  const cut = t.slice(0, 158);
  const i = cut.lastIndexOf(' ');
  return (i > 80 ? cut.slice(0, i) : cut).replace(/[\s,;:.]+$/, '') + '…';
}

// guide groups, in the adopted Education order
const GROUPS = [
  { key: 'basics', label: 'Cannabis Basics', line: 'Strains, terpenes, THC and CBD, explained in plain language.' },
  { key: 'consumption', label: 'Consumption', line: 'Ways to consume, smoking and vaping, and using cannabis responsibly.' },
  { key: 'new-jersey', label: 'New Jersey', line: 'How adult-use and medical cannabis work in New Jersey, with links to the official sources.' },
];
const groupOf = (g) => GROUPS.find((x) => x.key === g.group) || GROUPS[0];
// generated mood art per guide (decorative, alt ''); a guide may name its own with "image"
const GUIDE_ART = {
  'guide-to-strains': 'g-flower', 'guide-to-terpenes': 'g-glass-bud', 'thc-and-cbd': 'g-tinctures', 'thc-tetrahydrocannabinol': 'g-concentrates',
  'routes-of-administration': 'g-edibles', 'respiratory-administration': 'g-vapes', 'safe-and-responsible-consumption': 'g-spray-haze',
  'recreational-cannabis': 'g-city-dusk', 'medical-cannabis': 'g-topicals', 'qualifying-conditions': 'g-prerolls',
};
const GROUP_ART = { basics: 'g-glass-bud', consumption: 'g-spray-haze', 'new-jersey': 'g-city-dusk' };
const artOf = (g) => g.image || GUIDE_ART[g.slug] || GROUP_ART[g.group] || 'g-glass-bud';

// ---------- small pieces ----------
const clipLayers = (mod = '') => `<div class="band__clip" aria-hidden="true"><span class="band__bg n-ground ${mod}"></span><span class="grain"></span></div>`;

// the wall behind every LEARN hero is FOUNDATION's .page-hero ground (wall still + scrim in ::before, glows in
// ::after); the lane adds only the fine grain, so the type keeps its dark, calm left side
const heroClip = () => `<div class="band__clip n-hero__clip" aria-hidden="true"><span class="n-hero__veil"></span><span class="grain"></span></div>`;

function hero({ crumbs, kicker, title, lede = '', meta = '', ctas = '', media = '', mod = '' }) {
  return `<section class="page-hero n-hero ${mod}" aria-labelledby="n-title">
${heroClip()}
<div class="wrap n-hero__grid">
<div class="n-hero__text">
${crumbsHtml(crumbs)}
${kicker ? `<p class="kicker sticker n-hero__kicker">${kicker}</p>` : ''}
<h1 class="display n-hero__title" id="n-title">${title}</h1>
${meta ? `<p class="n-hero__meta">${meta}</p>` : ''}
${lede ? `<p class="lede n-hero__lede">${lede}</p>` : ''}
${ctas ? `<div class="btn-row n-hero__ctas">${ctas}</div>` : ''}
</div>
${media ? `<div class="n-hero__media">${media}</div>` : ''}
</div>
</section>`;
}

// a photo or generated image in a taped frame that breaks the hero's bottom edge
const tapedFrame = (inner, mod = '') => `<figure class="frame taped n-frame ${mod}" data-tilt>${inner}</figure>`;

// trusted captured post html: classes from the old theme dropped, any h1 demoted, internal links in directory form,
// inline images given an empty alt and lazy loading when they have none
function prose(html) {
  return String(html || '')
    .replace(/\s+class="[^"]*"/g, '')
    .replace(/<h1(\s[^>]*)?>/gi, (m, a) => `<h2${a || ''}>`).replace(/<\/h1>/gi, '</h2>')
    .replace(/href="(\/[^"]*)"/g, (m, u) => `href="${escA(href(u))}"`)
    .replace(/<img\b([^>]*?)\s*\/?>/gi, (m, a) => `<img${a}${/\salt=/.test(a) ? '' : ' alt=""'}${/\sloading=/.test(a) ? '' : ' loading="lazy"'}>`);
}

// ---------- cards ----------
const CARD_SIZES = '(max-width: 599px) 112px, (min-width: 1180px) 380px, (min-width: 720px) 45vw, 92vw';
function postItem(p, listed) {
  const hit = listed.get(href(p.path)) || null;
  let dateText = fmtDate(p.date);
  let excerpt = clip160(p.excerpt || p.html || '');
  if (hit) {
    // Greenstop's own listing text "May 9, 2025<br>excerpt": the date goes to the meta line, the rest is the excerpt
    const parts = String(hit.html || '').split(/<br\s*\/?>/i);
    if (parts.length > 1) { dateText = stripTags(parts[0]).trim(); excerpt = parts.slice(1).join(' ').trim(); } else if (hit.html) excerpt = hit.html;
  }
  return { kind: 'post', path: href(p.path), title: hit && hit.title ? hit.title : p.title, date: p.date, dateText, excerpt, excerptHtml: !!hit, image: p.image && p.image.src ? p.image : null, minutes: readMin(p.html) };
}
function guideItem(g) {
  return { kind: 'guide', path: href(g.path || `/education/${g.slug}/`), title: g.title, date: g.date, dateText: '', excerpt: esc(g.description || stripTags(g.lede || '')), excerptHtml: true, gen: artOf(g), group: groupOf(g).label, minutes: g.readMinutes };
}
function cardMedia(it, opts = {}) {
  if (it.image) return img({ src: it.image.src, alt: '', w: it.image.w, h: it.image.h }, { sizes: CARD_SIZES, cls: 'n-card__img', alt: '', ...opts });
  return gimg(it.gen || 'g-glass-bud', { alt: '', sizes: CARD_SIZES, cls: 'n-card__img', ...opts });
}
function card(it, { num = null, i = 0, h = 'h3' } = {}) {
  const meta = it.kind === 'guide'
    ? `<span class="n-card__cat">${esc(it.group)}</span>${it.minutes ? `<span>${esc(it.minutes)} min read</span>` : ''}`
    : `<time datetime="${escA(ymd(it.date))}">${esc(it.dateText)}</time>`;
  return `<li class="n-grid__item" data-reveal style="--i:${i % 6}"><article class="acard n-card${it.kind === 'guide' ? ' n-card--guide' : ''}">
<span class="acard__media n-card__media">${cardMedia(it)}${num != null ? `<span class="stencil n-card__num" aria-hidden="true">${num}</span>` : ''}</span>
<span class="acard__meta n-card__meta">${meta}</span>
<${h} class="acard__title n-card__title"><a class="n-card__link"${linkAttrs(it.path)}>${esc(it.title)}</a></${h}>
${it.excerpt ? `<p class="n-card__excerpt">${it.excerptHtml ? it.excerpt : esc(it.excerpt)}</p>` : ''}
<span class="acard__more n-card__more" aria-hidden="true">${it.kind === 'guide' ? 'Read the guide' : 'Read the post'} ${icon('arrow')}</span>
</article></li>`;
}
const grid = (items, opts = {}) => `<ul class="n-grid${opts.cols ? ' n-grid--' + opts.cols : ''}" role="list">${items.map((it, i) => card(it, { i, num: opts.numbered ? i + 1 : null, h: opts.h || 'h3' })).join('\n')}</ul>`;

function head({ kicker, title, id, line = '', mod = '' }) {
  return `<header class="n-head ${mod}" data-reveal>${kicker ? `<p class="kicker sticker n-head__kicker">${kicker}</p>` : ''}<h2 class="display n-head__title" id="${escA(id)}">${title}</h2>${line ? `<p class="n-head__line">${line}</p>` : ''}</header>`;
}

// the shop band closing every post: Greenstop's own button labels, in-site links only
function shopBand(ctx) {
  const a = (ctx.site && ctx.site.address) || {};
  return `<section class="band band--forest n-shop" aria-labelledby="n-shop-title">
${clipLayers('n-ground--shop')}
<div class="drip-edge" data-drip aria-hidden="true"></div>
<div class="wrap n-shop__wrap">
<div class="glass n-shop__box" data-reveal>
<p class="kicker sticker">Shop Greenstop</p>
<h2 class="display n-shop__title" id="n-shop-title">Browse the menu</h2>
<p class="n-shop__line">Flower, pre-rolls, edibles, vapes and more, by category.${a.street ? ` Or come by the store at ${esc(a.street)}, ${esc(a.city)}.` : ''}</p>
<div class="btn-row"><a class="btn btn--lime"${linkAttrs('/products/')}>Shop Now ${icon('arrow')}</a><a class="btn btn--glass"${linkAttrs('/location/jersey-city-nj/')}>Visit Us</a></div>
</div>
<span class="cut n-shop__can" data-depth="0.12" aria-hidden="true">${gimg('g-can-cut', { alt: '', cls: 'n-shop__can-img', sizes: '(min-width: 1024px) 220px, 120px' })}</span>
</div>
</section>`;
}

const orgLd = (ctx) => ({ '@type': 'Organization', name: ORG, url: ctx.site.origin });

// ---------- /blog/ ----------
function blogHub(ctx, posts, items, guides) {
  const rec = ctx.content.blog || { sections: [] };
  const path = href(rec.path || '/blog/');
  const s1 = (rec.sections || [])[0] || { blocks: [] };
  const b1 = s1.blocks || [];
  const video = b1.find((b) => b.type === 'video');
  const kick = (b1.find((b) => b.type === 'h4') || {}).text || s1.heading || 'Discover, Learn & Grow';
  const h1 = (b1.find((b) => b.type === 'h3') || {}).text || 'The Greenstop Journal';
  const intro = b1.filter((b) => b.type === 'p').map((b) => b.html).join(' ');
  const poster = video ? video.src.replace(/\.mp4$/i, '.jpg') : '';
  const media = video ? `<div class="taped n-vframe" data-tilt><div class="glass n-vframe__pane" data-video-host>
<video class="n-vframe__video" muted playsinline loop preload="none" poster="${escA(poster)}" width="${escA(video.w)}" height="${escA(video.h)}" aria-hidden="true" data-inview-play><source src="${escA(video.src)}" type="video/mp4"></video>
<button class="video-toggle n-vframe__toggle" type="button" data-video-toggle aria-pressed="false"><span class="video-toggle__label">Pause motion</span></button>
</div></div>` : '';
  const ctas = `<a class="btn btn--lime" href="#n-latest">Read the latest ${icon('arrow')}</a><a class="btn btn--glass"${linkAttrs('/education/')}>Education guides</a>`;
  const crumbs = [{ label: 'Home', href: '/' }, { label: 'Blog' }];

  const feat = items[0];
  const featHtml = feat ? `<section class="band band--ink n-feat-band" id="n-latest" aria-labelledby="n-feat-title">
${clipLayers('n-ground--feat')}
<div class="wrap">
<article class="n-feat" data-reveal>
<a class="n-feat__media frame taped" ${linkAttrs(feat.path).trim()} tabindex="-1" aria-hidden="true">${cardMedia(feat, { sizes: '(min-width: 1024px) 700px, 92vw', cls: 'n-feat__img' })}</a>
<div class="glass glass--strong n-feat__body">
<p class="kicker sticker">Latest post</p>
<h2 class="display n-feat__title" id="n-feat-title"><a class="n-feat__link"${linkAttrs(feat.path)}>${esc(feat.title)}</a></h2>
<p class="n-feat__meta"><time datetime="${escA(ymd(feat.date))}">${esc(fmtDate(feat.date))}</time><span>${esc(feat.minutes)} min read</span></p>
<a class="link-arrow n-feat__more"${linkAttrs(feat.path)} aria-hidden="true" tabindex="-1">Read the post ${icon('arrow')}</a>
</div>
</article>
</div>
</section>` : '';

  const gridHtml = `<section class="band band--ink n-list-band" aria-labelledby="n-all">
${clipLayers('n-ground--list')}
<div class="wrap">
${head({ kicker: 'The Journal', title: 'All Posts', id: 'n-all', line: `${items.length} posts from the Greenstop team, newest first.` })}
${grid(items, { numbered: true })}
</div>
</section>`;

  // "Discover, Learn & Grow" closes the hub as the way into the education guides
  const learnBand = `<section class="band band--forest n-learn-band" aria-labelledby="n-learn">
${clipLayers('n-ground--learn')}
<div class="wrap n-learn-band__wrap">
<div class="n-learn-band__text" data-reveal>
<p class="kicker sticker">Education</p>
<h2 class="display n-head__title" id="n-learn">${esc(kick)}</h2>
<p class="n-head__line">Plain-language guides to cannabis basics, ways to consume and the New Jersey rules.</p>
<a class="btn btn--lime"${linkAttrs('/education/')}>Explore the guides ${icon('arrow')}</a>
</div>
${guides.length ? `<ul class="n-chiprow" role="list" data-reveal>${guides.map((g) => `<li><a class="chip n-chip"${linkAttrs(g.path || `/education/${g.slug}/`)}>${esc(g.title)}</a></li>`).join('')}</ul>` : ''}
</div>
</section>`;

  const main = `${hero({ crumbs, kicker: esc(kick), title: esc(h1), lede: intro, ctas, media, mod: 'n-hero--blog' })}
${featHtml}
${gridHtml}
${learnBand}`;
  const description = 'The Greenstop Journal from Greenstop Dispensary in Jersey City, NJ: cannabis culture, wellness tips, product education, and stories from our community.';
  return {
    path,
    html: page({
      ctx, path, title: rec.title || `Blog | ${BRAND}`, description: rec.description || description, canonical: absUrl(ctx, path), heroCrumbs: true, crumbs,
      og: { title: rec.title || `Blog | ${BRAND}`, description: rec.description || description, type: 'website', url: absUrl(ctx, path) },
      bodyClass: 'n-page n-page--blog', main,
      jsonld: { '@context': 'https://schema.org', '@type': 'Blog', name: h1, url: absUrl(ctx, path), publisher: orgLd(ctx), blogPost: posts.map((p) => ({ '@type': 'BlogPosting', headline: p.title, datePublished: p.date, url: absUrl(ctx, p.path) })) },
    }),
  };
}

// ---------- every post ----------
function postPage(ctx, p, it, items) {
  const path = it.path;
  const crumbs = [{ label: 'Home', href: '/' }, { label: 'Blog', href: '/blog/' }, { label: p.title }];
  const media = it.image ? tapedFrame(img({ src: it.image.src, alt: it.image.alt || '', w: it.image.w, h: it.image.h }, { sizes: '(min-width: 1024px) 520px, 92vw', eager: true, cls: 'n-frame__img' }), 'n-frame--post') : '';
  const meta = `<time datetime="${escA(ymd(p.date))}">${esc(fmtDate(p.date))}</time><span>${esc(it.minutes)} min read</span>`;
  // Greenstop's own Previous / Next links (captured on the live post)
  const navItems = [];
  for (const s of p.sections || []) for (const b of s.blocks || []) if (b.type === 'ul') for (const x of b.items || []) {
    const m = String(x).match(/<a\s+href="([^"]+)"[^>]*>([^<]+)<\/a>/i);
    if (m && /^(previous|next)$/i.test(m[2].trim())) navItems.push({ href: href(m[1]), label: m[2].trim() });
  }
  const titleOf = (u) => (items.find((x) => x.path === u) || {}).title || '';
  const pn = navItems.length ? `<nav class="n-pn" aria-label="Previous and next posts">${navItems.map((n) => `<a class="n-pn__link n-pn__link--${n.label.toLowerCase()}"${linkAttrs(n.href)}><span class="n-pn__dir">${n.label.toLowerCase() === 'previous' ? icon('arrow', 'n-pn__ico n-pn__ico--back') : ''}${esc(n.label)}${n.label.toLowerCase() === 'next' ? icon('arrow', 'n-pn__ico') : ''}</span>${titleOf(n.href) ? `<span class="n-pn__title">${esc(titleOf(n.href))}</span>` : ''}</a>`).join('')}</nav>` : '';
  const others = items.filter((x) => x.path !== path);
  const idx = items.findIndex((x) => x.path === path);
  const more = [...items.slice(idx + 1), ...items.slice(0, Math.max(0, idx))].filter((x) => x.path !== path).slice(0, 3);
  const keep = (more.length ? more : others.slice(0, 3));
  const main = `${hero({ crumbs, kicker: 'The Greenstop Journal', title: esc(p.title), meta, media, mod: 'n-hero--article n-hero--post' })}
<section class="band band--paper n-body n-body--post" aria-label="Article">
${clipLayers('n-ground--paper')}
<div class="wrap n-body__wrap">
<article class="prose n-prose">
${prose(p.html)}
</article>
${pn}
</div>
</section>
${keep.length ? `<section class="band band--ink n-more-band" aria-labelledby="n-keep">
${clipLayers('n-ground--list')}
<div class="wrap">
${head({ kicker: 'More from the Journal', title: 'Keep reading', id: 'n-keep' })}
${grid(keep, { cols: 3 })}
<p class="n-all"><a class="link-arrow"${linkAttrs('/blog/')}>All posts ${icon('arrow')}</a></p>
</div>
</section>` : ''}
${shopBand(ctx)}`;
  const can = absUrl(ctx, path);
  const image = it.image ? ctx.site.origin + it.image.src : null;
  const description = p.description || clip160(p.excerpt || p.html);
  return {
    path,
    html: page({
      ctx, path, title: p.seoTitle || `${p.title} | ${BRAND}`, description, canonical: can, heroCrumbs: true, crumbs,
      og: { title: p.seoTitle || p.title, description, type: 'article', url: can, ...(image ? { image } : {}) },
      bodyClass: 'n-page n-page--post', main,
      preload: [],
      jsonld: { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: p.title, description, datePublished: p.date, dateModified: p.modified || p.date, ...(image ? { image } : {}), mainEntityOfPage: can, author: orgLd(ctx), publisher: orgLd(ctx) },
    }),
  };
}

// ---------- /education/ ----------
function eduHub(ctx, guides, guideItems, postItems) {
  const path = '/education/';
  const crumbs = [{ label: 'Home', href: '/' }, { label: 'Education' }];
  const present = GROUPS.map((gr) => ({ ...gr, items: guides.map((g, i) => [g, guideItems[i]]).filter(([g]) => groupOf(g).key === gr.key).map(([, it]) => it) })).filter((gr) => gr.items.length);
  const ctas = present.length
    ? `<a class="btn btn--lime" href="#${escA(present[0].key)}">Start with ${esc(present[0].label === 'Cannabis Basics' ? 'the basics' : present[0].label)} ${icon('arrow')}</a>${present.find((x) => x.key === 'new-jersey') ? `<a class="btn btn--glass" href="#new-jersey">New Jersey rules</a>` : ''}`
    : `<a class="btn btn--lime"${linkAttrs('/blog/')}>Read the Journal ${icon('arrow')}</a>`;
  const media = tapedFrame(gimg('g-glass-bud', { alt: '', sizes: '(min-width: 1024px) 400px, 70vw', eager: true, cls: 'n-frame__img' }), 'n-frame--tall');
  const jump = present.length > 1 ? `<nav class="n-jump" aria-label="Guide topics"><ul role="list">${present.map((gr) => `<li><a class="chip n-chip"${linkAttrs('#' + gr.key)}>${esc(gr.label)} <span class="n-chip__n">${gr.items.length}</span></a></li>`).join('')}</ul></nav>` : '';
  const groupsHtml = present.length ? present.map((gr, gi) => `<section class="n-group" id="${escA(gr.key)}" aria-labelledby="n-g-${escA(gr.key)}">
<header class="n-group__head" data-reveal><span class="stencil n-group__num" aria-hidden="true">${gi + 1}</span><div><h2 class="display n-head__title" id="n-g-${escA(gr.key)}">${esc(gr.label)}</h2><p class="n-head__line">${esc(gr.line)}</p></div></header>
${grid(gr.items, { cols: gr.items.length >= 4 ? 4 : 3 })}
</section>`).join('\n') : `<p class="n-empty">The guides are on their way. Meanwhile, the Greenstop Journal has posts on cannabis culture and wellness.</p>`;
  const journal = postItems.length ? `<section class="band band--forest n-journal-band" aria-labelledby="n-journal">
${clipLayers('n-ground--learn')}
<div class="wrap">
${head({ kicker: 'Greenstop’s own posts', title: 'From the Greenstop Journal', id: 'n-journal', line: 'Stories, tips and product education from the Greenstop team.' })}
${grid(postItems.slice(0, 4), { cols: 4 })}
<p class="n-all"><a class="link-arrow"${linkAttrs('/blog/')}>All posts ${icon('arrow')}</a></p>
</div>
</section>` : '';
  const main = `${hero({ crumbs, kicker: 'Education', title: 'Cannabis Education', lede: 'Plain-language guides to cannabis basics, ways to consume and the New Jersey rules. The New Jersey guides link every fact to its official source.', ctas, media, mod: 'n-hero--edu' })}
<section class="band band--ink n-groups" aria-label="Guides">
${clipLayers('n-ground--list')}
<div class="wrap">
${jump}
${groupsHtml}
</div>
</section>
${journal}`;
  const description = 'Plain-language cannabis guides from Greenstop Dispensary in Jersey City, NJ: strains, terpenes, THC and CBD, ways to consume, responsible use, and New Jersey adult-use and medical cannabis.';
  return {
    path,
    html: page({
      ctx, path, title: `Cannabis Education | ${BRAND}`, description, canonical: absUrl(ctx, path), heroCrumbs: true, crumbs,
      og: { title: `Cannabis Education | ${BRAND}`, description, type: 'website', url: absUrl(ctx, path) },
      bodyClass: 'n-page n-page--edu', main,
      jsonld: { '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Cannabis Education', url: absUrl(ctx, path), isPartOf: { '@type': 'WebSite', name: ORG, url: ctx.site.origin }, hasPart: guideItems.map((it) => ({ '@type': 'Article', headline: it.title, url: absUrl(ctx, it.path) })) },
    }),
  };
}

// ---------- /education/<slug>/ ----------
function guidePage(ctx, g, it, guides, guideItems) {
  const path = it.path;
  const gr = groupOf(g);
  const crumbs = [{ label: 'Home', href: '/' }, { label: 'Education', href: '/education/' }, { label: g.title }];
  const facts = new Map(((ctx.nj && ctx.nj.facts) || []).map((f) => [f.id, f]));
  const sources = new Map(((ctx.nj && ctx.nj.sources) || []).map((s) => [s.id, s]));
  const used = new Map();
  const ids = new Set();
  const uid = (t) => { const base = String(t).toLowerCase().replace(/<[^>]+>/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'section'; let id = base; let n = 2; while (ids.has(id)) id = `${base}-${n++}`; ids.add(id); return id; };
  const factsHtml = (b) => {
    const rows = (b.ids || []).map((id) => facts.get(id)).filter(Boolean).map((f) => {
      const s = sources.get(f.sourceId);
      if (s) used.set(s.id, s);
      return `<li class="n-facts__item"><span class="n-facts__text">${esc(f.statement)}</span>${s ? ` <a class="n-facts__src"${linkAttrs(s.url)}>${esc(s.title)}${icon('ext', 'n-facts__ico')}<span class="n-sr"> (opens the official source in a new tab)</span></a>` : ''}</li>`;
    });
    return rows.length ? `<aside class="n-facts" aria-label="Official sources for this section"><p class="n-facts__label">${icon('id', 'n-facts__badge')}From official New Jersey sources</p><ul class="n-facts__list" role="list">${rows.join('')}</ul></aside>` : '';
  };
  const block = (b) => {
    switch (b.type) {
      case 'p': return `<p>${prose(b.html)}</p>`;
      case 'ul': case 'ol': return `<${b.type}>${(b.items || []).map((x) => `<li>${prose(typeof x === 'string' ? x : x.html || esc(x.text || ''))}</li>`).join('')}</${b.type}>`;
      case 'callout': return `<aside class="n-callout">${b.title ? `<p class="n-callout__title">${icon('leaf', 'n-callout__ico')}${esc(b.title)}</p>` : ''}${b.html ? `<p>${prose(b.html)}</p>` : ''}${Array.isArray(b.items) ? `<ul>${b.items.map((x) => `<li>${prose(x)}</li>`).join('')}</ul>` : ''}</aside>`;
      case 'facts': return factsHtml(b);
      case 'h3': case 'h4': return `<${b.type}>${esc(b.text)}</${b.type}>`;
      default: return b.html ? `<p>${prose(b.html)}</p>` : b.text ? `<p>${esc(b.text)}</p>` : '';
    }
  };
  const secs = (g.sections || []).filter((s) => s && (s.heading || (s.blocks || []).length)).map((s) => ({ ...s, id: uid(s.heading || 'section') }));
  const body = secs.map((s) => `<section class="n-sec" aria-labelledby="${escA(s.id)}">
${s.heading ? `<h2 id="${escA(s.id)}">${esc(s.heading)}</h2>` : ''}
${(s.blocks || []).map(block).join('\n')}
</section>`).join('\n');
  const faq = (g.faq || []).filter((q) => q && q.q);
  const faqId = faq.length ? uid('common-questions') : '';
  const faqHtml = faq.length ? `<section class="n-sec n-sec--faq" aria-labelledby="${faqId}">
<h2 id="${faqId}">Common questions</h2>
<div class="faq n-faq">${faq.map((q) => `<details class="faq__item n-faq__item"><summary class="faq__q n-faq__q">${esc(q.q)}${icon('plus', 'n-faq__ico')}</summary><div class="faq__a n-faq__a">${prose(q.a_html || '')}</div></details>`).join('')}</div>
</section>` : '';
  const srcList = [...used.values()];
  const srcId = srcList.length ? uid('sources') : '';
  const srcHtml = srcList.length ? `<section class="n-sec n-sec--sources" aria-labelledby="${srcId}">
<h2 id="${srcId}">Sources</h2>
<ul class="n-sources" role="list">${srcList.map((s) => `<li><a${linkAttrs(s.url)}>${esc(s.title)}${icon('ext', 'n-facts__ico')}</a>${s.publisher ? `<span class="n-sources__pub">${esc(s.publisher)}</span>` : ''}</li>`).join('')}</ul>
${ctx.nj && ctx.nj.retrieved ? `<p class="n-sources__note">Official pages checked on ${esc(fmtDate(ctx.nj.retrieved))}.</p>` : ''}
</section>` : '';
  const toc = [...secs.filter((s) => s.heading).map((s) => ({ id: s.id, text: s.heading })), ...(faqId ? [{ id: faqId, text: 'Common questions' }] : []), ...(srcId ? [{ id: srcId, text: 'Sources' }] : [])];
  const tocHtml = toc.length >= 3 ? `<nav class="glass glass--paper n-toc" aria-labelledby="n-toc-title"><p class="n-toc__title" id="n-toc-title">In this guide</p><ol class="n-toc__list">${toc.map((t, i) => `<li><a href="#${escA(t.id)}"><span class="n-toc__n" aria-hidden="true">${i + 1}</span><span>${esc(t.text)}</span></a></li>`).join('')}</ol></nav>` : '';
  const note = g.note || 'Educational content, not medical or legal advice.';
  const rel = (g.related || []).map((slug) => guideItems[guides.findIndex((x) => x.slug === slug)]).filter((x) => x && x.path !== path);
  const fill = guideItems.filter((x) => x.path !== path && !rel.includes(x) && x.group === it.group);
  const related = [...rel, ...fill].slice(0, 3);
  const meta = `<span>By ${esc(ORG)}</span>${g.readMinutes ? `<span>${esc(g.readMinutes)} min read</span>` : ''}${g.lastReviewed ? `<span>Reviewed ${esc(g.lastReviewed)}</span>` : ''}`;
  const media = tapedFrame(gimg(it.gen, { alt: '', sizes: '(min-width: 1024px) 520px, 92vw', eager: true, cls: 'n-frame__img' }), 'n-frame--guide');
  const main = `${hero({ crumbs, kicker: esc(g.kicker || gr.label), title: esc(g.title), meta, lede: g.lede ? esc(stripTags(g.lede)) : '', media, mod: 'n-hero--article n-hero--guide' })}
<section class="band band--paper n-body n-body--guide${tocHtml ? ' n-body--toc' : ''}" aria-label="Guide">
${clipLayers('n-ground--paper')}
<div class="wrap n-body__wrap">
${tocHtml}
<article class="prose n-prose">
<p class="n-note" role="note">${icon('id', 'n-note__ico')}<span>${esc(note)}</span></p>
${body}
${faqHtml}
${srcHtml}
</article>
</div>
</section>
${related.length ? `<section class="band band--ink n-more-band" aria-labelledby="n-rel">
${clipLayers('n-ground--list')}
<div class="wrap">
${head({ kicker: 'Keep learning', title: 'Related guides', id: 'n-rel' })}
${grid(related, { cols: 3 })}
<p class="n-all"><a class="link-arrow"${linkAttrs('/education/')}>All guides ${icon('arrow')}</a></p>
</div>
</section>` : ''}`;
  const can = absUrl(ctx, path);
  const image = hasGenerated(it.gen) ? ctx.site.origin + imgUrl(it.gen, 1440) : null;
  const description = g.description || clip160(g.lede || '');
  const ld = [{ '@context': 'https://schema.org', '@type': 'Article', headline: g.title, description, datePublished: g.date, dateModified: g.modified || g.date, ...(image ? { image } : {}), mainEntityOfPage: can, author: orgLd(ctx), publisher: orgLd(ctx) }];
  if (faq.length) ld.push({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map((q) => ({ '@type': 'Question', name: q.q, acceptedAnswer: { '@type': 'Answer', text: stripTags(q.a_html || '') } })) });
  return {
    path,
    html: page({
      ctx, path, title: g.seoTitle || `${g.title} | ${BRAND}`, description, canonical: can, heroCrumbs: true, crumbs,
      og: { title: g.seoTitle || g.title, description, type: 'article', url: can, ...(image ? { image } : {}) },
      bodyClass: 'n-page n-page--guide', main, jsonld: ld,
    }),
  };
}

export async function render(ctx) {
  const posts = (ctx.posts || []).filter((p) => p && p.path && p.title).slice().sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
  // the /blog/ page's captured icon-box list is Greenstop's own card text (title + "date<br>excerpt"): reuse it
  const listed = new Map();
  for (const s of ((ctx.content || {}).blog || {}).sections || []) for (const b of s.blocks || []) if (b.type === 'icon-box' && b.href) listed.set(href(b.href), b);
  const items = posts.map((p) => postItem(p, listed));
  const guides = (ctx.learn || []).filter((g) => g && g.slug && g.title && Array.isArray(g.sections));
  const guideItems = guides.map(guideItem);
  // the hub's "From the Greenstop Journal": Greenstop's educational posts first (guides, how-tos, NJ law, wellness)
  const EDU = /guide|navigating|benefits|wellness|choosing/i;
  const eduPosts = [...items.filter((x) => EDU.test(x.path)), ...items.filter((x) => !EDU.test(x.path))];

  const out = [blogHub(ctx, posts, items, guides)];
  posts.forEach((p, i) => out.push(postPage(ctx, p, items[i], items)));
  out.push(eduHub(ctx, guides, guideItems, eduPosts));
  guides.forEach((g, i) => out.push(guidePage(ctx, g, guideItems[i], guides, guideItems)));
  return out;
}
