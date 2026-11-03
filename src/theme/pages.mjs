// pages.mjs - PAGES lane: /about/ /about/team/ /team-member/<slug>/ /events/ /event/<slug>/
// /about/frequently-asked-questions/ /about/service-areas/ /location/jersey-city-nj/ /contact/ /terms-conditions/
// /privacy-policy/ /404.html (the sitemap is sitemap.mjs). Captured pages print every word of src/content/pages/<slug>.json
// (captured inline HTML output as is, links mapped through href(); the live site's dead same-host shop paths go to the
// matching /products/ page). The About page FAQ (sections s7-s8) is rendered on /about/frequently-asked-questions/.
// The "Nothing Found" archive captures (slugs with "--") are not rebuilt. Classes: contract classes + p- prefix.
import { page, crumbsHtml, icon, hoursHtml } from './shell.mjs';
import { esc, escA, attrs, href, linkAttrs, isExternal, gimg, img, stripTags, absUrl, cart, serviceAreas, directionsFrom, demoForm } from './util.mjs';

// ---------- small helpers ----------
const HOME = { href: '/', label: 'Home' };
const ABOUT = { href: '/about/', label: 'About' };
const sticker = (t, cls = '') => (t ? `<p class="kicker sticker p-kick ${cls}">${esc(t)}</p>` : '');
const btn = (u, label, cls = 'btn--lime', extra = {}) => `<a class="btn ${cls}"${linkAttrs(u, extra)}>${label}</a>`;
const arrow = (u, label, cls = '') => `<a class="link-arrow ${cls}"${linkAttrs(u)}>${esc(label)}${icon(isExternal(u) && !/^(tel|mailto):/.test(u) ? 'ext' : 'arrow')}</a>`;
const ROT = [-2.4, 1.8, -1.2, 2.6, -2, 1.1, -1.6, 2.2];

// The live site links its own shop at /shop/mi/greenstop/... (not part of the rebuild, status unverified): in-site shop
// navigation goes to the matching /products/ page (contract D4/D5b). Cart links (cart.greenstopwellnessjc.com) stay.
const SHOP_CAT = { flower: '/products/flower/', vapes: '/products/vapes-cartridges/', topicals: '/products/topicals/', edibles: '/products/edibles/', concentrates: '/products/concentrates/', 'pre-rolls': '/products/pre-rolls/', prerolls: '/products/pre-rolls/', tinctures: '/products/tinctures/' };
function mapUrl(u) {
  const s = String(u || '').replace(/&amp;/g, '&');
  const m = s.match(/^(?:https?:\/\/(?:www\.)?greenstopwellnessjc\.com)?\/shop\/mi\/greenstop\/?(?:menu\/([a-z-]+?)-\d+\/)?/i);
  if (m) return SHOP_CAT[(m[1] || '').toLowerCase()] || '/products/';
  return href(s);
}
const mapLinks = (html) => String(html ?? '').replace(/href="([^"]*)"/g, (m, u) => `href="${escA(mapUrl(u))}"`);

function captured(ctx, slug) {
  const c = ctx.content[slug];
  if (!c) throw new Error('pages.mjs: missing captured page ' + slug);
  return c;
}
const section = (c, id) => {
  const s = (c.sections || []).find((x) => x.id === id);
  if (!s) throw new Error(`pages.mjs: ${c.slug} has no section ${id}`);
  return s;
};

function out(ctx, { path, title, description, crumbs, main, mod, jsonld = [], noTrio = false, image = '' }) {
  return {
    path,
    html: page({
      ctx, path, title, description, canonical: absUrl(ctx, path),
      og: { title, description, type: 'website', url: absUrl(ctx, path), image: image ? ctx.site.origin + image : '' },
      jsonld, bodyClass: `p-page p-page--${mod}`, main, crumbs, heroCrumbs: true, noTrio,
    }),
  };
}

// the adopted inner-page hero (FOUNDATION's .page-hero paints the wall): crumbs, sticker kicker, H1, one line, CTAs;
// the photo in a taped frame on the right, overhanging the hero's bottom edge into the next band.
function hero({ crumbs, kick, title, lede = '', ctas = [], media = '', mod = '', meta = '' }) {
  return `<section class="page-hero p-hero ${mod}" data-spot>
<div class="wrap page-hero__grid p-hero__grid">
<div class="page-hero__text p-hero__text" data-reveal>
${crumbsHtml(crumbs)}
${kick || ''}
<h1 class="display p-hero__title">${title}</h1>
${meta}
${lede ? `<p class="lede p-hero__lede">${lede}</p>` : ''}
${ctas.length ? `<div class="btn-row p-hero__ctas">${ctas.join('')}</div>` : ''}
</div>
${media ? `<div class="page-hero__media p-hero__media" data-reveal style="--i:1">${media}</div>` : ''}
</div>
</section>`;
}
const heroPhoto = (src, w, h, alt = '', cls = '') => `<figure class="taped p-hero__photo ${cls}" data-depth="0.06">${img({ src, alt, w, h }, { eager: true, sizes: '(min-width: 1024px) 460px, (min-width: 700px) 40vw, 72vw', cls: 'p-hero__img' })}</figure>`;

// a caution-tape marquee of Greenstop's own lines; the second group is the loop copy (aria-hidden)
function marquee(words, mod = '') {
  const g = words.map((w) => `<span>${esc(w)}</span>`).join('');
  return `<div class="marquee caution p-marquee ${mod}" data-marquee><div class="marquee__track"><div class="marquee__group">${g}</div><div class="marquee__group" aria-hidden="true">${g}</div></div></div>`;
}

// captured blocks -> prose (terms, privacy, event bodies, bios). h1 blocks are printed by the hero.
function blocksHtml(blocks, { shift = 0 } = {}) {
  return (blocks || []).map((b) => {
    switch (b.type) {
      case 'p': return `<p>${mapLinks(b.html)}</p>`;
      case 'h2': case 'h3': case 'h4': { const n = Math.min(6, Math.max(2, Number(b.type[1]) + shift)); return `<h${n}>${esc(b.text)}</h${n}>`; }
      case 'ul': case 'ol': return `<${b.type}>${(b.items || []).map((it) => `<li>${mapLinks(it)}</li>`).join('')}</${b.type}>`;
      case 'button': return `<p>${btn(mapUrl(b.href), esc(b.text), 'btn--glass')}</p>`;
      case 'h1': return '';
      default: throw new Error('pages.mjs: unexpected block type ' + b.type);
    }
  }).join('\n');
}

