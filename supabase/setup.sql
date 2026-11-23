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

drop policy if exists bosque_catalog_read on public.bosque_catalog;
create policy bosque_catalog_read on public.bosque_catalog
  for select to anon, authenticated using (true);

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

-- Visibilidad de piezas. El taller conserva todas las fichas.
lock table public.bosque_catalog in exclusive mode;

create table if not exists public.bosque_workshop (like public.bosque_catalog including all);
alter table public.bosque_workshop enable row level security;
revoke all on public.bosque_workshop from public, anon, authenticated;
grant select, update (state, revision) on public.bosque_workshop to authenticated;

do $$
begin
  if not exists (select 1 from pg_catalog.pg_policies where schemaname = 'public'
                 and tablename = 'bosque_workshop' and policyname = 'bosque_workshop_read') then
    create policy bosque_workshop_read on public.bosque_workshop
      for select to authenticated using ((select public.bosque_is_admin()));
  end if;
  if not exists (select 1 from pg_catalog.pg_policies where schemaname = 'public'
                 and tablename = 'bosque_workshop' and policyname = 'bosque_workshop_write') then
    create policy bosque_workshop_write on public.bosque_workshop
      for update to authenticated using ((select public.bosque_is_admin()))
      with check ((select public.bosque_is_admin()));
  end if;
end;
$$;

insert into public.bosque_workshop (id, revision, state)
select id, revision, state from public.bosque_catalog
on conflict (id) do nothing;

revoke update (state, revision) on public.bosque_catalog from authenticated;

create or replace function bosque_private.sync_published_catalog()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  update public.bosque_catalog
  set revision = new.revision,
      state = case when new.state is null then null else
        pg_catalog.jsonb_set(new.state, '{projects}', (
          select coalesce(pg_catalog.jsonb_agg(project - 'hidden' order by position), '[]'::jsonb)
          from pg_catalog.jsonb_array_elements(new.state->'projects') with ordinality as item(project, position)
          where project->'hidden' is distinct from 'true'::jsonb
        ))
      end
  where id = new.id;
  return new;
end;
$$;
revoke all on function bosque_private.sync_published_catalog() from public, anon, authenticated;

create or replace trigger bosque_publish_catalog after update of state, revision on public.bosque_workshop
  for each row execute function bosque_private.sync_published_catalog();

commit;
