// shell.mjs - the page chrome (FOUNDATION, "STREET GLASS"): <head>, store top bar, main bar (logo, nav with image-card
// dropdown panels, Shop Now), drawer below 1024px, the three-card CTA row (trio), footer with the painted GREENSTOP
// wordmark, the 21+ gate. Exports and the page() signature are FIXED (every lane calls them):
//   page({ ctx, path, title, description, canonical, og, jsonld, bodyClass, main, crumbs, heroCrumbs, scripts, preload, noTrio })
//     main       the page's <main> INNER html (page() wraps it in <main id="main">)
//     crumbs     [{ label, href }, ...] or [[href, label], ...] (last = current page). Printed in a bar under the header
//                unless heroCrumbs is true (then the template prints crumbsHtml(crumbs) inside its own hero). A
//                BreadcrumbList JSON-LD is added from crumbs unless the template passes one.
//     og         { title, description, type, image, url } (image defaults to the g-hero-wall still, absolute)
//     jsonld     object or array -> <script type="application/ld+json">
//     scripts    extra script file names under /assets/js/ (site.js always loads)
//     preload    [{ href, as, type, media, imagesrcset, imagesizes, fetchpriority, crossorigin }] -> <link rel="preload">
//     noTrio     true = skip the three-card CTA row that sits above the footer on every inner page (home never has it)
//   hoursHtml(ctx, cls), icon(name, cls), crumbsHtml(crumbs), ctaTrio(ctx, path), CSS_ORDER
// Every word in the chrome comes from ctx.site / ctx.ia (Greenstop's own) except neutral glue labels (Menu, Store hours,
// Shop all products, Back to top, the gate buttons).
import { esc, escA, attrs, href, linkAttrs, absUrl, gimg, img, imgUrl, hasGenerated } from './util.mjs';

export const CSS_ORDER = ['fonts', 'tokens', 'base', 'components', 'motion', 'shell', 'home', 'shop', 'learn', 'pages', 'mobile', 'fix'];

