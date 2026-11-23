-- Ejecutar como propietario del proyecto. El taller se inicializa sin administradores.
-- Tras crear la cuenta en Auth > Users, autorizar su UUID en bosque_private.admin.
begin;

create schema if not exists bosque_private;
revoke all on schema bosque_private from public, anon, authenticated;
grant usage on schema bosque_private to authenticated;

create table if not exists bosque_private.admin (
  user_id uuid primary key references auth.users(id) on delete cascade
);
revoke all on bosque_private.admin from public, anon, authenticated;

create or replace function public.bosque_is_admin()
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from bosque_private.admin where user_id = (select auth.uid())
  );
$$;
revoke all on function public.bosque_is_admin() from public, anon, authenticated;
grant execute on function public.bosque_is_admin() to authenticated;

create table if not exists public.bosque_catalog (
  id integer primary key check (id = 1),
  revision integer not null default 0 check (revision >= 0),
  state jsonb check (
    state is null or (
      jsonb_typeof(state) = 'object'
      and state ? 'categories' and jsonb_typeof(state->'categories') = 'array'
      and state ? 'projects' and jsonb_typeof(state->'projects') = 'array'
    )
  )
);
insert into public.bosque_catalog (id) values (1) on conflict do nothing;
alter table public.bosque_catalog enable row level security;
revoke all on public.bosque_catalog from public, anon, authenticated;
grant select on public.bosque_catalog to anon, authenticated;
grant update (state, revision) on public.bosque_catalog to authenticated;

drop policy if exists bosque_catalog_read on public.bosque_catalog;
create policy bosque_catalog_read on public.bosque_catalog
  for select to anon, authenticated using (true);
drop policy if exists bosque_catalog_write on public.bosque_catalog;
create policy bosque_catalog_write on public.bosque_catalog
  for update to authenticated using ((select public.bosque_is_admin()))
  with check ((select public.bosque_is_admin()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('bosque-media', 'bosque-media', true, 52428800, array[
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'video/mp4', 'video/webm', 'video/quicktime'
])
on conflict (id) do update set public = excluded.public,
  file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists bosque_media_upload on storage.objects;
create policy bosque_media_upload on storage.objects
  for insert to authenticated with check (
    bucket_id = 'bosque-media' and (select public.bosque_is_admin())
  );

commit;