// a staff pick (captured icon-box with a product link): photo, the captured (truncated) name, the captured deal line
function pick(b, i = 0) {
  const u = mapUrl(b.href);
  const ext = /^https?:/i.test(u);
  return `<li class="p-pick" style="--i:${i % 4}">
<a class="p-pick__link glass glass--lift"${linkAttrs(u)}>
<span class="p-pick__media">${img({ src: b.icon, alt: '', w: b.iconW, h: b.iconH }, { sizes: '96px', cls: 'p-pick__img' })}</span>
<span class="p-pick__text"><span class="p-pick__title">${esc(b.title)}</span>${b.html ? `<span class="p-pick__deal">${b.html}</span>` : ''}<span class="p-pick__cta">${ext ? 'Order online' : 'Shop the category'}${icon(ext ? 'ext' : 'arrow')}</span></span>
</a></li>`;
}

// ---------- the About page's team block, parsed from about.json s4 ----------
function aboutTeam(ctx, s4) {
  const B = s4.blocks;
  const at = (i, type) => { if (!B[i] || B[i].type !== type) throw new Error(`pages.mjs: about s4 block ${i} is not ${type}`); return B[i]; };
  const owner = { photo: at(2, 'img'), name: at(3, 'p'), role: at(4, 'p'), bio: at(5, 'p') };
  const crew = [];
  for (let i = 6; i < B.length; i++) {
    const b = B[i];
    if (b.type === 'icon-box' && /^#fs-grid-modal/.test(b.href || '')) { crew.push({ card: b, photo: null, name: '', bio: [], picks: [] }); continue; }
    const p = crew[crew.length - 1];
    if (!p) throw new Error('pages.mjs: about s4 block before the first team card');
    if (b.type === 'img') p.photo = b;
    else if (b.type === 'h3') p.name = b.text;
    else if (b.type === 'p') p.bio.push(b);
    else if (b.type === 'icon-box') p.picks.push(b);
    else throw new Error('pages.mjs: about s4 unexpected block ' + b.type);
  }
  for (const p of crew) p.member = (ctx.team || []).find((t) => t.name === p.name) || null;
  return { intro: [at(0, 'h3'), at(1, 'p')], owner, crew };
}
const memberPath = (m) => `/team-member/${m.slug}/`;

// ---------- /about/ ----------
function about(ctx) {
  const c = captured(ctx, 'about');
  const path = '/about/';
  const crumbs = [HOME, { href: path, label: 'About' }];
  const s1 = section(c, 's1'), s2 = section(c, 's2'), s3 = section(c, 's3'), s4 = section(c, 's4'), s5 = section(c, 's5'), s6 = section(c, 's6');
  const [h3, h2, lede, explore] = s2.blocks;
  if (h3.type !== 'h3' || h2.type !== 'h2' || lede.type !== 'p' || explore.type !== 'button') throw new Error('pages.mjs: about s2 shape changed');
  const [storyBtn, story] = s3.blocks;
  if (storyBtn.type !== 'button' || story.type !== 'p') throw new Error('pages.mjs: about s3 shape changed');
  const team = aboutTeam(ctx, s4);

  const heroHtml = hero({
    crumbs, kick: sticker('About Greenstop'),
    title: `${esc(h3.text)} <span class="p-hero__line2">${esc(h2.text)}</span>`,
    lede: lede.html,
    // "Explore Products" is shop navigation: it goes to /products/ (D4); the captured cart home is the "Order online" button
    ctas: [btn('/products/', esc(explore.text)), btn('#story', esc(storyBtn.text), 'btn--glass')],
    media: heroPhoto(s1.bg, 1080, 837, 'A crowd outside the Greenstop storefront', 'p-hero__photo--about'),
    mod: 'p-hero--about',
  });

  const storyBand = `<section class="band band--stone p-story" id="story" aria-label="${escA(storyBtn.text)}">
<div class="band__clip" aria-hidden="true"><span class="p-overspray"></span><span class="grain"></span></div>
<div class="wrap p-story__grid">
<div class="p-story__text prose" data-reveal><p class="p-story__lead">${story.html}</p>
<div class="btn-row">${btn(cart(ctx), `Order online ${icon('ext')}`, 'btn--dark')}${btn('/location/jersey-city-nj/', 'Visit the store', 'btn--ghost')}</div></div>
<div class="p-story__media" data-reveal style="--i:1">
<figure class="taped taped--r p-story__photo p-story__photo--a" data-depth="0.05">${img({ src: '/assets/photos/gs/plants.jpg', alt: 'Plants inside Greenstop', w: 2000, h: 1557 }, { sizes: '(min-width: 1024px) 420px, 70vw', cls: 'p-story__img' })}</figure>
<figure class="taped p-story__photo p-story__photo--b" data-depth="-0.04">${img({ src: '/assets/photos/gs/greenstop-room.jpg', alt: 'The Greenstop store room', w: 2000, h: 1333 }, { sizes: '(min-width: 1024px) 360px, 60vw', cls: 'p-story__img' })}</figure>
<span class="cut p-story__cut" data-depth="0.12" aria-hidden="true">${gimg('g-leaf-cut', { alt: '', sizes: '200px', cls: 'p-story__cutimg' })}</span>
</div>
</div>
</section>`;

  const o = team.owner;
  const crewHtml = team.crew.map((p, i) => {
    const m = p.member;
    const u = m ? memberPath(m) : '/about/team/';
    const ph = p.photo || { src: p.card.icon, w: p.card.iconW, h: p.card.iconH };
    return `<article class="p-crew glass" id="crew-${escA(m ? m.slug : i)}" data-reveal style="--i:${i % 2}; --rot:${ROT[i % ROT.length]}deg">
<a class="p-crew__photo taped ${i % 2 ? 'taped--r' : ''}"${linkAttrs(u)} tabindex="-1" aria-hidden="true">${img({ src: ph.src, alt: '', w: ph.w, h: ph.h }, { sizes: '(min-width: 1024px) 220px, 40vw', cls: 'p-crew__img' })}</a>
<div class="p-crew__body">
${m && m.jobTitle ? `<p class="chip p-crew__role">${esc(m.jobTitle)}</p>` : ''}
<h3 class="p-crew__name">${esc(p.name)}</h3>
${p.bio.length ? `<div class="prose p-crew__bio">${p.bio.map((b) => `<p>${mapLinks(b.html)}</p>`).join('')}</div>` : ''}
<a class="link-arrow p-crew__more"${linkAttrs(u)}>Meet ${esc(p.card.title)}${icon('arrow')}</a>
${p.picks.length ? `<details class="p-crew__picks"><summary class="p-crew__sum">Staff picks <span class="p-count">${p.picks.length}</span>${icon('chev', 'p-crew__chev')}</summary><ul class="p-picks p-picks--tight" role="list">${p.picks.map(pick).join('')}</ul></details>` : ''}
</div>
</article>`;
  }).join('\n');

  const teamBand = `<section class="band band--ink p-team" aria-labelledby="p-team-h">
<div class="band__clip" aria-hidden="true"><span class="haze p-team__haze"></span><span class="grain"></span></div>
<div class="wrap">
<header class="section-head p-team__head" data-reveal><h2 class="display" id="p-team-h">${esc(team.intro[0].text)}</h2><p class="lede">${team.intro[1].html}</p></header>
<article class="p-owner glass glass--strong" id="owner" data-reveal>
<figure class="taped taped--lime p-owner__photo">${img({ src: o.photo.src, alt: stripTags(o.name.html), w: o.photo.w, h: o.photo.h }, { sizes: '(min-width: 1024px) 300px, 60vw', cls: 'p-owner__img' })}</figure>
<div class="p-owner__body"><div class="p-owner__name">${o.name.html}</div><p class="chip chip--lime p-owner__role">${o.role.html}</p><p class="p-owner__bio">${o.bio.html}</p></div>
</article>
<div class="p-crew-grid">${crewHtml}</div>
<p class="p-team__all" data-reveal>${arrow('/about/team/', 'See the whole team')}</p>
</div>
</section>`;

  // s5 (the room photo, full bleed with depth) + s6 (LOCATION facts on glass)
  const L = s6.blocks;
  const tx = (i, type) => { if (!L[i] || L[i].type !== type) throw new Error(`pages.mjs: about s6 block ${i} is not ${type}`); return L[i]; };
  const roomBand = locationBand(ctx, {
    label: tx(0, 'h4').text, addr: tx(1, 'h3').text, dir: tx(2, 'button'), hoursH: tx(3, 'h4').text, hours: tx(4, 'p').html,
    phoneH: tx(5, 'h4').text, phone: tx(6, 'p').html, emailH: tx(7, 'h4').text, email: tx(8, 'p').html,
  }, { photo: s5.bg, id: 'location', more: true });

  const faqBand = `<section class="band band--forest p-faqlink" aria-labelledby="p-faqlink-h">
<div class="band__clip" aria-hidden="true"><span class="p-faqlink__spray"></span><span class="grain"></span></div>
<div class="wrap p-faqlink__in glass" data-reveal>
<h2 class="display p-faqlink__title" id="p-faqlink-h">${esc(c.h1)}</h2>
<p class="p-faqlink__text">Products, purchasing, safety, pickup, loyalty and more, answered on one page.</p>
${btn('/about/frequently-asked-questions/', `Read the ${esc(c.h1)}`)}
</div>
</section>`;

  const main = `${heroHtml}
${storyBand}
${marquee([h3.text, h2.text, team.intro[0].text])}
${teamBand}
${roomBand}
${faqBand}`;
  return out(ctx, { path, title: c.title, description: stripTags(lede.html), crumbs, main, mod: 'about', image: s1.bg });
}

// the store facts on glass over the room photo (About s5+s6, Contact s1+s2, the store page)
function locationBand(ctx, f, { photo = '/assets/photos/gs/greenstop-room.jpg', id = 'location', more = false, mod = '' } = {}) {
  const tel = ctx.site.phoneHref;
  const mail = 'mailto:' + ctx.site.email;
  return `<section class="band p-room ${mod}" id="${escA(id)}" aria-labelledby="${escA(id)}-h">
<div class="band__clip p-room__clip" aria-hidden="true"><span class="p-room__bg" data-depth="-0.08">${img({ src: photo, alt: '', w: 2000, h: 1333 }, { sizes: '100vw', cls: 'p-room__img' })}</span><span class="p-room__scrim"></span><span class="grain"></span></div>
<div class="wrap p-room__grid">
<div class="p-facts glass glass--strong" data-reveal>
<h2 class="kicker sticker p-facts__label" id="${escA(id)}-h">${esc(f.label)}</h2>
<h3 class="display p-facts__addr">${esc(f.addr)}</h3>
<div class="btn-row">${btn(f.dir ? f.dir.href : ctx.site.mapUrl, `${esc(f.dir ? f.dir.text : 'Get Directions')} ${icon('ext')}`)}${more ? btn('/location/jersey-city-nj/', 'See the store location', 'btn--glass') : ''}</div>
<div class="p-facts__list">
<div class="p-facts__row"><h4 class="p-facts__h">${icon('clock')}${esc(f.hoursH)}</h4><p>${f.hours}</p></div>
<div class="p-facts__row"><h4 class="p-facts__h">${icon('phone')}${esc(f.phoneH)}</h4><p><a href="${escA(tel)}">${f.phone}</a></p></div>
<div class="p-facts__row"><h4 class="p-facts__h">${icon('mail')}${esc(f.emailH)}</h4><p><a href="${escA(mail)}">${f.email}</a></p></div>
</div>
</div>
</div>
</section>`;
}

// ---------- /about/team/ and /team-member/<slug>/ ----------
const pcard = (m, i = 0) => `<article class="pcard p-pcard" data-reveal style="--i:${i % 4}; --rot:${ROT[i % ROT.length]}deg">
<span class="pcard__media">${img(m.image, { alt: '', sizes: '(min-width: 1024px) 260px, (min-width: 640px) 30vw, 44vw', cls: 'p-pcard__img' })}</span>
<h3 class="pcard__name"><a${linkAttrs(memberPath(m))}>${esc(m.name)}</a></h3>
<p class="pcard__role p-pcard__role">${esc(m.jobTitle || '')}</p>
</article>`;
const teamOrder = (ctx) => {
  // the About page's order (its team cards), then anyone not on it
  const s4 = section(captured(ctx, 'about'), 's4');
  const names = s4.blocks.filter((b) => b.type === 'icon-box' && /^#fs-grid-modal/.test(b.href || '')).map((b) => b.title);
  const t = (ctx.team || []).slice();
  return t.sort((a, b) => ((names.indexOf(a.name) + 1 || 99) - (names.indexOf(b.name) + 1 || 99)) || a.name.localeCompare(b.name));
};

function teamHub(ctx) {
  const path = '/about/team/';
  const crumbs = [HOME, ABOUT, { href: path, label: 'Our Team' }];
  const s4 = section(captured(ctx, 'about'), 's4');
  const team = aboutTeam(ctx, s4);
  const members = teamOrder(ctx);
  const o = team.owner;
  const main = `${hero({
    crumbs, kick: sticker('Our Team'), title: esc(team.intro[0].text), lede: team.intro[1].html,
    ctas: [btn('/location/jersey-city-nj/', 'Visit the store'), btn('/about/', 'About Greenstop', 'btn--glass')],
    media: heroPhoto(members[0] ? members[0].image.src : o.photo.src, members[0] ? members[0].image.w : o.photo.w, members[0] ? members[0].image.h : o.photo.h, '', 'p-hero__photo--team'),
    mod: 'p-hero--team',
  })}
<section class="band band--ink p-teamhub" aria-labelledby="p-teamhub-h">
<div class="band__clip" aria-hidden="true"><span class="haze p-team__haze"></span><span class="grain"></span></div>
<div class="wrap">
<header class="section-head" data-reveal><h2 class="display" id="p-teamhub-h">The crew</h2></header>
<div class="p-pcards">
<article class="pcard p-pcard p-pcard--owner" data-reveal style="--rot:-1.4deg">
<span class="pcard__media">${img({ src: o.photo.src, alt: '', w: o.photo.w, h: o.photo.h }, { sizes: '(min-width: 1024px) 260px, 44vw', cls: 'p-pcard__img' })}</span>
<h3 class="pcard__name"><a href="/about/#owner">${esc(stripTags(o.name.html))}</a></h3>
<p class="pcard__role p-pcard__role">${esc(stripTags(o.role.html))}</p>
</article>
${members.map((m, i) => pcard(m, i + 1)).join('\n')}
</div>
</div>
</section>`;
  return out(ctx, { path, title: 'Our Team | Greenstop Dispensary', description: 'Meet the Greenstop Wellness team at 516 Tonnelle Ave, Jersey City: budtenders and managers, each with their staff picks.', crumbs, main, mod: 'team' });
}

function member(ctx, m, all) {
  const path = memberPath(m);
  const crumbs = [HOME, ABOUT, { href: '/about/team/', label: 'Our Team' }, { href: path, label: m.name }];
  const blocks = (m.sections || []).flatMap((s) => s.blocks || []);
  const bio = blocks.filter((b) => b.type === 'p');
  const picks = blocks.filter((b) => b.type === 'icon-box');
  const known = new Set(['img', 'h3', 'p', 'icon-box']);
  const odd = blocks.filter((b) => !known.has(b.type));
  if (odd.length) throw new Error('pages.mjs: team member ' + m.slug + ' has unexpected blocks ' + odd.map((b) => b.type).join(','));
  const name = (blocks.find((b) => b.type === 'h3') || {}).text || m.name;
  const others = all.filter((x) => x.slug !== m.slug).slice(0, 4);
  const main = `${hero({
    crumbs, kick: m.jobTitle ? `<p class="kicker sticker p-kick p-kick--role">${esc(m.jobTitle)}</p>` : '',
    title: esc(name),
    lede: bio.length ? '' : 'Say hi at the store, or browse the staff picks below.',
    ctas: [btn('/about/team/', 'Meet the team'), btn('/products/', 'Shop Now', 'btn--glass')],
    media: heroPhoto(m.image.src, m.image.w, m.image.h, name, 'p-hero__photo--person'),
    mod: 'p-hero--person',
  })}
${bio.length ? `<section class="band band--stone p-bio" aria-label="About ${escA(name)}">
<div class="band__clip" aria-hidden="true"><span class="p-overspray"></span><span class="grain"></span></div>
<div class="wrap wrap--narrow prose p-bio__text" data-reveal>${bio.map((b) => `<p>${mapLinks(b.html)}</p>`).join('\n')}</div>
</section>` : ''}
${picks.length ? `<section class="band band--ink p-picksband" aria-labelledby="p-picks-h">
<div class="band__clip" aria-hidden="true"><span class="haze"></span><span class="grain"></span></div>
<div class="wrap">
<header class="section-head" data-reveal><p class="kicker sticker p-kick">Staff picks</p><h2 class="display" id="p-picks-h">Picked by ${esc(name)}</h2></header>
<ul class="p-picks" role="list">${picks.map(pick).join('')}</ul>
</div>
</section>` : ''}
<section class="band band--forest p-others" aria-labelledby="p-others-h">
<div class="wrap">
<header class="section-head" data-reveal><h2 class="display" id="p-others-h">More of the team</h2></header>
<div class="p-pcards p-pcards--four">${others.map((x, i) => pcard(x, i)).join('\n')}</div>
<p class="p-team__all">${arrow('/about/team/', 'See the whole team')}</p>
</div>
</section>`;
  const desc = m.description || `${name}, ${m.jobTitle || 'team member'} at Greenstop Wellness, 516 Tonnelle Ave, Jersey City, NJ.`;
  return out(ctx, { path, title: m.seoTitle || `${name} | Greenstop Dispensary`, description: desc, crumbs, main, mod: 'member', image: m.image.src });
}

// ---------- /events/ and /event/<slug>/ ----------
const eventsSorted = (ctx) => (ctx.events || []).slice().sort((a, b) => String(b.startISO || '').localeCompare(String(a.startISO || '')));
const isPast = (e) => (e.type || []).some((t) => /past/i.test(t));
// the events page's PAST MOMENTS images carry links to outside event listings: keep them on the matching card/page
function listingLinks(ctx) {
  const L = new Map();
  for (const s of captured(ctx, 'events').sections) for (const b of s.blocks || []) if (b.type === 'img' && b.href) L.set(b.src, b.href);
  return L;
}
function flyer(e, i, links, { h = 'h3', lazy = true } = {}) {
  const ext = links.get(e.image && e.image.src);
  return `<article class="ecard p-flyer" data-reveal style="--i:${i % 4}; --rot:${ROT[i % ROT.length]}deg">
<span class="ecard__media p-flyer__media">${img({ src: e.image.src, alt: `Flyer: ${stripTags(e.title)}`, w: e.image.w, h: e.image.h }, { sizes: '(min-width: 1280px) 280px, (min-width: 1024px) 22vw, (min-width: 640px) 45vw, 88vw', cls: 'p-flyer__img', eager: !lazy })}</span>
<div class="ecard__body p-flyer__body">
<p class="ecard__meta p-flyer__meta"><span class="chip p-flyer__type">${esc((e.type || [])[0] || 'Event')}</span><span>Posted ${esc(e.date)}</span></p>
<${h} class="ecard__title p-flyer__title"><a${linkAttrs(`/event/${e.slug}/`)}>${esc(e.title)}</a></${h}>
${ext ? `<a class="p-flyer__ext"${linkAttrs(ext)}>Event listing${icon('ext')}</a>` : ''}
</div>
</article>`;
}

function eventsHub(ctx) {
  const c = captured(ctx, 'events');
  const path = '/events/';
  const crumbs = [HOME, ABOUT, { href: path, label: 'Events' }];
  const s1 = section(c, 's1'), s2 = section(c, 's2'), s3 = section(c, 's3'), s4 = section(c, 's4'), s5 = section(c, 's5');
  const [kick, h3, lede] = s2.blocks;
  if (kick.type !== 'h4' || h3.type !== 'h3' || lede.type !== 'p') throw new Error('pages.mjs: events s2 shape changed');
  const upH = s3.blocks[0];
  const B4 = s4.blocks;
  const pastH = B4[0], pastP = B4[1];
  const bookH = B4.find((b) => b.type === 'h3' && b !== pastH), bookP = B4[B4.length - 1];
  const leaf = B4.find((b) => b.type === 'img' && /leaf-bud/.test(b.src));
  const quote = s5.blocks[0];
  if (upH.type !== 'h2' || pastH.type !== 'h3' || pastP.type !== 'p' || !bookH || bookP.type !== 'p' || quote.type !== 'h3') throw new Error('pages.mjs: events page shape changed');
  const links = listingLinks(ctx);
  const all = eventsSorted(ctx);
  const upcoming = all.filter((e) => !isPast(e));
  const past = all.filter(isPast);
  // the PAST MOMENTS flyers on the live page are exactly the events' own flyers: the wall renders each event once
  const flyerSrcs = new Set(all.map((e) => e.image && e.image.src));
  const stray = B4.filter((b) => b.type === 'img' && b !== leaf && !flyerSrcs.has(b.src));

  const main = `${hero({
    crumbs, kick: sticker(kick.text), title: esc(h3.text), lede: lede.html,
    ctas: [btn('#upcoming', esc(upH.text)), btn('#past', `See ${esc(pastH.text.toLowerCase())}`, 'btn--glass')],
    media: heroPhoto(s1.bg, 1440, 960, '', 'p-hero__photo--events'),
    mod: 'p-hero--events',
  })}
${marquee([kick.text, stripTags(quote.text)], 'p-marquee--events')}
<section class="band band--forest p-upcoming" id="upcoming" aria-labelledby="p-up-h">
<div class="wrap">
<header class="section-head" data-reveal><h2 class="display" id="p-up-h">${esc(upH.text)}</h2></header>
${upcoming.length ? `<div class="p-wall">${upcoming.map((e, i) => flyer(e, i, links)).join('\n')}</div>` : `<div class="p-empty glass" data-reveal><p class="p-empty__text">No upcoming events are posted right now.</p>${arrow((ctx.site.socials || [])[0] ? ctx.site.socials[0].url : '/contact/', (ctx.site.socials || [])[0] ? `Follow ${ctx.site.socials[0].handle} on Instagram` : 'Contact us')}</div>`}
</div>
</section>
<section class="band band--wall p-pastwall" id="past" aria-labelledby="p-past-h">
<div class="band__clip" aria-hidden="true">${gimg('g-hero-wall', { alt: '', cls: 'band__bg p-pastwall__bg', sizes: '100vw' })}<span class="p-pastwall__scrim"></span><span class="grain"></span></div>
${leaf ? `<span class="cut protrude protrude--up p-pastwall__leaf" data-depth="0.1" aria-hidden="true">${img({ src: leaf.src, alt: '', w: leaf.w, h: leaf.h }, { sizes: '220px' })}</span>` : ''}
<div class="wrap">
<header class="section-head" data-reveal><h2 class="display" id="p-past-h">${esc(pastH.text)}</h2><p class="lede">${pastP.html}</p></header>
<div class="p-wall">${past.map((e, i) => flyer(e, i, links)).join('\n')}${stray.map((b, i) => `<figure class="taped p-flyer p-flyer--still" style="--rot:${ROT[i % ROT.length]}deg">${img({ src: b.src, alt: '', w: b.w, h: b.h }, { sizes: '280px' })}</figure>`).join('')}</div>
</div>
</section>
<section class="band band--ink p-book" aria-labelledby="p-book-h">
<div class="band__clip" aria-hidden="true"><span class="p-book__spray"></span><span class="grain"></span></div>
<div class="wrap p-book__grid">
<div class="p-book__panel glass" data-reveal>
<h2 class="display p-book__title" id="p-book-h">${esc(bookH.text)}</h2>
<p class="lede">${bookP.html}</p>
<div class="btn-row">${btn('/contact/', 'Contact us')}${btn(ctx.site.phoneHref, `${icon('phone')} ${esc(ctx.site.phone)}`, 'btn--glass')}</div>
</div>
<blockquote class="p-quote" data-reveal style="--i:1"><h2 class="display p-quote__text">${esc(quote.text)}</h2></blockquote>
</div>
</section>`;
  return out(ctx, { path, title: c.title, description: stripTags(lede.html) + ' Upcoming and past events at Greenstop Wellness, Jersey City.', crumbs, main, mod: 'events', image: s1.bg });
}

function eventPage(ctx, e, all, links) {
  const path = `/event/${e.slug}/`;
  const crumbs = [HOME, { href: '/events/', label: 'Events' }, { href: path, label: e.title }];
  const blocks = (e.sections || []).flatMap((s) => s.blocks || []);
  const h1 = blocks.find((b) => b.type === 'h1');
  const title = h1 ? h1.text : e.title;
  // ul blocks: the first holds the shown (publish) date, the last one holds the Previous / Next links
  const uls = blocks.filter((b) => b.type === 'ul');
  const dateUl = uls.find((u) => (u.items || []).length === 1 && !/<a\b/.test(u.items[0]));
  const navUl = uls.find((u) => (u.items || []).some((it) => /<a\b/.test(it)));
  const body = blocks.filter((b) => b.type === 'p' || b.type === 'h2');
  const known = new Set(['h1', 'ul', 'img', 'p', 'h2']);
  const odd = blocks.filter((b) => !known.has(b.type));
  if (odd.length) throw new Error('pages.mjs: event ' + e.slug + ' has unexpected blocks ' + odd.map((b) => b.type).join(','));
  const ext = links.get(e.image && e.image.src);
  const navItems = navUl ? navUl.items.map((it) => {
    const m = /href="([^"]+)"[^>]*>([^<]*)</.exec(it);
    if (!m) return '';
    const slug = (m[1].match(/\/event\/([^/]+)\//) || [])[1];
    const target = all.find((x) => x.slug === slug);
    const prev = /prev/i.test(m[2]);
    return `<a class="p-pn__link p-pn__link--${prev ? 'prev' : 'next'} glass glass--lift"${linkAttrs(mapUrl(m[1]))}><span class="p-pn__dir">${esc(m[2])}</span>${target ? `<span class="p-pn__title">${esc(target.title)}</span>` : ''}</a>`;
  }).join('') : '';
  const more = all.filter((x) => x.slug !== e.slug).slice(0, 4);
  const meta = `<p class="p-hero__meta"><span class="chip">${icon('clock')}Posted ${esc(dateUl ? stripTags(dateUl.items[0]) : e.date)}</span>${e.time ? `<span class="chip">${esc(e.time)}</span>` : ''}</p>`;
  const main = `${hero({
    crumbs, kick: `<p class="kicker sticker p-kick">${esc((e.type || [])[0] || 'Event')}</p>`, title: esc(title), meta,
    ctas: [btn('/events/', 'All events'), ext ? btn(ext, `Event listing ${icon('ext')}`, 'btn--glass') : btn('/location/jersey-city-nj/', 'Visit Greenstop', 'btn--glass')],
    media: `<figure class="taped p-hero__photo p-hero__photo--flyer" data-depth="0.06">${img({ src: e.image.src, alt: `Flyer: ${stripTags(title)}`, w: e.image.w, h: e.image.h }, { eager: true, sizes: '(min-width: 1024px) 420px, 72vw', cls: 'p-hero__img' })}</figure>`,
    mod: 'p-hero--event',
  })}
<section class="band band--stone p-eventbody" aria-label="Event details">
<div class="band__clip" aria-hidden="true"><span class="p-overspray"></span><span class="grain"></span></div>
<div class="wrap wrap--narrow">
<div class="prose p-eventbody__text" data-reveal>${body.length ? blocksHtml(body) : '<p>The details for this event are on its flyer.</p>'}</div>
${navItems ? `<nav class="p-pn" aria-label="Previous and next event">${navItems}</nav>` : ''}
</div>
</section>
<section class="band band--ink p-moreevents" aria-labelledby="p-more-h">
<div class="wrap">
<header class="section-head" data-reveal><h2 class="display" id="p-more-h">More events</h2></header>
<div class="p-wall p-wall--four">${more.map((x, i) => flyer(x, i, links)).join('\n')}</div>
<p class="p-team__all">${arrow('/events/', 'See all events')}</p>
</div>
</section>`;
  const seo = String(e.seoTitle || '').trim();
  const pageTitle = !seo || seo.startsWith('|') ? `${stripTags(title)} | Greenstop Dispensary` : seo;
  const d = String(e.description || '').replace(/\s+/g, ' ').trim();
  const desc = d ? (d.length > 300 ? d.slice(0, 297).replace(/\s+\S*$/, '') + '...' : d) : `${stripTags(title)}: a past event at Greenstop Wellness, 516 Tonnelle Ave, Jersey City, NJ.`;
  return out(ctx, { path, title: pageTitle, description: desc, crumbs, main, mod: 'event', image: e.image.src });
}

// ---------- /about/frequently-asked-questions/ ----------
function faqPage(ctx) {
  const c = captured(ctx, 'about');
  const path = '/about/frequently-asked-questions/';
  const crumbs = [HOME, ABOUT, { href: path, label: 'Frequently Asked Questions' }];
  const s7 = section(c, 's7'), s8 = section(c, 's8');
  const groups = [];
  for (const b of s8.blocks) {
    if (b.type === 'h3') groups.push({ title: b.text, items: [] });
    else if (b.type === 'faq') { if (!groups.length) throw new Error('pages.mjs: FAQ items before a topic'); groups[groups.length - 1].items.push(...b.items); }
    else throw new Error('pages.mjs: FAQ unexpected block ' + b.type);
  }
  const gid = (g) => 'faq-' + g.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const h1 = (s7.blocks.find((b) => b.type === 'h1') || {}).text || c.h1;
  const n = groups.reduce((a, g) => a + g.items.length, 0);
  const main = `${hero({
    crumbs, kick: sticker('Greenstop FAQ'), title: esc(h1),
    lede: `${n} answers from Greenstop, grouped in ${groups.length} topics.`,
    ctas: [btn('/contact/', 'Contact us'), btn(ctx.site.phoneHref, `${icon('phone')} ${esc(ctx.site.phone)}`, 'btn--glass')],
    media: heroPhoto(s7.bg, 2000, 1500, '', 'p-hero__photo--faq'),
    mod: 'p-hero--faq',
  })}
<section class="band band--stone p-faq" aria-label="Questions by topic">
<div class="band__clip" aria-hidden="true"><span class="p-overspray"></span><span class="grain"></span></div>
<div class="wrap p-faq__grid">
<nav class="p-faq__index glass glass--paper" aria-label="FAQ topics"><p class="p-faq__ih">Topics</p><ol>${groups.map((g, i) => `<li><a href="#${gid(g)}"><span class="stencil p-faq__num">${String(i + 1).padStart(2, '0')}</span>${esc(g.title)}</a></li>`).join('')}</ol></nav>
<div class="p-faq__groups">
${groups.map((g, i) => `<section class="p-faq__group" id="${gid(g)}" aria-labelledby="${gid(g)}-h" data-reveal>
<h2 class="display p-faq__title" id="${gid(g)}-h"><span class="stencil p-faq__num" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>${esc(g.title)}</h2>
<div class="faq">${g.items.map((it, j) => `<details${i === 0 && j === 0 ? ' open' : ''}><summary>${esc(it.q)}</summary><div>${mapLinks(it.a_html)}</div></details>`).join('\n')}</div>
</section>`).join('\n')}
</div>
</div>
</section>`;
  const jsonld = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: groups.flatMap((g) => g.items.map((it) => ({ '@type': 'Question', name: it.q, acceptedAnswer: { '@type': 'Answer', text: stripTags(it.a_html) } }))) };
  return out(ctx, { path, title: 'Frequently Asked Questions | Greenstop Dispensary', description: 'Greenstop Wellness answers questions on products, purchasing, legal and safety, delivery and pickup, loyalty and discounts, wellness and contact.', crumbs, main, mod: 'faq', jsonld });
}

// ---------- /about/service-areas/ ----------
function serviceAreasPage(ctx) {
  const path = '/about/service-areas/';
  const crumbs = [HOME, ABOUT, { href: path, label: 'Service Areas' }];
  const a = ctx.site.address;
  const addr = `${a.street}, ${a.city}, ${a.state} ${a.zip}`;
  const areas = serviceAreas(ctx);
  const main = `${hero({
    crumbs, kick: sticker((ctx.ia.footer && ctx.ia.footer.areasTitle) || 'Service Areas'), title: 'Service Areas',
    lede: `Greenstop Wellness is at ${esc(addr)}. Get directions from your neighborhood.`,
    ctas: [btn(ctx.site.mapUrl, `Get Directions ${icon('ext')}`), btn('/location/jersey-city-nj/', 'Visit the store', 'btn--glass')],
    media: heroPhoto('/assets/photos/gs/greenstop-room.jpg', 2000, 1333, 'The Greenstop store room', 'p-hero__photo--areas'),
    mod: 'p-hero--areas',
  })}
<section class="band band--ink p-areas" aria-labelledby="p-areas-h">
<div class="band__clip" aria-hidden="true"><span class="haze"></span><span class="grain"></span></div>
<div class="wrap p-areas__grid">
<aside class="p-areas__store glass glass--strong" data-reveal>
<p class="kicker sticker p-kick">The store</p>
<h2 class="display p-areas__name">${esc(ctx.site.name)}</h2>
<p class="p-areas__addr">${icon('pin')}${esc(addr)}</p>
${hoursHtml(ctx, 'p-areas__hours')}
<p class="p-areas__phone">${icon('phone')}<a href="${escA(ctx.site.phoneHref)}">${esc(ctx.site.phone)}</a></p>
</aside>
<div>
<header class="section-head" data-reveal><h2 class="display" id="p-areas-h">Nearby areas</h2><p class="lede">Directions open in Google Maps from each place to the store.</p></header>
<ul class="p-areas__list" role="list">${areas.map((ar, i) => `<li class="p-area glass glass--lift" id="${escA(ar.slug)}" data-reveal style="--i:${i % 3}">
<span class="p-area__pin" aria-hidden="true">${icon('pin')}</span>
<h3 class="p-area__name">${esc(ar.name)}</h3>
<a class="link-arrow p-area__go"${linkAttrs(directionsFrom(ctx, ar.origin))}>Get directions from ${esc(ar.name)}${icon('ext')}</a>
</li>`).join('\n')}</ul>
</div>
</div>
</section>`;
  return out(ctx, { path, title: 'Service Areas | Greenstop Dispensary', description: `Greenstop Wellness, ${addr}: directions to the store from nearby Hudson County neighborhoods and towns.`, crumbs, main, mod: 'areas' });
}

// ---------- /location/jersey-city-nj/ (the adopted store template) ----------
function storePage(ctx) {
  const path = '/location/jersey-city-nj/';
  const crumbs = [HOME, { href: path, label: 'Jersey City, NJ' }];
  const S = ctx.site;
  const a = S.address;
  const addr = `${a.street}, ${a.city}, ${a.state} ${a.zip}`;
  const h = (S.hours || [])[0] || {};
  const everyDay = (S.hours || []).length === 1 && /monday.*sunday/i.test(h.days || '');
  const today = everyDay ? `<p class="p-hero__meta"><span class="chip chip--lime">${icon('clock')}Hours today: ${esc(h.open)} to ${esc(h.close)}</span></p>` : '';
  const areas = serviceAreas(ctx);
  const c = captured(ctx, 'contact');
  const L = section(c, 's2').blocks;
  const main = `${hero({
    crumbs, kick: sticker('Visit Greenstop'), title: `${esc(S.name)} <span class="p-hero__line2">Jersey City</span>`,
    meta: `<p class="p-hero__addr">${icon('pin')}${esc(addr)}</p>${today}`,
    ctas: [btn('/products/', 'Shop Now'), btn(S.mapUrl, `Get Directions ${icon('ext')}`, 'btn--glass'), btn(S.phoneHref, `${icon('phone')} Call us`, 'btn--ghost')],
    media: heroPhoto('/assets/photos/gs/greenstop-room.jpg', 2000, 1333, 'Inside the Greenstop store', 'p-hero__photo--store'),
    mod: 'p-hero--store',
  })}
<section class="band band--stone p-store" aria-labelledby="p-store-h">
<div class="band__clip" aria-hidden="true"><span class="p-overspray"></span><span class="grain"></span></div>
<div class="wrap p-store__grid">
<div class="p-store__facts" data-reveal>
<p class="kicker sticker p-kick">Store details</p>
<h2 class="display" id="p-store-h">Find us on Tonnelle Ave</h2>
<dl class="p-store__list">
<div class="p-store__row glass glass--paper"><dt>${icon('pin')}Address</dt><dd>${esc(addr)}<br><a class="link-arrow"${linkAttrs(S.mapUrl)}>Get Directions${icon('ext')}</a></dd></div>
<div class="p-store__row glass glass--paper"><dt>${icon('clock')}Hours</dt><dd>${hoursHtml(ctx, 'p-store__hours')}</dd></div>
<div class="p-store__row glass glass--paper"><dt>${icon('phone')}Phone</dt><dd><a href="${escA(S.phoneHref)}">${esc(S.phone)}</a></dd></div>
<div class="p-store__row glass glass--paper"><dt>${icon('mail')}Email</dt><dd><a href="mailto:${escA(S.email)}">${esc(S.email)}</a></dd></div>
</dl>
<div class="btn-row">${btn('/products/', 'Shop Now', 'btn--dark')}${btn(cart(ctx), `Order online ${icon('ext')}`, 'btn--ghost')}</div>
</div>
<div class="p-store__media" data-reveal style="--i:1">
<figure class="taped p-store__photo p-store__photo--a" data-depth="0.05">${img({ src: '/assets/photos/gs/plants.jpg', alt: 'Plants inside Greenstop', w: 2000, h: 1557 }, { sizes: '(min-width: 1024px) 440px, 80vw', cls: 'p-store__img' })}</figure>
<figure class="frame p-store__video" data-depth="-0.03"><video class="p-store__vid" src="/assets/media/gs/walkthrough-video-4x-small.mp4" poster="/assets/media/gs/walkthrough-video-4x-small.jpg" width="1920" height="1080" muted playsinline loop preload="none" controls aria-label="Greenstop walkthrough video"></video></figure>
<span class="cut p-store__cut" data-depth="0.14" aria-hidden="true">${gimg('g-bud-cut', { alt: '', sizes: '180px', cls: 'p-store__cutimg' })}</span>
</div>
</div>
</section>
${locationBand(ctx, {
    label: L[0].text, addr: L[1].text, dir: L[2], hoursH: L[3].text, hours: L[4].html, phoneH: L[5].text, phone: L[6].html, emailH: L[7].text, email: L[8].html,
  }, { photo: '/assets/photos/gs/greenstop-room.jpg', id: 'store-location', mod: 'p-room--store' })}
<section class="band band--forest p-near" aria-labelledby="p-near-h">
<div class="wrap">
<header class="section-head" data-reveal><h2 class="display" id="p-near-h">${esc((ctx.ia.footer && ctx.ia.footer.areasTitle) || 'Nearby areas')}</h2><p class="lede">Nearby neighborhoods and towns, each with directions to the store.</p></header>
<ul class="chip-row p-near__chips" role="list">${areas.map((ar) => `<li><a class="chip p-near__chip"${linkAttrs('/about/service-areas/#' + ar.slug)}>${icon('pin')}${esc(ar.name)}</a></li>`).join('')}</ul>
</div>
</section>`;
  const jsonld = {
    '@context': 'https://schema.org', '@type': 'Store', name: S.name, url: absUrl(ctx, path), telephone: S.phone, email: S.email,
    address: { '@type': 'PostalAddress', streetAddress: a.street, addressLocality: a.city, addressRegion: a.state, postalCode: a.zip, addressCountry: 'US' },
    ...(everyDay ? { openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], opens: to24(h.open), closes: to24(h.close) }] } : {}),
    hasMap: S.mapUrl,
  };
  return out(ctx, { path, title: 'Greenstop Wellness, Jersey City NJ | Greenstop Dispensary', description: `Greenstop Wellness, ${addr}. Store hours, phone, email, directions and photos of the store.`, crumbs, main, mod: 'store', jsonld, image: '/assets/photos/gs/greenstop-room.jpg' });
}
function to24(t) {
  const m = /(\d{1,2}):(\d{2})\s*([AP]M)/i.exec(String(t || ''));
  if (!m) return undefined;
  let hh = Number(m[1]) % 12;
  if (/p/i.test(m[3])) hh += 12;
  return String(hh).padStart(2, '0') + ':' + m[2];
}

