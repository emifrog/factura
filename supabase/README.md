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

Convention de nommage : `<timestamp>_<verbe>_<sujet>.sql`, par exemple `20260601120000_create_companies.sql`.

## Local

`supabase start` lance la stack Postgres + Studio en local via Docker. Docker n'est **pas installé** sur le poste actuel — on travaille contre l'instance cloud pour le moment.
