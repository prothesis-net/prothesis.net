# How to build prothesis.net

A small static site for Prothesis LLC — a home page, a privacy page and a not-found page — published with GitHub Pages from this repository's `main` branch, root folder. The words are in `CONTENT.md` and are final. This file says how to build them.

## Files

| File | What | Who makes it |
|---|---|---|
| `index.html` | The home page | **You** |
| `privacy.html` | The privacy page (GitHub Pages serves it at `/privacy`) | **You** |
| `404.html` | The not-found page | **You** |
| `style.css` | All CSS, shared by the three pages | **You** |
| `_config.yml` | One line: `exclude: [BUILD.md, CONTENT.md, README.md]` — stops GitHub Pages publishing these notes as pages | **You** |
| `CNAME` | One line, exactly: `prothesis.net` | **You** |
| `robots.txt` | Two lines: `User-agent: *` and `Allow: /` | **You** |
| `favicon.png` (64×64), `apple-touch-icon.png` (180×180) | Site icons | Already made — use as they are |
| `assets/img/logo-primary-light.png` | The logo for the Navy band, 2373×335 | Already made |
| `assets/img/og-image.png` | The link-preview image, 1200×630 | Already made |
| `assets/fonts/*.woff2` | The four web fonts | Already made |

Do not create, resize or convert any image. Leave `CONTENT.md`, `BUILD.md`, `README.md` and `assets/` in place. The GitHub Pages source (Settings › Pages) is set by the account owner, not by you.

## Hard rules

- **Plain HTML and CSS.** No JavaScript, no frameworks, no build step, no package files.
- **Nothing external.** No Google Fonts, no CDNs, no analytics, no cookies, no trackers, no embeds, no forms on the page. Every file a page loads comes from this repository. **One exception:** the "Join the waitlist" button is an ordinary link to a Microsoft Form; nothing from Microsoft is loaded into the page.
- **Text exactly as in `CONTENT.md`.** Keep its curly quotes, apostrophes and dashes. Never render anything inside `[NOTE: …]` or any `##` label.
- **Root-absolute paths everywhere** (`/style.css`, `/assets/…`, `/favicon.png`), so `404.html` works at any address.
- **The waitlist link:** if `CONTENT.md` still shows the placeholder `WAITLIST_FORM_URL`, build everything with that placeholder left in place verbatim. Do not invent a URL. Name it as outstanding in your final report.
- **No product or app name** appears anywhere; the app is only "our first app" / "this app".
- Every page has `lang="en"`, `<meta charset="utf-8">`, `<meta name="viewport" content="width=device-width, initial-scale=1">`, its `<title>` and description from `CONTENT.md`, `<link rel="icon" href="/favicon.png">` and `<link rel="apple-touch-icon" href="/apple-touch-icon.png">`.
- Home page Open Graph tags: `og:title` "Prothesis LLC", `og:description` = the meta description, `og:image` `https://prothesis.net/assets/img/og-image.png`, `og:url` `https://prothesis.net/`, `og:type` "website".

## Colours

| Name | Hex | Use |
|---|---|---|
| Navy | `#101B23` | The opening band's background; all headings and body text; the button's fill |
| Linen | `#F3F3ED` | Page background below the band |
| Pure Gold | `#D6BA6B` | The tagline, and the button's text — on Navy only |
| Goat's Hair | `#9A734D` | Thin divider rules between sections; the 2 px left bar on quote blocks. **Never text** |
| Deepened Goat's Hair | `#7A5A3B` | The "Coming soon." label |
| Slate Blue | `#526C7C` | Quote attributions; the small print under the button; the footer |
| Royal Purple | `#4B2540` | Only the words of the two Scripture phrases in "The name" |

## Fonts

In `assets/fonts/`, each declared with `@font-face` and `font-display: block` (never `swap`):

| File | Family, weight, style | Use |
|---|---|---|
| `prothesis-basic-regular.woff2` | Prothesis Basic, 400, normal | Body text |
| `prothesis-basic-italic.woff2` | Prothesis Basic, 400, italic | Emphasis; the Guinness quote and the founder's quote; the small print |
| `prothesis-basic-bold.woff2` | Prothesis Basic, 700, normal | Headings, the mission sentence, the closing line, the button |
| `prothesis-scripture-italic.woff2` | Prothesis Scripture, 400, italic | **Only** the tagline and the words of the two Scripture phrases |

