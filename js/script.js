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
const miniSeek = document.getElementById('mini-seek');

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

// lets the user scrub through the background track from the mini player
function syncMiniSeek(){
  if(currentTrackIndex < 0 || !audio.duration) return;
  miniSeek.max = audio.duration;
  if(!miniSeek.matches(':active')) miniSeek.value = audio.currentTime;
}
audio.addEventListener('loadedmetadata', syncMiniSeek);
audio.addEventListener('timeupdate', syncMiniSeek);
miniSeek.addEventListener('input', () => { audio.currentTime = miniSeek.value; });

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
  // opens centered on the middle card (leather coat) instead of the
  // first one, so there are tracks visible on both sides right away
  gateActiveIndex = Math.floor(gateCards.length / 2);
  const startCard = gateCards[gateActiveIndex];
  gateCarousel.scrollLeft = startCard.offsetLeft + startCard.offsetWidth / 2 - gateCarousel.clientWidth / 2;
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
const lightboxVideoControls = document.getElementById('lightbox-video-controls');
const lightboxVideoToggle = document.getElementById('lightbox-video-toggle');
const lightboxVideoSeek = document.getElementById('lightbox-video-seek');

function openLightboxWith(mediaSourceEl, title, medium, desc){
  const media = mediaSourceEl.cloneNode(true);
  const video = media.querySelector('video');
  if(video){
    video.removeAttribute('loop');
    video.removeAttribute('muted');
    video.muted = false;
    // no native controls — the glass play/pause + seek bar below drives it
    // instead, which also lets .lightbox-media size to its real natural
    // shape instead of inheriting the photo lightbox's fixed aspect-ratio
    // (that mismatch was squeezing these videos into a crop)
  }
  lightboxMedia.innerHTML = '';
  lightboxMedia.appendChild(media);
  lightboxMedia.classList.toggle('lightbox-media--video', !!video);
  lightboxTitle.textContent = title;
  lightboxMedium.textContent = medium;
  lightboxDesc.textContent = desc;
  lightbox.hidden = false;
  requestAnimationFrame(() => lightbox.classList.add('showing'));

  lightboxVideoControls.hidden = !video;
  if(video){
    lightboxMedia.appendChild(lightboxVideoControls); // relocates the one shared controls bar into this box
    const syncToggle = () => { lightboxVideoToggle.textContent = video.paused ? '▶' : '❚❚'; };
    syncToggle();
    video.addEventListener('play', syncToggle);
    video.addEventListener('pause', syncToggle);
    lightboxVideoToggle.onclick = () => {
      if(video.paused) video.play().catch(() => {});
      else video.pause();
    };

    const syncSeek = () => {
      if(!video.duration) return;
      lightboxVideoSeek.max = video.duration;
      if(!lightboxVideoSeek.matches(':active')) lightboxVideoSeek.value = video.currentTime;
    };
    lightboxVideoSeek.value = 0;
    video.addEventListener('loadedmetadata', syncSeek);
    video.addEventListener('timeupdate', syncSeek);
    lightboxVideoSeek.oninput = () => { video.currentTime = lightboxVideoSeek.value; };

    showLightboxVideoControls(); // visible on open, then the usual 2s idle timer takes over
  }
}

/* the video controls bar fades out after 2s of no mouse movement over the
   video, and comes right back the moment the mouse moves again — same
   pattern as any video player's auto-hiding transport controls. */
let lightboxControlsIdleTimer;
function showLightboxVideoControls(){
  if(lightboxVideoControls.hidden) return; // no video open — nothing to show
  lightboxVideoControls.classList.remove('idle');
  clearTimeout(lightboxControlsIdleTimer);
  lightboxControlsIdleTimer = setTimeout(() => {
    lightboxVideoControls.classList.add('idle');
  }, 2000);
}
lightboxMedia.addEventListener('mousemove', showLightboxVideoControls);
lightboxMedia.addEventListener('mouseenter', showLightboxVideoControls);

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
  clearTimeout(lightboxControlsIdleTimer);
  setTimeout(() => {
    lightbox.hidden = true;
    lightboxMedia.innerHTML = '';
    lightboxVideoControls.hidden = true;
    lightboxVideoControls.classList.remove('idle');
  }, 350);
}

