Drop real images/video here — filenames the About page expects, per category:

## DJing (`.about-category[data-category="djing"]`)
- dj-mixer.jpg — banner background

No other images — the vinyl graphic was removed; the section is just the bio copy, the audio-reactive border, and the mix gallery below.

## Cinematography (`.about-category[data-category="cinematography"]`)
- comiccamera.jpg — banner background
- cameraroll.jpg — the big film-strip photo next to the bio text (fills half the section)

## Travel (`.about-category[data-category="travel"]`)
- travel-placeholder.jpg — banner background
- Each `.about-travel-card`'s `.about-travel-cover` is waiting on its own photo — add an `<img>` inside it and I'll write the description in `.about-travel-detail` from the photo.

## Future (`.about-category[data-category="future"]`)
- future-placeholder.jpg — banner background

Until these exist, the page degrades gracefully (CSS `background-image` just shows the fallback dark background, no broken-image icons for the banners; `<img onerror>` hides the element entirely for the cameraroll photo).

## Gallery cards (`.about-mix-grid` — reused across categories)
Each category has 6 placeholder cards waiting on real content — for each one you want to fill in:
- A cover photo/image (add as `<img>` inside that card's `.about-mix-cover`)
- The actual audio/video file (drop in this folder, e.g. `mix-01.mp3` or `reel-01.mp4`)
- Real title + tag in `.about-mix-title` / `.about-mix-meta`
- Enable the play button (currently `disabled` with reduced opacity) once there's real media to point it at

Note: DJing's gallery is the user's own mixes, separate from the site's background-music tracks in `assets/audio/` (used by the pre-screen gate) — don't reuse those here.
