# Memoria operativa — Burbujas Nails

Corte:26-11-2026, America/Santiago. Propietario medinacaj; repositorio público https://github.com/medinacaj/burbujasnails. Sin versión semántica confirmada: identificar por SHA. Base de este respaldo: master `13ad2e8bcd1185370324c2bdad5a4e370a50f34e`, árbol dedb0dbc463485244295a3870f3d4848f0582a6a. Rama de continuidad `backup/continuidad-20261126`. El SHA del propio respaldo se entrega tras publicación, no se autorreferencia aquí.

## Estado y evidencias
- Identidad/destino contrastados directamente con GitHub, descripción, rama, CNAME y archivos. No inferidos del entorno.
- docs/MEMORIA_OPERATIVA.md, docs/DECISIONES.md y CHANGELOG.md no existían en el árbol master consultado; se crean.
- PR #35 abierto/no fusionado, HEAD cf7b0f430d7d10dd50b668e1afc33296c985aa9e; PR #38 abierto, HEAD358a5e3e717fe16c0a590d8bc45d9344798936d1. Sin revisiones enviadas en ambos según API.
- PR #35 conserva avances de esta conversación: UI móvil, catálogo activo, WhatsApp, sesiones, CI Node24/lockfile, escaneo y RLS temporal/Lighthouse. PR #28/30/31 cerrados como sustituidos, commits preservados en35; issue #6 cerrado por controles ya integrados.
- master posterior incorporó PR #37: precios reconciliados, fallback/estado de fuente de precios,15 precios sin JS alineados y CSP corregida. Archivos distintos respecto de la base antigua de35: workflows/security.yml,404.html,app.js,catalogo-live.js,data.js,index.html,privacidad.html,styles.css,tests/catalog-live-status.mjs,tests/public-hardening.mjs.
- El respaldo es documental sobre master actual. La implementación pendiente NO se reaplica ni se fusiona; sigue íntegra en rama35. README incorpora la adición documental de38.
- Reglas, arquitectura e infraestructura: README, docs/DECISIONES.md, docs/ESTADO_OPERATIVO_INTEGRAL_2026-11.md, docs/OPERACION_ITIL_SOC.md; seguridad SECURITY.md y docs/ASESOR_LEGAL_TECNOLOGICO.md.

## Pruebas y límites
Histórico de esta conversación:21 controles estáticos locales, build y Chromium320/375/768/1440 aprobados en árbol de35; revisión independiente sin defectos demostrables. Se comprobaron directamente ahora checks estático, Chromium/Firefox/WebKit y PostgreSQL temporal exitosos del HEAD35. Evidencias: runs41363842245 y41363842260.
master actual: API devuelve static-security, UI real, build/report-build-status/deploy y controles de disponibilidad exitosos. Último run consultado45885636078. Son resultados remotos observados, no pruebas repetidas localmente en este respaldo.
Ejecutor falló al iniciar el 26-11; no fue posible inspeccionar Git/local, archivos sin seguimiento ni commits locales remanentes, ejecutar shell, build/lint ni pruebas nuevas en esa máquina. El último estado local del 01-11 era limpio y su árbol coincidía con cf7b0f4 publicado; no se garantiza inventario local actual. No se descartó trabajo ni se hizo reset.
Pruebas aplicables a repetir: comandos de .github/workflows/security.yml, node --test tests/catalog-live-status.mjs, node scripts/sync-assets.mjs --check, bash build.sh, node tests/browser-smoke.mjs con dependencias exactas de workflow. No existe npm test en master actual; pertenece a35. CI del PR documental se consulta tras publicarlo.
No hay staging dedicado confirmado. No se verificó HTTP ni versión de producción directamente el 26-11; Pages/disponibilidad verdes no certifican versión servida ni WCAG completo. No hubo despliegues, migraciones ni cambios de infraestructura.

## Datos y configuración
Frontend estático público; formulario prepara WhatsApp sin guardar solicitudes en servidor propio. Google Maps/Fonts y Mercado Pago son terceros ya documentados. Fotografías y datos comerciales requieren validación del negocio; no se publican datos privados nuevos.
BN_CATALOG_CONFIG.url y BN_CATALOG_CONFIG.publishableKey vacíos por decisión del propietario; no variables secretas requeridas para servir el sitio. PR #35 usa BN_EXPECTED_SHA en CI (identificador público) y PGHOST/PGPORT/PGUSER/PGPASSWORD/PGDATABASE solo para PostgreSQL desechable con datos sintéticos. No copiar credenciales productivas a navegador ni GitHub.
No se revisó exhaustivamente historial de secretos ni rotación; no se expusieron valores.

