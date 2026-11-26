/* Actualización progresiva desde un proyecto dedicado de Supabase.
   Sin conexión, se conservan los precios y servicios originales del sitio. */
"use strict";
(()=>{
 const cfg=window.BN_CATALOG_CONFIG||{};
 if(!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(cfg.url||"")||!/^(sb_publishable_[A-Za-z0-9_-]+|eyJ[A-Za-z0-9_.-]+)$/.test(cfg.publishableKey||""))return;
 const status=document.getElementById("catalog-sync-status");
 const show=(state,message)=>{if(!status)return;status.hidden=false;status.dataset.state=state;status.textContent=message;};
 const originals=new Map((window.INITIAL_SERVICES||[]).map(s=>[s.id,s.name]));
 show("pending","Comprobando los precios del catálogo en línea…");
 const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),8000);
 fetch(cfg.url+"/rest/v1/bn_services?select=id,name,price_clp,duration,description&is_active=eq.true&order=display_order.asc,id.asc",{
  headers:{apikey:cfg.publishableKey,Prefer:"count=exact"},cache:"no-store",signal:controller.signal
 }).then(async result=>{
  if(!result.ok)throw Error("Error de lectura de Supabase");
  const rows=await result.json();
  if(!Array.isArray(rows)||rows.length>originals.size||rows.some(s=>!s)||new Set(rows.map(s=>s.id)).size!==rows.length)
    throw Error("Catálogo remoto inválido");
  // Un subconjunto solo es válido si PostgREST confirma que contiene todos los activos.
  const range=result.headers.get("Content-Range");
  const completeRange=rows.length?`0-${rows.length-1}/${rows.length}`:"*/0";
  if(range!==completeRange&&(range!==null||rows.length!==originals.size||rows.length===0))
    throw Error("Catálogo remoto incompleto");
  const valid=rows.every(s=>originals.has(s.id)&&originals.get(s.id)===s.name&&
   (s.price_clp===null||(Number.isInteger(s.price_clp)&&s.price_clp>=0&&s.price_clp<=2000000))&&
   typeof s.duration==="string"&&s.duration.trim().length>0&&s.duration.length<=60&&
   typeof s.description==="string"&&s.description.length<=1200);
  if(!valid)throw Error("Catálogo remoto inválido");
  window.dispatchEvent(new CustomEvent("bn:catalog-updated",{detail:rows}));
  if(rows.length)show("current","Precios obtenidos del catálogo en línea. Confirma el valor final al reservar.");
  else show("empty","El catálogo en línea no tiene servicios activos en este momento.");
  // La portada OnePage renderiza el catálogo mediante app.js.
  // No se mantienen páginas comerciales duplicadas.
 }).catch(()=>{
  // Never pretend stale static values were confirmed against the live catalog.
  show("offline","No fue posible confirmar los precios en línea. Los valores visibles son referenciales; confirma el precio por WhatsApp antes de reservar.");
 }).finally(()=>clearTimeout(timeout))
})();
