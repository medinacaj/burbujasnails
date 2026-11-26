# Instrucción para una nueva sesión — Burbujas Nails

Copia el bloque siguiente a un chat nuevo.

```text
Continúa el producto Burbujas Nails, del propietario medinacaj (AJ-Med!n@), exclusivamente en https://github.com/medinacaj/burbujasnails. No cambies de producto ni reconstruyas lo existente.

Rama principal real: master. Rama de respaldo/continuidad: backup/continuidad-20261126. Versión: sin release semántica confirmada; base de código 13ad2e8bcd1185370324c2bdad5a4e370a50f34e, con PR #37 fusionado. El respaldo documental se preparó el 26-11-2026; consulta su SHA remoto vigente antes de trabajar.

Lee primero docs/MEMORIA_OPERATIVA.md y docs/DECISIONES.md en la rama de continuidad; después AGENTS.md, README.md, CHANGELOG.md, docs/agent-workflow.md y docs/ASESOR_LEGAL_TECNOLOGICO.md. Contrasta ramas, SHA, diff, issues, PR, revisiones y CI con GitHub actual. El respaldo puede haber quedado superado.

Propósito: sitio público OnePage de servicios, precios, galería y consultas por WhatsApp en Concepción, Chile. Arquitectura: HTML/CSS/JavaScript estáticos, data.js, index.html y JSON-LD, galería WebP; Pages publica master. Dominio burbujasnails.cl y variante www. Cloudflare figura como proveedor DNS en documentación, configuración actual no verificada. Google Fonts/Maps, WhatsApp y enlace externo Mercado Pago. No hay staging dedicado confirmado. No trasladar reglas de PaseListo, MediOS u otros productos.

[CONFIRMADO][NO MODIFICAR sin instrucción posterior] Conservar OnePage, marca, fotos y decisiones propias; no reintroducir servicios.html ni cejas-concepcion.html. El propietario eligió mantener Supabase deshabilitado: bn-config.js conserva URL y clave públicas vacías. No crear/reutilizar proyectos, activar Auth ni ejecutar migraciones reales. Admin antiguo deshabilitado; nunca restaurar contraseña pública. No publicar secretos, datos personales ni credenciales históricas. No desplegar ni cambiar DNS/CDN como parte de un respaldo. No force push ni sobrescribir trabajo remoto.

Avance integrado en master: PR #37 reconcilió precios (incluidos 15 valores sin JS), JSON-LD/CSP y avisos de estado del catálogo. No recuperar tarifas de ramas antiguas como fuente actual.
Avance implementado y respaldado pero NO fusionado: PR #35, rama fix/auditoria-ui-ci-20261101, SHA cf7b0f430d7d10dd50b668e1afc33296c985aa9e. Contiene integración de PR #28/30/31, filtros visibles/limpieza/lectura móvil, consulta WhatsApp con fecha y enlace de recuperación, botón flotante sin tapar formulario, catálogo remoto parcial/vacío validado, sesiones, Actions Node24, escaneo textual, lockfile, pruebas RLS temporales y Lighthouse ligado a identidad del despliegue. Sus tres checks históricos están aprobados, pero eso NO valida integración con master posterior.
PR #38, rama docs/readme-continuidad-20261121, SHA 358a5e3e717fe16c0a590d8bc45d9344798936d1: README documental; su contenido se conserva en este respaldo, PR abierto al comprobarlo.

Próxima acción concreta: comparar PR #35 con master actual, especialmente app.js, catalogo-live.js, index.html, data.js, styles.css, tests/catalog-live-status.mjs, tests/browser-smoke.mjs y workflows. Reconciliar sus mejoras preservando los precios y avisos posteriores de PR #37. Trabajar en rama nueva, no fusionar automáticamente PR #35 antiguo. Coordinar documentación con PR #38 y el PR de respaldo. Revisar issues34/36 antes de ampliar alcance.

Prioridades: P0 ninguno nuevo confirmado, revisar rotación histórica sin revelar secretos; P1 protección de master (issue #29, protected:false observado) y auditoría issue #36; P2 reconciliación PR #35/34, redirecciones301 reales issue #33 y continuidad documental PR #38; P3 medición de campo y optimizaciones sustentadas en evidencia. Issue2 permanece abierto por administración aplazada expresamente. No cerrar pendientes por documentación sola.

Pruebas: en master ejecutar los comandos de .github/workflows/security.yml, node --test tests/catalog-live-status.mjs, node scripts/sync-assets.mjs --check y bash build.sh; navegador requiere Playwright1.64.1 y axe4.14.0. master no tiene package.json/lockfile; npm test pertenece a PR #35, no asumirlo disponible antes de reconciliar. En PR #35 hubo 21 controles locales y navegador, con CI estática, Chromium/Firefox/WebKit y PostgreSQL/RLS aprobada. RLS temporal y backend simulado no prueban Supabase real. En el respaldo del 26-11 el ejecutor falló al arrancar: no se pudieron revisar archivos locales ni repetir pruebas allí; usar CI remota y registrar limitaciones.

Separar siempre código implementado, rama publicada, fusión, staging y producción. Se consultó CI de Pages/disponibilidad exitosa de master, pero no se comprobó directamente la versión HTML servida hoy; producción no está certificada por este respaldo. Verificar con HTTP/navegador y versión desplegada antes de afirmar funcionamiento. No ejecutar resets/semillas destructivas ni desplegar infraestructura. Preservar cualquier trabajo local no publicado que aparezca al recuperar el entorno.
```
