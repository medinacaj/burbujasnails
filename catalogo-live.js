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
  if(!Array.isArray(rows)||rows.length!==27||new Set(rows.map(s=>s.id)).size!==27)return;
  const valid=rows.every(s=>/^s\d{2}$/.test(s.id)&&
   (s.price_clp===null||(Number.isInteger(s.price_clp)&&s.price_clp>=0&&s.price_clp<=2000000))&&
   typeof s.name==="string"&&typeof s.duration==="string"&&typeof s.description==="string");
  if(!valid)return;
  window.dispatchEvent(new CustomEvent("bn:catalog-updated",{detail:rows}));
  // La portada OnePage renderiza el catálogo mediante app.js.
  // No se mantienen páginas comerciales duplicadas.
 }).catch(()=>{/* Modo seguro: los precios estáticos se mantienen. */}).finally(()=>clearTimeout(timeout))
})();