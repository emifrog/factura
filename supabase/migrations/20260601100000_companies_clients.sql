-- Phase 2 : entreprise émettrice (companies) et carnet de clients (clients).
-- RLS stricte : chacun n'accède qu'à ses propres lignes (auth.uid() = profile_id).

-- ── companies ──────────────────────────────────────────────────────────────
-- Une entreprise par utilisateur (cible : freelance solo) → profile_id unique.
create table public.companies (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles (id) on delete cascade,
  legal_name text not null,
  siren text,
  legal_form text not null check (legal_form in ('EI', 'micro', 'EURL', 'SASU')),
  vat_regime text not null
    check (vat_regime in ('franchise', 'reel_simplifie', 'reel_normal')),
  vat_number text,
  vat_on_debits boolean not null default false,
  address_line1 text,
  address_line2 text,
  postal_code text,
  city text,
  country text not null default 'FR',
  iban text,
  logo_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint companies_siren_format
    check (siren is null or siren ~ '^[0-9]{9}$')
);

alter table public.companies enable row level security;

create policy "companies_select_own" on public.companies
  for select using (auth.uid() = profile_id);
create policy "companies_insert_own" on public.companies
  for insert with check (auth.uid() = profile_id);
create policy "companies_update_own" on public.companies
  for update using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
create policy "companies_delete_own" on public.companies
  for delete using (auth.uid() = profile_id);

create trigger companies_set_updated_at
  before update on public.companies
  for each row execute function public.set_updated_at();

-- ── clients ────────────────────────────────────────────────────────────────
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null check (kind in ('b2b', 'b2c', 'international')),
  name text not null,
  siren text,
  vat_number text,
  email text,
  address_line1 text,
  address_line2 text,
  postal_code text,
  city text,
  country text not null default 'FR',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint clients_siren_format
    check (siren is null or siren ~ '^[0-9]{9}$'),
  -- Mention obligatoire B2B 2026 : un client B2B doit avoir un SIREN.
  constraint clients_b2b_requires_siren
    check (kind <> 'b2b' or siren is not null)
);

alter table public.clients enable row level security;

create policy "clients_select_own" on public.clients
  for select using (auth.uid() = profile_id);
create policy "clients_insert_own" on public.clients
  for insert with check (auth.uid() = profile_id);
create policy "clients_update_own" on public.clients
  for update using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
create policy "clients_delete_own" on public.clients
  for delete using (auth.uid() = profile_id);

-- Recherche par nom, scoping par utilisateur.
create index clients_profile_name_idx on public.clients (profile_id, name);

create trigger clients_set_updated_at
  before update on public.clients
  for each row execute function public.set_updated_at();
