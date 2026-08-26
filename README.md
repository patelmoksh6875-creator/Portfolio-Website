# Portfolio

Static site, no build step or framework — plain HTML/CSS/JS.

## Structure
- `index.html` — all four pages live in one file as `.page` divs, toggled by `showPage()` in `js/script.js`. Not real routing (no separate URLs per page yet). A `#music-gate` overlay, `<audio>` element, `#mini-player`, and `#lightbox` all sit outside the `.page` divs so they persist across page switches.
- `css/style.css` — all styles. Color/font values are set as CSS variables at the top of the file (`:root`).
- `js/script.js` — page switching (cross-fade via keyframes), scroll-reveal (`IntersectionObserver`) for the timeline, the music-gate logic (About-triggered gate, mini player, melt transition), and the project gallery's hover-video + lightbox behavior.

## Home hero
- Poster-style layout (`.poster-hero`/`.poster-*` in `css/style.css`): beige background, a bordered vertical-letter emblem (`.poster-emblem`) top-left spelling out "MOKSH" top-to-bottom, a `(2026) ▼` marker rotated below it, and `.hero-palette` positioned in the far top-right corner of the full hero panel (a direct child of `.hero-panel`, not nested in `.poster-wrap`, so it sits at the true page edge independent of the centered content column).
- The name, `|engineer|` tag, description, `est. 2026` caption, and quote are all center-aligned within the hero's left column (`.poster-main`/`.poster-est`/`.poster-quote` share the same 64%-wide box and `text-align:center`) and shifted up (`padding-top:24%` on `.poster-main`, plus larger `bottom` offsets on the est/quote pair) compared to earlier passes.
- `.hero-palette` swatches use `style="background:var(--...)"` pointing directly at the site's `:root` custom properties — so it always reflects the live palette with zero maintenance. If you change a color in `:root`, this updates automatically; no hardcoded hex to keep in sync.
- The header (`<header>`) is beige (`var(--sage-bg)`) with dark text site-wide, so it blends seamlessly into the hero instead of reading as a separate bar — `.hero-panel{margin-top:-1px}` closes off any rendering seam at that boundary. The name has a soft multi-layer `text-shadow` in the hero's beige tone acting as a halo, so it stays fully legible wherever it crosses over the photo.
- No canvas/JS involved — it's pure HTML/CSS, absolutely positioned within `.poster-wrap` (except `.hero-palette`, positioned within `.hero-panel`). Stacks vertically on narrow screens (`max-width:720px`).
- `assets/hero/_style-reference-not-used.jpg` is a saved design reference (not linked from any page) — safe to delete once you don't need it for comparison anymore.

## Home page, below the hero
- `.timeline-panel` is flat `var(--bg)` (no gradient) and opens with a `.home-bio` paragraph ("about me") above the timeline, which sits further down with extra top margin (`.timeline-title{margin-top:96px}`) so the two sections read as distinct, not bunched together.
- The timeline no longer has its vertical connector line (`.timeline::before` was removed). The empty `.tl-age`/`.tl-body` divs now show a dashed underline placeholder via the `:empty` CSS pseudo-class — it's purely visual and disappears automatically the moment you type real content into them, so there's nothing to manually remove later.

## Music gate
- Shows the first time About is opened in a session (not on initial site load) — see `maybeShowMusicGate()` in `js/script.js`. Once a track is chosen or skipped, `sessionStorage['gate-decided']` is set and the gate won't reappear for the rest of the session, even if you navigate away from About and back.
- Choosing a track "melts" the gate away (blur + scale + fade), and a glassmorphic mini player appears bottom-right and stays visible across all pages while music plays.
- Track `src` values are dummy placeholders (`/audio/track-1.mp3`, etc.) — drop real files at those paths, no JS changes needed.

## Blog page
- Each post row is now a `.blog-item` wrapping a `<button class="blog-row">` (the clickable title row) and a `.blog-drop` panel that expands/collapses via a `max-height` transition when clicked (see the "blog accordion" block in `js/script.js`). Only one post stays open at a time — opening one closes any other.
- `.blog-drop-placeholder` inside each is dashed-bordered placeholder text ("add your article here...") — replace that `<p>` with the real post content (plain HTML is fine) when you're ready to write.

## About page
- `#page-about` is currently an empty `.page` div — everything that used to live there (3D discipline scenes, process steps, example galleries) was intentionally deleted to rebuild from scratch. The music gate above it is untouched and still triggers normally when About is opened.

## Known placeholders to fill in
- `.home-bio` — the "about me" paragraph on the home page has `[age]` and `[location]` placeholder text to replace with real details.
- Timeline `.tl-age` / `.tl-body` — four empty entries in the home page timeline panel, waiting on real ages + milestones.
- Contact page — email, X/Twitter, GitHub are placeholder values.
- Music gate tracks — real audio files, see `js/script.js` for the `data-src` paths to replace.
- Projects gallery images/video — placeholders in `assets/projects/`, see `assets/projects/README.md` for exact filenames to drop in.

## Running locally
No build tools needed — open `index.html` directly in a browser, or serve the folder with any static server (e.g. `python3 -m http.server`) if you want `fetch`/relative paths to behave like production.

## Deploying
Push to GitHub, then import the repo in Vercel as a static site — no framework preset needed.
