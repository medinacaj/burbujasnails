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
