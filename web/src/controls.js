// Controles de camara: vista aerea (orbital) y primera persona (FPS).
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

export function setupControls(camera, domElement) {
  // --- Vista aerea: orbital ---
  const orbit = new OrbitControls(camera, domElement);
  orbit.enableDamping = true;
  orbit.dampingFactor = 0.08;
  orbit.maxPolarAngle = Math.PI / 2.05; // no pasar bajo el suelo
  orbit.minDistance = 30;
  orbit.maxDistance = 400;
  orbit.target.set(30, 10, 0);

  // --- Primera persona ---
  const fps = new PointerLockControls(camera, domElement);
  const keys = { f: false, b: false, l: false, r: false };
  const velocity = new THREE.Vector3();
  const SPEED = 60;
  const EYE = 6;

  const onKey = (down) => (e) => {
    switch (e.code) {
      case 'KeyW': case 'ArrowUp': keys.f = down; break;
      case 'KeyS': case 'ArrowDown': keys.b = down; break;
      case 'KeyA': case 'ArrowLeft': keys.l = down; break;
      case 'KeyD': case 'ArrowRight': keys.r = down; break;
    }
  };
  const kd = onKey(true), ku = onKey(false);

  let mode = 'aerial';

  function setMode(next) {
    mode = next;
    if (mode === 'aerial') {
      fps.unlock();
      orbit.enabled = true;
      document.removeEventListener('keydown', kd);
      document.removeEventListener('keyup', ku);
      camera.position.set(0, 60, 140);
      orbit.target.set(30, 10, 0);
    } else if (mode === 'fps') {
      orbit.enabled = false;
      camera.position.set(60, EYE, 60);
      document.addEventListener('keydown', kd);
      document.addEventListener('keyup', ku);
      fps.lock();
    } else if (mode === 'tour') {
      // En recorrido guiado la camara la maneja el modulo tour.
      fps.unlock();
      orbit.enabled = false;
      document.removeEventListener('keydown', kd);
      document.removeEventListener('keyup', ku);
    }
  }

  function update(dt) {
    if (mode === 'aerial') {
      orbit.update();
    } else if (mode === 'fps' && fps.isLocked) {
      velocity.x -= velocity.x * 10 * dt;
      velocity.z -= velocity.z * 10 * dt;
      const dir = Number(keys.f) - Number(keys.b);
      const strafe = Number(keys.r) - Number(keys.l);
      if (dir) velocity.z += dir * SPEED * dt;
      if (strafe) velocity.x += strafe * SPEED * dt;
      fps.moveForward(velocity.z * dt);
      fps.moveRight(velocity.x * dt);
      camera.position.y = EYE; // pegado al piso
    }
  }

  return { orbit, fps, setMode, update, getMode: () => mode };
}
