import * as THREE from 'three';

function easeOutCubic(t){ return 1 - Math.pow(1 - t, 3); }

function buildCamera(accent){
  const group = new THREE.Group();
  const metal = new THREE.MeshStandardMaterial({ color: 0x2a2a2e, roughness: 0.4, metalness: 0.6 });
  const accentMat = new THREE.MeshStandardMaterial({ color: accent, roughness: 0.3, metalness: 0.4, emissive: accent, emissiveIntensity: 0.15 });

  const body = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.5, 1.3), metal);
  group.add(body);

  const lensBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.62, 1.4, 24), metal);
  lensBarrel.rotation.x = Math.PI / 2;
  lensBarrel.position.z = 1.35;
  group.add(lensBarrel);

  const lensGlass = new THREE.Mesh(new THREE.CircleGeometry(0.5, 32), accentMat);
  lensGlass.position.z = 2.06;
  group.add(lensGlass);

  const lensRing = new THREE.Mesh(new THREE.TorusGeometry(0.56, 0.05, 12, 32), metal);
  lensRing.position.z = 1.85;
  group.add(lensRing);

  const viewfinder = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.4, 0.5), metal);
  viewfinder.position.set(-0.4, 1.1, -0.2);
  group.add(viewfinder);

  for(let i = 0; i < 2; i++){
    const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.12, 20), accentMat);
    dial.position.set(0.7 - i * 0.6, 0.85, -0.3);
    group.add(dial);
  }

  const grip = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.5, 0.6), metal);
  grip.position.set(1.3, -0.1, -0.1);
  group.add(grip);

  return { group, focus: lensGlass.position.clone().add(new THREE.Vector3(0, 0, 0)) };
}

function buildMixer(accent){
  const group = new THREE.Group();
  const body = new THREE.MeshStandardMaterial({ color: 0x1e1e24, roughness: 0.5, metalness: 0.3 });
  const accentMat = new THREE.MeshStandardMaterial({ color: accent, roughness: 0.3, metalness: 0.3, emissive: accent, emissiveIntensity: 0.2 });
  const discMat = new THREE.MeshStandardMaterial({ color: 0x0c0c10, roughness: 0.6, metalness: 0.2 });

  const base = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.3, 1.8), body);
  group.add(base);

  const discs = [];
  [-1.5, 1.5].forEach(x => {
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.08, 40), discMat);
    disc.position.set(x, 0.19, 0);
    group.add(disc);
    const label = new THREE.Mesh(new THREE.CircleGeometry(0.25, 24), accentMat);
    label.rotation.x = -Math.PI / 2;
    label.position.set(x, 0.24, 0);
    group.add(label);
    discs.push(disc);
  });

  for(let i = 0; i < 6; i++){
    const fader = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.5, 0.16), i % 2 === 0 ? accentMat : body);
    fader.position.set(-0.6 + i * 0.24, 0.4, 0.55);
    group.add(fader);
  }

  for(let i = 0; i < 3; i++){
    const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.14, 16), accentMat);
    knob.position.set(-0.3 + i * 0.3, 0.35, -0.55);
    group.add(knob);
  }

  return { group, discs, focus: new THREE.Vector3(0, 0.3, 0.55) };
}

function buildCanvas(accent){
  const group = new THREE.Group();
  const accentMat = new THREE.MeshStandardMaterial({ color: accent, roughness: 0.35, metalness: 0.2, emissive: accent, emissiveIntensity: 0.15 });
  const paleMat = new THREE.MeshStandardMaterial({ color: 0xf5f3ff, roughness: 0.5, metalness: 0.1 });
  const violetMat = new THREE.MeshStandardMaterial({ color: 0x7c5cff, roughness: 0.4, metalness: 0.2 });

  const plane = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.8), paleMat);
  group.add(plane);

  const frame = new THREE.Mesh(new THREE.RingGeometry(1.55, 1.62, 4), accentMat);
  frame.rotation.z = Math.PI / 4;
  frame.position.z = -0.05;
  group.add(frame);

  const shapes = [
    { geo: new THREE.IcosahedronGeometry(0.35, 0), mat: accentMat, pos: [-0.8, 0.4, 0.6] },
    { geo: new THREE.TorusGeometry(0.3, 0.1, 12, 28), mat: violetMat, pos: [0.7, -0.3, 0.7] },
    { geo: new THREE.BoxGeometry(0.4, 0.4, 0.4), mat: paleMat, pos: [0.6, 0.5, 0.9] }
  ];
  const floaters = shapes.map(s => {
    const mesh = new THREE.Mesh(s.geo, s.mat);
    mesh.position.set(...s.pos);
    group.add(mesh);
    return mesh;
  });

  return { group, floaters, focus: new THREE.Vector3(0, 0, 0.6) };
}

const BUILDERS = { camera: buildCamera, mixer: buildMixer, canvas: buildCanvas };

function initHero(el){
  const kind = el.dataset.scene;
  const canvas = el.querySelector('canvas');
  const accentHex = getComputedStyle(el.closest('.disc-hero')).getPropertyValue('--accent').trim() || '#f0ede6';
  const accent = new THREE.Color(accentHex);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0b0b12);
  scene.fog = new THREE.Fog(0x0b0b12, 6, 16);

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  const farPos = new THREE.Vector3(3, 2.4, 11);
  const nearPos = kind === 'camera'
    ? new THREE.Vector3(0.3, 0.15, 3.1)
    : kind === 'mixer'
      ? new THREE.Vector3(0, 1.6, 2.6)
      : new THREE.Vector3(0.4, 0.2, 2.4);
  camera.position.copy(farPos);

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
  const ZOOM_DURATION = 2200;
  let idleT = 0;

  function animate(now){
    raf = requestAnimationFrame(animate);
    if(animStart === null) animStart = now;
    const elapsed = now - animStart;
    const t = Math.min(elapsed / ZOOM_DURATION, 1);
    const eased = easeOutCubic(t);
    camera.position.lerpVectors(farPos, nearPos, eased);
    camera.lookAt(built.focus);

    idleT += 0.01;
    built.group.rotation.y = Math.sin(idleT * 0.4) * 0.15 + (t < 1 ? (1 - eased) * 0.6 : 0);
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
        if(entry.intersectionRatio > 0.5) animStart = null;
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
