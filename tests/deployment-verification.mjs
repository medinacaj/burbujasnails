import assert from 'node:assert/strict';
import {createServer} from 'node:http';
const {verifyDeployment}=await import('../scripts/verify-deployment.mjs');
let mode='ok',hits=0;
const server=createServer((request,response)=>{
 hits++;
 if(mode==='http'){response.writeHead(503).end('No disponible');return}
 response.writeHead(200,{'content-type':'text/plain'});
 const parsed=new URL(request.url,'http://localhost'),path=parsed.pathname;
 if(mode==='references'&&!parsed.searchParams.has(path==='/'?'bn_commit':'v')){response.end('anterior');return}
 response.end(mode==='mismatch'?'anterior':(path==='/index.html'||path==='/')?'portada':'recurso');
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const root='http://127.0.0.1:'+server.address().port+'/';
const expected=new Map([['index.html',Buffer.from('portada')],['app.js',Buffer.from('recurso')]]);
try{
 let result=await verifyDeployment({root,expected,attempts:1});
 assert.equal(result.files.length,2,'Verificar HTML y recursos, no solo respuesta 200');
 assert.equal(result.files[0].sha256.length,64);
 mode='references';
 result=await verifyDeployment({root,expected,references:new Map([['index.html','?bn_commit=test'],['app.js','app.js?v=test']]),attempts:1});
 assert.equal(result.files.length,2,'Comprobar exactamente la URL auditada y las versiones de recursos de HTML');
 mode='mismatch';await assert.rejects(verifyDeployment({root,expected,attempts:1}),/index.html/,'No medir una versión anterior');
 mode='http';await assert.rejects(verifyDeployment({root,expected,attempts:1}),/503/);
 mode='ok';let requests=0;
 const flaky=async(...args)=>{if(++requests===1)throw Error('error temporal');return fetch(...args)};
 result=await verifyDeployment({root,expected,fetcher:flaky,attempts:2,delayMs:1});
 assert.equal(result.files.length,2,'Reintentar publicación en tránsito');
 const stalled=(_url,{signal})=>new Promise((_,reject)=>signal.addEventListener('abort',()=>reject(Error('timeout')),{once:true}));
 // El servidor conserva un handle activo mientras vence AbortSignal.timeout.
 await assert.rejects(verifyDeployment({root,expected,fetcher:stalled,attempts:1,timeoutMs:20}),/timeout/);
 assert(hits>=5);
 console.log('Identidad de despliegue: contenido, recursos, errores, reintentos y timeout OK');
}finally{await new Promise(resolve=>server.close(resolve))}
