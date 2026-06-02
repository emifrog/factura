-- Phase 7 : paiements & relances.

-- Date de paiement sur les factures.
alter table public.invoices
  add column paid_at timestamptz;

-- Réglages de relance au niveau entreprise.
alter table public.companies
  add column reminder_enabled boolean not null default true,
  add column reminder_signature text;

-- Journal des relances envoyées (audit + anti-doublon).
create table public.invoice_reminders (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices (id) on delete cascade,
  stage int not null, -- 1=J+7, 2=J+15, 3=J+30
  sent_at timestamptz not null default now(),
  constraint invoice_reminders_unique unique (invoice_id, stage)
);

alter table public.invoice_reminders enable row level security;

-- Lecture par le propriétaire de la facture (via la facture parente).
-- Les insertions sont faites par le cron en service_role (contourne la RLS).
create policy "invoice_reminders_select_own" on public.invoice_reminders
  for select using (
    exists (
      select 1 from public.invoices i
      where i.id = invoice_id and i.profile_id = auth.uid()
    )
  );

create index invoice_reminders_invoice_idx
  on public.invoice_reminders (invoice_id);
