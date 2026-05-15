import {
  CHAR_CONTENT, REVEAL_DELAYS,
  TYPEWRITER_BASE_DELAY, TYPEWRITER_JITTER,
  TYPEWRITER_START_DELAY, CURSOR_FADE_DELAY,
  CLOCK_INTERVAL, DRAG_HINT_SHOW_DELAY, DRAG_HINT_AUTO_HIDE,
  LENS_LERP,
} from './constants';
import type { ControlsHandle } from './controls';

export interface UIDeps {
  controls: ControlsHandle;
  h3dGreeting: HTMLElement | null;
  h3dClock: HTMLElement | null;
  h3dType: HTMLElement | null;
  h3dDescEl: HTMLElement | null;
  charWraps: NodeListOf<HTMLElement>;
  lens: HTMLElement | null;
  lt1: HTMLElement | null;
  lt2: HTMLElement | null;
  ls: HTMLElement | null;
  dragHint: HTMLElement | null;
  textNodes: { el: HTMLElement }[];
}

export interface UIHandle {
  dispose: () => void;
}

export function initUI(deps: UIDeps): UIHandle {
  const {
    controls, h3dGreeting, h3dClock, h3dType, h3dDescEl,
    charWraps, lens, lt1, lt2, ls, dragHint, textNodes,
  } = deps;

  const intervals: ReturnType<typeof setInterval>[] = [];

  // --- Staggered reveal ---
  textNodes.forEach(({ el }) => {
    const id = el.id || [...el.classList].find(c => REVEAL_DELAYS[c]) || '';
    const delay = REVEAL_DELAYS[id] || 400;
    setTimeout(() => el.classList.add('revealed'), delay);
  });

  // --- Greeting ---
  if (h3dGreeting) {
    const h = new Date().getHours();
    h3dGreeting.textContent =
      h >= 5 && h < 12 ? '早上好' :
      h >= 12 && h < 18 ? '下午好' :
      h >= 18 && h < 22 ? '晚上好' :
      '夜深了，注意休息';
  }

  // --- Clock ---
  if (h3dClock) {
    function tick() {
      const d = new Date();
      h3dClock.textContent =
        [d.getHours(), d.getMinutes(), d.getSeconds()]
          .map(n => String(n).padStart(2, '0')).join(':');
    }
    tick();
    intervals.push(setInterval(tick, CLOCK_INTERVAL));
  }

  // --- Typewriter ---
  const typeText = h3dDescEl?.dataset.typewriter;
  if (h3dType && typeText) {
    setTimeout(() => {
      let i = 0;
      function type() {
        if (i < typeText.length) {
          h3dType.textContent += typeText[i];
          i++;
          setTimeout(type, TYPEWRITER_BASE_DELAY + Math.random() * TYPEWRITER_JITTER);
        } else {
          setTimeout(() => h3dType.nextElementSibling?.classList.add('done'), CURSOR_FADE_DELAY);
        }
      }
      type();
    }, TYPEWRITER_START_DELAY);
  }

  // --- Drag hint ---
  setTimeout(() => {
    if (dragHint && !controls.hasDragged) dragHint.classList.add('hidden');
  }, DRAG_HINT_AUTO_HIDE);

  // --- Lens on character hover ---
  let activeIdx = -1;
  let lensX = innerWidth / 2, lensY = innerHeight / 2;

  // This will be called from the animation loop or via its own rAF
  // For now, expose a function for the main loop to call
  function updateLens(): boolean {
    let anyLit = false;
    if (!controls.isDragging) {
      const hovered = document.elementFromPoint(controls.mx, controls.my);
      const charWrap = hovered ? (hovered as HTMLElement).closest('.char-wrap') : null;
      if (charWrap) {
        const idx = parseInt((charWrap as HTMLElement).dataset.idx || '0');
        charWraps.forEach(w => w.classList.remove('lit'));
        charWrap.classList.add('lit');
        if (activeIdx !== idx) {
          activeIdx = idx;
          const c = CHAR_CONTENT[idx];
          if (lt1) lt1.textContent = c.t1;
          if (lt2) lt2.textContent = c.t2;
          if (ls) ls.textContent = c.s;
        }
        lens?.classList.add('visible');
        lens?.classList.add('active');
        lensX += (controls.mx - lensX) * LENS_LERP;
        lensY += (controls.my - lensY) * LENS_LERP;
        if (lens) { lens.style.left = lensX + 'px'; lens.style.top = lensY + 'px'; }
        document.body.style.cursor = 'none';
        anyLit = true;
      }
    }
    if (!anyLit) {
      lens?.classList.remove('visible');
      lens?.classList.remove('active');
      charWraps.forEach(w => w.classList.remove('lit'));
      document.body.style.cursor = controls.isDragging ? 'grabbing' : '';
      activeIdx = -1;
    }
    return anyLit;
  }

  // Expose updateLens on the handle
  return {
    dispose: () => intervals.forEach(clearInterval),
    updateLens,
  } as UIHandle & { updateLens: () => boolean };
}
