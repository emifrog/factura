# Factura

Facturation électronique conforme à la réforme française 2026-2027, pensée pour
les **freelances solo**. 9 €/mois, sans usine à gaz comptable.

> Vision produit, contraintes réglementaires et roadmap : voir
> [`PLAN_ACTION.md`](./PLAN_ACTION.md). Design system : [`DESIGN.md`](./DESIGN.md).

## Stack

- **Next.js 16** (App Router, RSC, Server Actions, Turbopack) — TypeScript strict
- **Tailwind CSS v4** — design system « Financial Clarity »
- **Supabase** (Postgres + RLS, Auth magic link) — région UE
- **Resend** — emails transactionnels
- **Sentry** — monitoring
- **Vitest** (unit) — Playwright (E2E) prévu ultérieurement

## Démarrage

```bash
npm install
cp .env.example .env.local   # puis renseigner les variables
npm run dev
```

L'app tourne sur http://localhost:3000.

### Variables d'environnement

Voir [`.env.example`](./.env.example). Au minimum pour l'auth et la capture :
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`,
`NEXT_PUBLIC_SITE_URL`.

### Base de données

Migrations et procédure d'application : [`supabase/README.md`](./supabase/README.md).

## Scripts

| Commande            | Rôle                      |
| ------------------- | ------------------------- |
| `npm run dev`       | Serveur de développement  |
| `npm run build`     | Build de production       |
| `npm run lint`      | ESLint                    |
| `npm run typecheck` | Vérification TypeScript   |
| `npm run format`    | Prettier (écriture)       |
| `npm run test`      | Tests unitaires (Vitest)  |

## Conventions

- **Server Components** par défaut ; Client Components seulement si interactivité.
- **Server Actions** pour les mutations ; validation **Zod côté serveur**.
- **RLS** sur toutes les tables, définie dans la même migration que la table.
- Intégration PDP toujours derrière l'interface abstraite `PDPProvider` (Phase 4).
- Commits : [Conventional Commits](https://www.conventionalcommits.org/fr/).
