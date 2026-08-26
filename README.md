# Portfolio

Static site, no build step or framework — plain HTML/CSS/JS.

## Structure
- `index.html` — all four pages live in one file as `.page` divs, toggled by `showPage()` in `js/script.js`. Not real routing (no separate URLs per page yet). A `#music-gate` overlay, `<audio>` element, `#mini-player`, and `#lightbox` all sit outside the `.page` divs so they persist across page switches.
- `css/style.css` — all styles. Color/font values are set as CSS variables at the top of the file (`:root`).
- `js/script.js` — page switching (cross-fade via keyframes), scroll-reveal (`IntersectionObserver`) for the timeline, the music-gate logic (About-triggered gate, mini player, melt transition), and the project gallery's hover-video + lightbox behavior.

## Home hero
- Poster-style layout (`.poster-hero`/`.poster-*` in `css/style.css`): beige background, `(2026) ▼` marker rotated top-left, a bordered vertical-letter emblem (`.poster-emblem`) top-right spelling out "MOKSH" top-to-bottom, an oversized bold name overlapping the left edge of the photo, a `|engineer|` tag, an italic one-line description, an `est. 2026` caption bottom-left, and a small italic quote bottom-center.
- The header (`<header>`) is now beige (`var(--sage-bg)`) with dark text site-wide, instead of the old dark bar — so it blends seamlessly into the hero rather than reading as a separate band. A thin `.palette-strip` (a row of the site's core colors) runs across the very top of the page, above the header.
- No canvas/JS involved — it's pure HTML/CSS, absolutely positioned within `.poster-wrap`. `assets/hero/mountain-blueprint.jpg` is sized larger than before and shifted left so the name text overlaps its edge (z-index puts the text on top). Stacks vertically on narrow screens (`max-width:720px`).
- `assets/hero/_style-reference-not-used.jpg` is a saved design reference (not linked from any page) — safe to delete once you don't need it for comparison anymore.

## Music gate
- Shows the first time About is opened in a session (not on initial site load) — see `maybeShowMusicGate()` in `js/script.js`. Once a track is chosen or skipped, `sessionStorage['gate-decided']` is set and the gate won't reappear for the rest of the session, even if you navigate away from About and back.
- Choosing a track "melts" the gate away (blur + scale + fade), and a glassmorphic mini player appears bottom-right and stays visible across all pages while music plays.
- Track `src` values are dummy placeholders (`/audio/track-1.mp3`, etc.) — drop real files at those paths, no JS changes needed.

## About page
- `#page-about` is currently an empty `.page` div — everything that used to live there (3D discipline scenes, process steps, example galleries) was intentionally deleted to rebuild from scratch. The music gate above it is untouched and still triggers normally when About is opened.

## Known placeholders to fill in
- Timeline `.tl-age` / `.tl-body` — four empty entries in the home page timeline panel, waiting on real ages + milestones.
- Contact page — email, X/Twitter, GitHub are placeholder values.
- Music gate tracks — real audio files, see `js/script.js` for the `data-src` paths to replace.
- Projects gallery images/video — placeholders in `assets/projects/`, see `assets/projects/README.md` for exact filenames to drop in.

## Running locally
No build tools needed — open `index.html` directly in a browser, or serve the folder with any static server (e.g. `python3 -m http.server`) if you want `fetch`/relative paths to behave like production.

## Deploying
Push to GitHub, then import the repo in Vercel as a static site — no framework preset needed.
