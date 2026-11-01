import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const home=read('index.html'),app=read('app.js'),
  css=read('styles.css'),page404=read('404.html'),privacy=read('privacidad.html'),
  favicon=read('favicon.svg'),build=read('build.sh'),data=read('data.js');
const count=(s,token)=>s.split(token).length-1;
for(const [page,html] of [['portada',home],['privacidad',privacy],['404',page404]]){
  assert(html.includes('href="/favicon.svg"'),'Sin favicon: '+page);
  assert(/styles\.css\?v=[a-f0-9]{10}/.test(html),'CSS sin versión de contenido: '+page);
}
assert(favicon.includes('<svg')&&favicon.includes('viewBox="0 0 64 64"'),'SVG de marca inválido');
assert(!/\b(?:href|src)=["']https?:\/\//.test(favicon),'El favicon no debe solicitar recursos externos');
assert(page404.includes('content="noindex,follow"'),'404 nunca debe indexarse');
assert(page404.includes('href="/#servicios"'),'404 debe recuperar navegación al catálogo');
assert(home.includes('<noscript><p>Para consultar el catálogo completo'),'Falta catálogo sin JavaScript');
assert(app.includes('const gallery=')&&count(app,'"alt":')===10,'Galería debe declarar 10 descripciones de imágenes');
assert(app.includes('alt="${esc(item.alt)}"'),'Las miniaturas deben tener texto alternativo descriptivo');
assert(app.includes('lbImg.alt=gallery[idx].alt'),'El visor debe mantener el mismo texto alternativo');
assert(app.includes('function closeMobileMenu(')&&app.includes("e.key==='Escape'&&mobile.classList.contains('is-open')"),'Menú móvil no se cierra con Escape');
assert(app.includes('No encontramos servicios que coincidan'),'Falta respuesta al buscar sin resultados');
assert(app.includes('class="service-top"')&&!app.includes('aria-label="Ver detalles de ${esc(s.name)}"'),'La tarjeta debe anunciar el texto visible sin aria-label discordante');
assert(css.includes('.catalog-empty{'),'Estilos accesibles no definidos');
const shop=JSON.parse(home.match(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/)[1]);
const products=shop.hasOfferCatalog?.itemListElement;
assert.equal(products?.length,27,'27 servicios estructurados en OnePage');
assert.equal(products.filter(x=>x.offers?.priceCurrency==='CLP').length,26,'26 ofertas CLP para precios reales');
assert.equal((home.match(/class="static-service"/g)||[]).length,27,'Fallback estático de precios para no-JS');
assert(!home.includes('servicios.html')&&!home.includes('cejas-concepcion.html'),'Eliminar links comerciales duplicados');
assert(build.includes('404.html favicon.svg'),'Empaquetado incompleto');
assert(build.includes('node scripts/sync-assets.mjs --check'),'Falta validar versionado real de recursos');
console.log('Calidad OnePage: 404, 27 servicios, 26 precios, navegación y galería OK');
