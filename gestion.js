/* Panel de Burbujas Nails. La clave publicable es pública; permisos en Supabase RLS. */
"use strict";
(()=>{
 const cfg=window.BN_CATALOG_CONFIG||{};
 const get=id=>document.getElementById(id);
 const setup=get("setup"),login=get("login"),workspace=get("workspace"),status=get("status");
 const configured=/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(cfg.url||"")&&/^(sb_publishable_[A-Za-z0-9_-]+|eyJ[A-Za-z0-9_.-]+)$/.test(cfg.publishableKey||"");
 const auth={email:"",token:"",id:""};
 let rows=[],selected="",saving=false;
 const money=x=>x===null||x===undefined?"Consultar":"$"+new Intl.NumberFormat("es-CL").format(x);
 const say=(msg,ok=false)=>{status.hidden=false;status.classList.toggle("ok",ok);status.textContent=msg};
 const clear=()=>{status.hidden=true;status.textContent="";status.classList.remove("ok")};
 const element=(tag,text,cls)=>{const e=document.createElement(tag);e.textContent=text||"";if(cls)e.className=cls;return e};
 async function api(path,options={}){
   const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),15000);
   const headers={"apikey":cfg.publishableKey,"Content-Type":"application/json"};
   if(options.token!==false&&auth.token)headers.Authorization="Bearer "+auth.token;
   if(options.prefer)headers.Prefer=options.prefer;
   try{
     const response=await fetch(cfg.url+path,{method:options.method||"GET",headers,body:options.data===undefined?undefined:JSON.stringify(options.data),signal:controller.signal,cache:"no-store"});
     const raw=await response.text();let data=null;try{data=raw?JSON.parse(raw):null}catch{}
     if(!response.ok)throw Error(data?.message||data?.msg||data?.error_description||data?.error||"Error HTTP "+response.status);
     return data;
   }finally{clearTimeout(timeout)}
 }
 function logout(){auth.token="";auth.id="";auth.email="";rows=[];selected="";workspace.hidden=true;login.hidden=false;get("verify-form").hidden=true;get("token").value="";clear()}
 if(!configured){setup.hidden=false;return}
 login.hidden=false;
 get("request-form").addEventListener("submit",async e=>{
   e.preventDefault();clear();
   const email=get("email").value.trim().toLowerCase();
   if(!/^\S+@\S+\.\S+$/.test(email))return say("Introduce un correo válido.");
   get("request-code").disabled=true;
   try{
     await api("/auth/v1/otp",{method:"POST",data:{email,create_user:false},token:false});
     auth.email=email;get("verify-form").hidden=false;say("Revisa tu correo e introduce el código de acceso.",true);get("token").focus()
   }catch(err){say("No se pudo solicitar el código: "+err.message)}
   finally{get("request-code").disabled=false}
 });
 get("verify-form").addEventListener("submit",async e=>{
   e.preventDefault();clear();const token=get("token").value.trim();
   if(!/^\d{6,8}$/.test(token))return say("El código debe tener de seis a ocho dígitos.");
   get("verify-code").disabled=true;
   try{
     const result=await api("/auth/v1/verify",{method:"POST",data:{email:auth.email,token,type:"email"},token:false});
     if(!result?.access_token||!result?.user?.id)throw Error("Sesión de acceso inválida.");
     auth.token=result.access_token;auth.id=result.user.id;
     const allowed=await api("/rest/v1/bn_admin_users?select=user_id&user_id=eq."+encodeURIComponent(auth.id));
     if(!Array.isArray(allowed)||!allowed.some(x=>x.user_id===auth.id)){logout();return say("Esta cuenta no tiene autorización administrativa.")}
     login.hidden=true;workspace.hidden=false;await load();say("Acceso verificado. Los cambios se guardan con autorización.",true)
   }catch(err){auth.token="";workspace.hidden=true;login.hidden=false;say("No se pudo iniciar sesión: "+err.message)}
   finally{get("verify-code").disabled=false}
 });
 get("logout").addEventListener("click",logout);
 async function load(){
   const list=await api("/rest/v1/bn_services?select=id,name,category,price_clp,duration,description,display_order,updated_at&order=display_order.asc,id.asc");
   if(!Array.isArray(list))throw Error("Respuesta inesperada de los servicios.");
   rows=list;get("count").textContent="("+rows.length+")";render();if(rows.length)choose(rows[0].id)
 }
 function render(){
   const list=get("services");list.replaceChildren();
   const query=get("search").value.trim().toLocaleLowerCase("es");
   const shown=rows.filter(s=>(s.name+" "+s.category).toLocaleLowerCase("es").includes(query));
   for(const s of shown){
     const button=element("button","","item");button.type="button";button.setAttribute("role","listitem");
     button.setAttribute("aria-pressed",String(s.id===selected));
     const label=element("span",s.name);label.append(element("small",s.category));
     button.append(label,element("strong",money(s.price_clp)));
     button.addEventListener("click",()=>choose(s.id));list.append(button)
   }
   if(!shown.length)list.append(element("p","No se encontraron servicios.","hint"))
 }
 function choose(id){
   const s=rows.find(x=>x.id===id);if(!s)return;
   selected=id;render();get("edit-form").hidden=false;
   get("edit-name").textContent=s.name;get("edit-category").textContent=s.category;
   get("price").value=s.price_clp===null?"":String(s.price_clp);
   get("duration").value=s.duration||"";get("description").value=s.description||"";
   get("selected-description").textContent="Precio, duración y descripción del servicio seleccionado.";
   history(id)
 }
 async function history(id){
   const list=get("history");list.replaceChildren(element("p","Consultando historial...","hint"));
   try{
     const result=await api("/rest/v1/bn_price_history?select=old_price_clp,new_price_clp,changed_at&service_id=eq."+encodeURIComponent(id)+"&order=changed_at.desc&limit=15");
     if(id!==selected)return;list.replaceChildren();
     if(!Array.isArray(result)||!result.length){list.append(element("p","Aún no hay cambios de precio.","hint"));return}
     for(const change of result){
       const item=element("div","","change");
       item.append(element("strong",money(change.old_price_clp)+" → "+money(change.new_price_clp)));
       const date=new Date(change.changed_at);
       item.append(element("small",Number.isNaN(date.getTime())?"Fecha no disponible":new Intl.DateTimeFormat("es-CL",{dateStyle:"medium",timeStyle:"short",timeZone:"America/Santiago"}).format(date)));
       list.append(item)
     }
   }catch(err){if(id===selected)list.replaceChildren(element("p","No se pudo consultar el historial: "+err.message,"hint"))}
 }
 get("search").addEventListener("input",render);
 get("edit-form").addEventListener("submit",async e=>{
   e.preventDefault();if(saving||!selected||!auth.token)return;
   const service=rows.find(x=>x.id===selected);if(!service)return;
   const input=get("price").value.trim(),price=input===""?null:Number(input);
   const duration=get("duration").value.trim(),description=get("description").value.trim();
   if(price!==null&&(!Number.isInteger(price)||price<0||price>2000000))return say("El precio debe estar entre $0 y $2.000.000.");
   if(!duration||duration.length>60||description.length>1200)return say("Revisa la duración y la descripción.");
   if(price===service.price_clp&&duration===service.duration&&description===service.description)return say("No hay modificaciones para guardar.");
   saving=true;get("save").disabled=true;const id=selected;
   try{
     const result=await api("/rest/v1/bn_services?id=eq."+encodeURIComponent(id),{method:"PATCH",data:{price_clp:price,duration,description},prefer:"return=representation"});
     if(!Array.isArray(result)||result.length!==1)throw Error("La base no autorizó la actualización.");
     Object.assign(service,result[0]);render();await history(id);say("Cambios guardados en "+service.name+": "+money(service.price_clp),true)
   }catch(err){say("No se pudo guardar: "+err.message)}
   finally{saving=false;get("save").disabled=false}
 });
})();