# Estrategia SEO local — OnePage Burbujas Nails
**Actualización:** 2026-11-01 · **Dominio canónico:** https://burbujasnails.cl/ · **Ubicación de referencia:** Maipú 1020, oficina 4, Concepción (confirmar con la administración).

## Arquitectura OnePage
- Una sola página comercial: `/`, con anclas `/#servicios`, `/#reserva`, `/#galeria` y `/#visitanos`.
- La portada incluye 27 servicios y 26 precios numéricos más una cotización «Consultar» en datos estructurados `NailSalon.hasOfferCatalog`; el catálogo sin JavaScript se conserva mediante `noscript` sin duplicarlo visualmente.
- `/privacidad.html` es una política legal complementaria; `/gestion.html` es un panel técnico no indexable, no una landing.
- `/servicios.html` y `/cejas-concepcion.html` se retiran del repositorio y sitemap por solicitud del propietario.

## Acciones externas por realizar
1. En Google Search Console, registrar la URL canónica raíz y enviar sitemap; verificar la indexación del dominio.
2. Configurar con el gestor del dominio/CDN redirecciones HTTP 301 de `/servicios.html` y `/cejas-concepcion.html` a `/#servicios` (o `/` si el CDN no conserva fragmentos). GitHub Pages no ofrece aquí un mecanismo propio para 301; hasta configurar esas reglas las URL antiguas devolverán 404, con recuperación de navegación.
3. Validar Perfil de Empresa de Google y detalles de negocio reales, sin duplicaciones.
4. Cuando el catálogo de Supabase se active, sincronizar `data.js`, HTML de respaldo y los datos estructurados mediante revisión y despliegue; el cambio en DOM no basta para buscadores.

## Privacidad, negocio y métricas
No inventar reseñas, horarios, pagos, autorizaciones ni precios. Proteger los datos que se compartan por WhatsApp. No insertar analítica sin evaluación de privacidad. Los resultados Lighthouse puntuales no prueban Core Web Vitals de campo.

## Integración de contenido de páginas retiradas
Las descripciones de las siete categorías aparecen al filtrar el catálogo y como texto de respaldo sin JavaScript. Cinco preguntas informativas sobre técnicas, diseño de cejas, variaciones de precio y confirmación de cita están integradas cerca de la reserva, no en una landing independiente. La galería existente ya presenta los diez trabajos reales, sin crear una segunda galería. Los datos estructurados y el catálogo comercial siguen siendo únicos en la portada.
