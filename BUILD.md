# How to build prothesis.net

The site is one static page for Prothesis LLC, published with GitHub Pages from this repository's `main` branch. The text is in `CONTENT.md` and is final. This file says how to build it.

## Files to produce

| File | What |
|---|---|
| `index.html` | The page. All CSS inline in a `<style>` block or in `style.css`. |
| `style.css` | Optional, if you keep CSS out of the HTML. |
| `privacy.html` | The privacy page, text in CONTENT.md. Same header band and footer. Link it as `/privacy` (GitHub Pages serves `privacy.html` at that address). |
| `404.html` | Same header, logo and footer; one line: "This page doesn't exist." with a link home. |
| `CNAME` | One line, exactly: `prothesis.net` |
| `robots.txt` | `User-agent: *` / `Allow: /` |
| `favicon.png` | From `assets/img/icon.png`, sized to 64×64 and 180×180 (`apple-touch-icon.png`). |

Leave `CONTENT.md`, `BUILD.md`, `README.md` and `assets/` in place.

## Hard rules

- **Plain HTML and CSS.** No JavaScript, no frameworks, no build step, no package files.
- **Nothing external.** No Google Fonts, no CDNs, no analytics, no cookies, no trackers, no embeds, no forms on the page. Every file the page loads comes from this repository. **One allowed exception:** the "Join the waitlist" button is an ordinary link (`<a href>`, `target="_blank" rel="noopener"`) to the Microsoft Form; nothing from Microsoft is loaded into the page.
- **Text exactly as in `CONTENT.md`.** Keep the curly quotes and dashes as written there.
- **Works at phone width** (from 360 px) with no sideways scrolling, and reads well on a desktop (text column max ~680 px, centred).
- Valid `<title>`, `<meta name="description">`, `<meta name="viewport">`, `lang="en"`, Open Graph tags (`og:title` "Prothesis LLC", `og:description` = the meta description, `og:image` = the logo at its full URL `https://prothesis.net/assets/img/logo-primary.png`, `og:url` `https://prothesis.net/`).
- Logo `<img>` has `alt="Prothesis"` and explicit width/height.

## Look

Refined, minimal, mature. Lots of space. One accent colour at a time. No illustration, no gradients, no drop shadows, no stock photos.

**Colours**

| Name | Hex | Use |
|---|---|---|
| Navy | `#101B23` | The opening band's background |
| Pure Gold | `#D6BA6B` | The tagline, inside the Navy band only |
| Linen | `#F3F3ED` | Page background below the band; the logo's wordmark is already Linen |
| Navy | `#101B23` | All headings and body text |
| Goat's Hair | `#9A734D` | The tagline; thin divider rules between sections |
| Slate Blue | `#526C7C` | Attribution lines under quotes; footer text |
| Royal Purple | `#4B2540` | Scripture quotations only |

**Fonts** (in `assets/fonts/`, self-hosted with `@font-face`, `font-display: block` — never `swap`):

| Font file | Family name | Use |
|---|---|---|
| `prothesis-basic-regular.woff2` | Prothesis Basic, 400 | Body text |
| `prothesis-basic-italic.woff2` | Prothesis Basic, 400 italic | Emphasis; the Guinness quote and the founder's quote |
| `prothesis-basic-bold.woff2` | Prothesis Basic, 700 | Headings, the opening line, the mission sentence |
| `prothesis-scripture-italic.woff2` | Prothesis Scripture, 400 italic | **Only** two places: the tagline, and the two Scripture phrases in "The name" (Romans 8:28, Ephesians 1:11) |

Prothesis Basic is the face for everything else. No other font appears in any `font-family` stack except the one exception below.

**The one exception — the Greek word πρόθεσις.** Neither Prothesis font contains Greek letters. Wrap the Greek word in `<span lang="grc" class="greek">` and give `.greek` the stack `"Times New Roman", Georgia, serif` so it renders in a plain serif. This is the only text on the page not set in a Prothesis font.

**Characters the fonts lack.** Neither font has a middle dot (·); the footer uses en dashes (–), as written in CONTENT.md. Prothesis Scripture has no straight quotes, apostrophes or em dashes: keep quotation marks and dashes around Scripture phrases in Prothesis Basic, and set only the words of the phrase in Prothesis Scripture.