document.querySelectorAll('.piece:not([data-custom-viewer]):not([data-video-piece])').forEach(piece => {
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

/* about page — travel cards: scroll-reveal like the mix/reel cards
   (unchanged), plus click (or Enter/Space) opens #travel-viewer — a
   full-viewport overlay. The clicked photo itself (not a copy) FLIP-
   grows into a larger, slightly left-shifted position, a description
   panel slides in on the right, and the page background behind it
   switches to a heavily blurred version of that same photo. Clicking
   the ✕ or the backdrop reverses it: the photo FLIPs smoothly back into
   its own grid cell. Reuses flipInto() defined below with the DJing mix
   player, since the technique (and its "move the real element, not a
   clone, so it can go back to exactly where it came from" requirement)
   is identical. */
const aboutTravelCards = document.querySelectorAll('.about-travel-card');
if(aboutTravelCards.length){
  const aboutTravelObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting) entry.target.classList.add('in-view');
    });
  }, { threshold: 0.15 });
  aboutTravelCards.forEach(card => aboutTravelObserver.observe(card));
}

const travelViewer = document.getElementById('travel-viewer');
const travelViewerBgBlur = document.getElementById('travel-viewer-bg-blur');
const travelViewerPhotoSlot = document.getElementById('travel-viewer-photo');
const travelViewerTitle = document.getElementById('travel-viewer-title');
const travelViewerMeta = document.getElementById('travel-viewer-meta');
const travelViewerDesc = document.getElementById('travel-viewer-desc');
const travelViewerClose = document.getElementById('travel-viewer-close');
const travelViewerBackdrop = document.getElementById('travel-viewer-backdrop');

let activeTravelCard = null;
let activeTravelImg = null;

function openTravelViewer(card){
  if(activeTravelCard || !travelViewer) return; // one at a time
  activeTravelCard = card;
  activeTravelImg = card.querySelector('.about-travel-cover img');
  if(!activeTravelImg){ activeTravelCard = null; return; }

  travelViewerBgBlur.style.backgroundImage = `url("${activeTravelImg.getAttribute('src')}")`;
  travelViewerTitle.textContent = card.querySelector('.about-mix-title')?.textContent || '';
  travelViewerMeta.textContent = card.querySelector('.about-mix-meta')?.textContent || '';
  const descP = card.querySelector('.about-travel-detail p');
  travelViewerDesc.textContent = descP ? descP.textContent : '';

  travelViewer.hidden = false;
  flipInto(activeTravelImg, travelViewerPhotoSlot);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => travelViewer.classList.add('opened'));
  });
}

function closeTravelViewer(){
  if(!activeTravelCard) return;
  travelViewer.classList.remove('opened');
  const cover = activeTravelCard.querySelector('.about-travel-cover');
  flipInto(activeTravelImg, cover); // send the photo back to its own card
  setTimeout(() => { travelViewer.hidden = true; }, 600);
  activeTravelCard = null;
  activeTravelImg = null;
}

