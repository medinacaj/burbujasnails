import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
// Probar el SQL previsto para precios. El esquema histórico no forma parte del panel actual.
const sql=readFileSync(new URL('../supabase/bn_prices_schema.sql',import.meta.url),'utf8');
for(const table of ['bn_admin_users','bn_services','bn_price_history']){
  assert(new RegExp('alter\\s+table\\s+public\\.'+table+'\\s+enable\\s+row\\s+level\\s+security','i').test(sql),
    'RLS debe habilitarse para '+table);
}
assert(sql.includes('grant update (price_clp,duration,description) on public.bn_services to authenticated'),
  'Solo deben poder editarse los campos autorizados');
assert(!/grant (insert|delete) on public\.bn_services to authenticated/i.test(sql),
  'No habilitar mutaciones innecesarias');
assert(sql.includes('create policy bn_services_admin_update'),'Falta política de edición para administradores');
assert(sql.includes('create policy bn_price_history_admin_read'),'Historial restringido a administradores');
assert(sql.includes('create trigger bn_services_changes'),'Falta trigger de auditoría');
assert(sql.includes('revoke all on public.bn_admin_users from anon,authenticated'),'Listado de administradores no público');
assert(!/\bservice_role\b\s*=/.test(sql),'No publicar credenciales del servidor');
console.log('Contrato de esquema de precios activo: RLS, permisos mínimos e historial declarados (sin conexión a backend).');
