import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

function easeOutCubic(t){ return 1 - Math.pow(1 - t, 3); }
function easeInOutCubic(t){ return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

function v(x, y, z){ return new THREE.Vector3(x, y, z); }

// each path: establishing shot -> push in -> travel through/inside the object -> slow turn to the side -> settle
const PATHS = {
  camera: [
    { t: 0,    pos: v(3, 2.4, 11),      look: v(0.2, -0.02, 2.1) },
    { t: 0.22, pos: v(0.3, 0.15, 3.1),  look: v(0.2, -0.02, 2.1) },
    { t: 0.48, pos: v(0.15, -0.05, 2.55), look: v(0.15, -0.05, 4) },
    { t: 0.75, pos: v(1.7, 0.45, 1.0),  look: v(0, 0, 0) },
    { t: 1,    pos: v(1.1, 0.5, 1.7),   look: v(0.1, 0, 0.3) }
  ],
  mixer: [
    { t: 0,    pos: v(3, 2.4, 11),    look: v(0, 0.32, 0.4) },
    { t: 0.22, pos: v(0, 1.6, 2.6),   look: v(0, 0.32, 0.4) },
    { t: 0.48, pos: v(0, 0.5, 0.35),  look: v(0, 0.3, -0.6) },
    { t: 0.75, pos: v(2.5, 0.95, 1.0), look: v(0, 0.25, 0) },
    { t: 1,    pos: v(1.8, 1.1, 1.7),  look: v(0, 0.28, 0.2) }
  ],
  canvas: [
    { t: 0,    pos: v(3, 2.4, 11),     look: v(0, 0, 0.5) },
    { t: 0.22, pos: v(0.4, 0.2, 2.4),  look: v(0, 0, 0.5) },
    { t: 0.48, pos: v(0.3, 0.1, -0.6), look: v(0.2, -0.1, -1.0) },
    { t: 0.75, pos: v(2.1, 0.65, 0.4), look: v(0, 0, 0) },
    { t: 1,    pos: v(1.5, 0.7, 1.1),  look: v(0.1, 0, 0.3) }
  ]
};

function sampleCameraPath(kfs, t){
  for(let i = 0; i < kfs.length - 1; i++){
    const a = kfs[i], b = kfs[i + 1];
    if(t >= a.t && t <= b.t){
      const localT = (t - a.t) / (b.t - a.t || 1);
      const eased = easeInOutCubic(localT);
      return {
        pos: new THREE.Vector3().lerpVectors(a.pos, b.pos, eased),
        look: new THREE.Vector3().lerpVectors(a.look, b.look, eased)
      };
    }
  }
  const last = kfs[kfs.length - 1];
  return { pos: last.pos.clone(), look: last.look.clone() };
}

function buildCamera(accent){
  const group = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x201f22, roughness: 0.55, metalness: 0.55 });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0x0e0e10, roughness: 0.3, metalness: 0.7 });
  const gripMat = new THREE.MeshStandardMaterial({ color: 0x151517, roughness: 0.85, metalness: 0.1 });
  const accentMat = new THREE.MeshStandardMaterial({ color: accent, roughness: 0.2, metalness: 0.3, emissive: accent, emissiveIntensity: 0.25 });
  const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x0a1520, roughness: 0.05, metalness: 0.1, clearcoat: 1, transmission: 0.3, thickness: 0.2 });
  const screenMat = new THREE.MeshStandardMaterial({ color: 0x0a0f14, roughness: 0.3, metalness: 0.1, emissive: 0x0f2030, emissiveIntensity: 0.4 });

  // main body — rounded box for a real camera silhouette
  const body = new THREE.Mesh(new RoundedBoxGeometry(2.3, 1.4, 1.2, 4, 0.12), bodyMat);
  group.add(body);

  // top plate, slightly narrower, sits above body
  const topPlate = new THREE.Mesh(new RoundedBoxGeometry(2.3, 0.18, 1.0, 3, 0.06), trimMat);
  topPlate.position.y = 0.79;
  group.add(topPlate);

  // pentaprism / viewfinder hump
  const hump = new THREE.Mesh(new RoundedBoxGeometry(0.7, 0.4, 0.7, 3, 0.08), bodyMat);
  hump.position.set(-0.1, 1.05, -0.05);
  group.add(hump);
  const eyepiece = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.12, 16), trimMat);
  eyepiece.rotation.x = Math.PI / 2;
  eyepiece.position.set(-0.1, 1.05, -0.42);
  group.add(eyepiece);

  // shutter button + mode dial, top right
  const shutter = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.09, 20), accentMat);
  shutter.position.set(0.85, 0.9, 0.25);
  group.add(shutter);
  const modeDial = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.07, 24), trimMat);
  modeDial.position.set(0.55, 0.88, -0.15);
  group.add(modeDial);
  for(let i = 0; i < 10; i++){
    const tick = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.03, 0.015), accentMat);
    const a = (i / 10) * Math.PI * 2;
    tick.position.set(0.55 + Math.sin(a) * 0.22, 0.92, -0.15 + Math.cos(a) * 0.22);
    group.add(tick);
  }

  // rear LCD screen
  const lcd = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.6, 0.02), screenMat);
  lcd.position.set(-0.55, 0.05, -0.61);
  group.add(lcd);

  // lens mount ring
  const mount = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.06, 12, 32), trimMat);
  mount.rotation.y = Math.PI / 2;
  mount.position.set(0.15, -0.05, 0.6);
  group.add(mount);

  // lens barrel — layered rings for zoom/focus grooves
  const barrelSections = [
    { r: 0.46, len: 0.35, z: 0.85, mat: bodyMat },
    { r: 0.44, len: 0.3, z: 1.18, mat: trimMat },
    { r: 0.47, len: 0.4, z: 1.5, mat: bodyMat },
    { r: 0.43, len: 0.22, z: 1.78, mat: trimMat }
  ];
  barrelSections.forEach(s => {
    const seg = new THREE.Mesh(new THREE.CylinderGeometry(s.r, s.r, s.len, 28), s.mat);
    seg.rotation.x = Math.PI / 2;
    seg.position.set(0.15, -0.05, s.z);
    group.add(seg);
  });
  // grip ridges on the zoom ring for texture
  for(let i = 0; i < 16; i++){
    const a = (i / 16) * Math.PI * 2;
    const ridge = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 0.28), trimMat);
    ridge.position.set(0.15 + Math.sin(a) * 0.47, -0.05 + Math.cos(a) * 0.47, 1.5);
    ridge.rotation.z = a;
    group.add(ridge);
  }

  const hood = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.43, 0.22, 28, 1, true), trimMat);
  hood.rotation.x = Math.PI / 2;
  hood.position.set(0.15, -0.05, 2.0);
  group.add(hood);

  const lensGlass = new THREE.Mesh(new THREE.CircleGeometry(0.4, 32), glassMat);
  lensGlass.position.set(0.15, -0.05, 2.1);
  group.add(lensGlass);
  const lensReflection = new THREE.Mesh(new THREE.RingGeometry(0.1, 0.16, 24), accentMat);
  lensReflection.position.set(0.28, 0.08, 2.11);
  group.add(lensReflection);

  // grip with thumb ridge
  const grip = new THREE.Mesh(new RoundedBoxGeometry(0.42, 1.3, 0.7, 3, 0.1), gripMat);
  grip.position.set(1.28, -0.1, -0.05);
  group.add(grip);
  for(let i = 0; i < 4; i++){
    const ridge = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.06, 0.5), trimMat);
    ridge.position.set(1.28, -0.4 + i * 0.22, -0.05);
    group.add(ridge);
  }

  // strap lugs
  [-1.15, 1.4].forEach(x => {
    const lug = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.02, 8, 16), trimMat);
    lug.rotation.y = Math.PI / 2;
    lug.position.set(x, 0.5, 0.55);
    group.add(lug);
  });

  return { group, focus: new THREE.Vector3(0.2, -0.02, 2.1) };
}