if(travelViewer){
  aboutTravelCards.forEach(card => {
    card.addEventListener('click', () => openTravelViewer(card));
    card.addEventListener('keydown', (e) => {
      if(e.key === 'Enter' || e.key === ' '){
        e.preventDefault();
        openTravelViewer(card);
      }
    });
  });
  travelViewerClose.addEventListener('click', (e) => {
    e.stopPropagation();
    closeTravelViewer();
  });
  travelViewerBackdrop.addEventListener('click', closeTravelViewer);
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
   This is onset-based, not just "how loud is the bass right now" — it
   tracks a slow-moving floor of the sub/kick bins and only lights up on
   a rise ABOVE that floor, so a track with constant/sustained bass energy
   (not just short kick transients) doesn't just sit permanently lit.
   Both attack and release are smoothed (not instant) so it visibly rises
   and falls like a wave on each beat instead of flashing on/off, and the
   overall swing is toned down so it reads as a glow, not a strobe. */
function makeBorderReactor(){
  let floor = 0;
  let level = 0;
  return function(analyser, data){
    analyser.getByteFrequencyData(data);
    // narrow window on the lowest bins only (sub-bass/kick body), not a
    // broad 30% slice that also catches the bassline sitting under a beat
    const bassCount = Math.max(1, Math.floor(data.length * 0.15));
    let peak = 0;
    for(let i = 0; i < bassCount; i++) peak = Math.max(peak, data[i]);
    // floor tracks the ambient/sustained bass level slowly, so it rises
    // with a loud track but doesn't out-run a real transient
    floor += (peak - floor) * 0.06;
    const headroom = Math.max(1, 255 - floor);
    const target = Math.min(1, Math.max(0, (peak - floor) / headroom) * 1.3);
    // smoothed attack (quick but not instant) and a slower, smoothed
    // release — both ease toward the target rather than snapping to it
    const rate = target > level ? 0.28 : 0.1;
    level += (target - level) * rate;
    return level;
  };
}

const djingCategory = document.querySelector('.about-category.djing');
if(djingCategory){
  let borderClock = 0;
  let borderLevel = 0;
  const reactDjing = makeBorderReactor();
  (function renderDjingBorder(){
    requestAnimationFrame(renderDjingBorder);
    const playing = audioGraph && audio && !audio.paused;
    if(playing){
      borderLevel = reactDjing(audioGraph.analyser, audioGraph.data);
    } else {
      // idle: a full 0-to-1-to-0 sweep, slow enough to actually track by eye
      borderClock += 0.028;
      borderLevel = Math.pow((Math.sin(borderClock) + 1) / 2, 1.2);
    }
    djingCategory.style.setProperty('--djing-border-w', `${(borderLevel * 22).toFixed(2)}px`);
    djingCategory.style.setProperty('--djing-border-a', Math.min(1, borderLevel * 0.95).toFixed(2));
    djingCategory.style.setProperty('--djing-glow', `${(borderLevel * 130).toFixed(1)}px`);
  })();
}

/* about page — DJing mix player. Clicking a mix's vinyl FLIP-moves that
   card's own .mix-vinyl-icon into a full overlay — it grows in centered,
   with a "click to play" hint. Clicking the vinyl again starts the mix
   (ducking the background track via the same generic play/pause/ended
   hook the Cinematography reels use — #mix-audio is just another
   non-background element). 2 seconds later the vinyl shrinks and shifts
   to the left while the FL Studio clip slides in from the right and
   grows into the spot the vinyl used to fill — both stay fully visible
   together as the overlay's two main components (.side-by-side) for as
   long as the mix plays; this never fades to a mini corner icon or lets
   the page become interactive again. Only the ✕ (or the backdrop,
   before playback starts) closes the player — audio/video stop, and the
   vinyl FLIPs smoothly back into the exact card slot it came from, so
   the card never stays empty, it just briefly lends its vinyl out.
   data-mix-src/data-fl-src are empty placeholders until real files
   exist; the visual sequence still plays either way, it just skips
   whichever media isn't there yet. (A continuous spin animation on the
   vinyl was tried and removed — it stuttered noticeably at the start
   before settling into a clean rotation.) */
/* mix player — own Web Audio graph (separate singleton from the shared
   #bg-audio one above; #mix-audio is a different <audio> element so it
   needs its own source/analyser). Drives the same kind of audio-reactive
   border, but on the player overlay itself, and with no idle sweep —
   it should sit flat at 0 whenever a mix isn't actually playing. */
let mixAudioGraph = null;
function initMixAudioGraph(){
  if(mixAudioGraph){
    if(mixAudioGraph.ctx.state === 'suspended') mixAudioGraph.ctx.resume();
    return mixAudioGraph;
  }
  if(!mixAudio || (typeof AudioContext === 'undefined' && typeof webkitAudioContext === 'undefined')) return null;
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = new Ctx();
    const source = ctx.createMediaElementSource(mixAudio);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 64;
    source.connect(analyser);
    analyser.connect(ctx.destination); // critical — without this, the mix goes silent
    mixAudioGraph = { ctx, source, analyser, data: new Uint8Array(analyser.frequencyBinCount) };
    if(ctx.state === 'suspended') ctx.resume();
  } catch(e) {
    mixAudioGraph = null;
  }
  return mixAudioGraph;
}

const mixPlayer = document.getElementById('mix-player');
const mixPlayerVinylSlot = document.getElementById('mix-player-vinyl');
const mixPlayerFlVideo = document.getElementById('mix-player-flvideo-el');
const mixPlayerTitle = document.getElementById('mix-player-title');
const mixPlayerMeta = document.getElementById('mix-player-meta');
const mixPlayerClose = document.getElementById('mix-player-close');
const mixAudio = document.getElementById('mix-audio');
const mixFlVideoControls = document.getElementById('mix-flvideo-controls');
const mixFlVideoToggle = document.getElementById('mix-flvideo-toggle');
const mixFlVideoSeek = document.getElementById('mix-flvideo-seek');
const mixPlayerFlVideoBox = document.getElementById('mix-player-flvideo');

