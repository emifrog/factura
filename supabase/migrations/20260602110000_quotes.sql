-- Phase 6 : devis (quotes) + lignes + numérotation. Transformables en factures.
-- RLS owner ; l'acceptation publique passe par service-role (route tokenisée).

create table public.quotes (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  client_id uuid references public.clients (id) on delete set null,

  number text,
  status text not null default 'draft'
    check (status in ('draft', 'sent', 'accepted', 'refused', 'expired')),
  category text not null default 'services'
    check (category in ('goods', 'services', 'mixed')),

  issue_date date,
  valid_until date,
  currency text not null default 'EUR',

  line_total numeric(12, 2) not null default 0,
  tax_total numeric(12, 2) not null default 0,
  grand_total numeric(12, 2) not null default 0,

  -- Lien public d'acceptation.
  public_token uuid not null default gen_random_uuid(),
  accepted_at timestamptz,
  accepted_by text,

  pdf_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint quotes_number_unique unique (profile_id, number),
  constraint quotes_public_token_unique unique (public_token)
);

alter table public.quotes enable row level security;

create policy "quotes_select_own" on public.quotes
  for select using (auth.uid() = profile_id);
create policy "quotes_insert_own" on public.quotes
  for insert with check (auth.uid() = profile_id);
create policy "quotes_update_own" on public.quotes
  for update using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
create policy "quotes_delete_own" on public.quotes
  for delete using (auth.uid() = profile_id);

create index quotes_profile_status_idx on public.quotes (profile_id, status);

create trigger quotes_set_updated_at
  before update on public.quotes
  for each row execute function public.set_updated_at();

-- ── quote_lines ────────────────────────────────────────────────────────────
create table public.quote_lines (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes (id) on delete cascade,
  line_no int not null,
  description text not null,
  quantity numeric(12, 3) not null default 1,
  unit_code text not null default 'C62',
  unit_price numeric(12, 2) not null default 0,
  vat_rate numeric(5, 2) not null default 0,
  vat_category text not null default 'S',
  line_total numeric(12, 2) not null default 0,
  created_at timestamptz not null default now()
);

alter table public.quote_lines enable row level security;

create policy "quote_lines_select_own" on public.quote_lines
  for select using (
    exists (
      select 1 from public.quotes q
      where q.id = quote_id and q.profile_id = auth.uid()
    )
  );
create policy "quote_lines_insert_own" on public.quote_lines
  for insert with check (
    exists (
      select 1 from public.quotes q
      where q.id = quote_id and q.profile_id = auth.uid()
    )
  );
create policy "quote_lines_update_own" on public.quote_lines
  for update using (
    exists (
      select 1 from public.quotes q
      where q.id = quote_id and q.profile_id = auth.uid()
    )
  );
create policy "quote_lines_delete_own" on public.quote_lines
  for delete using (
    exists (
      select 1 from public.quotes q
      where q.id = quote_id and q.profile_id = auth.uid()
    )
  );

create index quote_lines_quote_idx on public.quote_lines (quote_id);

-- ── numérotation devis ─────────────────────────────────────────────────────
create table public.quote_sequences (
  profile_id uuid not null references public.profiles (id) on delete cascade,
  year int not null,
  last_value int not null default 0,
  primary key (profile_id, year)
);

alter table public.quote_sequences enable row level security;

create or replace function public.next_quote_number(p_year int)
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

  insert into public.quote_sequences (profile_id, year, last_value)
  values (uid, p_year, 1)
  on conflict (profile_id, year)
  do update set last_value = public.quote_sequences.last_value + 1
  returning last_value into v;

  return v;
end;
$$;

revoke all on function public.next_quote_number(int) from public;
grant execute on function public.next_quote_number(int) to authenticated;
