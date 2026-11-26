# Burbujas Nails · sitio público
Sitio estático de información de servicios, galería y contacto en Concepción (Chile).

## Seguridad / administración
**Desde el 18-10-2026 la administración web antigua está deshabilitada.**
La aplicación anterior incluía autenticación controlada únicamente por JavaScript público. Esa protección no era segura. `admin.html` ahora es una página informativa, y `admin.js` no ejecuta ninguna autenticación ni edición.

Los servicios visibles proceden de `data.js` versionado. Existe un panel nuevo (`gestion.html`) preparado para Supabase, pero su configuración pública está vacía: no autentica ni permite editar precios hasta validar una base exclusiva, Auth y RLS. Mientras tanto, las actualizaciones requieren una rama y un pull request de GitHub.

**No reutilizar la contraseña antigua:** el secreto original estuvo expuesto públicamente y puede permanecer en el historial de Git y en cachés. Rotar cualquier credencial de otros servicios donde se haya reutilizado. No utilizar la contraseña antigua para un panel futuro.

Para restaurar un panel:
1. Elegir backend autenticado con sesiones autorizadas y control de permisos en servidor (por ejemplo autenticación gestionada + RLS).
2. Guardar datos en almacenamiento central, con validación, backups, logs y pruebas de autorización.
3. Configurar secretos exclusivamente en el servidor y realizar revisión de seguridad antes de exponer una ruta administrativa.
4. No implementar `ADMIN_PASS`, hash estático o tokens incrustados en JavaScript público.

## Publicación
El catálogo público está en `data.js`. Para actualizar precios o servicios: editar el archivo, ejecutar `node scripts/sync-assets.mjs --write`, abrir PR, revisar vista previa y fusionar después de CI. `bash build.sh` comprueba que las versiones CSS/JS corresponden al contenido y crea un ZIP sin modificar los originales. GitHub Pages publica los archivos del repositorio, no el ZIP; la coherencia de las versiones se verifica en CI. El panel antiguo `admin.js` sigue excluido.

## Desarrollo y verificación
`npm ci --ignore-scripts` instala solo herramientas de prueba fijadas en `package-lock.json`; no se envían dependencias npm al navegador. `npm test` ejecuta el conjunto estático y las pruebas de catálogo/identidad de despliegue. `npm run test:browser` ejecuta Chromium, Firefox y WebKit después de `npx playwright install --with-deps chromium firefox webkit`.

Lighthouse se dispara después de una publicación de Pages exitosa o manualmente. El checkout corresponde al SHA publicado y `scripts/verify-deployment.mjs` comprueba los bytes de HTML y recursos antes y después de medir, usando la misma URL de auditoría y las versiones `?v=` del navegador. Una publicación todavía no propagada se reintenta con límite; una discrepancia falla y no se presenta como medición válida de ese SHA. Los resultados siguen siendo de laboratorio, sin garantía de INP ni de Core Web Vitals reales.

## Controles
`node tests/security.mjs` comprueba que la administración antigua no regrese. `node scripts/sync-assets.mjs --check` impide publicar URLs con versiones obsoletas de los recursos. Ambas verificaciones se ejecutan en GitHub Actions. `node tests/site-integrity.mjs` revisa rutas y fragmentos internos, canonical, datos estructurados y consistencia del catálogo. En CI se ejecuta Playwright con axe-core sobre las páginas públicas para detectar fallos graves o críticos WCAG automatizables; no sustituye validación manual.

## Controles adicionales (2026-10-29)

- **Frontend:** política CSP por metaetiqueta con hash para los datos estructurados, comprobada en CI; restricciones de origen para la galería y valores escapados al componer HTML. La CSP por metaetiqueta no sustituye cabeceras HTTP de servidor (`frame-ancestors`, HSTS), que deben configurarse en una infraestructura compatible.
- **Datos:** aviso de privacidad en `privacidad.html`. Las reseñas previamente incluidas se retiraron hasta comprobar su autenticidad y consentimiento. Los precios del catálogo deben validarse con el negocio.
- **Repositorio:** `.gitignore` ampliado y pruebas de nombres de archivos sensibles versionados (no sustituyen revisión de secretos dentro de archivos e historial). `SECURITY.md` explica reporte responsable.
- **Operación:** `docs/OPERACION_ITIL_SOC.md` define incidentes, cambios, activos y continuidad. `.github/workflows/availability.yml` configura un chequeo diario del dominio principal por HTTPS y también tras push a `master`, con alertas limitadas a notificaciones de GitHub Actions; **no equivale a monitoreo 24/7 ni a un SOC**. `docs/ESTADO_OPERATIVO_INTEGRAL_2026-11.md` documenta las tareas que requieren acceso externo.
- **Normativa:** `docs/CUMPLIMIENTO_CHILE.md` es una matriz de obligaciones y pendientes a revisar por propietario/profesional legal.
- **Pruebas:** ejecutar `node tests/security.mjs`, `node tests/rls-contract.mjs`, `node tests/layout-contract.mjs`, `node tests/gitignore-security.mjs`, `node tests/no-tracked-secrets.mjs`, `node tests/public-hardening.mjs`. Se ejecutan en Actions.

## Riesgos y tareas pendientes de propietario
1. Verificar el aspecto visual real en móvil/escritorio; comprobar ambos dominios y HTTPS.
2. Revisar y habilitar protección de rama principal, MFA, restricciones de acceso y alertas de seguridad en GitHub y proveedores.
3. Antes de activar WAF de Cloudflare, considerar que la configuración DNS only no ofrece filtrado HTTP de Cloudflare.
4. Auditar credenciales y su historial, activar alertas y monitoreo; definir contactos de incidente y respaldo/recuperación.
5. Validar datos legales del prestador, condiciones de reserva/pago, precios, imágenes y conservación de datos.
6. Mantener el panel Supabase deshabilitado hasta aprobar implementación y pruebas de autorización reales.

**Límite:** en una web pública el navegador recibe HTML, CSS y JavaScript; esos recursos pueden inspeccionarse/copiarse. Un repositorio público se puede clonar. No afirmar invulnerabilidad ni imposibilidad de copia.
