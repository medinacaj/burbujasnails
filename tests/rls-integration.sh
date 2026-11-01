#!/usr/bin/env bash
# Solo se permite ejecución con PostgreSQL temporal local de CI.
set -euo pipefail
: "$PGHOST" "$PGPORT" "$PGDATABASE"
if [[ "$PGHOST" != "127.0.0.1" && "$PGHOST" != "localhost" ]] || [[ "$PGDATABASE" != "bn_rls_test" ]]; then
 echo "ERROR: no ejecutar contra servidores reales ni bases fuera de bn_rls_test" >&2
 exit 2
fi
query(){ psql -X -qAt -v ON_ERROR_STOP=1 -c "$1"; }
eq(){
 if [[ "$1" != "$2" ]]; then
   echo "FALLO RLS: $3 (esperado '$1', observado '$2')" >&2
   exit 1
 fi
 echo "OK RLS: $3"
}
must_deny(){
 if query "$1" >/dev/null 2>&1; then
   echo "FALLO RLS: acceso indebidamente permitido para $2" >&2
   exit 1
 fi
 echo "OK RLS: acceso denegado a $2"
}
admin='00000000-0000-4000-8000-000000000001'
ordinary='00000000-0000-4000-8000-000000000002'
psql -X -q -v ON_ERROR_STOP=1 -f tests/rls-ci-bootstrap.sql
psql -X -q -v ON_ERROR_STOP=1 -f supabase/bn_prices_schema.sql
psql -X -q -v ON_ERROR_STOP=1 -f supabase/bn_prices_seed.sql

eq '3' "$(query "select count(*) from pg_class where oid in ('public.bn_admin_users'::regclass,'public.bn_services'::regclass,'public.bn_price_history'::regclass) and relrowsecurity;")" 'RLS activa en las tres tablas'
eq '27' "$(query "set role anon; select count(*) from public.bn_services;")" '27 servicios anon visibles'
must_deny "set role anon; select * from public.bn_admin_users;" 'lectura anónima de administradores'
must_deny "set role anon; select * from public.bn_price_history;" 'historial para visitantes'
must_deny "set role anon; update public.bn_services set price_clp=1 where id='s01';" 'edición de precios anónima'
eq '0' "$(query "set role authenticated; set request.jwt.claim.sub='$ordinary'; select count(*) from public.bn_admin_users;")" 'usuario sin rol no ve administradores'
eq '' "$(query "set role authenticated; set request.jwt.claim.sub='$ordinary'; update public.bn_services set price_clp=1 where id='s01' returning id;")" 'usuario no administrador no edita'
must_deny "set role authenticated; set request.jwt.claim.sub='$ordinary'; insert into public.bn_admin_users(user_id) values ('$ordinary');" 'autoasignación de rol'

query "insert into public.bn_admin_users(user_id) values ('$admin');" >/dev/null
eq '1' "$(query "set role authenticated; set request.jwt.claim.sub='$admin'; select count(*) from public.bn_admin_users;")" 'admin solo ve su propio registro'
eq '10500' "$(query "set role authenticated; set request.jwt.claim.sub='$admin'; update public.bn_services set price_clp=10500 where id='s01' returning price_clp;")" 'admin actualiza precio'
eq '10000|10500' "$(query "set role authenticated; set request.jwt.claim.sub='$admin'; select old_price_clp||'|'||new_price_clp from public.bn_price_history where service_id='s01';")" 'historial del precio con trigger'
eq "$admin" "$(query "set role authenticated; set request.jwt.claim.sub='$admin'; select changed_by from public.bn_price_history where service_id='s01';")" 'actor registrado en auditoría'
eq '0' "$(query "set role authenticated; set request.jwt.claim.sub='$ordinary'; select count(*) from public.bn_price_history;")" 'historial oculto a no administrador'
must_deny "set role authenticated; set request.jwt.claim.sub='$admin'; update public.bn_services set name='INTRUSION' where id='s01';" 'cambio de nombre incluso para admin'

query "update public.bn_services set is_active=false where id='s27';" >/dev/null
eq '26' "$(query "set role anon; select count(*) from public.bn_services;")" 'anon solo ve servicios activos'
eq '26' "$(query "set role authenticated; set request.jwt.claim.sub='$ordinary'; select count(*) from public.bn_services;")" 'no admin solo ve activos'
eq '27' "$(query "set role authenticated; set request.jwt.claim.sub='$admin'; select count(*) from public.bn_services;")" 'admin también puede ver inactivos'
eq 'f' "$(query "select has_schema_privilege('authenticated','private','USAGE');")" 'esquema interno no expuesto'
eq 'f' "$(query "select has_column_privilege('authenticated','public.bn_services','name','UPDATE');")" 'GRANT de nombre no autorizado'
echo 'Integración RLS PostgreSQL temporal: controles de autorización completados.'
