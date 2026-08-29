function showPage(id){
  const current = document.querySelector('.page.active');
  const next = document.getElementById('page-' + id);
  if(current === next) return;

  document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
  const navLink = document.querySelector('nav a[data-page="'+id+'"]');
  if(navLink) navLink.classList.add('active');

  if(current){
    current.classList.remove('active');
    current.classList.add('leaving');
    setTimeout(() => current.classList.remove('leaving'), 320);
  }
  next.classList.remove('active');
  void next.offsetWidth;
  next.classList.add('active');
  window.scrollTo(0,0);
  window.dispatchEvent(new Event('resize'));
}

const tlObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting) entry.target.classList.add('in-view');
  });
}, { threshold: 0.3 });

document.querySelectorAll('.tl-item').forEach(item => tlObserver.observe(item));

/* blog accordion */
document.querySelectorAll('.blog-row').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.blog-item');
    const wasOpen = item.classList.contains('open');
    document.querySelectorAll('.blog-item.open').forEach(open => open.classList.remove('open'));
    if(!wasOpen) item.classList.add('open');
  });
});

/* music gate — pre-page shown before the site on first visit this session */
const gate = document.getElementById('music-gate');
const audio = document.getElementById('bg-audio');
const skipBtn = document.getElementById('gate-skip');
const miniPlayer = document.getElementById('mini-player');
const miniPlayerPill = document.getElementById('mini-player-pill');
const miniToggle = document.getElementById('mini-player-toggle');
const miniTitle = document.getElementById('mini-player-title');
const miniCollapse = document.getElementById('mini-collapse');
const miniArtImg = document.getElementById('mini-art-img');
const miniExpandedTitle = document.getElementById('mini-expanded-title');
const miniExpandedArtist = document.getElementById('mini-expanded-artist');
const miniPrevBtn = document.getElementById('mini-prev');
const miniPlayBtn = document.getElementById('mini-play');
const miniNextBtn = document.getElementById('mini-next');

function showMusicGate(){
  if(sessionStorage.getItem('gate-decided') === '1') return;
  gate.hidden = false;
  gate.classList.add('fading');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => gate.classList.remove('fading'));
  });
}

/* re-opens the gate on demand (from the "pick a song" pill) regardless of
   the decided flag — the underlying page is untouched while it's open, so
   closing it again leaves the user exactly wherever they were. */
function reopenMusicGate(){
  gate.hidden = false;
  gate.classList.add('fading');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => gate.classList.remove('fading'));
  });
}

function closeGate(){
  gate.classList.add('fading');
  setTimeout(() => { gate.hidden = true; }, 700);
  sessionStorage.setItem('gate-decided', '1');
}

/* mini player — pill by default, expands into a square now-playing panel
   with its own prev/play/next so the track can be changed after entering.
   currentTrackIndex is -1 until a track is actually picked (skipping never
   sets it), which is what the "no track picked yet" pill state checks. */
let currentTrackIndex = -1;

function playTrackAtIndex(i, autoplay){
  i = ((i % gateCards.length) + gateCards.length) % gateCards.length;
  currentTrackIndex = i;
  const card = gateCards[i];
  audio.src = card.dataset.src;
  audio.currentTime = 0;
  audio.volume = 0.6;
  audio.loop = false; // auto-advance handles repeats — see 'ended' below, not native looping
  if(autoplay) audio.play().catch(() => {});
  miniPlayer.classList.remove('no-track');
  updateMiniPlayerInfo();
}

// when a track finishes, move on to the next one automatically instead of
// just stopping — only applies once a track has actually been picked
audio.addEventListener('ended', () => {
  if(currentTrackIndex >= 0) playTrackAtIndex(currentTrackIndex + 1, true);
});

