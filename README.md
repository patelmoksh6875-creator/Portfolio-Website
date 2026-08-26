# Portfolio

Static site, no build step or framework — plain HTML/CSS/JS.

## Structure
- `index.html` — all four pages live in one file as `.page` divs, toggled by `showPage()` in `js/script.js`. Not real routing (no separate URLs per page yet). A `#music-gate` overlay, `<audio>` element, `#mini-player`, and `#lightbox` all sit outside the `.page` divs so they persist across page switches.
- `css/style.css` — all styles. Color/font values are set as CSS variables at the top of the file (`:root`).
- `js/script.js` — page switching (cross-fade via keyframes), scroll-reveal (`IntersectionObserver`) for the timeline, the music-gate logic (About-triggered gate, mini player, melt transition), and the project gallery's hover-video + lightbox behavior.

## Home hero
- Poster-style layout (`.poster-hero`/`.poster-*` in `css/style.css`): beige background, small rotated `(2026) ▼` marker top-left, `001 ▼` marker top-right, an oversized bold name with a hanging comma, a `|engineer|` tag, and an italic one-line description — with `assets/hero/mountain-blueprint.jpg` offset to the right, overlapping the name block, the way a poster's photo sits beside its headline.
- No canvas/JS involved — it's pure HTML/CSS, absolutely positioned within `.poster-wrap`. Stacks vertically on narrow screens (`max-width:720px`) with the image moving into normal document flow below the text.
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
