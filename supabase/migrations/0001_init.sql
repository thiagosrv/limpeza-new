-- ============================================================================
-- PS Proteção · Supervisão de Limpeza
-- Migration 0001: schema inicial, RLS e storage buckets
-- ============================================================================
--
-- MODELO DE ACESSO (ver README.md → "Segurança" para detalhes)
--
-- 1. Supervisores em campo NÃO fazem login com e-mail/senha (MVP). O app
--    abre uma sessão anônima do Supabase Auth (`supabase.auth.signInAnonymously()`)
--    no primeiro acesso do dispositivo. Isso gera um JWT `authenticated` real,
--    com um `auth.uid()` estável por dispositivo/navegador — sem exigir cadastro.
-- 2. Administradores fazem login normal (e-mail/senha) e têm uma linha em
--    `profiles` com role = 'admin', vinculada via `user_id`.
-- 3. Toda escrita/leitura de auditorias exige um usuário `authenticated`
--    (anônimo ou admin). A chave `anon` sozinha, sem sessão, não lê nem
--    escreve nada em tabelas transacionais.
-- 4. Cada auditoria guarda `created_by = auth.uid()`. Um dispositivo só
--    enxerga as auditorias que ele mesmo criou; administradores enxergam tudo.
--
-- ============================================================================

create extension if not exists "pgcrypto";

-- ── util: updated_at automático ────────────────────────────────────────────
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================================
-- TABELAS
-- ============================================================================

-- profiles: supervisores (sem login) e administradores (com login Supabase Auth)
create table profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  role text not null check (role in ('admin', 'supervisor')),
  active boolean not null default true,
  pin_code text,
  created_at timestamptz not null default now()
);
create index profiles_role_idx on profiles(role) where active = true;
create unique index profiles_user_id_idx on profiles(user_id) where user_id is not null;

-- locations: clientes/postos atendidos (Hanier é o primeiro)
create table locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  client_name text not null,
  address text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- audit_areas: setores do checklist de um posto (ex.: "Áreas de Apoio")
