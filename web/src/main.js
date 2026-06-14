// Orquestacion de la experiencia ATLANTICO (web).
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { createWorld } from './scene.js';
import { setupControls } from './controls.js';
import { createHotspots, pickHotspot, animateHotspots } from './hotspots.js';
import { createTour } from './tour.js';
import { getUnits, isOffline } from './api.js';
import {
  openUnitCard, closeUnitCard, renderUnitsPanel, toggleUnitsPanel,
  initLeadForm, showTourCaption, hideTourCaption,
} from './ui.js';

const canvas = document.getElementById('scene');
const world = createWorld(canvas);
const controls = setupControls(world.camera, canvas);
const tour = createTour(world.camera);

// --- Postproduccion: bloom cinematografico sutil ---
const composer = new EffectComposer(world.renderer);
composer.addPass(new RenderPass(world.scene, world.camera));
const bloom = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.45, // strength
  0.5,  // radius
  0.85, // threshold
);
composer.addPass(bloom);
composer.addPass(new OutputPass());

let timeOfDay = 'day';

const raycaster = new THREE.Raycaster();
const ndc = new THREE.Vector2();
let hotspots = [];

// --- Carga de datos y arranque ---
async function boot() {
  const units = await getUnits();
  hotspots = createHotspots(world.scene, units, world.unitAnchors);
  renderUnitsPanel(units, (u) => {
    toggleUnitsPanel(false);
    focusUnit(u);
  });
  initLeadForm();

  // Ocultar loading, mostrar menu
  document.getElementById('overlay-loading').classList.add('hidden');
  document.getElementById('menu').classList.remove('hidden');
  document.getElementById('menu-toggle').classList.remove('hidden');
  setHint(isOffline()
    ? 'Modo offline (datos locales). Elegí un modo en el menú inferior.'
    : 'Elegí un modo en el menú inferior. Hacé clic en los marcadores 🏠 para ver unidades.');

  setMode('aerial');
}

// --- Cambio de modo ---
function setMode(mode) {
  if (mode === 'tour') {
    controls.setMode('tour');
    tour.start((text, i, total) => showTourCaption(text, i, total));
    setCrosshair(false);
  } else {
    tour.stop();
    hideTourCaption();
    controls.setMode(mode);
    setCrosshair(mode === 'fps');
    setHint(mode === 'fps'
      ? 'Primera persona: WASD para caminar, mouse para mirar, ESC para liberar el cursor.'
      : 'Vista aérea: arrastrá para girar, scroll para acercar. Clic en 🏠 para ver una unidad.');
  }
}

function focusUnit(unit) {
  // Lleva la camara aerea hacia la unidad y abre su ficha.
  controls.setMode('aerial');
  const p = world.unitAnchors[unit.unitId];
  if (p) {
    controls.orbit.target.copy(p);
    world.camera.position.set(p.x + 40, p.y + 20, p.z + 60);
  }
  openUnitCard(unit);
}

// --- UI helpers ---
function setCrosshair(on) { document.getElementById('crosshair').classList.toggle('hidden', !on); }
function setHint(text) {
  const h = document.getElementById('hint');
  if (!text) { h.classList.add('hidden'); return; }
  h.textContent = text; h.classList.remove('hidden');
}

// --- Eventos de menu ---
document.getElementById('menu').addEventListener('click', (e) => {
  const action = e.target.closest('button')?.dataset.action;
  if (!action) return;
  switch (action) {
    case 'free': setMode('fps'); break;
    case 'aerial': setMode('aerial'); break;
    case 'tour': setMode('tour'); break;
    case 'units': toggleUnitsPanel(true); break;
    case 'ambiente': toggleTimeOfDay(e); break;
    case 'exit': exitExperience(); break;
  }
});
document.getElementById('menu-toggle').addEventListener('click', () =>
  document.getElementById('menu').classList.toggle('hidden'));
document.getElementById('units-close').addEventListener('click', () => toggleUnitsPanel(false));
document.getElementById('card-close').addEventListener('click', closeUnitCard);

// Recorrido guiado
document.getElementById('tour-next').addEventListener('click', () => tour.next());
document.getElementById('tour-prev').addEventListener('click', () => tour.prev());
document.getElementById('tour-exit').addEventListener('click', () => setMode('aerial'));

function toggleTimeOfDay(e) {
  timeOfDay = timeOfDay === 'day' ? 'sunset' : 'day';
  world.setTimeOfDay(timeOfDay);
  const btn = e.target.closest('button');
  if (btn) btn.textContent = timeOfDay === 'day' ? '🌅 Atardecer' : '☀️ Día';
}

function exitExperience() {
  document.getElementById('menu').classList.add('hidden');
  document.getElementById('menu-toggle').classList.add('hidden');
  setCrosshair(false);
  hideTourCaption();
  const ov = document.getElementById('overlay-loading');
  ov.querySelector('#loading-text').textContent = 'Gracias por visitar ATLANTICO.';
  ov.classList.remove('hidden');
}

// --- Click sobre hotspots ---
canvas.addEventListener('pointerdown', (e) => {
  if (controls.getMode() === 'fps' && !controls.fps.isLocked) return;
  ndc.x = (e.clientX / window.innerWidth) * 2 - 1;
  ndc.y = -(e.clientY / window.innerHeight) * 2 + 1;
  const unit = pickHotspot(raycaster, world.camera, ndc, hotspots);
  if (unit) openUnitCard(unit);
});

// --- Resize ---
window.addEventListener('resize', () => {
  world.camera.aspect = window.innerWidth / window.innerHeight;
  world.camera.updateProjectionMatrix();
  world.renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

// --- Loop de render ---
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  const elapsed = clock.elapsedTime;
  controls.update(dt);
  tour.update(dt);
  world.update(dt, elapsed);
  animateHotspots(hotspots, elapsed);
  composer.render();
}

boot();
animate();