**Sizes** (desktop / phone): H1 opening line 40/30 px bold · section headings 22/20 px bold · body 18/17 px, line-height 1.6 · tagline 20/18 px Prothesis Scripture italic in Goat's Hair, smaller than the logo · quote blocks 20/18 px · attributions 15 px Slate Blue.

**Layout, top to bottom:** a full-width **Navy opening band** holding the light logo (`assets/img/logo-primary-light.png`, about 260 px wide on desktop, 200 px on phone) and the tagline in Pure Gold, centred, with generous space above and below (about 72 px desktop, 48 px phone) → on Linen: opening → Calling → Meaning comes from His Word → Our first app → The name → Mission → From the founder → Close → Contact → footer. Each section separated by generous space and a thin Goat's Hair rule. Quotes as indented blocks with the attribution on its own line. The last line of Close ("Christ magnified, in the ordinary places where people work.") stands alone, slightly larger, centred. **Our first app:** "Coming soon." as a small all-caps label in deepened Goat's Hair `#7A5A3B`; the button a solid Navy rectangle with **Pure Gold** text (no rounded pill, no shadow), small print beneath in Slate Blue.

## Design principles

Applied from *Give Me 7 Minutes & Your Web Design Skills Will Take Off* (Self-Made Web Designer, 2025). Each line says how it applies to this page.

1. **Visual hierarchy, not a forced reading pattern.** People scan in many patterns. In every section the most important element is the biggest and boldest; everything else is turned down. Order of weight on this page: the H1 "Discover and live out your true purpose." → section headings → the mission sentence and the closing line → body text → attributions and small print.
2. **The button is the loudest thing in its section.** "Join the waitlist" is a solid, filled button (never an outline-only "ghost" button), high-contrast against the page: Navy fill, Pure Gold text. It is the only filled button on the site.
3. **Contrast for every reader.** All text meets WCAG AA: at least **4.5:1** for normal text and 3:1 for large text (24 px+, or 18.7 px+ bold). Measured pairs: Navy on Linen ≈16:1 · Slate Blue on Linen ≈5:1 · Royal Purple on Linen passes · Pure Gold on Navy ≈9:1 · deepened Goat's Hair `#7A5A3B` on Linen ≈5.6:1. **Goat's Hair `#9A734D` on Linen is only ≈3.8:1 — use it for rules and decoration, never for text smaller than 24 px.**
4. **60-30-10 colour balance.** About 60% neutral (the Linen page), 30% brand (Navy: the opening band and all text), 10% accent (Pure Gold and Goat's Hair: the tagline, the button text, the thin rules, the quote bars). The accent is never used for large areas.
5. **Three text levels, used honestly.** One H1, describing what the page is about. H2s divide the page into its sections. Paragraph text is plain Prothesis Basic — never decorative — so it stays easy to read.
6. **Built for scanning.** Headings carry the meaning on their own; paragraphs stay short; generous space between sections; text column no wider than ~680 px (about 65–75 characters a line).
7. **Clarity, then motivation, then one clear next step.** The first screen says who this is (logo, tagline) and what it is about (the H1). The page builds the reason to care (Calling, Meaning comes from His Word) before it asks for anything, and asks for one thing only: joining the waitlist.
8. **Designed for the people who will read it** — Christian professionals asking what their life and work are for — not for decoration. Calm, sober, confident: no animation, no carousels, no pop-ups, no stock imagery.

## Check before finishing

- Open the page at 360 px and 1280 px wide; nothing overlaps or scrolls sideways.
- Every text colour pair meets the contrast figures in Design principles §3; no small text in `#9A734D`.
- Every font file loads (no 404s), and no request leaves the domain.
- Search the built files for "Consulting" and "lorem": none present. "Coming soon" appears exactly once, in the Our first app section.
- No product or app name appears anywhere; the app is called only "our first app" / "this app".
- `WAITLIST_FORM_URL` must have been replaced by the real form link; if it is still a placeholder, stop and say so.
- The footer reads exactly: `Prothesis LLC – Greater Chicago area, Illinois – contact@prothesis.net – © 2026 Prothesis LLC`.

Commit straight to `main`.
