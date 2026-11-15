import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(new URL('../catalogo-live.js',import.meta.url),'utf8');
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');

async function simulate({configured=true,rows=null,fail=false}={}){
 const status={hidden:true,dataset:{},textContent:''};
 const events=[];
 let calls=0;
 const window={
   BN_CATALOG_CONFIG: configured
     ? {url:'https://catalog-test.supabase.co',publishableKey:'sb_publishable_test123'}
     : {url:'',publishableKey:''},
   dispatchEvent:e=>events.push(e),
 };
 const fetch=async()=>{calls++;if(fail)throw Error('offline');return {ok:true,json:async()=>rows};};
 const context={
   window, document:{getElementById:id=>id==='catalog-sync-status'?status:null},
   fetch, AbortController, setTimeout,clearTimeout,
   CustomEvent:class{constructor(type,init){this.type=type;this.detail=init.detail;}}
 };
 vm.runInNewContext(source,context,{timeout:1000});
 await new Promise(resolve=>setImmediate(resolve));
 await new Promise(resolve=>setImmediate(resolve));
 return {status,events,calls};
}

test('sin una base dedicada no se anuncia sincronización ni se hace red',async()=>{
 const r=await simulate({configured:false});
 assert.equal(r.calls,0);
 assert.equal(r.status.hidden,true);
});
test('si Supabase falla los precios estáticos quedan marcados como referenciales',async()=>{
 const r=await simulate({fail:true});
 assert.equal(r.calls,1);
 assert.equal(r.status.dataset.state,'offline');
 assert.match(r.status.textContent,/referenciales/);
 assert.equal(r.events.length,0);
});
test('catálogo incompleto no desbloquea precios como verificados',async()=>{
 const r=await simulate({rows:[{id:'s01',price_clp:1000}]});
 assert.equal(r.status.dataset.state,'offline');
 assert.equal(r.events.length,0);
});
test('catálogo íntegro informa lectura y emite la actualización',async()=>{
 const rows=Array.from({length:27},(_,i)=>({
  id:'s'+String(i+1).padStart(2,'0'),name:'Servicio '+i,
  duration:'45 min',description:'Descripción',price_clp:10000+i
 }));
 const r=await simulate({rows});
 assert.equal(r.status.dataset.state,'current');
 assert.match(r.status.textContent,/Confirma el valor final/);
 assert.equal(r.events.length,1);
 assert.equal(r.events[0].type,'bn:catalog-updated');
 assert.equal(r.events[0].detail.length,27);
});
test('la portada publica la advertencia únicamente al configurarse el catálogo',()=>{
 assert.match(html,/id="catalog-sync-status"[^>]*role="status"[^>]*hidden/);
});
