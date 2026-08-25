import * as THREE from 'three';
import { AsciiEffect } from 'three/addons/effects/AsciiEffect.js';

const CHARS = ' .:-+*=%@#';

function buildScene(kind){
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 9);

  scene.add(new THREE.AmbientLight(0xffffff, 0.4));
  const light = new THREE.PointLight(0xffffff, 1.4);
  light.position.set(6, 6, 8);
  scene.add(light);

  let mesh;

  if(kind === 'djing'){
    const group = new THREE.Group();
    const g1 = new THREE.TorusGeometry(2.4, 0.35, 16, 48);
    const g2 = new THREE.TorusGeometry(1.6, 0.28, 16, 48);
    const m = new THREE.MeshStandardMaterial({ color: 0xffffff, flatShading: true });
    const ring1 = new THREE.Mesh(g1, m);
    const ring2 = new THREE.Mesh(g2, m);
    ring1.rotation.x = Math.PI / 2.4;
    ring2.rotation.x = Math.PI / 2.4;
    ring2.position.x = 0.2;
    group.add(ring1, ring2);
    mesh = group;
  } else if(kind === 'design'){
    const geo = new THREE.IcosahedronGeometry(2.6, 0);
    const m = new THREE.MeshStandardMaterial({ color: 0xffffff, flatShading: true });
    mesh = new THREE.Mesh(geo, m);
  } else {
    const group = new THREE.Group();
    const frameGeo = new THREE.BoxGeometry(3, 2, 0.1);
    const edges = new THREE.EdgesGeometry(frameGeo);
    const frame = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff }));
    const lensGeo = new THREE.ConeGeometry(0.5, 1, 24);
    const lens = new THREE.Mesh(lensGeo, new THREE.MeshStandardMaterial({ color: 0xffffff, flatShading: true }));
    lens.rotation.z = Math.PI / 2;
    lens.position.z = 0.9;
    group.add(frame, lens);
    mesh = group;
  }

  scene.add(mesh);

  return { scene, camera, mesh, kind };
}

function initStage(el){
  const kind = el.dataset.scene;
  const canvas = el.querySelector('canvas');
  const { scene, camera, mesh } = buildScene(kind);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
  renderer.setClearColor(0x000000, 0);

  const effect = new AsciiEffect(renderer, CHARS, { invert: true, resolution: 0.18 });
  effect.domElement.style.color = '#f0ede6';
  effect.domElement.style.backgroundColor = 'transparent';
  effect.domElement.style.width = '100%';
  effect.domElement.style.height = '100%';
  effect.domElement.style.fontFamily = 'Arial, Helvetica, sans-serif';
  effect.domElement.style.letterSpacing = '-1px';
  el.appendChild(effect.domElement);
  canvas.remove();

  function resize(){
    const w = el.clientWidth;
    const h = el.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    effect.setSize(w, h);
  }
  resize();
  window.addEventListener('resize', resize);

  let raf;
  function animate(){
    raf = requestAnimationFrame(animate);
    mesh.rotation.y += 0.006;
    mesh.rotation.x += 0.0015;
    if(kind === 'cinematography'){
      mesh.position.x = Math.sin(Date.now() * 0.0006) * 0.8;
    }
    effect.render(scene, camera);
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        if(!raf) animate();
      } else {
        cancelAnimationFrame(raf);
        raf = null;
      }
    });
  }, { threshold: 0.1 });
  io.observe(el);
}

document.querySelectorAll('.ascii-stage').forEach(initStage);
