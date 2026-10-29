# Política de seguridad — Burbujas Nails

## Alcance
Web informativa estática en GitHub Pages, dominio `burbujasnails.cl`, DNS Cloudflare. No hay API privada ni panel administrativo operativo. La protección de infraestructura, redes y datos compartidos depende también de GitHub, NIC Chile, Cloudflare, WhatsApp y Mercado Pago.

## Reportar una vulnerabilidad
No publicar contraseñas, datos personales, pruebas de explotación ni hallazgos sensibles en Issues públicos. Usar **Report a vulnerability** en la pestaña Security de GitHub si la opción de reporte privado está activada. Si no está disponible, solicitar al propietario un canal privado antes de remitir detalles técnicos. No se promete un plazo de respuesta sin un proceso de guardia acordado.

## Responsabilidades
- Propietario: cuentas, MFA, accesos, DNS, pagos, autorización de imágenes y aceptación de riesgos.
- Desarrollo: correcciones mediante ramas, revisión de diffs, pruebas y versiones.
- Proveedores: controles propios según condiciones contractuales; no se asume una cobertura SOC inexistente.

## Reglas mínimas
- No subir claves, tokens, credenciales, `.env`, respaldos ni datos de clientas a Git.
- Mantener el panel antiguo deshabilitado; prohibido autenticar con secretos integrados en JavaScript.
- Rotar la contraseña antigua expuesta y cualquier credencial reutilizada, pues el historial de Git no desaparece al borrar un archivo.
- Antes de publicar: CI verde, revisión de cambios, verificación de HTTPS, DNS y accesibilidad de los servicios.
- Ante sospecha de incidente: contener accesos afectados, preservar logs, documentar cronología UTC y verificar recuperación antes de reabrir.
- No realizar pruebas intrusivas contra servicios de terceros sin autorización.
