import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

const DitherShader = {
  uniforms: {
    tDiffuse: { value: null },
    pixelSize: { value: 3.0 },
    levels: { value: 6.0 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main(){
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float pixelSize;
    uniform float levels;
    varying vec2 vUv;

    float bayer(vec2 p){
      const float m[16] = float[16](
        0.0, 8.0, 2.0, 10.0,
        12.0, 4.0, 14.0, 6.0,
        3.0, 11.0, 1.0, 9.0,
        15.0, 7.0, 13.0, 5.0
      );
      int x = int(mod(p.x, 4.0));
      int y = int(mod(p.y, 4.0));
      return m[y * 4 + x] / 16.0;
    }

    void main(){
      vec2 pixel = floor(gl_FragCoord.xy / pixelSize);
      float threshold = bayer(pixel) - 0.5;
      vec4 color = texture2D(tDiffuse, vUv);
      vec3 c = color.rgb + threshold / levels;
      c = floor(c * levels + 0.5) / levels;
      gl_FragColor = vec4(clamp(c, 0.0, 1.0), color.a);
    }
  `
};

const PALETTES = {
  earth: { sky: 0x1c3350, sun: 0xffb84d, halo: 0xff7a5c, ridges: [0x3a5f8a, 0x2f7a5c, 0x1f5c3f] },
  vivid: { sky: 0x160f2e, sun: 0xffd166, halo: 0xff5d8f, ridges: [0x7c5cff, 0x00e5c4, 0xff2d78] }
};

function buildNatureScene(paletteKey){
  const palette = PALETTES[paletteKey] || PALETTES.earth;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(palette.sky);

  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.set(0, 1.6, 9);

  const sun = new THREE.Mesh(
    new THREE.CircleGeometry(1.5, 32),
    new THREE.MeshBasicMaterial({ color: palette.sun })
  );
  sun.position.set(-2.2, 3.4, -6);
  scene.add(sun);

  const halo = new THREE.Mesh(
    new THREE.CircleGeometry(2.4, 32),
    new THREE.MeshBasicMaterial({ color: palette.halo, transparent: true, opacity: 0.35 })
  );
  halo.position.copy(sun.position);
  halo.position.z -= 0.1;
  scene.add(halo);

  const ridgeColors = palette.ridges;
  const ridgeConfigs = [
    { z: -4, height: 4.2, width: 14, color: ridgeColors[0] },
    { z: -1.5, height: 3.2, width: 12, color: ridgeColors[1] },
    { z: 1.5, height: 2.4, width: 11, color: ridgeColors[2] }
  ];

  const ridges = [];
  ridgeConfigs.forEach((cfg, idx) => {
    const segments = 10;
    const shape = new THREE.Shape();
    shape.moveTo(-cfg.width / 2, -2);
    for(let i = 0; i <= segments; i++){
      const t = i / segments;
      const x = -cfg.width / 2 + t * cfg.width;
      const y = Math.sin(t * Math.PI * 2.3 + idx) * 0.6 + Math.sin(t * 6.0 + idx * 2.0) * 0.35 + cfg.height * Math.sin(t * Math.PI);
      shape.lineTo(x, y);
    }
    shape.lineTo(cfg.width / 2, -2);
    shape.closePath();
    const geo = new THREE.ShapeGeometry(shape);
    const mat = new THREE.MeshBasicMaterial({ color: cfg.color });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.z = cfg.z;
    mesh.position.y = -1.2;
    scene.add(mesh);
    ridges.push(mesh);
  });

  return { scene, camera, sun, ridges };
}

function initDitherStage(el){
  const canvas = el.querySelector('canvas');
  const paletteKey = el.dataset.palette || 'earth';
  const { scene, camera, sun, ridges } = buildNatureScene(paletteKey);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
  renderer.setPixelRatio(1);

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const ditherPass = new ShaderPass(DitherShader);
  composer.addPass(ditherPass);

  function resize(){
    const w = el.clientWidth || 1;
    const h = el.clientHeight || 1;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    composer.setSize(w, h);
  }
  resize();
  window.addEventListener('resize', resize);

  let raf;
  function animate(){
    raf = requestAnimationFrame(animate);
    const t = Date.now() * 0.0002;
    camera.position.x = Math.sin(t) * 0.8;
    camera.lookAt(0, 0.6, 0);
    ridges.forEach((r, i) => { r.position.y = -1.2 + Math.sin(t * 1.4 + i) * 0.06; });
    sun.rotation.z += 0.002;
    composer.render();
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

document.querySelectorAll('.dither-stage').forEach(initDitherStage);