function buildMixer(accent){
  const group = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x18181d, roughness: 0.55, metalness: 0.35 });
  const panelMat = new THREE.MeshStandardMaterial({ color: 0x232329, roughness: 0.45, metalness: 0.3 });
  const platterMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0d, roughness: 0.35, metalness: 0.6 });
  const vinylGrooveMat = new THREE.MeshStandardMaterial({ color: 0x1c1c22, roughness: 0.6, metalness: 0.2 });
  const accentMat = new THREE.MeshStandardMaterial({ color: accent, roughness: 0.2, metalness: 0.3, emissive: accent, emissiveIntensity: 0.35 });
  const screenMat = new THREE.MeshStandardMaterial({ color: 0x081018, roughness: 0.3, emissive: 0x0f2a2a, emissiveIntensity: 0.5 });
  const knobMat = new THREE.MeshStandardMaterial({ color: 0x3a3a42, roughness: 0.4, metalness: 0.4 });

  // deck base with beveled edge
  const base = new THREE.Mesh(new RoundedBoxGeometry(4.6, 0.35, 2.0, 3, 0.1), bodyMat);
  group.add(base);

  const discs = [];
  [-1.7, 1.7].forEach(x => {
    const platter = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.06, 48), platterMat);
    platter.position.set(x, 0.19, 0);
    group.add(platter);

    // concentric grooves for a real vinyl look
    for(let r = 0.2; r < 0.8; r += 0.09){
      const groove = new THREE.Mesh(new THREE.TorusGeometry(r, 0.006, 6, 48), vinylGrooveMat);
      groove.rotation.x = Math.PI / 2;
      groove.position.set(x, 0.225, 0);
      group.add(groove);
    }

    const label = new THREE.Mesh(new THREE.CircleGeometry(0.24, 32), accentMat);
    label.rotation.x = -Math.PI / 2;
    label.position.set(x, 0.23, 0);
    group.add(label);

    const spindle = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.15, 12), knobMat);
    spindle.position.set(x, 0.27, 0);
    group.add(spindle);

    discs.push(platter);
  });

  // small info screens above each platter
  [-1.7, 1.7].forEach(x => {
    const screen = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.28, 0.03), screenMat);
    screen.position.set(x, 0.42, -0.85);
    screen.rotation.x = -0.35;
    group.add(screen);
  });

  // center mixer channel panel, raised slightly
  const centerPanel = new THREE.Mesh(new RoundedBoxGeometry(1.5, 0.1, 1.7, 2, 0.04), panelMat);
  centerPanel.position.set(0, 0.22, 0);
  group.add(centerPanel);

  // four channel strips: 3 EQ knobs + fader track + fader cap + LED meter
  for(let ch = 0; ch < 4; ch++){
    const x = -0.55 + ch * 0.37;
    for(let k = 0; k < 3; k++){
      const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.07, 16), knobMat);
      knob.position.set(x, 0.32, -0.55 + k * 0.28);
      group.add(knob);
      const indicator = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.05, 0.008), accentMat);
      indicator.position.set(x, 0.37, -0.55 + k * 0.28);
      group.add(indicator);
    }
    const track = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.02, 0.6), bodyMat);
    track.position.set(x, 0.28, 0.55);
    group.add(track);
    const faderCap = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.06, 0.16), ch % 2 === 0 ? accentMat : knobMat);
    faderCap.position.set(x, 0.3, 0.35 + ch * 0.05);
    group.add(faderCap);

    for(let m = 0; m < 5; m++){
      const led = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.03, 0.03), m > 3 ? new THREE.MeshStandardMaterial({ color: 0xff4d4d, emissive: 0xff4d4d, emissiveIntensity: 0.6 }) : accentMat);
      led.position.set(x, 0.45 + m * 0.05, -1.05);
      group.add(led);
    }
  }

  // crossfader
  const crossTrack = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.02, 0.06), bodyMat);
  crossTrack.position.set(0, 0.28, 0.85);
  group.add(crossTrack);
  const crossCap = new THREE.Mesh(new RoundedBoxGeometry(0.18, 0.07, 0.16, 2, 0.02), accentMat);
  crossCap.position.set(-0.1, 0.32, 0.85);
  group.add(crossCap);

  return { group, discs, focus: new THREE.Vector3(0, 0.32, 0.4) };
}

