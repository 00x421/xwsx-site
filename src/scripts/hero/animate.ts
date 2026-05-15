import * as THREE from 'three';
import {
  ACCENT_HEX, CAM_LERP, CAM_RESET_RATE,
  CAM_LOOK_STRENGTH_X, CAM_LOOK_STRENGTH_Y,
  ENTRY_DURATION, GEO_IDLE_ROTATION_SPEED,
  PARTICLE_FLOW_SPEED, PARTICLE_FLOAT_AMPLITUDE,
  PARTICLE_REPEL_RADIUS, PARTICLE_REPEL_FORCE,
  PARTICLE_RESPAWN_OFFSET, PARTICLE_RESPAWN_BEHIND,
  PARTICLE_FIELD_X, PARTICLE_FIELD_Y,
  GLOW_RADIUS, GLOW_OPACITY_BOOST, GLOW_SOLID_BOOST, GLOW_BRIGHT_THRESHOLD,
} from './constants';
import type { SceneDeps } from './scene';
import type { ControlsHandle } from './controls';

export interface AnimateDeps {
  scene: SceneDeps;
  controls: ControlsHandle;
  charWraps: NodeListOf<HTMLElement>;
  updateProjection: () => void;
  resetBtn: HTMLElement | null;
  onFrame?: () => void;
}

const BRIGHT_HEX = 0x9bb5cc;

