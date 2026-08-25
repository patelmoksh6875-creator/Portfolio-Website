# Portfolio

Static site, no build step or framework — plain HTML/CSS/JS.

## Structure
- `index.html` — all four pages live in one file as `.page` divs, toggled by `showPage()` in `js/script.js`. Not real routing (no separate URLs per page yet). A `#music-gate` overlay, `<audio>` element, `#mini-player`, and `#lightbox` all sit outside the `.page` divs so they persist across page switches.
- `css/style.css` — all styles. Color/font values are set as CSS variables at the top of the file (`:root`). `#page-about` redefines `--bg`/`--text`/`--accent`/etc. locally, so its whole bright color palette cascades to everything inside it without touching the rest of the site.
- `js/script.js` — page switching (cross-fade via keyframes), scroll-reveal (`IntersectionObserver`) for the timeline/about/gallery sections, the music-gate logic (About-triggered gate, mini player, melt transition), and the project gallery's hover-video + lightbox behavior.
- `js/ascii-scene.js` — ES module (loaded via `<script type="module">` + import map, no bundler) that renders small Three.js scenes through `AsciiEffect`: three on the About page (djing / design / cinematography, each with its own bright accent color).
- `js/dither-scene.js` — ES module rendering a colorful low-poly mountain/sun scene through a custom ordered (Bayer 4x4) dithering `ShaderPass`, used on both the home hero (earth-tone palette) and the About page's intro panel (vivid palette, `data-palette="vivid"`).

## Music gate
- Shows the first time About is opened in a session (not on initial site load) — see `maybeShowMusicGate()` in `js/script.js`. Once a track is chosen or skipped, `sessionStorage['gate-decided']` is set and the gate won't reappear for the rest of the session, even if you navigate away from About and back.
- Choosing a track "melts" the gate away (blur + scale + fade) into the About page's scroll-to-explore intro, and a glassmorphic mini player appears bottom-right and stays visible across all pages while music plays.
- Track `src` values are dummy placeholders (`/audio/track-1.mp3`, etc.) — drop real files at those paths, no JS changes needed.

## About page scroll-to-explore
- Only About uses scroll-snap sectioning (`html.about-page-active`, toggled in `showPage()`) — each full-height section (intro + the three interests) snaps into place as you scroll, so moving through the page feels like moving through discrete "moments." No JS scroll-hijacking involved, just CSS `scroll-snap-type`.

## Known placeholders to fill in
- Timeline `.tl-age` / `.tl-body` — four empty entries in the home page timeline panel, waiting on real ages + milestones.
- Contact page — email, X/Twitter, GitHub are placeholder values.
- Music gate tracks — real audio files, see `js/script.js` for the `data-src` paths to replace.
- About page videos — placeholders in `assets/video/`, see `assets/video/README.md` for exact filenames to drop in.
- Projects gallery images/video — placeholders in `assets/projects/`, see `assets/projects/README.md` for exact filenames to drop in.

## Running locally
No build tools needed — open `index.html` directly in a browser, or serve the folder with any static server (e.g. `python3 -m http.server`) if you want `fetch`/relative paths to behave like production.

## Deploying
Push to GitHub, then import the repo in Vercel as a static site — no framework preset needed.
