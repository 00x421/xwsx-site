interface TimePalette {
  accent: string;
  accentHover: string;
  accentLight: string;
  glow: string;
  threeAccent: [number, number, number];
}

const PALETTES: Record<string, TimePalette> = {
  morning:  { accent: '#a0887a', accentHover: '#8f776a', accentLight: 'rgba(160,136,122,0.08)', glow: 'rgba(160,136,122,0.15)', threeAccent: [160, 136, 122] },
  afternoon: { accent: '#7b8ea8', accentHover: '#6a7f99', accentLight: 'rgba(123,142,168,0.08)', glow: 'rgba(123,142,168,0.15)', threeAccent: [123, 142, 168] },
  evening:  { accent: '#8a7ba8', accentHover: '#796a99', accentLight: 'rgba(138,123,168,0.08)', glow: 'rgba(138,123,168,0.15)', threeAccent: [138, 123, 168] },
  night:    { accent: '#6b8fa8', accentHover: '#5a7e99', accentLight: 'rgba(107,143,168,0.1)', glow: 'rgba(107,143,168,0.12)', threeAccent: [107, 143, 168] },
};

function applyTimePalette(): void {
  const h = new Date().getHours();
  const period = h >= 6 && h < 12 ? 'morning' : h >= 12 && h < 18 ? 'afternoon' : h >= 18 && h < 22 ? 'evening' : 'night';
  const p = PALETTES[period];
  const root = document.documentElement;
  root.style.setProperty('--accent', p.accent);
  root.style.setProperty('--accent-hover', p.accentHover);
  root.style.setProperty('--accent-light', p.accentLight);
  root.style.setProperty('--glow', p.glow);
  root.style.setProperty('--three-accent-r', String(p.threeAccent[0]));
  root.style.setProperty('--three-accent-g', String(p.threeAccent[1]));
  root.style.setProperty('--three-accent-b', String(p.threeAccent[2]));
}

export function initGlobalInteractions(): void {
  // Time-based accent palette
  applyTimePalette();

  // Console easter egg (only once per session)
  console.log('%c✦ 烦恼全無先生', 'color: #7b8ea8; font-size: 20px; font-weight: bold;');
  console.log('%c独立开发者 / 全栈工程师\n欢迎来到控制台，这里没有藏什么秘密（大概）', 'color: #99aabb; font-size: 11px;');

  // Page loader
  const loader = document.getElementById('loader');
  let loaderHidden = false;
  function hideLoader(): void {
    if (loaderHidden) return;
    loaderHidden = true;
    loader?.classList.add('loaded');
    setTimeout(() => loader?.remove(), 800);
  }
  window.addEventListener('load', () => setTimeout(hideLoader, 200));
  setTimeout(hideLoader, 1500);

  // Nav glassmorphism
  const nav = document.querySelector('.navbar');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
  }

  // Scroll reveal
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        revealObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  // Reading progress bar
  const progressBar = document.getElementById('reading-progress');
  const detailContent = document.querySelector('.detail-content');
  if (progressBar && detailContent) {
    window.addEventListener('scroll', () => {
      const top = detailContent.getBoundingClientRect().top;
      const height = detailContent.scrollHeight;
      const view = window.innerHeight;
      const scrolled = Math.max(-top, 0);
      const progress = Math.min(scrolled / (height - view), 1);
      progressBar.style.width = (progress * 100) + '%';
    }, { passive: true });
  }

  // Back to top
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      backToTop.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

// Immediately remove loader and reset overflow on navigation swaps
// (loader hide in initGlobalInteractions relies on load event which doesn't fire on swaps)
document.addEventListener('astro:after-swap', () => {
  document.getElementById('loader')?.remove();
  document.body.style.overflow = '';
});

// Konami Code easter egg
const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
let konamiIdx = 0;
document.addEventListener('keydown', e => {
  if (e.key === KONAMI[konamiIdx]) {
    konamiIdx++;
    if (konamiIdx === KONAMI.length) {
      konamiIdx = 0;
      triggerKonami();
    }
  } else {
    konamiIdx = 0;
  }
});

function triggerKonami(): void {
  // Create a burst of falling ✦ symbols
  for (let i = 0; i < 40; i++) {
    const el = document.createElement('div');
    el.textContent = '✦';
    el.style.cssText = `
      position: fixed;
      top: -20px;
      left: ${Math.random() * 100}vw;
      font-size: ${12 + Math.random() * 20}px;
      color: var(--accent);
      opacity: ${0.3 + Math.random() * 0.7};
      pointer-events: none;
      z-index: 99999;
      transition: transform ${2 + Math.random() * 2}s cubic-bezier(0.16,1,0.3,1), opacity ${2 + Math.random() * 2}s;
    `;
    document.body.appendChild(el);
    requestAnimationFrame(() => {
      el.style.transform = `translateY(${window.innerHeight + 40}px) rotate(${Math.random() * 720}deg)`;
      el.style.opacity = '0';
    });
    setTimeout(() => el.remove(), 5000);
  }
}