function updateMiniPlayerInfo(){
  if(currentTrackIndex < 0) return; // "no track" pill state has its own copy, set separately
  const card = gateCards[currentTrackIndex];
  const img = card.querySelector('.gate-art img');
  const playing = !audio.paused;
  miniTitle.textContent = card.dataset.title;
  miniArtImg.src = img ? img.getAttribute('src') : '';
  miniArtImg.alt = card.dataset.title;
  miniExpandedTitle.textContent = card.dataset.title;
  miniExpandedArtist.textContent = card.dataset.artist;
  miniToggle.textContent = playing ? '❚❚' : '▶';
  miniPlayBtn.textContent = playing ? '❚❚' : '▶';
}

function showMiniPlayer(){
  updateMiniPlayerInfo();
  miniPlayer.hidden = false;
  requestAnimationFrame(() => miniPlayer.classList.add('showing'));
}

/* shown after the user skips the gate — same bottom-right pill, but it
   reads "pick a song" and clicking it reopens the gate instead of
   expanding a now-playing panel that has nothing to show. */
function showMiniPlayerNoTrack(){
  miniPlayer.classList.remove('expanded');
  miniPlayer.classList.add('no-track');
  miniTitle.textContent = 'pick a song';
  miniPlayer.hidden = false;
  requestAnimationFrame(() => miniPlayer.classList.add('showing'));
}

function toggleMiniPlayback(){
  if(audio.paused) audio.play().catch(() => {});
  else audio.pause();
  updateMiniPlayerInfo();
}

skipBtn.addEventListener('click', () => {
  closeGate();
  showMiniPlayerNoTrack();
});

miniPlayerPill.addEventListener('click', () => {
  if(miniPlayer.classList.contains('no-track')){
    reopenMusicGate();
  } else {
    miniPlayer.classList.add('expanded');
  }
});
miniCollapse.addEventListener('click', (e) => {
  e.stopPropagation();
  miniPlayer.classList.remove('expanded');
});
document.addEventListener('click', (e) => {
  if(miniPlayer.classList.contains('expanded') && !miniPlayer.contains(e.target)){
    miniPlayer.classList.remove('expanded');
  }
});

miniToggle.addEventListener('click', (e) => {
  e.stopPropagation();
  toggleMiniPlayback();
});
miniPlayBtn.addEventListener('click', toggleMiniPlayback);
miniPrevBtn.addEventListener('click', () => playTrackAtIndex(currentTrackIndex - 1, true));
miniNextBtn.addEventListener('click', () => playTrackAtIndex(currentTrackIndex + 1, true));

/* background-music ducking — a forward-looking hook for videos/audio
   snippets that don't exist on the site yet. Delegated (capture phase,
   since play/pause/ended don't bubble) so any <video> or <audio> added
   later — anywhere on the site, without more code here — automatically
   ducks the background track while it plays and resumes it exactly where
   it left off when the clip pauses or ends. Muted clips (e.g. the project
   gallery's silent hover previews) are skipped since they have no audio
   to conflict with. Only applies if a background track was ever picked —
   if the user skipped the gate and never chose a song, there's nothing to
   duck or resume. */
let bgMusicDuckedFor = null;
function duckBackgroundMusic(e){
  const el = e.target;
  if(!(el instanceof HTMLMediaElement) || el === audio || el.muted) return;
  if(currentTrackIndex < 0) return; // no background track was ever picked
  if(!audio.paused){
    audio.pause();
    bgMusicDuckedFor = el;
  }
}
function resumeBackgroundMusic(e){
  const el = e.target;
  if(!(el instanceof HTMLMediaElement) || el === audio || el.muted) return;
  if(bgMusicDuckedFor !== el) return;
  bgMusicDuckedFor = null;
  audio.play().catch(() => {});
}
document.addEventListener('play', duckBackgroundMusic, true);
document.addEventListener('pause', resumeBackgroundMusic, true);
document.addEventListener('ended', resumeBackgroundMusic, true);