// ---------- /contact/ ----------
function contact(ctx) {
  const c = captured(ctx, 'contact');
  const path = '/contact/';
  const crumbs = [HOME, { href: path, label: 'Contact' }];
  const s1 = section(c, 's1'), s2 = section(c, 's2'), s3 = section(c, 's3');
  const L = s2.blocks;
  const tx = (i, type) => { if (!L[i] || L[i].type !== type) throw new Error(`pages.mjs: contact s2 block ${i} is not ${type}`); return L[i]; };
  const msgH = s3.blocks[0];
  if (!msgH || msgH.type !== 'h3') throw new Error('pages.mjs: contact s3 shape changed');
  const main = `${hero({
    crumbs, kick: sticker('Contact'), title: 'Contact Greenstop',
    lede: `Call, email or stop by the store at ${esc(ctx.site.address.street)}, ${esc(ctx.site.address.city)}.`,
    ctas: [btn('#message', esc(msgH.text)), btn('#location', `See our ${esc(tx(0, 'h4').text.toLowerCase())}`, 'btn--glass')],
    media: heroPhoto(s1.bg, 2000, 1333, 'Inside the Greenstop store', 'p-hero__photo--contact'),
    mod: 'p-hero--contact',
  })}
${locationBand(ctx, {
    label: tx(0, 'h4').text, addr: tx(1, 'h3').text, dir: tx(2, 'button'), hoursH: tx(3, 'h4').text, hours: tx(4, 'p').html,
    phoneH: tx(5, 'h4').text, phone: tx(6, 'p').html, emailH: tx(7, 'h4').text, email: tx(8, 'p').html,
  }, { photo: '/assets/photos/gs/plants.jpg', id: 'location', more: true, mod: 'p-room--contact' })}
<section class="band band--stone p-message" id="message" aria-labelledby="p-msg-h">
<div class="band__clip" aria-hidden="true"><span class="p-overspray"></span><span class="grain"></span></div>
<div class="wrap p-message__grid">
<div class="p-message__intro" data-reveal>
<h2 class="display" id="p-msg-h">${esc(msgH.text)}</h2>
<p class="lede">Or reach the store directly: <a href="${escA(ctx.site.phoneHref)}">${esc(ctx.site.phone)}</a> or <a href="mailto:${escA(ctx.site.email)}">${esc(ctx.site.email)}</a>.</p>
<a class="p-maplink glass glass--paper glass--lift"${linkAttrs(ctx.site.mapUrl)}><span class="p-maplink__pin">${icon('pin')}</span><span><span class="p-maplink__t">Open the map</span><span class="p-maplink__s">${esc(ctx.site.address.street)}, ${esc(ctx.site.address.city)}, ${esc(ctx.site.address.state)} ${esc(ctx.site.address.zip)}</span></span>${icon('ext')}</a>
</div>
<div class="p-message__form glass glass--paper" data-reveal style="--i:1">${demoForm({ id: 'contact-form', fields: ['Name', 'Email', 'Phone', 'Message'], button: 'Submit' })}</div>
</div>
</section>`;
  return out(ctx, { path, title: c.title, description: c.description || `Contact Greenstop Wellness: 516 Tonnelle Ave, Jersey City, NJ 07307, ${ctx.site.phone}, ${ctx.site.email}. Hours, directions and a message form.`, crumbs, main, mod: 'contact', image: s1.bg });
}

