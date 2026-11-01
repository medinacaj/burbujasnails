// Muestra resultados del laboratorio Lighthouse, sin inventar datos CrUX.
import assert from 'node:assert/strict';
import {readFileSync,appendFileSync} from 'node:fs';
const files=['mobile','desktop'];
const rows=[];
for(const device of files){
 const data=JSON.parse(readFileSync('.lighthouse/'+device+'.json','utf8'));
 assert(!data.runtimeError,'Lighthouse no pudo terminar '+device+': '+data.runtimeError?.message);
 assert(data.finalDisplayedUrl?.startsWith('https://burbujasnails.cl/')||data.finalUrl?.startsWith('https://burbujasnails.cl/'),
   'Lighthouse analizó un destino distinto para '+device);
 const scores={};
 for(const category of ['performance','accessibility','best-practices','seo']){
   const score=data.categories?.[category]?.score;
   assert(typeof score==='number','Falta resultado '+category+' '+device);
   scores[category]=Math.round(score*100);
 }
 const audits=data.audits||{};
 const value=id=>audits[id]?.displayValue||'No disponible';
 const metrics={
   lcp:value('largest-contentful-paint'),
   fcp:value('first-contentful-paint'),
   cls:value('cumulative-layout-shift'),
   tbt:value('total-blocking-time'),
   speedIndex:value('speed-index')
 };
 const opportunities=Object.entries(audits).filter(([,a])=>
   a.details?.overallSavingsMs>100 && a.score!==null && a.score<0.9
 ).sort((a,b)=>(b[1].details?.overallSavingsMs||0)-(a[1].details?.overallSavingsMs||0))
 .slice(0,5).map(([id,a])=>({id,savings:Math.round(a.details.overallSavingsMs)}));
 rows.push({device,scores,metrics,opportunities});
 console.log('Lighthouse '+device+' (laboratorio): '+JSON.stringify({scores,metrics,opportunities}));
}
let markdown='# Auditoría Lighthouse — Burbujas Nails (laboratorio)\n\n';
markdown+='**La ejecución analiza producción actualmente publicada, NO el código de la rama del PR.** Datos puntuales de laboratorio; no son percentiles p75 de usuarios reales ni comprueban INP.\n\n';
markdown+='| Dispositivo | Performance | Accesibilidad | Prácticas | SEO | LCP | CLS | TBT |\n';
markdown+='|---|---:|---:|---:|---:|---|---|---|\n';
for(const r of rows){
 markdown+='| '+r.device+' | '+r.scores.performance+' | '+r.scores.accessibility+' | '+r.scores['best-practices']+' | '+r.scores.seo+' | '+r.metrics.lcp+' | '+r.metrics.cls+' | '+r.metrics.tbt+' |\n';
}
for(const r of rows){
 markdown+='\n**Oportunidades '+r.device+':** '+(r.opportunities.map(o=>o.id+' (~'+o.savings+' ms estimados)').join('; ')||'sin ahorros mayores a 100 ms estimados')+'\n';
}
markdown+='\nLos informes JSON completos se incluyen en los artefactos de GitHub Actions.\n';
if(process.env.GITHUB_STEP_SUMMARY)appendFileSync(process.env.GITHUB_STEP_SUMMARY,markdown);
console.log(markdown);