/* gate carousel: preview tracks, pick one, enter the site */
const gateCarousel = document.getElementById('gate-carousel');
const gateCards = Array.from(document.querySelectorAll('.gate-card'));
const gatePreviewToggle = document.getElementById('gate-preview-toggle');
const gatePlayerTitle = document.getElementById('gate-player-title');
const gatePlayerArtist = document.getElementById('gate-player-artist');
const gatePrevBtn = document.getElementById('gate-prev');
const gateNextBtn = document.getElementById('gate-next');
const gateEnterBtn = document.getElementById('gate-enter');
const gateBgLayerA = document.querySelector('.gate-bg-layer-a');
const gateBgLayerB = document.querySelector('.gate-bg-layer-b');

let gateActiveIndex = 0;
let gateBgFront = 'a';

function isPreviewingCard(card){
  return !audio.paused && audio.currentSrc && audio.currentSrc.endsWith(card.dataset.src);
}

function updateGateBackground(){
  const img = gateCards[gateActiveIndex].querySelector('.gate-art img');
  const nextLayer = gateBgFront === 'a' ? gateBgLayerB : gateBgLayerA;
  const prevLayer = gateBgFront === 'a' ? gateBgLayerA : gateBgLayerB;
  if(img){
    nextLayer.style.backgroundImage = `url("${img.getAttribute('src')}")`;
    nextLayer.style.backgroundSize = 'cover';
    nextLayer.style.backgroundPosition = 'center';
  }
  nextLayer.style.opacity = '1';
  prevLayer.style.opacity = '0';
  gateBgFront = gateBgFront === 'a' ? 'b' : 'a';
}

function syncGateUI(){
  gateCards.forEach(card => {
    card.querySelector('.gate-play').textContent = isPreviewingCard(card) ? '❚❚' : '▶';
  });
  const active = gateCards[gateActiveIndex];
  gatePlayerTitle.textContent = active.dataset.title;
  gatePlayerArtist.textContent = active.dataset.artist;
  gatePreviewToggle.textContent = isPreviewingCard(active) ? '❚❚' : '▶';
}

// real carousel: cards don't just shrink in place, they get pulled back toward
// the center X position as they leave focus, so they visibly slide behind the
// front card and disappear there instead of spreading out to the sides
function updateCarouselTransforms(){
  const center = gateCarousel.scrollLeft + gateCarousel.clientWidth / 2;
  let closest = 0;
  let closestDist = Infinity;

  gateCards.forEach((card, i) => {
    const cardCenter = card.offsetLeft + card.offsetWidth / 2;
    const rawDist = cardCenter - center;
    const d = rawDist / card.offsetWidth;
    const absD = Math.min(Math.abs(d), 3);

    // how much of the natural scroll spacing to cancel out — barely anything
    // for the first card out (so it still arcs outward, visibly), then ramps
    // up fast so it's mostly tucked behind the front card by ~2.5 cards away
    const pullT = Math.min(absD / 2.5, 1);
    const pull = Math.pow(pullT, 1.8);
    const pulledX = rawDist * (1 - pull * 0.8);

    const rotate = Math.max(-58, Math.min(58, d * -42));
    const scale = 1 - Math.min(absD * 0.16, 0.5);
    const translateY = Math.min(absD * 10, 28);
    const translateZ = -Math.min(absD * 130, 400);
    const opacity = 1 - Math.min(absD * 0.22, 0.88);

    // transform/opacity go on the inner visual, never on .gate-card itself —
    // that element carries scroll-snap-align and must stay untouched
    const visual = card.querySelector('.gate-card-visual');
    visual.style.transform = `translateX(${pulledX - rawDist}px) translateY(${translateY}px) translateZ(${translateZ}px) rotateY(${rotate}deg) scale(${scale})`;
    visual.style.opacity = String(opacity);
    visual.style.zIndex = String(100 - Math.round(absD * 10));

    const dist = Math.abs(rawDist);
    if(dist < closestDist){ closestDist = dist; closest = i; }
  });

  gateCards.forEach((card, i) => card.classList.toggle('active', i === closest));

  if(closest !== gateActiveIndex){
    gateActiveIndex = closest;
    updateGateBackground();
  }
  syncGateUI();
}

