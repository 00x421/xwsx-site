import * as THREE from 'three';
import type { SkillData, ThemeColors } from './data';
import { skillsData, orbitConfigs, THEMES } from './data';

export interface MeshData {
  skill: SkillData;
  mesh: THREE.Mesh;
  baseAngle: number;
  orbitSpeed: number;
  radius: number;
  orbIdx: number;
}

export interface SceneDeps {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  canvas: HTMLCanvasElement;
  container: HTMLElement;
  root: THREE.Group;
  core: THREE.Mesh;
  wire: THREE.Mesh;
  glowMesh: THREE.Mesh;
  orbitGroups: THREE.Group[];
  planetMeshes: THREE.Mesh[];
  meshData: MeshData[];
  selRing: THREE.Mesh;
  selRingGroup: THREE.Group;
  stars: THREE.Points;
  clock: THREE.Clock;
  targetRotY: number;
  targetRotX: number;
  currentTheme: string;
}

export function createScene(canvas: HTMLCanvasElement, container: HTMLElement): SceneDeps {
  const theme = detectTheme();
  const colors = THEMES[theme];

  const w = container.clientWidth;
  const h = container.clientHeight;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(colors.bg);
  scene.fog = new THREE.FogExp2(colors.fog, 0.012);

  const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 500);
  camera.position.set(0, 1.5, 12);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(w, h);
  renderer.setClearColor(colors.bg, 1);

  const root = new THREE.Group();
  scene.add(root);

  const orbitGroups: THREE.Group[] = [];
  const planetMeshes: THREE.Mesh[] = [];
  const meshData: MeshData[] = [];

  // ── Lights ──
  scene.add(new THREE.AmbientLight(0x334455, 0.8));
  const sun = new THREE.PointLight(theme === 'dark' ? 0xffffff : 0x334466, 1.5, 80);
  sun.position.set(2, 3, 4);
  scene.add(sun);
  const fill = new THREE.PointLight(0x4466aa, 0.6, 50);
  fill.position.set(-6, 8, -4);
  scene.add(fill);

  // ── Core sphere ──
  const coreMat = new THREE.MeshStandardMaterial({
    color: colors.core,
    metalness: 0.1, roughness: 0.7,
    emissive: colors.coreEmissive, emissiveIntensity: 0.5,
  });
  const core = new THREE.Mesh(new THREE.SphereGeometry(1.0, 48, 48), coreMat);
  root.add(core);

  const wireMat = new THREE.MeshBasicMaterial({
    color: colors.wire, wireframe: true, transparent: true, opacity: 0.15,
  });
  const wire = new THREE.Mesh(new THREE.IcosahedronGeometry(1.05, 3), wireMat);
  root.add(wire);

  const glowMat = new THREE.MeshBasicMaterial({
    color: colors.glow, transparent: true, opacity: 0.03, side: THREE.BackSide,
  });
  const glowMesh = new THREE.Mesh(new THREE.SphereGeometry(2.0, 32, 32), glowMat);
  root.add(glowMesh);

  // ── Stars ──
  const starGeo = new THREE.BufferGeometry();
  const sv: number[] = [];
  for (let i = 0; i < 2000; i++) {
    sv.push((Math.random() - 0.5) * 200, (Math.random() - 0.5) * 200, (Math.random() - 0.5) * 200);
  }
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(sv, 3));
  const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({
    size: 0.08, color: 0xffffff, transparent: true, opacity: colors.starOpacity,
  }));
  scene.add(stars);

  // ── Orbits ──
  orbitConfigs.forEach((cfg, i) => {
    const g = new THREE.Group();
    g.rotation.x = cfg.tiltX;
    g.rotation.z = cfg.tiltZ;
    root.add(g);
    orbitGroups.push(g);

    const pts: THREE.Vector3[] = [];
    for (let j = 0; j <= 128; j++) {
      const a = (j / 128) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * cfg.r, 0, Math.sin(a) * cfg.r));
    }
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({
        color: colors.ring, transparent: true, opacity: theme === 'dark' ? 0.3 : 0.4,
      }),
    );
    g.add(line);
  });

  // ── Planets ──
  const perOrbit = Math.ceil(skillsData.length / orbitConfigs.length);

  skillsData.forEach((sk, i) => {
    const orbIdx = Math.min(Math.floor(i / perOrbit), orbitConfigs.length - 1);
    const skillsInThis = Math.min(perOrbit, skillsData.length - orbIdx * perOrbit);
    const idxInOrb = i - orbIdx * perOrbit;
    const cfg = orbitConfigs[orbIdx];

    const angle = (idxInOrb / skillsInThis) * Math.PI * 2;
    const sz = { 3: 0.22, 4: 0.28, 5: 0.36 }[sk.level] || 0.22;
    const col = new THREE.Color(sk.color);

    const mat = new THREE.MeshStandardMaterial({
      color: col, emissive: col, emissiveIntensity: 0.2,
      metalness: 0.15, roughness: 0.55,
    });
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(sz, 24, 24), mat);
    mesh.position.set(Math.cos(angle) * cfg.r, 0, Math.sin(angle) * cfg.r);
    orbitGroups[orbIdx].add(mesh);
    planetMeshes.push(mesh);

    meshData.push({
      skill: sk, mesh,
      baseAngle: angle,
      orbitSpeed: 0.06 + Math.random() * 0.05,
      radius: cfg.r, orbIdx,
    });
  });

  // ── Selection ring ──
  const selRingGroup = new THREE.Group();
  scene.add(selRingGroup);
  const selGeo = new THREE.RingGeometry(0.35, 0.40, 48);
  const selMat = new THREE.MeshBasicMaterial({
    color: 0xd4a574, transparent: true, opacity: 0, side: THREE.DoubleSide,
  });
  const selRing = new THREE.Mesh(selGeo, selMat);
  selRing.rotation.x = Math.PI / 2;
  selRingGroup.add(selRing);

  return {
    scene, camera, renderer, canvas, container, root, core, wire, glowMesh,
    orbitGroups, planetMeshes, meshData, selRing, selRingGroup, stars,
    clock: new THREE.Clock(),
    targetRotY: 0, targetRotX: 0,
    currentTheme: theme,
  };
}

