function showPage(id){
  const current = document.querySelector('.page.active');
  const next = document.getElementById('page-' + id);
  if(current === next) return;

  document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
  const navLink = document.querySelector('nav a[data-page="'+id+'"]');
  if(navLink) navLink.classList.add('active');

  if(current){
    current.classList.add('leaving');
    current.classList.remove('active');
    setTimeout(() => current.classList.remove('leaving'), 320);
  }
  next.classList.add('active');
  window.scrollTo(0,0);
  window.dispatchEvent(new Event('resize'));

  if(id === 'about' && typeof maybeShowMusicGate === 'function') maybeShowMusicGate();
}

const tlObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting) entry.target.classList.add('in-view');
  });
}, { threshold: 0.3 });

document.querySelectorAll('.tl-item').forEach(item => tlObserver.observe(item));

const interestObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting) entry.target.classList.add('in-view');
  });
}, { threshold: 0.2 });

document.querySelectorAll('.interest').forEach(item => interestObserver.observe(item));

/* music gate — triggers only the first time About is opened this session */
const gate = document.getElementById('music-gate');
const audio = document.getElementById('bg-audio');
const skipBtn = document.getElementById('gate-skip');
const miniPlayer = document.getElementById('mini-player');
const miniToggle = document.getElementById('mini-player-toggle');
const miniTitle = document.getElementById('mini-player-title');

function maybeShowMusicGate(){
  if(sessionStorage.getItem('gate-decided') === '1') return;
  gate.hidden = false;
  gate.classList.add('fading');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => gate.classList.remove('fading'));
  });
}

function closeGate(){
  gate.classList.add('fading');
  setTimeout(() => { gate.hidden = true; }, 400);
  sessionStorage.setItem('gate-decided', '1');
}

function showMiniPlayer(title){
  miniTitle.textContent = title;
  miniToggle.textContent = '❚❚';
  miniPlayer.hidden = false;
  requestAnimationFrame(() => miniPlayer.classList.add('showing'));
}

function enterSite(src, title){
  if(src){
    audio.src = src;
    audio.volume = 0.6;
    audio.play().catch(() => {});
    showMiniPlayer(title);
  }
  closeGate();
}

document.querySelectorAll('.gate-track').forEach(btn => {
  btn.addEventListener('click', () => {
    enterSite(btn.dataset.src, btn.dataset.title);
  });
});

skipBtn.addEventListener('click', () => enterSite(null, null));

miniToggle.addEventListener('click', () => {
  if(audio.paused){
    audio.play().catch(() => {});
    miniToggle.textContent = '❚❚';
  } else {
    audio.pause();
    miniToggle.textContent = '▶';
  }
});
