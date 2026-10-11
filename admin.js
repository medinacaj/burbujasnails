/* ── Burbujas Nails — Admin Panel ───────────────────────────── */
'use strict';

const eA = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

/* ─── Almacenamiento ─────────────────────────────────────────── */
const STORE = {
  KEY_SERVICES: 'bn_services',
  KEY_GALLERY:  'bn_gallery',
  KEY_CONFIG:   'bn_config',

  load(key, fallback) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch { return fallback; }
  },
  save(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
  }
};

/* ─── Estado ─────────────────────────────────────────────────── */
const AD = {
  services: [],
  gallery: [],

  load() {
    this.services = STORE.load(STORE.KEY_SERVICES, []);
    if (!this.services.length) {
      this.services = (window.INITIAL_SERVICES || []);
      STORE.save(STORE.KEY_SERVICES, this.services);
    }
    this.gallery = STORE.load(STORE.KEY_GALLERY, []);
  },

  saveServices() { STORE.save(STORE.KEY_SERVICES, this.services); },
  saveGallery()  { STORE.save(STORE.KEY_GALLERY,  this.gallery);  }
};

/* ─── Toast ──────────────────────────────────────────────────── */
function toast(msg, type = 'ok') {
  let t = document.getElementById('toastEl');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toastEl';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.className = 'toast show ' + type;
  clearTimeout(t._tm);
  t._tm = setTimeout(() => t.classList.remove('show'), 3000);
}

/* ─── Modal helpers ──────────────────────────────────────────── */
function openModal(id)  { const m = document.getElementById(id); if (m) m.removeAttribute('hidden'); }
function closeModal(id) { const m = document.getElementById(id); if (m) m.setAttribute('hidden', ''); }

/* ─── Render servicios admin ─────────────────────────────────── */
function renderSvc() {
  const tbody = document.getElementById('svcBody');
  if (!tbody) return;

  if (!AD.services.length) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:2rem;color:#999">No hay servicios.</td></tr>';
    return;
  }

  tbody.innerHTML = AD.services.map(s => `
    <tr>
      <td style="font-size:1.4rem;text-align:center">${eA(s.emoji || '💅')}</td>
      <td>
        <strong>${eA(s.name)}</strong>
        <br><small style="color:#999">${eA(s.category)}</small>
      </td>
      <td>${s.price && /^\d/.test(s.price) ? '$' + eA(s.price) : eA(s.price || '—')}</td>
      <td>${eA(s.duration || '—')}</td>
      <td style="white-space:nowrap">
        <button class="btn-icon" onclick="openSvcModal('${eA(s.id)}')" title="Editar">✏️</button>
        <button class="btn-icon danger" onclick="deleteSvc('${eA(s.id)}')" title="Eliminar">🗑️</button>
      </td>
    </tr>
  `).join('');
}

/* ─── Modal servicio ─────────────────────────────────────────── */
function openSvcModal(id) {
  const svc = id ? AD.services.find(s => s.id === id) : null;

  document.getElementById('svcModalTitle').textContent = svc ? 'Editar Servicio' : 'Nuevo Servicio';
  document.getElementById('svcId').value        = svc ? svc.id : '';
  document.getElementById('svcName').value      = svc ? svc.name : '';
  document.getElementById('svcCategory').value  = svc ? svc.category : 'Uñas manos';
  document.getElementById('svcPrice').value     = svc ? svc.price : '';
  document.getElementById('svcDuration').value  = svc ? svc.duration : '';
  document.getElementById('svcDesc').value      = svc ? (svc.description || '') : '';
  document.getElementById('svcIncludes').value  = svc ? (svc.includes || []).join('\n') : '';
  document.getElementById('svcPopular').checked = svc ? !!svc.popular : false;

  const emoji = svc ? (svc.emoji || '💅') : '💅';
  document.getElementById('svcEmoji').value         = emoji;
  document.getElementById('svcEmojiPreview').textContent = emoji;

  openModal('svcModal');
}

function saveSvc() {
  const id       = document.getElementById('svcId').value.trim();
  const name     = document.getElementById('svcName').value.trim();
  const category = document.getElementById('svcCategory').value;
  const price    = document.getElementById('svcPrice').value.trim();
  const duration = document.getElementById('svcDuration').value.trim();
  const desc     = document.getElementById('svcDesc').value.trim();
  const includes = document.getElementById('svcIncludes').value.split('\n').map(l => l.trim()).filter(Boolean);
  const popular  = document.getElementById('svcPopular').checked;
  const emoji    = document.getElementById('svcEmoji').value || '💅';

  if (!name) { toast('El nombre es obligatorio', 'err'); return; }

  if (id) {
    const idx = AD.services.findIndex(s => s.id === id);
    if (idx > -1) {
      AD.services[idx] = { ...AD.services[idx], name, category, price, duration, description: desc, includes, popular, emoji };
    }
  } else {
    const newId = 's' + String(Date.now()).slice(-6);
    AD.services.push({ id: newId, name, category, price, duration, description: desc, includes, popular, emoji });
  }

  AD.saveServices();
  closeModal('svcModal');
  renderSvc();
  renderBulkPreview();
  renderStats();
  toast('✅ Servicio guardado');
}

