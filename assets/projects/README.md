Drop real files in here to replace gallery placeholders — filenames already match what index.html expects:

- objectify-hero.png — done. The Objectify piece's thumbnail/hero image.
- test_sphere_cleaned.ply / final_sphere.ply — done. The two real point-cloud/mesh scans shown in Objectify's interactive viewer (early test, cleaned-up final). Binary PLY with faces; final_sphere.ply also carries per-vertex color.
- codecoach-cover.png / codecoach-demo.mp4 — done. Cover art + demo clip for the CodeCoach piece, using the reusable cover-→-demo-video viewer (see the main README's "Project gallery" section) — any future project with a cover + demo clip can reuse this same pattern by adding `data-video-piece data-demo-src="assets/projects/your-clip.mp4"` to its `<figure class="piece">`, no JS changes needed.
- target-speaker-placeholder.mp4 / target-speaker-poster.jpg — still a placeholder
- sf-atlas.jpg — still a placeholder

No HTML changes needed for any of the above once dropped in with these exact names, with two exceptions:
- A **new project with a cover + demo video** (like CodeCoach) needs a new `<figure>` in the gallery in `index.html`, marked `data-video-piece data-demo-src="..."` — the shared `#piece-viewer` overlay and its JS handle the rest automatically.
- **More interactive scans on Objectify** needs a small index.html change: add another `.objectify-sphere-card` (copy the pattern of the existing two) and call `createPlyViewer(container, 'assets/projects/your-file.ply', { color: 0xRRGGBB })` for it in `openObjectifyViewer()` in js/script.js.
