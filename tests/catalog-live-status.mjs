import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(new URL('../catalogo-live.js',import.meta.url),'utf8');
const data={window:{}};
vm.runInNewContext(readFileSync(new URL('../data.js',import.meta.url),'utf8'),data,{timeout:1000});
const originals=data.window.INITIAL_SERVICES;
const fullCatalog=Array.from(originals,({id,name,duration,description,price})=>({
 id,name,duration,description,price_clp:price==='Consultar'?null:Number(price.replaceAll('.',''))
}));
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');

async function simulate({configured=true,rows=null,range=null,fail=false}={}){
 const status={hidden:true,dataset:{},textContent:''};
 const events=[];
 let calls=0;
 const window={
   INITIAL_SERVICES:originals,
   BN_CATALOG_CONFIG: configured
     ? {url:'https://catalog-test.supabase.co',publishableKey:'sb_publishable_test123'}
     : {url:'',publishableKey:''},
   dispatchEvent:e=>events.push(e),
 };
 const fetch=async()=>{calls++;if(fail)throw Error('offline');return {ok:true,headers:new Headers(range?{'Content-Range':range}:{}),json:async()=>rows};};
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
 const r=await simulate({rows:fullCatalog,range:'0-26/27'});
 assert.equal(r.status.dataset.state,'current');
 assert.match(r.status.textContent,/Confirma el valor final/);
 assert.equal(r.events.length,1);
 assert.equal(r.events[0].type,'bn:catalog-updated');
 assert.equal(r.events[0].detail.length,27);
});
test('un subconjunto válido y completo actualiza los servicios activos',async()=>{
 const r=await simulate({rows:fullCatalog.slice(1),range:'0-25/26'});
 assert.equal(r.status.dataset.state,'current');
 assert.equal(r.events[0]?.detail.length,26);
});
test('un resultado vacío confirmado retira todos los servicios',async()=>{
 const r=await simulate({rows:[],range:'*/0'});
 assert.equal(r.status.dataset.state,'empty');
 assert.equal(r.events[0]?.detail.length,0);
});
test('una página truncada, un subconjunto sin total o una identidad ajena conserva los precios referenciales',async()=>{
 const cases=[
  {rows:fullCatalog.slice(0,2),range:'0-1/27'},
  {rows:fullCatalog.slice(0,2)},
  {rows:fullCatalog.slice(0,2),range:'2-3/2'},
  {rows:[],range:'*/27'},
  {rows:[{...fullCatalog[0],name:'Servicio ajeno'}],range:'0-0/1'},
  {rows:[fullCatalog[0],fullCatalog[0]],range:'0-1/2'},
  {rows:[null],range:'0-0/1'},
  {rows:[{...fullCatalog[0],price_clp:-1}],range:'0-0/1'},
  {rows:[{...fullCatalog[0],duration:' '}],range:'0-0/1'},
  {rows:[{...fullCatalog[0],description:'x'.repeat(1201)}],range:'0-0/1'}
 ];
 for(const scenario of cases){
  const r=await simulate(scenario);
  assert.equal(r.status.dataset.state,'offline');
  assert.match(r.status.textContent,/referenciales/);
  assert.equal(r.events.length,0);
 }
});
test('la portada publica la advertencia únicamente al configurarse el catálogo',()=>{
 assert.match(html,/id="catalog-sync-status"[^>]*role="status"[^>]*hidden/);
});