function deleteSvc(id) {
  if (!confirm('¿Eliminar este servicio?')) return;
  AD.services = AD.services.filter(s => s.id !== id);
  AD.saveServices();
  renderSvc();
  renderBulkPreview();
  renderStats();
  toast('🗑️ Servicio eliminado');
}

/* ─── Emoji picker ───────────────────────────────────────────── */
function toggleEmojiPicker(gridId) {
  const grid = document.getElementById(gridId);
  if (!grid) return;
  const isHidden = grid.hasAttribute('hidden');
  document.querySelectorAll('.emoji-grid').forEach(g => g.setAttribute('hidden', ''));
  if (isHidden) {
    const btn = document.querySelector('.emoji-toggle-btn');
    if (btn) {
      const r = btn.getBoundingClientRect();
      grid.style.top  = (r.bottom + 6) + 'px';
      grid.style.left = r.left + 'px';
    }
    grid.removeAttribute('hidden');
    setTimeout(() => {
      document.addEventListener('click', function handler(e) {
        if (!grid.contains(e.target) && !e.target.closest('.emoji-toggle-btn')) {
          grid.setAttribute('hidden', '');
          document.removeEventListener('click', handler);
        }
      });
    }, 0);
  }
}

// Delegación de click para emojis
document.addEventListener('click', e => {
  const span = e.target;
  if (!span || span.tagName !== 'SPAN' || !span.closest('.egrid-row')) return;
  const emoji = span.textContent.trim();
  if (!emoji) return;
  const input   = document.getElementById('svcEmoji');
  const preview = document.getElementById('svcEmojiPreview');
  if (input)   input.value = emoji;
  if (preview) preview.textContent = emoji;
  document.querySelectorAll('.emoji-grid').forEach(g => g.setAttribute('hidden', ''));
});

/* ─── Galería admin ──────────────────────────────────────────── */
function renderGalleryAdmin() {
  const grid = document.getElementById('galleryAdminGrid');
  if (!grid) return;

  if (!AD.gallery.length) {
    grid.innerHTML = '<p style="color:#999;padding:1rem">No hay fotos aún.</p>';
    return;
  }

  grid.innerHTML = '';
  AD.gallery.forEach((item, idx) => {
    const el = document.createElement('div');
    el.className = 'admin-gallery-item';
    el.innerHTML = `
      <img src="${eA(item.url)}" alt="${eA(item.caption || '')}" loading="lazy">
      <div class="admin-gallery-info">
        <small>${eA(item.category || '')} ${eA(item.caption || '')}</small>
      </div>
      <div class="admin-gallery-actions">
        <button onclick="moveGallery(${idx},-1)" title="Mover arriba">↑</button>
        <button onclick="moveGallery(${idx},1)" title="Mover abajo">↓</button>
        <button class="danger" onclick="deleteGallery(${idx})" title="Eliminar">🗑️</button>
      </div>
    `;
    grid.appendChild(el);
  });
}

function addGalleryItem() {
  const url     = document.getElementById('galleryUrl').value.trim();
  const caption = document.getElementById('galleryCaption').value.trim();
  const cat     = document.getElementById('galleryCategory').value.trim();

  if (!url) { toast('La URL es obligatoria', 'err'); return; }

  AD.gallery.push({ url, caption, category: cat });
  AD.saveGallery();
  document.getElementById('galleryUrl').value     = '';
  document.getElementById('galleryCaption').value = '';
  document.getElementById('galleryCategory').value = '';
  renderGalleryAdmin();
  toast('✅ Foto agregada');
}

function moveGallery(idx, dir) {
  const to = idx + dir;
  if (to < 0 || to >= AD.gallery.length) return;
  [AD.gallery[idx], AD.gallery[to]] = [AD.gallery[to], AD.gallery[idx]];
  AD.saveGallery();
  renderGalleryAdmin();
}

function deleteGallery(idx) {
  if (!confirm('¿Eliminar esta foto?')) return;
  AD.gallery.splice(idx, 1);
  AD.saveGallery();
  renderGalleryAdmin();
  toast('🗑️ Foto eliminada');
}