create table audit_areas (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references locations(id) on delete cascade,
  name text not null,
  position integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index audit_areas_location_idx on audit_areas(location_id, position);

-- audit_items: itens verificáveis de uma área (parent_item_id = subcategoria)
create table audit_items (
  id uuid primary key default gen_random_uuid(),
  area_id uuid not null references audit_areas(id) on delete cascade,
  parent_item_id uuid references audit_items(id) on delete cascade,
  name text not null,
  position integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index audit_items_area_idx on audit_items(area_id, position);
create index audit_items_parent_idx on audit_items(parent_item_id);

-- audits: uma visita/auditoria completa
create table audits (
  id uuid primary key default gen_random_uuid(),
  audit_number text not null unique,
  location_id uuid not null references locations(id),
  supervisor_id uuid not null references profiles(id),
  created_by uuid not null default auth.uid(),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  duration_seconds integer,
  status text not null default 'in_progress' check (status in ('draft', 'in_progress', 'completed')),
  total_items integer not null default 0,
  ok_items integer not null default 0,
  non_compliant_items integer not null default 0,
  conformity_percentage numeric(5,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index audits_location_idx on audits(location_id);
create index audits_supervisor_idx on audits(supervisor_id);
create index audits_created_by_idx on audits(created_by);
create index audits_status_idx on audits(status);
create index audits_started_at_idx on audits(started_at desc);

create trigger audits_set_updated_at
  before update on audits
  for each row execute function set_updated_at();

-- audit_responses: resposta de um item específico dentro de uma auditoria
create table audit_responses (
  id uuid primary key default gen_random_uuid(),
  audit_id uuid not null references audits(id) on delete cascade,
  audit_item_id uuid not null references audit_items(id),
  status text check (status in ('ok', 'non_compliant')),
  justification text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (audit_id, audit_item_id),
  constraint justification_required_when_non_compliant check (status is distinct from 'non_compliant' or (justification is not null and length(trim(justification)) > 0))
);
create index audit_responses_audit_idx on audit_responses(audit_id);

create trigger audit_responses_set_updated_at
  before update on audit_responses
  for each row execute function set_updated_at();

-- audit_photos: evidências fotográficas por resposta
create table audit_photos (
  id uuid primary key default gen_random_uuid(),
  audit_id uuid not null references audits(id) on delete cascade,
  audit_response_id uuid not null references audit_responses(id) on delete cascade,
  storage_path text not null,
  original_filename text,
  created_at timestamptz not null default now()
);
create index audit_photos_audit_idx on audit_photos(audit_id);
create index audit_photos_response_idx on audit_photos(audit_response_id);

-- audit_signatures: assinatura digital do supervisor ao finalizar
create table audit_signatures (
  id uuid primary key default gen_random_uuid(),
  audit_id uuid not null references audits(id) on delete cascade unique,
  supervisor_name text not null,
  storage_path text not null,
  signed_at timestamptz not null default now()
);

-- audit_events: trilha de auditoria de eventos importantes (logs)
create table audit_events (
  id uuid primary key default gen_random_uuid(),
  audit_id uuid references audits(id) on delete cascade,
  event_type text not null,
  payload jsonb,
  created_at timestamptz not null default now()
);
create index audit_events_audit_idx on audit_events(audit_id);

-- ── util: verifica se o usuário atual é admin ativo ────────────────────────
-- (definida após as tabelas: funções language sql são resolvidas contra o
-- catálogo já na criação, então "profiles" precisa existir antes.)
create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles
    where user_id = auth.uid()
      and role = 'admin'
      and active = true
  );
$$;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table profiles enable row level security;
alter table locations enable row level security;
alter table audit_areas enable row level security;
alter table audit_items enable row level security;
alter table audits enable row level security;
alter table audit_responses enable row level security;
alter table audit_photos enable row level security;
alter table audit_signatures enable row level security;
alter table audit_events enable row level security;

-- profiles: qualquer usuário autenticado (campo ou admin) pode ler nomes/roles
-- ativos (necessário para o seletor de supervisor). Escrita só para admin.
create policy profiles_select on profiles
  for select to authenticated
  using (active = true or is_admin());

create policy profiles_admin_write on profiles
  for all to authenticated
  using (is_admin())
  with check (is_admin());

-- locations / audit_areas / audit_items: dados de referência, leitura livre
-- para autenticados (campo precisa carregar o checklist), escrita só admin.
create policy locations_select on locations
  for select to authenticated using (true);
create policy locations_admin_write on locations
  for all to authenticated using (is_admin()) with check (is_admin());

create policy audit_areas_select on audit_areas
  for select to authenticated using (true);
create policy audit_areas_admin_write on audit_areas
  for all to authenticated using (is_admin()) with check (is_admin());

create policy audit_items_select on audit_items
  for select to authenticated using (true);
create policy audit_items_admin_write on audit_items
  for all to authenticated using (is_admin()) with check (is_admin());

-- audits: um dispositivo enxerga só as auditorias que criou; admin vê tudo.
create policy audits_select on audits
  for select to authenticated
  using (created_by = auth.uid() or is_admin());

create policy audits_insert on audits
  for insert to authenticated
  with check (created_by = auth.uid());

create policy audits_update on audits
  for update to authenticated
  using (created_by = auth.uid() or is_admin())
  with check (created_by = auth.uid() or is_admin());

-- audit_responses / audit_photos / audit_signatures: seguem a mesma regra,
-- via join com a auditoria pai.
create policy audit_responses_select on audit_responses
  for select to authenticated
  using (exists (select 1 from audits a where a.id = audit_responses.audit_id and (a.created_by = auth.uid() or is_admin())));
create policy audit_responses_insert on audit_responses
  for insert to authenticated
  with check (exists (select 1 from audits a where a.id = audit_responses.audit_id and a.created_by = auth.uid()));
create policy audit_responses_update on audit_responses
  for update to authenticated
  using (exists (select 1 from audits a where a.id = audit_responses.audit_id and (a.created_by = auth.uid() or is_admin())))
  with check (exists (select 1 from audits a where a.id = audit_responses.audit_id and (a.created_by = auth.uid() or is_admin())));

create policy audit_photos_select on audit_photos
  for select to authenticated
  using (exists (select 1 from audits a where a.id = audit_photos.audit_id and (a.created_by = auth.uid() or is_admin())));
create policy audit_photos_insert on audit_photos
  for insert to authenticated
  with check (exists (select 1 from audits a where a.id = audit_photos.audit_id and a.created_by = auth.uid()));
create policy audit_photos_delete on audit_photos
  for delete to authenticated
  using (exists (select 1 from audits a where a.id = audit_photos.audit_id and (a.created_by = auth.uid() or is_admin())));

create policy audit_signatures_select on audit_signatures
  for select to authenticated
  using (exists (select 1 from audits a where a.id = audit_signatures.audit_id and (a.created_by = auth.uid() or is_admin())));
create policy audit_signatures_insert on audit_signatures
  for insert to authenticated
  with check (exists (select 1 from audits a where a.id = audit_signatures.audit_id and a.created_by = auth.uid()));

create policy audit_events_select on audit_events
  for select to authenticated using (is_admin());
create policy audit_events_insert on audit_events
  for insert to authenticated with check (true);

-- ============================================================================
-- STORAGE BUCKETS
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('audit-photos', 'audit-photos', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('audit-signatures', 'audit-signatures', false)
on conflict (id) do nothing;

-- Convenção de path: audit-photos/{auditId}/{itemId}/{filename}
--                     audit-signatures/{auditId}/signature.png
-- (storage.foldername(name))[1] é o primeiro segmento do path = auditId

create policy audit_photos_storage_select on storage.objects
  for select to authenticated
  using (bucket_id = 'audit-photos' and exists (select 1 from audits a where a.id::text = (storage.foldername(name))[1] and (a.created_by = auth.uid() or is_admin())));

create policy audit_photos_storage_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'audit-photos' and exists (select 1 from audits a where a.id::text = (storage.foldername(name))[1] and a.created_by = auth.uid()));

create policy audit_photos_storage_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'audit-photos' and exists (select 1 from audits a where a.id::text = (storage.foldername(name))[1] and (a.created_by = auth.uid() or is_admin())));

create policy audit_signatures_storage_select on storage.objects
  for select to authenticated
  using (bucket_id = 'audit-signatures' and exists (select 1 from audits a where a.id::text = (storage.foldername(name))[1] and (a.created_by = auth.uid() or is_admin())));

create policy audit_signatures_storage_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'audit-signatures' and exists (select 1 from audits a where a.id::text = (storage.foldername(name))[1] and a.created_by = auth.uid()));
