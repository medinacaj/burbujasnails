import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const sql=readFileSync('supabase/schema.sql','utf8');
for (const table of ['bn_services','bn_gallery','bn_admin_users']) {
 assert(new RegExp('alter\\s+table\\s+public\\.'+table+'\\s+enable\\s+row\\s+level\\s+security','i').test(sql),'RLS no habilitada para '+table);
}
for (const table of ['bn_services','bn_gallery']) {
 for(const action of ['insert','update','delete']){
   assert(new RegExp('create\\s+policy\\s+"'+table.replace('bn_','bn_')+'_admin_'+action+'"','i').test(sql),'Falta política de admin: '+table+'/'+action);
 }
}
assert(!/\bservice_role\b\s*=/.test(sql));
assert(/revoke all on public\.bn_admin_users from anon, authenticated/.test(sql));
console.log('Políticas SQL requeridas presentes; validación estática, no prueba de autorización real.');
