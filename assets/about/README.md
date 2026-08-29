Drop real images/video here — filenames the About page expects, per category:

## DJing (`.about-category[data-category="djing"]`)
- dj-mixer.jpg — banner background

No other images — the vinyl graphic was removed; the section is just the bio copy, the audio-reactive border, and the mix gallery below.

## Cinematography (`.about-category[data-category="cinematography"]`)
- comiccamera.jpg — banner background
- cameraroll.jpg — the big film-strip photo next to the bio text (fills half the section)
- introduction.mp4, claude-cinematic.mp4 — the two real reel videos in the gallery below (see "Gallery cards")

## Travel (`.about-category[data-category="travel"]`)
- travel-placeholder.jpg — banner background
- Each `.about-travel-card`'s `.about-travel-cover` is waiting on its own photo — add an `<img>` inside it and I'll write the description in `.about-travel-detail` from the photo.

## Future (`.about-category[data-category="future"]`)
- future-placeholder.jpg — banner background

Until these exist, the page degrades gracefully (CSS `background-image` just shows the fallback dark background, no broken-image icons for the banners; `<img onerror>` hides the element entirely for the cameraroll photo).

## Gallery cards (`.about-mix-grid` — reused across categories)
- **DJing's mixes** are still 6 placeholder cards waiting on real content — for each one: a cover photo (`<img>` inside `.about-mix-cover`), the actual audio file dropped in this folder, real title/tag in `.about-mix-title`/`.about-mix-meta`, and enabling the play button (currently `disabled`) once there's real media to point it at.
- **Cinematography's reels** are done — two real `.about-mix-card[data-video]` cards, each with a `<video muted loop playsinline>` for the hover preview. Clicking a card opens it in the lightbox unmuted, with native controls, and pauses the background track for the duration (see the README's "Background-music ducking" section) — no more placeholder cards here.

To add more real reel cards later, copy the pattern from `index.html`'s Cinematography section: a `<video>` with a `<source>` inside `.about-mix-cover`, marked `data-video` on the `.about-mix-card` — `js/script.js` picks up any card with that attribute automatically, no other wiring needed.

Note: DJing's gallery is the user's own mixes, separate from the site's background-music tracks in `assets/audio/` (used by the pre-screen gate) — don't reuse those here.
