-- Migration: 0001_init_library
-- Liseuse cloud library: folders + markdown_documents with RLS

create extension if not exists pgcrypto;

-- ─────────────────────────────────────────
-- folders
-- ─────────────────────────────────────────
create table folders (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references auth.users(id) on delete cascade,
  name       text        not null,
  parent_id  uuid        null references folders(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table folders enable row level security;

create policy "folders: select own"
  on folders for select
  using (auth.uid() = user_id);

create policy "folders: insert own"
  on folders for insert
  with check (auth.uid() = user_id);

create policy "folders: update own"
  on folders for update
  using (auth.uid() = user_id);

create policy "folders: delete own"
  on folders for delete
  using (auth.uid() = user_id);

create index idx_folders_user_parent
  on folders (user_id, parent_id);

-- ─────────────────────────────────────────
-- markdown_documents
-- ─────────────────────────────────────────
create table markdown_documents (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references auth.users(id) on delete cascade,
  folder_id  uuid        null references folders(id) on delete set null,
  title      text        not null,
  content    text        not null,
  file_size  int         generated always as (octet_length(content)) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table markdown_documents enable row level security;

create policy "documents: select own"
  on markdown_documents for select
  using (auth.uid() = user_id);

create policy "documents: insert own"
  on markdown_documents for insert
  with check (auth.uid() = user_id);

create policy "documents: update own"
  on markdown_documents for update
  using (auth.uid() = user_id);

create policy "documents: delete own"
  on markdown_documents for delete
  using (auth.uid() = user_id);

create index idx_documents_user_created
  on markdown_documents (user_id, created_at desc);

-- ─────────────────────────────────────────
-- updated_at trigger
-- ─────────────────────────────────────────
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger trg_documents_updated_at
  before update on markdown_documents
  for each row execute function set_updated_at();
