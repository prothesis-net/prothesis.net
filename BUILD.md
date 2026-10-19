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

**Layout, top to bottom:** a full-width **Navy opening band** holding the light logo (`assets/img/logo-primary-light.png`, about 260 px wide on desktop, 200 px on phone) and the tagline in Pure Gold, centred, with generous space above and below (about 72 px desktop, 48 px phone) → on Linen: opening → Calling → Meaning comes from His Word → Our first app → The name → Mission → From the founder → Close → Contact → footer. Each section separated by generous space and a thin Goat's Hair rule. Quotes as indented blocks with the attribution on its own line. The last line of Close ("Christ magnified, in the ordinary places where people work.") stands alone, slightly larger, centred. **Our first app:** "Coming soon." as a small all-caps label in Goat's Hair; the button a solid Navy rectangle with Linen text (no rounded pill, no shadow), small print beneath in Slate Blue.

## Check before finishing

- Open the page at 360 px and 1280 px wide; nothing overlaps or scrolls sideways.
- Every font file loads (no 404s), and no request leaves the domain.
- Search the built files for "Consulting" and "lorem": none present. "Coming soon" appears exactly once, in the Our first app section.
- No product or app name appears anywhere; the app is called only "our first app" / "this app".
- `WAITLIST_FORM_URL` must have been replaced by the real form link; if it is still a placeholder, stop and say so.
- The footer reads exactly: `Prothesis LLC – Greater Chicago area, Illinois – contact@prothesis.net – © 2026 Prothesis LLC`.

Commit straight to `main`.
