import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read = path => readFileSync(new URL('../'+path,import.meta.url),'utf8');
const html=read('index.html'),css=read('styles.css'),app=read('app.js'),data=read('data.js');

const serviceIcons=[...data.matchAll(/\bid:'(s\d{2})', icon:'([a-z]+)', category:'([^']+)'/g)]
  .map(x=>({id:x[1],icon:x[2],category:x[3]}));
assert.equal(serviceIcons.length,27,'Conservar 27 servicios con identificador de icono semántico');
assert.equal(new Set(serviceIcons.map(x=>x.id)).size,27,'No repetir IDs de servicios');
assert(!/\bemoji:/.test(data),'No incluir emojis arbitrarios en el catálogo');
const categories=[...new Set(serviceIcons.map(x=>x.category))];
assert.equal(categories.length,7,'Conservar 7 categorías');
for(const row of serviceIcons){
  assert(app.includes(row.icon+': '),'Icono no definido: '+row.icon+' para '+row.id);
}
for(const category of categories)assert(app.includes("'"+category+"': "),'Categoría sin icono: '+category);
assert(app.includes('const ICON_PATHS = Object.freeze('),'Los iconos deben proceder de una lista cerrada');
assert(app.includes('function iconSvg(name)'),'Debe existir un único componente SVG');
assert(app.includes('const paths = ICON_PATHS[name] || ICON_PATHS.sparkles'),'SVG desconocidos deben usar fallback controlado');
assert(app.includes('iconSvg(s.icon)'),'Los servicios deben usar iconos SVG');
assert(app.includes('iconSvg(CAT_ICON[c])'),'Los filtros deben usar iconos coherentes');
assert(!app.includes('CAT_EMOJI'),'No conservar iconos emoji heredados');
assert(app.includes('aria-hidden="true" focusable="false"'),'Iconos decorativos ocultos de lectores de pantalla');
// El nombre accesible de la tarjeta se genera en el JavaScript.
assert(app.includes('aria-label="Detalles de'),'Tarjetas de servicios deben conservar nombre accesible');
assert((html.match(/class="contact-ico"/g)||[]).length===3,'Conservar 3 iconos de contacto');
for(const name of ['Visítanos','WhatsApp','Pago en línea'])assert(html.includes(name),'Falta bloque de contacto: '+name);
assert((html.match(/class="contact-ico" aria-hidden="true"><svg class="ui-icon"/g)||[]).length===3,'Usar SVG en los 3 contactos');
assert(!html.includes('aria-hidden="true">⌖')&&!html.includes('aria-hidden="true">✉')&&!html.includes('aria-hidden="true">◇'),'Eliminar símbolos incompatibles');
for(const rule of ['.ui-icon{display:block;width:22px;height:22px','.fb .ui-icon{width:16px;height:16px','.svc-ico .ui-icon{width:22px;height:22px','.contact-ico .ui-icon{width:22px;height:22px','.svc-ico .ui-icon{width:19px;height:19px','.svc-ico .ui-icon{width:17px;height:17px']){
  assert(css.includes(rule),'Falta ajuste de tamaño: '+rule);
}
assert(css.includes('min-height:44px'),'Filtros deben disponer de superficie táctil cómoda');
assert(html.includes('styles.css?v=icons20261029'),'Actualizar versión de CSS');
assert(html.includes('data.js?v=icons20261029'),'Actualizar versión de datos');
assert(html.includes('app.js?v=icons20261029'),'Actualizar versión JS');
assert(!app.includes('https://cdn')&&!app.includes('https://unpkg'),'Los iconos no dependen de bibliotecas externas');
console.log('Iconografía: 27 servicios, 7 categorías, 3 contactos, responsive y SVG seguros OK');