function buildCanvas(accent){
  const group = new THREE.Group();
  const accentMat = new THREE.MeshStandardMaterial({ color: accent, roughness: 0.3, metalness: 0.2, emissive: accent, emissiveIntensity: 0.2 });
  const paleMat = new THREE.MeshStandardMaterial({ color: 0xf5f3ff, roughness: 0.55, metalness: 0.05, side: THREE.DoubleSide });
  const violetMat = new THREE.MeshStandardMaterial({ color: 0x7c5cff, roughness: 0.35, metalness: 0.2 });
  const gridMat = new THREE.LineBasicMaterial({ color: 0xd8d2ff, transparent: true, opacity: 0.35 });
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x2a2640, roughness: 0.4, metalness: 0.4 });

  // main canvas plane with a real drawn-grid texture (line geometry, not a bitmap)
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 1.9), paleMat);
  group.add(plane);

  const gridPts = [];
  for(let x = -1.3; x <= 1.3; x += 0.26){
    gridPts.push(new THREE.Vector3(x, -0.9, 0.02), new THREE.Vector3(x, 0.9, 0.02));
  }
  for(let y = -0.85; y <= 0.85; y += 0.26){
    gridPts.push(new THREE.Vector3(-1.35, y, 0.02), new THREE.Vector3(1.35, y, 0.02));
  }
  const gridGeo = new THREE.BufferGeometry().setFromPoints(gridPts);
  group.add(new THREE.LineSegments(gridGeo, gridMat));

  // thin bezel frame around the canvas
  const frame = new THREE.Mesh(new THREE.RingGeometry(1.62, 1.68, 4), frameMat);
  frame.rotation.z = Math.PI / 4;
  frame.scale.set(1, 0.68, 1);
  frame.position.z = -0.03;
  group.add(frame);

  // stacked layer panels behind the canvas, offset like a design tool's layer stack
  const layers = [];
  for(let i = 0; i < 3; i++){
    const layer = new THREE.Mesh(
      new RoundedBoxGeometry(2.4 - i * 0.15, 1.5 - i * 0.1, 0.03, 2, 0.05),
      new THREE.MeshStandardMaterial({ color: 0x2a2640, roughness: 0.5, metalness: 0.2, transparent: true, opacity: 0.55 })
    );
    layer.position.set(0.3 + i * 0.12, -0.25 - i * 0.1, -0.4 - i * 0.35);
    group.add(layer);
    layers.push(layer);
  }

  // floating shape swatches — the "content" being designed
  const shapes = [
    { geo: new THREE.IcosahedronGeometry(0.28, 0), mat: accentMat, pos: [-0.75, 0.35, 0.5] },
    { geo: new THREE.TorusGeometry(0.24, 0.08, 12, 28), mat: violetMat, pos: [0.65, -0.25, 0.55] },
    { geo: new RoundedBoxGeometry(0.32, 0.32, 0.06, 2, 0.05), mat: paleMat, pos: [0.55, 0.4, 0.5] }
  ];
  const floaters = shapes.map(s => {
    const mesh = new THREE.Mesh(s.geo, s.mat);
    mesh.position.set(...s.pos);
    group.add(mesh);
    return mesh;
  });

  // pen/stylus tool hovering near the canvas
  const pen = new THREE.Group();
  const penBody = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.045, 0.5, 16), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.3 }));
  pen.add(penBody);
  const penTip = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.08, 16), accentMat);
  penTip.position.y = -0.29;
  pen.add(penTip);
  pen.rotation.z = -0.6;
  pen.position.set(-0.3, -0.15, 0.7);
  group.add(pen);

  // color swatches to the side
  const swatchColors = [accent, 0x7c5cff, 0xff5d8f, 0xffd166];
  const swatches = swatchColors.map((c, i) => {
    const dot = new THREE.Mesh(new THREE.CircleGeometry(0.08, 20), new THREE.MeshStandardMaterial({ color: c, roughness: 0.3, emissive: c, emissiveIntensity: 0.2 }));
    dot.position.set(-1.55, 0.6 - i * 0.24, 0.55);
    group.add(dot);
    return dot;
  });

  return { group, floaters: [...floaters, pen, ...swatches], focus: new THREE.Vector3(0, 0, 0.5) };
}

