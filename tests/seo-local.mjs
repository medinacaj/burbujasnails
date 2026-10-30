import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const home=read('index.html'),dir=read('servicios.html'),data=read('data.js'),css=read('styles.css'),sitemap=read('sitemap.xml'),build=read('build.sh');
const match=[...data.matchAll(/\{\s*id:'(s\d+)', icon:'[^']+', category:'([^']+)',\s*name:'([^']+)',\s*price:'([^']+)', duration:'([^']+)', popular:(true|false),\s*description:'([^']+)'/g)];
assert.equal(match.length,27,'Deben mantenerse los 27 servicios comerciales originales');
assert.equal((dir.match(/class="directory-item"/g)||[]).length,27,'Servicios deben ser visibles sin JavaScript');
const escapeHtml=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
for(const m of match){
  assert(dir.includes(escapeHtml(m[3])),'Nombre de servicio incompleto '+m[1]);
  assert(dir.includes(m[4]==='Consultar'?'Consultar':'$'+m[4]),'Precio original no visible '+m[1]);
}
for(const cat of ['manicure','extensiones','pedicura','promociones','retiros','pestanas-cejas','extras']){
  assert(dir.includes('id="'+cat+'"'),'Falta grupo de servicios: '+cat);
}
assert(home.includes('<title>Uñas en Concepción | Manicure y Nail Art | Burbujas Nails</title>'),'Título principal no orientado a SEO local');
assert(home.includes('seo-local-title') && home.includes('Manicure, uñas y nail art en Concepción centro'),'Falta información local indexable en la portada');
assert(home.includes('href="servicios.html"') && home.includes('servicios.html#manicure'),'Faltan enlaces HTML rastreables al directorio');
assert(dir.includes('rel="canonical" href="https://burbujasnails.cl/servicios.html"'),'Canonical de servicios incorrecta');
assert(dir.includes('name="robots" content="index, follow, max-image-preview:large"'),'Servicios deben ser indexables');
assert(dir.includes('Maipú 1020, oficina 4'),'La dirección debe concordar con la web principal');
assert(dir.includes('query_place_id=ChIJcV6iZwC1aZYRHvw-7mt7No0'),'Enlace a ficha de negocio erróneo');
assert(dir.includes('href="/#reserva"'),'Debe incluir enlace de reserva al sitio');
assert(dir.includes('script-src \'none\''),'La página estática no necesita ejecutar JavaScript');
assert((dir.match(/<img /g)||[]).length>=4,'Incluir imágenes reales con texto alternativo');
assert(sitemap.includes('<loc>https://burbujasnails.cl/servicios.html</loc>'),'Sitemap debe incluir los servicios');
assert(build.includes('cp -R index.html servicios.html'),'El paquete debe distribuir la página de servicios');
assert(build.includes('for page in index.html servicios.html'),'Actualizar versión de CSS en la página de servicios');
assert(!css.includes('.hero::before{content:""'),'Eliminar halo radial de la portada');
assert(!css.includes('.hero-photos::before{content:""'),'Eliminar halo tras la foto principal');
assert(!home.includes('VISTA PREVIA · NO PUBLICADA'),'No etiquetar una página pública como vista previa');
console.log('SEO local: 27 servicios, 7 categorías, ubicación, enlaces, imágenes y sitemap OK');
