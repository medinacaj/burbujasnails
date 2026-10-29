import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
const read = p => readFileSync(new URL('../'+p,import.meta.url),'utf8');
const html=read('index.html'), data=read('data.js'), app=read('app.js'),
      css=read('styles.css'), sitemap=read('sitemap.xml'), privacy=read('privacidad.html');
const numbers=Array.from({length:10},(_,i)=>String(i+1).padStart(2,'0'));
for (const n of numbers) {
  const path='gallery/trabajo-'+n+'.webp';
  const bin=readFileSync(new URL('../'+path,import.meta.url));
  assert.equal(bin.toString('ascii',0,4),'RIFF',path+' not RIFF');
  assert.equal(bin.toString('ascii',8,12),'WEBP',path+' not WebP');
  assert(bin.length>12000 && bin.length<250000,'Optimizar tamaño de '+path);
  assert(data.includes(path),'La galería JS debe incluir '+path);
  assert(html.includes('src="'+path+'"'),'Debe existir fallback de imagen '+path);
  assert(sitemap.includes('https://burbujasnails.cl/'+path),'Falta imagen en sitemap: '+path);
  assert(!bin.includes(Buffer.from('Exif\x00\x00')),'No incluir EXIF de '+path);
}
assert((data.match(/category:/g)||[]).length>=10,'Metadatos de galería incompletos');
assert(sitemap.includes('xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"'),'Falta namespace de imágenes');
assert(html.includes('Maipú 1020, oficina 4'),'Falta dirección');
assert(html.includes('query_place_id=ChIJcV6iZwC1aZYRHvw-7mt7No0'),'Mapa debe apuntar a la ficha pública exacta');
assert(html.includes('title="Mapa de ubicación de Burbujas Nails'),'Mapa sin título accesible');
assert(html.includes('loading="lazy" referrerpolicy='),'Mapa debe cargar de forma diferida');
assert(html.includes('frame-src https://www.google.com'),'La CSP debe autorizar únicamente el marco de Google Maps');
assert(css.includes('.location-map iframe'),'Mapa sin estilos responsive');
assert(privacy.includes('Google Maps'),'Aviso debe describir el mapa externo');
assert(html.includes('rel="canonical" href="https://burbujasnails.cl/"'),'Canonical inválida');
assert(html.includes('name="robots" content="index, follow, max-image-preview:large"'),'Falta metadato robots');
assert(html.includes('property="og:image" content="https://burbujasnails.cl/gallery/trabajo-04.webp"'),'Falta imagen de redes');
assert(html.includes('name="twitter:image"'),'Falta imagen de Twitter');
assert(html.includes('property="og:locale" content="es_CL"'),'SEO idioma-región incorrecto');
assert(html.includes('name="geo.placename" content="Concepción"'),'SEO local incompleto');
assert(app.includes("document.createElement('button')"),'La galería requiere controles accesibles');
console.log('SEO local + dirección enlazada + mapa + 10 fotos WebP: OK');
