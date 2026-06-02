# Changelog

Toutes les modifications notables de Factura sont documentées dans ce fichier.

Le format suit [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/),
et le projet adhère au [versionnage sémantique](https://semver.org/lang/fr/).

## [Non publié]

### Ajouté — Phase 7 (paiements & relances)

- **Marquer une facture payée** (manuel) ; statut dynamique (payée / en retard).
- **Détection automatique des retards** : cron Vercel quotidien
  `/api/cron/reminders` (sécurisé par `CRON_SECRET`) qui passe les factures
  échues en `overdue`.
- **Relances email automatiques** J+7 / J+15 / J+30 via Resend, journalisées
  (`invoice_reminders`, anti-doublon), activables et signables par entreprise.
- Planning des relances en logique pure et testée.

### Ajouté — Phase 6 (devis)

- **Modèle `quotes`** + `quote_lines` + numérotation `DEVIS-{année}-{n}`
  (compteur atomique dédié), RLS owner.
- **Éditeur de devis** (`/devis`) : lignes + totaux live, échéance de validité,
  finalisation (numéro + statut envoyé), PDF simple à la demande.
- **Lien public d'acceptation** `/d/{token}` (sans authentification, service-role) :
  le client consulte le devis, télécharge le PDF et **accepte/refuse avec
  e-signature simple** (nom + consentement + horodatage).
- **Transformation devis accepté → brouillon de facture** en un clic.

### Ajouté — Phase 3 (factures Factur-X)

- **Spike technique validé** : génération Factur-X EN 16931 / PDF/A-3b en JS pur
  (serverless) via `@stackforge-eu/factur-x` (WASM), **conformité prouvée par le
  validateur officiel Mustangproject/veraPDF** (PDF/A-3b + XML EN 16931 valides).
- **Modèle de données** : `invoices`, `invoice_lines`, `invoice_sequences`
  (numérotation gapless par utilisateur/année via fonction atomique), RLS strictes,
  bucket d'archivage immuable. Snapshots vendeur/client à l'émission.
- **Service de génération** `generateFacturX` : rendu PDF (police embarquée Noto)
  + profil ICC sRGB → PDF/A-3b + XML CII EN 16931, testé en continu.
- **Éditeur de factures** (`/invoices`) : brouillon avec gestion des lignes,
  totaux HT/TVA/TTC en direct (BR-CO-17), catégorie d'opération, échéance.
- **Émission** : numérotation gapless `FACT-{année}-{n}`, snapshot vendeur/client,
  génération Factur-X, archivage immuable + **empreinte SHA-256**, téléchargement
  PDF/XML via URL signée.
- **Gate de conformité CI** : Mustangproject/veraPDF valide automatiquement un
  Factur-X généré à chaque push/PR (échec si non conforme).

### Ajouté — Phase 2 (entreprise & clients)

- **Modèle `companies`** (1 par utilisateur) : raison sociale, SIREN, forme
  juridique, régime de TVA, n° TVA intracom, option TVA sur les débits, adresse,
  IBAN, logo — RLS stricte. **Modèle `clients`** (B2B/B2C/international) avec
  contrainte SIREN obligatoire pour les B2B.
- **Vérification SIREN** via l'API publique recherche-entreprises.api.gouv.fr
  (sans clé) : auto-remplissage raison sociale + adresse, calcul du n° de TVA.
- **Page Entreprise** (`/company`) : formulaire complet + vérification SIREN.
- **Upload logo** : validation type/taille + redimensionnement sharp (512px,
  WebP), bucket Storage privé avec policies par dossier utilisateur.
- **Carnet de clients** (`/clients`) : liste avec recherche par nom, création,
  édition et suppression ; vérification SIREN pour les clients professionnels.
- Tests unitaires des schémas (companies, clients) et du service SIREN.

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
- **Monitoring Sentry** : instrumentation client / serveur / edge, activée
  uniquement si `NEXT_PUBLIC_SENTRY_DSN` est présent (inerte sinon).
- **CI GitHub Actions** : lint + typecheck + tests unitaires + build sur chaque
  push et PR.
- **Tests unitaires (Vitest)** : schémas Zod (auth, waitlist, profil) et
  composant `Button` — 14 tests.
- **README** projet.

### Reporté

- Tests E2E Playwright (signup / login / logout / capture) — décision assumée,
  à mettre en place ultérieurement. Les tests unitaires couvrent la validation.
