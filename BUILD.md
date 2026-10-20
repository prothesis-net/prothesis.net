# How to build prothesis.net (v3 — the scrolling story)

A small static site for Prothesis LLC, published with GitHub Pages from this repository's `main` branch, root folder. The home page is a **scrolling story of ten chapters, each at least a screen tall**, each its own colour, with text centred and big, and lines that rise gently into place as you scroll. There is also a privacy page and a not-found page. The words are in `CONTENT.md` and are final; this file says how to build them.

## Files

| File | What | Who makes it |
|---|---|---|
| `index.html` | The home page (the story) | **You** |
| `privacy.html` | The privacy page (GitHub Pages serves it at `/privacy`) | **You** |
| `404.html` | The not-found page | **You** |
| `style.css` | All CSS, shared by the three pages | **You** |
| `_config.yml` | One line: `exclude: [BUILD.md, CONTENT.md, README.md]` | **You** |
| `CNAME` | One line, exactly: `prothesis.net` | **You** |
| `robots.txt` | Two lines: `User-agent: *` and `Allow: /` | **You** |
| `favicon.png` (64×64), `apple-touch-icon.png` (180×180) | Site icons | Already made |
| `assets/img/logo-primary-light.png` | The Linen logo, 2373×335 | Already made |
| `assets/img/mark-linen.png` | The dove/P mark in Linen, 1071×1240, transparent — the Close chapter only | Already made |
| `assets/img/og-image.png` | The link-preview image, 1200×630 | Already made |
| `assets/img/bg-word-desktop.jpg`, `bg-word-mobile.jpg`, `bg-app-desktop.jpg`, `bg-app-mobile.jpg`, `bg-mission-desktop.jpg`, `bg-mission-mobile.jpg` | Pre-blurred painting backgrounds for chapters 4, 5 and 7 (desktop 1920×1200, phone 900×1950) | Already made |
| `assets/fonts/*.woff2` | The four web fonts | Already made |

Do not create, resize or convert any image. Leave `CONTENT.md`, `BUILD.md`, `README.md` and `assets/` in place. The GitHub Pages source (Settings › Pages) is set by the account owner, not by you.

**Backgrounds:** three chapters carry one of Albert's paintings, two carry temporary colour fields — see "Backgrounds" below. Use only the image files listed here; never add or substitute any other picture.

## Hard rules

- **Plain HTML and CSS, plus the reveal script** — one line in `<head>` and one small block at the end of `<body>` (both in "Motion" below), and nothing else. No frameworks, no build step, no package files.
- **Without the script, everything is visible.** The `<head>` line adds a `js` class to `<html>`; only `.js .r` starts hidden. If JavaScript is off or fails, the page reads complete and still.
- **Nothing external.** No Google Fonts, no CDNs, no analytics, no cookies, no trackers, no embeds, no forms on the page. Every file a page loads comes from this repository. **One exception:** the "Join the waitlist" button is an ordinary link to the Microsoft Form; nothing from Microsoft is loaded into the page.
- **Text exactly as in `CONTENT.md`.** Keep its curly quotes, apostrophes, en and em dashes, and every "&". Never render anything inside `[NOTE: …]` or any `##` label. `KICKER:` is a label word, not text — render only what follows it.
- **"&" never ends a line.** In page text write each one as `&amp;&nbsp;` joined to the next word. Inside attributes (`content="…"`, `aria-label`) write `&amp;` followed by a plain space.
- **Root-absolute paths everywhere** (`/style.css`, `/assets/…`, `/favicon.png`), so `404.html` works at any address.
- **No product or app name** anywhere; the app is only "our first app" / "this phone app".
- Every page has `lang="en"`, `<meta charset="utf-8">`, `<meta name="viewport" content="width=device-width, initial-scale=1">`, its `<title>` from `CONTENT.md` (the meta description is on the home page only — the privacy and 404 pages have none), `<link rel="icon" href="/favicon.png">` and `<link rel="apple-touch-icon" href="/apple-touch-icon.png">`.
- Home page Open Graph tags: `og:title` "Prothesis", `og:description` = the meta description, `og:image` `https://prothesis.net/assets/img/og-image.png`, `og:url` `https://prothesis.net/`, `og:type` "website".