const ICONS = {
  ext: '<path d="M7 17 17 7"/><path d="M8 7h9v9"/>',
  chev: '<path d="m6 9 6 6 6-6"/>',
  menu: '<path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h11"/>',
  close: '<path d="M6 6l12 12"/><path d="M18 6 6 18"/>',
  pin: '<path d="M19 10c0 5.6-7 11-7 11s-7-5.4-7-11a7 7 0 0 1 14 0Z"/><circle cx="12" cy="10" r="2.6"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  bag: '<path d="M5.5 8h13l-1 12.5h-11L5.5 8Z"/><path d="M9 8V7a3 3 0 0 1 6 0v1"/>',
  truck: '<path d="M2.5 6.5h11v9.5h-11z"/><path d="M13.5 10h4l3 3.2V16h-7"/><circle cx="6.5" cy="17.5" r="1.7"/><circle cx="17" cy="17.5" r="1.7"/>',
  user: '<circle cx="12" cy="8" r="3.8"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>',
  cart: '<path d="M3 4h2.2l2.3 11h10.3L20 7.5H6.4"/><circle cx="9.2" cy="19" r="1.4"/><circle cx="16.6" cy="19" r="1.4"/>',
  search: '<circle cx="10.8" cy="10.8" r="6.6"/><path d="m20 20-4.4-4.4"/>',
  arrow: '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
  tag: '<path d="M12.6 2.8H4.8a2 2 0 0 0-2 2v7.8l8.6 8.6a2.2 2.2 0 0 0 3.1 0l6.7-6.7a2.2 2.2 0 0 0 0-3.1Z"/><circle cx="8" cy="8" r="1.3"/>',
  id: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="12" r="2.2"/><path d="M14 10h4M14 14h4"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  gift: '<rect x="3.5" y="8.5" width="17" height="12" rx="1"/><path d="M12 8.5v12M3.5 12.5h17"/><path d="M12 8.5c-1.6-3.6-5.5-3.8-5.5-1.3 0 1.8 3.4 1.3 5.5 1.3 2.1 0 5.5.5 5.5-1.3 0-2.5-3.9-2.3-5.5 1.3Z"/>',
  phone: '<path d="M5 3.5h3.6l1.8 4.6-2.4 1.6a11 11 0 0 0 6.3 6.3l1.6-2.4 4.6 1.8V19a1.8 1.8 0 0 1-1.9 1.8A16.5 16.5 0 0 1 3.2 5.4 1.8 1.8 0 0 1 5 3.5Z"/>',
  star: '<path d="m12 3.2 2.7 5.5 6 .9-4.35 4.25 1.03 6L12 17l-5.38 2.85 1.03-6L3.3 9.6l6-.9Z"/>',
  leaf: '<path d="M5 20c0-8.5 5.5-14 15-15-.6 9.5-6.4 15-15 15Z"/><path d="m5 20 8.5-8.5"/>',
  mail: '<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="m3.5 7 8.5 6.5L20.5 7"/>',
  up: '<path d="M12 19V5"/><path d="m6 11 6-6 6 6"/>',
  instagram: '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="0.9"/>',
  facebook: '<path d="M14.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.6 1.6-1.6h1.6V4.3a21 21 0 0 0-2.4-.1c-2.4 0-3.9 1.4-3.9 4v2.3H8.8v3h2.6V21"/>',
  tiktok: '<path d="M14 3.5v11.2a3.6 3.6 0 1 1-3.6-3.6"/><path d="M14 3.5c.4 2.6 2.2 4.4 5 4.6"/>',
  yelp: '<path d="M10.8 3.4c.9-.3 2 .1 2 1.1v7.3c0 .8-1 1.1-1.5.5L6.7 6.6c-.5-.6-.3-1.4.4-1.7Z"/><path d="m13.8 14.2 5.6 1.8c.8.3 1 1.2.4 1.8l-2.2 2.4c-.6.6-1.5.4-1.8-.4l-1.9-4.7c-.2-.6.3-1.1.9-.9Z"/><path d="m14 11.7 4.8-2.6c.7-.4 1.6 0 1.7.8l.3 2.8c.1.8-.6 1.4-1.4 1.2l-5.1-1c-.6-.1-.8-1-.3-1.2Z"/><path d="m11.4 15.1-.3 5.5c0 .8-.8 1.3-1.6 1l-2.6-1.2c-.7-.3-.9-1.2-.3-1.8l3.6-4c.4-.5 1.2-.2 1.2.5Z"/>',
};
export function icon(name, cls = '') {
  return `<svg class="ico${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[name] || ICONS.arrow}</svg>`;
}

// crumbs: [{ label, href }] or [[href, label]]; the last one is the current page. Separators are drawn by CSS ("/").
const crumbParts = (c) => (Array.isArray(c) ? { href: c[0], label: c[1] } : c || {});
export function crumbsHtml(crumbs = []) {
  if (!crumbs || !crumbs.length) return '';
  return `<nav class="crumbs" aria-label="Breadcrumb"><ol>${crumbs.map((raw, i) => {
    const c = crumbParts(raw);
    return `<li>${i < crumbs.length - 1 && c.href ? `<a${linkAttrs(c.href)}>${esc(c.label)}</a>` : `<span aria-current="page">${esc(c.label)}</span>`}</li>`;
  }).join('')}</ol></nav>`;
}

// ---------- shared bits ----------
const pathOf = (h) => href(String(h || '')).split('#')[0].split('?')[0];
const isCur = (h, path) => !!h && !/^(https?:)?\/\//i.test(h) && !String(h).includes('#') && pathOf(h) === path;
const cur = (h, path) => (isCur(h, path) ? ' aria-current="page"' : '');
const addrLine = (s) => { const a = s.address || {}; return `${a.street}, ${a.city}, ${a.state} ${a.zip}`; };
const ig = (s) => (s.socials || []).find((x) => /instagram/i.test(x.name)) || null;

