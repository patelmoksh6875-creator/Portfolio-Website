# Portfolio

Static site, no build step or framework — plain HTML/CSS/JS.

## Structure
- `index.html` — all four pages live in one file as `.page` divs, toggled by `showPage()` in `js/script.js`. Not real routing (no separate URLs per page yet). A `#music-gate` overlay and `<audio>` element sit outside the `.page` divs so playback survives page switches.
- `css/style.css` — all styles. Color/font values are set as CSS variables at the top of the file (`:root`).
- `js/script.js` — page switching, scroll-reveal (`IntersectionObserver`) for the timeline and about sections, and the music-gate logic (track selection, session persistence, mute toggle).
- `js/ascii-scene.js` — ES module (loaded via `<script type="module">` + import map, no bundler) that renders three small Three.js scenes through `AsciiEffect`, one per About-page interest (djing / design / cinematography). Each scene lazily starts/stops animating based on scroll visibility.

## Music gate
- First visit shows a full-screen track picker before any content; choosing a track or clicking "enter silently" dismisses it and sets `sessionStorage['gate-passed']`, so a refresh mid-session skips the gate but a new session shows it again.
- Track `src` values are dummy placeholders (`/audio/track-1.mp3`, etc.) — drop real files at those paths, no JS changes needed.
- A mute/pause toggle (♪) appears in the header nav once a track is chosen.

## Known placeholders to fill in
- `MOKSH [LAST NAME]` — appears in the nav logo and the home hero, search/replace both.
- Timeline `.tl-age` / `.tl-body` — four empty entries in the home page timeline panel, waiting on real ages + milestones.
- Contact page — email, X/Twitter, GitHub are placeholder values.
- Music gate tracks — real audio files, see `js/script.js` for the `data-src` paths to replace.
- About page videos — placeholders in `assets/video/`, see `assets/video/README.md` for exact filenames to drop in.

## Running locally
No build tools needed — open `index.html` directly in a browser, or serve the folder with any static server (e.g. `python3 -m http.server`) if you want `fetch`/relative paths to behave like production.

## Deploying
Push to GitHub, then import the repo in Vercel as a static site — no framework preset needed.
