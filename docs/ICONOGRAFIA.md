# Auditoría de iconografía y tamaños — Burbujas Nails
**Fecha:** 29-10-2026 · **Ámbito:** portada, catálogo, contacto, navegación y galería.
**Objetivo:** sistema visual sobrio, reconocible, accesible, liviano y consistente en Windows, iOS y Android.

## Diagnóstico previo
- El catálogo mostraba **27 emojis distintos**, muchos con significados poco relacionados con el servicio: 🔮 para polygel, 🌙 para tips, 🩰 para pedicura y 💆 para manicura.
- Los emoji cambian de ilustración, tamaño aparente y color entre sistemas operativos y por ello no dan consistencia visual a la marca.
- En contacto se usaban caracteres especiales **⌖, ✉, ◇** sin una familia gráfica común.
- Los tamaños dependían de `font-size` y no de un diseño de iconos, mezclando trazo monocromo y emojis multicolor.

## Decisión
Se migraron los 27 servicios a **17 pictogramas SVG locales**, de trazos homogéneos de 1.7–1.9 y color rosa/ciruela. No requieren CDN, paquete JS adicional, fuentes de íconos ni recursos de terceros. Los iconos son decorativos (`aria-hidden`); el nombre completo del servicio permanece accesible.

| Grupo de servicios | Símbolos de trazo seleccionados | Motivo |
| --- | --- | --- |
| Esmaltados / francesa / nail art | frasco, capas, destellos, pincel | Identifican tipo de servicio y técnica |
| Manicura / reconstrucción / relleno | mano, escudo, reposición | Cuidado y mantenimiento |
| Soft Gel / acrílico / press on | gema, regla, capas | Extensión, acabado y longitud |
| Pedicura | huellas, flor | Cuidado de pies y tratamiento spa |
| Promociones | regalo | Combo y oferta |
| Retiros | gota, tijeras | Retiro y herramienta |
| Pestañas y cejas | ojo, pincel, hoja | Mirada, laminado y cuidado |
| Extras | corazón, hoja | Bienestar e hidratación |

## Medidas aplicadas
| Lugar | Contenedor | Ícono vectorial |
| --- | --- | --- |
| Servicio escritorio | 46 × 46 px | 22 × 22 px |
| Servicio móvil | 40 × 40 px | 19 × 19 px |
| Servicio móvil pequeño | 34 × 34 px | 17 × 17 px |
| Filtros escritorio | pill con altura mínima 44 px | 16 × 16 px |
| Filtros móvil | pill con altura mínima 42 px | 15 × 15 px |
| Contacto escritorio | 46 × 46 px | 22 × 22 px |
| Contacto móvil | 42 × 42 px | 20 × 20 px |

## Conservación y límites
- Se mantienen nombres, descripciones, precios, categorías, fotografías, modal, mapa, SEO y WhatsApp.
- Los botones conservan etiquetas accesibles, estados de filtro y control de expansión.
- Los enlaces emplean flechas tipográficas discretas; no se agregan emojis a títulos ni promociones, evitando ruido visual.
- La comprobación automatizada valida los 27 servicios, las siete categorías, los tres iconos de contacto y las reglas de tamaños. Una revisión visual en navegador real sigue siendo necesaria para evaluar la geometría de cada símbolo y posibles diferencias de renderizado.

## Actualización: Luxury Cute Boutique
**Estado:** Implementada en la rama de diseño 2026-10-29. Esta actualización sustituye los fondos monocromáticos planos, sin cambiar el repertorio SVG seguro.

**Dirección estética:** rosa empolvado perlado, champagne/rose-gold y variaciones suaves por categoría; fondo con gradiente doble, reflejo mínimo en cada tile, sombra ligera y contraste suficiente para identificar los pictogramas sin depender del color.

| Categoría | Tono principal | Superficie | Intención |
| --- | --- | --- | --- |
| Manicure y uñas | `#AC4E78` | rosa maquillaje | Dulce y delicado |
| Extensiones | `#A36B59` | champagne | Acabado lujoso |
| Pedicura | `#91649B` | malva suave | Spa floral |
| Promociones | `#93622D` | dorado crema | Destacar sin saturar |
| Retiros | `#A35B7A` | rosa neutro | Cuidado y mantenimiento |
| Pestañas y cejas | `#96516D` | berry | Mirada y precisión |
| Extras | `#93617B` | rosa perlado | Bienestar |

**Escala final:** servicios escritorio 48/20 px (contenedor/vector), móviles 42/18 px, móviles estrechos 34/17 px. Contacto 48/20 px en escritorio y 42/18 px móvil. Filtros 16 px en escritorio y 15 px móvil; superficie táctil de al menos 44 px en escritorio y 42 px en móvil.

**Implementación:** `categoryTheme` asigna exclusivamente clases de una lista cerrada para servicio y filtro. El SVG sigue siendo local y decorativo; nombres, precios, estados accesibles y enlaces conservan su semántica. Las sombras y los gradientes no transmiten información imprescindible. Los gráficos de trabajo real siguen siendo los protagonistas del sitio.