function logoImg(ctx, cls, eager) {
  const L = ctx.site.logo || {};
  return `<img${attrs({ class: cls, src: L.white, width: L.w, height: L.h, alt: ctx.site.name, decoding: 'async', loading: eager ? 'eager' : 'lazy' })}>`;
}

// the hours rows (site.json hours: [{ days, open, close }])
export function hoursHtml(ctx, cls = '') {
  const h = (ctx.site && ctx.site.hours) || [];
  return `<ul class="hours${cls ? ' ' + cls : ''}">${h.map((r) => `<li><span>${esc(r.days)}</span> <span>${esc(r.open)} to ${esc(r.close)}</span></li>`).join('')}</ul>`;
}

// ---------- dropdown panels ----------
function linkList(links, path, cls = '') {
  return `<ul class="mega__links${cls}">${links.map((l) => `<li><a class="mega__link"${linkAttrs(l.href)}${cur(l.href, path)}><span>${esc(l.label)}</span>${icon('arrow', 'ico--go')}</a></li>`).join('')}</ul>`;
}

function featureCard(ctx, f, sub) {
  if (!f) return '';
  const media = f.gimg ? gimg(f.gimg, { alt: '', sizes: '(min-width: 1024px) 360px, 140px' })
    : f.photo ? img({ src: f.photo, alt: '' }, { sizes: '(min-width: 1024px) 360px, 140px' }) : '';
  return `<a class="mega__card"${linkAttrs(f.href)}>
<span class="mega__media">${media}</span>
<span class="mega__card-body"><span class="mega__card-t">${esc(f.title)}</span>${sub ? `<span class="mega__card-l">${esc(sub)}</span>` : ''}</span>
<span class="mega__card-go" aria-hidden="true">${icon('arrow')}</span>
</a>`;
}

const SERVICE_ICONS = { '/online-ordering/': 'cart', '/in-store-pickup/': 'bag', '/online-ordering/#delivery': 'truck', '/location/jersey-city-nj/': 'pin' };

function panelInner(ctx, it, path) {
  const kids = it.children || [];
  if (kids.some((k) => k.gimg)) { // Products: the 8 category image cards
    return `<div class="mega__head"><p class="mega__h">${esc(it.label)}</p><a class="mega__all"${linkAttrs(it.href)}${cur(it.href, path)}>Shop all products${icon('arrow')}</a></div>
<ul class="mega__tiles">${kids.map((k) => `<li><a class="mega__tile"${linkAttrs(k.href)}${cur(k.href, path)}><span class="mega__tile-media">${gimg(k.gimg, { alt: '', sizes: '(min-width: 1024px) 260px, 45vw' })}</span><span class="mega__tile-t">${esc(k.label)}</span></a></li>`).join('')}</ul>`;
  }
  if (it.feature) { // About / Education: links + a feature image card
    const sub = it.feature.photo ? addrLine(ctx.site) : '';
    const cols = kids.length > 6 ? ' mega__links--cols' : '';
    return `<div class="mega__col"><p class="mega__h">${esc(it.label)}</p>${linkList(kids, path, cols)}</div>
<div class="mega__feature">${featureCard(ctx, it.feature, sub)}</div>`;
  }
  // Services: icon cards
  return `<div class="mega__col mega__col--full"><p class="mega__h">${esc(it.label)}</p><ul class="mega__icons">${kids.map((k) => `<li><a class="mega__icon-card"${linkAttrs(k.href)}${cur(k.href, path)}><span class="mega__icon">${icon(SERVICE_ICONS[k.href] || 'arrow')}</span><span class="mega__icon-t">${esc(k.label)}</span>${icon('arrow', 'ico--go')}</a></li>`).join('')}</ul></div>`;
}

