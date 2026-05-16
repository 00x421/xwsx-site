import * as THREE from 'three';
import {
  ACCENT_HEX, BG_HEX, FOG_DENSITY,
  PARTICLE_COUNT_DESKTOP, PARTICLE_FIELD_X, PARTICLE_FIELD_Y, PARTICLE_FIELD_Z,
  PARTICLE_SIZE, PARTICLE_OPACITY,
  ENTRY_SPAWN_RANGE_X, ENTRY_SPAWN_RANGE_Y, ENTRY_SPAWN_RANGE_Z,
} from './constants';
import { createWireMat, createLineMat, createCelestialMat, createSolidMat, moonGeo, starGeo } from './materials';
import type { Tier } from './detect';

export type TimeMood = 'morning' | 'afternoon' | 'evening' | 'night';

export function getTimeMood(): TimeMood {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'morning';
  if (h >= 12 && h < 18) return 'afternoon';
  if (h >= 18 && h < 22) return 'evening';
  return 'night';
}

interface TimeTweaks {
  fogMul: number;
  particleOpacityMul: number;
  accentR: number; accentG: number; accentB: number;
}

const TIME_TWEAKS: Record<TimeMood, TimeTweaks> = {
  morning:   { fogMul: 0.9, particleOpacityMul: 0.9, accentR: 160, accentG: 170, accentB: 180 },
  afternoon: { fogMul: 1.0, particleOpacityMul: 1.0, accentR: 123, accentG: 142, accentB: 168 },
  evening:   { fogMul: 1.1, particleOpacityMul: 1.1, accentR: 155, accentG: 140, accentB: 130 },
  night:     { fogMul: 1.15, particleOpacityMul: 1.15, accentR: 130, accentG: 150, accentB: 185 },
};

const TIME_TWEAKS_DARK: Record<TimeMood, TimeTweaks> = {
  morning:   { fogMul: 0.95, particleOpacityMul: 1.0, accentR: 160, accentG: 172, accentB: 190 },
  afternoon: { fogMul: 1.0, particleOpacityMul: 1.0, accentR: 143, accentG: 164, accentB: 190 },
  evening:   { fogMul: 1.05, particleOpacityMul: 1.05, accentR: 165, accentG: 150, accentB: 135 },
  night:     { fogMul: 1.1, particleOpacityMul: 1.1, accentR: 130, accentG: 155, accentB: 200 },
};

export interface GlowEntry { mesh: THREE.Mesh; baseOpacity: number; }
export interface AnimEntry {
  mesh: THREE.Mesh | THREE.LineSegments;
  tx: number; ty: number; tz: number;
  ox: number; oy: number; oz: number;
}

export interface SceneDeps {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  canvas: HTMLCanvasElement;

  torus1: THREE.Mesh;
  torus2: THREE.Mesh;
  cubeEdges: THREE.LineSegments;
  octa: THREE.Mesh;
  ico: THREE.Mesh;
  dodec: THREE.Mesh;
  particles: THREE.Points;
  grid: THREE.GridHelper;
  geoGroup: THREE.Group;
  glowMeshes: GlowEntry[];
  solidMats: THREE.MeshBasicMaterial[];
  lineMeshes: THREE.Line[];
  dotMeshes: THREE.Mesh[];
  animObjs: AnimEntry[];
  pFinal: Float32Array;
  pPos: Float32Array;
  particleCount: number;
  startTime: number;
  timeMood: TimeMood;
}

