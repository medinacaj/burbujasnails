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
  return Array.isArray(window.INITIAL_GALLERY) ? window.INITIAL_GALLERY : [];
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
      <button class="fb${c === activeFilter ? ' active' : ''}" data-cat="${esc(c)}">${esc(c)}</button>
    `).join('');
    frow.querySelectorAll('.fb').forEach(btn => {
      btn.addEventListener('click', () => {
        activeFilter = btn.dataset.cat;
        renderServiceList();
        frow.querySelectorAll('.fb').forEach(b => b.classList.toggle('active', b === btn));
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
    <div class="svc-row" data-id="${esc(s.id)}">
      <div class="svc-ico">${s.emoji || CAT_EMOJI[s.category] || '💅'}</div>
      <div class="svc-info">
        <p class="svc-name">${esc(s.name)}${s.popular ? ' <span class="badge-pop">⭐ Popular</span>' : ''}</p>
        <p class="svc-dur">${esc(s.duration || '')}</p>
      </div>
      <div class="svc-right">
        <span class="svc-price">${
          s.price && s.price.toLowerCase().includes('consultar')
            ? esc(s.price)
            : s.price
              ? 'Desde $' + esc(s.price)
              : '—'
        }</span>
      </div>
      <button class="svc-toggle" aria-label="Ver detalle">›</button>
    </div>
    <div class="svc-detail" id="det-${esc(s.id)}" hidden>
      <div class="svc-detail-inner">
        ${s.description ? `<p class="svc-desc">${esc(s.description)}</p>` : ''}
        ${s.includes && s.includes.length ? `
          <ul class="svc-includes">
            ${s.includes.map(i => `<li>${esc(i)}</li>`).join('')}
          </ul>` : ''}
        <a href="https://wa.me/56930912644?text=Hola!%20Quiero%20agendar%20${encodeURIComponent(s.name)}%20%F0%9F%92%85"
           target="_blank" rel="noopener" class="btn btn-primary btn-sm svc-agendar">
          Agendar por WhatsApp ✨
        </a>
      </div>
    </div>
  `).join('');

  // Toggle detalle
  list.querySelectorAll('.svc-row').forEach(row => {
    row.addEventListener('click', () => {
      const id = row.dataset.id;
      const det = document.getElementById('det-' + id);
      if (!det) return;
      const open = !det.hidden;
      // Cerrar todos
      list.querySelectorAll('.svc-detail').forEach(d => { d.hidden = true; });
      list.querySelectorAll('.svc-row').forEach(r => r.classList.remove('open'));
      if (!open) {
        det.hidden = false;
        row.classList.add('open');
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
    grid.innerHTML = `<p class="gallery-empty">Próximamente… ✨</p>`;
    return;
  }

  grid.innerHTML = '';
  items.forEach((item, idx) => {
    const el = document.createElement('div');
    el.className = 'gallery-item reveal';
    el.innerHTML = `
      <img src="${esc(item.url)}" alt="${esc(item.caption || '')}" loading="lazy">
      <div class="gallery-caption">
        ${item.category ? `<span class="gallery-cat">${esc(item.category)}</span><br>` : ''}
        ${esc(item.caption || '')}
      </div>`;
    el.addEventListener('click', () => openSlideshow(items, idx));
    grid.appendChild(el);
  });

  initReveal();
}

function openSlideshow(items, startIdx) {
  let current = startIdx;

  const ov = document.createElement('div');
  ov.className = 'lb-overlay';
  ov.innerHTML = `
    <button class="lb-close" aria-label="Cerrar">×</button>
    <button class="lb-prev" aria-label="Anterior">&#8249;</button>
    <div class="lb-img-wrap">
      <img class="lb-img" src="" alt="">
      <p class="lb-caption"></p>
    </div>
    <button class="lb-next" aria-label="Siguiente">&#8250;</button>
    <div class="lb-dots"></div>`;

  const imgEl   = ov.querySelector('.lb-img');
  const capEl   = ov.querySelector('.lb-caption');
  const dotsEl  = ov.querySelector('.lb-dots');
  const prevBtn = ov.querySelector('.lb-prev');
  const nextBtn = ov.querySelector('.lb-next');

  dotsEl.innerHTML = items.map((_, i) =>
    `<span class="lb-dot${i === startIdx ? ' active' : ''}"></span>`
  ).join('');
  const dots = dotsEl.querySelectorAll('.lb-dot');

  function goTo(idx) {
    current = (idx + items.length) % items.length;
    const item = items[current];
    imgEl.src = item.url;
    imgEl.alt = item.caption || '';
    capEl.textContent = item.caption || '';
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
    prevBtn.style.display = items.length <= 1 ? 'none' : '';
    nextBtn.style.display = items.length <= 1 ? 'none' : '';
  }

  goTo(startIdx);

  const close = () => {
    ov.classList.add('closing');
    setTimeout(() => ov.remove(), 220);
  };

  ov.querySelector('.lb-close').addEventListener('click', close);
  prevBtn.addEventListener('click', e => { e.stopPropagation(); goTo(current - 1); });
  nextBtn.addEventListener('click', e => { e.stopPropagation(); goTo(current + 1); });
  ov.addEventListener('click', e => { if (e.target === ov) close(); });

  // Swipe táctil
  let touchX = null;
  ov.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
  ov.addEventListener('touchend', e => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) goTo(current + (dx < 0 ? 1 : -1));
    touchX = null;
  });

  document.addEventListener('keydown', function onKey(e) {
    if (e.key === 'Escape')     { close(); document.removeEventListener('keydown', onKey); }
    if (e.key === 'ArrowRight') goTo(current + 1);
    if (e.key === 'ArrowLeft')  goTo(current - 1);
  });

  document.body.appendChild(ov);
}

/* ─── Testimonios ────────────────────────────────────────────── */
function initTestimonios() {
  const track = document.getElementById('testTrack');
  if (!track) return;
  const cards = track.querySelectorAll('.test-card');
  if (cards.length <= 1) return;

  let idx = 0;
  const total = cards.length;

  function goTo(n) {
    idx = (n + total) % total;
    track.style.transform = `translateX(-${idx * 100}%)`;
  }

  const prev = document.getElementById('testPrev');
  const next = document.getElementById('testNext');
  if (prev) prev.addEventListener('click', () => goTo(idx - 1));
  if (next) next.addEventListener('click', () => goTo(idx + 1));

  setInterval(() => goTo(idx + 1), 5000);
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
  });

  // Cerrar al hacer click en enlace
  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => { menu.hidden = true; burger.setAttribute('aria-expanded', 'false'); });
  });
}

/* ─── Scroll suave ───────────────────────────────────────────── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
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

/* ─── FAB burbuja ─────────────────────────────────────────────── */
function initFabBubble() {
  function showFabBubble() {
    const bubble = document.getElementById('fabBubble');
    if (!bubble) return;
    bubble.classList.remove('hiding');
    bubble.classList.add('visible');
    setTimeout(() => {
      bubble.classList.add('hiding');
      setTimeout(() => bubble.classList.remove('visible', 'hiding'), 400);
    }, 5000);
  }
  setTimeout(showFabBubble, 8000);            // primera vez a los 8s
  setInterval(showFabBubble, 2 * 60 * 1000); // luego cada 2 minutos
}

/* ─── Init ───────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initSmoothScroll();
  initHeader();
  initFooterYear();
  renderServices();
  renderGallery();
  initTestimonios();
  initReveal();
  initFabBubble();

  // Reveal general
  document.querySelectorAll('.section, .hero-wrap').forEach(el => el.classList.add('reveal'));
  setTimeout(initReveal, 100);
});
