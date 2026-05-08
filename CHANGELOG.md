# Changelog

Tous les changements notables de Factura sont documentés dans ce fichier.

Le format suit [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/), et le projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

## [Unreleased]

### Added

- Design system "Factura Core" (Financial Clarity / Minimalist Corporate) basé
  sur DESIGN.md :
  - Tokens M3 (`surface-container-*`, `primary`, `secondary`, `tertiary`,
    `error`, `success`, `on-*`) dans `src/app/globals.css` avec alias shadcn
    pour rester compatibles avec `shadcn add`.
  - Polices Manrope (titres) + Inter (corps + data) chargées via
    `next/font/google`. Chiffres tabulaires (`tnum`) activés sur Inter pour
    aligner les colonnes de montants.
  - Shadows ambient bleutées (4-8% opacité) pour les cards et modales.
  - Variante `success` (Emerald `#10b981`) sur Button pour les "positive
    actions" (envoyer facture, accepter paiement).
- Composant `<Field>` + `<FieldLabel>` + `<FieldHint>` + `<FieldError>` pour
  appliquer le pattern "label TOUJOURS au-dessus du champ" imposé par
  DESIGN.md.

### Changed

- Migration de toutes les pages et composants vers les nouveaux tokens M3
  (landing, login, account, auth/error, sidebar, topbar, placeholders,
  formulaires waitlist + login).
- Boutons `Button` retravaillés (h-10 par défaut, palette deep blue
  `#131b2e`, success emerald, focus ring tertiary).
- `Input` retravaillé (h-10, bordure `outline-variant`, focus 1px tertiary
  et 3px soft glow).
- `Card` retravaillée (fond `surface-container-lowest` blanc pur, border
  fine `outline-variant`, shadow ambient, padding interne intégré).
- `LoginForm` migré sur le pattern Field (label visible au-dessus). État
  "envoyé" présenté dans un `tertiary-container` avec icône Mail.
- `WaitlistForm` état "succès / déjà inscrit" présenté dans un
  `success-soft` avec icône CheckCircle2.

### Removed

- Tokens shadcn-cli génériques (`oklch(...)`) dans `globals.css` —
  remplacés par les couleurs M3 explicites du DESIGN.md.
- Mode sombre (variante `.dark`) — non spécifiée par DESIGN.md, à réintégrer
  plus tard si besoin.

### Added (suite)

- Layout dashboard (groupe `(app)`) :
  - Sidebar verticale fixe à gauche (md+) avec lien "Factura" et nav vers
    Mon compte / Clients / Factures / Devis (icônes Lucide).
  - Topbar en haut avec email utilisateur (sm+) et bouton "Se déconnecter".
  - Drawer mobile (< md) avec overlay sombre, fermeture par clic extérieur
    ou bouton X. État partagé via Context React (`DashboardSidebarProvider`)
    entre la sidebar et le bouton trigger placé dans la topbar.
  - Mise en surbrillance du lien actif via `pathname` (matching exact ou
    prefix `/foo/`).
  - Layout `(app)` consolide `requireUser()` au niveau du layout (defense
    en profondeur + email pour la topbar) plutôt que dans chaque page.
- Pages placeholder protégées :
  - `/clients` (Phase 2) — carnet d'adresses B2B/B2C/international.
  - `/invoices` (Phase 3) — éditeur Factur-X.
  - `/quotes` (Phase 6) — devis et transformation en facture.
- Composant `<ConstructionPlaceholder>` réutilisable pour ces 3 pages.
- Test E2E : les routes `/clients`, `/invoices`, `/quotes` redirigent vers
  `/login?next=...` quand non authentifié.

### Changed

- `/account` allégée : retrait du bouton logout dupliqué, déplacé dans la
  topbar du layout dashboard.
- Proxy : ajout de `/quotes` à `PROTECTED_PREFIXES`.
- `.prettierignore` : exclusion de `DESIGN.md` (spec rédigée hors gabarit).

### Added (suite)

- Authentification par magic link Supabase :
  - Server Actions `signInWithMagicLink` et `signOut`
    (`src/lib/auth-actions.ts`).
  - Schéma Zod `loginSchema` séparé dans `src/lib/auth-schema.ts` avec
    validation stricte du `next` (regex anti open-redirect : refuse
    `//evil.com` et `/\evil.com`).
  - Page `/login` avec formulaire `<LoginForm>` (Client Component),
    récupération de `?next=...` depuis searchParams (async Next 16).
  - Route Handler `/auth/callback` qui échange le code OAuth contre une
    session via `exchangeCodeForSession` puis redirige vers `next` (ou
    `/account`).
  - Page `/auth/error` avec messages contextualisés (`missing_code`,
    `exchange_failed`).
  - Bouton "Se déconnecter" sur `/account` (formulaire + Server Action
    `signOut` qui clear les cookies et redirige vers `/`).
- Proxy : amélioration de la redirection des utilisateurs connectés
  visitant `/login` (respect du `?next=` validé).
- 6 tests unitaires Zod sur `loginSchema` (incluant 2 cas d'open redirect).
- 3 tests E2E auth : redirection `/account` non auth → `/login?next=`,
  affichage du formulaire login, page d'erreur paramétrée.

### Changed

- Refactor : extraction de `waitlistSchema` dans `src/lib/waitlist-schema.ts`
  pour respecter la règle "fichier `use server` ne peut exporter que des
  fonctions async". Tests renommés `xxx-schema.test.ts`.

### Added (suite)

- Capture email sur la landing : Server Action `addToWaitlist`
  (`src/lib/waitlist.ts`) avec validation Zod (trim + lowercase + email),
  composant Client `<WaitlistForm>` (`src/components/waitlist-form.tsx`)
  branché sur la home page, gestion des états succès / déjà inscrit /
  email invalide / erreur serveur. Pas de Resend ni rate-limit pour
  l'instant (reportés à un prochain bloc), unicité garantie par la
  contrainte UNIQUE au niveau Postgres.
- Tests Vitest sur `waitlistSchema` (6 cas : valide, normalisation,
  email vide, format invalide, source optionnelle, source trop long).
- Test Playwright additionnel : présence du formulaire + non-soumission
  d'un email invalide.
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
