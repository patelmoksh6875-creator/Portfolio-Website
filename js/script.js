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
  if(id === 'about'){
    if(typeof updateAboutVinylSpin === 'function') updateAboutVinylSpin();
    if(typeof ensureDjingVinyl === 'function') ensureDjingVinyl();
  }
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

function closeGate(){
  gate.classList.add('fading');
  setTimeout(() => { gate.hidden = true; }, 700);
  sessionStorage.setItem('gate-decided', '1');
}

/* mini player — pill by default, expands into a square now-playing panel
   with its own prev/play/next so the track can be changed after entering */
let currentTrackIndex = 0;

function playTrackAtIndex(i, autoplay){
  i = ((i % gateCards.length) + gateCards.length) % gateCards.length;
  currentTrackIndex = i;
  const card = gateCards[i];
  audio.src = card.dataset.src;
  audio.currentTime = 0;
  audio.volume = 0.6;
  audio.loop = true;
  if(autoplay) audio.play().catch(() => {});
  updateMiniPlayerInfo();
}

function updateMiniPlayerInfo(){
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

function toggleMiniPlayback(){
  if(audio.paused) audio.play().catch(() => {});
  else audio.pause();
  updateMiniPlayerInfo();
}

skipBtn.addEventListener('click', () => closeGate());

miniPlayerPill.addEventListener('click', () => miniPlayer.classList.add('expanded'));
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

function openLightbox(piece){
  const media = piece.querySelector('.piece-media').cloneNode(true);
  media.querySelectorAll('video').forEach(v => { v.removeAttribute('loop'); v.setAttribute('controls', ''); });
  lightboxMedia.innerHTML = '';
  lightboxMedia.appendChild(media);
  lightboxTitle.textContent = piece.querySelector('.piece-title').textContent;
  lightboxMedium.textContent = piece.querySelector('.piece-medium').textContent;
  lightboxDesc.textContent = piece.querySelector('.piece-desc').textContent;
  lightbox.hidden = false;
  requestAnimationFrame(() => lightbox.classList.add('showing'));
}

function closeLightbox(){
  lightbox.classList.remove('showing');
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

/* about page — every category's ".about-spin" element (the CD, the lens,
   etc.) turns in real 3D (rotateY, with .about-spin-wrap's CSS perspective
   giving it actual depth/foreshortening) proportionally to its own scroll
   position, only while the about page is active. Class-based so any number
   of categories can each have one without extra wiring. */
const aboutSpinEls = document.querySelectorAll('.about-spin');

function updateAboutVinylSpin(){
  if(!aboutSpinEls.length) return;
  const aboutPage = document.getElementById('page-about');
  if(!aboutPage.classList.contains('active')) return;
  aboutSpinEls.forEach(el => {
    const rect = el.getBoundingClientRect();
    const total = rect.height + window.innerHeight;
    const progress = Math.min(1, Math.max(0, (window.innerHeight - rect.top) / total));
    el.style.transform = `rotateY(${progress * 720}deg)`;
  });
}

let aboutVinylRaf;
window.addEventListener('scroll', () => {
  cancelAnimationFrame(aboutVinylRaf);
  aboutVinylRaf = requestAnimationFrame(updateAboutVinylSpin);
});
updateAboutVinylSpin();

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

/* about page — djing hero vinyl, rendered with Three.js (a real spinning
   3D disc, not a photo). Built procedurally: a dark cylinder body plus a
   canvas-generated groove/label texture on its top face. Exposes a single
   continuous rotation that starts on click and never stops. */
function createAboutVinyl(mount){
  if(typeof THREE === 'undefined' || !mount) return null;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  mount.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 20);
  // dead-on overhead view (not tilted) — a flat disc viewed perfectly
  // perpendicular to its face renders as a true circle; any tilt turns it
  // into an ellipse, which is what "make it a circle" was pointing at
  camera.up.set(0, 0, -1); // avoid the degenerate lookAt when position is directly above the target
  camera.position.set(0, 7.6, 0); // pulled back enough that the disc reads as a circle with margin, not a square that fills every corner
  camera.lookAt(0, 0, 0);

  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const key = new THREE.DirectionalLight(0xffffff, 1.1);
  key.position.set(2.5, 4, 3);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x8fb0ff, 0.6);
  rim.position.set(-3, -1, -2);
  scene.add(rim);

  // procedural groove + label texture — drawn on a canvas at runtime, not a shipped image
  const texCanvas = document.createElement('canvas');
  texCanvas.width = texCanvas.height = 1024;
  const tctx = texCanvas.getContext('2d');
  const c = 512;
  tctx.fillStyle = '#0a0a0a';
  tctx.fillRect(0, 0, 1024, 1024);
  tctx.strokeStyle = 'rgba(255,255,255,0.06)';
  for(let r = 500; r > 170; r -= 3.2){
    tctx.beginPath();
    tctx.arc(c, c, r, 0, Math.PI * 2);
    tctx.lineWidth = r % 12 < 1 ? 1.4 : 0.6;
    tctx.stroke();
  }
  const labelGrad = tctx.createRadialGradient(c, c, 0, c, c, 165);
  labelGrad.addColorStop(0, '#e8412c');
  labelGrad.addColorStop(1, '#a82815');
  tctx.fillStyle = labelGrad;
  tctx.beginPath();
  tctx.arc(c, c, 165, 0, Math.PI * 2);
  tctx.fill();
  tctx.fillStyle = 'rgba(255,255,255,0.9)';
  tctx.font = '700 30px Arial, Helvetica, sans-serif';
  tctx.textAlign = 'center';
  tctx.fillText('MOKSH', c, c - 4);
  tctx.font = '400 14px Arial, Helvetica, sans-serif';
  tctx.fillStyle = 'rgba(255,255,255,0.7)';
  tctx.fillText('33⅓ RPM', c, c + 24);
  tctx.fillStyle = '#0a0a0a';
  tctx.beginPath();
  tctx.arc(c, c, 10, 0, Math.PI * 2);
  tctx.fill();
  const texture = new THREE.CanvasTexture(texCanvas);
  texture.anisotropy = 4;

  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(1.55, 1.55, 0.045, 96, 1, false),
    [
      new THREE.MeshStandardMaterial({ color: 0x0d0d0d, roughness: 0.45, metalness: 0.15 }),
      new THREE.MeshStandardMaterial({ map: texture, roughness: 0.35, metalness: 0.1 }),
      new THREE.MeshStandardMaterial({ color: 0x0d0d0d, roughness: 0.5, metalness: 0.1 }),
    ]
  );
  scene.add(body); // cylinder's flat caps already face up/down (local Y) — matches the top-down camera

  // fixed internal render resolution, set once, regardless of the mount's
  // current on-screen size (the big hero stage and the small docked slot
  // both use this same canvas element via CSS width/height:100%). Sizing
  // the renderer to the container's *live* size — 0px while it's still
  // hidden, then bigger once shown — was leaving the canvas permanently
  // blank on this machine's GPU, so the buffer size is now decoupled from
  // layout entirely: no ResizeObserver, no dependency on when the mount
  // becomes visible.
  const RENDER_SIZE = 640;
  renderer.setSize(RENDER_SIZE, RENDER_SIZE, false);
  camera.aspect = 1;
  camera.updateProjectionMatrix();

  let spinning = false;
  let idleAngle = 0;

  function tick(){
    requestAnimationFrame(tick);
    if(spinning){
      body.rotation.y += 0.028; // real continuous turntable spin, ~2.4s per rotation
    } else {
      idleAngle += 0.0015;
      body.rotation.y = Math.sin(idleAngle) * 0.12; // gentle idle sway before the click
    }
    renderer.render(scene, camera);
  }
  tick();

  return {
    startSpin(){ spinning = true; },
  };
}

