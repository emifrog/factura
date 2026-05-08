# Changelog

Tous les changements notables de Factura sont documentés dans ce fichier.

Le format suit [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/), et le projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

## [Unreleased]

### Added

- Migration `20260508120000_create_waitlist.sql` : table `waitlist` (id uuid,
  email citext unique, source, confirmed_at, created_at) avec RLS strictes
  (insert public anon/authenticated autorisé, lecture interdite — réservée
  à `service_role`). Extension `citext` activée pour l'unicité d'email
  case-insensitive.
- Types Supabase (`src/lib/supabase/types.ts`) tenus manuellement en attendant
  un projet Supabase live (puis `supabase gen types typescript --linked`).
  Branchés sur les clients (`createBrowserClient<Database>`, etc.).
- Patron RLS documenté dans `supabase/README.md` : enable + force RLS,
  policies explicites par opération, `revoke all` puis `grant` ciblé.
- Client Supabase (browser + server) basé sur `@supabase/ssr`, validation Zod
  des variables d'environnement (`src/lib/env.ts`).
- Proxy Next.js 16 (`src/proxy.ts`, convention Next 16 — anciennement
  `middleware.ts`) qui rafraîchit la session Supabase à chaque requête et
  redirige vers `/login` les routes du groupe `(app)` non authentifiées.
- Helpers Auth `getUser()` / `requireUser()` (`src/lib/auth.ts`).
- Route groups : `src/app/(auth)/login` (placeholder) et `src/app/(app)/account`
  (page protégée minimale qui lit l'utilisateur courant).
- Layouts `force-dynamic` sur `(auth)` et `(app)` (pages dépendantes des
  cookies, jamais prérendues statiquement).
- Variables d'env placeholder dans le workflow CI pour permettre le build sans
  projet Supabase actif.
- Scaffolding initial du projet (Next.js 16, App Router, React 19 + Compiler, TypeScript strict).
- Tailwind v4 + shadcn/ui (preset base-nova) avec composants Button, Input, Card.
- Page d'accueil placeholder Factura (FR, design moderne, 3 propositions de valeur).
- Configuration TypeScript renforcée (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noUnusedLocals`, `noUnusedParameters`, etc.).
- Prettier + `prettier-plugin-tailwindcss` + `eslint-config-prettier`.
- Vitest + Testing Library + jsdom + 3 tests unitaires (utilitaire `cn`).
- Playwright + 1 test E2E sur la page d'accueil (chromium).
- GitHub Actions CI : lint, format check, typecheck, tests unit, build, E2E.
- Squelette `supabase/` (config.toml, migrations/, README) — région cible Frankfurt (RGPD).
- `.env.example` documenté (Supabase, Stripe, Sentry, Resend, INSEE, PDP).
- Documentation racine : `README.md`, `CHANGELOG.md`.

### Notes

- Démarrage hors-cadre Phase 0 (validation marché + PDP non terminées) — décision explicite du 2026-05-08.
- Aucun compte Supabase / Stripe / Sentry / PDP raccordé pour l'instant — variables en placeholder.
- Docker non installé → `supabase start` indisponible, on travaillera contre l'instance cloud.
