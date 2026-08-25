function showPage(id){
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');
  document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
  const navLink = document.querySelector('nav a[data-page="'+id+'"]');
  if(navLink) navLink.classList.add('active');
  window.scrollTo(0,0);
}

const tlObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting) entry.target.classList.add('in-view');
  });
}, { threshold: 0.3 });

document.querySelectorAll('.tl-item').forEach(item => tlObserver.observe(item));

/* music gate */
(function(){
  const gate = document.getElementById('music-gate');
  const audio = document.getElementById('bg-audio');
  const toggle = document.getElementById('audio-toggle');
  const skipBtn = document.getElementById('gate-skip');

  function enterSite(src, title){
    if(src){
      audio.src = src;
      audio.volume = 0.6;
      audio.play().catch(() => {});
      toggle.hidden = false;
      toggle.title = 'playing: ' + title;
    }
    sessionStorage.setItem('gate-passed', '1');
    gate.classList.add('hidden');
    setTimeout(() => { gate.hidden = true; }, 500);
  }

  document.querySelectorAll('.gate-track').forEach(btn => {
    btn.addEventListener('click', () => {
      enterSite(btn.dataset.src, btn.dataset.title);
    });
  });

  skipBtn.addEventListener('click', () => enterSite(null, null));

  toggle.addEventListener('click', () => {
    if(audio.paused){
      audio.play().catch(() => {});
      toggle.classList.remove('muted');
    } else {
      audio.pause();
      toggle.classList.add('muted');
    }
  });

  if(sessionStorage.getItem('gate-passed') === '1'){
    gate.hidden = true;
  }
})();
