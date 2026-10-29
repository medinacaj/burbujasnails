import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

// Evitar publicar otra portada cuyo HTML no coincida con el tema activo.
const required = [
  'container', 'section-title', 'section-alt', 'nav-logo', 'logo-bubble',
  'hero-title', 'hero-sub', 'hero-cta', 'hero-deco', 'btn-lg', 'btn-ghost',
  'contact-card', 'contact-ico', 'contact-cta', 'footer-inner'
];
for (const name of required) {
  assert(new RegExp('class="[^"]*\\b' + name + '\\b').test(html),
    'Falta elemento de portada: ' + name);
  assert(css.includes('.' + name), 'Falta estilo para: ' + name);
}
assert(css.includes('.nav-mobile[hidden]'), 'El menú móvil debe respetar hidden');
assert(css.includes('#svcList .svc-row'), 'El catálogo requiere estilos de tarjeta');
assert(css.includes('#svcList .svc-detail:not([hidden])'),
  'El detalle desplegado necesita estilos propios');

console.log('Contrato visual de portada: OK');