/* seekable scrub bar for the FL Studio clip — same pattern as the demo
   video / lightbox scrub bars, wired once since the elements are real
   static nodes, never cloned. */
const syncMixFlVideoToggle = () => { mixFlVideoToggle.textContent = mixPlayerFlVideo.paused ? '▶' : '❚❚'; };
mixPlayerFlVideo.addEventListener('play', syncMixFlVideoToggle);
mixPlayerFlVideo.addEventListener('pause', syncMixFlVideoToggle);
mixFlVideoToggle.addEventListener('click', () => {
  if(mixPlayerFlVideo.paused) mixPlayerFlVideo.play().catch(() => {});
  else mixPlayerFlVideo.pause();
});
mixPlayerFlVideo.addEventListener('loadedmetadata', () => {
  if(mixPlayerFlVideo.duration) mixFlVideoSeek.max = mixPlayerFlVideo.duration;
});
mixPlayerFlVideo.addEventListener('timeupdate', () => {
  if(!mixPlayerFlVideo.duration || mixFlVideoSeek.matches(':active')) return;
  mixFlVideoSeek.value = mixPlayerFlVideo.currentTime;
});
mixFlVideoSeek.addEventListener('input', () => { mixPlayerFlVideo.currentTime = mixFlVideoSeek.value; });

let mixFlVideoControlsIdleTimer;
function showMixFlVideoControls(){
  if(mixFlVideoControls.hidden) return;
  mixFlVideoControls.classList.remove('idle');
  clearTimeout(mixFlVideoControlsIdleTimer);
  mixFlVideoControlsIdleTimer = setTimeout(() => {
    mixFlVideoControls.classList.add('idle');
  }, 2000);
}
mixPlayerFlVideoBox.addEventListener('mousemove', showMixFlVideoControls);
mixPlayerFlVideoBox.addEventListener('mouseenter', showMixFlVideoControls);

let mixPlayerTimers = [];
function clearMixPlayerTimers(){
  mixPlayerTimers.forEach(t => clearTimeout(t));
  mixPlayerTimers = [];
}

/* FLIP: read the element's current on-screen box, reparent it (which
   snaps it to the new parent's box instantly, since .mix-vinyl-icon is
   always sized width/height:100% of whatever contains it), then apply
   the inverse transform so it still LOOKS like it's in the old box, and
   animate that transform back to none. Same technique used for the
   earlier hero-vinyl dock — a transform-only FLIP composes cleanly with
   the new parent's own CSS transitions (.mix-player-vinyl animates its
   own top/left/width/height independently), unlike trying to animate
   top/left directly across a position:fixed ↔ normal-flow boundary. */
function flipInto(el, newParent){
  const first = el.getBoundingClientRect();
  newParent.appendChild(el);
  const last = el.getBoundingClientRect();
  const dx = first.left - last.left;
  const dy = first.top - last.top;
  const sx = first.width / last.width;
  const sy = first.height / last.height;
  el.style.transformOrigin = 'top left';
  el.style.transition = 'none';
  el.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      el.style.transition = 'transform 0.9s cubic-bezier(0.16, 1, 0.3, 1)';
      el.style.transform = 'none';
    });
  });
  // transformOrigin:'top left' above was only ever needed for this one
  // FLIP animation's own math — left set, it would make any later
  // transform on this element (a rotation, say) apply around its corner
  // instead of its center. Clear it back to the CSS default once the
  // FLIP transition has actually finished.
  setTimeout(() => { el.style.transformOrigin = ''; }, 950);
}

let activeMixCard = null;
let activeVinylIcon = null;

function openMixPlayer(card){
  if(activeMixCard) return; // one at a time
  clearMixPlayerTimers();
  activeMixCard = card;
  activeVinylIcon = card.querySelector('.mix-vinyl-icon');
  const cover = card.querySelector('.about-mix-cover--vinyl');
  if(cover) cover.classList.add('mix-vinyl-borrowed');

  mixPlayerTitle.textContent = card.dataset.mixTitle || '';
  mixPlayerMeta.textContent = card.dataset.mixMeta || '';

  mixPlayer.hidden = false;
  mixPlayer.classList.remove('side-by-side', 'flvideo-visible', 'playing');

  // move the real vinyl icon out of the card and into the overlay slot —
  // it grows from the card's own on-screen size into the big centered one
  flipInto(activeVinylIcon, mixPlayerVinylSlot);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => mixPlayer.classList.add('opened'));
  });
}

