# Burbujas Nails · sitio público
Sitio estático de información de servicios, galería y contacto en Concepción (Chile).

## Seguridad / administración
**Desde el 18-10-2026 la administración web antigua está deshabilitada.**
La aplicación anterior incluía autenticación controlada únicamente por JavaScript público. Esa protección no era segura. `admin.html` ahora es una página informativa, y `admin.js` no ejecuta ninguna autenticación ni edición.

Los servicios visibles proceden exclusivamente de `data.js` versionado. Los cambios deben revisarse mediante una rama y un pull request de GitHub, que es el control de acceso actualmente disponible. El sitio publicado no edita información persistente.

**No reutilizar la contraseña antigua:** el secreto original estuvo expuesto públicamente y puede permanecer en el historial de Git y en cachés. Rotar cualquier credencial de otros servicios donde se haya reutilizado. No utilizar la contraseña antigua para un panel futuro.

Para restaurar un panel:
1. Elegir backend autenticado con sesiones autorizadas y control de permisos en servidor (por ejemplo autenticación gestionada + RLS).
2. Guardar datos en almacenamiento central, con validación, backups, logs y pruebas de autorización.
3. Configurar secretos exclusivamente en el servidor y realizar revisión de seguridad antes de exponer una ruta administrativa.
4. No implementar `ADMIN_PASS`, hash estático o tokens incrustados en JavaScript público.

## Publicación
El catálogo público está en `data.js`. Para actualizar precios o servicios: editar el archivo, abrir PR, revisar vista previa y fusionar. `build.sh` genera la distribución sin incluir el panel JavaScript anterior.

## Controles
`node tests/security.mjs` revisa que el panel inseguro no reaparezca y que el catálogo deje de depender de localStorage. También se ejecuta en GitHub Actions.
