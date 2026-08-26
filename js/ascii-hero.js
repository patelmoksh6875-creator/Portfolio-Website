import * as THREE from 'three';
import { AsciiEffect } from 'three/addons/effects/AsciiEffect.js';

const CHARS = ' .:-+*=%@#';

function initHeroAscii(el){
  const canvas = el.querySelector('canvas');

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 7);

  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  const light = new THREE.PointLight(0xffffff, 1.2);
  light.position.set(5, 5, 6);
  scene.add(light);

  const geo = new THREE.IcosahedronGeometry(2.1, 0);
  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, flatShading: true });
  const mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
  renderer.setClearColor(0x000000, 0);

  const effect = new AsciiEffect(renderer, CHARS, { invert: true, resolution: 0.16 });
  effect.domElement.style.color = '#6b6a5f';
  effect.domElement.style.backgroundColor = 'transparent';
  effect.domElement.style.width = '100%';
  effect.domElement.style.height = '100%';
  effect.domElement.style.fontFamily = 'Arial, Helvetica, sans-serif';
  effect.domElement.style.letterSpacing = '-1px';
  el.appendChild(effect.domElement);
  canvas.remove();

  function resize(){
    const w = el.clientWidth || 1;
    const h = el.clientHeight || 1;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    effect.setSize(w, h);
  }
  resize();
  window.addEventListener('resize', resize);

  let targetX = 0;
  let targetY = 0;
  el.addEventListener('mousemove', (e) => {
    const rect = el.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    targetX = ny * 0.7;
    targetY = nx * 0.7;
  });
  el.addEventListener('mouseleave', () => { targetX = 0; targetY = 0; });

  let raf;
  function animate(){
    raf = requestAnimationFrame(animate);
    mesh.rotation.x += (targetX - mesh.rotation.x) * 0.06;
    mesh.rotation.y += (targetY - mesh.rotation.y) * 0.06;
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

document.querySelectorAll('.ascii-hero-stage').forEach(initHeroAscii);
