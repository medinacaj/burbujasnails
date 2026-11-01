import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const source={window:{}};
runInNewContext(readFileSync('data.js','utf8'),source,{timeout:1000});
const originals=JSON.parse(JSON.stringify(source.window.INITIAL_SERVICES));
const rows=originals.map(s=>({id:s.id,name:s.name,price_clp:s.price==='Consultar'?null:Number(s.price.replaceAll('.','')),duration:s.duration,description:s.description}));
const script=readFileSync('catalogo-live.js','utf8');
async function readCatalog(payload,{ok=true}={}){
 const events=[];
 const window={INITIAL_SERVICES:originals,BN_CATALOG_CONFIG:{url:'https://bn-qa.supabase.co',publishableKey:'sb_publishable_QATest123'},dispatchEvent:e=>events.push(e)};
 runInNewContext(script,{window,fetch:async()=>({ok,json:async()=>payload}),AbortController,setTimeout,clearTimeout,CustomEvent:class{constructor(type,options){this.type=type;this.detail=options.detail}}},{timeout:1000});
 await new Promise(resolve=>setImmediate(resolve));
 return events;
}
assert.equal((await readCatalog(rows.slice(1))).length,1,'Un catálogo con 26 activos debe publicarse, no conservar los 27 estáticos');
assert.equal((await readCatalog([]))[0]?.detail.length,0,'Una respuesta vacía válida retira todos los activos');
assert.equal((await readCatalog(rows))[0]?.detail.length,27);
for(const invalid of [null,{},[null],[rows[0],rows[0]],[{...rows[0],id:'s99'}],[{...rows[0],name:'Servicio ajeno'}],[{...rows[0],price_clp:-1}],[{...rows[0],duration:null}],[{...rows[0],description:'x'.repeat(1201)}]]){
 assert.equal((await readCatalog(invalid)).length,0,'Respuesta inválida conserva el fallback sin emitir actualización');
}
assert.equal((await readCatalog(rows,{ok:false})).length,0,'Un fallo HTTP conserva fallback');
console.log('Catálogo remoto: subset, vacío, 27 activos, validación y fallback OK');
