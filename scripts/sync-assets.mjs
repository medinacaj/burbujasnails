#!/usr/bin/env node
// Mantiene la versión de cada recurso alineada con los bytes publicados por GitHub Pages.
// Ejecutar --write tras editar recursos; CI usa --check y nunca modifica el repositorio.
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const assets=['styles.css','app.js','data.js','bn-config.js','catalogo-live.js','gestion.css','gestion.js'];
const pages=['index.html','privacidad.html','404.html','gestion.html','admin.html'];
const hashes=new Map(assets.map(file=>{
 const bytes=readFileSync(resolve(root,file));
 const hash=createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex').slice(0,10);
 return [file,hash];
}));
const pattern=/(\b(?:src|href)=["'])(\/?(?:styles\.css|app\.js|data\.js|bn-config\.js|catalogo-live\.js|gestion\.css|gestion\.js))(?:\?v=[A-Za-z0-9]+)?(["'])/g;
const mode=process.argv[2]||'--check';
if(!['--write','--check'].includes(mode))throw Error('Usa --check o --write');
const outdated=[];
for(const page of pages){
 const path=resolve(root,page);
 const actual=readFileSync(path,'utf8');
 const expected=actual.replace(pattern,(_,a,ref,b)=>a+ref+'?v='+hashes.get(ref.replace(/^\//,''))+b);
 if(actual!==expected){
   outdated.push(page);
   if(mode==='--write')writeFileSync(path,expected);
 }
}
if(mode==='--check'&&outdated.length){
 console.error('Versiones obsoletas: '+outdated.join(', '));
 console.error('Ejecuta node scripts/sync-assets.mjs --write y agrega los HTML modificados al PR.');
 process.exitCode=1;
}else{
 console.log(mode==='--write'?'Páginas sincronizadas: '+(outdated.join(', ')||'sin cambios'):'Versiones de recursos verificadas en HTML.');
}
