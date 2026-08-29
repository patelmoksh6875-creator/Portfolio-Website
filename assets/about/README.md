Drop real images/video here — filenames the About page expects, per category:

## DJing (`.about-category[data-category="djing"]`)
- dj-mixer.jpg — banner background

No banner-adjacent images — the section is just the bio copy, the audio-reactive border, and the mix gallery below (see "Gallery cards" for the vinyl mix player).

## Cinematography (`.about-category[data-category="cinematography"]`)
- comiccamera.jpg — banner background
- cameraroll.jpg — the big film-strip photo next to the bio text (fills half the section)
- introduction.mp4, claude-cinematic.mp4 — the two real reel videos in the gallery below (see "Gallery cards")

## Travel (`.about-category[data-category="travel"]`)
- travel-placeholder.jpg — banner background
- machu-picchu.jpg, monaco.jpg, bioluminescent-lake-puerto-rico.jpg, guatemala-volcano.jpg, petra.jpg, pyramids-of-giza.jpg — the six real place cards. Each is shown at `object-fit:contain` inside a square frame (not `cover`), so the whole photo is always visible, letterboxed rather than cropped.
- To add another place: drop a photo here, add a `.about-travel-card` in `index.html` following the existing pattern, and hand me the photo — I'll write the description.

## Future (`.about-category[data-category="future"]`)
- future-placeholder.jpg — banner background

Until these exist, the page degrades gracefully (CSS `background-image` just shows the fallback dark background, no broken-image icons for the banners; `<img onerror>` hides the element entirely for the cameraroll photo).

## Gallery cards (`.about-mix-grid` — reused across categories)
- **DJing's mixes** are 6 cards with a default CSS-drawn vinyl graphic (`.mix-vinyl-icon` — concentric grooves + a center label, no image) standing in for a cover photo, since there's no real cover art yet. Clicking one opens the full mix player overlay (see below). Each card carries `data-mix-src`/`data-fl-src`/`data-mix-title`/`data-mix-meta` — the first two are empty placeholders right now. Drop a mix's audio file and its FL Studio screen-recording in this folder, then fill in the matching card's `data-mix-src="assets/about/mix-01.mp3"` and `data-fl-src="assets/about/mix-01-flstudio.mp4"` in `index.html` — no other changes needed, `js/script.js` picks it up automatically.
- **Cinematography's reels** are done — two real `.about-mix-card[data-video]` cards, each with a `<video muted loop playsinline>` for the hover preview, sized `16:9` (not the square box the other galleries use, so nothing gets cropped off the sides). Clicking a card opens it in the lightbox unmuted, with native controls, and pauses the background track for the duration.

## DJing mix player (`#mix-player` in `index.html`, driven by `js/script.js`)
Clicking a mix's vinyl opens a full-viewport overlay: the vinyl grows in centered and starts spinning, the mix itself starts playing if `data-mix-src` is set (this automatically pauses the background track — see "Background-music ducking" in the main README — and resumes it when the mix ends or the player is closed), the FL Studio clip slides in from the side a beat later if `data-fl-src` is set, then the vinyl shrinks to the bottom-left corner — still spinning — while the rest of the overlay fades so the page is usable again. Clicking the docked mini vinyl reopens the full view; the ✕ closes it entirely. With no real files attached yet, the whole visual sequence still plays — it just has nothing to actually play audio/video from.

To add more real reel cards to Cinematography later, copy the pattern from `index.html`'s Cinematography section: a `<video>` with a `<source>` inside `.about-mix-cover`, marked `data-video` on the `.about-mix-card` — `js/script.js` picks up any card with that attribute automatically, no other wiring needed.

Note: DJing's gallery is the user's own mixes, separate from the site's background-music tracks in `assets/audio/` (used by the pre-screen gate) — don't reuse those here.
