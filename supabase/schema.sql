create extension if not exists pgcrypto;

create table if not exists vaults (
  id uuid primary key default gen_random_uuid(),
  retrieval_code text not null unique,
  text_content text,
  passphrase_hash text,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  views integer not null default 0,
  one_time_view boolean not null default false,
  consumed_at timestamptz
);

create table if not exists vault_files (
  id uuid primary key default gen_random_uuid(),
  vault_id uuid not null references vaults(id) on delete cascade,
  file_name text not null,
  file_url text not null,
  file_size bigint not null,
  mime_type text not null,
  storage_path text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_vaults_code on vaults (retrieval_code);
create index if not exists idx_vaults_expires_at on vaults (expires_at);
create index if not exists idx_vault_files_vault_id on vault_files (vault_id);
