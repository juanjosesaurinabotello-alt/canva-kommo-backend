// Hotspots de unidad: marcadores 3D clickeables, con color por disponibilidad.
import * as THREE from 'three';

const COLORS = {
  available: '#2ecc71',
  reserved: '#f1c40f',
  sold: '#e74c3c',
};

// Genera una textura de marcador (circulo con borde) del color dado.
function markerTexture(color) {
  const s = 128;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const ctx = c.getContext('2d');
  ctx.beginPath();
  ctx.arc(s / 2, s / 2, s / 2 - 10, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.lineWidth = 10;
  ctx.strokeStyle = 'rgba(255,255,255,0.95)';
  ctx.stroke();
  // simbolo interno
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.font = 'bold 56px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🏠'.length ? '⌂' : '', s / 2, s / 2 + 4);
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 4;
  return tex;
}

export function createHotspots(scene, units, anchors) {
  const sprites = [];
  for (const unit of units) {
    const pos = anchors[unit.unitId];
    if (!pos) continue;
    const material = new THREE.SpriteMaterial({
      map: markerTexture(COLORS[unit.estado] || '#888'),
      depthTest: false,
      transparent: true,
    });
    const sprite = new THREE.Sprite(material);
    sprite.position.copy(pos);
    sprite.scale.set(6, 6, 6);
    sprite.renderOrder = 999;
    sprite.userData.unit = unit;
    scene.add(sprite);
    sprites.push(sprite);
  }
  return sprites;
}

// Devuelve la unidad del hotspot bajo coordenadas normalizadas (-1..1).
export function pickHotspot(raycaster, camera, ndc, sprites) {
  raycaster.setFromCamera(ndc, camera);
  const hits = raycaster.intersectObjects(sprites, false);
  return hits.length ? hits[0].object.userData.unit : null;
}

// Pulso suave de escala para que los marcadores "respiren".
export function animateHotspots(sprites, elapsed) {
  const s = 6 + Math.sin(elapsed * 2) * 0.5;
  for (const sp of sprites) sp.scale.set(s, s, s);
}
