import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const html=read('index.html'),js=read('app.js'),css=read('styles.css'),sitemap=read('sitemap.xml'),policy=read('privacidad.html');
for(let i=1;i<=10;i++){
  const p='gallery/trabajo-'+String(i).padStart(2,'0')+'.webp';
  const bin=readFileSync(new URL('../'+p,import.meta.url));
  assert.equal(bin.toString('ascii',0,4),'RIFF',p+' no es WebP');
  assert.equal(bin.toString('ascii',8,12),'WEBP',p+' no es WebP');
  assert(bin.length<250_000,p+' no optimizado');
  assert(js.includes(p),'Foto no incluida en galería: '+p);
  assert(sitemap.includes(p),'Sitemap sin foto: '+p);
}
assert(html.includes('name="robots" content="index, follow, max-image-preview:large"'),'Indexación habilitada');
assert(html.includes('rel="canonical" href="https://burbujasnails.cl/"'),'Canonical inválida');
assert(html.includes('og:image')&&html.includes('gallery/burbujas-nails-compartir.jpg'),'Imagen social conservada');
assert(html.includes('name="description"'),'Meta descripción');
assert(html.includes('Maipú 1020, oficina 4'),'Dirección visible');
assert(html.includes('query_place_id=ChIJcV6iZwC1aZYRHvw-7mt7No0'),'Mapa al negocio');
assert(html.includes('id="mapEmbed"')&&html.includes('id="mapVisual" hidden'),'Mapa interactivo por defecto y esquema opcional');
assert(html.includes('src="https://www.google.com/maps?q=')&&html.includes('loading="lazy"'),'Mapa real integrado con carga diferida');
assert(js.includes("mapVisual.hidden=!showScheme")&&js.includes("mapEmbed.hidden=showScheme"),'Control debe alternar ambas vistas sin abrir otra pestaña');
assert(!html.includes('aria-expanded="false">Ver mapa interactivo'),'No usar expansión para cambiar de vista');
assert(css.includes('.map-frame'),'Estilo del mapa');
assert(policy.includes('Google Maps'),'Aviso de privacidad de terceros');
console.log('SEO, 10 imágenes y mapa: OK');