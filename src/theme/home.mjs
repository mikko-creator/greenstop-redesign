// home.mjs - the home page "/" (HOME lane, "STREET GLASS"). Section order = the adopted home (docs/BUILD-CONTRACT.md
// section 6 HOME); every captured word of src/content/pages/home.json is rendered (tools/words-check.mjs --only home).
// Facts come from ctx.site / ctx.events / ctx.posts, never retyped. New words are neutral glue only (kickers, section
// labels, button labels, one-line intros, alt text). No inline JS; root-absolute URLs only in HTML attributes (D6).
import { page, icon } from './shell.mjs';
import { esc, escA, linkAttrs, gimg, img, absUrl } from './util.mjs';

const must = (v, what) => { if (v == null || v === '' || (Array.isArray(v) && !v.length)) throw new Error('home: missing content: ' + what); return v; };
const sec = (home, id) => must((home.sections || []).find((s) => s.id === id), 'home.json section ' + id);
const blocks = (s, type) => (s.blocks || []).filter((b) => b.type === type);
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const fmtDate = (iso) => { const m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? `${MONTHS[+m[2] - 1]} ${+m[3]}, ${m[1]}` : ''; };
// site.json day ranges carry an en dash ("Monday–Sunday"): print them as words (contract D2, no dashes as dashes)
const dayRange = (s) => String(s || '').replace(/\s*[‒-―]\s*|\s+-\s+/g, ' to ');
// the live promo-graphic links (/shop/mi/greenstop/...) are dead: every card goes to the deals page
const DEALS = '/deals/';

// Greenstop's own web-encoded videos (contract D5b): muted, looped, never preloaded, poster = same path .jpg,
// autoplay only when in view (site.js), never under reduced motion.
// small: an optional lighter cut for phones, picked by the browser through <source media> (listed first).
function gsVideo(src, { w, h, cls = '', id = '', small = '' } = {}) {
  const poster = String(src).replace(/\.mp4$/, '.jpg');
  const phone = small ? `<source src="${escA(small)}" type="video/mp4" media="(max-width: 720px)">` : '';
  return `<video class="${escA(cls)}"${id ? ` id="${escA(id)}"` : ''} muted playsinline loop preload="none" poster="${escA(poster)}" width="${w}" height="${h}" aria-hidden="true" tabindex="-1" data-inview-play>${phone}<source src="${escA(src)}" type="video/mp4"></video>`;
}

// a section head: sticker kicker, h2, optional decorative graffiti tag over the heading corner
const head = ({ kicker, h, id, tag = '', cls = '', extra = '' }) => `<div class="h-head ${cls}" data-reveal>
${kicker ? `<p class="sticker h-head__kicker">${esc(kicker)}</p>` : ''}
<div class="h-head__line"><h2 id="${id}" class="display h-head__h">${h}</h2>${tag ? `<span class="tag h-head__tag" aria-hidden="true">${esc(tag)}</span>` : ''}</div>
${extra}
</div>`;

const CAT_ROUTES = { Flower: ['flower', 'g-flower'], PreRolls: ['pre-rolls', 'g-prerolls'], Edibles: ['edibles', 'g-edibles'], Concentrates: ['concentrates', 'g-concentrates'], Vaporizers: ['vapes-cartridges', 'g-vapes'], Tinctures: ['tinctures', 'g-tinctures'], Topicals: ['topicals', 'g-topicals'] };
const SVC_ROUTES = { Pickup: ['/in-store-pickup/', 'How pickup works'], 'Door to Door Delivery': ['/online-ordering/#delivery', 'Delivery details'], Budtenders: ['/about/team/', 'Meet the team'] };

