import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read = f => readFileSync(new URL('../'+f,import.meta.url),'utf8');
const css=read('styles.css'),js=read('app.js'),html=read('index.html'),data=read('data.js');

assert(css.includes('grid-template-columns:repeat(5,minmax(0,1fr))'),'Escritorio: miniaturas en 5 columnas');
assert(css.includes('grid-template-columns:repeat(3,minmax(0,1fr))'),'Tableta: miniaturas en 3 columnas');
assert(css.includes('grid-template-columns:repeat(2,minmax(0,1fr))'),'Móvil: miniaturas en 2 columnas');
assert(css.includes('.gallery-item') && css.includes('aspect-ratio:4/5'),'Mantener miniaturas uniformes');
assert(css.includes('width:min(100%,1000px)'),'Limitar ancho del conjunto de fotos');
assert(css.includes('.lb-dialog') && css.includes('max-height:min(68dvh,680px)'),'Limitar altura del modal');
assert(css.includes('body.gallery-modal-open{overflow:hidden}'),'Bloquear scroll tras abrir modal');
assert(js.includes('document.createElement(\'button\')'),'Galería accesible mediante botones');
assert(js.includes('aria-modal="true"'),'El modal debe tener semántica de diálogo');
for(const check of ['Cerrar imagen','Imagen anterior','Imagen siguiente','e.key === \'Escape\'','e.key === \'Tab\'','previousFocus.focus()','if (e.target === ov) close()','document.removeEventListener(\'keydown\', onKey)']){
  assert(js.includes(check),'Falta función del modal: '+check);
}
assert(html.includes('styles.css?v=thumbs20261029'),'Invalidación de caché de CSS');
assert(html.includes('app.js?v=modal20261029'),'Invalidación de caché del JavaScript');
assert((data.match(/gallery\/trabajo-\d{2}\.webp/g)||[]).length===10,'Conservar las 10 fotografías');
assert(html.includes('id="galleryGrid"') && html.includes('<noscript>'),'Conservar galería SEO');
console.log('Galería: miniaturas responsive y modal accesible OK');
