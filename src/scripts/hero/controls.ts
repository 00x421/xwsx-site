import * as THREE from 'three';
import {
  DEFAULT_CAM_POS, CAM_CLAMP_X, CAM_CLAMP_Y, CAM_CLAMP_Z,
  CAM_LERP, CAM_RESET_RATE,
  DRAG_SENSITIVITY, DRAG_THRESHOLD, SCROLL_SENSITIVITY,
  TOUCH_DRAG_SENSITIVITY, TOUCH_PINCH_SENSITIVITY,
} from './constants';

export interface ControlsHandle {
  targetPos: THREE.Vector3;
  isDragging: boolean;
  hasDragged: boolean;
  mx: number;
  my: number;
  dispose: () => void;
}

export function createControls(
  camera: THREE.PerspectiveCamera,
  resetBtn: HTMLElement | null,
  dragHint: HTMLElement | null,
): ControlsHandle {
  const targetPos = DEFAULT_CAM_POS.clone();
  let _isDragging = false;
  let _hasDragged = false;
  let _mx = innerWidth / 2, _my = innerHeight / 2;
  let dragStartX = 0, dragStartY = 0;
  let dragStartPX = 0, dragStartPY = 0;
  let touchStartDist = 0, touchStartZ = 0;

  const ac = new AbortController();

  function isInteractive(el: HTMLElement): boolean {
    return !!el.closest('a, button, input, .music-player');
  }

  function clampCam(pos: THREE.Vector3): void {
    pos.x = THREE.MathUtils.clamp(pos.x, ...CAM_CLAMP_X);
    pos.y = THREE.MathUtils.clamp(pos.y, ...CAM_CLAMP_Y);
    pos.z = THREE.MathUtils.clamp(pos.z, ...CAM_CLAMP_Z);
  }

  function updateResetBtn(): void {
    resetBtn?.classList.toggle('visible', targetPos.distanceTo(DEFAULT_CAM_POS) > 0.5);
  }

  // Mouse drag
  document.addEventListener('mousedown', e => {
    if (isInteractive(e.target as HTMLElement)) return;
    _isDragging = true; _hasDragged = false;
    dragStartX = e.clientX; dragStartY = e.clientY;
    dragStartPX = targetPos.x; dragStartPY = targetPos.y;
  }, { signal: ac.signal });

  document.addEventListener('mousemove', e => {
    _mx = e.clientX; _my = e.clientY;
    if (!_isDragging) return;
    const dx = e.clientX - dragStartX, dy = e.clientY - dragStartY;
    if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) _hasDragged = true;
    targetPos.x = dragStartPX - dx * DRAG_SENSITIVITY;
    targetPos.y = dragStartPY + dy * DRAG_SENSITIVITY;
    clampCam(targetPos);
  }, { signal: ac.signal });

  document.addEventListener('mouseup', () => {
    if (!_isDragging) return;
    _isDragging = false;
    updateResetBtn();
    if (_hasDragged && dragHint) dragHint.classList.add('hidden');
  }, { signal: ac.signal });

  document.addEventListener('contextmenu', e => {
    if (!isInteractive(e.target as HTMLElement)) e.preventDefault();
  }, { signal: ac.signal });

  // Scroll zoom
  document.addEventListener('wheel', e => {
    if (isInteractive(e.target as HTMLElement)) return;
    e.preventDefault();
    targetPos.z += e.deltaY * SCROLL_SENSITIVITY;
    clampCam(targetPos);
    updateResetBtn();
  }, { passive: false, signal: ac.signal });

  // Touch
  document.addEventListener('touchstart', e => {
    if (isInteractive(e.target as HTMLElement)) return;
    if (e.touches.length === 1) {
      const t = e.touches[0];
      _isDragging = true; _hasDragged = false;
      dragStartX = t.clientX; dragStartY = t.clientY;
      dragStartPX = targetPos.x; dragStartPY = targetPos.y;
    } else if (e.touches.length === 2) {
      touchStartDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
      touchStartZ = targetPos.z;
    }
  }, { passive: true, signal: ac.signal });

  document.addEventListener('touchmove', e => {
    if (e.touches.length === 1 && _isDragging) {
      const t = e.touches[0];
      _mx = t.clientX; _my = t.clientY;
      const dx = t.clientX - dragStartX, dy = t.clientY - dragStartY;
      if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) _hasDragged = true;
      targetPos.x = dragStartPX - dx * TOUCH_DRAG_SENSITIVITY;
      targetPos.y = dragStartPY + dy * TOUCH_DRAG_SENSITIVITY;
      clampCam(targetPos);
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
      targetPos.z = touchStartZ + (touchStartDist - dist) * TOUCH_PINCH_SENSITIVITY;
      clampCam(targetPos);
    }
  }, { passive: true, signal: ac.signal });

  document.addEventListener('touchend', () => {
    if (!_isDragging) return;
    _isDragging = false;
    updateResetBtn();
    if (_hasDragged && dragHint) dragHint.classList.add('hidden');
  }, { signal: ac.signal });

  // Reset button
  resetBtn?.addEventListener('click', () => {
    targetPos.copy(DEFAULT_CAM_POS);
    resetBtn.classList.remove('visible');
  }, { signal: ac.signal });

  // Resize
  window.addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
  }, { signal: ac.signal });

  return {
    targetPos,
    get isDragging() { return _isDragging; },
    get hasDragged() { return _hasDragged; },
    get mx() { return _mx; },
    get my() { return _my; },
    dispose: () => ac.abort(),
  };
}
