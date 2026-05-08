# Factura

> SaaS de facturation électronique conforme à la réforme française 2026-2027.
> Cible : freelances et auto-entrepreneurs solo. Positionnement : le moins cher pour être conforme.

## Stack

- **Next.js 16** (App Router, RSC, Server Actions, React Compiler)
- **TypeScript strict** (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`)
- **Tailwind v4** + **shadcn/ui** (preset base-nova)
- **Supabase** (Postgres + RLS + Auth + Storage) — région Frankfurt (RGPD)
- **Stripe Billing** — abonnements Pro / Pro+
- **Vitest** + **Testing Library** (unit) — **Playwright** (E2E)
- **Sentry** (monitoring) · **Vercel** (hosting) · **GitHub Actions** (CI)

## Démarrage local

Prérequis : Node 22+, npm 10+, git.

```sh
git clone <repo> factura
cd factura
npm install
cp .env.example .env.local
# Renseigner les clés Supabase / Stripe / etc.
npm run dev
```

L'app tourne sur http://localhost:3000.

> **Important** : `.env.local` est requis pour `npm run build` et `npm run dev`.
> La validation Zod (`src/lib/env.ts`) lève une erreur explicite si
> `NEXT_PUBLIC_SUPABASE_URL` ou `NEXT_PUBLIC_SUPABASE_ANON_KEY` manquent. En CI,
> des valeurs placeholder sont injectées via le workflow GitHub Actions.

## Scripts

| Script              | Description                     |
| ------------------- | ------------------------------- |
| `npm run dev`       | Serveur de développement        |
| `npm run build`     | Build de production             |
| `npm run start`     | Démarre le build de production  |
| `npm run lint`      | ESLint                          |
| `npm run typecheck` | `tsc --noEmit`                  |
| `npm run format`    | Prettier (write)                |
| `npm test`          | Tests unitaires Vitest          |
| `npm run test:e2e`  | Tests E2E Playwright (Chromium) |

## Structure

```
src/
  app/              # Routes Next.js (App Router)
  components/ui/    # Composants shadcn/ui
  lib/              # Utilitaires partagés
e2e/                # Tests Playwright
supabase/
  config.toml       # Config CLI Supabase
  migrations/       # Migrations SQL (RLS dans la même migration que la table)
.github/workflows/  # CI GitHub Actions
```

## Règles non-négociables

1. **Aucune table Supabase sans RLS** — les policies sont écrites dans la même migration que la table.
2. **Aucune ligne de code sans test** — Vitest pour les unit, Playwright pour les flux critiques.
3. **Server Components par défaut**, Server Actions pour les mutations, Zod côté serveur.
4. **Pas de secret en dur** — tout passe par `.env.local`, documenté dans `.env.example`.
5. **Hébergement UE** uniquement (RGPD) — Supabase Frankfurt, Vercel sur région UE.

## Documentation projet

- [`PLAN_ACTION.md`](./PLAN_ACTION.md) — roadmap, contraintes réglementaires, phases.
- [`CLAUDE_CODE_PROMPT.md`](./CLAUDE_CODE_PROMPT.md) — règles de collaboration avec l'assistant IA.
- [`CHANGELOG.md`](./CHANGELOG.md) — historique des changements (Keep a Changelog).
- [`supabase/README.md`](./supabase/README.md) — workflow base de données.

## Licence

Propriétaire — tous droits réservés (à arbitrer en Phase 0 selon stratégie commerciale).
