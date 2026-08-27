Drop real images here — filenames the About page (DJing section) expects:

- dj-mixer.jpg — black & white photo of DJ mixer/CDJs, used as the intro banner background
- vinyl-record.jpg — the spinning vinyl record graphic
- soundwave.jpg — white waveform on black, used as a decorative divider

Until these exist, the page degrades gracefully (CSS background-image just shows the fallback dark background, no broken-image icons).

## Mix gallery (`.about-mix-grid` in index.html)
6 placeholder mix cards are waiting on real content — for each one you want to fill in:
- A cover photo/image (add as `<img>` inside that card's `.about-mix-cover`)
- The actual mix audio file (drop in this folder, e.g. `mix-01.mp3`)
- Real title + genre/year in `.about-mix-title` / `.about-mix-meta`
- Enable the play button (currently `disabled` with reduced opacity) once there's real audio to point it at

Note: these are your own DJ mixes, separate from the site's background-music tracks in `assets/audio/` (used by the pre-screen gate) — don't reuse those here.
