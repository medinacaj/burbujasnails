/* ── Burbujas Nails — App principal ─────────────────────────── */
'use strict';

/* ─── Utilidades ─────────────────────────────────────────────── */
const esc = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

/* ─── Catálogo público canónico ────────────────────────────────
 * La versión del catálogo se publica mediante Git; nunca se toma el
 * contenido local de un antiguo panel "administrativo".
 */
function loadServices() {
  const services = window.INITIAL_SERVICES || [];
  return services.map(service => ({
    ...service,
    emoji: service.emoji || CAT_EMOJI[service.category] || '💅'
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

/* ─── Emojis por categoría (fallback) ───────────────────────── */
const CAT_EMOJI = {
  'Uñas manos':      '💅',
  'Extensiones':     '💎',
  'Uñas pies':       '🦶',
  'Promociones':     '🎀',
  'Retiros':         '🧼',
  'Pestañas y cejas':'👁️',
  'Extras':          '🧴'
};

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
      <button class="fb${c === activeFilter ? ' active' : ''}" data-cat="${esc(c)}" aria-pressed="${c === activeFilter}">${esc(c)}</button>
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
        <span class="svc-ico" aria-hidden="true">${esc(s.emoji || CAT_EMOJI[s.category] || '💅')}</span>
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
