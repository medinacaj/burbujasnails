# Decisiones de Burbujas Nails

## Confirmadas y restricciones
- [CONFIRMADO] Producto autónomo de medinacaj: https://github.com/medinacaj/burbujasnails; master, GitHub Pages, burbujasnails.cl.
- [CONFIRMADO][NO MODIFICAR] OnePage: servicios y cejas dentro de portada. Páginas comerciales duplicadas descartadas; recuperación JS de rutas antiguas no equivale a HTTP301.
- [CONFIRMADO][NO MODIFICAR] Propietario eligió mantener panel Supabase deshabilitado en esta conversación. La configuración pública sigue vacía al 26-11. Esto sustituye cualquier propuesta anterior de activarlo durante la auditoría.
- [CONFIRMADO] Actualizar mediante ramas/PR, revisión/fusión humana según docs/agent-workflow.md. Este respaldo no autoriza despliegues ni cambios de infraestructura.
- [CONFIRMADO] No restaurar administración con contraseña/hash estático público. No publicar ni reproducir credenciales antiguas; rotación en proveedores no verificada.
- [CONFIRMADO] Mantener marca/fotografías; no inventar condiciones comerciales, horarios, testimonios ni consentimiento. El propietario remitió a Google para horarios; la ficha no pudo leerse mediante la herramienta disponible. PR #35 enlaza la ficha existente, sin inventar valores.
- [CONFIRMADO] Las tarifas vigentes deben seguir master posterior a PR #37; la restricción anterior de no alterar tarifas durante la auditoría no convierte los precios antiguos de PR #35 en fuente actual. No se ha recibido autorización para revertir PR #37.
- [CONFIRMADO] Las pruebas de panel simulado y RLS temporal son evidencia de desarrollo, no autorización productiva real.

## Resolución de divergencias
El 01-11 PR #35 se dejó listo con CI verde; no consta aprobación de fusión en esta conversación y sigue abierto. Al 26-11 master avanzó por PR #37. Se decide respaldar documentación desde master actual y conservar PR #35 como línea separada, evitando una fusión que pise precios o avisos posteriores. No se reconstruyó código ni se declararon reconciliados los conflictos sin pruebas.
El README de PR #38 se incorpora al respaldo sin borrar ni cerrar ese PR. Memoria operativa centraliza el estado; documentos especializados se enlazan, no se sustituyen.

## Alternativas descartadas
Contraseña pública como administración, migración a otro hosting sin necesidad, páginas promocionales duplicadas, reutilizar proyectos Supabase ajenos/inactivos, inventar horarios/abonos y declarar producción por CI verde.
