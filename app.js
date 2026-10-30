/* ── Burbujas Nails — App principal ─────────────────────────── */
'use strict';

/* ─── Utilidades ─────────────────────────────────────────────── */
const esc = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

/* ─── Catálogo público canónico ────────────────────────────────
 * La versión del catálogo se publica mediante Git; nunca se toma el
 * contenido local de un antiguo panel "administrativo".
 */
function loadServices() {
  const services = Array.isArray(window.INITIAL_SERVICES) ? window.INITIAL_SERVICES : [];
  // La iconografía es local, tipada y no depende de la plataforma.
  return services.map(service => ({
    ...service,
    icon: ICON_PATHS[service.icon] ? service.icon : (CAT_ICON[service.category] || 'sparkles')
  }));
}
function loadGallery() {
  // Solo URLs HTTPS o rutas del origen actual; no usar esquemas ejecutables.
  const gallery = Array.isArray(window.INITIAL_GALLERY) ? window.INITIAL_GALLERY : [];
  return gallery.flatMap(item => {
    if (!item || typeof item.url !== 'string') return [];
    try {
      const target = new URL(item.url, window.location.href);
      const local = target.origin === window.location.origin;
      if (target.protocol !== 'https:' && !(local && target.protocol === 'http:')) return [];
      return [{ ...item, url: target.href }];
    } catch {
      return [];
    }
  });
}

/* ─── Sistema de iconos vectoriales Burbujas Nails ────────────
 * Iconos SVG locales, trazos homogéneos y sin peticiones externas.
 * Las rutas son constantes, nunca HTML proporcionado por clientes.
 */
const ICON_PATHS = Object.freeze({
  polish: '<rect x="7" y="10" width="10" height="11" rx="2.5"/><path d="M9 10V7h6v3M10 7V3h4v4M10 15h4"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 16l9 5 9-5"/>',
  sparkles: '<path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3ZM19 17l.6 1.4L21 19l-1.4.6L19 21l-.6-1.4L17 19l1.4-.6L19 17ZM5 3l.6 1.4L7 5l-1.4.6L5 7l-.6-1.4L3 5l1.4-.6L5 3Z"/>',
  brush: '<path d="m14 6 4 4M4 20c2.5.5 4.5-1 4-3l8.7-8.7a2.1 2.1 0 0 0-3-3L5 14c-2.5-.5-4 1.5-4 4 0 1 .5 2 3 2Z"/><path d="m17 3 .5-1M20 6l1-.5"/>',
  hand: '<path d="M8 12V6a1.5 1.5 0 0 1 3 0v5-7a1.5 1.5 0 0 1 3 0v7-5a1.5 1.5 0 0 1 3 0v6-3a1.5 1.5 0 0 1 3 0v7c0 4-2.5 6-6 6h-2c-2.5 0-4.5-1.5-6-4L3 15a1.8 1.8 0 0 1 2.5-2.5L8 15"/>',
  shield: '<path d="M12 2 20 6v6c0 5-3.4 8-8 10-4.6-2-8-5-8-10V6l8-4Z"/><path d="m9 12 2 2 4-4"/>',
  gem: '<path d="M6 4h12l4 6-10 11L2 10l4-6Z"/><path d="M2 10h20M9 4l-3 6 6 11 6-11-3-6"/>',
  refresh: '<path d="M20 11a8 8 0 0 0-14-5L4 8M4 4v4h4M4 13a8 8 0 0 0 14 5l2-2M20 20v-4h-4"/>',
  ruler: '<path d="M3 17 17 3l4 4L7 21l-4-4ZM12 8l3 3M9 11l2 2M6 14l3 3"/>',
  footprints: '<path d="M7 13c-2 1-3 3-3 5a3 3 0 0 0 6 0c0-2-1-4-3-5ZM17 10c-2 1-3 3-3 5a3 3 0 0 0 6 0c0-2-1-4-3-5Z"/><path d="M5 9V7M8 8V5M10 10V8M15 6V4M18 5V2M21 8V6"/>',
  flower: '<circle cx="12" cy="12" r="2"/><path d="M12 10c-5-7 5-9 4-3M14 11c7-6 9 4 3 4M13 14c5 7-5 9-5 3M10 13c-7 5-9-5-3-5M10 10c-2-8 7-7 6-3"/>',
  gift: '<rect x="3" y="9" width="18" height="12" rx="2"/><path d="M2 9h20M12 9v12M12 9c-4 0-7-1-7-4 0-2 3-3 5-1l2 5ZM12 9c4 0 7-1 7-4 0-2-3-3-5-1l-2 5Z"/>',
  droplet: '<path d="M12 2C9 7 5 11 5 15a7 7 0 0 0 14 0c0-4-4-8-7-13Z"/><path d="M9 16a3 3 0 0 0 3 3"/>',
  scissors: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="m8 8 12 12M8 16 20 4"/>',
  eye: '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  leaf: '<path d="M20 3C9 3 4 8 4 15a6 6 0 0 0 6 6c7 0 12-5 10-18Z"/><path d="M4 20c4-4 7-7 13-10"/>',
  heart: '<path d="M20.8 5.8c-2-2-5.2-2-7.2 0L12 7.4l-1.6-1.6a5.1 5.1 0 0 0-7.2 7.2l.5.5L12 21l8.3-8.3a5 5 0 0 0 .5-6.9Z"/>',
  pin: '<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.7"/>',
  message: '<path d="M20 11.5a8 8 0 0 1-8 8c-1.3 0-2.6-.3-3.7-.9L3 20l1.4-5.3A8 8 0 1 1 20 11.5Z"/><path d="M8 11h8M8 14h5"/>',
  card: '<rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="M3 10h18M7 15h4"/>'
});
const CAT_ICON = Object.freeze({
  'Uñas manos': 'polish',
  'Extensiones': 'gem',
  'Uñas pies': 'footprints',
  'Promociones': 'gift',
  'Retiros': 'scissors',
  'Pestañas y cejas': 'eye',
  'Extras': 'heart',
  'Todos': 'sparkles'
});
/* Temas boutique por categoría: constantes locales y clases controladas. */
const CAT_THEME = Object.freeze({
  'Uñas manos': 'is-manos',
  'Extensiones': 'is-extensiones',
  'Uñas pies': 'is-pies',
  'Promociones': 'is-promos',
  'Retiros': 'is-retiros',
  'Pestañas y cejas': 'is-cejas',
  'Extras': 'is-extras',
  'Todos': 'is-todos'
});
function categoryTheme(category) {
  return CAT_THEME[category] || 'is-todos';
}

