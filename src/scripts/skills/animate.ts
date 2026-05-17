import type { SceneDeps } from './scene';

export function startAnimation(sd: SceneDeps): void {
  function tick(time: number) {
    requestAnimationFrame(tick);
    const t = time * 0.001;

    // Auto rotate
    sd.targetRotY += 0.001;

    // Smooth drag
    sd.root.rotation.y += (sd.targetRotY - sd.root.rotation.y) * 0.05;
    sd.root.rotation.x += (sd.targetRotX - sd.root.rotation.x) * 0.05;

    // Orbit planets
    sd.meshData.forEach(d => {
      const a = d.baseAngle + t * d.orbitSpeed;
      d.mesh.position.x = Math.cos(a) * d.radius;
      d.mesh.position.z = Math.sin(a) * d.radius;
      d.mesh.position.y = Math.sin(a * 1.5 + d.orbIdx * 2) * 0.10;
    });

    // Core slow spin
    sd.wire.rotation.y = t * 0.04;
    sd.wire.rotation.x = t * 0.025;
    sd.core.rotation.y = t * 0.02;

    // Selection ring pulse
    if (sd.selRing.material.opacity > 0.01) {
      const pulse = 0.35 + Math.sin(t * 2) * 0.15;
      sd.selRing.material.opacity = pulse;
      sd.selRingGroup.rotation.z = t * 0.5;
    }

    sd.renderer.render(sd.scene, sd.camera);
  }
  requestAnimationFrame(tick);
}