export function createAnimator(deps: AnimateDeps): { start: () => void; dispose: () => void } {
  const { scene, controls, charWraps, updateProjection, resetBtn, onFrame } = deps;
  let rafId = 0;

  const _ray = new THREE.Vector3();
  const _glowOrigin = new THREE.Vector3();
  const _worldPos = new THREE.Vector3();
  const defaultCam = new THREE.Vector3(0, 0, 8);

  // Pre-computed float offsets per geometry
  const floatConfigs = [
    { speed: 0.5, amp: 0.3, phase: 0 },
    { speed: 0.7, amp: 0.2, phase: 1 },
    { speed: 0.4, amp: 0.15, phase: 0 },
    { speed: 0.6, amp: 0.25, phase: 2 },
    { speed: 0.3, amp: 0.2, phase: 0 },
    { speed: 0.5, amp: 0.15, phase: 3 },
  ];

  function animateEntry(animObjs: AnimEntry[], t: number, entryT: number): void {
    const entryEase = 1 - Math.pow(1 - entryT, 3);
    const easeOff = 1 - entryEase;

    animObjs.forEach((o, i) => {
      const fc = floatConfigs[i];
      const floatY = Math.sin(t * fc.speed + fc.phase) * fc.amp * entryEase;
      o.mesh.position.set(
        o.tx + o.ox * easeOff,
        o.ty + o.oy * easeOff + floatY,
        o.tz + o.oz * easeOff,
      );
    });
  }

  function animateGeometryRotation(t: number): void {
    scene.torus1.rotation.x = t * 0.15;
    scene.torus1.rotation.y = t * 0.1;
    scene.torus2.rotation.x = -t * 0.2;
    scene.torus2.rotation.z = t * 0.15;
    scene.cubeEdges.rotation.x = t * 0.3;
    scene.cubeEdges.rotation.y = t * 0.2;
    scene.octa.rotation.y = t * 0.25;
    scene.ico.rotation.x = t * 0.1;
    scene.ico.rotation.z = t * 0.15;
    scene.dodec.rotation.x = t * 0.3;
    scene.dodec.rotation.y = t * 0.2;
  }

  function animateParticles(t: number, entryT: number, mlX: number, mlY: number): void {
    const { pPos, pFinal, particleCount } = scene;

    if (entryT < 1) {
      for (let i = 0; i < particleCount * 3; i++) {
        pPos[i] = pFinal[i] * (1 - Math.pow(1 - entryT, 3));
      }
    } else {
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        pPos[i3 + 2] += PARTICLE_FLOW_SPEED;
        pPos[i3 + 1] += Math.sin(t * 0.5 + i * 0.3) * PARTICLE_FLOAT_AMPLITUDE;

        // Repel from cursor
        const dx = pPos[i3] - mlX;
        const dy = pPos[i3 + 1] - mlY;
        const dz = pPos[i3 + 2];
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (d < PARTICLE_REPEL_RADIUS && d > 0.01) {
          const force = (1 - d / PARTICLE_REPEL_RADIUS) * PARTICLE_REPEL_FORCE;
          pPos[i3]     += (dx / d) * force;
          pPos[i3 + 1] += (dy / d) * force;
          pPos[i3 + 2] += (dz / d) * force * 0.3;
        }

        if (pPos[i3 + 2] > scene.camera.position.z + PARTICLE_RESPAWN_OFFSET) {
          pPos[i3]     = (Math.random() - 0.5) * PARTICLE_FIELD_X;
          pPos[i3 + 1] = (Math.random() - 0.5) * PARTICLE_FIELD_Y;
          pPos[i3 + 2] = scene.camera.position.z - PARTICLE_RESPAWN_OFFSET - Math.random() * PARTICLE_RESPAWN_BEHIND;
        }
      }
    }
    scene.particles.geometry.attributes.position.needsUpdate = true;
  }

  function animateGlow(mlX: number, mlY: number): void {
    _glowOrigin.set(mlX, mlY, 0);

    scene.glowMeshes.forEach(({ mesh, baseOpacity }) => {
      const dist = _glowOrigin.distanceTo(mesh.getWorldPosition(_worldPos));
      const glow = Math.max(0, 1 - dist / GLOW_RADIUS);
      const mat = mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = baseOpacity + glow * GLOW_OPACITY_BOOST;
      mat.color.setHex(glow > GLOW_BRIGHT_THRESHOLD ? BRIGHT_HEX : ACCENT_HEX);
    });

    scene.solidMats.forEach((m, idx) => {
      const parent = [scene.octa, scene.ico, scene.dodec][idx];
      const dist = _glowOrigin.distanceTo(parent.getWorldPosition(_worldPos));
      const glow = Math.max(0, 1 - dist / GLOW_RADIUS);
      m.opacity = [0.08, 0.06, 0.08][idx] + glow * GLOW_SOLID_BOOST;
    });
  }

  function animateCharWraps(t: number): void {
    charWraps.forEach((w, i) => {
      const cy = Math.sin(t * 1.0 + i * 0.9) * 5;
      const s = w.classList.contains('lit') ? 'scale(1.15)' : '';
      w.style.transform = `translateY(${cy}px) ${s}`;
    });
  }

  function getMouseWorld(mx: number, my: number): { mlX: number; mlY: number } {
    _ray.set(
      (mx / innerWidth) * 2 - 1,
      -(my / innerHeight) * 2 + 1,
      0.5,
    ).unproject(scene.camera).sub(scene.camera.position).normalize();
    const mT = -scene.camera.position.z / _ray.z;
    return {
      mlX: scene.camera.position.x + _ray.x * mT,
      mlY: scene.camera.position.y + _ray.y * mT,
    };
  }

  function loop(): void {
    rafId = requestAnimationFrame(loop);
    const t = performance.now() * 0.001;

    // Auto-reset when idle
    if (!controls.isDragging) controls.targetPos.lerp(defaultCam, CAM_RESET_RATE);

    // Camera lerp
    scene.camera.position.lerp(controls.targetPos, CAM_LERP);

    // Subtle look-at
    scene.camera.lookAt(
      (controls.mx / innerWidth - 0.5) * CAM_LOOK_STRENGTH_X,
      -(controls.my / innerHeight - 0.5) * CAM_LOOK_STRENGTH_Y,
      0,
    );

    // Mouse 3D projection
    const { mlX, mlY } = getMouseWorld(controls.mx, controls.my);

    // Entry animation
    const entryT = Math.min(
      (performance.now() - scene.startTime) / (ENTRY_DURATION * 1000), 1,
    );
    animateEntry(scene.animObjs, t, entryT);

    // Geometry self-rotation
    animateGeometryRotation(t);

    // Idle orbit
    scene.geoGroup.rotation.y = t * GEO_IDLE_ROTATION_SPEED;

    // Particles
    animateParticles(t, entryT, mlX, mlY);

    // Glow
    animateGlow(mlX, mlY);

    // Character float
    animateCharWraps(t);

    // Text projection
    updateProjection();

    // Reset button
    resetBtn?.classList.toggle('visible', controls.targetPos.distanceTo(defaultCam) > 0.5);

    // External hook (lens, etc.)
    onFrame?.();

    scene.renderer.render(scene.scene, scene.camera);
  }

  return {
    start: () => { rafId = requestAnimationFrame(loop); },
    dispose: () => cancelAnimationFrame(rafId),
  };
}
