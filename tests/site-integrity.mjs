import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {resolve,dirname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const pages=['index.html','servicios.html','cejas-concepcion.html','privacidad.html','404.html','gestion.html','admin.html'];
const read=(path)=>readFileSync(resolve(root,path),'utf8');
const failures=[];
const pathFor=(current,url)=>{
 const [pathname]=url.split(/[?#]/);
 if(pathname===''||pathname==='/')return 'index.html';
 if(pathname.startsWith('/'))return pathname.slice(1);
 return resolve(dirname(current),pathname);
};
for(const page of pages){
 const html=read(page);
 const idSet=new Set([...html.matchAll(/\bid=["']([^"']+)["']/g)].map(x=>x[1]));
 const attrs=[...html.matchAll(/\b(href|src)=["']([^"']+)["']/g)];
 for(const [,type,value] of attrs){
   if(value.startsWith('https://'))continue;
   if(/^(?:mailto:|tel:|data:)/i.test(value))continue;
   if(/^[a-z][a-z0-9+.-]*:/i.test(value)){failures.push(page+': esquema no permitido '+value.slice(0,40));continue}
   const fragment=value.includes('#')?value.slice(value.indexOf('#')+1):'';
   const target=pathFor(page,value);
   const absolute=resolve(root,target);
   if(!absolute.startsWith(root+sep)&&absolute!==root){failures.push(page+': ruta fuera del sitio '+value);continue}
   if(!existsSync(absolute))failures.push(page+': enlace/archivo roto '+value);
   if(fragment){
     const targetHtml=target==='index.html'?read('index.html'):target===page?html:target.endsWith('.html')&&existsSync(absolute)?read(target):null;
     if(targetHtml&&!new Set([...targetHtml.matchAll(/\bid=["']([^"']+)["']/g)].map(x=>x[1])).has(decodeURIComponent(fragment)))
       failures.push(page+': ancla inexistente '+value)
   }
 }
 if(/target=["']_blank["']/.test(html)){
   const a=[...html.matchAll(/<a\b[^>]*target=["']_blank["'][^>]*>/g)];
   for(const [tag] of a)if(!/rel=["'][^"']*noopener/.test(tag))failures.push(page+': target blank sin noopener '+tag.slice(0,110))
 }
 if(!/<html\b[^>]*lang=["']es(?:-CL)?["']/.test(html))failures.push(page+': falta idioma');
 if(!/<h1\b/.test(html))failures.push(page+': falta H1');
 if(page==='index.html'||page==='servicios.html'||page==='cejas-concepcion.html'){
  if(!html.includes('rel="canonical"'))failures.push(page+': sin canonical');
  if(!html.includes('name="description"'))failures.push(page+': sin meta description');
 }
}
const home=read('index.html');
const ld=home.match(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/);
assert(ld,'No hay datos estructurados locales');
const shop=JSON.parse(ld[1]);
assert.equal(shop['@type'],'NailSalon');
assert.equal(shop.address.addressLocality,'Concepción');
assert.equal(shop.telephone,'+56930912644');
assert(!('aggregateRating' in shop),'No publicar ratings no verificados');
assert(!('openingHours' in shop),'No publicar horarios no verificados');
const catalog=read('data.js');
assert.equal((catalog.match(/\bid:'s\d{2}'/g)||[]).length,27,'Conservar 27 servicios');
assert.deepEqual(failures,[],'Integridad de enlaces internos, metas y privacidad de navegación');
console.log('Enlaces/fragmentos internos, páginas, metas, NAP y catálogo: OK');
