// Recorrido guiado para vendedores: secuencia de paradas con camara animada.
import * as THREE from 'three';

const WAYPOINTS = [
  {
    text: 'Bienvenido a ATLANTICO Splash Park · Resort. Una vista general del complejo en la frontera Brasil–Uruguay, a minutos de Chuy/Chuí.',
    pos: [0, 90, 200], look: [20, 10, -10],
  },
  {
    text: 'El parque acuático: el corazón del complejo. Toboganes, piscinas y solárium — el diferencial que revaloriza tu inversión.',
    pos: [-90, 40, 150], look: [-110, 5, 60],
  },
  {
    text: 'Resort 1: las unidades hoteleras / fracciones en venta. Ubicación premium con vista al parque y a las áreas verdes.',
    pos: [60, 35, 60], look: [60, 25, -60],
  },
  {
    text: 'Accesos y estacionamientos: llegada cómoda y directa desde la ruta, con conexión a la frontera y los free shops.',
    pos: [60, 25, 180], look: [60, 5, 0],
  },
  {
    text: 'Hacé clic en cualquier unidad marcada para ver su tipología, precio, forma de pago y disponibilidad. ¡Hablemos de tu unidad!',
    pos: [60, 30, 20], look: [60, 25, -60],
  },
];

export function createTour(camera) {
  let active = false;
  let index = 0;
  let t = 1;
  const fromPos = new THREE.Vector3();
  const fromLook = new THREE.Vector3();
  const toPos = new THREE.Vector3();
  const toLook = new THREE.Vector3();
  const curLook = new THREE.Vector3();
  let onCaption = () => {};

  function goTo(i) {
    index = Math.max(0, Math.min(WAYPOINTS.length - 1, i));
    const wp = WAYPOINTS[index];
    fromPos.copy(camera.position);
    camera.getWorldDirection(curLook);
    fromLook.copy(camera.position).add(curLook.multiplyScalar(50));
    toPos.set(...wp.pos);
    toLook.set(...wp.look);
    t = 0;
    onCaption(wp.text, index, WAYPOINTS.length);
  }

  function start(captionCb) {
    active = true;
    onCaption = captionCb || (() => {});
    goTo(0);
  }
  function stop() { active = false; }
  function next() { if (index < WAYPOINTS.length - 1) goTo(index + 1); }
  function prev() { if (index > 0) goTo(index - 1); }

  function update(dt) {
    if (!active || t >= 1) return;
    t = Math.min(1, t + dt * 0.6);
    const e = t * t * (3 - 2 * t); // smoothstep
    camera.position.lerpVectors(fromPos, toPos, e);
    const look = new THREE.Vector3().lerpVectors(fromLook, toLook, e);
    camera.lookAt(look);
  }

  return { start, stop, next, prev, update, isActive: () => active };
}
