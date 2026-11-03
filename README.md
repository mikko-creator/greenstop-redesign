# Greenstop Wellness: "Street Glass" redesign concept

A redesign concept for [greenstopwellnessjc.com](https://greenstopwellnessjc.com/), the adult-use cannabis dispensary
at 516 Tonnelle Ave, Jersey City, NJ. Greenstop's own words, photos, videos, events, team, blog and FAQ are rebuilt on a
new multi-level information architecture (store top bar, Products / Education / About hubs with child pages, service
pages, a three-card call-to-action row and a store footer), in a new visual system: glassmorphism crossed with
graffiti street culture, kept clean and modern, with layered depth and scroll motion.

**Preview:** see the repository's GitHub Pages link (the preview is marked `noindex`; its forms are demos and send
nothing).

## What is in it

- **Content.** Every visible word of Greenstop's live pages, posts, events and team pages, captured on 2026-11-03.
  New pages (product categories, education guides, service pages, the store page, the service-area page) use only
  neutral connecting copy, Greenstop's own facts, or New Jersey facts linked to their official sources.
- **Design.** Brand colours from the live site (lime `#bdd765` on forest greens `#04301e` / `#042115`, stone
  `#e1e0d8`), condensed display caps, Inter body. Three planes: the painted wall (spray haze, drips, grain), frosted
  glass panes with a lime edge light, and cut-outs and taped photos that break their frames. See
  [docs/DESIGN.md](docs/DESIGN.md).
- **Imagery.** Greenstop's own photos and videos, plus illustrative AI imagery and one AI motion loop, each labelled
  as AI-generated in its file metadata. None of the AI imagery depicts Greenstop's store, staff, customers or products.
  See [docs/MEDIA.md](docs/MEDIA.md).

## Build

Node 18+ and `cwebp` on PATH. No dependencies.

```bash
MSYS_NO_PATHCONV=1 node src/build.mjs          # src/content/*.json -> dist/
node tools/serve.mjs --root dist --port 8080 --not-found 404.html
```

`src/content/` holds the content (captured pages, posts, events, team, guides, site facts, the navigation map),
`src/theme/` the page templates, `src/styles/` the stylesheets, `src/scripts/site.js` the behaviour, `assets/` the
fonts, brand files, photos, videos and generated imagery.

Fonts: Barlow Condensed, Inter and Sedgwick Ave Display (SIL Open Font License), self-hosted.
