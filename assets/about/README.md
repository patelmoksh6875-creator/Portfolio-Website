Drop real images/video here — filenames the About page expects, per category:

## DJing (`.about-category[data-category="djing"]`)
- dj-mixer.jpg — banner background
- vinyl-record.jpg — the spinning CD/vinyl graphic
- soundwave.jpg — white waveform on black, floating side divider

## Cinematography (`.about-category[data-category="cinematography"]`)
- comiccamera.jpg — banner background
- cameralens.jpg — the spinning lens graphic
- cameraroll.jpg — spiraling film strip, floating side divider

Until these exist, the page degrades gracefully (CSS `background-image` just shows the fallback dark background, no broken-image icons for the banners; `<img onerror>` hides the element entirely for the spin/float graphics).

## Gallery cards (`.about-mix-grid` — reused across categories)
Each category has 6 placeholder cards waiting on real content — for each one you want to fill in:
- A cover photo/image (add as `<img>` inside that card's `.about-mix-cover`)
- The actual audio/video file (drop in this folder, e.g. `mix-01.mp3` or `reel-01.mp4`)
- Real title + tag in `.about-mix-title` / `.about-mix-meta`
- Enable the play button (currently `disabled` with reduced opacity) once there's real media to point it at

Note: DJing's gallery is the user's own mixes, separate from the site's background-music tracks in `assets/audio/` (used by the pre-screen gate) — don't reuse those here.
