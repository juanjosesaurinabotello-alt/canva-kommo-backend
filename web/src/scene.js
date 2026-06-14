// Construccion del mundo 3D de ATLANTICO (representativo, en tiempo real web).
// No es hiperrealista (eso es la version UE5); es un prototipo funcional que
// comunica la distribucion: parque acuatico, Resort 1, areas verdes y accesos.
import * as THREE from 'three';

export function createWorld(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x9ec9e8);
  scene.fog = new THREE.Fog(0x9ec9e8, 120, 600);

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
  camera.position.set(0, 60, 140);

  // --- Iluminacion diurna ---
  const hemi = new THREE.HemisphereLight(0xcfeaff, 0x4a6a3a, 0.9);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff4e0, 2.2);
  sun.position.set(120, 160, 80);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 600;
  sun.shadow.camera.left = -250; sun.shadow.camera.right = 250;
  sun.shadow.camera.top = 250; sun.shadow.camera.bottom = -250;
  scene.add(sun);

  // --- Terreno (areas verdes) ---
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(1200, 1200),
    new THREE.MeshStandardMaterial({ color: 0x5a8f4e, roughness: 1 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Solarium / area de arena alrededor del parque
  const sand = new THREE.Mesh(
    new THREE.CircleGeometry(95, 48),
    new THREE.MeshStandardMaterial({ color: 0xe9d9a8, roughness: 1 }),
  );
  sand.rotation.x = -Math.PI / 2;
  sand.position.set(-90, 0.05, 40);
  sand.receiveShadow = true;
  scene.add(sand);

  // --- Parque acuatico (piscinas / agua animada) ---
  const waterMat = makeWaterMaterial();
  const pool = new THREE.Mesh(new THREE.CircleGeometry(70, 64), waterMat);
  pool.rotation.x = -Math.PI / 2;
  pool.position.set(-90, 0.2, 40);
  scene.add(pool);

  // Toboganes (representados con torus/cilindros de color)
  const slideGroup = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    const color = [0xff5e5e, 0x5ec8ff, 0xffd15e][i];
    const tower = new THREE.Mesh(
      new THREE.CylinderGeometry(2, 2, 26 + i * 6, 12),
      new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: .6 }),
    );
    tower.position.set(-150 + i * 14, (26 + i * 6) / 2, 70);
    tower.castShadow = true;
    slideGroup.add(tower);
    const slide = new THREE.Mesh(
      new THREE.TorusGeometry(14, 1.6, 8, 24, Math.PI * 1.4),
      new THREE.MeshStandardMaterial({ color, roughness: .5 }),
    );
    slide.position.set(-150 + i * 14, 14 + i * 3, 70);
    slide.rotation.y = Math.PI / 2;
    slide.castShadow = true;
    slideGroup.add(slide);
  }
  scene.add(slideGroup);

  // --- Resort 1 (edificio con las unidades vendibles) ---
  const resort = new THREE.Group();
  const floors = 5, fw = 60, fd = 22, fh = 9;
  const buildingMat = new THREE.MeshStandardMaterial({ color: 0xeae6df, roughness: .8 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x88b6d6, roughness: .15, metalness: .3 });
  for (let f = 0; f < floors; f++) {
    const slab = new THREE.Mesh(new THREE.BoxGeometry(fw, fh, fd), buildingMat);
    slab.position.set(0, fh / 2 + f * fh, 0);
    slab.castShadow = true; slab.receiveShadow = true;
    resort.add(slab);
    // banda de vidrio por piso
    const band = new THREE.Mesh(new THREE.BoxGeometry(fw + 0.4, fh * 0.5, fd + 0.4), glassMat);
    band.position.set(0, fh / 2 + f * fh + 1, 0);
    resort.add(band);
  }
  resort.position.set(60, 0, -60);
  scene.add(resort);

  // --- Anclas 3D de las 5 unidades (sobre la fachada del Resort 1) ---
  // unitId -> posicion mundial del hotspot.
  const base = resort.position;
  const unitAnchors = {
    UNIT_101: new THREE.Vector3(base.x - 18, 7, base.z + fd / 2 + 1),
    UNIT_102: new THREE.Vector3(base.x + 0, 16, base.z + fd / 2 + 1),
    UNIT_103: new THREE.Vector3(base.x + 18, 25, base.z + fd / 2 + 1),
    UNIT_104: new THREE.Vector3(base.x - 9, 34, base.z + fd / 2 + 1),
    UNIT_105: new THREE.Vector3(base.x + 12, 43, base.z + fd / 2 + 1),
  };

  // --- Vegetacion (palmeras simples instanciadas a mano) ---
  addPalms(scene);

  // --- Accesos (camino de entrada) ---
  const road = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 240),
    new THREE.MeshStandardMaterial({ color: 0x4a4a52, roughness: 1 }),
  );
  road.rotation.x = -Math.PI / 2;
  road.position.set(60, 0.06, 120);
  road.receiveShadow = true;
  scene.add(road);

  function update(dt, elapsed) {
    waterMat.uniforms.uTime.value = elapsed;
  }

  return { renderer, scene, camera, sun, update, unitAnchors };
}

// Material de agua animado (sin texturas externas).
function makeWaterMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    uniforms: { uTime: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec2 vUv;
      uniform float uTime;
      void main() {
        vec2 p = vUv * 18.0;
        float w = sin(p.x + uTime * 1.5) * 0.5 + sin(p.y * 1.3 - uTime) * 0.5;
        vec3 deep = vec3(0.02, 0.30, 0.55);
        vec3 shallow = vec3(0.20, 0.65, 0.85);
        vec3 col = mix(deep, shallow, 0.5 + 0.5 * w);
        gl_FragColor = vec4(col, 0.86);
      }
    `,
  });
}

function addPalms(scene) {
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8a5a2b, roughness: 1 });
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 1 });
  const positions = [
    [-20, 30], [-30, 70], [10, 90], [40, 60], [120, 40],
    [120, 90], [90, 120], [30, 130], [-40, 110], [150, 20],
  ];
  for (const [x, z] of positions) {
    const palm = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 1, 12, 8), trunkMat);
    trunk.position.y = 6; trunk.castShadow = true;
    palm.add(trunk);
    for (let i = 0; i < 6; i++) {
      const leaf = new THREE.Mesh(new THREE.ConeGeometry(1.2, 9, 5), leafMat);
      leaf.position.y = 12;
      leaf.rotation.z = Math.PI / 2.6;
      leaf.rotation.y = (i / 6) * Math.PI * 2;
      leaf.castShadow = true;
      palm.add(leaf);
    }
    palm.position.set(x, 0, z);
    scene.add(palm);
  }
}