function startMixPlayback(){
  if(!activeMixCard || mixPlayer.classList.contains('playing')) return;
  const src = activeMixCard.dataset.mixSrc;
  const flSrc = activeMixCard.dataset.flSrc;

  mixPlayer.classList.add('playing');
  initMixAudioGraph(); // this click is a qualifying user gesture

  if(src){
    mixAudio.src = src;
    mixAudio.currentTime = 0;
    mixAudio.play().catch(() => {}); // triggers the generic ducking hook — background track pauses
  }

  mixPlayerTimers.push(setTimeout(() => {
    if(flSrc){
      mixPlayerFlVideo.src = flSrc;
      mixPlayerFlVideo.currentTime = 0;
      mixPlayerFlVideo.play().catch(() => {});
      mixFlVideoSeek.value = 0;
      showMixFlVideoControls(); // visible as soon as the clip appears, then the usual 2s idle timer takes over
    }
    mixPlayer.classList.add('flvideo-visible');
  }, 900));

  // 2 seconds after playback starts, the vinyl shrinks to the side and
  // the FL Studio clip takes over its old spot
  mixPlayerTimers.push(setTimeout(() => {
    mixPlayer.classList.add('side-by-side');
  }, 2000));
}

function closeMixPlayer(){
  if(!activeMixCard) return;
  clearMixPlayerTimers();
  mixPlayer.classList.remove('opened', 'side-by-side', 'flvideo-visible', 'playing');
  mixAudio.pause(); // fires 'pause' — background track resumes via the generic ducking hook
  mixPlayerFlVideo.pause();
  clearTimeout(mixFlVideoControlsIdleTimer);
  mixFlVideoControls.classList.remove('idle');

  const cover = activeMixCard.querySelector('.about-mix-cover--vinyl');
  flipInto(activeVinylIcon, cover); // send the vinyl back to its own card
  if(cover) cover.classList.remove('mix-vinyl-borrowed');

  setTimeout(() => { mixPlayer.hidden = true; }, 500);
  activeMixCard = null;
  activeVinylIcon = null;
}

document.querySelectorAll('.about-mix-card[data-mix]').forEach(card => {
  card.addEventListener('click', () => openMixPlayer(card));
});
mixPlayerClose.addEventListener('click', (e) => {
  e.stopPropagation();
  closeMixPlayer();
});
document.getElementById('mix-player-backdrop').addEventListener('click', () => {
  if(!mixPlayer.classList.contains('playing')) closeMixPlayer();
});
mixPlayerVinylSlot.addEventListener('click', () => {
  if(!mixPlayer.classList.contains('playing')) startMixPlayback();
});
mixAudio.addEventListener('ended', () => closeMixPlayer());

/* audio-reactive border on the mix player overlay itself — identical
   peak-of-bass-bins formula to the DJing section's border, but no idle
   sweep: holds at 0 whenever nothing is actually playing. */
const reactMixBorder = makeBorderReactor();
(function renderMixBorder(){
  requestAnimationFrame(renderMixBorder);
  const l = (mixAudioGraph && !mixAudio.paused)
    ? reactMixBorder(mixAudioGraph.analyser, mixAudioGraph.data)
    : 0;
  mixPlayer.style.setProperty('--mix-border-w', `${(l * 22).toFixed(2)}px`);
  mixPlayer.style.setProperty('--mix-border-a', Math.min(1, l * 0.95).toFixed(2));
  mixPlayer.style.setProperty('--mix-glow', `${(l * 130).toFixed(1)}px`);
})();

/* Objectify case-study viewer — clicking that project's own thumbnail
   FLIP-moves the real <img> (not a clone, so it can go back to the exact
   gallery slot on close) into #objectify-viewer-hero, then ~700ms later
   the hero shrinks and two real, interactive point-cloud viewers fade in
   below it, built lazily (only the first time this actually opens, and
   only once the container has real size — see createPlyViewer below). */
const objectifyPiece = document.getElementById('objectify-piece');
const objectifyViewer = document.getElementById('objectify-viewer');
const objectifyHero = document.getElementById('objectify-viewer-hero');
const objectifyClose = document.getElementById('objectify-viewer-close');
const objectifyBackdrop = document.getElementById('objectify-viewer-backdrop');

