import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const js=read('app.js'),css=read('styles.css');
for(const cat of ['Uñas manos','Extensiones','Uñas pies','Promociones','Retiros','Pestañas y cejas','Extras'])assert(js.includes("'"+cat+"':"),'Falta icono de categoría: '+cat);
assert(js.includes('colorIcons'),'Iconografía de colores del prototipo aprobado');
assert(css.includes('.service-icon'),'Tamaño del contenedor de iconos');
assert(css.includes('.benefit-icon'),'Iconos de beneficios');
console.log('Iconografía de la vista aprobada: OK');