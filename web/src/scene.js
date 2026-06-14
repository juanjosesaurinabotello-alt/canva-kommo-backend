// Construccion del mundo 3D de ATLANTICO (representativo, tiempo real web).
// Realismo elevado: cielo fisico (Sky), iluminacion por entorno (PMREM),
// tone mapping ACES, agua con fresnel + brillo solar, dia/atardecer.
import * as THREE from 'three';
import { Sky } from 'three/examples/jsm/objects/Sky.js';

export function createWorld(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xbcd6e8, 200, 750);

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 20000);
  camera.position.set(0, 60, 140);

  // --- Cielo fisico ---
  const sky = new Sky();
  sky.scale.setScalar(12000);
  scene.add(sky);
  const skyU = sky.material.uniforms;
  skyU.turbidity.value = 8;
  skyU.rayleigh.value = 2.2;
  skyU.mieCoefficient.value = 0.005;
  skyU.mieDirectionalG.value = 0.8;

  // Sky aparte para generar el environment map (sin edificios en reflejos).
  const skyEnv = new Sky();
  skyEnv.scale.setScalar(12000);
  const skyEnvScene = new THREE.Scene();
  skyEnvScene.add(skyEnv);
  const skyEnvU = skyEnv.material.uniforms;
  for (const k of ['turbidity', 'rayleigh', 'mieCoefficient', 'mieDirectionalG']) {
    skyEnvU[k].value = skyU[k].value;
  }
  const pmrem = new THREE.PMREMGenerator(renderer);

  // --- Luces ---
  const hemi = new THREE.HemisphereLight(0xcfeaff, 0x4a6a3a, 0.5);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff4e0, 2.6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 800;
  sun.shadow.camera.left = -260; sun.shadow.camera.right = 260;
  sun.shadow.camera.top = 260; sun.shadow.camera.bottom = -260;
  sun.shadow.bias = -0.0003;
  scene.add(sun);

  const sunDir = new THREE.Vector3();

  // Posiciona el sol y regenera cielo + environment.
  function applySun(elevationDeg, azimuthDeg) {
    const phi = THREE.MathUtils.degToRad(90 - elevationDeg);
    const theta = THREE.MathUtils.degToRad(azimuthDeg);
    sunDir.setFromSphericalCoords(1, phi, theta);
    skyU.sunPosition.value.copy(sunDir);
    skyEnvU.sunPosition.value.copy(sunDir);
    sun.position.copy(sunDir).multiplyScalar(400);
    waterMat.uniforms.uSunDir.value.copy(sunDir);

    if (scene.environment) scene.environment.dispose?.();
    scene.environment = pmrem.fromScene(skyEnvScene).texture;
  }

  // Presets de momento del dia.
  function setTimeOfDay(mode) {
    if (mode === 'sunset') {
      skyU.turbidity.value = skyEnvU.turbidity.value = 12;
      skyU.rayleigh.value = skyEnvU.rayleigh.value = 3.5;
      skyU.mieCoefficient.value = skyEnvU.mieCoefficient.value = 0.01;
      sun.color.set(0xff9d5c); sun.intensity = 2.2;
      hemi.intensity = 0.35;
      scene.fog.color.set(0xe6a98a);
      renderer.toneMappingExposure = 1.05;
      applySun(5, 110);
    } else {
      skyU.turbidity.value = skyEnvU.turbidity.value = 8;
      skyU.rayleigh.value = skyEnvU.rayleigh.value = 2.2;
      skyU.mieCoefficient.value = skyEnvU.mieCoefficient.value = 0.005;
      sun.color.set(0xfff4e0); sun.intensity = 2.6;
      hemi.intensity = 0.5;
      scene.fog.color.set(0xbcd6e8);
      renderer.toneMappingExposure = 1.0;
      applySun(38, 165);
    }
  }

  // --- Terreno (areas verdes) ---
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(1400, 1400),
    new THREE.MeshStandardMaterial({ color: 0x4f8744, roughness: 1 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Solarium / arena
  const sand = new THREE.Mesh(
    new THREE.CircleGeometry(95, 48),
    new THREE.MeshStandardMaterial({ color: 0xe9d9a8, roughness: 1 }),
  );
  sand.rotation.x = -Math.PI / 2;
  sand.position.set(-90, 0.05, 40);
  sand.receiveShadow = true;
  scene.add(sand);

  // --- Parque acuatico (agua) ---
  const waterMat = makeWaterMaterial();
  const pool = new THREE.Mesh(new THREE.CircleGeometry(70, 96), waterMat);
  pool.rotation.x = -Math.PI / 2;
  pool.position.set(-90, 0.25, 40);
  scene.add(pool);

  // Toboganes
  const slideGroup = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    const color = [0xff5e5e, 0x5ec8ff, 0xffd15e][i];
    const tower = new THREE.Mesh(
      new THREE.CylinderGeometry(2, 2, 26 + i * 6, 16),
      new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: .5, metalness: .1 }),
    );
    tower.position.set(-150 + i * 14, (26 + i * 6) / 2, 70);
    tower.castShadow = true;
    slideGroup.add(tower);
    const slide = new THREE.Mesh(
      new THREE.TorusGeometry(14, 1.6, 12, 32, Math.PI * 1.4),
      new THREE.MeshStandardMaterial({ color, roughness: .35, metalness: .1 }),
    );
    slide.position.set(-150 + i * 14, 14 + i * 3, 70);
    slide.rotation.y = Math.PI / 2;
    slide.castShadow = true;
    slideGroup.add(slide);
  }
  scene.add(slideGroup);

  // --- Resort 1 ---
  const resort = new THREE.Group();
  const floors = 5, fw = 60, fd = 22, fh = 9;
  const buildingMat = new THREE.MeshStandardMaterial({ color: 0xeae6df, roughness: .75 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x7fb0d6, roughness: .05, metalness: .9, envMapIntensity: 1.2 });
  for (let f = 0; f < floors; f++) {
    const slab = new THREE.Mesh(new THREE.BoxGeometry(fw, fh, fd), buildingMat);
    slab.position.set(0, fh / 2 + f * fh, 0);
    slab.castShadow = true; slab.receiveShadow = true;
    resort.add(slab);
    const band = new THREE.Mesh(new THREE.BoxGeometry(fw + 0.4, fh * 0.5, fd + 0.4), glassMat);
    band.position.set(0, fh / 2 + f * fh + 1, 0);
    resort.add(band);
  }
  resort.position.set(60, 0, -60);
  scene.add(resort);

  const base = resort.position;
  const unitAnchors = {
    UNIT_101: new THREE.Vector3(base.x - 18, 7, base.z + fd / 2 + 1),
    UNIT_102: new THREE.Vector3(base.x + 0, 16, base.z + fd / 2 + 1),
    UNIT_103: new THREE.Vector3(base.x + 18, 25, base.z + fd / 2 + 1),
    UNIT_104: new THREE.Vector3(base.x - 9, 34, base.z + fd / 2 + 1),
    UNIT_105: new THREE.Vector3(base.x + 12, 43, base.z + fd / 2 + 1),
  };

  addPalms(scene);

  // Accesos
  const road = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 260),
    new THREE.MeshStandardMaterial({ color: 0x3f3f47, roughness: 1 }),
  );
  road.rotation.x = -Math.PI / 2;
  road.position.set(60, 0.06, 130);
  road.receiveShadow = true;
  scene.add(road);

  // Iluminacion inicial
  setTimeOfDay('day');

  function update(dt, elapsed) {
    waterMat.uniforms.uTime.value = elapsed;
  }

  return { renderer, scene, camera, sun, update, unitAnchors, setTimeOfDay };
}

