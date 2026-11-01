import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const size=path=>statSync(resolve(root,path)).size;
const budgets={
 'styles.css':45000,'app.js':16000,'data.js':16000,
 'bn-config.js':3000,'catalogo-live.js':6000,
 'gestion.js':12000,'gestion.css':9000,
 'index.html':48000
};
for(const [file,maxBytes] of Object.entries(budgets)){
 const bytes=size(file);
 assert(bytes<=maxBytes,file+': '+bytes+' bytes excede '+maxBytes+' bytes');
 console.log('Presupuesto OK',file,bytes+'/'+maxBytes);
}
let total=0;
for(let n=1;n<=10;n++){
 const file='gallery/trabajo-'+String(n).padStart(2,'0')+'.webp';
 const bytes=size(file);
 assert(bytes<=180000,file+' pesa '+bytes+' bytes, revisar compresión');
 total+=bytes;
}
assert(total<=1200000,'Galería completa excede 1.2 MB de archivos WebP');
assert(size('gallery/trabajo-04.webp')<=95000,'Imagen LCP principal demasiado pesada');
const html=readFileSync(resolve(root,'index.html'),'utf8');
assert(html.includes('rel="preload" as="image" href="gallery/trabajo-04.webp"'),'Hero sin preload');
assert(/class="hero-main"[^>]*loading="eager"[^>]*fetchpriority="high"/.test(html),'Hero debe cargarse prioritariamente');
assert(!/<script\b[^>]*src=["']https?:\/\//i.test(html),'No introducir scripts externos en portada sin revisión');
console.log('Presupuestos de archivos de origen verificados. Galería WebP total:',total,'bytes.');
console.log('Son presupuestos de tamaño de recursos, NO LCP, INP o CLS medidos ni estadísticas de campo.');
