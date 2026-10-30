import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const html=read('index.html'),css=read('styles.css');
for(const id of ['inicio','inspiracion','servicios','reserva','galeria','esencia','visitanos','filters','serviceList','galleryGrid','bookingForm','lightbox']){
  assert(html.includes('id="'+id+'"'),'Falta sección/control: '+id);
}
for(const selector of ['.hero','.featured-grid','.catalog-panel','.service-top','.booking-card','.gallery-grid','.story-grid','.visit-grid','.lightbox','.wrap']){
  assert(css.includes(selector),'Falta estilo de la vista aprobada: '+selector);
}
assert(html.includes('class="skip-link"'),'Acceso rápido mediante teclado');
assert(html.includes('id="menuButton"')&&html.includes('id="mobilelinks"'),'Menú móvil');
assert(!html.includes('Diseño conceptual para evaluación'),'No publicar avisos de maqueta');
console.log('Contrato visual editorial y navegación: OK');