function navHtml(ctx, path) {
  const s = ctx.site;
  const items = (ctx.ia.nav || []).map((it) => {
    const kids = it.children || [];
    const owns = isCur(it.href, path) || kids.some((k) => isCur(k.href, path) || (k.href && pathOf(k.href) === path && !String(k.href).includes('#')));
    if (!kids.length) {
      return `<li class="nav__item${owns ? ' is-current' : ''}"><div class="nav__row"><a class="nav__link"${linkAttrs(it.href)}${cur(it.href, path)}>${esc(it.label)}</a></div></li>`;
    }
    const id = 'mega-' + it.label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const kind = kids.some((k) => k.gimg) ? 'tiles' : it.feature ? 'feature' : 'icons';
    return `<li class="nav__item has-panel${owns ? ' is-current' : ''}" data-mega>
<div class="nav__row"><a class="nav__link"${linkAttrs(it.href)}${cur(it.href, path)}>${esc(it.label)}</a><button class="nav__more" type="button" aria-expanded="false" aria-controls="${id}" data-dropdown-trigger>${icon('chev', 'ico--chev')}<span class="sr-only">${esc(it.label)} menu</span></button></div>
<div class="mega mega--${kind}" id="${id}" data-dropdown-panel>
<div class="mega__panel wrap wrap--wide">${panelInner(ctx, it, path)}</div>
</div>
</li>`;
  }).join('\n');
  const insta = ig(s);
  return `<nav class="nav" id="site-nav" aria-label="Main" data-nav>
<div class="nav__drawer-head"><a class="brand brand--drawer"${linkAttrs('/')}>${logoImg(ctx, 'brand__logo', false)}</a><button class="nav__close" type="button" data-nav-close>${icon('close')}<span class="sr-only">Close menu</span></button></div>
<ul class="nav__list">
${items}
</ul>
<div class="nav__drawer-foot">
<a class="btn btn--lime btn--block"${linkAttrs(ctx.ia.cta.href)}>${esc(ctx.ia.cta.label)}${icon('arrow')}</a>
<div class="nav__store">
<a class="nav__store-row"${linkAttrs(s.mapUrl)}>${icon('pin')}<span>${esc(addrLine(s))}</span></a>
<a class="nav__store-row"${linkAttrs(s.phoneHref)}>${icon('phone')}<span>${esc(s.phone)}</span></a>
<div class="nav__store-row nav__store-hours">${icon('clock')}${hoursHtml(ctx)}</div>
${insta ? `<a class="nav__store-row"${linkAttrs(insta.url)}>${icon('instagram')}<span>${esc(insta.handle || insta.name)}</span></a>` : ''}
</div>
</div>
</nav>`;
}

function topbarHtml(ctx) {
  const s = ctx.site;
  const a = s.address || {};
  const tb = ctx.ia.topbar || {};
  const insta = ig(s);
  return `<div class="topbar">
<div class="topbar__inner wrap wrap--wide">
<a class="topbar__item topbar__addr"${linkAttrs(s.mapUrl)}>${icon('pin')}<span class="topbar__full">${esc(addrLine(s))}</span><span class="topbar__short">${esc(a.street)}</span></a>
<div class="topbar__hours" data-dropdown>
<button class="topbar__item topbar__hours-btn" type="button" aria-expanded="false" aria-controls="hours-pop" data-dropdown-trigger>${icon('clock')}<span>${esc(tb.hoursLabel || 'Store hours')}</span>${icon('chev', 'ico--chev')}</button>
<div class="topbar__pop" id="hours-pop" data-dropdown-panel>
<p class="topbar__pop-h">Store hours</p>
${hoursHtml(ctx, 'topbar__hours-list')}
<p class="topbar__pop-addr">${icon('pin')}<span>${esc(addrLine(s))}</span></p>
<div class="topbar__pop-links"><a class="btn btn--lime btn--sm"${linkAttrs(s.mapUrl)}>Get Directions</a><a class="btn btn--ghost btn--sm"${linkAttrs(s.phoneHref)}>${icon('phone')}${esc(s.phone)}</a></div>
</div>
</div>
<a class="topbar__item topbar__phone"${linkAttrs(s.phoneHref)}>${icon('phone')}<span>${esc(s.phone)}</span></a>
${insta ? `<a class="topbar__item topbar__ig"${linkAttrs(insta.url)}>${icon('instagram')}<span>${esc(insta.handle || insta.name)}</span></a>` : ''}
</div>
</div>`;
}

