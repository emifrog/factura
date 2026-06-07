-- Lot conformité : adresse de livraison + journal d'audit fiscal.

-- Adresse de livraison (mention obligatoire 2026 si différente de la facturation).
alter table public.invoices
  add column delivery_address_line1 text,
  add column delivery_address_line2 text,
  add column delivery_postal_code text,
  add column delivery_city text,
  add column delivery_country text;

-- Journal d'audit append-only (piste d'audit / traçabilité fiscale).
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  entity_type text not null, -- invoice | quote | account
  entity_id uuid,
  action text not null, -- issued | paid | accepted | refused | account_deleted …
  metadata jsonb,
  created_at timestamptz not null default now()
);

alter table public.audit_logs enable row level security;

-- Append-only côté utilisateur : lecture + insertion de ses propres logs,
-- aucune mise à jour ni suppression.
create policy "audit_logs_select_own" on public.audit_logs
  for select using (auth.uid() = profile_id);
create policy "audit_logs_insert_own" on public.audit_logs
  for insert with check (auth.uid() = profile_id);

create index audit_logs_profile_idx on public.audit_logs (profile_id, created_at desc);
