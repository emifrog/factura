-- Migration : waitlist (capture d'emails de la landing page)
--
-- But : collecter les emails des visiteurs qui veulent être prévenus du
-- lancement. Insertion publique (non authentifié), lecture strictement
-- réservée au rôle service_role (jamais exposé au navigateur).
--
-- Règle non-négociable Factura : RLS dans la même migration que la table.

-- citext : type texte case-insensitive — nécessaire pour que l'unicité
-- email ne dépende pas de la casse (Foo@bar.com == foo@bar.com).
create extension if not exists citext;

create table public.waitlist (
  id           uuid primary key default gen_random_uuid(),
  email        citext not null,
  source       text,
  confirmed_at timestamptz,
  created_at   timestamptz not null default now()
);

create unique index waitlist_email_idx on public.waitlist (email);

comment on table public.waitlist is
  'Liste d''attente Factura : visiteurs ayant laissé leur email avant le lancement public.';
comment on column public.waitlist.email is
  'Email saisi par le visiteur (citext, unique, case-insensitive).';
comment on column public.waitlist.source is
  'Origine de la capture : utm_source, étiquette manuelle, etc. Optionnel.';
comment on column public.waitlist.confirmed_at is
  'Timestamp de confirmation double-opt-in. NULL tant que l''email n''est pas confirmé.';

-- RLS : aucune lecture, seul un INSERT public est autorisé.
alter table public.waitlist enable row level security;

-- Force le respect des policies y compris pour le propriétaire de la table
-- (sauf pour le rôle service_role qui contourne RLS par design).
alter table public.waitlist force row level security;

-- INSERT public : autorisé pour anon ET authenticated. Pas de restriction
-- supplémentaire ici — la validation Zod et le rate-limit sont appliqués
-- côté Server Action (bloc 3).
create policy "waitlist_insert_public"
  on public.waitlist
  for insert
  to anon, authenticated
  with check (true);

-- Aucune policy SELECT / UPDATE / DELETE = ces opérations sont interdites
-- pour anon et authenticated. Seul service_role (côté serveur uniquement)
-- peut lire/modifier la table.

-- Restreindre les permissions au niveau Postgres (deuxième barrière).
-- service_role conserve l'accès total via son bypass de RLS.
revoke all on public.waitlist from anon, authenticated;
grant insert (email, source) on public.waitlist to anon, authenticated;