function headerHtml(ctx, path) {
  return `${topbarHtml(ctx)}
<header class="site-header" data-header>
<div class="mainbar wrap wrap--wide">
<a class="brand"${linkAttrs('/')}${path === '/' ? ' aria-current="page"' : ''}>${logoImg(ctx, 'brand__logo', true)}</a>
${navHtml(ctx, path)}
<div class="header-tools">
<a class="btn btn--lime btn--sm header-cta"${linkAttrs(ctx.ia.cta.href)}${cur(ctx.ia.cta.href, path)}>${esc(ctx.ia.cta.label)}</a>
<button class="nav-toggle" type="button" aria-controls="site-nav" aria-expanded="false" data-nav-toggle>${icon('menu')}<span class="sr-only">Open menu</span></button>
</div>
</div>
</header>
<div class="nav-scrim" data-nav-scrim hidden></div>`;
}

// ---------- the trio: three glass cards over a spray-haze wall, above the footer on every inner page ----------
export function ctaTrio(ctx, path) {
  const t = (ctx.ia && ctx.ia.trio) || [];
  if (!t.length) return '';
  return `<section class="trio" aria-label="More from Greenstop">
<div class="trio__clip" aria-hidden="true">${gimg('g-hero-wall', { alt: '', cls: 'band__bg', sizes: '100vw' })}${gimg('g-spray-haze', { alt: '', cls: 'haze', sizes: '100vw' })}<span class="grain"></span></div>
<div class="wrap">
<div class="trio__grid">
${t.map((c, i) => `<a class="trio__card glass glass--lift"${linkAttrs(c.href)}${cur(c.href, path)} data-reveal style="--i:${i}">
<span class="trio__media">${c.gimg ? gimg(c.gimg, { alt: '', sizes: '(min-width: 1024px) 400px, (min-width: 768px) 300px, 36vw' }) : ''}</span>
<span class="trio__body"><span class="sticker${i === 1 ? ' sticker--tilt-r' : ''}">${esc(c.kicker || '')}</span><span class="trio__title">${esc(c.title)}</span><span class="trio__text">${esc(c.text || '')}</span><span class="trio__go" aria-hidden="true">${icon('arrow')}</span></span>
</a>`).join('\n')}
</div>
</div>
</section>`;
}

