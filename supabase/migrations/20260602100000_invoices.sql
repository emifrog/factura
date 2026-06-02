-- Phase 3 : factures Factur-X. invoices + invoice_lines + numérotation gapless.
-- RLS stricte partout (auth.uid() = profile_id, lignes via la facture parente).

-- ── invoices ───────────────────────────────────────────────────────────────
create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  client_id uuid references public.clients (id) on delete set null,

  -- Numéro attribué à l'émission uniquement (sinon NULL) → séquence sans trou.
  number text,
  status text not null default 'draft'
    check (status in ('draft', 'issued', 'sent', 'paid', 'overdue', 'cancelled')),

  -- Catégorie de l'opération : mention obligatoire 2026.
  category text not null default 'services'
    check (category in ('goods', 'services', 'mixed')),

  issue_date date,
  due_date date,
  currency text not null default 'EUR',
  vat_on_debits boolean not null default false,

  -- Totaux (figés au fil de l'édition des lignes).
  line_total numeric(12, 2) not null default 0,
  tax_total numeric(12, 2) not null default 0,
  grand_total numeric(12, 2) not null default 0,

  -- Snapshots figés à l'émission (intégrité archivage 10 ans).
  seller_snapshot jsonb,
  buyer_snapshot jsonb,

  -- Archivage Factur-X.
  pdf_path text,
  xml_path text,
  sha256 text,
  issued_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Un numéro est unique par utilisateur (les NULL des brouillons restent distincts).
  constraint invoices_number_unique unique (profile_id, number)
);

alter table public.invoices enable row level security;

create policy "invoices_select_own" on public.invoices
  for select using (auth.uid() = profile_id);
create policy "invoices_insert_own" on public.invoices
  for insert with check (auth.uid() = profile_id);
create policy "invoices_update_own" on public.invoices
  for update using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
create policy "invoices_delete_own" on public.invoices
  for delete using (auth.uid() = profile_id);

create index invoices_profile_status_idx on public.invoices (profile_id, status);

create trigger invoices_set_updated_at
  before update on public.invoices
  for each row execute function public.set_updated_at();

-- ── invoice_lines ──────────────────────────────────────────────────────────
create table public.invoice_lines (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices (id) on delete cascade,
  line_no int not null,
  description text not null,
  quantity numeric(12, 3) not null default 1,
  unit_code text not null default 'C62', -- UN/ECE : C62 unité, HUR heure, H87 pièce…
  unit_price numeric(12, 2) not null default 0,
  vat_rate numeric(5, 2) not null default 0,
  vat_category text not null default 'S', -- S standard, Z taux zéro, E exonéré…
  line_total numeric(12, 2) not null default 0,
  created_at timestamptz not null default now()
);

alter table public.invoice_lines enable row level security;

-- Possession via la facture parente.
create policy "invoice_lines_select_own" on public.invoice_lines
  for select using (
    exists (
      select 1 from public.invoices i
      where i.id = invoice_id and i.profile_id = auth.uid()
    )
  );
create policy "invoice_lines_insert_own" on public.invoice_lines
  for insert with check (
    exists (
      select 1 from public.invoices i
      where i.id = invoice_id and i.profile_id = auth.uid()
    )
  );
create policy "invoice_lines_update_own" on public.invoice_lines
  for update using (
    exists (
      select 1 from public.invoices i
      where i.id = invoice_id and i.profile_id = auth.uid()
    )
  );
create policy "invoice_lines_delete_own" on public.invoice_lines
  for delete using (
    exists (
      select 1 from public.invoices i
      where i.id = invoice_id and i.profile_id = auth.uid()
    )
  );

create index invoice_lines_invoice_idx on public.invoice_lines (invoice_id);

-- ── numérotation atomique (séquence par utilisateur et par année) ───────────
create table public.invoice_sequences (
  profile_id uuid not null references public.profiles (id) on delete cascade,
  year int not null,
  last_value int not null default 0,
  primary key (profile_id, year)
);

alter table public.invoice_sequences enable row level security;
-- Aucune policy : seule la fonction security definer ci-dessous y accède.

-- Alloue et renvoie le prochain numéro pour l'utilisateur courant et l'année.
-- Atomique (upsert + increment) → pas de rupture de séquence.
create or replace function public.next_invoice_number(p_year int)
returns int
language plpgsql
security definer
set search_path = ''
as $$
declare
  v int;
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  insert into public.invoice_sequences (profile_id, year, last_value)
  values (uid, p_year, 1)
  on conflict (profile_id, year)
  do update set last_value = public.invoice_sequences.last_value + 1
  returning last_value into v;

  return v;
end;
$$;

revoke all on function public.next_invoice_number(int) from public;
grant execute on function public.next_invoice_number(int) to authenticated;
