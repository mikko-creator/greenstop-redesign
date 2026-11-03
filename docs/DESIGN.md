# Design system: STREET GLASS

A redesign concept for Greenstop Wellness (Greenstop Dispensary, Jersey City, NJ): glassmorphism meets graffiti street
art, kept clean and modern. Greenstop's brand colours, logo and tone stay; the site is built in three visual planes.

## Brand

- Colours: lime `#bdd765` on deep forest greens `#04301e` and `#042115`, near-black green `#1b2421`, mid green
  `#316e42`, warm stone `#e1e0d8`, white. All colours live as tokens in `src/styles/tokens.css`; components never
  hard-code a colour that has a token.
- Type: Barlow Condensed in heavy caps for headings (standing in for the brand's condensed display face), Inter for body
  text at 16px, and Sedgwick Ave Display as a graffiti "tag" accent used for one word at a time.
- Lime text is used only on dark grounds; on light grounds the accent switches to the mid green for contrast.

## The three planes

1. **The wall (back).** Dark painted grounds, a graffiti wall image, screen-blended spray haze, soft lime spray glows,
   paint drips hanging from a section's top edge (`.drip-edge`, an SVG mask so the colour follows a variable) and a fine
   grain tile. Light sections are stone or paper, like a freshly primed wall with faint over-spray at the corners.
   Nothing busy ever sits under body text.
2. **The glass (middle).** Frosted panes (`.glass`) with a translucent fill, a hairline border, a lime edge light on the
   top-left and a light sheen that sweeps across on hover. `.glass--paper` is the light-ground variant. The sticky
   header frosts on a pseudo-element so its dropdown panels and the phone drawer keep their own blur. Phones get opaque
   fills instead of live blur.
3. **The street and the front.** Slap-sticker kickers and chips (white border, uneven sticker corners, a slight tilt
   that flattens when hovered), masking tape holding pasted photos (`.taped`), stencil numerals for steps, a
   caution-tape marquee, and cut-out images that break out of their frames and cross section seams (`.protrude`, at most
   one or two per screen).

## Chrome

- **Top bar:** the store address (opens the map), a "When are we open?" button that opens the hours panel, the phone
  number and Instagram.
- **Main bar:** the white Greenstop logo, the main navigation with dropdown panels (Products shows the eight category
  image cards, Education shows the guides and a feature card, About shows its pages and a store photo card, Services
  shows icon cards) and a lime "Shop Now" button. Every destination is reachable from the bar at 1024px and wider.
- **Drawer:** below 1024px the navigation becomes a full-height drawer with accordion groups, large tap targets and
  the store details.
- **Three-card row:** glass cards over the spray-haze wall above the footer of every inner page.
- **Footer:** logo, tagline, store block (address, phone, email, hours, Instagram), link columns, the nearby-areas row,
  the legal row, "Back to top", and a giant cropped GREENSTOP wordmark with a speckled spray texture and a slow lime
  light sweep that pauses off screen.
- **21+ gate:** "Are you 21 or over?" with Yes and No over a darkened store photo. Yes is remembered in the browser; the
  gate is only shown by script, so the page is never blocked when scripts are off.

## Motion

Scroll reveals fade up with a short spray un-blur (staggered, with a fail-safe that shows everything after 2.5 s),
parallax on cut-outs, pointer tilt on cards, a lime spray light that follows the cursor, drips that run once when they
come into view, a marquee, card sliders with real previous/next and dot buttons that pause on hover and focus, and
videos that play only while on screen. Hover states: glass lift with a lime edge glow, sticker peel, slow photo zoom,
link underlines drawn like a spray stroke from the left, and category tiles that lift their image out of the frame.
With reduced motion turned on, all of it stops and autoplay videos stay paused on their poster.

## Accessibility

One `h1` per page, landmarks, real links and buttons, a two-tone focus ring that reads on dark and light grounds,
keyboard and Escape support for every dropdown and the drawer, a focus loop in the drawer and the gate, 44px tap targets
on phones, no text under 13px, and a pause button for moving video.

## Files

`src/styles/base.css` (reset, type, focus), `components.css` (the class contract), `motion.css` (motion hooks),
`shell.css` (header, drawer, footer, gate), `mobile.css` (tablet and phone pass), `src/scripts/site.js` (behaviour),
`src/theme/shell.mjs` (page chrome), decorative SVGs in `assets/brand/` (`grain.svg`, `speckle.svg`, `drip-edge.svg`,
`tape.svg`, `spray-dot.svg`).