/* the Three.js scene is created lazily, the first time the About page is
   actually shown — never while its ancestor is still display:none. Some
   GPUs/browsers permanently degrade a WebGL context that's constructed
   inside a hidden subtree (even if it's resized to the correct size once
   visible), so the fix is to never construct it hidden in the first
   place, not just to defer the resize. */
let djingHeroVinyl = null;
function ensureDjingVinyl(){
  if(djingHeroVinyl) return djingHeroVinyl;
  djingHeroVinyl = createAboutVinyl(document.getElementById('djing-hero-vinyl'));
  return djingHeroVinyl;
}

/* about page — physically move the vinyl mount (canvas and all) from the
   hero into its resting slot beside "behind the decks", using a FLIP
   animation: read its current on-screen box, reparent it (which snaps it
   to the new box instantly), then animate FROM the old box back to
   identity. This lands it in real grid layout next to the bio text — it
   can never overlap the copy or the mix grid below, unlike the old
   position:absolute + calc(vw) guess. The WebGL canvas keeps rendering
   (and keeps spinning) the whole time; only a CSS transform moves it. */
function dockVinyl(mount, dock){
  if(!mount || !dock) return;
  const first = mount.getBoundingClientRect();
  dock.appendChild(mount);
  const last = mount.getBoundingClientRect();
  const dx = (first.left + first.width / 2) - (last.left + last.width / 2);
  const dy = (first.top + first.height / 2) - (last.top + last.height / 2);
  const scale = first.width / last.width;
  mount.style.transformOrigin = 'center center';
  mount.style.transition = 'none';
  mount.style.transform = `translate(${dx}px, ${dy}px) scale(${scale})`;
  mount.offsetWidth; // force reflow so the jump above applies before the transition starts
  mount.style.transition = 'transform 1.1s var(--ease)';
  mount.style.transform = 'none';
}

