-- Burbujas Nails: persistencia y autorización de edición con RLS.
-- Ejecutar solo en el proyecto Supabase de Burbujas Nails, verificado por el propietario.
-- Nunca ejecutar en un proyecto compartido o desconocido.
create table if not exists public.bn_admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table if not exists public.bn_services (
  id text primary key,
  name text not null check (char_length(trim(name)) between 1 and 150),
  category text not null,
  price text not null default '',
  duration text not null default '',
  description text not null default '',
  includes text[] not null default '{}',
  emoji text not null default '',
  popular boolean not null default false,
  updated_at timestamptz not null default now()
);
create table if not exists public.bn_gallery (
  id uuid primary key default gen_random_uuid(),
  image_url text not null check (image_url ~ '^https://'),
  alt_text text not null,
  display_order integer not null default 0,
  updated_at timestamptz not null default now()
);
alter table public.bn_admin_users enable row level security;
alter table public.bn_services enable row level security;
alter table public.bn_gallery enable row level security;
revoke all on public.bn_admin_users from anon, authenticated;
revoke all on public.bn_services from anon, authenticated;
revoke all on public.bn_gallery from anon, authenticated;
grant select on public.bn_admin_users to authenticated;
grant select on public.bn_services, public.bn_gallery to anon, authenticated;
grant insert, update, delete on public.bn_services, public.bn_gallery to authenticated;
drop policy if exists "bn_admin_self_read" on public.bn_admin_users;
create policy "bn_admin_self_read" on public.bn_admin_users for select to authenticated
  using (user_id = (select auth.uid()));
drop policy if exists "bn_services_public_read" on public.bn_services;
create policy "bn_services_public_read" on public.bn_services for select to anon,authenticated using (true);
drop policy if exists "bn_gallery_public_read" on public.bn_gallery;
create policy "bn_gallery_public_read" on public.bn_gallery for select to anon,authenticated using (true);
drop policy if exists "bn_services_admin_insert" on public.bn_services;
create policy "bn_services_admin_insert" on public.bn_services for insert to authenticated
 with check (exists(select 1 from public.bn_admin_users where user_id=(select auth.uid())));
drop policy if exists "bn_services_admin_update" on public.bn_services;
create policy "bn_services_admin_update" on public.bn_services for update to authenticated
 using (exists(select 1 from public.bn_admin_users where user_id=(select auth.uid())))
 with check (exists(select 1 from public.bn_admin_users where user_id=(select auth.uid())));
drop policy if exists "bn_services_admin_delete" on public.bn_services;
create policy "bn_services_admin_delete" on public.bn_services for delete to authenticated
 using (exists(select 1 from public.bn_admin_users where user_id=(select auth.uid())));
drop policy if exists "bn_gallery_admin_insert" on public.bn_gallery;
create policy "bn_gallery_admin_insert" on public.bn_gallery for insert to authenticated
 with check (exists(select 1 from public.bn_admin_users where user_id=(select auth.uid())));
drop policy if exists "bn_gallery_admin_update" on public.bn_gallery;
create policy "bn_gallery_admin_update" on public.bn_gallery for update to authenticated
 using (exists(select 1 from public.bn_admin_users where user_id=(select auth.uid())))
 with check (exists(select 1 from public.bn_admin_users where user_id=(select auth.uid())));
drop policy if exists "bn_gallery_admin_delete" on public.bn_gallery;
create policy "bn_gallery_admin_delete" on public.bn_gallery for delete to authenticated
 using (exists(select 1 from public.bn_admin_users where user_id=(select auth.uid())));
-- Carga inicial manual solo tras comprobar integridad: no insert automáticos.
-- Añadir usuario administrador únicamente desde SQL Editor después de crear su cuenta:
-- insert into public.bn_admin_users(user_id) values ('UUID-VERIFICADO-AQUI');
