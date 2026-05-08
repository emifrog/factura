# Changelog

Tous les changements notables de Factura sont documentés dans ce fichier.

Le format suit [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/), et le projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

## [Unreleased]

### Added

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