export function createScene(canvas: HTMLCanvasElement, tier: Tier, timeMood: TimeMood): SceneDeps {
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(BG_HEX, FOG_DENSITY);

  // Apply time-of-day fog tweak
  const tweaks = TIME_TWEAKS[timeMood];
  (scene.fog as THREE.FogExp2).density = FOG_DENSITY * tweaks.fogMul;

  const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 100);
  camera.position.set(0, 0, 8);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'low-power' });
  renderer.setSize(innerWidth, innerHeight);
  const maxPixelRatio = tier === 1 ? 2 : 1.5;
  renderer.setPixelRatio(Math.min(devicePixelRatio, maxPixelRatio));
  renderer.setClearColor(BG_HEX, 1);

  // --- Geometries ---
  const torus1 = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.025, 16, 100), createWireMat(0.12));
  torus1.position.set(-4, 2, -3);

  const torus2 = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.02, 16, 64), createWireMat(0.1));
  torus2.position.set(3.5, -1.5, 1);

  const cubeEdges = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1)),
    createLineMat(0.12),
  );
  cubeEdges.position.set(5, 0.5, -5);

  const octa = new THREE.Mesh(new THREE.OctahedronGeometry(0.8), createWireMat(0.12));
  octa.position.set(-3.5, -0.5, 3);

  const ico = new THREE.Mesh(new THREE.IcosahedronGeometry(0.8), createWireMat(0.1));
  ico.position.set(2, 3, -7);

  const dodec = new THREE.Mesh(new THREE.DodecahedronGeometry(0.7), createWireMat(0.12));
  dodec.position.set(-2, -2, 2);

  // Semi-transparent solid faces
  const solidMats: THREE.MeshBasicMaterial[] = [];
  const makeSolid = (opacity: number, geo: THREE.BufferGeometry) => {
    const m = createSolidMat(opacity);
    solidMats.push(m);
    return new THREE.Mesh(geo, m);
  };
  octa.add(makeSolid(0.08, new THREE.OctahedronGeometry(0.8)));
  ico.add(makeSolid(0.06, new THREE.IcosahedronGeometry(0.8)));
  dodec.add(makeSolid(0.08, new THREE.DodecahedronGeometry(0.7)));

  const glowMeshes: GlowEntry[] = [
    { mesh: octa, baseOpacity: 0.12 },
    { mesh: ico, baseOpacity: 0.1 },
    { mesh: dodec, baseOpacity: 0.12 },
  ];

  // Decorative line segments
  const lineMeshes: THREE.Line[] = [];
  [[[-6,1,-2],[-4,1.5,-1]],[[4,-2,0],[5.5,-1,1]],[[-1,3,-4],[1,3.2,-3]]].forEach(pts => {
    const geo = new THREE.BufferGeometry().setFromPoints(pts.map(p => new THREE.Vector3(...p)));
    const line = new THREE.Line(geo, createLineMat(0.12));
    lineMeshes.push(line);
  });

  // Celestial shapes
  const celestialMat = createCelestialMat(0.18);
  const dotMeshes: THREE.Mesh[] = [];
  ([
    { geo: moonGeo(0.45), pos: [-1.2, 3, 0.5] as const },
    { geo: moonGeo(0.3), pos: [-3, 0, 3] as const },
    { geo: starGeo(0.18), pos: [2.5, 2.8, -1] as const },
    { geo: starGeo(0.14), pos: [5, -1.5, -2] as const },
    { geo: starGeo(0.1), pos: [-5, -0.5, 2] as const },
  ] as const).forEach(c => {
    const mesh = new THREE.Mesh(c.geo, celestialMat);
    mesh.position.set(...c.pos);
    mesh.rotation.set(0, Math.random() * Math.PI, 0);
    dotMeshes.push(mesh);
  });

  // Grid floor
  const grid = new THREE.GridHelper(40, 40, ACCENT_HEX, ACCENT_HEX);
  grid.position.y = -3.5;
  (grid.material as THREE.Material).transparent = true;
  (grid.material as THREE.Material).opacity = 0.06;

  // Particle field
  const particleCount = tier === 1 ? PARTICLE_COUNT_DESKTOP : Math.floor(PARTICLE_COUNT_DESKTOP * 0.4);
  const pFinal = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    pFinal[i * 3]     = (Math.random() - 0.5) * PARTICLE_FIELD_X;
    pFinal[i * 3 + 1] = (Math.random() - 0.5) * PARTICLE_FIELD_Y;
    pFinal[i * 3 + 2] = (Math.random() - 0.5) * PARTICLE_FIELD_Z;
  }
  const pPos = new Float32Array(particleCount * 3);
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
    color: ACCENT_HEX, size: PARTICLE_SIZE, transparent: true,
    opacity: PARTICLE_OPACITY * tweaks.particleOpacityMul, sizeAttenuation: true,
  }));

  // Group for idle rotation
  const geoGroup = new THREE.Group();
  [torus1, torus2, cubeEdges, octa, ico, dodec, ...lineMeshes, ...dotMeshes].forEach(m => {
    geoGroup.add(m);
  });
  geoGroup.add(grid);

  scene.add(geoGroup);
  scene.add(particles);

  // Entry animation setup
  const animObjs: AnimEntry[] = [
    { mesh: torus1, tx: -4, ty: 2, tz: -3, ox: 0, oy: 0, oz: 0 },
    { mesh: torus2, tx: 3.5, ty: -1.5, tz: 1, ox: 0, oy: 0, oz: 0 },
    { mesh: cubeEdges, tx: 5, ty: 0.5, tz: -5, ox: 0, oy: 0, oz: 0 },
    { mesh: octa, tx: -3.5, ty: -0.5, tz: 3, ox: 0, oy: 0, oz: 0 },
    { mesh: ico, tx: 2, ty: 3, tz: -7, ox: 0, oy: 0, oz: 0 },
    { mesh: dodec, tx: -2, ty: -2, tz: 2, ox: 0, oy: 0, oz: 0 },
  ];
  animObjs.forEach(o => {
    o.ox = (Math.random() - 0.5) * ENTRY_SPAWN_RANGE_X;
    o.oy = (Math.random() - 0.5) * ENTRY_SPAWN_RANGE_Y;
    o.oz = (Math.random() - 0.5) * ENTRY_SPAWN_RANGE_Z;
    o.mesh.position.set(o.tx + o.ox, o.ty + o.oy, o.tz + o.oz);
  });

  const startTime = performance.now();

  return {
    scene, camera, renderer, canvas,
    torus1, torus2, cubeEdges, octa, ico, dodec,
    particles, grid, geoGroup,
    glowMeshes, solidMats, lineMeshes, dotMeshes,
    animObjs, pFinal, pPos, particleCount, startTime, timeMood,
  };
}

