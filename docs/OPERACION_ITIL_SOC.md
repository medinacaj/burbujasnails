# Operación, seguridad y gestión de servicios — Burbujas Nails
**Versión:** 2026-10-29. **Estado:** guía operativa; no constituye certificación ISO, ITIL, SOC ni auditoría externa.

## Inventario de servicio
| Componente | Función | Control y límite |
| --- | --- | --- |
| NIC Chile | Registro del dominio | Renovación, titularidad y servidores DNS por confirmar periódicamente |
| Cloudflare | DNS autoritativo | Registros A + CNAME; DNS only en la configuración conocida; WAF/proxy no declarado activo |
| GitHub Pages | Entrega de HTML/CSS/JS | HTTPS, dominio, estado de builds; exposición inherente de código cliente |
| GitHub | Control de cambios | Ramas/PR, validaciones CI, MFA y protección de `master` pendientes de verificación |
| WhatsApp / Mercado Pago | Contacto/pago | Servicios externos, sus políticas y datos fuera de la web |
| Supabase (SQL preparado) | Futuro catálogo/panel | NO desplegado ni autorizado para uso real; issue #2 |

## ITIL 4 adaptado a un sitio pequeño
- **Evento:** señal de caída, error de compilación, DNS, certificado o enlace de pago. Registrar fecha UTC, fuente y evidencia.
- **Incidente:** degradación real para clientas. Priorizar P0 (exposición de datos/credenciales, secuestro del dominio), P1 (sitio o reservas caídos), P2 (contenido/precios erróneos), P3 (estética). No cerrar sin validación.
- **Solicitud:** cambios de texto, horario o catálogo. Requerir autorización del responsable de negocio y revisión del precio.
- **Problema:** causa raíz de incidentes recurrentes; documentar hipótesis, análisis, mitigación y prevención.
- **Cambio:** Issue → rama → PR → pruebas automáticas → revisión de riesgo → fusión → verificación de sitio → plan de reversión a commit anterior.
- **Continuidad:** mantener copia de configuración DNS y registro de configuración, probar restauración de sitio y renovar dominio oportunamente.

## SOC / monitoreo proporcional
No existe SOC 24/7 ni monitoreo permanente confirmado. Para una operación básica:
1. Habilitar notificaciones de fallas de GitHub Actions, alertas de la cuenta de GitHub y del registrador.
2. Activar 2FA/MFA en GitHub, Cloudflare, NIC Chile y proveedores de pago; inventariar acceso y retirar cuentas obsoletas.
3. Considerar monitor externo HTTPS para portada y `www` (no configurado aquí).
4. Si se activa Cloudflare Proxy/WAF, definir reglas adecuadas, probar TLS extremo a extremo y revisar falsos positivos; **DNS only no proporciona WAF HTTP de Cloudflare**.
5. Revisar registros de despliegue y cambios ante eventos; evitar almacenar datos personales o secretos en Issues públicos.
6. Revisar trimestralmente amenazas, respaldos, URLs externas y el inventario de dependencias. No afirmar "cero vulnerabilidades".

## Checklist de despliegue
- [ ] MFA, mínimo privilegio y permisos de repositorio revisados por propietario
- [ ] CI completa en SHA que se va a fusionar
- [ ] `burbujasnails.cl` y `www` responden con HTTPS y certificado correcto
- [ ] Galería solo con fotografías autorizadas y archivos optimizados
- [ ] Tarifas, enlaces de pago y WhatsApp verificados por responsable comercial
- [ ] Reseñas verificadas antes de su publicación
- [ ] Avisos de privacidad y datos del prestador completados y aprobados
- [ ] Plan de retorno al commit anterior identificado y probado

## Límites y riesgos abiertos
Un sitio público entrega HTML/CSS/JS a cada visitante y un repositorio público puede clonarse. No es técnicamente posible impedir su copia absoluta. La protección jurídica de marcas y obras y los controles de acceso a código servidor son cuestiones distintas.
