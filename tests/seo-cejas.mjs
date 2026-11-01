import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const home=read('index.html'),data=read('data.js'),sitemap=read('sitemap.xml'),app=read('app.js');
const records=[...data.matchAll(/\{\s*id:'(s\d+)', icon:'[^']+', category:'([^']+)',\s*name:'([^']+)',\s*price:'([^']+)', duration:'([^']+)', popular:(true|false),\s*description:'([^']+)'/g)];
const cejas=records.filter(m=>m[2]==='Pestañas y cejas');
assert.equal(cejas.length,5,'Conservar cinco servicios de pestañas, cejas y rostro');
const ld=JSON.parse(home.match(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/)[1]);
const items=ld.hasOfferCatalog.itemListElement;
for(const m of cejas){
 const item=items.find(s=>s['@id']==='https://burbujasnails.cl/#'+m[1]);
 assert(item&&item.name===m[3]&&item.description===m[7],'Falta servicio de cejas '+m[1]);
 assert.equal(item.offers?.price,Number(m[4].replaceAll('.','')),'Precio de cejas divergente '+m[1]);
 assert(home.includes(m[3]),'Falta servicio de cejas en portada '+m[1]);
}
assert(home.includes('laminado')&&home.includes('cejas'),'Mantener intención local de cejas');
assert(home.includes('Maipú 1020, oficina 4')&&home.includes('56930912644'));
assert(home.includes('id="mapOpen"')&&app.includes("getElementById('mapOpen')"),'Mapa original conservado');
assert(!existsSync(new URL('../cejas-concepcion.html',import.meta.url)),'El formato OnePage no publica landing de cejas');
assert(!home.includes('cejas-concepcion.html')&&!sitemap.includes('cejas-concepcion.html'));
assert(!home.includes('aggregateRating')&&!home.includes('reviewCount'),'No inventar reseñas');
console.log('SEO OnePage: cinco servicios de cejas dentro del catálogo original y sin landing duplicada');