## Pendientes y próxima acción
- P0: ningún incidente nuevo confirmado por este respaldo; cualquier exposición activa requiere contención y evidencia privada.
- P1: issue #29 protección de master (API protected:false); issue #36 auditoría multidisciplinaria pendiente; credenciales históricas/identidad legal/consentimientos según documentación, sin afirmar cumplimiento.
- P2: reconciliar PR #35/issue #34 con master preservando PR #37, ejecutar pruebas conjuntas y revisión humana antes de fusión. Archivos prioritarios: app.js,catalogo-live.js,index.html,data.js,styles.css,tests/catalog-live-status.mjs,tests/browser-smoke.mjs,workflows. No reemplazar master por una rama antigua.
- P2: issue #33 redirecciones HTTP301 externas; sin acceso administrativo Cloudflare en la sesión. No sustituir con páginas duplicadas ni DNS.
- P2: coordinar README de38 y este respaldo para evitar duplicados; mantener registro vigente.
- P1 aplazado por propietario: issue #2 administración segura. No activarla hasta instrucción posterior, proyecto dedicado y Auth/RLS/REST/backups/sincronización SEO probados.
- P3: métricas de campo, accesibilidad manual y optimizaciones de conversión sustentadas en evidencia.
Siguiente acción concreta: leer esta memoria y DECISIONES desde continuidad, actualizar fetch/estado remoto y elaborar diff35 contra master vigente. Recuperar entorno y preservar cambios locales antes de reconciliar. No iniciar un producto nuevo.

## Inventario de ramas remotas observado
No se borran ni alteran ramas históricas durante el respaldo. El listado puede cambiar.
- `chore/multi-ai-handoff-2026-10`: `363a9ec176e28651c68f56e062e9c07ae37410da`
- `codex/catalog-price-sync-transparency-20261115`: `2a7fbafae7f36894f16c6bc3bacb287b4b4ff810`
- `design/iconografia-coherente-20261029`: `661f4c472bb79820450a87504e945378cf324c69`
- `design/iconos-ilustrados-color-20261029`: `7fa912bc0c2874e7f1640ec2aba8570cf9c9b9b5`
- `design/luxury-cute-icons-20261029`: `3d4f9ea486ad67469739dde48b6ff3ef43a476de`
- `design/modernizar-burbujasnails-20261029`: `931a0277ce1efd7f48cae69de535d13edea365cc`
- `design/publicar-vista-previa-completa-20261030`: `e5c0b626854aacbba5b8479ade3143b886c82ed9`
- `docs/readme-continuidad-20261121`: `358a5e3e717fe16c0a590d8bc45d9344798936d1`
- `enhance/seo-accesibilidad-conversion-20261030`: `ab18189e9b5456e9f09b4cbd820b5c80f4835456`
- `feat/galeria-seo-mapa-20261029`: `ba84383d5844ca5a13d4d5a4b97785fed155731d`
- `feature/panel-precios-web-20261030`: `15ed724f396ebb2cf5d3dbd4edaed8cb9d192491`
- `fix/ancho-responsive-20261029`: `95f92e597750d28ed78951e8a741f2563fb6eec0`
- `fix/auditoria-integral-estabilidad-20261101`: `cfc164ac68ee7910dba79bb8ea9647b5adf80fb7`
- `fix/auditoria-ui-ci-20261101`: `cf7b0f430d7d10dd50b668e1afc33296c985aa9e`
- `fix/eliminar-halo-portada-20261030`: `f9f9e65a203fcc416d8302f51f9a3f66c12448a9`
- `fix/galeria-miniaturas-modal-20261029`: `f58e705e9ff2b1aed1018fb3b3d2ed910ca80e29`
- `fix/gestion-sesiones-y-pruebas-20261101`: `22d6da29e0b132897c536ac0240e61d01441c97b`
- `fix/hero-discreto-mobile-sin-decoracion-20261029`: `4846537f05bdb566cb8e222ae63794cd1840a17f`
- `fix/mapa-completo-abre-google-maps-20261030`: `8be5804b8c561aa6b7951b77f5418c52facb3ae8`
- `fix/restaurar-layout-publico-20261029`: `2c108031fcf1d6102abd1dd61a39488c35761c56`
- `fix/ux-a11y-crossbrowser-burbujas-20261101`: `18148e9c88c7fe339801035cf2101e117b3ee237`
- `governance/legal-tech-review-20261018`: `aa47a3a58ae8423d89a857b69f9f6145bc495d85`
- `hardening/actions-node24-secrets-20261101`: `7005300033b6105e344fc08aae35f96410bad8bd`
- `hardening/qa-seo-accesibilidad-20261101`: `e38b51695ee78ba5df89152a396b626b3b38f271`
- `hardening/seguridad-operacion-legal-20261029`: `e37f2e6fdbd031653704a4df9a32ed740f6f749f`
- `master`: `13ad2e8bcd1185370324c2bdad5a4e370a50f34e`
- `p1/safe-catalog-backend-foundation-20261018`: `d76c937dfd27caf013c464237150e6408d0c5d4f`
- `perf/lighthouse-baseline-20261101`: `43547c5a2bb23abf6563b6f52730eb2c0575b066`
- `revert/volver-mapa-interactivo-20261030`: `ed0ab1055480d691098dc61df7b7616d80047592`
- `security/disable-insecure-admin-20261018`: `9a88505af68bc6f470751cdb18d85431df5691fe`
- `security/prevent-sensitive-files-20261025`: `fd9a4635063dd484dcb90d6c217c0d48666ba0d5`
- `seo/cejas-unas-concepcion-20261101`: `76fd131aa1f4005f22c1a53da2df5dee185980ae`
- `test/runtime-rls-postgres-20261101`: `5269eb9b8eb204162f3ff4374097dd6fc89d0bc5`
