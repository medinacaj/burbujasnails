import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read = f => readFileSync(new URL('../'+f,import.meta.url),'utf8');
const html=read('index.html'),css=read('styles.css'),js=read('app.js'),data=read('data.js');
const ids=['inicio','contenido','servicios','proceso','galeria','contacto','svcList','svcContainer','navBurger','navMobile','galleryGrid','footerYear'];
for(const id of ids) assert(html.includes('id="'+id+'"'), 'Falta región: '+id);
for(const id of ['servicios','proceso','galeria','contacto']){
  assert(html.includes('href="#'+id+'"'), 'Falta navegación a '+id);
}
for(const cls of ['hero-wrap','hero-title','hero-deco','section-title','service-shell','svc-card','steps-grid','gallery-empty','contact-card','footer-inner','logo-bubble']){
  assert(css.includes('.'+cls), 'Faltan estilos modernos: '+cls);
}
assert(css.includes('@media(max-width:650px)'), 'Falta responsive móvil');
assert(css.includes('prefers-reduced-motion'), 'Respetar preferencias de movimiento');
assert(css.includes('.nav-mobile[hidden]'), 'Menú móvil oculto inicialmente');
assert(html.includes('class="skip-link"'), 'Falta enlace de salto accesible');
assert(js.includes('<article class="svc-card">'), 'Cada servicio necesita tarjeta independiente');
assert(js.includes('aria-expanded="false"'), 'Detalles deben tener estado accesible');
assert(js.includes('aria-pressed='), 'Filtros deben tener estado accesible');
assert(js.includes("encodeURIComponent(s.name)"), 'La reserva debe incluir el servicio elegido');
assert(!html.includes('href="#resenas"'), 'No enlazar reseñas inexistentes');
assert(!html.includes('og-image.jpg'), 'No declarar portada social inexistente');
const services=(data.match(/\bid:'s\d{2}'/g)||[]).length;
assert.equal(services,27, 'Preservar los 27 servicios originales');
assert(html.includes('https://wa.me/56930912644'), 'Mantener contacto');
assert(html.includes('https://link.mercadopago.cl/burbujasnails'), 'Mantener pago externo');
assert(html.includes('href="privacidad.html"'), 'Conservar privacidad');
console.log('Modernización: estructura, CTA, 27 servicios, filtros y accesibilidad OK');