// ---------- footer ----------
function footerHtml(ctx, path) {
  const s = ctx.site;
  const f = ctx.ia.footer || {};
  const insta = ig(s);
  const col = (c) => `<div class="footer__col"><h2 class="footer__h">${esc(c.title)}</h2><ul class="footer__links">${(c.links || []).map((l) => `<li><a${linkAttrs(l.href)}${cur(l.href, path)}>${esc(l.label)}</a></li>`).join('')}</ul></div>`;
  const areas = (s.serviceAreas || []).map((a) => `<li><a class="chip"${linkAttrs('/about/service-areas/#' + a.slug)}>${icon('pin')}${esc(a.name)}</a></li>`).join('');
  const copyName = (s.altNames && s.altNames[0]) || s.name;
  return `<footer class="site-footer">
<div class="footer__clip" aria-hidden="true"><span class="drip-edge drip-edge--forest" data-drip></span><span class="haze"></span><span class="grain"></span></div>
<div class="wrap wrap--wide footer__inner">
<div class="footer__grid">
<section class="footer__store" aria-labelledby="footer-store-h">
<a class="brand brand--footer"${linkAttrs('/')}>${logoImg(ctx, 'brand__logo', false)}</a>
${s.tagline ? `<p class="footer__tagline">${esc(s.tagline)}</p>` : ''}
<h2 class="footer__h" id="footer-store-h">${esc(s.name)}</h2>
<address class="footer__addr"><a${linkAttrs(s.mapUrl)}>${icon('pin')}<span>${esc(addrLine(s))}</span></a></address>
<ul class="footer__contact">
<li><a${linkAttrs(s.phoneHref)}>${icon('phone')}<span>${esc(s.phone)}</span></a></li>
${s.email ? `<li><a${linkAttrs('mailto:' + s.email)}>${icon('mail')}<span>${esc(s.email)}</span></a></li>` : ''}
</ul>
<div class="footer__hours"><p class="footer__sub">${icon('clock')}<span>Store hours</span></p>${hoursHtml(ctx)}</div>
${insta ? `<a class="footer__social"${linkAttrs(insta.url)}>${icon('instagram')}<span>${esc(insta.handle || insta.name)}</span></a>` : ''}
</section>
<nav class="footer__cols" aria-label="Footer">
${(f.columns || []).map(col).join('\n')}
</nav>
</div>
<section class="footer__areas" aria-labelledby="footer-areas-h">
<h2 class="footer__h" id="footer-areas-h">${esc(f.areasTitle || '')}</h2>
<ul class="footer__area-list">${areas}</ul>
</section>
<div class="footer__legal">
<p class="footer__copy">&copy;2026 ${esc(copyName)}</p>
<ul class="footer__legal-links">${(f.legal || []).map((l) => `<li><a${linkAttrs(l.href)}${cur(l.href, path)}>${esc(l.label)}</a></li>`).join('')}</ul>
<a class="footer__top" href="#top">Back to top${icon('up')}</a>
</div>
</div>
<div class="footer__mark" aria-hidden="true" data-footer-mark>
<span class="footer__word">GREENSTOP</span>
<span class="footer__band"><span class="footer__band-in"><span class="footer__word footer__word--lit">GREENSTOP</span></span></span>
</div>
</footer>`;
}

// ---------- 21+ gate (D7): Greenstop's own words ("Age Verification", "Are you 21 or over?", Yes / No, and its
// refusal line). Hidden by default; site.js opens it unless localStorage greenstop-age-ok = 1, so it never blocks the
// page without JS. ----------
function gateHtml(ctx) {
  const bg = (ctx.ia.nav || []).map((n) => n.feature && n.feature.photo).find(Boolean);
  return `<div class="age-gate" data-age-gate data-age-key="greenstop-age-ok" hidden>
<div class="age-gate__bg" aria-hidden="true">${bg ? img({ src: bg, alt: '' }, { sizes: '100vw', cls: 'age-gate__photo' }) : ''}</div>
<div class="age-gate__card glass glass--strong" role="dialog" aria-modal="true" aria-labelledby="age-gate-q">
${logoImg(ctx, 'age-gate__logo', false)}
<span class="sticker">Age Verification</span>
<h2 class="age-gate__q" id="age-gate-q">${esc(ctx.site.ageGate || 'Are you 21 or over?')}</h2>
<div class="btn-row age-gate__actions"><button class="btn btn--lime" type="button" data-age-yes>Yes</button><button class="btn btn--ghost" type="button" data-age-no>No</button></div>
<p class="age-gate__no" data-age-refusal role="alert" hidden>You are not old enough to view this content.</p>
</div>
</div>`;
}

function ogImage(ctx, og) {
  let u = og.image;
  if (!u && hasGenerated('g-hero-wall')) u = imgUrl('g-hero-wall', 1440);
  if (!u) return '';
  return /^https?:/i.test(u) ? u : (ctx.site.origin || '') + u;
}

