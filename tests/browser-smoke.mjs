import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createServer} from 'node:http';
import {dirname,resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium,firefox,webkit} from 'playwright';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.webp':'image/webp','.jpg':'image/jpeg','.svg':'image/svg+xml','.txt':'text/plain','.xml':'application/xml'};
const server=createServer(async (request,response)=>{
  let pathname;
  try{pathname=decodeURIComponent(new URL(request.url,'http://localhost').pathname)}
  catch{response.writeHead(400).end();return}
  const file=resolve(root,pathname.replace(/^\/+/, '')||'index.html');
  if(file!==root&&!file.startsWith(root+sep)){response.writeHead(403).end();return}
  try{
    let bytes=await readFile(file);
    // El sitio real se publica por HTTPS. El servidor HTTP de pruebas no puede
    // usar upgrade-insecure-requests: WebKit transforma los subrecursos locales
    // en https://127.0.0.1 y bloquea data.js, aunque CSP de producción sea válida.
    if(extname(file)==='.html')bytes=Buffer.from(bytes.toString('utf8').replaceAll('; upgrade-insecure-requests',''));
    response.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream'});
    response.end(bytes)
  }
  catch{response.writeHead(404).end('No encontrado')}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port;
let failures=0;
try{
  for(const [engine,type] of Object.entries({chromium,firefox,webkit})){
    const browser=await type.launch({headless:true});
    try{
      for(const width of (engine==='chromium'?[320,375,768,1440]:[375,1440])){
        const page=await browser.newPage({viewport:{width,height:850}});
        const errors=[];
        page.on('pageerror',error=>errors.push(error.message));
        const failedRequests=[];page.on('requestfailed',request=>{if(request.url().includes('127.0.0.1'))failedRequests.push({url:request.url(),error:request.failure()?.errorText})});
        await page.route('https://fonts.googleapis.com/**',route=>route.abort());
        await page.route('https://fonts.gstatic.com/**',route=>route.abort());
        await page.route('https://www.google.com/maps**',route=>route.fulfill({status:200,contentType:'text/html',body:'<p>Mapa de prueba</p>'}));
        try{
          await page.goto(base,{waitUntil:'domcontentloaded'});
          try{await page.locator('#serviceList .service').first().waitFor({timeout:10000})}
          catch(error){
            const state=await page.evaluate(()=>({
              readyState:document.readyState,
              hasData:!!window.INITIAL_SERVICES,
              count:window.INITIAL_SERVICES?.length,
              serviceList:document.querySelector('#serviceList')?.innerHTML.slice(0,150),
              scripts:[...document.scripts].filter(s=>s.src).map(s=>s.src),
              csp:document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.content.slice(0,250)
            }));
            throw new Error(engine+' '+width+'px catálogo sin render: '+JSON.stringify({state,errors,failedRequests,original:error.message}));
          }
          assert.equal(await page.locator('#serviceList .service').count(),6,'Debe mostrar seis tarjetas iniciales');
          const bounds=await page.evaluate(()=>{
            const targets=['.wrap','.booking-card','.catalog-panel','.lightbox-box'];
            return targets.flatMap(sel=>[...document.querySelectorAll(sel)].filter(el=>{
              const r=el.getBoundingClientRect();
              return r.width>0 && (r.left<-2||r.right>window.innerWidth+2);
            }).map(el=>sel+':'+el.getBoundingClientRect().right.toFixed(0)));
          });
          assert.deepEqual(bounds,[],'No deben cortarse contenedores en '+width+'px');
          if(width<850){
            const menu=page.locator('#menuButton');
            await menu.click();
            assert.equal(await menu.getAttribute('aria-expanded'),'true');
            await page.keyboard.press('Escape');
            assert.equal(await menu.getAttribute('aria-expanded'),'false');
          }
          await page.locator('#searchService').fill('diseno');
          assert((await page.locator('#serviceList .service').count())>0,'Buscar diseño sin tilde');
          await page.locator('#searchService').fill('ningunservicioinventadoxyz');
          assert.equal(await page.locator('#serviceList .service').count(),0,'Estado sin resultados');
          await page.locator('#searchService').fill('');
          const first=page.locator('#serviceList .service-top').first();
          await first.click();
          assert.equal(await first.getAttribute('aria-expanded'),'true');
          assert(await page.locator('#serviceList .service-body').first().isVisible(),'Acordeón legible');
          const photo=page.locator('#galleryGrid .gallery-btn').first();
          await photo.click();
          assert(await page.locator('#lightbox').isVisible(),'Modal abre');
          assert(await page.locator('main').evaluate(e=>e.inert),'El fondo del modal debe quedar inerte');
          assert(await page.locator('#lbClose').evaluate(e=>document.activeElement===e),'Foco inicial al cierre');
          const initial=await page.locator('#lbCaption').innerText();
          await page.keyboard.press('ArrowRight');
          assert.notEqual(await page.locator('#lbCaption').innerText(),initial,'Navegación por teclado');
          await page.keyboard.press('Escape');
          assert(!(await page.locator('#lightbox').isVisible()),'Escape cierra');
          assert(await photo.evaluate(e=>document.activeElement===e),'Recupera foco al cerrar');
          await page.evaluate(()=>{window.__opened=[];window.open=(url)=>{window.__opened.push(String(url));return null}});
          await page.locator('#mapOpen').click();
          assert.equal(await page.locator('#mapFrame iframe').count(),1,'Mapa cargado a petición');
          assert.equal(await page.locator('#mapOpen').getAttribute('aria-expanded'),'true');
          await page.locator('#mapOpen').click();
          assert((await page.evaluate(()=>window.__opened.at(-1))).includes('google.com/maps'),'Enlace externo del mapa');
          await page.locator('#serviceSelect').selectOption({index:1});
          await page.locator('#bookingName').fill('Prueba');
          await page.locator('#bookingForm button[type=submit]').click();
          const wa=await page.evaluate(()=>window.__opened.at(-1));
          assert(wa.startsWith('https://wa.me/56930912644?text='),'Consulta abre WhatsApp');
          assert(decodeURIComponent(wa).includes('Prueba'),'Conserva nombre en consulta');
          assert.deepEqual(errors,[],'Sin excepciones de JavaScript');
          console.log('OK '+engine+' '+width+'px: filtros, diseño, mapa, reserva, modal, menú y ancho');
        }finally{await page.close()}
      }
    }finally{await browser.close()}
  }
}finally{await new Promise(resolve=>server.close(resolve))}
if(failures)process.exitCode=1;
