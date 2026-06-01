-- Table waitlist : capture d'emails depuis la landing publique (double opt-in).
-- RLS activée SANS aucune policy : aucun rôle anon/authenticated ne peut lire
-- ni écrire. Seules les Server Actions en service_role y accèdent (en
-- contournant la RLS). Les emails collectés restent donc strictement privés.

create table public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text,
  confirmation_token uuid not null default gen_random_uuid(),
  confirmed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.waitlist enable row level security;

-- Index pour la confirmation double opt-in (lookup par token).
create index waitlist_confirmation_token_idx
  on public.waitlist (confirmation_token);