No other font appears in any `font-family` stack, with one exception. **πρόθεσις:** neither Prothesis font has Greek letters, so wrap it in `<span lang="grc" class="greek">` with `font-family: "Times New Roman", Georgia, serif; font-style: normal`. The fonts also lack a middle dot (·), which is why separators are en dashes (–); and Prothesis Scripture has no straight quotes or dashes, so quotation marks around Scripture phrases stay in Prothesis Basic.

## The opening band (every page)

A full-width Navy band holding, centred: the logo (linked to `/`, `width="2373" height="335"` in the HTML with CSS `width: 260px; height: auto` — 200 px on phones), then the tagline in Prothesis Scripture italic, Pure Gold, 20 px (18 px on phones), 18 px below the logo. Below them runs **the golden arc**: the top edge of a very large circle, a thin gold line with a soft glow, along which a short bright glint slides slowly. It is the only motion on the site.

Band padding: 72 px top, 150 px bottom (phones: 48 px top, 120 px bottom). `position: relative; overflow: hidden`. The logo and tagline get `position: relative; z-index: 1`.

Put this SVG as the last child of the band, exactly as written:

```html
<svg class="firmament" viewBox="0 0 1600 220" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
  <defs>
    <filter id="fg-halo" x="-10%" y="-200%" width="120%" height="500%"><feGaussianBlur stdDeviation="9"/></filter>
    <filter id="fg-glow" x="-10%" y="-200%" width="120%" height="500%"><feGaussianBlur stdDeviation="2.2"/></filter>
    <linearGradient id="fg-glint" gradientUnits="userSpaceOnUse" x1="700" y1="0" x2="900" y2="0">
      <stop offset="0" stop-color="#f2cc52" stop-opacity="0"/>
      <stop offset=".28" stop-color="#f2cc52" stop-opacity=".5"/>
      <stop offset=".5" stop-color="#fff5c8" stop-opacity="1"/>
      <stop offset=".72" stop-color="#f2cc52" stop-opacity=".5"/>
      <stop offset="1" stop-color="#f2cc52" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <circle cx="800" cy="1700" r="1600" fill="none" stroke="#e8d59a" stroke-width="22" stroke-opacity=".22" filter="url(#fg-halo)"/>
  <circle cx="800" cy="1700" r="1600" fill="none" stroke="#d6ba6b" stroke-width="5" stroke-opacity=".7" filter="url(#fg-glow)"/>
  <circle cx="800" cy="1700" r="1600" fill="none" stroke="#b08a34" stroke-width="1.5"/>
  <g class="glint">
    <path d="M 700 103.1 A 1600 1600 0 0 1 900 103.1" fill="none" stroke="url(#fg-glint)" stroke-width="5" stroke-opacity=".25"/>
    <path d="M 700 103.1 A 1600 1600 0 0 1 900 103.1" fill="none" stroke="url(#fg-glint)" stroke-width="1.8"/>
  </g>
</svg>
```

And this CSS for it:

```css
.firmament { position: absolute; left: 0; right: 0; bottom: 0; width: 100%; height: 220px; z-index: 0; pointer-events: none; }
.glint { transform-box: view-box; transform-origin: 800px 1700px; animation: glint 22s linear -7s infinite; will-change: transform; }
@keyframes glint { from { transform: rotate(-24deg); } to { transform: rotate(24deg); } }
@media (prefers-reduced-motion: reduce) { .glint { animation: none; transform: rotate(-6deg); } }
@media (max-width: 600px) { .firmament { height: 170px; } }
```

The glint animates `transform` only; nothing else on any page moves. Under reduced motion it stands still.

## Layout and type