let objectifyActiveImg = null;
let objectifyViewersReady = false;

function openObjectifyViewer(){
  if(!objectifyPiece || objectifyActiveImg) return;
  const img = objectifyPiece.querySelector('.piece-media img');
  if(!img) return;
  objectifyActiveImg = img;

  objectifyViewer.hidden = false;
  objectifyViewer.classList.remove('revealed');
  flipInto(img, objectifyHero);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => objectifyViewer.classList.add('opened'));
  });

  setTimeout(() => {
    objectifyViewer.classList.add('revealed');
    if(!objectifyViewersReady){
      objectifyViewersReady = true;
      createPlyViewer(document.getElementById('objectify-canvas-test'), 'assets/projects/final_sphere.ply', { color: 0xffffff });
      createPlyViewer(document.getElementById('objectify-canvas-final'), 'assets/projects/test_sphere_cleaned.ply', { color: 0x9a9a9a });
    }
  }, 700);
}

function closeObjectifyViewer(){
  if(!objectifyActiveImg) return;
  objectifyViewer.classList.remove('opened', 'revealed');
  const cover = objectifyPiece.querySelector('.piece-media');
  flipInto(objectifyActiveImg, cover);
  objectifyActiveImg = null;
  setTimeout(() => { objectifyViewer.hidden = true; }, 600);
}

if(objectifyPiece){
  objectifyPiece.addEventListener('click', openObjectifyViewer);
  objectifyClose.addEventListener('click', (e) => { e.stopPropagation(); closeObjectifyViewer(); });
  objectifyBackdrop.addEventListener('click', closeObjectifyViewer);
}

/* a real, orbit-draggable 3d point-cloud/mesh viewer for one .ply file —
   used for both the early test scan and the cleaned-up final result.
   Requires THREE + THREE.PLYLoader + THREE.OrbitControls (loaded from
   CDN in index.html, before js/script.js). Only ever called once its
   container is actually visible and sized (see openObjectifyViewer
   above) — constructing a WebGL context inside a still-hidden element
   has permanently corrupted the canvas on some GPUs elsewhere on this
   site, so this sidesteps that entirely rather than trying to recover
   from it. */
