# Portfolio

Static site, no build step or framework — plain HTML/CSS/JS.

## Structure
- `index.html` — all four pages live in one file as `.page` divs, toggled by `showPage()` in `js/script.js`. Not real routing (no separate URLs per page yet).
- `css/style.css` — all styles. Color/font values are set as CSS variables at the top of the file (`:root`).
- `js/script.js` — page switching + scroll-reveal for the timeline (`IntersectionObserver`).

## Known placeholders to fill in
- `MOKSH [LAST NAME]` — appears in the nav logo and the home hero, search/replace both.
- Timeline `.tl-age` / `.tl-body` — four empty entries in the home page timeline panel, waiting on real ages + milestones.
- Contact page — email, X/Twitter, GitHub are placeholder values.
- About page — intentionally left blank for a future redesign pass.

## Running locally
No build tools needed — open `index.html` directly in a browser, or serve the folder with any static server (e.g. `python3 -m http.server`) if you want `fetch`/relative paths to behave like production.

## Deploying
Push to GitHub, then import the repo in Vercel as a static site — no framework preset needed.