## Colours

```css
:root{--navy:#101B23;--linen:#F3F3ED;--gold:#D6BA6B;--sea:#BFAC94;--water:#3A5267;--purple:#4B2540;--earth:#443A31;--slate:#526C7C;--goat:#9A734D;--goat-d:#7A5A3B}
```

| Chapter | Background | Text | Kicker (small label) | Quiet text (attributions, small print) |
|---|---|---|---|---|
| 1 Opening | Navy | Linen | — | — |
| 2 The question | Navy | Linen; the question in Pure Gold | — | — |
| 3 Calling | Royal Purple + colour field | Linen | **Linen** (over the colour field gold falls to 3.3:1 and Sea Cow to 2.8:1) | **Linen** |
| 4 His Word | Living Water + painting | Linen | **Linen** (gold is only 4.3:1 here) | **Linen** at full strength (Sea Cow is only 3.7:1 here) |
| 5 Our first app | Navy + painting | Linen | Pure Gold | Sea Cow |
| 6 The name | Linen | Navy; Scripture words Royal Purple | Deepened Goat's Hair | Slate Blue |
| 7 Mission | Genesis Earth + painting | Linen; ladder numbers Pure Gold (large bold — 3.4:1 over the painting, above the 3:1 large-text bar) | **Linen** (gold falls to 2.6:1 over the painting) | Linen (the credit line) |
| 8 From the founder | Sea Cow | Navy | **Navy** (Goat's Hair fails here) | Genesis Earth |
| 9 Close | Navy | Linen; the closing line Pure Gold | — | — |
| 10 Contact + footer | Linen | Navy; footer Slate Blue | Deepened Goat's Hair | Slate Blue |

Goat's Hair `#9A734D` is never text — rules and bars only.

Measured contrast (WCAG): Linen on Navy 15.7 · Gold on Navy 9.2 · Sea Cow on Navy 7.9 · Linen on Purple 11.5 · Gold on Purple 6.8 · Sea Cow on Purple 5.8 · Linen on Water 7.3 · Linen on Earth 10.0 · Gold on Earth 5.9 · Navy on Sea Cow 7.9 · Earth on Sea Cow 5.0 · Navy on Linen 15.7 · deepened Goat's Hair on Linen 5.6 · Slate on Linen 5.0 · Navy on Gold 9.2. Every pair used for text above is ≥ 4.5.

## Fonts

In `assets/fonts/`, each declared with `@font-face` and `font-display: block` (never `swap`):

| File | Family, weight, style | Use |
|---|---|---|
| `prothesis-basic-regular.woff2` | Prothesis Basic, 400, normal | Body text |
| `prothesis-basic-italic.woff2` | Prothesis Basic, 400, italic | Quotes, the question, small print, *trans* / *latus* |
| `prothesis-basic-bold.woff2` | Prothesis Basic, 700, normal | Headlines, kickers, the button, the calls, the closing line |
| `prothesis-scripture-italic.woff2` | Prothesis Scripture, 400, italic | **Only** the tagline, *translatio*, the Colossians verse words, and the two Scripture phrases in The name |

No other font appears in any `font-family` stack, with one exception. **Greek (πρόθεσις, μεθίστημι) and the transliteration *methistēmi*:** neither Prothesis font has Greek letters, so wrap each in `<span lang="grc" class="greek">` with `font-family: "Times New Roman", Georgia, serif; font-style: normal; font-weight: 400`. The fonts also lack a middle dot (·), which is why separators are en dashes (–); and Prothesis Scripture has no straight quotes or dashes, so quotation marks around Scripture stay in Prothesis Basic. *methistēmi* goes in `<i class="translit">` with the same serif stack, italic — the Prothesis fonts have no ē. Glyphs checked in the four font files: Prothesis Basic has curly quotes, apostrophe, en and em dash, © and &; Prothesis Scripture has letters, comma, period, colon, curly quotes and apostrophe but **no dashes and no ©**, so those are never set in it.

## Layout

- **Every chapter:** a `<section>` with two classes, `ch` plus its own — `ch-open`, `ch-question`, `ch-calling`, `ch-word`, `ch-app`, `ch-name`, `ch-mission`, `ch-founder`, `ch-close`, `ch-contact` (chapters 1–10). The chapter's own class alone sets its background: `.ch-open, .ch-close { background: #101B23 }`, `.ch-name, .ch-contact { background: #F3F3ED }`, `.ch-founder { background: #BFAC94 }`, and the other five as in "Backgrounds". `.ch`: `min-height: 100svh` (a chapter grows taller when its content needs it — never a fixed height), `display: flex; align-items: center; justify-content: center`, `padding: 14vh 24px` (phones `12vh 20px`), `overflow: hidden`, `position: relative`. Inside it one wrapper `<div class="inner">`: `width: 100%; max-width: 1040px` (chapters 5 and 8: `760px`), `margin: 0 auto`, `position: relative; z-index: 1`. **All text is centred** (Albert's ruling) — including quotes, the ladder and the calls. Long paragraphs keep `max-width: 34em` and `margin-inline: auto` so lines stay readable.
- **Base CSS:** `*, *::before, *::after { box-sizing: border-box } body { margin: 0 }`.
- **"Phones"** everywhere in this file means `@media (max-width: 600px)`; every phone value lives inside that query. (Only the calls grid switches at 720 px, as stated there.)
- **Type scale** (fluid):
  - `.d1` — the H1 and the closing line: bold, `clamp(44px, 7.2vw, 104px)`, line-height .98, letter-spacing −.02em.
  - `.d2` — chapter headlines (chapter 2's first line "Most of us live by…", "Translation ignites purpose.", the app headline, the mission sentence): bold, `clamp(34px, 5vw, 72px)`, line-height 1.04.
  - `.d3` — standing lines ("Prothesis exists for that question.", "Prothesis helps people discover both…", "And what is carried in is carried out.", "A purpose that is His…", the contact line): bold, `clamp(26px, 3.2vw, 44px)`, line-height 1.15.
  - `.lead` — paragraphs: `clamp(20px, 2vw, 28px)`, line-height 1.45, `margin-top: 28px`.
  - `.q` — quotes and the question: italic, `clamp(24px, 3vw, 42px)`, line-height 1.3.
  - `.k` — kicker: 13 px bold, uppercase via CSS, letter-spacing .18em, 28 px above what follows.
  - attributions 16 px, letter-spacing .04em, normal style, 26 px above.
  - body base `clamp(18px, 1.4vw, 22px)`, line-height 1.55.
  - `h1, .d1, .d2, .d3, .q { text-wrap: balance; }`

**Which element and class each block gets** (`r` = rises in; stagger classes are in "Motion"):

| Ch | Block in CONTENT.md | Markup |
|---|---|---|
| 1 | tagline · H1 | `<p class="tagline">` · `<h1 class="d1 r">` |
| 2 | "Most of us live by…" · "The next deadline…" · the question · "Prothesis exists…" | `<h2 class="d2 r">` · `<p class="lead r s1">` · `<p class="q r s2">` (Pure Gold) · `<p class="d3 r s3">` |
| 3 | kicker · Guinness quote with its attribution · each call · "Prothesis helps people…" | `<h2 class="k r">` · `<blockquote class="q r s1">` with `<p class="attr">` inside · `<div class="call r s2">` / `s3` (bold line `<p class="call-head">`, sentence `<p class="call-text">` at body size) · `<p class="d3 r s4">` |
| 4 | kicker · "Translation ignites purpose." · "It is an old word…" · *translatio* + Latin line · verse + reference · "That is what happens…" · "And what is carried in…" · "This is not a program…" · {LOGO} + "builds the software tools…" | `<h2 class="k r">` · `<p class="d2 r s1">` — **Prothesis Basic bold, Linen: the tagline's words, not the tagline's style** · `<p class="lead r s2">` · `<p class="r s3">` with `<span class="translatio">` (block) and `<span class="latin">` (body size; *trans*/*latus* Basic italic; "A carrying across." Basic bold) · `<blockquote class="verse r s4">` · `<p class="lead r s5">` · `<p class="d3 r">` · `<p class="lead r s1">` · `<p class="lead r s2">` with the logo inside |
| 5 | kicker · headline · "Leave your email…" · button · small print | `<h2 class="k r">` · `<p class="d2 r s1">` · `<p class="lead r s2">` · `<p class="r s3"><a class="btn">` · `<p class="fine r s4">` |
| 6 | kicker · πρόθεσις · "Prothesis: …" · the four Scripture lines · "A purpose that is His…" | `<h2 class="k r">` · `<p class="greek-big r s1">` · `<p class="d3 r s2">` · `<p class="lead r s3">` · `<p class="d3 r s4">` |
| 7 | kicker · {LOGO} + mission sentence · ladder | `<h2 class="k r">` · `<p class="d2 r s1">` with the logo inside · `<ol class="ladder">`, each `<li class="r s2">` / `s3` / `s4` |
| 8 | kicker · quote with attribution | `<h2 class="k r">` · `<blockquote class="q r s1">` with `<p class="attr">` inside |
| 9 | paragraph · closing line | `<p class="lead r">` · `<h2 class="d1 close-line r s1">` |
| 10 | kicker · "Prothesis LLC is based…" · "Write to us: …" | `<h2 class="k r">` · `<p class="lead r s1">` · `<p class="d3 contact r s2">` |

Kickers are `<h2>` so screen readers can move chapter to chapter; chapters 2 and 9 use the `<h2>` shown. The footer, the credit lines, the arc and the Close mark never get `r`.
- **Chapter 1 (Opening):** logo at the top centre (`width: 200px; height: auto`, HTML `width="2373" height="335"`, linked to `/`), the tagline 12 px under it (Prothesis Scripture italic, Pure Gold, 18 px). The H1 centred in the screen. Extra bottom padding (26vh) for the golden arc (below). Layout: chapter 1's `.inner` is a column flex with `min-height: calc(100svh - 14vh - 26vh)`; the logo and tagline sit at its top and the H1 takes `margin: auto 0`, which centres it in the space that remains.
- **Chapter 3 (Calling):** the two calls in a two-column grid, 48 px gap, 64 px above (one column under 720 px, 32 px gap). Each call has a 2 px Pure Gold rule on top and 24 px padding; its bold line `clamp(22px, 2.2vw, 30px)`, 12 px above the sentence.
- **Chapter 4 (His Word):** *translatio* in Prothesis Scripture italic at `clamp(26px, 3vw, 42px)`, `font-weight: 400; font-synthesis: none` (the font has no bold — never fake one), on its own line; the Latin line beneath. The verse block: 40 px above; verse words Prothesis Scripture italic `clamp(20px, 2.2vw, 30px)`; its reference line 15 px, Linen. Because everything is centred, the verse gets **no side bar** — instead a 2 px Pure Gold rule 64 px wide, centred, above it. Order: the Latin line, 40 px, the gold rule, 24 px, the verse words, then the reference line.
- **The logo inline** (chapters 4 and 7): the `{LOGO}` marker in CONTENT.md is the logo on its own line above the sentence that follows. Put the image **inside** that sentence's element so its size follows the sentence: `<p class="lead r s2"><img class="logo-inline" src="/assets/img/logo-primary-light.png" alt="Prothesis" width="2373" height="335">builds the software tools &amp;&nbsp;gathers community for that practice.</p>` (chapter 7 the same, inside its `.d2`). CSS: `.logo-inline { display: block; height: .9em; width: auto; margin: 0 auto 10px; }`.
- **Chapter 5 (Our first app):** the button — Pure Gold fill, Navy bold text `clamp(18px, 1.6vw, 22px)`, padding 20 × 38 px (phones 18 × 30), at least 48 px tall, square corners, no shadow, margin 40 px 0 18 px. It is the only button on the site. Small print 16 px italic, Sea Cow — the whole line, including "– Privacy"; its "Privacy" link Sea Cow, underlined.
- **Chapter 6 (The name):** πρόθεσις at `clamp(72px, 14vw, 220px)`, line-height 1, 20 px below. "Prothesis: a purpose set forth beforehand." as `.d3`, marked up `Prothesis<span class="colon">&nbsp;:</span> <span class="rest">a purpose set forth beforehand.</span>`. Desktop reads "Prothesis : a purpose set forth beforehand." (the colon set apart, as in Albert's deck). On phones `.colon { display: none }` and `.rest { display: block }`, so "Prothesis" stands on its own line with no colon. The four Scripture lines as `.lead`, one per line (`<br>`).
- **Chapter 7 (Mission):** the ladder — `<ol class="ladder">` with `list-style: none; padding: 0; max-width: 34em; margin: 56px auto 0` (the rules span that width); each line `clamp(22px, 2.6vw, 36px)`, padding 26 px 0, a 1 px rule `rgba(243,243,237,.25)` above each and below the last; the number in Pure Gold bold with 18 px after it.
- **Chapter 9 (Close):** `<img src="/assets/img/mark-linen.png" alt="" aria-hidden="true">` a direct child of the section (after `.inner`, never inside it), `position: absolute`, bottom-right (`right: -6vw; bottom: -6vh; width: min(70vw, 620px); opacity: .07; z-index: 0`). The paragraph first (`.lead`, max 40em, 40 px below), then the closing line as `.d1` in Pure Gold, at `font-size: clamp(40px, 6.4vw, 92px)` — just under the H1.
- **Chapter 10 (Contact):** not full-height: `min-height: auto`, padding 18vh 24px 10vh. The email link Navy, underline in Goat's Hair, offset 4 px.
- **Footer:** on Linen, centred, 15 px Slate Blue, padding 0 24px 56px. Wrap each of the five items in `<span style="white-space:nowrap">` so lines break only at the en dashes. Links take the footer colour.
- **Links:** underlined, `text-underline-offset: 4px`. **Focus:** every link and the button show `:focus-visible` as a 3 px outline, 4 px offset — Linen on dark chapters, Navy on light ones.
- **Phones:** small links get a larger tap area without moving the layout: `.fine a, footer a, .contact a { display: inline-block; padding: 10px 4px; margin: -10px -4px; }`.

## The golden arc (chapter 1 and the band on the other pages)

A thin gold line along the top of a very large circle, with a soft glow, along which a short bright glint slides slowly. Put this SVG as the last child of chapter 1, exactly as written:

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

```css
.firmament { position: absolute; left: 0; right: 0; bottom: 0; width: 100%; height: 30vh; min-height: 170px; z-index: 0; pointer-events: none; }
.glint { transform-box: view-box; transform-origin: 800px 1700px; animation: glint 22s linear -7s infinite; will-change: transform; }
@keyframes glint { from { transform: rotate(-24deg); } to { transform: rotate(24deg); } }
@media (prefers-reduced-motion: reduce) { .glint { animation: none; transform: rotate(-6deg); } }
```

**Privacy and 404 pages** keep a short Navy band instead of a full chapter: logo (260 px; 200 px on phones) and tagline centred, padding 72 px top / 150 px bottom (phones 48 / 130), the same SVG as its last child with `height: 220px` (phones 170 px). Below it, on Linen: one centred column, max 680 px, side padding 24 px (20 on phones), 64 px under the band; H1 40 / 30 px bold; body 18 / 17 px, line-height 1.6; text left-aligned on these two pages (they are reading pages, not the story). Same footer.

## Backgrounds — colour, paintings and two temporary colour fields

Five chapters have more than a flat colour behind them. Give each chapter section its class (`ch-question`, `ch-calling`, `ch-word`, `ch-app`, `ch-mission`) and put its content inside an inner wrapper `.inner` (the wrapper from Layout) with `position: relative; z-index: 1`, so text always sits above the background. Do **not** give every child of a chapter `position: relative` — the arc SVG and the Close mark are absolutely positioned children.

**Chapters 4, 5 and 7 — Albert's paintings (by Yudianto Prabowo, owned by Prothesis Consulting LLC).** The images in `assets/img/bg-*.jpg` are already blurred, framed **and darkened by their colour wash** (Living Water fading to Navy; Navy at 82 %; Genesis Earth at 80 %) — that wash is what keeps the text readable. Use them exactly as below; never add a lighter overlay, filter or brightness change.

```css
.ch-word    { background: #3A5267 url(/assets/img/bg-word-desktop.jpg) center / cover no-repeat; }
.ch-app     { background: #101B23 url(/assets/img/bg-app-desktop.jpg) center / cover no-repeat; }
.ch-mission { background: #443A31 url(/assets/img/bg-mission-desktop.jpg) center / cover no-repeat; }
@media (max-aspect-ratio: 4/5) {
  .ch-word    { background-image: url(/assets/img/bg-word-mobile.jpg); }
  .ch-app     { background-image: url(/assets/img/bg-app-mobile.jpg); }
  .ch-mission { background-image: url(/assets/img/bg-mission-mobile.jpg); }
}
```

Each of these three chapters ends with the credit line from `CONTENT.md` ("Painting: Yudianto Prabowo"): a `<p class="credit">` that is a **direct child of the section, after `.inner`** (never inside it), `position: absolute; left: 0; right: 0; bottom: 18px; z-index: 1; text-align: center; font-size: 13px; letter-spacing: .04em;` in Linen (chapters 4 and 7) or Sea Cow (chapter 5). It is not part of the reveal motion.

**Chapters 2 and 3 — TEMPORARY abstract colour fields.** Two other paintings (the *Key of David* and *Feast of Harvest, Psalm 81*) are waiting for the artist's written permission. Until then these chapters use the paintings' colours only, as soft fields — **no image file, no painting, no credit line**. Use this CSS exactly:

```css
.ch-question, .ch-calling { position: relative; overflow: hidden; }
.ch-question { background: #101B23; }
.ch-calling  { background: #4B2540; }
.ch-question::before, .ch-calling::before { content: ""; position: absolute; inset: -80px; z-index: 0; filter: blur(24px); }
.ch-question::before { background:
  radial-gradient(62% 58% at 32% 30%, #6A93AC 0%, rgba(106,147,172,0) 72%),
  radial-gradient(70% 65% at 72% 62%, #24485E 0%, rgba(36,72,94,0) 72%),
  radial-gradient(55% 60% at 18% 78%, #19384A 0%, rgba(25,56,74,0) 70%),
  radial-gradient(80% 70% at 85% 15%, #0D2331 0%, rgba(13,35,49,0) 75%); }
.ch-calling::before { background:
  radial-gradient(55% 50% at 28% 32%, #A596CF 0%, rgba(165,150,207,0) 70%),
  radial-gradient(60% 55% at 74% 40%, #EBDBC9 0%, rgba(235,219,201,0) 68%),
  radial-gradient(65% 60% at 58% 82%, #8777C0 0%, rgba(135,119,192,0) 72%),
  radial-gradient(50% 55% at 12% 85%, #C4A9BC 0%, rgba(196,169,188,0) 70%),
  radial-gradient(45% 40% at 90% 10%, #DCC7C1 0%, rgba(220,199,193,0) 70%); }
.ch-question::after, .ch-calling::after { content: ""; position: absolute; inset: 0; z-index: 0; }
.ch-question::after { background: linear-gradient(180deg, rgba(16,27,35,.55), rgba(16,27,35,.8)); }
.ch-calling::after  { background: rgba(75,37,64,.72); }
```

Nothing in the backgrounds moves. Measured against the lightest 1 % of each image (these exact files): Linen ≥ 5.0:1 on all three; on chapter 5 Pure Gold 5.4:1 and Sea Cow 4.7:1; on chapter 7 gold only as the large bold ladder numbers. Over the chapter 2 field gold measures 4.9:1; over the chapter 3 field only Linen passes, hence Linen kicker and attribution there.

## Motion — lines rise in

Each text block marked `r` in the block table gets `class="r"`, plus a stagger class `s1`…`s5` in reading order within its chapter (the first block none; after `s5` the next block starts again with none). The H1 is `class="d1 r"` and rises in on load.

```css
.js .r { opacity: 0; transform: translateY(28px); transition: opacity .9s cubic-bezier(.2,.6,.2,1), transform .9s cubic-bezier(.2,.6,.2,1); }
.js .r.on { opacity: 1; transform: none; }
.js .s1{transition-delay:.15s}.js .s2{transition-delay:.3s}.js .s3{transition-delay:.45s}.js .s4{transition-delay:.6s}.js .s5{transition-delay:.75s}
@media (prefers-reduced-motion: reduce) { .js .r { opacity: 1; transform: none; transition: none; } }
```

In the home page's `<head>`, right after the stylesheet link, this one line (so nothing flashes before it hides): `<script>document.documentElement.classList.add('js')</script>`. Then, inline at the end of `<body>` on the home page only:

```html
<script>
(function(){var els=document.querySelectorAll('.r');
if(!('IntersectionObserver' in window)){els.forEach(function(e){e.classList.add('on')});return}
var io=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){x.target.classList.add('on');io.unobserve(x.target)}})},{rootMargin:'0px 0px -12% 0px',threshold:.1});
els.forEach(function(e){io.observe(e)});
var h=document.querySelector('h1.r');if(h)requestAnimationFrame(function(){h.classList.add('on')});})();
</script>
```

Only `opacity` and `transform` animate. Nothing else moves except the glint. Under reduced motion nothing moves at all.

## Design principles

1. **One idea per screen.** Each chapter fills the screen and says one thing; the biggest, boldest line in it is the point.
2. **The button is the loudest thing in its chapter** — solid Pure Gold on Navy, never outline-only. It is the only button on the site.
3. **Contrast for every reader** — every text pair in the Colours table is ≥ 4.5:1.
4. **Colour carries the chapters; gold is the accent** — the tagline, the arc, the question, kickers, rules, ladder numbers, the button, the closing line. Gold never fills a large area except the one button.
5. **Calm motion** — lines rise once as they arrive; the glint is the only continuous motion; no carousels, pop-ups, parallax or stock imagery.
6. **Clarity, then motivation, then one next step** — who this is, why it matters, then one ask: join the waitlist.

## Check before finishing

- Open the home page at 360×640, 390×844 and 1280×800: nothing overlaps, clips or scrolls sideways. Chapters may be taller than the screen (chapter 4 on phones will be) — that is correct, as long as nothing is cut off. The arc shows on chapter 1 (on phones it is nearly flat; that is expected).
- With JavaScript disabled, the whole page is visible.
- Every font file and image loads (no 404s); no request leaves the domain.
- No text in `#9A734D`; every text colour matches the Colours table.
- Search the built HTML: "Consulting", "lorem", "NOTE", "KICKER", "{LOGO}" — none present. No "&" is followed by a plain space (each is `&amp;&nbsp;`).
- The button's `href` is exactly `https://forms.cloud.microsoft/r/uGidT0636d`.
- The footer reads exactly: `Prothesis LLC – Greater Chicago area, Illinois – contact@prothesis.net – © 2026 Prothesis LLC – Privacy`.
- No image beyond the logo, the mark, the icons, the OG image and the six `bg-*.jpg` backgrounds. Chapters 2 and 3 load no image at all.
- The tagline under the logo (home, privacy and 404 pages) has **no** closing period; chapter 4's headline "Translation ignites purpose." **keeps** its period. Search the HTML for "ignites purpose." — exactly one match, in chapter 4.
- Each of chapters 4, 5 and 7 shows "Painting: Yudianto Prabowo"; chapters 2 and 3 do not.

Commit straight to `main`. If you can't, open a pull request and say so.
