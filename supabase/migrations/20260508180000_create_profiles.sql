-- Migration : profiles (profil utilisateur applicatif lié à auth.users)
--
-- But : stocker les infos applicatives (nom, prénom) hors de la table
-- auth.users que Supabase gère. Une row par utilisateur, créée
-- automatiquement à l'inscription via trigger sur auth.users.
--
-- Règle non-négociable Factura : RLS dans la même migration que la table.

create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  first_name  text,
  last_name   text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.profiles is
  'Profil applicatif lié à auth.users. 1-1, créé automatiquement à l''inscription.';
comment on column public.profiles.id is
  'FK vers auth.users.id (cascade delete : supprimer le user supprime le profil).';
comment on column public.profiles.first_name is
  'Prénom saisi par l''utilisateur. Optionnel.';
comment on column public.profiles.last_name is
  'Nom saisi par l''utilisateur. Optionnel.';

-- Trigger pour MAJ updated_at automatique sur chaque update
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Trigger pour créer une row profiles automatiquement à l'inscription
-- d'un nouveau user dans auth.users (declenche après le signup magic link).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS strictes : un user ne voit et ne modifie QUE son propre profil.
alter table public.profiles enable row level security;
alter table public.profiles force row level security;

-- SELECT : un user lit son profil uniquement.
create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

-- UPDATE : un user modifie son profil uniquement.
create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Pas de policy INSERT : la création passe uniquement par le trigger
-- handle_new_user (security definer). Les users n'insèrent jamais à la main.
-- Pas de policy DELETE : un user ne supprime pas son profil ; la suppression
-- du compte (cascade depuis auth.users) sera gérée Phase 9 (export RGPD).

-- Permissions Postgres au niveau de la table (deuxième barrière aux policies).
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (first_name, last_name) on public.profiles to authenticated;

-- Backfill : créer les rows profiles manquantes pour les users déjà inscrits
-- (toi en l'occurrence — tu t'es probablement déjà connecté pendant les tests
-- de la Phase 1, donc auth.users contient au moins ta row sans profile lié).
insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;
