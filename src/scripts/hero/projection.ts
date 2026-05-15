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
    const RAD2DEG = 180 / Math.PI;

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

      // Tilt = viewing angle change from default camera position
      const relX = camera.position.x - worldPos.x;
      const relY = camera.position.y - worldPos.y;
      const relZ = camera.position.z - worldPos.z;
      const defRelX = DEFAULT_CAM_POS.x - worldPos.x;
      const defRelY = DEFAULT_CAM_POS.y - worldPos.y;
      const defRelZ = DEFAULT_CAM_POS.z - worldPos.z;

      const tiltY = (-Math.atan2(relX, relZ) + Math.atan2(defRelX, defRelZ)) * RAD2DEG;
      const tiltX = (Math.atan2(relY, relZ) - Math.atan2(defRelY, defRelZ)) * RAD2DEG;

      el.style.left = sx + 'px';
      el.style.top = sy + 'px';
      el.style.transform = `translate(-50%, -50%) scale(${scale}) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
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
