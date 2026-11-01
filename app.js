
const photoData={"trabajo-01":"gallery/trabajo-01.webp","trabajo-02":"gallery/trabajo-02.webp","trabajo-03":"gallery/trabajo-03.webp","trabajo-04":"gallery/trabajo-04.webp","trabajo-05":"gallery/trabajo-05.webp","trabajo-06":"gallery/trabajo-06.webp","trabajo-07":"gallery/trabajo-07.webp","trabajo-08":"gallery/trabajo-08.webp","trabajo-09":"gallery/trabajo-09.webp","trabajo-10":"gallery/trabajo-10.webp"};
const services=(Array.isArray(window.INITIAL_SERVICES)?window.INITIAL_SERVICES:[]).map(s=>({id:s.id,category:s.category,name:s.name,price:s.price,duration:s.duration,popular:!!s.popular,description:s.description||''}));
const gallery=[{"photo":"trabajo-02","title":"Francesa rosada","alt":"Manicura francesa con puntas rosadas y uñas almendradas"},{"photo":"trabajo-03","title":"Invierno en azul","alt":"Uñas esmaltadas en azul claro con copos de nieve decorativos"},{"photo":"trabajo-04","title":"Perlas y relieve","alt":"Diseño de uñas nacaradas blancas con relieve y pequeñas perlas"},{"photo":"trabajo-05","title":"Rojo vino","alt":"Manicura de uñas largas color rojo vino brillante"},{"photo":"trabajo-06","title":"Nude con lunares","alt":"Manicura nude con lunares blancos sobre uñas cortas"},{"photo":"trabajo-07","title":"Diseño gráfico","alt":"Uñas decoradas con dibujos negros y amarillos"},{"photo":"trabajo-08","title":"Naranja artístico","alt":"Nail art naranja y negro con decoración gráfica"},{"photo":"trabajo-09","title":"Azul floral","alt":"Uñas en tonos azules y blancos con motivos florales"},{"photo":"trabajo-10","title":"Brillo oscuro","alt":"Manicura oscura con esmalte negro brillante y destellos"},{"photo":"trabajo-01","title":"El espacio de trabajo","alt":"Material de manicura y esterilización en el estudio"}];
const cats=['Todos','Uñas manos','Extensiones','Uñas pies','Promociones','Retiros','Pestañas y cejas','Extras'];
const categoryIntros={"Uñas manos":"Manicura clásica, esmaltado de larga duración, gel builder y diseños sobre la uña natural.","Extensiones":"Alternativas para añadir largo o cambiar la forma: soft gel, press on, acrílicas y polygel.","Uñas pies":"Desde pedicura básica hasta tratamientos spa y deluxe, con distintos cuidados y acabados.","Promociones":"Opciones para combinar servicios de manos y pies, sujetas a disponibilidad y condiciones.","Retiros":"Retiro de esmaltado o extensiones, con limpieza y cuidado de la uña natural.","Pestañas y cejas":"Diseño, perfilado, laminado, planchado de cejas, lifting combinado y depilación facial.","Extras":"Hidratación complementaria con mascarillas para manos y parafina para pies."};
const colorIcons={'Uñas manos':'💅','Extensiones':'✨','Uñas pies':'🌸','Promociones':'🎀','Retiros':'🫧','Pestañas y cejas':'🦋','Extras':'🩷'};
const fold=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('es');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const wa=msg=>'https://wa.me/56930912644?text='+encodeURIComponent(msg);
for (const img of document.querySelectorAll('[data-photo]'))img.src=photoData[img.dataset.photo];
let active='Todos', expanded=false,needle='';
const filters=document.getElementById('filters'),serviceList=document.getElementById('serviceList'),count=document.getElementById('serviceCount'),more=document.getElementById('showAll');
const categoryNote=document.getElementById('categoryNote');
filters.innerHTML=cats.map(x=>`<button type="button" class="filter ${x===active?'active':''}" data-cat="${esc(x)}" aria-pressed="${x===active}">${esc(x)}</button>`).join('');
filters.addEventListener('click',e=>{const b=e.target.closest('button[data-cat]');if(!b)return;active=b.dataset.cat;expanded=active!=='Todos';filters.querySelectorAll('button').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b))});render();});
document.getElementById('searchService').addEventListener('input',e=>{needle=fold(e.target.value).trim();if(needle)expanded=true;render();});
more.addEventListener('click',()=>{expanded=!expanded;render();});
document.getElementById('clearFilters').addEventListener('click',()=>{active='Todos';needle='';expanded=false;document.getElementById('searchService').value='';filters.querySelectorAll('button').forEach(b=>{const chosen=b.dataset.cat===active;b.classList.toggle('active',chosen);b.setAttribute('aria-pressed',String(chosen))});render();document.getElementById('searchService').focus()});
function render(){
 const results=services.filter(s=>(active==='Todos'||s.category===active)&&(!needle||fold(s.name+' '+s.category+' '+s.description).includes(needle)));
 const shown=expanded?results:results.slice(0,6);
 count.textContent=`${results.length} ${results.length===1?'servicio':'servicios'} ${active==='Todos'?'en nuestro catálogo':'en '+active}`;
 categoryNote.hidden=active==='Todos';categoryNote.textContent=categoryIntros[active]||'';
 serviceList.innerHTML=shown.length?shown.map(s=>`<article class="service"><button class="service-top" aria-expanded="false" type="button"><span class="service-icon" aria-hidden="true">${colorIcons[s.category]||'✦'}</span><span class="service-info"><span class="service-title">${esc(s.name)} ${s.popular?'✦':''}</span><span class="service-sub">${esc(s.duration)}</span></span><span class="price">${s.price==='Consultar'?'Consultar':'$'+esc(s.price)}</span><span class="service-plus" aria-hidden="true">+</span></button><div class="service-body"><p>${esc(s.description)}</p><a href="${wa('Hola, quisiera consultar por '+s.name+' en Burbujas Nails')}" target="_blank" rel="noopener noreferrer">Consultar este servicio por WhatsApp ↗</a></div></article>`).join(''):`<p class="catalog-empty" role="status">${services.length?'No encontramos servicios que coincidan. Prueba con otra palabra o selecciona otra categoría.':'No hay servicios disponibles en el catálogo en este momento. Puedes consultar al estudio por WhatsApp.'}</p>`;
 serviceList.querySelectorAll('.service-top').forEach(b=>b.addEventListener('click',()=>{let card=b.closest('.service');let opening=!card.classList.contains('is-open');card.classList.toggle('is-open',opening);b.setAttribute('aria-expanded',String(opening))}));
 more.style.display=results.length<=6?'none':'block';more.textContent=expanded?'Mostrar menos ↑':`Ver los ${results.length} servicios ↘`;
}
render();
const originalServices=services.map(s=>({...s}));
const select=document.getElementById('serviceSelect');
function updateServiceSelect(){
 const previous=select.value;select.replaceChildren(new Option('Selecciona un servicio',''));
 services.forEach(s=>select.add(new Option(s.name,s.name)));
 select.value=services.some(s=>s.name===previous)?previous:'';
 select.disabled=services.length===0;
 document.querySelector('#bookingForm button[type=submit]').disabled=services.length===0;
 const recovery=document.getElementById('bookingRecovery');recovery.hidden=true;
 document.getElementById('bookingFallback').removeAttribute('href');
}
updateServiceSelect();
/* Identidades fijas del catálogo; el backend puede retirar activos, incluso todos. */
window.addEventListener("bn:catalog-updated",e=>{
 const remote=e.detail,originals=new Map(originalServices.map(s=>[s.id,s]));
 if(!Array.isArray(remote)||remote.length>originals.size||remote.some(s=>!s)||new Set(remote.map(s=>s.id)).size!==remote.length)return;
 const valid=remote.every(d=>originals.has(d.id)&&originals.get(d.id).name===d.name&&
  (d.price_clp===null||(Number.isInteger(d.price_clp)&&d.price_clp>=0&&d.price_clp<=2000000))&&
  typeof d.duration==='string'&&d.duration.trim().length>0&&d.duration.length<=60&&
  typeof d.description==='string'&&d.description.length<=1200);
 if(!valid)return;
 const updated=remote.map(d=>({...originals.get(d.id),price:d.price_clp===null?'Consultar':new Intl.NumberFormat('es-CL').format(d.price_clp),duration:d.duration,description:d.description}));
 services.splice(0,services.length,...updated);
 document.getElementById('catalogTotal').textContent=`${services.length} servicios disponibles en catálogo`;
 render();updateServiceSelect();
});
const date=document.getElementById('preferredDate');function updateDateMin(){const today=new Date();date.min=[today.getFullYear(),String(today.getMonth()+1).padStart(2,'0'),String(today.getDate()).padStart(2,'0')].join('-')}updateDateMin();date.addEventListener('focus',updateDateMin);
const bookingForm=document.getElementById('bookingForm'),recovery=document.getElementById('bookingRecovery'),fallback=document.getElementById('bookingFallback');
// El acceso flotante no debe cubrir los campos ni el botón de la consulta.
const floatingContact=document.querySelector('.floating');
new IntersectionObserver(entries=>{floatingContact.hidden=entries[0].isIntersecting},{threshold:0}).observe(bookingForm);
bookingForm.addEventListener('input',()=>{recovery.hidden=true;fallback.removeAttribute('href')});
bookingForm.addEventListener('change',()=>{recovery.hidden=true;fallback.removeAttribute('href')});
bookingForm.addEventListener('submit',e=>{
 e.preventDefault();if(!select.value){select.focus();return;}
 const parts=date.value.split('-').map(Number);
 const day=date.value?new Intl.DateTimeFormat('es-CL',{day:'numeric',month:'long',year:'numeric'}).format(new Date(parts[0],parts[1]-1,parts[2],12)):'';
 const name=document.getElementById('bookingName').value.trim();
 const msg=`Hola, quisiera consultar disponibilidad para ${select.value}.${day?' Mi día preferido es '+day+'.':''}${name?' Mi nombre es '+name+'.':''} Muchas gracias.`;
 const link=wa(msg);fallback.href=link;recovery.hidden=false;
 // noopener puede devolver null incluso si la ventana se abrió; el enlace queda disponible siempre.
 window.open(link,'_blank','noopener,noreferrer');
});
const grid=document.getElementById('galleryGrid');grid.innerHTML=gallery.map((item,i)=>`<button type="button" class="gallery-btn" data-idx="${i}" aria-label="Ampliar: ${esc(item.title)}"><img loading="lazy" decoding="async" width="720" height="1280" alt="${esc(item.alt)}" src="${photoData[item.photo]}"></button>`).join('');
const lb=document.getElementById('lightbox'),lbImg=document.getElementById('lbImage'),lbCap=document.getElementById('lbCaption');let idx=0,priorFocus=null;
function showPic(i){idx=(i+gallery.length)%gallery.length;lbImg.src=photoData[gallery[idx].photo];lbImg.alt=gallery[idx].alt;lbCap.textContent=gallery[idx].title}
let inerted=[];
function openLb(i){priorFocus=document.activeElement;showPic(i);lb.classList.add('open');inerted=[...document.body.children].filter(el=>el!==lb&&!el.inert);inerted.forEach(el=>el.inert=true);document.body.classList.add('noscroll');document.getElementById('lbClose').focus()}
function closeLb(){lb.classList.remove('open');document.body.classList.remove('noscroll');inerted.forEach(el=>el.inert=false);inerted=[];priorFocus?.focus()}
grid.addEventListener('click',e=>{const b=e.target.closest('[data-idx]');if(b)openLb(Number(b.dataset.idx))});document.getElementById('lbClose').addEventListener('click',closeLb);document.getElementById('lbPrev').addEventListener('click',()=>showPic(idx-1));document.getElementById('lbNext').addEventListener('click',()=>showPic(idx+1));lb.addEventListener('click',e=>{if(e.target===lb)closeLb()});document.addEventListener('keydown',e=>{if(!lb.classList.contains('open'))return;if(e.key==='Escape')closeLb();if(e.key==='ArrowLeft')showPic(idx-1);if(e.key==='ArrowRight')showPic(idx+1);if(e.key==='Tab'){const buttons=[...lb.querySelectorAll('button')];const i=buttons.indexOf(document.activeElement);if(e.shiftKey&&i===0){e.preventDefault();buttons.at(-1).focus()}else if(!e.shiftKey&&i===buttons.length-1){e.preventDefault();buttons[0].focus()}}});
let startX=0;lb.addEventListener('touchstart',e=>startX=e.touches[0].clientX,{passive:true});lb.addEventListener('touchend',e=>{let d=e.changedTouches[0].clientX-startX;if(Math.abs(d)>50)showPic(idx+(d<0?1:-1))},{passive:true});
const mapButton=document.getElementById('mapOpen');const mapEmbed=document.getElementById('mapEmbed');const mapVisual=document.getElementById('mapVisual');mapButton.addEventListener('click',()=>{const showScheme=mapVisual.hidden;mapVisual.hidden=!showScheme;mapEmbed.hidden=showScheme;mapButton.textContent=showScheme?'Ver mapa interactivo ↗':'Ver esquema ilustrativo ↗'});
const menu=document.getElementById('menuButton'),mobile=document.getElementById('mobilelinks');menu.addEventListener('click',()=>{const open=mobile.classList.toggle('is-open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Cerrar menú':'Abrir menú')});function closeMobileMenu(restoreFocus=false){mobile.classList.remove('is-open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Abrir menú');if(restoreFocus)menu.focus()}
mobile.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>closeMobileMenu()));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&mobile.classList.contains('is-open'))closeMobileMenu(true)});
document.addEventListener('click',e=>{if(mobile.classList.contains('is-open')&&!mobile.contains(e.target)&&!menu.contains(e.target))closeMobileMenu()});