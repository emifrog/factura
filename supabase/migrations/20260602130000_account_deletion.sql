-- Phase 9 : suppression de compte (RGPD).
-- Soft-delete : la purge définitive (30 j) et la suppression de l'utilisateur
-- auth seront gérées par un job ultérieur, en conservant les factures émises
-- (obligation légale de conservation 10 ans).

alter table public.profiles
  add column deleted_at timestamptz;