let gateScrollRaf;
gateCarousel.addEventListener('scroll', () => {
  cancelAnimationFrame(gateScrollRaf);
  gateScrollRaf = requestAnimationFrame(updateCarouselTransforms);
});

// left/right arrow keys drive scrollGateTo directly rather than letting the
// browser natively scroll the carousel by a small fixed step (which looked
// choppy and didn't line up with card snap positions)
document.addEventListener('keydown', (e) => {
  if(gate.hidden) return;
  if(e.key === 'ArrowRight'){
    e.preventDefault();
    scrollGateTo(gateActiveIndex + 1);
  } else if(e.key === 'ArrowLeft'){
    e.preventDefault();
    scrollGateTo(gateActiveIndex - 1);
  }
});

let gateSnapRestoreTimer;
function animateScrollTo(target){
  // scroll-snap-type intercepts and snaps back any mid-flight scrollLeft
  // change, and both a manual rAF tween and the browser's native smooth
  // scroll can stall depending on the environment — so jump the scroll
  // position directly (always reliable) and let a temporary CSS transition
  // on the cards animate the resulting coverflow change instead
  clearTimeout(gateSnapRestoreTimer);
  gateCarousel.classList.add('snapping');
  gateCarousel.style.scrollSnapType = 'none';
  gateCarousel.scrollLeft = target;
  updateCarouselTransforms();
  gateSnapRestoreTimer = setTimeout(() => {
    gateCarousel.style.scrollSnapType = '';
    gateCarousel.classList.remove('snapping');
  }, 450);
}

function scrollGateTo(i){
  i = Math.max(0, Math.min(gateCards.length - 1, i));
  const card = gateCards[i];
  const target = card.offsetLeft + card.offsetWidth / 2 - gateCarousel.clientWidth / 2;
  animateScrollTo(target);
}

gatePrevBtn.addEventListener('click', () => scrollGateTo(gateActiveIndex - 1));
gateNextBtn.addEventListener('click', () => scrollGateTo(gateActiveIndex + 1));

function togglePreview(card){
  if(isPreviewingCard(card)){
    audio.pause();
  } else {
    audio.src = card.dataset.src;
    audio.currentTime = 0;
    audio.volume = 0.6;
    audio.loop = true;
    audio.play().catch(() => {});
  }
  syncGateUI();
}

gateCards.forEach((card, i) => {
  card.querySelector('.gate-play').addEventListener('click', (e) => {
    e.stopPropagation();
    if(i !== gateActiveIndex) scrollGateTo(i);
    togglePreview(card);
  });
  card.addEventListener('click', () => {
    if(i !== gateActiveIndex) scrollGateTo(i);
  });
});

gatePreviewToggle.addEventListener('click', () => togglePreview(gateCards[gateActiveIndex]));

gateEnterBtn.addEventListener('click', () => {
  const card = gateCards[gateActiveIndex];
  if(isPreviewingCard(card)){
    currentTrackIndex = gateActiveIndex;
    audio.loop = false; // was true for the gate preview — main playback auto-advances instead of looping
    miniPlayer.classList.remove('no-track');
  } else {
    playTrackAtIndex(gateActiveIndex, true);
  }
  showMiniPlayer();
  closeGate();
});

showMusicGate();
if(!gate.hidden){
  gateCarousel.scrollLeft = gateCards[0].offsetLeft + gateCards[0].offsetWidth / 2 - gateCarousel.clientWidth / 2;
  updateGateBackground();
  updateCarouselTransforms();
} else {
  // gate was already decided earlier this session (e.g. a reload) — the
  // pill still needs to be there so a "skip" decision from before is still
  // reversible now
  showMiniPlayerNoTrack();
}

/* project gallery: hover-autoplay video, lightbox */
document.querySelectorAll('.piece-media-video video').forEach(video => {
  const wrap = video.closest('.piece');
  wrap.addEventListener('mouseenter', () => video.play().catch(() => {}));
  wrap.addEventListener('mouseleave', () => { video.pause(); video.currentTime = 0; });
});