/* about page — djing hero reveal: click the giant vinyl once, it starts
   spinning for real and docks beside the bio text while the mix gallery
   slides up. This handler flips the .djing-opened state (CSS handles the
   hero's own collapse and the content reveal), runs the FLIP dock above,
   and starts the audio graph (a genuine user gesture, required for
   autoplay policy). */
const djingHeroBtn = document.getElementById('djing-hero-btn');
const djingCategory = djingHeroBtn ? djingHeroBtn.closest('.about-category') : null;
if(djingHeroBtn && djingCategory){
  djingHeroBtn.addEventListener('click', () => {
    if(djingCategory.classList.contains('djing-opened')) return; // one-shot
    const vinyl = ensureDjingVinyl();
    if(vinyl) vinyl.startSpin();
    dockVinyl(document.getElementById('djing-hero-vinyl'), document.getElementById('djing-vinyl-dock'));
    djingCategory.classList.add('djing-opened');
    initAboutAudioGraph();
  });
}

/* about page — audio-reactive border around the whole DJing section. No
   per-orb DOM elements: just three CSS custom properties re-written on the
   section every frame, read by .about-djing-border's box-shadow. Reacts to
   whatever's playing on the shared #bg-audio element (or idles gently).
   Uses a fast-attack/slow-release envelope on the bass/low-mid bins (where
   kicks and snares live) instead of an all-bin average, so it visibly
   punches on the beat instead of just gently wobbling. */
if(djingCategory){
  let borderClock = 0;
  let borderLevel = 0;
  (function renderDjingBorder(){
    requestAnimationFrame(renderDjingBorder);
    const playing = audioGraph && audio && !audio.paused;
    let target;
    if(playing){
      audioGraph.analyser.getByteFrequencyData(audioGraph.data);
      const bassCount = Math.max(1, Math.floor(audioGraph.data.length * 0.35));
      let peak = 0;
      for(let i = 0; i < bassCount; i++) peak = Math.max(peak, audioGraph.data[i]);
      target = peak / 255; // 0..1
      // fast attack (snap up on a hit), slower release (falls back down between beats)
      borderLevel = target > borderLevel ? target : borderLevel * 0.82 + target * 0.18;
    } else {
      borderClock += 0.035;
      borderLevel = (Math.sin(borderClock) + 1) / 2 * 0.35; // gentle idle pulse, never fully off
    }
    djingCategory.style.setProperty('--djing-border-w', `${(2 + borderLevel * 9).toFixed(2)}px`);
    djingCategory.style.setProperty('--djing-border-a', (0.15 + borderLevel * 0.8).toFixed(2));
    djingCategory.style.setProperty('--djing-glow', `${(6 + borderLevel * 70).toFixed(1)}px`);
  })();
}
