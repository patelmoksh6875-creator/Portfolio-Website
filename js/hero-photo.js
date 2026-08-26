(function(){
  const BAYER4 = [
    0, 8, 2, 10,
    12, 4, 14, 6,
    3, 11, 1, 9,
    15, 7, 13, 5
  ];

  // subtle ordered dithering — quantizes into many levels and nudges each
  // pixel by a small Bayer-matrix threshold, so it reads as texture, not noise
  function ditherSubtle(imageData, levels, strength){
    const data = imageData.data;
    const w = imageData.width;
    for(let y = 0; y < imageData.height; y++){
      for(let x = 0; x < w; x++){
        const i = (y * w + x) * 4;
        const threshold = (BAYER4[(y % 4) * 4 + (x % 4)] / 16 - 0.5) * strength;
        for(let c = 0; c < 3; c++){
          let v = data[i + c] / 255 + threshold;
          v = Math.round(v * levels) / levels;
          data[i + c] = Math.max(0, Math.min(255, v * 255));
        }
      }
    }
    return imageData;
  }

  function initHeroPhoto(){
    const panel = document.getElementById('hero-panel');
    const canvas = document.getElementById('hero-photo');
    if(!panel || !canvas) return;
    const ctx = canvas.getContext('2d');

    const img = new Image();
    img.src = 'assets/hero/mountain-forest.jpg';
    img.onload = () => {
      function draw(){
        const w = panel.clientWidth || 1;
        const h = panel.clientHeight || 1;
        canvas.width = w;
        canvas.height = h;

        const scale = Math.max(w / img.width, h / img.height);
        const dw = img.width * scale;
        const dh = img.height * scale;
        const dx = (w - dw) / 2;
        const dy = (h - dh) / 2;
        ctx.drawImage(img, dx, dy, dw, dh);

        const frame = ctx.getImageData(0, 0, w, h);
        ditherSubtle(frame, 18, 0.05);
        ctx.putImageData(frame, 0, 0);
      }
      draw();
      window.addEventListener('resize', draw);
    };
  }

  // staggered "glass block" overlay — an ascending staircase of translucent
  // rectangles, each pass offset so the blocks read as stacked, not gridded
  function initGlassGrid(){
    const grid = document.getElementById('hero-glass-grid');
    if(!grid) return;

    const tones = [
      'rgba(255,255,255,0.24)',
      'rgba(255,255,255,0.13)',
      'rgba(20,30,28,0.14)',
      'rgba(70,110,100,0.18)',
      'rgba(255,255,255,0.32)'
    ];

    const cols = 10;
    const rows = 7;
    let seed = 11;
    function rand(){
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    }

    function addBlock(col, rowStart, colSpan, rowSpan, tone){
      const block = document.createElement('div');
      block.className = 'glass-block';
      block.style.left = (col / cols) * 100 + '%';
      block.style.width = (colSpan / cols) * 100 + '%';
      block.style.top = Math.max(0, rowStart / rows) * 100 + '%';
      block.style.height = (rowSpan / rows) * 100 + '%';
      block.style.background = tone;
      grid.appendChild(block);
    }

    // pass 1: an ascending staircase climbing from bottom-left to upper-right
    let row = rows - 1;
    for(let col = 0; col < cols - 2; col += 1 + Math.floor(rand() * 2)){
      const rowSpan = 1 + Math.floor(rand() * 2);
      addBlock(col, row - rowSpan + 1, 2, rowSpan, tones[Math.floor(rand() * tones.length)]);
      if(rand() > 0.35) row -= 1;
    }

    // pass 2: sparser overlapping accents for depth
    for(let i = 0; i < 6; i++){
      const col = Math.floor(rand() * (cols - 2));
      const rowStart = Math.floor(rand() * (rows - 1));
      addBlock(col, rowStart, 1 + Math.floor(rand() * 2), 1, tones[Math.floor(rand() * tones.length)]);
    }
  }

  initHeroPhoto();
  initGlassGrid();
})();