// Agua con fresnel + brillo solar (sin texturas externas).
function makeWaterMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
      uTime: { value: 0 },
      uSunDir: { value: new THREE.Vector3(0, 1, 0) },
      uDeep: { value: new THREE.Color(0x05334f) },
      uShallow: { value: new THREE.Color(0x2a9fc4) },
    },
    vertexShader: /* glsl */ `
      varying vec3 vWorld;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorld = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec3 vWorld;
      uniform float uTime;
      uniform vec3 uSunDir;
      uniform vec3 uDeep;
      uniform vec3 uShallow;
      void main() {
        vec3 viewDir = normalize(cameraPosition - vWorld);
        vec2 p = vWorld.xz * 0.06;
        float n1 = sin(p.x * 3.0 + uTime * 1.6);
        float n2 = sin(p.y * 2.3 - uTime * 1.1);
        vec3 normal = normalize(vec3(n1 * 0.18, 1.0, n2 * 0.18));
        float fres = pow(1.0 - max(dot(viewDir, vec3(0.0, 1.0, 0.0)), 0.0), 3.0);
        vec3 h = normalize(normalize(uSunDir) + viewDir);
        float spec = pow(max(dot(normal, h), 0.0), 200.0);
        float wave = 0.5 + 0.5 * (n1 * n2);
        vec3 col = mix(uDeep, uShallow, wave);
        col = mix(col, vec3(0.85, 0.92, 1.0), fres * 0.55);
        col += spec * 2.0;
        gl_FragColor = vec4(col, 0.92);
      }
    `,
  });
}

function addPalms(scene) {
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8a5a2b, roughness: 1 });
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: .9 });
  const positions = [
    [-20, 30], [-30, 70], [10, 90], [40, 60], [120, 40],
    [120, 90], [90, 120], [30, 130], [-40, 110], [150, 20],
    [-60, 0], [0, -10], [140, 130], [-160, 30], [-130, 110],
  ];
  for (const [x, z] of positions) {
    const palm = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 1, 12, 8), trunkMat);
    trunk.position.y = 6; trunk.castShadow = true;
    palm.add(trunk);
    for (let i = 0; i < 7; i++) {
      const leaf = new THREE.Mesh(new THREE.ConeGeometry(1.2, 9, 5), leafMat);
      leaf.position.y = 12;
      leaf.rotation.z = Math.PI / 2.6;
      leaf.rotation.y = (i / 7) * Math.PI * 2;
      leaf.castShadow = true;
      palm.add(leaf);
    }
    palm.position.set(x, 0, z);
    palm.scale.setScalar(0.85 + Math.random() * 0.5);
    scene.add(palm);
  }
}
