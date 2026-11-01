// Solo lectura. Registrar el estado real de www antes de proponer cambios DNS.
import assert from 'node:assert/strict';
const root='https://burbujasnails.cl/';
for(const [label,url] of [['principal',root],['www','https://www.burbujasnails.cl/']]){
 try{
   const response=await fetch(url,{
     redirect:'follow',signal:AbortSignal.timeout(15000),
     headers:{'User-Agent':'BurbujasNails-PublicAudit/1.0'}
   });
   assert(response.ok,'HTTP '+response.status);
   assert(response.url.startsWith('https://'),'La navegación final no es HTTPS');
   console.log('Host '+label+': '+response.status+' → '+response.url);
   if(label==='www'&&new URL(response.url).hostname!=='burbujasnails.cl')
     console.log('::warning title=www canónico::Revisar redirección a burbujasnails.cl');
 }catch(error){
   if(label==='principal')throw error;
   console.log('::warning title=www no verificado::'+error.message.replaceAll('\n',' ').slice(0,180));
 }
}