- Below the band, on Linen: one centred column, max width 680 px, side padding 24 px (20 px on phones), 64 px space under the band (48 px on phones).
- **Visible headings:** one H1 per page (home: "Discover and live out your true purpose."; privacy: "Privacy"; 404: "This page doesn’t exist."). H2s on the home page, in order: Calling · Meaning comes from His Word · Our first app · The name · Mission · From the founder · Contact. The Opening, the Close and the footer have no visible heading.
- **Sizes** (desktop / phone): H1 40 / 30 px bold, line-height 1.15 · H2 22 / 20 px bold · body 18 / 17 px, line-height 1.6 · quote text 20 / 18 px italic · attributions and small print 15 px · the closing line 24 / 21 px bold, centred, standing alone · the mission sentence 20 px bold.
- **Sections** separated by 56 px of space (44 px on phones) and a 1 px Goat's Hair rule at 45 % opacity.
- **Quote blocks:** indented 24 px (18 px on phones) with a 2 px Goat's Hair bar on the left; the attribution on its own line in Slate Blue, normal style.
- **Our first app:** "Coming soon." label 13 px bold, uppercase via CSS, letter-spacing .12em, deepened Goat's Hair, 14 px above the text. The button: a solid Navy rectangle, Pure Gold bold text, padding 14 px × 26 px, at least 48 px tall, square corners, no shadow, no outline-only style. Small print beneath in Slate Blue italic, 15 px.
- **Links:** Navy, underlined (underline in Goat's Hair, offset 3 px). In the footer, links take the footer's Slate Blue.
- **Focus:** every link and the button show `:focus-visible` as a 2 px Navy outline with 3 px offset (on Navy backgrounds use Pure Gold).
- **Footer:** centred, max width 680 px, 1 px Goat's Hair rule above, 28 px padding top, 56 px bottom, 15 px Slate Blue text; wraps cleanly on narrow phones.

## Design principles

Applied from *Give Me 7 Minutes & Your Web Design Skills Will Take Off* (Self-Made Web Designer, 2025). Each line says how it applies here.

1. **Visual hierarchy, not a forced reading pattern.** In every section the most important element is the biggest and boldest; everything else is turned down. Order of weight: the H1 → H2s → the mission sentence and the closing line → body text → attributions and small print.
2. **The button is the loudest thing in its section** — solid, filled, never an outline-only "ghost" button; Navy with Pure Gold text. It is the only button on the site.
3. **Contrast for every reader.** All text meets WCAG AA: 4.5:1 for normal text, 3:1 for large text (24 px+, or 18.7 px+ bold). Measured: Navy on Linen ≈16:1 · Slate Blue on Linen ≈5:1 · Royal Purple on Linen passes · Pure Gold on Navy ≈9:1 · deepened Goat's Hair on Linen ≈5.6:1. Goat's Hair `#9A734D` on Linen is only ≈3.8:1, and on Navy ≈4.1:1 — decoration only, never text.
4. **60-30-10 colour balance.** About 60 % neutral (Linen), 30 % brand (Navy: the band and all text), 10 % accent (gold: the tagline, the arc, the button text, the rules, the quote bars). The accent never fills a large area.
5. **Three text levels, used honestly.** One H1 per page; H2s divide the page; paragraph text plain Prothesis Basic, never decorative.
6. **Built for scanning.** Headings carry the meaning on their own; short paragraphs; generous space; a text column of 65–75 characters a line.
7. **Clarity, then motivation, then one next step.** The band says who this is; the H1 says what it is about; the page builds the reason to care before asking for one thing only: joining the waitlist.
8. **Designed for the people who will read it** — Christian professionals asking what their life and work are for. Calm, sober, confident: one slow motion (the arc's glint), no carousels, no pop-ups, no stock imagery.

## Check before finishing

- Open each page at 360 px and 1280 px wide; nothing overlaps or scrolls sideways; the arc shows as a gentle curve on both.
- Every font file and image loads (no 404s); no request leaves the domain.
- Every text colour pair meets Design principle 3; no text in `#9A734D`.
- Search the built HTML for "Consulting", "lorem" and "NOTE": none present. "Coming soon." appears exactly once in the source.
- The footer reads exactly: `Prothesis LLC – Greater Chicago area, Illinois – contact@prothesis.net – © 2026 Prothesis LLC – Privacy`.
- `WAITLIST_FORM_URL`: either the real link from `CONTENT.md`, or still the placeholder, reported as outstanding.

Commit straight to `main`. If you can't, open a pull request and say so.
