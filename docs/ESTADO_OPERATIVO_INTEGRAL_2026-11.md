# Estado operativo integral — Burbujas Nails (1 noviembre 2026)

## Alcance y evidencias
- Proyecto: `medinacaj/burbujasnails`, GitHub Pages; catálogo original estático de 27 servicios, 10 fotografías WebP, dirección Maipú 1020, oficina 4, Concepción.
- Los controles `tests/site-integrity.mjs` y `tests/browser-smoke.mjs` se ejecutan en PR y `master`. La auditoría automática de accesibilidad comprueba errores de impacto grave/crítico WCAG 2.2 AA en páginas públicas; **no certifica conformidad WCAG**.
- Se ha reforzado el contraste de textos, etiquetas accesibles y el aviso de privacidad sin alterar precios, servicios, fotografías, ubicación ni cuentas externas.
- Se configuró `tests/production-health.mjs` mediante `.github/workflows/availability.yml` para comprobar producción diariamente y tras cada fusión. Su ejecución efectiva solo se da por verificada con el resultado de GitHub Actions.

## Pendientes que requieren acceso a cuentas o aprobación comercial

| Acción | Responsable / ubicación | Aceptación requerida |
|---|---|---|
| Proteger `master` | GitHub → Settings → Branches/Rulesets | PR obligatorio, CI `static-security` y `browser-smoke` obligatorios, bloquear `force push`/borrados; mantener un proceso de recuperación autorizado |
| Autenticación de gestión de precios | Supabase proyecto **nuevo exclusivo** | Alta de proyecto con costo validado, usuario Auth autorizado, OTP, migración de `bn_prices_schema.sql`, políticas RLS probadas con usuarios anon/no admin/admin, respaldo y recuperación |
| Activar protección CDN | Cloudflare → DNS/Security/SSL | Comprobar primero que proxy no interfiera con GitHub Pages, certificados, MX/TXT y redirecciones; probar SSL/TLS; habilitar WAF/limitación según tráfico real, sin forzar HSTS ni CSP HTTP sin prueba |
| Search Console | Google Search Console + DNS | Validar TXT real de la propiedad, enviar sitemap y comprobar indexación sin inventar token ni acceso |
| Perfil de Empresa | Google Business Profile | Reclamación/verificación legítima de la ficha, horarios reales, fotografías y NAP; no duplicar la ficha |
| Medición digital | Google Analytics / Search Console | Decidir si se necesita medición; inventariar cookies, IP y bases legales antes de activar etiquetas |
| Conformidad comercial y privacidad | Responsable del negocio | Validar nombre/RUT legal aplicable, condiciones de pago/reserva/cancelación, retención de mensajes y autorizaciones fotográficas |
| Credenciales históricas | Propietario de cuentas | Rotar credenciales antiguas reutilizadas y activar MFA; sin exponer secretos en Issues públicos |

## Comprobación tras fusión
1. CI verde en el SHA fusionado, **no solo en la rama del PR**.
2. GitHub Pages finaliza correctamente en el mismo SHA.
3. Comprobar con navegador real `https://burbujasnails.cl` y `https://www.burbujasnails.cl` (TLS, redirecciones, DNS, HTML).
4. Medir PageSpeed Insights móvil/escritorio y distinguir datos de campo (CrUX p75) de laboratorio. No establecer LCP/INP/CLS reales sin mediciones.
5. Para restaurar: revertir PR o volver al commit estable previo mediante un PR controlado, comprobando integridad y despliegue.

## Límites de seguridad
- GitHub Pages no permite configurar por estos archivos las cabeceras HTTP `frame-ancestors`/HSTS. La meta-CSP no las sustituye; revisarlas en la infraestructura compatible tras autorización.
- Ninguna medida evita al 100% la copia de recursos públicos.
- No instalar scripts de rastreo, popups de cookies o servicios de pago sin necesidades verificadas.

## Arquitectura OnePage — decisión 2026-11-01
Se retiran las páginas promocionales `/servicios.html` y `/cejas-concepcion.html` y se concentra catálogo y precios en `/#servicios`. Enlaces, sitemap, pruebas y empaquetado se ajustan. Quedan pendientes redirecciones HTTP 301 desde Cloudflare u otro proveedor con permisos y verificación de indexación; GitHub Pages no las proporciona por sí mismo. El panel Supabase sigue desconectado.

## Verificaciones externas que no se sustituyen con código
- Protección de master (issue #29): la conexión de GitHub disponible permite ramas/PR pero no mutar reglas. El propietario debe exigir PR y checks exactos `static-security` y `UI real Chromium / Firefox / WebKit`, bloquear force push y eliminación y probar la regla con una vía de recuperación. Comprobar `protected: true` y las reglas efectivas antes de cerrar.
- Rutas antiguas (issue #33): aplicar en el proveedor HTTP autorizado 301 para `/servicios.html` y `/cejas-concepcion.html` hacia `https://burbujasnails.cl/#servicios` (o `/` si no admite fragmentos), también desde www. Verificar código y Location sin JavaScript; no crear nuevas páginas comerciales ni modificar DNS como sustituto. No hay acceso a Cloudflare en esta conexión.
- Horarios: se enlaza la ficha Google Maps existente identificada en el sitio. La herramienta de consulta no permitió leer esa ficha; no se copiaron horarios ni políticas de abono/cancelación desde resultados de otros negocios.
- Panel: el propietario eligió mantenerlo deshabilitado. La eventual activación es una tarea posterior con pruebas reales y sincronización de precios indexables.
