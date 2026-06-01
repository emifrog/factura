# Changelog

Toutes les modifications notables de Factura sont documentées dans ce fichier.

Le format suit [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/),
et le projet adhère au [versionnage sémantique](https://semver.org/lang/fr/).

## [Non publié]

### Ajouté

- **Bootstrap projet** : Next.js 16 (App Router, RSC, Turbopack), TypeScript
  strict, Tailwind CSS v4, ESLint + Prettier.
- **Outillage** : scripts `typecheck`, `format`, `test` ; Vitest + Testing
  Library configurés (`vitest.config.ts`, `vitest.setup.ts`).
- **Design system "Financial Clarity"** : tokens (couleurs, typo Manrope/Inter,
  rayons, ombres) exposés en utilitaires Tailwind v4 dans `globals.css` ;
  composants de base `Button`, `Card`, `Input`, `Badge` repris des maquettes.
- **Page d'accueil** : hero on-brand (placeholder, formulaire de capture à venir).
- `.env.example` documentant les variables Supabase, Resend et Sentry.
- **Supabase** : clients typés (navigateur, serveur, admin `service_role`),
  migrations versionnées avec RLS strictes (`profiles`, `waitlist`), trigger de
  création de profil à l'inscription, `proxy.ts` (Next 16) pour le
  rafraîchissement de session et la protection des routes.
- **Auth magic link** (sans mot de passe) : pages `login` / `signup`, callback
  PKCE, déconnexion ; validation Zod côté serveur.
- **Espace applicatif protégé** : layout sidebar + topbar, page Vue d'ensemble,
  page profil (édition du nom).
- **Landing publique** : capture d'emails avec double opt-in via Resend
  (insertion `service_role`, email de confirmation, route de confirmation).