export async function render(ctx) {
  const site = must(ctx.site, 'site.json');
  const home = must(ctx.content && ctx.content.home, 'pages/home.json');
  const addr = must(site.address, 'site.address');
  const hours = must(site.hours, 'site.hours');
  const addrLine = `${addr.street}, ${addr.city}, ${addr.state} ${addr.zip}`;
  const hoursLine = hours.map((r) => `${dayRange(r.days)}, ${r.open} to ${r.close}`).join('; ');

  // ---------- 1. hero stage: the wall + hero-haze loop, H1 straight on the wall, Greenstop's own video in a taped frame
  const s1 = sec(home, 's1');
  const heroVid = must(blocks(s1, 'video')[0], 's1 video');
  const [shopBtn, visitBtn] = must(blocks(s1, 'button'), 's1 buttons');
  const haze = ((ctx.images && ctx.images.media) || {})['hero-haze'];
  const loop = haze && haze.mp4 && haze.poster
    ? `<video class="h-hero__loop" id="h-hero-loop" autoplay muted loop playsinline preload="metadata" poster="${escA(haze.poster)}" width="${haze.w}" height="${haze.h}" aria-hidden="true" tabindex="-1">${haze.mp4Small ? `<source src="${escA(haze.mp4Small)}" type="video/mp4" media="(max-width: 720px)">` : ''}<source src="${escA(haze.mp4)}" type="video/mp4"></video>`
    : '';
  const tagline = must(site.tagline, 'site.tagline');
  const lines = tagline.split(/(?<=\.)\s+/);
  const heroHtml = `<section class="h-hero band band--wall" data-spot aria-labelledby="h-hero-h1">
<div class="band__clip h-hero__clip" aria-hidden="true">
${gimg('g-hero-wall', { alt: '', eager: true, cls: 'band__bg h-hero__wall', sizes: '100vw' })}
${loop}
<span class="h-hero__scrim"></span>
<span class="h-hero__glow"></span>
<span class="grain h-hero__grain"></span>
</div>
<div class="wrap wrap--wide h-hero__inner">
<div class="h-hero__copy">
<p class="sticker h-hero__kicker" data-reveal>${icon('pin')}<span>${esc(addr.city)}, ${esc(addr.state)}</span></p>
<div class="h-hero__head">
<h1 id="h-hero-h1" class="display display--mega h-hero__h1" data-reveal style="--i:1">${lines.map((l) => `<span class="h-hero__line">${esc(l)}</span>`).join(' ')}</h1>
<span class="tag h-hero__tag" aria-hidden="true">${esc(site.shortName)}</span>
</div>
<p class="lede h-hero__lede" data-reveal style="--i:2">${esc(site.name)}, ${esc(addrLine)}. Open ${esc(hoursLine)}.</p>
<div class="btn-row h-hero__ctas" data-reveal style="--i:3"><a class="btn btn--lime"${linkAttrs('/products/')}>${esc(shopBtn.text)}${icon('arrow')}</a><a class="btn btn--glass"${linkAttrs('/location/jersey-city-nj/')}>${icon('pin')}${esc(visitBtn.text)}</a></div>
</div>
<div class="h-hero__media" data-reveal style="--i:2">
<figure class="h-hero__frame taped">
<div class="h-hero__screen glass" data-tilt>${gsVideo(heroVid.src, { w: heroVid.w, h: heroVid.h, cls: 'h-hero__vid', small: String(heroVid.src).replace(/\.mp4$/, '-sm.mp4') })}</div>
</figure>
</div>
</div>
<div class="h-hero__can protrude" aria-hidden="true"><div class="h-hero__can-in" data-depth="0.14">${gimg('g-can-cut', { alt: '', cls: 'cut h-hero__can-img', sizes: '(max-width: 720px) 96px, 170px' })}</div></div>
${loop ? `<button class="btn btn--glass btn--sm h-hero__toggle" type="button" data-video-toggle aria-pressed="false"><span class="video-toggle__ico" aria-hidden="true"></span><span class="video-toggle__label">Pause motion</span></button>` : ''}
</section>`;

  // ---------- 2. the promo card slider: the s2 deal graphics in glass frames, 3 visible on desktop, 1 on phones
  const s2 = sec(home, 's2');
  const seen = new Set();
  const promos = must(blocks(s2, 'img'), 's2 promo images').filter((b) => (seen.has(b.src) ? false : seen.add(b.src)));
  const promosHtml = `<section class="h-promos band band--ink" aria-labelledby="h-promos-h">
<div class="band__clip" aria-hidden="true"><span class="h-promos__glow"></span><span class="grain"></span></div>
<div class="wrap">
<div class="h-row">
${head({ kicker: 'Deals', h: 'Promos and Specials', id: 'h-promos-h' })}
<a class="link-arrow h-row__all"${linkAttrs(DEALS)} data-reveal>See All Deals${icon('arrow')}</a>
</div>
<div class="h-slider" data-rotator="6000" data-rotator-mode="track" data-rotator-label="promo" role="region" aria-roledescription="carousel" aria-label="Greenstop promos" data-reveal style="--i:1">
<ul class="h-slider__track" data-rotator-track role="list">
${promos.map((p, i) => `<li class="h-slider__slide" data-slide aria-roledescription="slide" aria-label="${i + 1} of ${promos.length}"><a class="h-promo glass glass--lift"${linkAttrs(DEALS)}>${img({ src: p.src, alt: '', w: p.w, h: p.h }, { cls: 'h-promo__img', sizes: '(max-width: 720px) 92vw, 400px', alt: `Greenstop promo flyer ${i + 1} of ${promos.length}` })}<span class="h-promo__go">See deals${icon('arrow')}</span></a></li>`).join('\n')}
</ul>
<div class="h-slider__ctrl">
<button class="h-slider__btn" type="button" data-rotator-prev aria-label="Previous promos">${icon('arrow', 'h-slider__ico h-slider__ico--prev')}</button>
<div class="h-slider__dots" data-rotator-dots></div>
<button class="h-slider__btn" type="button" data-rotator-next aria-label="Next promos">${icon('arrow', 'h-slider__ico')}</button>
</div>
</div>
</div>
</section>`;

  // ---------- 3. Our Premium Products: Greenstop's 8 labels + icons over the matching generated category photo
  const s3 = sec(home, 's3');
  const s3h = must(blocks(s3, 'h2')[0], 's3 h2');
  const cats = must(blocks(s3, 'icon-box'), 's3 icon boxes');
  const catsHtml = `<section class="h-cats band band--forest" aria-labelledby="h-cats-h">
<div class="band__clip" aria-hidden="true"><span class="h-cats__glow"></span><span class="grain"></span></div>
<div class="wrap">
<div class="h-row">
${head({ kicker: 'Shop by category', h: esc(s3h.text), id: 'h-cats-h', tag: 'Shop' })}
</div>
<ul class="h-cats__grid" role="list">
${cats.map((c, i) => {
    const route = CAT_ROUTES[c.title];
    const to = route ? `/products/${route[0]}/` : '/products/';
    const gid = route ? route[1] : 'g-glass-bud';
    return `<li class="h-cats__item" data-reveal style="--i:${i % 4}"><a class="tile h-tile${route ? '' : ' h-tile--all'}"${linkAttrs(to)}><span class="tile__media h-tile__media">${gimg(gid, { alt: '', sizes: '(max-width: 720px) 46vw, 300px' })}</span><span class="h-tile__icon">${img({ src: c.icon, alt: '', w: c.iconW, h: c.iconH }, { sizes: '64px', cls: 'h-tile__icon-img' })}</span><span class="tile__title h-tile__title">${esc(c.title)}</span><span class="tile__cta h-tile__cta" aria-hidden="true">${icon('arrow')}</span></a></li>`;
  }).join('\n')}
</ul>
</div>
</section>`;

  // ---------- 4. the s4 services as glass cards (drips hang from the band's top edge)
  const s4 = sec(home, 's4');
  const svcs = must(blocks(s4, 'icon-box'), 's4 icon boxes');
  const svcCard = (c, i) => {
    const r = SVC_ROUTES[c.title];
    const isIcon = /\.png$/i.test(c.icon) && c.iconW <= 200;
    const media = `<span class="h-svc__media${isIcon ? ' h-svc__media--icon' : ''}">${img({ src: c.icon, alt: '', w: c.iconW, h: c.iconH }, { sizes: isIcon ? '96px' : '(max-width: 720px) 92vw, 300px', cls: 'h-svc__img' })}</span>`;
    const text = c.html ? `<span class="chip chip--lime h-svc__chip">${c.html}</span>` : '';
    const body = `<span class="h-svc__body"><h3 class="h-svc__t">${esc(c.title)}</h3>${text}${r ? `<span class="link-arrow h-svc__go">${esc(r[1])}${icon('arrow')}</span>` : ''}</span>`;
    return `<li class="h-svc__item" data-reveal style="--i:${i}">${r
      ? `<a class="h-svc glass glass--lift" data-spot${linkAttrs(r[0])}>${media}${body}</a>`
      : `<div class="h-svc h-svc--soon glass">${media}${body}</div>`}</li>`;
  };
  const svcHtml = `<section class="h-svcs band band--ink" aria-labelledby="h-svcs-h">
<div class="band__clip" aria-hidden="true"><span class="h-svcs__glow"></span><span class="grain"></span></div>
<span class="drip-edge h-svcs__drips" data-drip aria-hidden="true"></span>
<div class="wrap">
${head({ kicker: 'Services', h: 'Pickup, Delivery and More', id: 'h-svcs-h' })}
<ul class="h-svcs__grid" role="list">
${svcs.map(svcCard).join('\n')}
</ul>
</div>
</section>`;

  // ---------- 5. s5 + s6 community band: the store's mural room taped to the wall, the s5 leaf breaking the seam
  const s5 = sec(home, 's5');
  const leaf = must(blocks(s5, 'img')[0], 's5 leaf');
  const s6 = sec(home, 's6');
  const s6h = must(blocks(s6, 'h3')[0], 's6 heading');
  const s6p = must(blocks(s6, 'p')[0], 's6 p');
  const s6b = must(blocks(s6, 'button')[0], 's6 button');
  const room = must(sec(home, 's7').bg, 's7 bg photo');
  const commHtml = `<section class="h-comm band band--forest" aria-labelledby="h-comm-h">
<div class="band__clip" aria-hidden="true">${s5.bg ? img({ src: s5.bg, alt: '' }, { cls: 'h-comm__mark', sizes: '420px' }) : ''}<span class="haze h-comm__haze"></span><span class="grain"></span></div>
<div class="wrap h-comm__inner">
<div class="h-comm__leaf protrude"><div data-depth="0.12">${img({ src: leaf.src, alt: 'A cannabis plant with four callouts: Trusted guidance, every time. See and smell before you choose. Quick delivery and easy pickup options. Wide range of premium products.', w: leaf.w, h: leaf.h }, { cls: 'cut h-comm__leaf-img', sizes: '(max-width: 720px) 92vw, 560px' })}</div></div>
<div class="h-comm__copy">
${head({ kicker: 'About Greenstop', h: esc(s6h.text), id: 'h-comm-h', tag: 'Community' })}
<p class="lede h-comm__p" data-reveal style="--i:1">${s6p.html}</p>
<p class="btn-row" data-reveal style="--i:2"><a class="btn btn--lime"${linkAttrs(s6b.href)}>${esc(s6b.text)}${icon('arrow')}</a></p>
<div class="h-comm__art" data-reveal style="--i:3"><figure class="h-comm__photo taped"><div class="h-comm__tilt" data-tilt>${img({ src: room, alt: 'A room with deep green walls and murals, the Greenstop name painted across the back wall in graffiti letters.' }, { sizes: '(max-width: 720px) 92vw, 560px', cls: 'h-comm__img' })}</div></figure></div>
</div>
</div>
</section>`;

  // ---------- 6. the store block "Visit Greenstop" in the adopted location-tab look, with the walkthrough video
  const storeHtml = `<section class="h-store band band--ink" aria-labelledby="h-store-h">
<div class="band__clip" aria-hidden="true"><span class="h-store__glow"></span><span class="grain"></span></div>
<div class="wrap">
${head({ kicker: 'Visit Us', h: 'Visit Greenstop', id: 'h-store-h' })}
<div class="h-store__box" data-reveal style="--i:1">
<p class="h-store__tab">${icon('pin')}<span>${esc(addr.city)}, ${esc(addr.state)}</span></p>
<div class="h-store__panel glass glass--strong">
<figure class="h-store__media frame">${gsVideo('/assets/media/gs/walkthrough-video-4x-small.mp4', { w: 1920, h: 1080, cls: 'h-store__vid' })}</figure>
<div class="h-store__info">
<h3 class="h-store__name">${esc(site.name)}</h3>
<address class="h-store__addr">${icon('pin')}<span>${esc(addr.street)}<br>${esc(addr.city)}, ${esc(addr.state)} ${esc(addr.zip)}</span></address>
<dl class="h-store__hours">${hours.map((r) => `<div class="h-store__row">${icon('clock')}<dt>${esc(dayRange(r.days))}</dt><dd>${esc(r.open)} to ${esc(r.close)}</dd></div>`).join('')}</dl>
<p class="h-store__phone"><a${linkAttrs(site.phoneHref)}>${icon('phone')}<span>${esc(site.phone)}</span></a></p>
<div class="btn-row h-store__ctas"><a class="btn btn--lime"${linkAttrs(site.mapUrl)}>Get Directions${icon('ext')}</a><a class="btn btn--glass"${linkAttrs('/location/jersey-city-nj/')}>Store Details${icon('arrow')}</a></div>
</div>
</div>
</div>
</div>
</section>`;

  // ---------- 7. s8 Upcoming Events: the newest events (all past on the live site, chip "Past event"), no dates invented
  const s8 = sec(home, 's8');
  const s8h = must(blocks(s8, 'h2')[0], 's8 h2');
  const s8b = must(blocks(s8, 'button')[0], 's8 button');
  // ctx.events is sorted on the display date string; sort on the captured ISO stamp instead (newest first)
  const events = [...(ctx.events || [])].filter((e) => e.path && e.title).sort((a, b) => String(b.startISO || '').localeCompare(String(a.startISO || ''))).slice(0, 4);
  const isPast = (e) => (e.type || []).some((t) => /past/i.test(t));
  const ecard = (e, i) => `<li class="h-events__item" data-reveal style="--i:${i}"><a class="ecard h-ecard"${linkAttrs(e.path)}><span class="ecard__media h-ecard__media">${e.image && e.image.src ? img({ src: e.image.src, alt: e.image.alt || '', w: e.image.w, h: e.image.h }, { sizes: '(max-width: 720px) 80vw, 290px' }) : gimg('g-city-dusk', { alt: '', sizes: '290px' })}</span><span class="h-ecard__body">${isPast(e) ? '<span class="ecard__date chip h-ecard__chip">Past event</span>' : ''}<span class="ecard__title h-ecard__title">${esc(e.title)}</span><span class="ecard__meta h-ecard__more">Event details${icon('arrow')}</span></span></a></li>`;
  const eventsHtml = `<section class="h-events band band--ink" aria-labelledby="h-events-h">
<div class="band__clip" aria-hidden="true"><span class="h-events__glow"></span><span class="grain"></span></div>
<div class="wrap">
<div class="h-row">
${head({ kicker: 'Events', h: esc(s8h.text), id: 'h-events-h' })}
<a class="btn btn--glass h-row__all"${linkAttrs(s8b.href)} data-reveal>${esc(s8b.text)}${icon('arrow')}</a>
</div>
${events.length
    ? `<p class="h-note" data-reveal>Our newest events. ${events.every(isPast) ? 'These have wrapped; the full list has every event.' : ''}</p>
<ul class="h-events__grid" role="list">
${events.map(ecard).join('\n')}
</ul>`
    : `<p class="h-note" data-reveal>No events are listed right now. <a${linkAttrs(s8b.href)}>${esc(s8b.text)}</a></p>`}
</div>
</section>`;

  // ---------- 8. s9 Follow Us @GreenStopnj: the 4 reels as a tilted, taped strip (muted, preload none, play in view)
  const s9 = sec(home, 's9');
  const s9h = must(blocks(s9, 'h2')[0], 's9 h2');
  const reels = must(blocks(s9, 'video'), 's9 reels');
  const ig = s9h.href || ((site.socials || [])[0] || {}).url;
  const reelsHtml = `<section class="h-reels band band--wall" aria-labelledby="h-reels-h">
<div class="band__clip" aria-hidden="true">${gimg('g-spray-haze', { alt: '', cls: 'band__bg screen h-reels__haze', sizes: '100vw' })}<span class="h-reels__veil"></span><span class="grain"></span></div>
<div class="wrap">
<div class="h-row">
${head({ kicker: 'Instagram', h: `<a class="h-reels__link"${linkAttrs(ig)}>${esc(s9h.text)}</a>`, id: 'h-reels-h' })}
<a class="btn btn--glass h-row__all"${linkAttrs(ig)} data-reveal>${icon('instagram')}Follow on Instagram</a>
</div>
<ul class="h-reels__strip" role="list">
${reels.map((v, i) => `<li class="h-reels__item" data-reveal style="--i:${i}"><figure class="h-reel taped">${gsVideo(v.src, { w: v.w, h: v.h, cls: 'h-reel__vid' })}</figure></li>`).join('\n')}
</ul>
</div>
</section>`;

  // ---------- 9. s10 reviews as glass quote cards (verbatim, with their names, avatars and stars)
  const s10 = sec(home, 's10');
  const reviews = [];
  let cur = null;
  for (const b of s10.blocks || []) {
    if (b.type === 'img' && !/stars/i.test(b.src)) { cur = { avatar: b }; reviews.push(cur); continue; }
    if (!cur) continue;
    if (b.type === 'img') cur.stars = b;
    if (b.type === 'h3') cur.q = b.text;
    if (b.type === 'p') cur.name = b.html;
  }
  must(reviews.filter((r) => r.q && r.name), 's10 reviews');
  const reviewsHtml = `<section class="h-reviews band band--stone" aria-labelledby="h-reviews-h">
<div class="band__clip" aria-hidden="true"><span class="h-reviews__spray"></span></div>
<div class="wrap">
${head({ kicker: 'Reviews', h: 'What Our Customers Say', id: 'h-reviews-h' })}
<ul class="h-reviews__grid" role="list">
${reviews.map((r, i) => `<li class="h-reviews__item" data-reveal style="--i:${i % 2}"><figure class="h-review glass glass--paper glass--lift">
<div class="h-review__top">${img({ src: r.avatar.src, alt: '', w: r.avatar.w, h: r.avatar.h }, { cls: 'h-review__avatar', sizes: '56px' })}${r.stars ? img({ src: r.stars.src, alt: 'Star rating', w: r.stars.w, h: r.stars.h }, { cls: 'h-review__stars', sizes: '120px' }) : ''}</div>
<blockquote class="h-review__quote"><h3 class="h-review__q">${esc(r.q)}</h3></blockquote>
<figcaption class="h-review__name">${r.name}</figcaption>
</figure></li>`).join('\n')}
</ul>
</div>
</section>`;

  // ---------- 10. latest 3 blog posts
  const posts = [...(ctx.posts || [])].sort((a, b) => String(b.date || '').localeCompare(String(a.date || ''))).slice(0, 3);
  const acard = (p, i) => `<li class="h-posts__item" data-reveal style="--i:${i}"><a class="acard h-acard"${linkAttrs(p.path || '/' + p.slug + '/')}><span class="acard__media h-acard__media">${p.image && p.image.src ? img({ src: p.image.src, alt: p.image.alt || '', w: p.image.w, h: p.image.h }, { sizes: '(max-width: 720px) 92vw, 400px' }) : gimg('g-glass-bud', { alt: '', sizes: '400px' })}</span><span class="h-acard__body"><span class="acard__meta"><time datetime="${escA(String(p.date).slice(0, 10))}">${esc(fmtDate(p.date))}</time></span><span class="acard__title">${esc(p.title)}</span><span class="acard__more">Read More${icon('arrow')}</span></span></a></li>`;
  const postsHtml = posts.length ? `<section class="h-posts band band--ink" aria-labelledby="h-posts-h">
<div class="band__clip" aria-hidden="true"><span class="h-posts__glow"></span><span class="grain"></span></div>
<div class="wrap">
<div class="h-row">
${head({ kicker: 'Blog', h: 'Latest from the Blog', id: 'h-posts-h' })}
<a class="btn btn--glass h-row__all"${linkAttrs('/blog/')} data-reveal>All Posts${icon('arrow')}</a>
</div>
<ul class="h-posts__grid" role="list">
${posts.map(acard).join('\n')}
</ul>
</div>
</section>` : '';

  // ---------- 11. the caution-tape marquee of Greenstop's category words over the s11 photo ground
  const s11 = sec(home, 's11');
  const words = cats.filter((c) => CAT_ROUTES[c.title]).map((c) => c.title);
  const tapeRow = (cls) => `<div class="h-tape ${cls}" data-marquee aria-hidden="true"><div class="marquee__track h-tape__track">${[0, 1].map(() => `<span class="h-tape__group">${words.map((w) => `<span class="h-tape__word">${esc(w)}</span><span class="h-tape__sep">${icon('leaf')}</span>`).join('')}</span>`).join('')}</div></div>`;
  const tapeHtml = `<section class="h-close band band--ink" aria-label="Product categories">
<div class="band__clip" aria-hidden="true">${s11.bg ? img({ src: s11.bg, alt: '' }, { cls: 'band__bg h-close__bg', sizes: '100vw' }) : ''}<span class="h-close__veil"></span></div>
${tapeRow('h-tape--a')}
${tapeRow('h-tape--b')}
<ul class="h-close__links wrap" role="list">${words.map((w) => `<li><a class="chip"${linkAttrs('/products/' + CAT_ROUTES[w][0] + '/')}>${esc(w)}</a></li>`).join('')}</ul>
</section>`;

  // ---------- 10b. FAQ for local dispensary searches (src/content/home-faq.json; main session): visible accordion
  // (every answer in the DOM, first one open) + FAQPage JSON-LD built from the same text
  const faq = ctx.homeFaq;
  const faqLinks = (html) => String(html).replace(/<a href="([^"]+)">/g, (m, u) => `<a${linkAttrs(u.replace(/&amp;/g, '&'))}>`);
  // FAQPage answers keep their links (Google's FAQ markup allows <a> in acceptedAnswer.text), internal paths made
  // absolute on the site origin; every other tag is dropped
  const ldAnswer = (html) => String(html)
    .replace(/<a href="([^"]+)">/g, (m, u) => `<a href="${escA(/^\//.test(u) ? absUrl(ctx, u) : u.replace(/&amp;/g, '&'))}">`)
    .replace(/<(?!\/?a[\s>])[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  const faqHtml = faq && faq.items && faq.items.length ? `<section class="h-faq band band--forest" id="faq" aria-labelledby="h-faq-h">
<div class="band__clip" aria-hidden="true"><span class="h-faq__glow"></span><span class="grain"></span></div>
<div class="wrap h-faq__grid">
<div class="h-faq__side">
${head({ kicker: faq.kicker, h: esc(faq.heading), id: 'h-faq-h', tag: faq.tag, extra: `<p class="lede h-faq__intro">${esc(faq.intro)}</p>` })}
<div class="btn-row h-faq__ctas" data-reveal style="--i:1"><a class="btn btn--lime"${linkAttrs(faq.more.href)}>${esc(faq.more.label)}${icon('arrow')}</a><a class="btn btn--glass"${linkAttrs(faq.contact.href)}>${esc(faq.contact.label)}</a></div>
<div class="h-faq__cut" aria-hidden="true">${gimg('g-leaf-cut', { alt: '', cls: 'cut h-faq__leaf', sizes: '(max-width: 720px) 120px, 220px' })}</div>
</div>
<div class="faq h-faq__list">
${faq.items.map((it, i) => `<details id="faq-${escA(it.id)}"${i === 0 ? ' open' : ''} data-reveal style="--i:${i % 4}"><summary><h3 class="h-faq__q">${esc(it.q)}</h3></summary><div class="h-faq__a">${faqLinks(it.a_html)}</div></details>`).join('\n')}
</div>
</div>
</section>` : '';
  const faqLd = faqHtml ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.items.map((it) => ({ '@type': 'Question', name: it.q, acceptedAnswer: { '@type': 'Answer', text: ldAnswer(it.a_html) } })),
  } : null;

  const main = [heroHtml, promosHtml, catsHtml, svcHtml, commHtml, storeHtml, eventsHtml, reelsHtml, reviewsHtml, postsHtml, faqHtml, tapeHtml].join('\n');

  const description = `${site.name}, a cannabis dispensary at ${addrLine}. Open ${hoursLine}.`;
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: site.name,
    url: absUrl(ctx, '/'),
    telephone: site.phone,
    address: { '@type': 'PostalAddress', streetAddress: addr.street, addressLocality: addr.city, addressRegion: addr.state, postalCode: addr.zip, addressCountry: 'US' },
    sameAs: (site.socials || []).map((s) => s.url),
  };
  // opening hours from site.json ("Monday to Sunday", "7:00 AM" to "11:00 PM") for "open now" searches
  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const to24 = (t) => { const m = String(t).match(/^(\d{1,2}):(\d{2})\s*([AP])M$/i); if (!m) return null; let h = +m[1] % 12; if (/p/i.test(m[3])) h += 12; return String(h).padStart(2, '0') + ':' + m[2]; };
  const spec = hours.map((r) => {
    const d = String(r.days).match(/^(\w+)\s+to\s+(\w+)$/i) || [];
    const a = DAYS.findIndex((x) => x.toLowerCase() === String(d[1] || '').toLowerCase());
    const b = DAYS.findIndex((x) => x.toLowerCase() === String(d[2] || '').toLowerCase());
    const opens = to24(r.open), closes = to24(r.close);
    return a >= 0 && b >= a && opens && closes ? { '@type': 'OpeningHoursSpecification', dayOfWeek: DAYS.slice(a, b + 1), opens, closes } : null;
  }).filter(Boolean);
  if (spec.length === hours.length) ld.openingHoursSpecification = spec;
  const html = page({
    ctx,
    path: '/',
    title: home.title,
    description: home.description || description,
    og: { title: home.title, description: home.description || description, type: 'website' },
    jsonld: [ld, faqLd].filter(Boolean),
    bodyClass: 'h-page',
    main,
    crumbs: [],
    noTrio: true,
    preload: haze && haze.poster ? [{ href: haze.poster, as: 'image', media: '(min-width: 721px)' }] : [],
  });
  return [{ path: '/', html }];
}
