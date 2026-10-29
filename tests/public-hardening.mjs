import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const html = read('index.html');
const app = read('app.js');
const policy = read('privacidad.html');
const build = read('build.sh');
const sitemap = read('sitemap.xml');

const csp = html.match(/<meta http-equiv="Content-Security-Policy" content="([^"]+)">/)?.[1];
assert.ok(csp, 'Falta CSP en la portada');
for (const rule of ["default-src 'self'", "object-src 'none'", "form-action 'none'", "script-src 'self'"]) {
  assert.ok(csp.includes(rule), 'Falta política ' + rule);
}
assert.ok(!csp.includes("'unsafe-eval'"), 'No autorizar unsafe-eval');
assert.ok(!/script-src[^;]*'unsafe-inline'/.test(csp), 'No habilitar scripts inline genéricos');

const ld = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
assert.ok(ld, 'Conservar metadatos estructurados');
const hash = createHash('sha256').update(ld, 'utf8').digest('base64');
assert.ok(csp.includes("'sha256-" + hash + "'"), 'El hash CSP de JSON-LD debe coincidir');
JSON.parse(ld);

assert.ok(!html.includes('og-image.jpg'), 'No referenciar imágenes OG inexistentes');
assert.ok(!html.includes('Reseñas reales'), 'No afirmar reseñas reales sin comprobación');
assert.ok(!html.includes('Valentina R.'), 'Retirar citas sin evidencia de autorización');
assert.ok(html.includes('href="privacidad.html"'), 'Vincular el aviso de privacidad');
assert.ok(!app.includes("'Desde $' + esc(s.price)"), 'No anunciar como desde un precio fijo');
assert.ok(app.includes("new URL(item.url, window.location.href)"), 'Validar las URL de la galería');
assert.ok(app.includes("esc(s.emoji"), 'Escapar los campos de servicio en HTML');
assert.ok(build.includes('privacidad.html'), 'El paquete distribuible debe incluir privacidad');
assert.ok(sitemap.includes('https://burbujasnails.cl/privacidad.html'), 'Sitemap debe incluir privacidad');
assert.ok(policy.includes('WhatsApp') && policy.includes('Mercado Pago'), 'Informar terceros');

console.log('Controles web/privacidad/CSP y distribución: OK');
