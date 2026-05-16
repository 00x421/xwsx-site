export function initGlobalInteractions(): void {
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

  // 3D tilt + glow (for article/app cards)
  document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rx = ((y - rect.height / 2) / (rect.height / 2)) * -6;
      const ry = ((x - rect.width / 2) / (rect.width / 2)) * 6;
      (card as HTMLElement).style.setProperty('--mx', x + 'px');
      (card as HTMLElement).style.setProperty('--my', y + 'px');
      card.style.transform =
        `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.02,1.02,1.02)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });

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
