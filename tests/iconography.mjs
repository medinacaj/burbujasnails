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
assert((html.match(/class="contact-ico" aria-hidden="true"><svg class="ui-icon ui-icon-color"/g)||[]).length===3,'Usar SVG en los 3 contactos');
assert(!html.includes('aria-hidden="true">⌖')&&!html.includes('aria-hidden="true">✉')&&!html.includes('aria-hidden="true">◇'),'Eliminar símbolos incompatibles');
for(const rule of ['.ui-icon{display:block;width:22px;height:22px','.fb .ui-icon{width:19px;height:19px','.svc-ico .ui-icon{position:relative;z-index:1;width:29px;height:29px','.contact-ico .ui-icon{position:relative;z-index:1;width:20px;height:20px','.svc-ico .ui-icon{width:25px;height:25px','.svc-ico .ui-icon{width:22px;height:22px']){
  assert(css.includes(rule),'Falta ajuste de tamaño: '+rule);
}
assert(css.includes('min-height:44px'),'Filtros deben disponer de superficie táctil cómoda');
assert(html.includes('styles.css?v=iconsColor20261029'),'Actualizar versión de CSS');
assert(html.includes('data.js?v=icons20261029'),'Actualizar versión de datos');
assert(html.includes('app.js?v=iconsColor20261029'),'Actualizar versión JS');
assert(!app.includes('https://cdn')&&!app.includes('https://unpkg'),'Los iconos no dependen de bibliotecas externas');

// Luxury-cute: cada categoría tiene una clase segura y una paleta semántica.
assert(app.includes('const CAT_THEME = Object.freeze('),'Definir temas locales, sin categorías arbitrarias');
assert(app.includes('categoryTheme(s.category)'),'Cada tarjeta debe aplicar su paleta');
assert(app.includes('categoryTheme(c)'),'Los filtros deben aplicar su paleta');
for(const clazz of ['is-manos','is-extensiones','is-pies','is-promos','is-retiros','is-cejas','is-extras']){
  assert(app.includes("'"+clazz+"'"),'Falta categoría JS '+clazz);
  assert(css.includes('.'+clazz),'Falta categoría CSS '+clazz);
}
assert(css.includes('--icon-rose:#a84d72') && css.includes('--icon-champagne:#d8b38a'),'Faltan tonos de marca');
assert(css.includes('linear-gradient(150deg,var(--tile-light') && css.includes('.svc-ico::after'),'Falta acabado perlado y brillo champagne');
assert(css.includes('width:48px;height:48px;display:grid'),'Contenedor de servicio desktop 48px');
assert(css.includes('width:29px;height:29px'),'Iconos de servicio multicolor más expresivos, 29px');
assert(css.includes('.svc-ico{height:42px;width:42px'),'Contenedor de servicio móvil 42px');
assert(css.includes('.contact-ico{width:42px;height:42px'),'Contacto móvil 42px');
assert(css.includes('.fb.active .ui-icon,.fb[aria-pressed="true"] .ui-icon{color:#fff}'),'Filtros activos deben mantener contraste');
assert(!app.includes('CAT_EMOJI'),'Evitar regresar a emojis dependientes de plataforma');


// Contrato de iconografía realmente policromática: rellenos del propio dibujo.
assert(app.includes('ui-icon ui-icon-color'),'El SVG necesita estilo ilustrado');
assert(app.includes('stroke="none"'),'El SVG no debe depender únicamente de trazo monocromo');
for(const kind of ['art-main','art-secondary','art-gold','art-light']){
  assert(app.includes('class=\\\"'+kind+'\\\"'),'Los dibujos requieren capas de color: '+kind);
  assert(css.includes('.ui-icon-color .'+kind),'Estilo de relleno no declarado para '+kind);
}
for(const category of ['manos','extensiones','pies','promos','retiros','cejas','extras']){
  const selector=':is(.svc-ico,.fb).is-'+category+'{--art-primary:';
  assert(css.includes(selector),'Falta paleta ilustrada: '+category);
}
assert(css.includes('width:29px;height:29px'),'Arte principal demasiado pequeño en escritorio');
assert(css.includes('width:25px;height:25px'),'Arte principal demasiado pequeño en móviles');
assert((html.match(/class="ui-icon ui-icon-color"/g)||[]).length===3,'Contacto también debe ser multicolor');

console.log('Iconografía: 27 servicios, 7 categorías, 3 contactos, responsive y SVG seguros OK');
