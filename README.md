# Portfolio

Static site, no build step or framework — plain HTML/CSS/JS.

## Structure
- `index.html` — all four pages live in one file as `.page` divs, toggled by `showPage()` in `js/script.js`. Not real routing (no separate URLs per page yet). A `#music-gate` overlay, `<audio>` element, `#mini-player`, and `#lightbox` all sit outside the `.page` divs so they persist across page switches.
- `css/style.css` — all styles. Color/font values are set as CSS variables at the top of the file (`:root`).
- `js/script.js` — page switching (cross-fade via keyframes), scroll-reveal (`IntersectionObserver`) for the timeline, the music-gate carousel (preview/select/enter, mini player, melt transition), the blog accordion, and the project gallery's hover-video + lightbox behavior.

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
- A full pre-page shown before the site itself, on first visit each session (not tied to any specific page) — see `showMusicGate()` in `js/script.js`, called once at script load. Once a track is chosen or skipped, `sessionStorage['gate-decided']` is set and the gate won't reappear for the rest of the session.
- Base background is white/frosty (`.gate-bg-layer{background:linear-gradient(160deg,#fff,#eceae4)}`, blurred). Two stacked layers (`.gate-bg-layer-a`/`-b`) crossfade via opacity whenever the focused card changes, each set to that card's own `.gate-art` background — so the whole backdrop becomes a big blurred wash of the current track's artwork color, not a crisp copy of it (`updateGateBackground()` in `js/script.js`). A `.gate-bg-scrim` gradient (light at top, dark by the bottom ~35%) sits above both layers so text stays legible regardless of which color is currently showing.
- The carousel is a real carousel, not a coverflow row: cards get pulled horizontally back toward the center X position as they lose focus (`pulledX` in `updateCarouselTransforms()`, `js/script.js`) — so a card visibly slides behind the front one and gets mostly hidden there. The pull is eased (`Math.pow(pullT, 1.8)`) so the first card out still arcs outward and stays visible, then ramps up fast and is mostly tucked behind by ~2.5 cards away. Combined with `rotateY`, `translateZ`, shrinking `scale`, and fading `opacity`, recalculated every scroll frame.
- **Important structural detail**: none of that transform ever lands on `.gate-card` itself (the element with `scroll-snap-align:center`) — it all goes on an inner `.gate-card-visual` wrapper instead. Mutating `transform` on a snap-aligned element causes erratic, self-triggered re-snapping in some browsers (this was the cause of the "carousel scrolls by itself" bug) — keeping the snap target's geometry completely untouched by JS fixed it.
- Prev/next (buttons, and left/right arrow keys — `keydown` listener with `preventDefault` so the browser's native small-step arrow-key scroll can't fight the carousel) jump `scrollLeft` directly with `scroll-snap-type` temporarily disabled, then let a CSS transition on `.gate-card-visual` animate the visual result. This was the only approach that worked reliably — both a manual `requestAnimationFrame` tween and the browser's native `scrollTo({behavior:'smooth'})` got stuck fighting `scroll-snap-type: mandatory`, which snaps back any mid-flight scroll position synchronously.
- Trackpad/touch dragging is native browser scroll-snap (unaffected by any of the above, since it never touches `.gate-card`'s geometry); button clicks and arrow keys drive the same `scrollGateTo()` path described above.
- **Preview vs. select is intentionally separate**: each card's own ▶ button (or the pill bar's play/pause) previews that track through the shared `<audio>` element without committing to anything. Clicking "enter →" commits whichever track is currently centered — if it's already previewing, playback continues seamlessly into the mini player; if not, it starts fresh. `enter without sound` (the small link at the bottom) skips music entirely.
- 8 real tracks are wired up in `assets/audio/` (`.mp3` + matching cover art, same base filename — e.g. `leather-coat.mp3` / `leather-coat.jpg`). `updateGateBackground()` reads each card's `<img>` and sets it as a blurred `background-image` on the crossfade layer. To add or swap a track: drop the two files in `assets/audio/`, then add/edit a `.gate-card` block in `index.html` with matching `data-src`/`data-title`/`data-artist` and an `<img>` pointing at the art file — both the gate card and the mini player pull from the same `gateCards` list, so nothing else needs updating.

