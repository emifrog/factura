-- Phase 3 : bucket privé d'archivage des factures (PDF/A-3 + XML).
-- Immuable : insert + select uniquement (pas d'update/delete) → intégrité 10 ans.

insert into storage.buckets (id, name, public)
values ('invoices', 'invoices', false)
on conflict (id) do nothing;

create policy "invoices_obj_select_own" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'invoices'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "invoices_obj_insert_own" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'invoices'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
