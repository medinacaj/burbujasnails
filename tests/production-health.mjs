// Chequeo público de disponibilidad. Sin credenciales, servicios externos de analítica ni datos personales.
import assert from 'node:assert/strict';

const origin='https://burbujasnails.cl';
const targets=[
 ['/', 'text/html', '"@type":"Service"'],
 ['/privacidad.html','text/html','Privacidad y datos personales'],
 ['/robots.txt','text/plain','Sitemap:'],
 ['/sitemap.xml','xml','<urlset'],
 ['/gallery/trabajo-04.webp','image/webp',null]
];
async function probe(path,type,marker){
 const target=origin+path;
 let lastError;
 for(let attempt=1;attempt<=3;attempt++){
   try{
     const res=await fetch(target,{redirect:'follow',signal:AbortSignal.timeout(15000),headers:{'User-Agent':'BurbujasNails-Monitor/1.0 (GitHub Actions)'}});
     assert(res.ok,'HTTP '+res.status);
     assert(res.url.startsWith('https://'),'No es HTTPS: '+res.url);
     const contentType=res.headers.get('content-type')||'';
     assert(contentType.toLowerCase().includes(type),'Tipo inesperado: '+contentType);
     const bytes=await res.arrayBuffer();
     assert(bytes.byteLength>0,'Contenido vacío');
     if(marker)assert(new TextDecoder().decode(bytes).includes(marker),'Contenido clave no encontrado: '+marker);
     if(path.endsWith('.webp')){
       const header=new Uint8Array(bytes).slice(0,12);
       assert.equal(new TextDecoder().decode(header.slice(0,4)),'RIFF');
       assert.equal(new TextDecoder().decode(header.slice(8,12)),'WEBP');
     }
     console.log('OK',path,res.status,res.url,'bytes',bytes.byteLength);
     return;
   }catch(err){
     lastError=err;
     console.error('Intento',attempt,path,err.message);
     if(attempt<3)await new Promise(resolve=>setTimeout(resolve,1000*attempt));
   }
 }
 throw new Error('Falla de disponibilidad '+target+': '+lastError.message);
}
for(const [path,type,marker] of targets)await probe(path,type,marker);
console.log('Monitor de producción: páginas, SEO básico y fotografía principal accesibles con HTTPS.');