// 7:00 AM -> 07:00 (schema.org openingHours)
const h24 = (t) => { const m = String(t || '').match(/(\d{1,2}):(\d{2})\s*([AP])M/i); if (!m) return ''; let h = +m[1] % 12; if (/p/i.test(m[3])) h += 12; return String(h).padStart(2, '0') + ':' + m[2]; };
function storeLd(ctx) {
  const s = ctx.site;
  const a = s.address || {};
  const hrs = (s.hours || []).map((r) => (/monday.+sunday/i.test(r.days) ? 'Mo-Su ' : '') + h24(r.open) + '-' + h24(r.close)).filter((x) => /^Mo-Su \d/.test(x));
  return { '@context': 'https://schema.org', '@type': 'Store', name: s.name, url: s.origin + '/', telephone: s.phoneHref ? s.phoneHref.replace(/^tel:/, '') : s.phone, email: s.email || undefined, address: { '@type': 'PostalAddress', streetAddress: a.street, addressLocality: a.city, addressRegion: a.state, postalCode: a.zip, addressCountry: 'US' }, openingHours: hrs.length ? hrs : undefined, sameAs: (s.socials || []).map((x) => x.url) };
}

export function page({ ctx, path, title, description, canonical, og = {}, jsonld = [], bodyClass = '', main = '', crumbs = [], heroCrumbs = false, scripts = [], preload = [], noTrio = false }) {
  const can = canonical || absUrl(ctx, path);
  const css = (ctx.cssFiles || []).map((f) => `<link rel="stylesheet" href="/assets/css/${f}.css">`).join('\n');
  const lds = [].concat(jsonld || []).filter(Boolean);
  const types = lds.map((o) => o['@type']);
  if (crumbs && crumbs.length > 1 && !types.includes('BreadcrumbList')) {
    lds.push({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: crumbs.map((raw, i) => { const c = crumbParts(raw); return { '@type': 'ListItem', position: i + 1, name: c.label, item: absUrl(ctx, c.href || path) }; }) });
  }
  if (path === '/' && !types.some((t) => /Store|LocalBusiness|Organization/.test(String(t)))) lds.push(storeLd(ctx));
  const ld = lds.map((o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`).join('\n');
  const pre = (preload || []).filter(Boolean).map((p) => `<link rel="preload"${attrs(p)}>`).join('\n');
  const js = [...new Set(['site.js', ...(scripts || [])])];
  const ogi = ogImage(ctx, og || {});
  const L = ctx.site.logo || {};
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${escA(description)}">
<link rel="canonical" href="${escA(can)}">
<meta property="og:site_name" content="${escA(ctx.site.name)}">
<meta property="og:title" content="${escA(og.title || title)}">
<meta property="og:description" content="${escA(og.description || description)}">
<meta property="og:url" content="${escA(og.url || can)}">
<meta property="og:type" content="${escA(og.type || 'website')}">
${ogi ? `<meta property="og:image" content="${escA(ogi)}">\n<meta name="twitter:card" content="summary_large_image">` : ''}
<meta name="theme-color" content="#02150d">
<meta name="color-scheme" content="dark">
<link rel="icon" type="image/png" href="${escA(L.favicon || '/assets/brand/favicon.png')}">
<link rel="apple-touch-icon" href="${escA(L.favicon || '/assets/brand/favicon.png')}">
<link rel="preload" href="/assets/fonts/barlow-condensed-800.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/inter-400.woff2" as="font" type="font/woff2" crossorigin>
${pre}
${css}
<script>document.documentElement.classList.add('js');</script>
${ld}
</head>
<body id="top"${attrs({ class: bodyClass })}>
<a class="skip" href="#main">Skip to content</a>
<div class="site">
${headerHtml(ctx, path)}
${crumbs && crumbs.length && !heroCrumbs ? `<div class="crumbs-bar"><div class="wrap wrap--wide">${crumbsHtml(crumbs)}</div></div>` : ''}
<main id="main">
${main}
</main>
${noTrio || path === '/' ? '' : ctaTrio(ctx, path)}
${footerHtml(ctx, path)}
</div>
${gateHtml(ctx)}
${js.map((f) => `<script src="/assets/js/${escA(f)}" defer></script>`).join('\n')}
</body>
</html>`;
}