/* ─── Ajuste masivo de precios ───────────────────────────────── */
function renderBulkPreview() {
  const tbody = document.getElementById('bulkPreviewBody');
  if (!tbody) return;

  const numeric = AD.services.filter(s => s.price && /^\d[\d.,]*$/.test(s.price));

  if (!numeric.length) {
    tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:#999;padding:1rem">No hay servicios con precio numérico.</td></tr>';
    return;
  }

  tbody.innerHTML = numeric.map(s => `
    <tr>
      <td>${eA(s.emoji || '💅')} ${eA(s.name)}</td>
      <td>${eA(s.category)}</td>
      <td>$${eA(s.price)}</td>
    </tr>
  `).join('');
}

// Alias para compatibilidad
function renderPricing() { renderBulkPreview(); }

function bulkAdjust(type, direction) {
  let val;
  if (type === 'pct') {
    val = parseFloat(document.getElementById('bulkPct').value);
    if (isNaN(val) || val <= 0) { toast('Ingresa un porcentaje válido', 'err'); return; }
  } else {
    val = parseFloat(document.getElementById('bulkAmt').value);
    if (isNaN(val) || val <= 0) { toast('Ingresa un monto válido', 'err'); return; }
  }

  let changed = 0;
  AD.services.forEach(s => {
    if (!s.price || !/^\d[\d.,]*$/.test(s.price)) return;

    const raw = parseFloat(s.price.replace(/\./g,'').replace(',','.'));
    if (isNaN(raw)) return;

    let newPrice;
    if (type === 'pct') {
      newPrice = direction === 'up' ? raw * (1 + val/100) : raw * (1 - val/100);
    } else {
      newPrice = direction === 'up' ? raw + val : raw - val;
    }

    newPrice = Math.max(0, newPrice);
    // Redondear al múltiplo de 100 más cercano
    newPrice = Math.round(newPrice / 100) * 100;
    s.price = String(newPrice);
    changed++;
  });

  if (!changed) { toast('No se encontraron precios numéricos', 'err'); return; }

  AD.saveServices();
  renderBulkPreview();
  renderSvc();
  renderStats();
  toast(`✅ ${changed} precio(s) actualizados`);
}

/* ─── Estadísticas ───────────────────────────────────────────── */
function renderStats() {
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

  set('statTotal',   AD.services.length);
  set('statPopular', AD.services.filter(s => s.popular).length);
  set('statConPrecio', AD.services.filter(s => s.price && /^\d/.test(s.price)).length);
  set('statGallery', AD.gallery.length);

  const cats = [...new Set(AD.services.map(s => s.category))];
  set('statCats', cats.length);
}

/* ─── Tab navigation ─────────────────────────────────────────── */
function initTabs() {
  const tabs    = document.querySelectorAll('.tab-btn');
  const panels  = document.querySelectorAll('.tab-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.setAttribute('hidden', ''));
      tab.classList.add('active');
      const target = document.getElementById('panel-' + tab.dataset.tab);
      if (target) target.removeAttribute('hidden');
    });
  });
}

/* ─── Autenticación ──────────────────────────────────────────── */
const ADMIN_PASS = 'burbujas$$2026';

function initAuth() {
  const loginScreen = document.getElementById('loginScreen');
  const adminPanel  = document.getElementById('adminPanel');
  const passInput   = document.getElementById('adminPass');
  const loginBtn    = document.getElementById('loginBtn');
  const logoutBtn   = document.getElementById('logoutBtn');
  const loginErr    = document.getElementById('loginErr');

  const stored = sessionStorage.getItem('bn_auth');
  if (stored === 'ok') {
    loginScreen.setAttribute('hidden', '');
    adminPanel.removeAttribute('hidden');
    return;
  }

  function tryLogin() {
    if (passInput.value === ADMIN_PASS) {
      sessionStorage.setItem('bn_auth', 'ok');
      loginScreen.setAttribute('hidden', '');
      adminPanel.removeAttribute('hidden');
      loginErr.textContent = '';
    } else {
      loginErr.textContent = 'Contraseña incorrecta';
      passInput.value = '';
      passInput.focus();
    }
  }

  loginBtn.addEventListener('click', tryLogin);
  passInput.addEventListener('keydown', e => { if (e.key === 'Enter') tryLogin(); });

  logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('bn_auth');
    adminPanel.setAttribute('hidden', '');
    loginScreen.removeAttribute('hidden');
    passInput.value = '';
  });
}

/* ─── Reset localStorage ─────────────────────────────────────── */
function resetToDefaults() {
  if (!confirm('¿Restaurar todos los servicios a los valores iniciales? Se perderán los cambios.')) return;
  localStorage.removeItem('bn_services');
  AD.load();
  renderSvc();
  renderBulkPreview();
  renderStats();
  toast('✅ Servicios restaurados');
}

/* ─── Init ───────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  AD.load();
  initTabs();
  renderSvc();
  renderGalleryAdmin();
  renderBulkPreview();
  renderStats();
});