## Mini player
- The bottom-right widget is a pill by default (`#mini-player-pill`) and expands into a 240×340 square panel (`.mini-player.expanded`) on click — full album art, title/artist, and its own prev/play/next controls (`#mini-prev`/`#mini-play`/`#mini-next` in `js/script.js`), so the track can be changed after entering the site without going back to the gate. Click the ✕ or click anywhere outside the panel to collapse it back to the pill.
- `playTrackAtIndex()` and `currentTrackIndex` are the single source of truth for "what's playing" once inside the site — both the pill and the expanded panel read from the same `gateCards` array the gate carousel uses, so artwork/title/artist never fall out of sync between the two.

## Blog page
- Each post row is now a `.blog-item` wrapping a `<button class="blog-row">` (the clickable title row) and a `.blog-drop` panel that expands/collapses via a `max-height` transition when clicked (see the "blog accordion" block in `js/script.js`). Only one post stays open at a time — opening one closes any other.
- `.blog-drop-placeholder` inside each is dashed-bordered placeholder text ("add your article here...") — replace that `<p>` with the real post content (plain HTML is fine) when you're ready to write.

## Brain dump page
- `#page-braindump` (`brain dump` in the nav, between blog and about) is a simple reverse-chronological list of `.dump-entry` blocks, each just a date label and a paragraph — meant for quick unfiltered thoughts rather than full posts.
- **Deliberately read-only and edit-only-by-hand**: there is no form, textarea, button, or any JS on this page — the only way to add or change an entry is editing `index.html` directly and pushing that change. That's intentional, not an oversight — a static site has no backend to authenticate "only me," so the actual guarantee comes from visitors never being given any input to begin with, not from a permissions check that could be bypassed. Adding a client-side "edit" UI later (even password-gated) would not really be private, since anyone can read the page's JS/localStorage in dev tools.
- To add a new thought: copy one `.dump-entry` block, put it at the top of `.dump-list` (newest first), and fill in the date + text.
## About page
- `#page-about` is currently an empty `.page` div — everything that used to live there (3D discipline scenes, process steps, example galleries) was intentionally deleted to rebuild from scratch. It's a normal page now, unrelated to the music gate (which triggers on site load, not on opening About).

## Known placeholders to fill in
- `.home-bio` — the "about me" paragraph on the home page has `[age]` and `[location]` placeholder text to replace with real details.
- Timeline `.tl-age` / `.tl-body` — four empty entries in the home page timeline panel, waiting on real ages + milestones.
- Contact page — email, X/Twitter, GitHub are placeholder values.
- Music gate tracks — real audio files + artwork, see `assets/audio/README.md` for exact filenames and what to swap in `index.html`.
- Projects gallery images/video — placeholders in `assets/projects/`, see `assets/projects/README.md` for exact filenames to drop in.

## Running locally
No build tools needed — open `index.html` directly in a browser, or serve the folder with any static server (e.g. `python3 -m http.server`) if you want `fetch`/relative paths to behave like production.

## Deploying
Live at **https://mokshpatel.vercel.app** — the Vercel project (`mokshpatel` in the `moksh-personal` team) is linked to this GitHub repo, so every push to `main` auto-deploys. Deployment protection (SSO gate) is disabled so the site is publicly viewable.

`mokshpatel.xyz` is not connected — that needs an actual domain purchase through a registrar (not something done from here) and, once owned, adding it under the Vercel project's Settings → Domains and pointing its DNS at Vercel. `mokshpatel.vercel.app` was used as the fallback per your instructions.