function detectTheme(): string {
  if (typeof document === 'undefined') return 'dark';
  const attr = document.documentElement.getAttribute('data-theme');
  if (attr) return attr;
  if (window.matchMedia?.('(prefers-color-scheme: light)').matches) return 'light';
  return 'dark';
}

export function applyTheme(sd: SceneDeps, theme: string): void {
  const colors = THEMES[theme] || THEMES.dark;
  sd.currentTheme = theme;

  sd.scene.background = new THREE.Color(colors.bg);
  (sd.scene.fog as THREE.FogExp2).color.set(colors.fog);
  sd.renderer.setClearColor(colors.bg, 1);

  // Core
  (sd.core.material as THREE.MeshStandardMaterial).color.set(colors.core);
  (sd.core.material as THREE.MeshStandardMaterial).emissive.set(colors.coreEmissive);
  (sd.wire.material as THREE.MeshBasicMaterial).color.set(colors.wire);
  (sd.glowMesh.material as THREE.MeshBasicMaterial).color.set(colors.glow);

  // Stars
  (sd.stars.material as THREE.PointsMaterial).opacity = colors.starOpacity;

  // Orbit rings
  sd.orbitGroups.forEach(g => {
    g.children.forEach(child => {
      if (child.isLine) {
        (child as THREE.Line).material.color.set(colors.ring);
        (child as THREE.Line).material.opacity = theme === 'dark' ? 0.3 : 0.4;
      }
    });
  });
}

export function updateContainerSize(sd: SceneDeps): void {
  const w = sd.container.clientWidth;
  const h = sd.container.clientHeight;
  sd.camera.aspect = w / h;
  sd.camera.updateProjectionMatrix();
  sd.renderer.setSize(w, h);
}
