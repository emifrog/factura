# Supabase — migrations

Migrations versionnées de la base Factura. RLS définie dans le même fichier que
chaque table (règle non négociable du projet).

## Appliquer les migrations sur le projet distant (UE)

Workflow retenu : **projet distant uniquement** (pas de stack locale Docker).

### Option A — Supabase CLI (recommandé)

```bash
# Une seule fois : lier le dépôt au projet distant
supabase link --project-ref <ref-du-projet>

# Pousser les migrations non appliquées
supabase db push
```

### Option B — SQL Editor

Copier-coller le contenu des fichiers de `migrations/`, dans l'ordre
chronologique, dans le SQL Editor du dashboard Supabase.

## Régénérer les types TypeScript

Après toute modification de schéma :

```bash
supabase gen types typescript --project-id <ref-du-projet> > src/lib/supabase/database.types.ts
```

## Configuration requise côté dashboard

- **Région UE** (Frankfurt ou Paris) — obligation RGPD.
- **Auth > Email** : activer le magic link, désactiver le mot de passe.
- **Auth > SMTP** : configurer le SMTP Resend pour l'envoi des magic links.
- **Auth > URL Configuration** : ajouter les URLs de redirection
  (`http://localhost:3000/auth/callback` en dev, l'URL Vercel en prod).
