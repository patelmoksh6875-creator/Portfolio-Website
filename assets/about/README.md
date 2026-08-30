Drop real images/video here — filenames the About page expects, per category:

## DJing (`.about-category[data-category="djing"]`)
- dj-mixer.jpg — banner background

No banner-adjacent images — the section is just the bio copy, the audio-reactive border, and the mix gallery below (see "Gallery cards" for the vinyl mix player).

## Cinematography (`.about-category[data-category="cinematography"]`)
- comiccamera.jpg — banner background
- cameraroll.jpg — the big film-strip photo next to the bio text (fills half the section)
- claude-cinematic.mp4 — the one real reel video in the gallery below (see "Gallery cards"). `introduction.mp4` was removed along with its card.

## Travel (`.about-category[data-category="travel"]`)
- travel-placeholder.jpg — banner background
- machu-picchu.jpg, monaco.jpg, bioluminescent-lake-puerto-rico.jpg, guatemala-volcano.jpg, petra.jpg, pyramids-of-giza.jpg — the six real place cards. Each is shown at `object-fit:contain` inside a square frame (not `cover`), so the whole photo is always visible, letterboxed rather than cropped.
- To add another place: drop a photo here, add a `.about-travel-card` in `index.html` following the existing pattern, and hand me the photo — I'll write the description.

## Space (`.about-category[data-category="space"]`) — new, empty placeholder
- space-placeholder.jpg — banner background (not added yet)
- `#space-gallery` (a `.about-travel-grid`, right below the intro copy) is an empty gallery ready for real NASA photos — drop them here and add `.about-travel-card` entries following the exact same pattern as Travel's cards (cover image + expand-on-click detail text), no JS changes needed.
- A slot for an interactive 3d black-hole visualization sits above the gallery (see the HTML comment in `index.html`) — not built yet since there's no real scene/asset to wire up. Once you have something (a Three.js scene, a model, whatever the actual plan is), I can build the viewer around it the same way Objectify's point-cloud viewer works.

## Future (`.about-category[data-category="future"]`)
- future-placeholder.jpg — banner background

Until these exist, the page degrades gracefully (CSS `background-image` just shows the fallback dark background, no broken-image icons for the banners; `<img onerror>` hides the element entirely for the cameraroll photo).

## Gallery cards (`.about-mix-grid` — reused across categories)
- **DJing's mixes**: both cards are real — `meri zindagi hai tu x raindance` (`mix-01.mp3` / `mix-01-flstudio.mp4`) and `pour it up x don't like` (`mix-02.mp3` / `mix-02-flstudio.mp4`). The unfilled placeholder cards were removed — to add another, drop its audio file and FL Studio screen-recording here, then add a new `.about-mix-card[data-mix]` in `index.html` with real `data-mix-src="assets/about/mix-0N.mp3"`, `data-fl-src="assets/about/mix-0N-flstudio.mp4"`, `data-mix-title`, `data-mix-meta` (plus matching `.about-mix-title`/`.about-mix-meta` text) — no JS changes needed, `js/script.js` picks it up automatically. The two FL Studio clips were originally 354MB/213MB screen recordings; re-encoded to 1512×828 @ 30fps H.264 (no audio track — silent to begin with) at ~8.7MB/~9.8MB.
- **Cinematography's reels** are done — two real `.about-mix-card[data-video]` cards, each with a `<video muted loop playsinline>` for the hover preview, sized `16:9` (not the square box the other galleries use, so nothing gets cropped off the sides). Clicking a card opens it in the lightbox unmuted, with native controls, and pauses the background track for the duration.

## DJing mix player (`#mix-player` in `index.html`, driven by `js/script.js`)
Clicking a mix's vinyl opens a full-viewport overlay: the vinyl grows in centered; clicking it again starts the mix (this automatically pauses the background track — see "Background-music ducking" in the main README — and resumes it when the mix ends or the player is closed). 2 seconds in, the vinyl shrinks and shifts to the left while the FL Studio clip (which slid in from the right ~900ms in) grows into the spot the vinyl used to fill — both stay visible together as the overlay's two main components for as long as the mix plays; it never shrinks to a mini corner icon or lets the page become interactive again. Only the ✕ (or the backdrop, before playback starts) closes it. With no real files attached to a given card yet, the whole visual sequence still plays — it just has nothing to actually play audio/video from for that one.

While a mix is actually playing, the overlay itself gets the same audio-reactive border used on the DJing section (`#mix-player-border`, driven by its own Web Audio graph on `#mix-audio` — a separate singleton from the shared `#bg-audio` one) — it reacts to that mix's own audio, and sits flat at 0 whenever nothing is playing (no idle sweep, unlike the always-on page-level border). The FL Studio clip also gets a seekable scrub bar (`#mix-flvideo-controls`), same restyled-range-input pattern as the Cinematography lightbox and the project demo-video viewer below, and fades out after 2 seconds of no mouse movement over the clip, reappearing on the next `mousemove`.

To add more real reel cards to Cinematography later, copy the pattern from `index.html`'s Cinematography section: a `<video>` with a `<source>` inside `.about-mix-cover`, marked `data-video` on the `.about-mix-card` — `js/script.js` picks up any card with that attribute automatically, no other wiring needed.

Note: DJing's gallery is the user's own mixes, separate from the site's background-music tracks in `assets/audio/` (used by the pre-screen gate) — don't reuse those here.
