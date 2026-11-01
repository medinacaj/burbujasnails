# Esquemas de Supabase — Burbujas Nails

**Estado:** los archivos son preparación documental; no prueban que exista una base desplegada.

## Único camino previsto para el panel de precios

1. Crear un proyecto nuevo, dedicado y autorizado; confirmar previamente cualquier costo.
2. Revisar `bn_prices_schema.sql` y luego aplicar `bn_prices_seed.sql` en ese proyecto.
3. Configurar OTP por correo y un usuario administrador autorizado; probar consultas anónimas y denegaciones de edición.
4. Verificar auditoría de cambios, respaldo, restauración y los 27 servicios originales.
5. Solo después conectar URL y clave pública en `bn-config.js`. Nunca exponer `service_role` ni contraseñas.

**NO ejecutar `schema.sql` en el proyecto de precios.** Es un diseño anterior con una tabla `bn_services` de estructura diferente (usa `price` tipo texto, mientras el panel nuevo usa `price_clp` tipo entero). Su combinación no es una migración válida.

Consultar también `docs/GESTION_PRECIOS_SUPABASE.md`.
