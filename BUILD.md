# How to build prothesis.net

The site is one static page for Prothesis LLC, published with GitHub Pages from this repository's `main` branch. The text is in `CONTENT.md` and is final. This file says how to build it.

## Files to produce

| File | What |
|---|---|
| `index.html` | The page. All CSS inline in a `<style>` block or in `style.css`. |
| `style.css` | Optional, if you keep CSS out of the HTML. |
| `404.html` | Same header, logo and footer; one line: "This page doesn't exist." with a link home. |
| `CNAME` | One line, exactly: `prothesis.net` |
| `robots.txt` | `User-agent: *` / `Allow: /` |
| `favicon.png` | From `assets/img/icon.png`, sized to 64×64 and 180×180 (`apple-touch-icon.png`). |

Leave `CONTENT.md`, `BUILD.md`, `README.md` and `assets/` in place.

## Hard rules

- **Plain HTML and CSS.** No JavaScript, no frameworks, no build step, no package files.
- **Nothing external.** No Google Fonts, no CDNs, no analytics, no cookies, no trackers, no embeds, no forms. Every file the page loads comes from this repository.
- **Text exactly as in `CONTENT.md`.** Keep the curly quotes and dashes as written there.
- **Works at phone width** (from 360 px) with no sideways scrolling, and reads well on a desktop (text column max ~680 px, centred).
- Valid `<title>`, `<meta name="description">`, `<meta name="viewport">`, `lang="en"`, Open Graph tags (`og:title` "Prothesis LLC", `og:description` = the meta description, `og:image` = the logo at its full URL `https://prothesis.net/assets/img/logo-primary.png`, `og:url` `https://prothesis.net/`).
- Logo `<img>` has `alt="Prothesis"` and explicit width/height.

## Look

Refined, minimal, mature. Lots of space. One accent colour at a time. No illustration, no gradients, no drop shadows, no stock photos.

**Colours**

| Name | Hex | Use |
|---|---|---|
| Linen | `#F3F3ED` | Page background |
| Navy | `#101B23` | All headings and body text |
| Goat's Hair | `#9A734D` | The tagline; thin divider rules between sections |
| Slate Blue | `#526C7C` | Attribution lines under quotes; footer text |
| Royal Purple | `#4B2540` | Scripture quotations only |

**Font: Poppins** (in `assets/fonts/`, self-hosted with `@font-face`, `font-display: block`). Poppins is licensed under the SIL Open Font License 1.1; the licence is `assets/fonts/OFL.txt` and must stay in the repository.

| Font file | Family name | Use |
|---|---|---|
| `poppins-regular.woff2` | Poppins, 400 | Body text |
| `poppins-italic.woff2` | Poppins, 400 italic | Emphasis; the tagline; the Guinness quote, the founder's quote and the two Scripture phrases in "The name" |
| `poppins-bold.woff2` | Poppins, 700 | Headings, the opening line, the mission sentence |

Poppins is the only face on the page, with one exception.

**The one exception — the Greek word πρόθεσις.** Poppins has no Greek letters. Wrap the Greek word in `<span lang="grc" class="greek">` and give `.greek` the stack `"Times New Roman", Georgia, serif` so it renders in a plain serif. This is the only text on the page not set in Poppins.

**Sizes** (desktop / phone): H1 opening line 40/30 px bold · section headings 22/20 px bold · body 18/17 px, line-height 1.6 · tagline 20/18 px italic in Goat's Hair, smaller than the logo · quote blocks 20/18 px · attributions 15 px Slate Blue.

**Layout, top to bottom:** logo (about 260 px wide on desktop, 200 px on phone) and tagline, centred → opening → Calling → Meaning comes from His Word → The name → Mission → From the founder → Close → Contact → footer. Each section separated by generous space and an optional thin Goat's Hair rule. Quotes as indented blocks with the attribution on its own line. The last line of Close ("Christ magnified, in the ordinary places where people work.") stands alone, slightly larger, centred.

## Check before finishing

- Open the page at 360 px and 1280 px wide; nothing overlaps or scrolls sideways.
- Every font file loads (no 404s), and no request leaves the domain.
- Search the built files for the words "Consulting", "coming soon" and "lorem": none present.
- The footer reads exactly: `Prothesis LLC – Greater Chicago area, Illinois – contact@prothesis.net – © 2026 Prothesis LLC`.

Commit straight to `main`.
