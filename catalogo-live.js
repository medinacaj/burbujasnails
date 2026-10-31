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
  // servicios.html mantiene HTML inicial legible sin JavaScript.
  for(const s of rows){
   const card=document.querySelector('.directory-item[data-service-id="'+s.id+'"]');
   if(!card)continue;
   const name=card.querySelector('h3[itemprop="name"]');
   if(!name||name.textContent!==s.name)continue;
   const label=card.querySelector(".directory-item-price");if(!label)continue;
   label.textContent=s.price_clp===null?"Consultar":"$"+new Intl.NumberFormat("es-CL").format(s.price_clp);
   let offer=card.querySelector('span[itemprop="offers"]');
   if(s.price_clp===null){if(offer){offer.parentElement.insertBefore(label,offer);offer.remove()}}
   else{
    if(!offer){offer=document.createElement("span");offer.setAttribute("itemprop","offers");offer.setAttribute("itemscope","");offer.setAttribute("itemtype","https://schema.org/Offer");label.parentElement.replaceChild(offer,label);offer.append(label)}
    let price=offer.querySelector('meta[itemprop="price"]');
    if(!price){price=document.createElement("meta");price.setAttribute("itemprop","price");offer.prepend(price)}
    price.setAttribute("content",String(s.price_clp));
    let currency=offer.querySelector('meta[itemprop="priceCurrency"]');
    if(!currency){currency=document.createElement("meta");currency.setAttribute("itemprop","priceCurrency");offer.prepend(currency)}
    currency.setAttribute("content","CLP")
   }
   const duration=card.querySelector(".directory-item-head + small");
   if(duration)duration.textContent="Duración orientativa: "+s.duration;
   const desc=card.querySelector('p[itemprop="description"]');
   if(desc)desc.textContent=s.description
  }
 }).catch(()=>{/* Modo seguro: los precios estáticos se mantienen. */}).finally(()=>clearTimeout(timeout))
})();