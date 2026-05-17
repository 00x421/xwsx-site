import * as THREE from 'three';
import type { SceneDeps, MeshData } from './scene';
import { applyTheme, updateContainerSize } from './scene';

export function setupInteraction(sd: SceneDeps): void {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const container = sd.container;

  const tooltip = document.getElementById('skill-tooltip')!;
  const ttName = document.getElementById('tt-name')!;
  const ttCat = document.getElementById('tt-cat')!;

  let dragging = false;
  let dragMoved = false;
  let lastX = 0, lastY = 0;
  let hovered: MeshData | null = null;
  let selected: MeshData | null = null;

  function getHit(cx: number, cy: number) {
    const rect = container.getBoundingClientRect();
    mouse.x = ((cx - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((cy - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, sd.camera);
    return raycaster.intersectObjects(sd.planetMeshes);
  }

  function hover(md: MeshData) {
    md.mesh.material.emissiveIntensity = 0.7;
    md.mesh.scale.setScalar(1.35);
  }

  function unhover(md: MeshData) {
    md.mesh.material.emissiveIntensity = 0.2;
    md.mesh.scale.setScalar(1);
  }

  function showTooltip(cx: number, cy: number, md: MeshData) {
    ttName.textContent = md.skill.name;
    ttName.style.color = md.skill.color;
    ttCat.textContent = md.skill.cat;
    const tw = tooltip.offsetWidth;
    tooltip.style.left = (cx - tw / 2) + 'px';
    tooltip.style.top = (cy - 44) + 'px';
    tooltip.classList.add('show');
  }

  function hideTooltip() { tooltip.classList.remove('show'); }

  // ── Panel ──
  const panel = document.getElementById('skill-panel')!;
  const overlay = document.getElementById('panel-overlay')!;
  const panelClose = document.getElementById('panel-close')!;

  function openPanel(md: MeshData) {
    selected = md;
    hideTooltip();
    hover(md);

    const rect = container.getBoundingClientRect();
    const worldPos = new THREE.Vector3();
    md.mesh.getWorldPosition(worldPos);
    sd.selRingGroup.position.copy(worldPos);
    sd.selRingGroup.rotation.x = 0;
    sd.selRingGroup.rotation.y = 0;
    sd.selRing.material.opacity = 0.5;

    const s = md.skill;
    // Update badge
    const badge = panel.querySelector('.p-badge') as HTMLElement;
    badge.textContent = s.cat;
    badge.style.background = s.color + '18';
    badge.style.color = s.color;

    panel.querySelector('.p-title')!.textContent = s.name;
    panel.querySelector('.p-desc')!.textContent = s.desc;

    // Level bar
    const levelBar = panel.querySelector('.p-level')!;
    levelBar.innerHTML = '';
    for (let i = 0; i < 5; i++) {
      const seg = document.createElement('div');
      seg.className = 'p-seg' + (i < s.level ? ' fill' : '');
      if (i < s.level) (seg as HTMLElement).style.background = s.color;
      levelBar.appendChild(seg);
    }

    // Tags
    const tagsEl = panel.querySelector('.p-tags')!;
    tagsEl.innerHTML = '';
    s.tags.forEach(t => {
      const span = document.createElement('span');
      span.className = 'p-tag';
      span.textContent = t;
      tagsEl.appendChild(span);
    });

    panel.classList.add('open');
    overlay.classList.add('open');
  }

  function closePanel() {
    if (selected) { unhover(selected); selected = null; }
    sd.selRing.material.opacity = 0;
    panel.classList.remove('open');
    overlay.classList.remove('open');
  }

  panelClose.addEventListener('click', closePanel);
  overlay.addEventListener('click', closePanel);

  // ── Mouse events ──
  container.addEventListener('pointerdown', (e: PointerEvent) => {
    dragging = true;
    dragMoved = false;
    lastX = e.clientX;
    lastY = e.clientY;
  });

  container.addEventListener('pointermove', (e: PointerEvent) => {
    if (dragging) {
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) dragMoved = true;
      sd.targetRotY += dx * 0.006;
      sd.targetRotX = Math.max(-0.7, Math.min(0.7, sd.targetRotX + dy * 0.004));
      lastX = e.clientX;
      lastY = e.clientY;
      container.style.cursor = 'grabbing';
      return;
    }

    const hits = getHit(e.clientX, e.clientY);
    if (hits.length > 0) {
      const md = sd.meshData.find(m => m.mesh === hits[0].object);
      if (md) {
        if (md !== hovered) {
          if (hovered && hovered !== selected) unhover(hovered);
          hovered = md;
          if (md !== selected) hover(md);
        }
        container.style.cursor = 'pointer';
        if (md !== selected) showTooltip(e.clientX, e.clientY, md);
        return;
      }
    }
    if (hovered && hovered !== selected) unhover(hovered);
    hovered = null;
    container.style.cursor = 'default';
    hideTooltip();
  });

  container.addEventListener('pointerup', (e: PointerEvent) => {
    if (!dragging) return;
    dragging = false;
    container.style.cursor = 'default';
    if (!dragMoved) {
      const hits = getHit(e.clientX, e.clientY);
      if (hits.length > 0) {
        const md = sd.meshData.find(m => m.mesh === hits[0].object);
        if (md) { openPanel(md); return; }
      }
      if (selected) closePanel();
    }
  });

  container.addEventListener('pointerleave', () => {
    dragging = false;
    if (hovered && hovered !== selected) unhover(hovered);
    hovered = null;
    hideTooltip();
  });

  // ── Touch ──
  let touchMoved = false;
  container.addEventListener('touchstart', (e: TouchEvent) => {
    if (e.touches.length === 1) {
      dragging = true;
      dragMoved = false;
      touchMoved = false;
      lastX = e.touches[0].clientX;
      lastY = e.touches[0].clientY;
    }
  }, { passive: true });
  container.addEventListener('touchmove', (e: TouchEvent) => {
    if (dragging && e.touches.length === 1) {
      touchMoved = true;
      const dx = e.touches[0].clientX - lastX;
      const dy = e.touches[0].clientY - lastY;
      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) dragMoved = true;
      sd.targetRotY += dx * 0.006;
      sd.targetRotX = Math.max(-0.7, Math.min(0.7, sd.targetRotX + dy * 0.004));
      lastX = e.touches[0].clientX;
      lastY = e.touches[0].clientY;
    }
  }, { passive: true });
  container.addEventListener('touchend', (e: TouchEvent) => {
    dragging = false;
    if (!dragMoved && e.changedTouches.length) {
      const t = e.changedTouches[0];
      const hits = getHit(t.clientX, t.clientY);
      if (hits.length > 0) {
        const md = sd.meshData.find(m => m.mesh === hits[0].object);
        if (md) { openPanel(md); return; }
      }
      if (selected) closePanel();
    }
  }, { passive: true });

  // ── Skills list click (delegation) ──
  document.getElementById('skillsList')?.addEventListener('click', (e: Event) => {
    const item = (e.target as HTMLElement).closest('.skill-item') as HTMLElement;
    if (!item) return;
    const name = item.dataset.name;
    if (!name) return;
    const md = sd.meshData.find(m => m.skill.name === name);
    if (md) openPanel(md);
  });

  // ── Theme change ──
  window.addEventListener('theme-change', ((e: CustomEvent) => {
    applyTheme(sd, e.detail);
  }) as EventListener);

  // ── Resize ──
  const ro = new ResizeObserver(() => updateContainerSize(sd));
  ro.observe(container);
}