export function updateTheme(sd: SceneDeps, isDark: boolean): void {
  const bgR = isDark ? 22 : 250;
  const bgG = isDark ? 25 : 251;
  const bgB = isDark ? 30 : 252;
  const bgHex = (bgR << 16) | (bgG << 8) | bgB;

  const tw = isDark ? TIME_TWEAKS_DARK[sd.timeMood] : TIME_TWEAKS[sd.timeMood];
  const accentHex = (tw.accentR << 16) | (tw.accentG << 8) | tw.accentB;

  sd.renderer.setClearColor(bgHex, 1);
  (sd.scene.fog as THREE.FogExp2).color.setHex(bgHex);
  (sd.scene.fog as THREE.FogExp2).density = FOG_DENSITY * tw.fogMul;

  // Update all accent-colored materials
  const wireable = [sd.torus1, sd.torus2, sd.octa, sd.ico, sd.dodec];
  wireable.forEach(m => { (m.material as THREE.MeshBasicMaterial).color.setHex(accentHex); });
  sd.lineMeshes.forEach(l => { (l.material as THREE.LineBasicMaterial).color.setHex(accentHex); });
  (sd.cubeEdges.material as THREE.LineBasicMaterial).color.setHex(accentHex);
  sd.dotMeshes.forEach(m => { (m.material as THREE.MeshBasicMaterial).color.setHex(accentHex); });
  sd.solidMats.forEach(m => { m.color.setHex(accentHex); });
  (sd.particles.material as THREE.PointsMaterial).color.setHex(accentHex);
  ((sd.grid.material as THREE.Material[])[0] || sd.grid.material as THREE.Material).color.setHex(accentHex);

  // Update grid
  (sd.grid.material as THREE.Material).transparent = true;
}
