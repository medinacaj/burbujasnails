// Prueba de identidad de los bytes publicados antes y después del laboratorio.
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
export async function verifyDeployment({root,expected,references=new Map(),fetcher=fetch,attempts=12,delayMs=5000,timeoutMs=15000}){
 let lastError;
 for(let attempt=1;attempt<=attempts;attempt++){
  try{
   const files=[];
   for(const [path,bytes] of expected){
    const url=new URL(references.get(path)||path,root);
    const response=await fetcher(url,{cache:'no-store',signal:AbortSignal.timeout(timeoutMs)});
    if(!response.ok)throw Error(path+': HTTP '+response.status);
    if(new URL(response.url).origin!==new URL(root).origin)throw Error(path+': destino inesperado');
    const actual=hash(Buffer.from(await response.arrayBuffer()));
    if(actual!==hash(bytes))throw Error(path+': el contenido publicado no coincide con el checkout');
    files.push({path,url:url.href,sha256:actual});
   }
   return {checkedAt:new Date().toISOString(),root,files};
  }catch(error){lastError=error}
  if(attempt<attempts)await new Promise(resolve=>setTimeout(resolve,delayMs));
 }
 throw Error('No se verificó la versión desplegada: '+lastError?.message);
}
const filename=fileURLToPath(import.meta.url);
if(process.argv[1]&&resolve(process.argv[1])===filename){
 const repo=resolve(dirname(filename),'..');
 const paths=['index.html','styles.css','app.js','data.js','bn-config.js','catalogo-live.js','gestion.html','gestion.css','gestion.js','privacidad.html','404.html','legacy-route.js'];
 const expected=new Map(paths.map(path=>[path,readFileSync(resolve(repo,path))]));
 const revision=process.env.BN_EXPECTED_SHA;
 if(!/^[a-f0-9]{40}$/.test(revision||''))throw Error('BN_EXPECTED_SHA debe identificar el checkout publicado');
 const references=new Map(paths.map(path=>[path,path+'?bn_commit='+revision]));
 references.set('index.html','?bn_commit='+revision);
 // Comprobar los mismos ?v= que solicitará el navegador, sin variantes de caché diferentes.
 for(const path of ['index.html','gestion.html','privacidad.html','404.html']){
  for(const match of expected.get(path).toString().matchAll(/(?:src|href)=["'](\/?[a-z-]+\.(?:js|css)\?v=[a-z0-9]+)["']/g)){
   references.set(match[1].replace(/^\//,'').split('?')[0],match[1]);
  }
 }
 const evidence=await verifyDeployment({root:'https://burbujasnails.cl/',expected,references});
 evidence.expectedSha=process.env.BN_EXPECTED_SHA||null;
 if(process.argv[2])writeFileSync(process.argv[2],JSON.stringify(evidence,null,2)+'\n');
 console.log('Identidad de despliegue verificada: '+paths.length+' archivos coinciden con '+(evidence.expectedSha||'el checkout local'));
}
