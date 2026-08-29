Drop real files in here to replace gallery placeholders — filenames already match what index.html expects:

- objectify-hero.png — done. The Objectify piece's thumbnail/hero image.
- test_sphere_cleaned.ply / final_sphere.ply — done. The two real point-cloud/mesh scans shown in Objectify's interactive viewer (early test, cleaned-up final). Binary PLY with faces; final_sphere.ply also carries per-vertex color.
- target-speaker-placeholder.mp4 / target-speaker-poster.jpg
- sf-atlas.jpg
- codecoach.jpg

No HTML changes needed for any of these, just add the files with these exact names — except adding *more* interactive scans to Objectify later, which needs a small index.html change: add another `.objectify-sphere-card` (copy the pattern of the existing two) and call `createPlyViewer(container, 'assets/projects/your-file.ply', { color: 0xRRGGBB })` for it in `openObjectifyViewer()` in js/script.js.