const lightbox = document.getElementById('lightbox');
const lightboxMedia = document.getElementById('lightbox-media');
const lightboxTitle = document.getElementById('lightbox-title');
const lightboxMedium = document.getElementById('lightbox-medium');
const lightboxDesc = document.getElementById('lightbox-desc');
const lightboxClose = document.getElementById('lightbox-close');
const lightboxBackdrop = document.getElementById('lightbox-backdrop');

function openLightboxWith(mediaSourceEl, title, medium, desc){
  const media = mediaSourceEl.cloneNode(true);
  media.querySelectorAll('video').forEach(v => {
    v.removeAttribute('loop');
    v.removeAttribute('muted');
    v.muted = false;
    v.setAttribute('controls', '');
  });
  lightboxMedia.innerHTML = '';
  lightboxMedia.appendChild(media);
  lightboxTitle.textContent = title;
  lightboxMedium.textContent = medium;
  lightboxDesc.textContent = desc;
  lightbox.hidden = false;
  requestAnimationFrame(() => lightbox.classList.add('showing'));
}

function openLightbox(piece){
  openLightboxWith(
    piece.querySelector('.piece-media'),
    piece.querySelector('.piece-title').textContent,
    piece.querySelector('.piece-medium').textContent,
    piece.querySelector('.piece-desc').textContent
  );
}

function closeLightbox(){
  lightbox.classList.remove('showing');
  lightboxMedia.querySelectorAll('video').forEach(v => v.pause()); // fires 'pause' so background music ducking resumes
  setTimeout(() => { lightbox.hidden = true; lightboxMedia.innerHTML = ''; }, 350);
}

document.querySelectorAll('.piece').forEach(piece => {
  piece.addEventListener('click', () => openLightbox(piece));
});
lightboxClose.addEventListener('click', closeLightbox);
lightboxBackdrop.addEventListener('click', closeLightbox);
document.addEventListener('keydown', (e) => {
  if(e.key === 'Escape' && !lightbox.hidden) closeLightbox();
});

/* about page — real reel videos: hover-preview muted (same pattern as the
   project gallery), click opens the lightbox with sound. Ducking the
   background track while a reel plays is handled generically by the
   play/pause/ended delegation set up above the music-gate code. */
document.querySelectorAll('.about-mix-card[data-video]').forEach(card => {
  const cover = card.querySelector('.about-mix-cover');
  const previewVideo = cover.querySelector('video');
  if(previewVideo){
    cover.addEventListener('mouseenter', () => previewVideo.play().catch(() => {}));
    cover.addEventListener('mouseleave', () => { previewVideo.pause(); previewVideo.currentTime = 0; });
  }
  card.addEventListener('click', () => {
    openLightboxWith(
      cover,
      card.querySelector('.about-mix-title').textContent,
      card.querySelector('.about-mix-meta').textContent,
      ''
    );
  });
});

/* about page — djing section: sound effect placeholder */
const sfxFiles = {}; // e.g. { hover: 'assets/about/sfx-hover.mp3', click: 'assets/about/sfx-click.mp3' }
function playSfx(name){
  const src = sfxFiles[name];
  if(!src) return; // no file wired up yet — safe no-op
  const s = new Audio(src);
  s.volume = 0.4;
  s.play().catch(() => {});
}

/* about page — djing section: mix gallery. Placeholder cards for now (real
   mixes to be added later) — this just wires up reveal-on-scroll and SFX
   hooks, no audio yet since these aren't real tracks. */
const aboutMixCards = document.querySelectorAll('.about-mix-card');
if(aboutMixCards.length){
  const aboutMixObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting) entry.target.classList.add('in-view');
    });
  }, { threshold: 0.15 });
  aboutMixCards.forEach(card => {
    aboutMixObserver.observe(card);
    card.addEventListener('mouseenter', () => playSfx('hover'));
    card.addEventListener('click', () => playSfx('click'));
  });
}

/* about page — travel cards: scroll-reveal like the mix/reel cards, plus
   click (or Enter/Space, since they're role="button") toggles .expanded to
   show/hide the write-up underneath. */
