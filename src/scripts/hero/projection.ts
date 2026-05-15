import * as THREE from 'three';
import { DEFAULT_CAM_POS } from './constants';

export interface TextNodeEntry {
  el: HTMLElement;
  worldPos: THREE.Vector3;
}

export interface ProjectionHandle {
  update: () => void;
  dispose: () => void;
}

export function createProjection(
  camera: THREE.PerspectiveCamera,
  textNodes: TextNodeEntry[],
): ProjectionHandle {
  const _projVec = new THREE.Vector3();

  function update(): void {
    const w = innerWidth, h = innerHeight;
    textNodes.forEach(({ el, worldPos }) => {
      _projVec.copy(worldPos).project(camera);

      if (_projVec.z > 1) {
        el.style.opacity = '0';
        el.style.pointerEvents = 'none';
        return;
      }

      const sx = (_projVec.x * 0.5 + 0.5) * w;
      const sy = (-_projVec.y * 0.5 + 0.5) * h;
      const dist = camera.position.distanceTo(worldPos);
      const defaultDist = DEFAULT_CAM_POS.distanceTo(worldPos);
      const scale = THREE.MathUtils.clamp(defaultDist / dist, 0.4, 2.5);

      el.style.left = sx + 'px';
      el.style.top = sy + 'px';
      el.style.transform = `translate(-50%, -50%) scale(${scale})`;
      el.style.opacity = el.classList.contains('revealed')
        ? String(THREE.MathUtils.clamp(scale, 0.3, 1))
        : '0';
      el.style.pointerEvents = 'auto';
    });
  }

  return { update, dispose: () => {} };
}

export function collectTextNodes(): TextNodeEntry[] {
  const nodes: TextNodeEntry[] = [];
  document.querySelectorAll<HTMLElement>('.h3d-el').forEach(el => {
    const p = el.dataset.pos;
    if (!p) return;
    const [x, y, z] = p.split(',').map(Number);
    nodes.push({ el, worldPos: new THREE.Vector3(x, y, z) });
  });
  return nodes;
}