function createPlyViewer(container, plyUrl, opts){
  if(typeof THREE === 'undefined' || !THREE.PLYLoader || !THREE.OrbitControls || !container) return null;
  opts = opts || {};

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 100);
  camera.position.set(0, 0, 2.6);

  scene.add(new THREE.AmbientLight(0xffffff, 0.65));
  const key = new THREE.DirectionalLight(0xffffff, 0.9);
  key.position.set(2, 3, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x88aaff, 0.4);
  rim.position.set(-3, -1, -2);
  scene.add(rim);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.minDistance = 1;
  controls.maxDistance = 6;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 1.2;
  controls.addEventListener('start', () => { controls.autoRotate = false; });

  function resize(){
    const w = container.clientWidth;
    const h = container.clientHeight;
    if(!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  new ResizeObserver(resize).observe(container);

  new THREE.PLYLoader().load(plyUrl, geometry => {
    geometry.computeVertexNormals();
    geometry.center();
    geometry.computeBoundingSphere();
    const radius = (geometry.boundingSphere && geometry.boundingSphere.radius) || 1;

    const hasColor = !!geometry.getAttribute('color');
    const material = new THREE.MeshStandardMaterial({
      color: opts.color || 0xffffff,
      vertexColors: hasColor,
      roughness: 0.65,
      metalness: 0.05,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.scale.setScalar(0.85 / radius);
    scene.add(mesh);
  });

  function tick(){
    requestAnimationFrame(tick);
    controls.update();
    renderer.render(scene, camera);
  }
  tick();

  return { resize };
}

/* Reusable project cover → demo video viewer — the same choreography as
   the Objectify viewer above, generalized: any .piece marked
   data-video-piece with a data-demo-src gets this automatically, no
   per-project JS needed. Clicking the cover FLIP-moves the real <img>
   (not a clone) into #piece-viewer-hero, then ~700ms later shrinks it
   toward the top (max-height transition, so the flex column simply
   re-centers around it) while the demo video fades in below and starts
   playing. Closing pauses the video and FLIPs the image back into the
   exact gallery card it came from. */
const pieceViewer = document.getElementById('piece-viewer');
const pieceViewerHero = document.getElementById('piece-viewer-hero');
const pieceViewerDemo = document.getElementById('piece-viewer-demo');
const pieceViewerVideo = document.getElementById('piece-viewer-video');
const pieceViewerClose = document.getElementById('piece-viewer-close');
const pieceViewerBackdrop = document.getElementById('piece-viewer-backdrop');
const pieceViewerVideoControls = document.getElementById('piece-viewer-video-controls');
const pieceViewerVideoToggle = document.getElementById('piece-viewer-video-toggle');
const pieceViewerVideoSeek = document.getElementById('piece-viewer-video-seek');

/* seekable scrub bar for the demo video, same pattern as the lightbox's —
   wired once since pieceViewerVideo is a real static element (never
   cloned), unlike the lightbox's per-open clone. */
const syncPieceViewerToggle = () => { pieceViewerVideoToggle.textContent = pieceViewerVideo.paused ? '▶' : '❚❚'; };
pieceViewerVideo.addEventListener('play', syncPieceViewerToggle);
pieceViewerVideo.addEventListener('pause', syncPieceViewerToggle);
pieceViewerVideoToggle.addEventListener('click', () => {
  if(pieceViewerVideo.paused) pieceViewerVideo.play().catch(() => {});
  else pieceViewerVideo.pause();
});
pieceViewerVideo.addEventListener('loadedmetadata', () => {
  if(pieceViewerVideo.duration) pieceViewerVideoSeek.max = pieceViewerVideo.duration;
});
pieceViewerVideo.addEventListener('timeupdate', () => {
  if(!pieceViewerVideo.duration || pieceViewerVideoSeek.matches(':active')) return;
  pieceViewerVideoSeek.value = pieceViewerVideo.currentTime;
});
pieceViewerVideoSeek.addEventListener('input', () => { pieceViewerVideo.currentTime = pieceViewerVideoSeek.value; });

let pieceViewerControlsIdleTimer;
function showPieceViewerVideoControls(){
  pieceViewerVideoControls.classList.remove('idle');
  clearTimeout(pieceViewerControlsIdleTimer);
  pieceViewerControlsIdleTimer = setTimeout(() => {
    pieceViewerVideoControls.classList.add('idle');
  }, 2000);
}
pieceViewerDemo.addEventListener('mousemove', showPieceViewerVideoControls);
pieceViewerDemo.addEventListener('mouseenter', showPieceViewerVideoControls);

let pieceViewerActiveImg = null;
let pieceViewerActivePiece = null;

function openPieceViewer(piece){
  if(pieceViewerActiveImg) return; // one at a time
  const img = piece.querySelector('.piece-media img');
  if(!img) return;
  pieceViewerActivePiece = piece;
  pieceViewerActiveImg = img;

  pieceViewer.hidden = false;
  pieceViewer.classList.remove('revealed');
  flipInto(img, pieceViewerHero);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => pieceViewer.classList.add('opened'));
  });

  setTimeout(() => {
    pieceViewer.classList.add('revealed');
    const src = piece.dataset.demoSrc;
    if(src){
      pieceViewerVideo.src = src;
      pieceViewerVideo.currentTime = 0;
      pieceViewerVideo.play().catch(() => {}); // triggers the generic ducking hook if this clip ever has real audio
      pieceViewerVideoSeek.value = 0;
      showPieceViewerVideoControls(); // visible on open, then the usual 2s idle timer takes over
    }
  }, 700);
}

function closePieceViewer(){
  if(!pieceViewerActiveImg) return;
  pieceViewer.classList.remove('opened', 'revealed');
  pieceViewerVideo.pause(); // fires 'pause' — resumes background music via the generic ducking hook, if it was ever ducked
  clearTimeout(pieceViewerControlsIdleTimer);
  pieceViewerVideoControls.classList.remove('idle');
  const cover = pieceViewerActivePiece.querySelector('.piece-media');
  flipInto(pieceViewerActiveImg, cover);
  pieceViewerActiveImg = null;
  pieceViewerActivePiece = null;
  setTimeout(() => {
    pieceViewer.hidden = true;
    pieceViewerVideo.removeAttribute('src');
    pieceViewerVideo.load();
  }, 600);
}

document.querySelectorAll('.piece[data-video-piece]').forEach(piece => {
  piece.addEventListener('click', () => openPieceViewer(piece));
});
pieceViewerClose.addEventListener('click', (e) => { e.stopPropagation(); closePieceViewer(); });
pieceViewerBackdrop.addEventListener('click', closePieceViewer);
