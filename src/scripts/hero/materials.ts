import * as THREE from 'three';
import { ACCENT_HEX } from './constants';

export function createWireMat(opacity = 0.15): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({
    color: ACCENT_HEX,
    transparent: true,
    opacity,
    wireframe: true,
  });
}

export function createLineMat(opacity = 0.2): THREE.LineBasicMaterial {
  return new THREE.LineBasicMaterial({
    color: ACCENT_HEX,
    transparent: true,
    opacity,
  });
}

export function createCelestialMat(opacity = 0.18): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({
    color: ACCENT_HEX,
    transparent: true,
    opacity,
    side: THREE.DoubleSide,
  });
}

export function createSolidMat(opacity: number): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({
    color: ACCENT_HEX,
    transparent: true,
    opacity,
    side: THREE.DoubleSide,
  });
}

export function moonGeo(R: number): THREE.ShapeGeometry {
  const d = R * 0.6;
  const r = R * 0.7;
  const ix = (R * R - r * r + d * d) / (2 * d);
  const iy = Math.sqrt(Math.max(0.001, R * R - ix * ix));
  const outerA = Math.atan2(iy, ix);
  const innerA = Math.atan2(iy, ix - d);
  const s = new THREE.Shape();
  s.absarc(0, 0, R, -outerA, outerA, false);
  s.absarc(d, 0, r, innerA, -innerA, true);
  s.closePath();
  return new THREE.ShapeGeometry(s);
}

export function starGeo(outer: number): THREE.ShapeGeometry {
  const s = new THREE.Shape();
  const inner = outer * 0.35;
  for (let i = 0; i < 8; i++) {
    const radius = i % 2 === 0 ? outer : inner;
    const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
    i === 0
      ? s.moveTo(Math.cos(a) * radius, Math.sin(a) * radius)
      : s.lineTo(Math.cos(a) * radius, Math.sin(a) * radius);
  }
  s.closePath();
  return new THREE.ShapeGeometry(s);
}
