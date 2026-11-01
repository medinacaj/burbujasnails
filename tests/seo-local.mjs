import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const home=read('index.html'),data=read('data.js'),css=read('styles.css'),sitemap=read('sitemap.xml'),build=read('build.sh');
const records=[...data.matchAll(/\{\s*id:'(s\d+)', icon:'[^']+', category:'([^']+)',\s*name:'([^']+)',\s*price:'([^']+)', duration:'([^']+)', popular:(true|false),\s*description:'([^']+)'/g)];
assert.equal(records.length,27,'Mantener los 27 servicios comerciales originales');
assert.equal((home.match(/class="static-service"/g)||[]).length,27,'27 servicios en fallback sin JavaScript');
assert.equal((home.match(/class="static-category"/g)||[]).length,7,'Preservar las siete categorías');
const fallback=home.match(/<noscript><div class="static-catalog"[\s\S]*?<\/div><\/noscript>/);
assert(fallback,'Falta catálogo completo sin JavaScript');
const schemaText=home.match(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/);
assert(schemaText,'Faltan datos estructurados');
const salon=JSON.parse(schemaText[1]);
assert.equal(salon['@type'],'NailSalon');
const services=salon.hasOfferCatalog?.itemListElement;
assert.equal(services?.length,27,'27 servicios deben estar estructurados en portada');
const escape=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
for(let i=0;i<records.length;i++){
 const m=records[i],offer=services[i].offers;
 assert(fallback[0].includes(escape(m[3])),'Nombre ausente en HTML '+m[1]);
 assert(fallback[0].includes(m[4]==='Consultar'?'Consultar':'$'+m[4]),'Precio ausente en fallback '+m[1]);
 assert.equal(services[i]['@id'],'https://burbujasnails.cl/#'+m[1]);
 assert.equal(services[i].name,m[3]);assert.equal(services[i].serviceType,m[2]);
 assert.equal(services[i].description,m[7]);assert.equal(services[i].provider?.['@id'],'https://burbujasnails.cl/#negocio');
 if(m[4]==='Consultar')assert.equal(offer,undefined,'No inventar precio para cotizar');
 else {assert.equal(offer?.price,Number(m[4].replaceAll('.','')));assert.equal(offer?.priceCurrency,'CLP')}
}
assert(home.includes('<title>Uñas en Concepción | Manicure y Nail Art | Burbujas Nails</title>'));
assert(home.includes('seo-local-title')&&home.includes('Manicure, uñas y nail art en Concepción centro'));
assert(home.includes('id="servicios"')&&home.includes('href="#servicios"'),'Enlace interno de catálogo ausente');
assert(home.includes('Maipú 1020, oficina 4')&&home.includes('query_place_id=ChIJcV6iZwC1aZYRHvw-7mt7No0'));
assert(home.includes('id="mapOpen"')&&home.includes('id="galleryGrid"'),'Conservar mapa y galería');
assert(home.includes("script-src 'self'")&&home.includes('/catalogo-live.js'),'Conservar CSP y catálogo progresivo');
for(const path of ['servicios.html','cejas-concepcion.html']){
 assert(!existsSync(new URL('../'+path,import.meta.url)),'No publicar landing '+path);
 assert(!home.includes(path)&&!sitemap.includes(path),'Eliminar URLs duplicadas '+path);
}
assert(sitemap.includes('<loc>https://burbujasnails.cl/</loc>')&&sitemap.includes('trabajo-04.webp'),'Mantener URL canónica y fotografías');
assert(build.includes('cp -R index.html gestion.html')&&!build.includes('servicios.html'),'Solo portada comercial en paquete');
assert(!css.includes('.hero::before{content:""')&&!css.includes('.hero-photos::before{content:""'));
console.log('SEO OnePage: 27 servicios, 26 precios CLP, 7 categorías, galería, reservas y sitio canónico OK');
