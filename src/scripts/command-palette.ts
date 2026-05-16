interface PaletteItem {
  label: string;
  desc?: string;
  action: () => void;
  keywords: string[];
}

export function initCommandPalette(): void {
  // Build items
  const items: PaletteItem[] = [
    { label: '首页', desc: '/', action: () => navigate('/'), keywords: ['home', 'index'] },
    { label: '文章', desc: '/articles/', action: () => navigate('/articles/'), keywords: ['article', 'blog'] },
    { label: '应用', desc: '/apps/', action: () => navigate('/apps/'), keywords: ['app', 'tool'] },
    { label: '关于', desc: '/about/', action: () => navigate('/about/'), keywords: ['about', 'me'] },
    { label: '切换主题', desc: '明/暗模式', action: () => toggleTheme(), keywords: ['theme', 'dark', 'light', 'dark mode'] },
  ];

  // Collect article links from the current page
  document.querySelectorAll<HTMLElement>('.article-entry[data-slug]').forEach(el => {
    const slug = el.dataset.slug || '';
    const title = el.querySelector('.entry-title')?.textContent || slug;
    items.push({
      label: title,
      desc: `/articles/${slug}/`,
      action: () => navigate(`/articles/${slug}/`),
      keywords: [title.toLowerCase(), slug],
    });
  });

  // Create DOM
  const overlay = document.createElement('div');
  overlay.className = 'cmd-overlay';
  overlay.id = 'cmdOverlay';

  const palette = document.createElement('div');
  palette.className = 'cmd-palette';

  const input = document.createElement('input');
  input.className = 'cmd-input';
  input.placeholder = '搜索页面、文章、或输入命令...';
  input.autocomplete = 'off';

  const list = document.createElement('div');
  list.className = 'cmd-list';

  palette.appendChild(input);
  palette.appendChild(list);
  overlay.appendChild(palette);
  document.body.appendChild(overlay);

  let selectedIdx = 0;

  function render(filter: string) {
    const q = filter.toLowerCase().trim();
    const filtered = q
      ? items.filter(it =>
          it.label.toLowerCase().includes(q) ||
          it.keywords.some(k => k.includes(q)) ||
          (it.desc && it.desc.toLowerCase().includes(q)))
      : items;

    list.innerHTML = '';
    selectedIdx = 0;

    filtered.forEach((it, i) => {
      const row = document.createElement('button');
      row.className = 'cmd-item' + (i === 0 ? ' selected' : '');
      row.innerHTML = `<span class="cmd-item-label">${it.label}</span>${it.desc ? `<span class="cmd-item-desc">${it.desc}</span>` : ''}`;
      row.addEventListener('click', () => { close(); it.action(); });
      row.addEventListener('mouseenter', () => {
        list.querySelectorAll('.selected').forEach(s => s.classList.remove('selected'));
        row.classList.add('selected');
        selectedIdx = i;
      });
      list.appendChild(row);
    });

    if (filtered.length === 0) {
      list.innerHTML = '<div class="cmd-empty">没有匹配结果</div>';
    }
  }

  function open() {
    overlay.classList.add('open');
    input.value = '';
    render('');
    requestAnimationFrame(() => input.focus());
  }

  function close() {
    overlay.classList.remove('open');
    input.value = '';
  }

  // Keyboard shortcut
  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      overlay.classList.contains('open') ? close() : open();
    }
    if (e.key === 'Escape' && overlay.classList.contains('open')) {
      close();
    }
  });

  // Click outside to close
  overlay.addEventListener('click', e => {
    if (e.target === overlay) close();
  });

  // Input filtering
  input.addEventListener('input', () => render(input.value));

  // Keyboard navigation
  input.addEventListener('keydown', e => {
    const all = list.querySelectorAll<HTMLButtonElement>('.cmd-item');
    if (!all.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      all[selectedIdx]?.classList.remove('selected');
      selectedIdx = (selectedIdx + 1) % all.length;
      all[selectedIdx]?.classList.add('selected');
      all[selectedIdx]?.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      all[selectedIdx]?.classList.remove('selected');
      selectedIdx = (selectedIdx - 1 + all.length) % all.length;
      all[selectedIdx]?.classList.add('selected');
      all[selectedIdx]?.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      all[selectedIdx]?.click();
    }
  });
}

function navigate(url: string) {
  window.location.href = url;
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
}
