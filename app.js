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
  polish: "<rect class=\"art-gold\" x=\"9\" y=\"2.2\" width=\"6\" height=\"5\" rx=\"1.3\"/><path class=\"art-main\" d=\"M7.2 9.8A2 2 0 0 1 9.2 7.8h5.6a2 2 0 0 1 2 2V20a2 2 0 0 1-2 2H9.2a2 2 0 0 1-2-2Z\"/><rect class=\"art-light\" x=\"9.4\" y=\"11\" width=\"2.2\" height=\"7\" rx=\"1\"/><path class=\"art-ink\" d=\"M9.2 7.9V5.3h5.6v2.6\"/>",
  layers: "<path class=\"art-gold\" d=\"M12 2.6 21.2 8 12 13.4 2.8 8Z\"/><path class=\"art-main\" d=\"m3 11 9 5.5 9-5.5v4.1L12 20.8l-9-5.7Z\"/><path class=\"art-secondary\" d=\"m3 7.8 9 5.5 9-5.5v3.3L12 16.7 3 11.1Z\"/><path class=\"art-light\" d=\"m12 5 5 3-5 3-5-3Z\"/>",
  sparkles: "<path class=\"art-gold\" d=\"m11.7 1.5 2.2 6.2 6.2 2.2-6.2 2.1-2.2 6.4-2.2-6.4-6.2-2.1 6.2-2.2Z\"/><path class=\"art-main\" d=\"m19 14.4 1.3 2.7 2.7 1.3-2.7 1.2L19 22.5l-1.3-2.9-2.7-1.2 2.7-1.3Z\"/><circle class=\"art-secondary\" cx=\"4.7\" cy=\"19.2\" r=\"2.1\"/><path class=\"art-light\" d=\"m11.6 4.7 1.1 3.2-1.1 1.6-1-1.6Z\"/>",
  brush: "<path class=\"art-gold\" d=\"M5.4 17.5 16.6 6.3l2.6 2.6L8 20.1a3.1 3.1 0 0 1-3.4.7Z\"/><path class=\"art-main\" d=\"M15.9 6.2 18.1 4a2 2 0 0 1 2.8 2.8L18.7 9Z\"/><path class=\"art-secondary\" d=\"M5.5 16.2c-2.4-.4-4 1.4-3.5 3.2.5 2 3.3 2.6 4.8.9Z\"/><path class=\"art-light\" d=\"m16.9 6 2.5-2.5\"/><circle class=\"art-gold\" cx=\"20.5\" cy=\"2.8\" r=\"1\"/>",
  hand: "<path class=\"art-secondary\" d=\"M5 13.1a1.8 1.8 0 0 1 2.6-.2l1.7 1.4V5.6a1.3 1.3 0 0 1 2.6 0V10 4a1.3 1.3 0 0 1 2.6 0v6-4.4a1.3 1.3 0 0 1 2.6 0v5.1-2.4a1.3 1.3 0 0 1 2.6 0v6c0 4-2.3 7-6.5 7-3.3 0-5.4-1.5-6.9-4l-1.9-2.9a1.7 1.7 0 0 1 .6-2.3Z\"/><path class=\"art-main\" d=\"M10.9 4.3h1.5v2.3h-1.5zm3-1.2h1.5v2.3h-1.5zm3 1.4h1.5v2.1h-1.5z\"/><path class=\"art-light\" d=\"M8.6 16.2q2 2.4 4.9 2.5\"/>",
  shield: "<path class=\"art-secondary\" d=\"M12 2.1 20.3 6v6.1c0 5.4-3.4 8.3-8.3 10.4C7.1 20.4 3.7 17.5 3.7 12.1V6Z\"/><path class=\"art-main\" d=\"M12 5.3 17.5 8v4.3c0 3.6-2.5 5.5-5.5 7-3-1.5-5.5-3.4-5.5-7V8Z\"/><path class=\"art-light\" d=\"m8.7 12.2 2.1 2.2 4.4-4.7\"/><circle class=\"art-gold\" cx=\"17.8\" cy=\"5.1\" r=\"1.3\"/>",
  gem: "<path class=\"art-main\" d=\"M6 4.2h12l4.2 5.5L12 22 1.8 9.7Z\"/><path class=\"art-secondary\" d=\"M6 4.2h12l4.2 5.5H1.8Z\"/><path class=\"art-light\" d=\"m9 4.2 3 5.5 3-5.5zM9 9.7h6L12 22Z\"/><path class=\"art-gold\" d=\"m17.6 1 .8 1.7 1.7.8-1.7.8-.8 1.7-.8-1.7-1.7-.8 1.7-.8Z\"/>",
  refresh: "<path class=\"art-main\" d=\"M19.5 9a8 8 0 0 0-13.7-3.2L3.5 8l3.2.1A5.5 5.5 0 0 1 17 9Z\"/><path class=\"art-secondary\" d=\"M4.5 15a8 8 0 0 0 13.7 3.2l2.3-2.2-3.2-.1A5.5 5.5 0 0 1 7 15Z\"/><path class=\"art-gold\" d=\"m3 3 .5 5.3 5.2.4-2.5 1.8L2 9.8Z\"/><path class=\"art-light\" d=\"m21 21-.5-5.3-5.2-.4 2.5-1.8 4.2.7Z\"/>",
  ruler: "<path class=\"art-secondary\" d=\"M3 16.4 16.4 3l4.6 4.6L7.6 21Z\"/><path class=\"art-gold\" d=\"M15.8 3.6 20.4 8 18.6 9.8l-4.4-4.5Z\"/><path class=\"art-ink\" d=\"m9.5 11.7 3 3m.1-6.2 2.9 3m-9.1 3.1 3 3\"/><circle class=\"art-main\" cx=\"19.6\" cy=\"3.3\" r=\"2\"/>",
  footprints: "<ellipse class=\"art-main\" cx=\"7.2\" cy=\"16.8\" rx=\"3.6\" ry=\"5.4\" transform=\"rotate(-14 7.2 16.8)\"/><ellipse class=\"art-secondary\" cx=\"17.1\" cy=\"15.4\" rx=\"3.6\" ry=\"5.4\" transform=\"rotate(15 17.1 15.4)\"/><circle class=\"art-gold\" cx=\"4\" cy=\"9.2\" r=\"1.65\"/><circle class=\"art-main\" cx=\"7\" cy=\"8.1\" r=\"1.4\"/><circle class=\"art-secondary\" cx=\"10\" cy=\"8.4\" r=\"1.2\"/><circle class=\"art-gold\" cx=\"14.4\" cy=\"7.3\" r=\"1.65\"/><circle class=\"art-main\" cx=\"17.4\" cy=\"6.2\" r=\"1.4\"/><circle class=\"art-secondary\" cx=\"20.3\" cy=\"7.2\" r=\"1.2\"/><ellipse class=\"art-light\" cx=\"6\" cy=\"16\" rx=\"1\" ry=\"2\"/>",
  flower: "<ellipse class=\"art-main\" cx=\"12\" cy=\"6.3\" rx=\"3.3\" ry=\"5\"/><ellipse class=\"art-secondary\" cx=\"17.4\" cy=\"10\" rx=\"3.3\" ry=\"5\" transform=\"rotate(72 17.4 10)\"/><ellipse class=\"art-main\" cx=\"15.5\" cy=\"16.6\" rx=\"3.3\" ry=\"5\" transform=\"rotate(145 15.5 16.6)\"/><ellipse class=\"art-secondary\" cx=\"8.5\" cy=\"16.6\" rx=\"3.3\" ry=\"5\" transform=\"rotate(215 8.5 16.6)\"/><ellipse class=\"art-main\" cx=\"6.6\" cy=\"10\" rx=\"3.3\" ry=\"5\" transform=\"rotate(290 6.6 10)\"/><circle class=\"art-gold\" cx=\"12\" cy=\"12\" r=\"3.4\"/><circle class=\"art-light\" cx=\"11.3\" cy=\"11\" r=\".9\"/>",
  gift: "<rect class=\"art-main\" x=\"3\" y=\"9\" width=\"18\" height=\"12\" rx=\"2\"/><rect class=\"art-secondary\" x=\"2\" y=\"7\" width=\"20\" height=\"4.5\" rx=\"1.2\"/><path class=\"art-gold\" d=\"M10 7h4v14h-4Z\"/><path class=\"art-light\" d=\"M12 7C8 7 5 5.8 5 3.5 5 1 9 1 12 7Zm0 0c4 0 7-1.2 7-3.5C19 1 15 1 12 7Z\"/><path class=\"art-ink\" d=\"M10 7h4\"/>",
  droplet: "<path class=\"art-main\" d=\"M12 2c-3.2 5-7 9.4-7 13.2a7 7 0 0 0 14 0C19 11.4 15.2 7 12 2Z\"/><path class=\"art-light\" d=\"M8.1 15.3c0-2.3 1.3-4.4 2.7-6.7-1.3 4.2-.2 7.5 2 9-2.6.4-4.7-.9-4.7-3.3Z\"/><circle class=\"art-gold\" cx=\"18.7\" cy=\"5.5\" r=\"2.2\"/>",
  scissors: "<circle class=\"art-main\" cx=\"5.7\" cy=\"6\" r=\"3.7\"/><circle class=\"art-secondary\" cx=\"5.7\" cy=\"18\" r=\"3.7\"/><circle class=\"art-light\" cx=\"5.7\" cy=\"6\" r=\"1.5\"/><circle class=\"art-light\" cx=\"5.7\" cy=\"18\" r=\"1.5\"/><path class=\"art-gold\" d=\"m8.3 9.1 12.8 11.4-2 2L7 12.1Zm0 5.8 12.8-11.4-2-2L7 11.9Z\"/>",
  eye: "<path class=\"art-secondary\" d=\"M1 12s4-7.2 11-7.2S23 12 23 12s-4 7.2-11 7.2S1 12 1 12Z\"/><circle class=\"art-main\" cx=\"12\" cy=\"12\" r=\"5\"/><circle class=\"art-ink-fill\" cx=\"12\" cy=\"12\" r=\"2.4\"/><circle class=\"art-light\" cx=\"10.7\" cy=\"10.5\" r=\"1.5\"/><path class=\"art-ink\" d=\"m5 8-1.4-2.3M9 5.6 8.4 3M15 5.5l.8-2.4M19 8l1.4-2.3\"/>",
  leaf: "<path class=\"art-main\" d=\"M21.7 2.7C10 2.4 3 7.9 3 15a6.3 6.3 0 0 0 6.2 6.3c7.2 0 12.2-5.6 12.5-18.6Z\"/><path class=\"art-light\" d=\"M6 18c4.7-5.5 7.7-7.5 12.4-10.3\"/><path class=\"art-gold\" d=\"m17.3 2.5 1-1.5.9 1.5 1.5 1-.9.9Z\"/>",
  heart: "<path class=\"art-main\" d=\"M20.9 5.8a5.4 5.4 0 0 0-7.6 0L12 7.2l-1.3-1.4a5.4 5.4 0 0 0-7.6 7.6L12 22l8.9-8.6a5.4 5.4 0 0 0 0-7.6Z\"/><path class=\"art-light\" d=\"M6.4 7a3 3 0 0 1 4 0\"/><path class=\"art-gold\" d=\"m18.6 1.6.8 1.6 1.6.8-1.6.8-.8 1.6-.8-1.6-1.6-.8 1.6-.8Z\"/>",
  pin: "<path class=\"art-main\" d=\"M12 1.5A8.5 8.5 0 0 0 3.5 10c0 5.5 8.5 12.5 8.5 12.5s8.5-7 8.5-12.5A8.5 8.5 0 0 0 12 1.5Z\"/><circle class=\"art-secondary\" cx=\"12\" cy=\"10\" r=\"4.2\"/><circle class=\"art-light\" cx=\"12\" cy=\"10\" r=\"1.8\"/>",
  message: "<path class=\"art-main\" d=\"M20.6 11A8.7 8.7 0 0 1 8.3 19L3 21l1.6-5.2A8.7 8.7 0 1 1 20.6 11Z\"/><path class=\"art-light\" d=\"M7 10.5h10M7 14h7\"/><circle class=\"art-gold\" cx=\"19.1\" cy=\"4.2\" r=\"2.4\"/>",
  card: "<rect class=\"art-main\" x=\"1.8\" y=\"4.7\" width=\"20.4\" height=\"14.6\" rx=\"3\"/><path class=\"art-gold\" d=\"M1.8 8.4h20.4v4H1.8Z\"/><rect class=\"art-light\" x=\"5\" y=\"15\" width=\"6.5\" height=\"1.7\" rx=\".7\"/><circle class=\"art-secondary\" cx=\"18.5\" cy=\"15.7\" r=\"1.8\"/>"
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
  return '<svg class="ui-icon ui-icon-color" viewBox="0 0 24 24" fill="none" stroke="none" ' +
    'stroke-linecap="round" stroke-linejoin="round" ' +
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
