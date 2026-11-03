# Media: generated imagery and motion

The "Street Glass" redesign adds a set of illustrative images and one background loop. They set the mood: night scenes in deep forest green, a lime spray-paint glow, abstract graffiti made only of shapes, frosted glass, and still lifes of product categories on dark concrete.

## What is generated and what is Greenstop's own

- **Generated:** every file in `assets/generated/` and the hero loop files `assets/media/hero-haze.mp4`, `hero-haze-sm.mp4`, `hero-haze.jpg` and `hero-haze-sm.jpg`.
- **Greenstop's own:** the brand marks in `assets/brand/`, the photographs in `assets/photos/gs/` and the videos in `assets/media/gs/` belong to Greenstop. This note does not cover them.

None of the generated images shows a real Greenstop product, store, staff member or customer, and none of them stands in for one. No image shows a person. The street scene is not a real address. The product scenes are generic still lifes, not Greenstop's stock. No generated image should be captioned as a photograph of Greenstop.

## Models and providers

| Media | Model | Provider | Count |
|---|---|---|---|
| 16 stills in `assets/generated/` | FLUX 1.1 Pro Ultra (Black Forest Labs) | fal.ai | 16 shipped from 22 generations (6 rejected or superseded on review) |
| Transparent cut-outs `g-bud-cut`, `g-leaf-cut`, `g-can-cut` | BiRefNet v2 background removal, run on the FLUX output | fal.ai | 3 |
| Hero loop `hero-haze` | Kling 2.1 Standard image-to-video, from the `g-hero-wall` still | fal.ai | 1 clip (5 s) |

| 2 stills `g-hf-wall`, `g-hf-glass` (call-to-action card backdrops) | z_image | Higgsfield | 2 shipped from 2 generations |

Higgsfield was tried first for `g-city-dusk` (Soul) and for the hero loop (Kling 3.0). Neither request went through, so both were made on fal instead. The two Higgsfield stills (`g-hf-wall`: abstract lime and white spray strokes with drips on green concrete; `g-hf-glass`: a mural alley seen through rain-speckled glass) were reviewed at full size: no letters, no people, not a real place.

## How each image was made

Every image was looked at full size before it was accepted. Images with readable words, logos, faces, hands or people were rejected and made again (at most two retries per image).

| Id | Use | Aspect | Accepted | Notes |
|---|---|---|---|---|
| `g-hero-wall` | Home hero still, loop key frame | 16:9 | Attempt 1, retouched | A dotted block on the left that looked like a "6" or "E" was painted out, so a faint soft smear is left there. Attempt 2 was rejected because its left half was too busy for a headline. |
| `g-spray-haze` | Overlay (screen blend), loop source | 16:9 | Attempt 1 | |
| `g-drips` | Section band | 21:9 | Attempt 1 | |
| `g-city-dusk` | Neighbourhood band | 16:9 | Attempt 3, retouched | A narrow lane with murals at blue hour. Attempts 1 and 2 had signs with lettering, people and cars. One tiny distant figure was painted out of attempt 3. |
| `g-glass-bud` | Product story panel | 4:5 | Attempt 1 | Made at 3:4, then cropped to 4:5. |
| `g-flower` | Category tile | 3:2 | Attempt 1 | |
| `g-prerolls` | Category tile | 3:2 | Attempt 2 of 3 | Rolled papers filled with ground flower. They are not cone-shaped and have no twisted tips. Attempts 1 and 3 were worse: empty papers, and a filter-like tip. |
| `g-edibles` | Category tile | 3:2 | Attempt 1 | |
| `g-vapes` | Category tile | 3:2 | Attempt 1 | |
| `g-concentrates` | Category tile | 3:2 | Attempt 2 | Attempt 1 could be mistaken for candy. |
| `g-tinctures` | Category tile | 3:2 | Attempt 1 | |
| `g-topicals` | Category tile | 3:2 | Attempt 1 | |
| `g-accessories` | Category tile | 3:2 | Attempt 1 | The glass piece is a small water pipe, not a hand pipe. |
| `g-bud-cut` | Cut-out (PNG with alpha) | 1:1 | Attempt 1 | |
| `g-leaf-cut` | Cut-out (PNG with alpha) | 1:1 | Attempt 1 | |
| `g-can-cut` | Cut-out (PNG with alpha) | 3:4 | Attempt 1 | |

Prompts, seeds and request ids are in `src/content/image-plan.json` and `audit/generated-images.json`. Each file in `assets/generated/` has a `<file>.json` sidecar with its review.

## The hero loop

- **Source:** the `g-hero-wall` still, animated by Kling 2.1 Standard into a 5-second clip (1928x1072, 24 fps, no audio). The prompt asks for slow lime haze drifting across the wall with the wall and the mural held still.
- **Loop:** the clip plays forward and then backward (frames 0 to 120, then 119 back to 1). That gives 240 frames and 10.0 seconds with no cut. The motion is slowest at both turns, so the reversal is gentle.
- **Files:** `hero-haze.mp4` is 1920x1072 (1.7 MB). `hero-haze-sm.mp4` is a 720x1080 phone crop of the left half of the mural, where the haze drifts in (0.7 MB). Both are H.264 with no audio, faststart and limited colour range. The posters `hero-haze.jpg` and `hero-haze-sm.jpg` are the first frames.
- **Calmness:** the mean luma change between frames is 0.30 on a 0 to 255 scale (p95 0.65, max 1.45 at the wrap, where the encoder restarts on a keyframe). No frame changes by more than 20, so nothing flashes. The phone crop is similar (mean 0.37, max 1.61).
- **Use:** decorative and muted, with `loop`, `playsinline` and `aria-hidden`, plus a visible pause toggle. Show only the poster under `prefers-reduced-motion`.

## Labelling

- Every generated JPEG and PNG carries an embedded IPTC XMP packet with `Iptc4xmpExt:DigitalSourceType` = `http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia`. The retouched and cropped files were labelled again after editing.
- The two loop videos carry the same IPTC source-type URI in their container `comment` and `description` tags, along with a note that they are not footage of Greenstop. The posters carry the XMP label.
- Check with `node tools/ai-label.mjs verify assets/generated assets/media/hero-haze.mp4 assets/media/hero-haze-sm.mp4 assets/media/hero-haze.jpg assets/media/hero-haze-sm.jpg`.

## Greenstop's hero video, AI-upscaled

- **Source:** Greenstop's own store video on the live home page (`WhatsApp-Video-2025-08-01-at-06.23.50_111c9249.mp4`,
  848x480, about 24 fps). The first 16 seconds (384 frames) were cut from the original upload, near-lossless, no audio.
- **Upscale:** Topaz Video, Proteus model, x2.25 to 1908x1080, through fal.ai. Higgsfield's video upscaler was tried
  first and could not run this job, so the same Topaz engine was used on fal.ai.
- **Checks:** every upscaled frame, scaled back to 848x480, matches its source frame (SSIM mean 0.979, lowest 0.950;
  frames offset by 3 s score 0.528, so the check can fail). Edge detail is about 1.7 to 1.9 times that of a plain
  Lanczos enlargement. Faces and on-screen text were compared side by side: sharper, nothing added or changed.
- **Files:** `assets/media/gs/WhatsApp-Video-2025-08-01-at-06.23.50_111c9249.mp4` 1600x906 (desktop) and `...-sm.mp4`
  960x544 (phones, chosen with `<source media>`), H.264, no audio, plus a 1280px poster. Both videos carry the IPTC
  digital source type `algorithmicallyEnhanced` and a plain "AI-upscaled" note in their container tags: the content is
  Greenstop's footage, the model added resolution only.
