# Supabase

Configuration de la base de données Postgres + Auth + Storage de Factura.

## Région

**eu-central-1 (Frankfurt)** — obligatoire RGPD. Le projet doit être créé dans cette région côté supabase.com.

## Workflow

1. Créer le projet sur https://supabase.com/dashboard (région Frankfurt).
2. Récupérer `Project URL`, `anon key`, `service_role key`, et le mot de passe DB.
3. Renseigner `.env.local` à partir de `.env.example` :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (côté serveur uniquement)
4. Installer le CLI Supabase : `npm i -g supabase` (ou via Scoop sur Windows).
5. Lier le projet local au projet distant :
   ```sh
   supabase link --project-ref <project-ref>
   ```
6. Pousser les migrations vers la prod :
   ```sh
   supabase db push
   ```

## Migrations

Toutes les nouvelles tables doivent inclure leurs **policies RLS** dans la même migration que la table. Aucune table sans RLS — c'est une règle non-négociable du projet.

Convention de nommage : `<timestamp>_<verbe>_<sujet>.sql`, par exemple `20260508120000_create_waitlist.sql`. Le timestamp suit le format `YYYYMMDDHHMMSS` (UTC).

### Patron RLS par table

Chaque migration de création doit appliquer ce patron :

1. `alter table <t> enable row level security;`
2. `alter table <t> force row level security;` (force RLS même pour le owner)
3. `create policy ...` pour chaque opération autorisée explicitement (`insert`, `select`, `update`, `delete`).
4. **Aucune policy = opération interdite** pour `anon` et `authenticated`. Seul `service_role` (côté serveur uniquement, jamais exposé au navigateur) bypasse les policies par design.
5. `revoke all on <t> from anon, authenticated;` puis `grant <op> ... to <role>;` pour figer les permissions au niveau Postgres en plus des policies (deuxième barrière).

### Régénérer les types TypeScript

Après chaque migration appliquée, régénérer `src/lib/supabase/types.ts` :

```sh
supabase gen types typescript --linked > src/lib/supabase/types.ts
```

Tant que le projet Supabase distant n'est pas créé, `types.ts` est tenu à jour manuellement.

## Local

`supabase start` lance la stack Postgres + Studio en local via Docker. Docker n'est **pas installé** sur le poste actuel — on travaille contre l'instance cloud pour le moment.