const BUILDERS = { camera: buildCamera, mixer: buildMixer, canvas: buildCanvas };

function initHero(el){
  const kind = el.dataset.scene;
  const canvas = el.querySelector('canvas');
  const heroSection = el.closest('.disc-hero');
  const copy = heroSection.querySelector('.disc-hero-copy');
  const accentHex = getComputedStyle(heroSection).getPropertyValue('--accent').trim() || '#f0ede6';
  const accent = new THREE.Color(accentHex);
  const path = PATHS[kind];

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0b0b12);
  scene.fog = new THREE.Fog(0x0b0b12, 6, 16);

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.copy(path[0].pos);

  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  const key = new THREE.PointLight(accent, 2.2, 20);
  key.position.set(3, 4, 5);
  scene.add(key);
  const rim = new THREE.PointLight(0xffffff, 0.8, 20);
  rim.position.set(-4, 2, -3);
  scene.add(rim);

  const built = BUILDERS[kind](accent);
  scene.add(built.group);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  function resize(){
    const w = el.clientWidth || 1;
    const h = el.clientHeight || 1;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  resize();
  window.addEventListener('resize', resize);

  let raf;
  let animStart = null;
  let revealed = false;
  const PATH_DURATION = 5200;
  let idleT = 0;
  const settled = path[path.length - 1];

  function animate(now){
    raf = requestAnimationFrame(animate);
    if(animStart === null) animStart = now;
    const elapsed = now - animStart;
    const t = Math.min(elapsed / PATH_DURATION, 1);

    if(t < 1){
      const { pos, look } = sampleCameraPath(path, t);
      camera.position.copy(pos);
      camera.lookAt(look);
    } else {
      idleT += 0.01;
      camera.position.set(
        settled.pos.x + Math.sin(idleT * 0.3) * 0.22,
        settled.pos.y + Math.sin(idleT * 0.2) * 0.06,
        settled.pos.z + Math.cos(idleT * 0.3) * 0.22
      );
      camera.lookAt(settled.look);
      if(!revealed){
        revealed = true;
        if(copy){
          copy.classList.remove('reveal');
          void copy.offsetWidth;
          copy.classList.add('reveal');
        }
      }
    }

    built.group.rotation.y = Math.sin(idleT * 0.25) * 0.08;
    if(built.discs) built.discs.forEach(d => { d.rotation.y += 0.03; });
    if(built.floaters) built.floaters.forEach((f, i) => {
      f.rotation.x += 0.005 + i * 0.001;
      f.rotation.y += 0.008;
    });

    renderer.render(scene, camera);
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        if(entry.intersectionRatio > 0.5){
          animStart = null;
          revealed = false;
          if(copy) copy.classList.remove('reveal');
        }
        if(!raf) raf = requestAnimationFrame(animate);
      } else {
        cancelAnimationFrame(raf);
        raf = null;
      }
    });
  }, { threshold: [0.1, 0.5] });
  io.observe(el);
}

document.querySelectorAll('.three-hero-stage').forEach(initHero);
