import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createServer} from 'node:http';
import {dirname,resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium,firefox,webkit} from 'playwright';
import AxeBuilder from '@axe-core/playwright';

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
// Flujos con backend simulado: comprueban la UI, no sustituyen pruebas RLS reales.
async function smokeGestion(browser){
  const context=await browser.newContext({viewport:{width:375,height:850}});
  const page=await context.newPage();
  const uid='11111111-1111-4111-8111-111111111111';
  const origin='https://bn-qa.supabase.co';
  const cors={'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'GET, POST, PATCH, OPTIONS'};
  const service={id:'s01',name:'Esmaltado semipermanente',category:'Uñas manos',price_clp:10000,duration:'60 min',description:'Esmaltado de prueba',display_order:1};
  let admin=false,denyWrite=false;
  const patches=[],logoutUrls=[];
  try{
    await page.goto(base+'/gestion.html',{waitUntil:'domcontentloaded'});
    assert(await page.locator('#setup').isVisible(),'Sin Supabase, el panel debe avisar configuración pendiente');
    assert(!(await page.locator('#login').isVisible()),'No habilitar login con proyecto no configurado');
    await page.route('**/bn-config.js?*',route=>route.fulfill({
      status:200,contentType:'application/javascript',
      body:'window.BN_CATALOG_CONFIG=Object.freeze({url:"https://bn-qa.supabase.co",publishableKey:"sb_publishable_QATest123"});'
    }));
    await page.route(origin+'/**',route=>{
      const request=route.request(),url=new URL(request.url()),path=url.pathname,method=request.method();
      const reply=(status,data)=>route.fulfill({status,headers:cors,contentType:'application/json',body:JSON.stringify(data)});
      if(method==='OPTIONS')return route.fulfill({status:204,headers:cors,body:''});
      if(path==='/auth/v1/otp')return reply(200,{});
      if(path==='/auth/v1/verify')return reply(200,{access_token:'fake_test_access_token',user:{id:uid}});
      if(path==='/auth/v1/logout'){
        logoutUrls.push(request.url());
        return route.fulfill({status:204,headers:cors,body:''});
      }
      if(path==='/rest/v1/bn_admin_users'){
        assert.equal(request.headers().authorization,'Bearer fake_test_access_token','Solo un token autenticado consulta permisos');
        return reply(200,admin?[{user_id:uid}]:[]);
      }
      if(path==='/rest/v1/bn_services'){
        if(method==='PATCH'){
          patches.push({data:request.postDataJSON(),headers:request.headers()});
          if(denyWrite)return reply(401,{message:'JWT expired'});
          Object.assign(service,request.postDataJSON());
          return reply(200,[service]);
        }
        return reply(200,[service]);
      }
      if(path==='/rest/v1/bn_price_history')return reply(200,[]);
      throw Error('Endpoint no previsto en la prueba: '+method+' '+path);
    });
    await page.reload({waitUntil:'domcontentloaded'});
    assert(await page.locator('#login').isVisible(),'Con configuración válida debe mostrarse login');
    assert(!(await page.locator('#workspace').isVisible()),'El catálogo nunca es visible sin autorización');
    const signIn=async()=>{
      await page.locator('#email').fill('administracion@example.test');
      await page.locator('#request-code').click();
      await page.locator('#verify-form').waitFor({state:'visible'});
      await page.locator('#token').fill('123456');
      await page.locator('#verify-code').click();
    };
    await signIn();
    await page.waitForFunction(()=>document.querySelector('#status')?.textContent?.includes('no tiene autorización'));
    assert(!(await page.locator('#workspace').isVisible()),'Una cuenta sin rol no puede abrir editor');
    assert.equal(patches.length,0,'Una cuenta sin rol no puede editar');
    admin=true;
    await signIn();
    await page.locator('#workspace').waitFor({state:'visible'});
    assert.equal(await page.locator('#count').textContent(),'(1)');
    await page.locator('#price').fill('11000');
    await page.locator('#save').click();
    await page.waitForFunction(()=>document.querySelector('#status')?.textContent?.includes('Cambios guardados'));
    assert.equal(patches.length,1,'Debe registrar una sola modificación');
    assert.equal(patches[0].data.price_clp,11000,'Guardar precio CLP validado');
    assert.equal(patches[0].headers.authorization,'Bearer fake_test_access_token');
    denyWrite=true;
    await page.locator('#price').fill('12000');
    await page.locator('#save').click();
    await page.locator('#workspace').waitFor({state:'hidden'});
    assert(await page.locator('#login').isVisible(),'Denegación 401 debe bloquear el editor');
    assert.match(await page.locator('#status').innerText(),/Sesión vencida o permisos revocados/);
    assert(logoutUrls.every(url=>url.endsWith('/auth/v1/logout?scope=local')),'Logout debe revocar solo sesión local');
    console.log('OK administración simulada: sin configuración, OTP no admin, rol admin, edición y revocación 401');
  }finally{await context.close()}
}

let failures=0;
try{
  for(const [engine,type] of Object.entries({chromium,firefox,webkit})){
    const browser=await type.launch({headless:true});
    try{
      for(const width of (engine==='chromium'?[320,375,768,1440]:[375,1440])){
        const context=await browser.newContext({viewport:{width,height:850}});
        const page=await context.newPage();
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
          if(engine==='chromium'&&width===375){
            // Una comprobación automática ayuda a detectar regresiones; no sustituye
            // lectores de pantalla reales ni una evaluación completa de WCAG 2.2 AA.
            for(const route of ['/','/servicios.html','/cejas-concepcion.html','/privacidad.html','/gestion.html']){
              if(route!=='/')await page.goto(base+route,{waitUntil:'domcontentloaded'});
              const audit=await new AxeBuilder({page})
                .withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();
              const serious=audit.violations.filter(item=>item.impact==='serious'||item.impact==='critical');
              if(serious.length)throw new Error('A11y '+route+': '+JSON.stringify(serious.map(item=>({id:item.id,impact:item.impact,count:item.nodes.length,examples:item.nodes.slice(0,6).map(n=>({target:n.target,summary:n.failureSummary?.slice(0,160)}))}))));
              console.log('A11y OK '+route+' (sin hallazgos graves/críticos automáticos)');
            }
            await page.goto(base,{waitUntil:'domcontentloaded'});
            await page.locator('#serviceList .service').first().waitFor();
            await smokeGestion(browser);
          }
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
        }finally{await context.close()}
      }
    }finally{await browser.close()}
  }
}finally{await new Promise(resolve=>server.close(resolve))}
if(failures)process.exitCode=1;