function iconSvg(name) {
  const paths = ICON_PATHS[name] || ICON_PATHS.sparkles;
  return '<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ' +
    'aria-hidden="true" focusable="false">' + paths + '</svg>';
}

/* ─── Estado ─────────────────────────────────────────────────── */
let ALL_SERVICES = [];
let activeFilter = 'Todos';

/* ─── Render servicios ───────────────────────────────────────── */
function renderServices() {
  const container = document.getElementById('svcContainer');
  if (!container) return;

  ALL_SERVICES = loadServices();
  const cats = ['Todos', ...new Set(ALL_SERVICES.map(s => s.category))];

  // Filtros
  const frow = container.querySelector('.frow') || document.querySelector('.frow');
  if (frow) {
    frow.innerHTML = cats.map(c => `
      <button class="fb ${categoryTheme(c)}${c === activeFilter ? ' active' : ''}" data-cat="${esc(c)}" aria-pressed="${c === activeFilter}">${iconSvg(CAT_ICON[c])}<span>${esc(c)}</span></button>
    `).join('');
    frow.querySelectorAll('.fb').forEach(btn => {
      btn.addEventListener('click', () => {
        activeFilter = btn.dataset.cat;
        renderServiceList();
        frow.querySelectorAll('.fb').forEach(b => {
          b.classList.toggle('active', b === btn);
          b.setAttribute('aria-pressed', String(b === btn));
        });
      });
    });
  }

  renderServiceList();
}

