import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const css = readFileSync(new URL('../styles.css', import.meta.url),'utf8');
const html = readFileSync(new URL('../index.html', import.meta.url),'utf8');
const privacy = readFileSync(new URL('../privacidad.html', import.meta.url),'utf8');

assert(html.includes('name="viewport" content="width=device-width, initial-scale=1.0"'),'Viewport responsive requerido');
assert(css.includes('--page-gutter:clamp(16px,3.2vw,44px)'),'Separación fluida de contenedores');
assert(css.includes('--page-gutter:20px') && css.includes('--page-gutter:16px'),'Separación adecuada en tablet y móvil');
assert(css.includes('overflow-x:clip'),'Protección frente a desbordamiento horizontal inesperado');
assert(css.includes('minmax(0,.82fr) minmax(0,1.18fr)'),'Columnas de proceso deben poder reducirse');
assert(css.includes('minmax(0,.87fr) minmax(0,1.13fr)'),'Columnas de contacto deben poder reducirse');
assert(css.includes('repeat(3,minmax(0,1fr))'),'La franja de beneficios no debe forzar tamaño mínimo');
assert(css.includes('.container > *') && css.includes('min-width:0'),'Permitir reducción intrínseca de contenido');
assert(css.includes('width:100%;max-width:100%;min-width:0'),'Respetar el ancho máximo de pantalla');
assert(css.includes('.gallery-grid{\n  width:100%;max-width:100%'),'La galería debe usar el ancho disponible');
assert(css.includes('aspect-ratio:4/3') && css.includes('max-height:205px'),'Las miniaturas deben mantenerse compactas');
assert(css.includes('.lb-dialog') && css.includes('max-height:min(68dvh,680px)'),'No romper modal de imágenes');
assert(css.includes('.hero-cta .btn{flex:1 1 100%;min-width:0'),'CTA móvil sin desbordamiento');
assert(css.includes('@media(max-width:400px)'),'Ajustes para móviles estrechos');
assert(css.includes('min-height:440px'),'La portada debe tener menos altura en escritorio');
assert(css.includes('.hero-deco{height:250px;width:100%;max-width:420px'),'La decoración debe ser discreta en escritorio');
assert(css.includes('.hero-deco{display:none}'),'La decoración debe estar oculta en móvil');
assert(css.includes('.hero-wrap{display:block;min-height:0;margin-top:0}'),'La portada móvil no debe reservar espacio a la decoración');
assert(html.includes('styles.css?v=heroDiscreto20261029'),'Invalidar caché de la portada');
assert(privacy.includes('styles.css?v=heroDiscreto20261029'),'Invalidar caché de privacidad');

// Comprobación numérica de que el contenedor nunca supera el ancho del viewport.
// Es complementaria a la revisión visual, no una prueba real de navegador.
const maxWidth = 1320;
for (const viewport of [320, 360, 375, 390, 430, 650, 768, 820, 1024, 1280, 1440, 1920]) {
  const gutter = viewport <= 650 ? 16
    : viewport <= 820 ? 20 : Math.max(16,Math.min(44,viewport*.032));
  const container = Math.min(viewport-2*gutter,maxWidth);
  assert(container > 0 && container < viewport,'Contenedor inválido a '+viewport+'px');
  const galleryCols = viewport <= 650 ? 2
    : viewport <= 820 ? 3 : viewport <= 1080 ? 4 : 5;
  const gap = viewport <= 650 ? 9 : 13;
  const thumbnailWidth = (container-gap*(galleryCols-1))/galleryCols;
  assert(thumbnailWidth > 0 && thumbnailWidth <= container,'Miniaturas deben caber a '+viewport+'px');
}
console.log('Contrato de anchos responsive en 12 viewports: OK');