const aboutTravelCards = document.querySelectorAll('.about-travel-card');
if(aboutTravelCards.length){
  const aboutTravelObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting) entry.target.classList.add('in-view');
    });
  }, { threshold: 0.15 });
  aboutTravelCards.forEach(card => {
    aboutTravelObserver.observe(card);
    function toggleTravelCard(){
      const expanded = card.classList.toggle('expanded');
      card.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    }
    card.addEventListener('click', toggleTravelCard);
    card.addEventListener('keydown', (e) => {
      if(e.key === 'Enter' || e.key === ' '){
        e.preventDefault();
        toggleTravelCard();
      }
    });
  });
}

/* about page — shared Web Audio graph, singleton — createMediaElementSource()
   may only be called once per <audio> element for its entire lifetime.
   Reused by the djing border visualizer below. */
let audioGraph = null;

function initAboutAudioGraph(){
  if(audioGraph) {
    if(audioGraph.ctx.state === 'suspended') audioGraph.ctx.resume();
    return audioGraph;
  }
  if(!audio || (typeof AudioContext === 'undefined' && typeof webkitAudioContext === 'undefined')) return null;
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = new Ctx();
    const source = ctx.createMediaElementSource(audio);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 64;
    source.connect(analyser);
    analyser.connect(ctx.destination); // critical — without this, audio goes silent
    audioGraph = { ctx, source, analyser, data: new Uint8Array(analyser.frequencyBinCount) };
    if(ctx.state === 'suspended') ctx.resume();
  } catch(e) {
    audioGraph = null;
  }
  return audioGraph;
}

/* the audio graph needs a real user gesture to resume under the browser's
   autoplay policy. There's no dedicated click target for it anymore (the
   DJing content is just visible on the page now), so the first click
   anywhere on the site — nav, gate, anything — creates and resumes it. */
document.addEventListener('click', () => initAboutAudioGraph(), { once: true });

/* about page — audio-reactive border around the whole DJing section. No
   per-orb DOM elements: just three CSS custom properties re-written on the
   section every frame, read by .about-djing-border's box-shadow. Reacts to
   whatever's playing on the shared #bg-audio element (or idles gently).
   Tracks the peak of the bass/low-mid bins (where kicks and snares live)
   with an instant attack and a hard release, and swings across the
   border's FULL range on every hit — at rest it's basically invisible,
   and on a hit it jumps straight to the max, so the motion is completely
   unmistakable instead of a wobble around one shade. */
const djingCategory = document.querySelector('.about-category.djing');
if(djingCategory){
  let borderClock = 0;
  let borderLevel = 0;
  (function renderDjingBorder(){
    requestAnimationFrame(renderDjingBorder);
    const playing = audioGraph && audio && !audio.paused;
    let target;
    if(playing){
      audioGraph.analyser.getByteFrequencyData(audioGraph.data);
      const bassCount = Math.max(1, Math.floor(audioGraph.data.length * 0.3));
      let peak = 0;
      for(let i = 0; i < bassCount; i++) peak = Math.max(peak, audioGraph.data[i]);
      target = peak / 255; // 0..1
      // instant attack (jumps straight to the hit's level), hard release
      // (drops back down well before the next beat instead of lingering)
      borderLevel = target > borderLevel ? target : borderLevel * 0.5 + target * 0.5;
    } else {
      // idle: a full 0-to-1-to-0 sweep, slow enough to actually track by eye
      borderClock += 0.028;
      borderLevel = Math.pow((Math.sin(borderClock) + 1) / 2, 1.2);
    }
    djingCategory.style.setProperty('--djing-border-w', `${(borderLevel * 16).toFixed(2)}px`);
    djingCategory.style.setProperty('--djing-border-a', Math.min(1, borderLevel * 1.05).toFixed(2));
    djingCategory.style.setProperty('--djing-glow', `${(borderLevel * 140).toFixed(1)}px`);
  })();
}