function renderServiceList() {
  const list = document.getElementById('svcList');
  if (!list) return;

  const filtered = activeFilter === 'Todos'
    ? ALL_SERVICES
    : ALL_SERVICES.filter(s => s.category === activeFilter);

  if (!filtered.length) {
    list.innerHTML = `<p style="text-align:center;padding:2rem;color:var(--ink-50)">No hay servicios en esta categoría.</p>`;
    return;
  }

  list.innerHTML = filtered.map(s => `
    <article class="svc-card">
      <button type="button" class="svc-row" data-id="${esc(s.id)}"
        aria-expanded="false" aria-controls="det-${esc(s.id)}"
        aria-label="Detalles de ${esc(s.name)}">
        <span class="svc-ico ${categoryTheme(s.category)}" aria-hidden="true">${iconSvg(s.icon)}</span>
        <span class="svc-info">
          <span class="svc-name">${esc(s.name)}${s.popular ? ' <span class="badge-pop">Popular</span>' : ''}</span>
          <span class="svc-dur">${esc(s.duration || '')}</span>
        </span>
        <span class="svc-right"><span class="svc-price">${s.price && s.price.toLowerCase().includes('consultar')
          ? esc(s.price)
          : s.price ? '$' + esc(s.price) : '—'}</span></span>
        <span class="svc-toggle" aria-hidden="true">+</span>
      </button>
      <div class="svc-detail" id="det-${esc(s.id)}" hidden>
        <div class="svc-detail-inner">
          ${s.description ? `<p class="svc-desc">${esc(s.description)}</p>` : ''}
          ${Array.isArray(s.includes) && s.includes.length ? `<ul class="svc-includes">
            ${s.includes.map(item => `<li>${esc(item)}</li>`).join('')}
          </ul>` : ''}
          <a class="btn btn-primary btn-sm svc-agendar"
             target="_blank" rel="noopener noreferrer"
             href="https://wa.me/56930912644?text=Hola%2C%20quiero%20consultar%20disponibilidad%20para%20${encodeURIComponent(s.name)}">
            Consultar este servicio <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </article>
  `).join('');

  list.querySelectorAll('.svc-row').forEach(row => {
    row.addEventListener('click', () => {
      const details = document.getElementById('det-' + row.dataset.id);
      if (!details) return;
      const willOpen = details.hidden;
      list.querySelectorAll('.svc-row').forEach(button => {
        button.classList.remove('open');
        button.setAttribute('aria-expanded', 'false');
      });
      list.querySelectorAll('.svc-detail').forEach(detail => { detail.hidden = true; });
      details.hidden = !willOpen;
      if (willOpen) {
        row.classList.add('open');
        row.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

/* ─── Galería + Slideshow ────────────────────────────────────── */
function renderGallery() {
  const grid = document.getElementById('galleryGrid');
  if (!grid) return;

  const items = loadGallery();
  if (!items.length) {
    grid.innerHTML = '<div class="gallery-empty"><strong>Pronto, más inspiración.</strong><p>Estamos preparando este espacio para mostrar nuestros trabajos.</p><a href="#servicios">Mientras tanto, explora los servicios ↗</a></div>';
    return;
  }

  grid.innerHTML = '';
  items.forEach((item, idx) => {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'gallery-item reveal';
    el.setAttribute('aria-label', 'Ampliar foto: ' + (item.title || item.caption || 'trabajo'));
    el.innerHTML = `
      <img src="${esc(item.url)}" alt="${esc(item.caption || item.title || '')}" loading="lazy" decoding="async" width="720" height="1280">
      <div class="gallery-caption">
        ${item.category ? `<span class="gallery-cat">${esc(item.category)}</span><br>` : ''}
        ${esc(item.title || item.caption || '')}
      </div>`;
    el.addEventListener('click', () => openSlideshow(items, idx));
    grid.appendChild(el);
  });

  initReveal();
}

function openSlideshow(items, startIdx) {
  if (!Array.isArray(items) || !items.length) return;

  let current = startIdx;
  let closed = false;
  const previousFocus = document.activeElement;

  const ov = document.createElement('div');
  ov.className = 'lb-overlay';
  ov.innerHTML = `
    <div class="lb-dialog" role="dialog" aria-modal="true"
      aria-label="Galería de trabajos de Burbujas Nails" tabindex="-1">
      <button type="button" class="lb-close" aria-label="Cerrar imagen">×</button>
      <button type="button" class="lb-prev" aria-label="Imagen anterior">&#8249;</button>
      <div class="lb-img-wrap">
        <img class="lb-img" src="" alt="">
        <p class="lb-caption"></p>
      </div>
      <button type="button" class="lb-next" aria-label="Imagen siguiente">&#8250;</button>
      <div class="lb-dots" aria-hidden="true"></div>
    </div>`;

  const imgEl = ov.querySelector('.lb-img');
  const capEl = ov.querySelector('.lb-caption');
  const dotsEl = ov.querySelector('.lb-dots');
  const prevBtn = ov.querySelector('.lb-prev');
  const nextBtn = ov.querySelector('.lb-next');
  const closeBtn = ov.querySelector('.lb-close');

  dotsEl.innerHTML = items.map((_, i) =>
    `<span class="lb-dot${i === startIdx ? ' active' : ''}"></span>`
  ).join('');
  const dots = dotsEl.querySelectorAll('.lb-dot');

  function goTo(idx) {
    current = (idx + items.length) % items.length;
    const item = items[current];
    imgEl.src = item.url;
    imgEl.alt = item.caption || item.title || 'Trabajo de manicura';
    capEl.textContent = item.title || item.caption || '';
    dots.forEach((dot, i) => dot.classList.toggle('active', i === current));
    prevBtn.hidden = nextBtn.hidden = items.length <= 1;
  }

  function close() {
    if (closed) return;
    closed = true;
    document.removeEventListener('keydown', onKey);
    document.body.classList.remove('gallery-modal-open');
    ov.remove();
    if (previousFocus && typeof previousFocus.focus === 'function') {
      previousFocus.focus();
    }
  }

  function onKey(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      goTo(current + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goTo(current - 1);
    } else if (e.key === 'Tab') {
      const buttons = [...ov.querySelectorAll('button:not([hidden])')];
      if (!buttons.length) return;
      const first = buttons[0], last = buttons[buttons.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));
  ov.addEventListener('click', e => { if (e.target === ov) close(); });

  let touchX = null;
  ov.addEventListener('touchstart', e => {
    touchX = e.changedTouches[0].clientX;
  }, { passive: true });
  ov.addEventListener('touchend', e => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 45 && !closed) goTo(current + (dx < 0 ? 1 : -1));
    touchX = null;
  }, { passive: true });

  goTo(startIdx);
  document.body.classList.add('gallery-modal-open');
  document.body.appendChild(ov);
  document.addEventListener('keydown', onKey);
  closeBtn.focus();
}

/* ─── Reveal on scroll ───────────────────────────────────────── */
function initReveal() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
    return;
  }
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal:not(.visible)').forEach(el => obs.observe(el));
}

/* ─── Nav mobile ─────────────────────────────────────────────── */
function initNav() {
  const burger = document.getElementById('navBurger');
  const menu   = document.getElementById('navMobile');
  if (!burger || !menu) return;

  burger.addEventListener('click', () => {
    const open = !menu.hidden;
    menu.hidden = open;
    burger.setAttribute('aria-expanded', String(!open));
    burger.setAttribute('aria-label', open ? 'Abrir menú' : 'Cerrar menú');
  });

  // Cerrar al hacer click en enlace
  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => { menu.hidden = true; burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Abrir menú'); });
  });
}

/* ─── Scroll suave ───────────────────────────────────────────── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (href === '#') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const target = document.getElementById(href.slice(1));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

/* ─── Header sticky ──────────────────────────────────────────── */
function initHeader() {
  const header = document.querySelector('.nav-bar');
  if (!header) return;
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
}

/* ─── Año footer ─────────────────────────────────────────────── */
function initFooterYear() {
  const yr = document.getElementById('footerYear');
  if (yr) yr.textContent = new Date().getFullYear();
}

/* ─── Init ───────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initSmoothScroll();
  initHeader();
  initFooterYear();
  renderServices();
  renderGallery();
  initReveal();

  // Reveal general
  document.querySelectorAll('.section, .hero-wrap').forEach(el => el.classList.add('reveal'));
  setTimeout(initReveal, 100);
});
