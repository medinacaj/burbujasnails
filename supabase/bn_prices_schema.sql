-- PREPARADO, NO EJECUTADO. Solo en un proyecto Supabase exclusivo de Burbujas Nails.
-- Antes de activar: crear el usuario administrador en Supabase Auth y revisar facturación.
begin;
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
create table if not exists public.bn_admin_users(
 user_id uuid primary key references auth.users(id) on delete cascade,
 created_at timestamptz not null default now()
);
create table if not exists public.bn_services(
 id text primary key check(id ~ '^s[0-9]{2,4}$'),
 name text not null check(length(trim(name)) between 2 and 150),
 category text not null check(length(trim(category)) between 2 and 100),
 price_clp integer check(price_clp between 0 and 2000000),
 duration text not null default '' check(length(duration)<=60),
 description text not null default '' check(length(description)<=1200),
 popular boolean not null default false,
 is_active boolean not null default true,
 display_order integer not null default 0 check(display_order>=0),
 updated_at timestamptz not null default now()
);
create index if not exists bn_services_order on public.bn_services(display_order,id);
create table if not exists public.bn_price_history(
 id bigint generated always as identity primary key,
 service_id text not null,
 service_name text not null,
 old_price_clp integer,
 new_price_clp integer,
 changed_by uuid,
 changed_at timestamptz not null default now()
);
create index if not exists bn_price_history_service on public.bn_price_history(service_id,changed_at desc);
alter table public.bn_admin_users enable row level security;
alter table public.bn_services enable row level security;
alter table public.bn_price_history enable row level security;
revoke all on public.bn_admin_users from anon,authenticated;
revoke all on public.bn_services from anon,authenticated;
revoke all on public.bn_price_history from anon,authenticated;
grant select on public.bn_admin_users to authenticated;
grant select on public.bn_services to anon,authenticated;
grant update (price_clp,duration,description) on public.bn_services to authenticated;
grant select on public.bn_price_history to authenticated;
create policy bn_admin_self_read on public.bn_admin_users
 for select to authenticated using(user_id=(select auth.uid()));
create policy bn_services_public_read on public.bn_services
 for select to anon using(is_active=true);
create policy bn_services_authenticated_read on public.bn_services
 for select to authenticated using(is_active=true or exists(
  select 1 from public.bn_admin_users a where a.user_id=(select auth.uid())
 ));
create policy bn_services_admin_update on public.bn_services
 for update to authenticated
 using(exists(select 1 from public.bn_admin_users a where a.user_id=(select auth.uid())))
 with check(exists(select 1 from public.bn_admin_users a where a.user_id=(select auth.uid())));
create policy bn_price_history_admin_read on public.bn_price_history
 for select to authenticated using(exists(
  select 1 from public.bn_admin_users a where a.user_id=(select auth.uid())
 ));
-- Auditoría de cambios únicamente mediante trigger.
create or replace function private.bn_log_price_changes()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 new.updated_at:=now();
 if new.price_clp is distinct from old.price_clp then
  insert into public.bn_price_history(service_id,service_name,old_price_clp,new_price_clp,changed_by)
  values(old.id,old.name,old.price_clp,new.price_clp,(select auth.uid()));
 end if;
 return new;
end;
$$;
revoke all on function private.bn_log_price_changes() from public,anon,authenticated;
drop trigger if exists bn_services_changes on public.bn_services;
create trigger bn_services_changes before update on public.bn_services
 for each row execute function private.bn_log_price_changes();
commit;
-- Crear un usuario REAL en Auth y asignarlo manualmente, nunca desde el navegador:
-- insert into public.bn_admin_users(user_id) values ('UUID_REAL_DE_AUTH');
-- NO utilizar en un proyecto ajeno ni incluir service_role en GitHub.