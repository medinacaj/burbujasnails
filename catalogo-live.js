/* Actualización progresiva desde un proyecto dedicado de Supabase.
   Sin conexión, se conservan los precios y servicios originales del sitio. */
"use strict";
(()=>{
 const cfg=window.BN_CATALOG_CONFIG||{};
 if(!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(cfg.url||"")||!/^(sb_publishable_[A-Za-z0-9_-]+|eyJ[A-Za-z0-9_.-]+)$/.test(cfg.publishableKey||""))return;
 const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),8000);
 fetch(cfg.url+"/rest/v1/bn_services?select=id,name,price_clp,duration,description&is_active=eq.true&order=display_order.asc,id.asc",{
  headers:{apikey:cfg.publishableKey},cache:"no-store",signal:controller.signal
 }).then(async result=>{
  if(!result.ok)throw Error("Error de lectura de Supabase");
  return result.json()
 }).then(rows=>{
  const originals=new Map((window.INITIAL_SERVICES||[]).map(s=>[s.id,s.name]));
  if(!Array.isArray(rows)||rows.length>originals.size||rows.some(s=>!s)||new Set(rows.map(s=>s.id)).size!==rows.length)return;
  const valid=rows.every(s=>originals.has(s.id)&&originals.get(s.id)===s.name&&
   (s.price_clp===null||(Number.isInteger(s.price_clp)&&s.price_clp>=0&&s.price_clp<=2000000))&&
   typeof s.duration==="string"&&s.duration.trim().length>0&&s.duration.length<=60&&
   typeof s.description==="string"&&s.description.length<=1200);
  if(!valid)return;
  window.dispatchEvent(new CustomEvent("bn:catalog-updated",{detail:rows}));
  // La portada OnePage renderiza el catálogo mediante app.js.
  // No se mantienen páginas comerciales duplicadas.
 }).catch(()=>{/* Modo seguro: los precios estáticos se mantienen. */}).finally(()=>clearTimeout(timeout))
})();