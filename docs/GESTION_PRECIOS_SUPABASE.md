# Burbujas Nails · Gestión segura de precios

**Estado:** frontend preparado para GitHub Pages; Supabase todavía no conectado. Mientras la configuración esté vacía, el panel muestra las instrucciones de conexión y no permite editar los precios.

**URL prevista:** https://burbujasnails.cl/gestion.html

## Funciones disponibles al conectar una base dedicada
- Inicio de sesión por código temporal recibido por correo (Supabase Auth).
- Edición de 27 precios CLP, duraciones y descripciones, con permiso para «Consultar».
- Auditoría automática del historial de cambios de precio en Postgres.
- Políticas RLS: edición exclusivamente a usuarios autorizados en bn_admin_users.
- Catálogo de la web con respaldo estático si falla la lectura remota.
- Diseño y mapa interactivo original preservados.

## Activación (requiere autorización del propietario)
1. Crear un proyecto Supabase exclusivo de Burbujas Nails en la organización seleccionada, informando y confirmando antes cualquier coste.
2. Ejecutar los archivos de preparación supabase/bn_prices_schema.sql y supabase/bn_prices_seed.sql. No ejecutarlos en proyectos compartidos.
3. Verificar 27 registros y sus 26 precios numéricos y una cotización «Consultar».
4. Crear un usuario administrador en Supabase Auth, activar código OTP por correo e insertar su UUID real en bn_admin_users desde SQL Editor autorizado.
5. Comprobar en la base que anon puede leer solo servicios activos; authenticated sin permisos administrativos no puede editar; el administrador sí; el historial no es público.
6. Completar bn-config.js con URL Supabase y clave publica (sb_publishable_...). Nunca insertar claves secretas, service_role, contraseñas ni tokens de usuario.
7. Probar lectura de catálogo, cambios de precios, historial y acceso a la web pública desde móvil y computador.

## Alcance y advertencias
- No se ha creado todavía un proyecto Supabase ni un usuario administrador; los precios permanecen inalterados.
- Los datos estructurados HTML iniciales de precios son estáticos y quedan versionados en GitHub; los cambios visibles en el navegador se actualizan desde Supabase. Para sincronización SEO permanente se necesitará un proceso adicional de generación HTML.
- La URL de login puede ser pública pero la autorización la controla Supabase RLS. La página antigua admin.html sigue deshabilitada.
- GitHub Pages publica frontend estático: no es un servidor de autenticación ni almacena contraseñas.

## Pruebas
node tests/gestion-precios.mjs
node --check gestion.js
node --check catalogo-live.js
bash build.sh
