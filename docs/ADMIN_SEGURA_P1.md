# Administración central segura: preparación P1

El repositorio contiene un esquema de Supabase (`supabase/schema.sql`) para servicios, galería y administradores. **No se ha aplicado a ninguna base**: el proyecto Supabase accesible en esta cuenta no está identificado como el de Burbujas Nails y se encuentra inactivo.

## Permisos y puesta en marcha
1. Crear o identificar el proyecto Supabase exclusivo del salón, con control de su propietario y copias de seguridad.
2. Revisar y ejecutar el esquema en el editor SQL del proyecto correcto.
3. Crear la cuenta de la administradora con Auth y **deshabilitar nuevos registros públicos**.
4. Autorizar manualmente el UUID de esa cuenta desde el editor SQL en `bn_admin_users`; nunca permitir que usuarios se autoasignen permisos.
5. Importar mediante procedimiento revisado los 27 servicios originales de `data.js`, sin sobrescribir cambios más nuevos ni datos personales.
6. Verificar una consulta sin sesión (lectura pública únicamente), una cuenta de cliente (sin escrituras) y una cuenta administradora (CRUD y recuperación de errores), y guardar capturas anonimizadas de las pruebas.
7. Implementar e integrar después un panel web que use sesiones de Auth y tablas protegidas con RLS; **no rehabilitar** el antiguo `admin.html` como atajo.
8. Mantener el catálogo público versionado en Git hasta que se valide la sincronización de la nueva base en dos dispositivos y un backup/restauración.

## Límites
Las claves `anon`/publishable son públicas y no autorizan escrituras por sí solas. Nunca colocar `service_role` o contraseñas de administrador en JavaScript, HTML o repositorios. Para imágenes se deben validar formatos, tamaño y permisos; el esquema actual almacena únicamente URLs HTTPS, no gestiona archivos ni controles antivirus.

**Estado P1:** infraestructura SQL preparada, plataforma y credenciales no configuradas, panel seguro no operativo. [Issue #2](https://github.com/medinacaj/burbujasnails/issues/2) debe continuar abierto.
