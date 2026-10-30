import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const home=read('index.html'),services=read('servicios.html'),app=read('app.js'),
  css=read('styles.css'),page404=read('404.html'),privacy=read('privacidad.html'),
  favicon=read('favicon.svg'),build=read('build.sh'),data=read('data.js');
const count=(s,token)=>s.split(token).length-1;
for(const [page,html] of [['portada',home],['servicios',services],['privacidad',privacy],['404',page404]]){
  assert(html.includes('href="/favicon.svg"'),'Sin favicon: '+page);
  assert(html.includes('styles.css?v=seoOpt20261030'),'CSS desactualizado: '+page);
}
assert(favicon.includes('<svg')&&favicon.includes('viewBox="0 0 64 64"'),'SVG de marca inválido');
assert(!/https?:\/\//.test(favicon),'El favicon no debe depender de recursos externos');
assert(page404.includes('content="noindex,follow"'),'404 nunca debe indexarse');
assert(page404.includes('href="/servicios.html"'),'404 debe recuperar navegación al catálogo');
assert(home.includes('<noscript><p>Para consultar el catálogo completo'),'Falta catálogo sin JavaScript');
assert(app.includes('const gallery=')&&count(app,'"alt":')===10,'Galería debe declarar 10 descripciones de imágenes');
assert(app.includes('alt="${esc(item.alt)}"'),'Las miniaturas deben tener texto alternativo descriptivo');
assert(app.includes('lbImg.alt=gallery[idx].alt'),'El visor debe mantener el mismo texto alternativo');
assert(app.includes('function closeMobileMenu(')&&app.includes("e.key==='Escape'&&mobile.classList.contains('is-open')"),'Menú móvil no se cierra con Escape');
assert(app.includes('No encontramos servicios que coincidan'),'Falta respuesta al buscar sin resultados');
assert(app.includes('aria-label="Ver detalles de ${esc(s.name)}"'),'Falta etiqueta de las tarjetas');
assert(css.includes('.catalog-empty{')&&css.includes('.directory-breadcrumb{'),'Estilos accesibles no definidos');
assert(count(services,'itemtype="https://schema.org/Service"')===27,'Se requieren 27 servicios estructurados');
assert(count(services,'itemtype="https://schema.org/Offer"')===26,'Solo 26 precios numéricos públicos deben tener oferta');
assert(count(services,'itemprop="priceCurrency" content="CLP"')===26,'Moneda CLP para todas las ofertas');
assert(count(services,'itemtype="https://schema.org/NailSalon"')===27,'Cada servicio necesita proveedor tipado');
const allPrices=[...data.matchAll(/\bprice:'([^']+)'/g)].map(m=>m[1]);
for(const price of allPrices.filter(v=>v!=='Consultar'))
  assert(services.includes('itemprop="price" content="'+price.replaceAll('.','')+'"'),'Precio CLP no estructurado: '+price);
assert(services.includes('aria-current="page"'),'Ruta de navegación sin posición actual');
assert(services.includes('name="twitter:card"'),'Falta tarjeta social de servicios');
assert(build.includes('404.html favicon.svg'),'Empaquetado incompleto');
assert(build.includes('servicios.html privacidad.html 404.html'),'Cache busting incompleto');
console.log('Calidad web: iconos, 404, 27 servicios tipados, 26 precios, navegación y galería OK');
