import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const context={window:{}};
// El catálogo es código versionado y ya se ejecuta en la web; evaluamos en VM
// con tiempo acotado y sin acceso a Node ni red para obtener sus datos estáticos.
runInNewContext(read('data.js'),context,{filename:'data.js',timeout:1500});
const catalog=JSON.parse(JSON.stringify(context.window.INITIAL_SERVICES));
assert(Array.isArray(catalog),'No se pudo leer el catálogo de data.js');

const sql=read('supabase/bn_prices_seed.sql');
const row=/^\('(?<id>s\d{2})','(?<name>(?:''|[^'])*)','(?<category>(?:''|[^'])*)',(?<price>null|\d+),'(?<duration>(?:''|[^'])*)','(?<description>(?:''|[^'])*)',(?<popular>true|false),(?<position>\d+)\),?$/gm;
const unquote=value=>value.replaceAll("''","'");
const records=[...sql.matchAll(row)].map(match=>{
 const g=match.groups;
 return {
   id:g.id,
   name:unquote(g.name),
   category:unquote(g.category),
   price:g.price==='null'?null:Number(g.price),
   duration:unquote(g.duration),
   description:unquote(g.description),
   popular:g.popular==='true',
   position:Number(g.position)
 };
});
assert.equal(catalog.length,27,'Conservar los 27 servicios fuente');
assert.equal(records.length,27,'El seed SQL debe contener exactamente 27 filas válidas');
assert.equal(new Set(catalog.map(s=>s.id)).size,27,'IDs únicos en catálogo');
assert.equal(new Set(records.map(s=>s.id)).size,27,'IDs únicos en SQL');
for(let index=0;index<catalog.length;index++){
 const source=catalog[index],target=records[index];
 const expected={
  id:source.id,
  name:source.name,
  category:source.category,
  price:source.price==='Consultar'?null:Number(source.price.replaceAll('.','')),
  duration:source.duration,
  description:source.description,
  popular:source.popular,
  position:index+1
 };
 assert.deepEqual(target,expected,
  'Divergencia catálogo/seed SQL en servicio '+source.id+'; no publicar precios inconsistentes');
}
assert.equal(catalog.filter(s=>s.price==='Consultar').length,1,'Mantener servicio cotizable');
console.log('Integridad de catálogo y seed SQL: 27 nombres, categorías, precios, duraciones, descripciones y orden coinciden.');