// ---------- /terms-conditions/ and /privacy-policy/ (verbatim prose) ----------
function legal(ctx, slug) {
  const c = captured(ctx, slug);
  const path = c.path;
  const crumbs = [HOME, { href: path, label: c.h1 }];
  const blocks = c.sections.flatMap((s) => s.blocks || []);
  const main = `${hero({ crumbs, kick: sticker('Legal'), title: esc(c.h1), mod: 'p-hero--legal' })}
<section class="band band--paper p-legal" aria-label="${escA(c.h1)}">
<div class="wrap wrap--narrow"><div class="prose p-legal__text glass glass--paper">${blocksHtml(blocks)}</div></div>
</section>`;
  return out(ctx, { path, title: c.title, description: c.description || `${c.h1} for the Greenstop Wellness website (greenstopwellnessjc.com).`, crumbs, main, mod: 'legal' });
}

// ---------- /404.html ----------
function notFound(ctx) {
  const path = '/404.html';
  const crumbs = [HOME, { href: '/404.html', label: 'Page not found' }];
  const main = `${hero({
    crumbs, kick: sticker('404'), title: 'Page not found',
    lede: 'This page does not exist or has moved. Try one of these instead.',
    ctas: [btn('/', 'Home'), btn('/products/', 'Shop Now', 'btn--glass'), btn('/contact/', 'Contact', 'btn--ghost')],
    media: `<span class="cut p-hero__cut" data-depth="0.1" aria-hidden="true">${gimg('g-can-cut', { alt: '', eager: true, sizes: '320px', cls: 'p-hero__cutimg' })}</span>`,
    mod: 'p-hero--404',
  })}
<section class="band band--ink p-lost" aria-label="Popular pages">
<div class="wrap"><ul class="chip-row p-lost__links" role="list">${[['/products/', 'Products'], ['/deals/', 'Deals'], ['/events/', 'Events'], ['/about/', 'About'], ['/location/jersey-city-nj/', 'Visit the store'], ['/about/frequently-asked-questions/', 'FAQ'], ['/sitemap/', 'Sitemap']].map(([u, l]) => `<li><a class="chip"${linkAttrs(u)}>${esc(l)}</a></li>`).join('')}</ul></div>
</section>`;
  const r = out(ctx, { path, title: 'Page Not Found | Greenstop Dispensary', description: 'The page you were looking for is not on the Greenstop Wellness site.', crumbs, main, mod: '404', noTrio: true });
  r.html = r.html.replace(/<link rel="canonical"[^>]*>\n?/, '').replace('<head>', '<head>\n<meta name="robots" content="noindex">');
  return r;
}

export async function render(ctx) {
  const pages = [];
  pages.push(about(ctx), teamHub(ctx), faqPage(ctx), serviceAreasPage(ctx));
  const members = teamOrder(ctx);
  for (const m of members) pages.push(member(ctx, m, members));
  const links = listingLinks(ctx);
  const evs = eventsSorted(ctx);
  pages.push(eventsHub(ctx));
  for (const e of evs) pages.push(eventPage(ctx, e, evs, links));
  pages.push(storePage(ctx), contact(ctx), legal(ctx, 'terms-conditions'), legal(ctx, 'privacy-policy'), notFound(ctx));
  return pages;
}
