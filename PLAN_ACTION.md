# Plan d'action — Factura

> SaaS de facturation électronique conforme à la réforme française 2026-2027
> **Cible exclusive** : freelance solo français (auto-entrepreneur, EURL/SASU sans salarié, consultant indépendant)
> **Statut** : Opérateur de Dématérialisation (OD) connecté à une PDP partenaire
> **Lancement public visé** : septembre 2026

---

## 1. Contexte business

### Le problème à résoudre

À partir du 1er septembre 2026, toutes les entreprises françaises assujetties à la TVA doivent être capables de **recevoir** des factures au format électronique. Au 1er septembre 2027, l'obligation s'étend à l'**émission** pour les TPE, micro-entreprises et auto-entrepreneurs. Plus de 10 millions d'acteurs économiques sont concernés.

Les solutions existantes (Pennylane, Tiime, Indy, Sage, Cegid) visent en priorité les TPE accompagnées par un comptable et facturent 19-49€/mois pour un bundle complet (compta + facturation + paie). Le freelance solo qui voit son comptable une fois par an n'a pas besoin de tout cela. Il a besoin d'un outil de facturation conforme, simple, à prix accessible.

### Le positionnement

| Critère | Pennylane / Tiime / Indy | Factura |
|---|---|---|
| Cible | TPE avec comptable intégré | Freelance solo, comptable annuel |
| Périmètre | Facturation + compta + banque + paie | Facturation conforme uniquement |
| Prix | 19-49€/mois | 9€/mois |
| Statut | PDP ou via partenaire | OD branché PDP |
| Promesse | "Tout-en-un" | "Le moins cher pour être conforme" |

### Le modèle économique

- **Free** : réception illimitée, 3 émissions/mois, branding "envoyé via Factura"
- **Pro** : 9€/mois HT (89€/an) — émissions illimitées, relances auto, archivage 10 ans, sans branding
- **Pro+** : 19€/mois HT (189€/an) — multi-utilisateurs (2 comptes), API export, support prioritaire

**Objectif financier mois 18** : 800 abonnés Pro + 100 Pro+ = ~9 100€ MRR (~109 000€ ARR).

### Le calendrier marché

| Date | Événement | Impact business |
|---|---|---|
| 1er sept. 2026 | Réception obligatoire toutes entreprises | Premier pic de demande |
| 1er sept. 2027 | Émission obligatoire TPE/micro-entreprises | Pic majeur |

### Concurrents directs à surveiller

- **Pennylane** : offre comptable complète, peut lancer un mode "facturation seule" mais cannibaliserait son produit principal
- **Tiime** : racheté par Cegid en 2023, focus entreprise plus que freelance pur
- **Indy** : meilleur positionné freelance, mais 19€/mois et compta intégrée
- **Abby** : concurrent direct le plus proche (~8€/mois), à surveiller en priorité
- **Henrri** : gratuit, qualité limitée, pas de stratégie Factur-X publique claire

### Hypothèse différenciante

Le freelance solo qui a déjà un expert-comptable annuel ne veut pas payer 19€/mois pour des fonctionnalités comptables qu'il n'utilise pas. À 9€/mois, le calcul devient évident : "Pour 9€ je suis conforme et c'est tout, pour 19€ j'ai aussi la compta — mais je n'en veux pas."

---

## 2. Architecture cible

### Stack technique

```
Frontend       : Next.js 16 (App Router, RSC, Server Actions)
Langage        : TypeScript strict
Auth           : Supabase Auth (email + magic link)
Database       : Supabase Postgres + Row Level Security
Paiement abo   : Stripe Billing (Checkout + Customer Portal)
PDF + Factur-X : à arbitrer Phase 3 (pdf-lib + xmlbuilder2 ou microservice dédié)
Tests unit     : Vitest
Tests E2E      : Playwright
Monitoring     : Sentry
Hosting        : Vercel + Supabase
CI/CD          : GitHub Actions
Emails trans.  : Resend ou Postmark (à choisir Phase 1)
Stockage       : Supabase Storage (PDFs archivés 10 ans)
```

### Modèle de données initial

```
profiles            → utilisateur (lié auth.users)
companies           → entreprise émettrice (SIREN, adresse, TVA, IBAN)
clients             → clients de l'utilisateur (B2B et B2C distincts)
invoices            → factures émises
invoice_lines       → lignes de facture
quotes              → devis (transformables en factures)
received_invoices   → factures reçues via PDP
subscriptions       → abonnement Stripe synchronisé
audit_logs          → journal d'audit (RGPD + intégrité factures)
```

Toutes les tables ont des RLS strictes : `auth.uid() = profile_id` ou équivalent.

### Architecture intégration PDP

```
[Utilisateur]
     ↓
[Factura UI]
     ↓
[Factura Backend] — génération Factur-X (PDF + XML)
     ↓
[Interface PDPProvider abstraite]
     ↓
[Implémentation concrète : XxxPDPProvider]
     ↓
[API PDP partenaire] — émission vers PPF / destinataire
     ↓
[PPF — annuaire, contrôles fiscaux]
     ↓
[Destinataire via SA propre PDP]
```

**Principe critique** : tout le code métier dépend de l'interface `PDPProvider`, jamais d'une PDP spécifique. Permet de pivoter de PDP partenaire sans réécrire la logique métier.

---

## 3. Contraintes réglementaires non-négociables

### Format des factures

- **Factur-X** (PDF/A-3 + XML CII intégré) — format prioritaire car lisible humainement
- Conformité norme **EN 16931**
- Support en lecture des formats UBL et CII pur (factures reçues)

### Mentions obligatoires (à partir du 1er sept. 2026)

En plus des mentions classiques :

1. **SIREN** du client (B2B obligatoire)
2. **Catégorie de l'opération** : livraison de biens / prestation de services / mixte
3. **Option TVA sur les débits** si le prestataire l'a choisie
4. **Adresse de livraison** si différente de l'adresse de facturation

### Archivage

- Conservation **10 ans** minimum
- Intégrité garantie : hash SHA-256 stocké à la création
- Accessibilité par l'utilisateur à tout moment
- Restitution sous 30 jours en cas de résiliation (export ZIP de tous les PDFs + XMLs)

### RGPD

- Consentement explicite à la création de compte
- Registre des traitements documenté
- Export complet des données (format JSON + ZIP des PDFs)
- Suppression totale sur demande (sauf obligations légales de conservation)
- Hébergement Supabase **région UE obligatoire** (Frankfurt ou Paris)
- Pas de Google Analytics : utiliser Plausible ou similaire

### Désignation de la PDP de l'utilisateur

L'utilisateur doit désigner sa PDP dans l'annuaire PPF. Factura propose un parcours guidé. L'expert-comptable peut le faire via mandat opt-in.

---

## 4. Phases de développement

### Phase 0 — Validation marché et choix PDP (semaines 1-2) — EN PARALLÈLE DU DEV

> Cette phase n'est PAS un blocage du développement, mais elle DOIT être terminée avant le début de la Phase 4. Si elle ne l'est pas, on ralentit la roadmap.

- [ ] Télécharger la liste officielle des PDP immatriculées (impots.gouv.fr)
- [ ] Identifier 10-15 PDP candidates (priorité : acteurs B2B "plomberie", éviter celles qui font du SaaS freelance concurrent)
- [ ] Email de prise de contact OD aux 10-15 PDP (questions standardisées : tarifs, API, contrat, exclusivités, environnement sandbox)
- [ ] **20 entretiens utilisateurs** avec freelances (Indie Hackers FR, LinkedIn, communautés) sur leur process actuel, connaissance de la réforme, willingness to pay 9€/mois
- [ ] Synthèse : choisir LA PDP partenaire + valider pricing + identifier 3 features qui font dire oui
- [ ] Validation cadre OD/PDP par avocat spécialisé droit fiscal numérique (1500-3000€)
- [ ] Décider nom commercial définitif + INPI + domaine

**Critère de sortie** : contrat PDP signé OU décision motivée d'arrêter.

---

### Phase 1 — Fondations techniques (semaines 1-2)

**Objectif** : projet déployable, premier utilisateur peut s'inscrire, landing page de capture d'emails en ligne.

- [ ] Setup repo Git + branches `main` / `develop`
- [x] Setup Next.js 16 + TypeScript strict + ESLint + Prettier
- [x] Setup Supabase (projet UE, migrations versionnées, templates RLS)
- [x] Setup Vercel (preview deployments par PR)
- [x] Setup Sentry
- [x] Setup CI GitHub Actions (lint + tests + build sur chaque PR)
- [x] Auth Supabase (email + magic link), pages signup/login/logout
- [x] Page profil minimal (nom, email)
- [x] Layout dashboard (navbar, sidebar)
- [x] **Landing page publique de capture d'emails** ("Préparez-vous à la réforme, soyez prévenu du lancement")
- [ ] Tests E2E : signup, login, logout, capture email _(reporté — déc. assumée ; unitaires Vitest en place)_
- [x] CHANGELOG.md initialisé
- [x] README.md projet

**Critère de sortie** : tests verts à 100%, app déployée Vercel preview, magic link OK en prod, landing capture fonctionnelle.

---

### Phase 2 — Données entreprise et clients (semaines 3-4)

**Objectif** : utilisateur peut configurer son entreprise et son carnet de clients.

- [x] Modèle `companies` : SIREN, raison sociale, adresse, TVA intracom, IBAN, logo, type (EI / micro / EURL / SASU), régime TVA (franchise / réel simplifié / réel normal)
- [x] Vérification SIREN via API publique (recherche-entreprises.api.gouv.fr, sans clé) + auto-remplissage adresse
- [x] Upload logo (Supabase Storage, redimensionnement sharp, validation taille/type)
- [x] Modèle `clients` : B2B (SIREN obligatoire) ou B2C (nom seul) ou international
- [x] CRUD clients avec recherche
- [x] Vérification SIREN pour clients B2B
- [x] Tests unit _(E2E reportés avec la Phase 1)_
- [x] Update CHANGELOG

**Critère de sortie** : utilisateur peut configurer son entreprise et ajouter 5 clients sans bug.

---

### Phase 3 — Génération de factures Factur-X (semaines 5-7)

**Phase critique : c'est le cœur du produit.**

- [x] **Spike technique** : lib retenue `@stackforge-eu/factur-x` (JS pur/WASM, serverless). Conformité PDF/A-3b + EN16931 **prouvée par Mustangproject/veraPDF**. `pdf-lib`+`xmlbuilder2` et microservices écartés.
- [x] Modèle `invoices` : numéro auto, date, statut (draft/issued/sent/paid/overdue/cancelled), totaux HT/TVA/TTC
- [x] Modèle `invoice_lines` : description, quantité, prix unitaire, taux TVA, total
- [x] Numérotation conforme : compteur Postgres dédié par utilisateur (fonction atomique), sans rupture, format `FACT-{année}-{séquence}`
- [x] Éditeur de factures (UI) avec totaux live (brouillon → émission)
- [x] Génération PDF Factur-X conforme EN 16931
- [x] Validation des mentions obligatoires 2026 : catégorie, SIREN B2B (BT-30), TVA débits, adresse de livraison (BG-13), mentions légales PMT/PMD/AAB, adresses électroniques — **propagées au Factur-X, Schematron FR BR-FR satisfait**
- [x] Stockage PDF dans Supabase Storage avec hash SHA-256 d'intégrité
- [x] Téléchargement PDF + XML séparé
- [x] Tests unit (totaux, génération) ; _E2E création facture reportés avec les autres E2E_
- [ ] **Validation par un comptable** d'un échantillon de 10 factures générées _(externe)_
- [x] **Validation conformité Factur-X** via Mustangproject validator — **gate CI actif**

**Critère de sortie** : 10 factures Factur-X générées validées par outil officiel + 1 comptable réel.

---

### Phase 4 — Intégration PDP et émission (semaines 8-10)

> Cette phase nécessite la PDP partenaire choisie en Phase 0.

- [ ] Lecture exhaustive doc API PDP partenaire
- [ ] Définition de l'interface abstraite `PDPProvider` (méthodes : `emit()`, `receive()`, `getStatus()`, `lookupRecipient()`)
- [ ] Implémentation `MockPDPProvider` pour tests
- [ ] Implémentation `XxxPDPProvider` (selon PDP choisie)
- [ ] Authentification API (OAuth/API key selon PDP)
- [ ] Flux "désignation PDP" pour l'utilisateur (inscription annuaire PPF)
- [ ] Émission d'une facture via l'API PDP
- [ ] Webhooks PDP (statut transmission, accusé réception, rejet)
- [ ] Gestion erreurs (rejet réglementaire, destinataire inconnu, etc.)
- [ ] UI de suivi du statut de chaque facture émise
- [ ] Tests E2E sur sandbox PDP
- [ ] **Premier envoi en prod** vers une vraie entreprise test

**Critère de sortie** : une facture émise via Factura est reçue conforme par une vraie entreprise destinataire.

---

### Phase 5 — Réception de factures (semaines 11-12)

> Obligation légale au 1er septembre 2026.

- [ ] Récupération via webhook PDP des factures destinées à l'utilisateur
- [ ] Modèle `received_invoices` (lien PDF, XML extrait, métadonnées)
- [ ] Parsing XML Factur-X / UBL / CII reçus
- [ ] Boîte de réception des factures
- [ ] Notifications (email + in-app) à chaque réception
- [ ] Marquage payé / contesté / archivé
- [ ] Tests E2E (réception simulée des 3 formats)

**Critère de sortie** : réception et lecture correcte de factures dans Factur-X, UBL, CII.

---

### Phase 6 — Devis et transformation en factures (semaine 13)

- [x] Modèle `quotes` (statuts draft/sent/accepted/refused/expired) + `quote_lines` + numérotation `DEVIS-{année}-{n}`
- [x] CRUD devis + génération PDF (PDF simple, Factur-X non requis)
- [x] Acceptation client par lien public sécurisé `/d/{token}` (e-signature simple : nom + consentement + horodatage)
- [x] Transformation devis accepté → brouillon de facture en 1 clic
- [x] Tests (schémas devis)

---

### Phase 7 — Paiements et relances (semaine 14)

- [x] Marquer une facture payée (manuel ; auto Stripe Payment Link différé → compte Stripe)
- [x] Détection automatique factures en retard (cron Vercel `/api/cron/reminders`, sécurisé CRON_SECRET)
- [x] Relances automatiques par email (J+7, J+15, J+30) via Resend, activables par entreprise
- [~] Templates de relance : signature + activation configurables (ton/délai de grâce avancés à venir)
- [ ] **Différentiateur fort** : Stripe Payment Link — différé (Phase 8 / compte Stripe)
- [x] Tests (planning des relances, pur)

---

### Phase 8 — Abonnement Stripe et gestion compte (semaine 15)

- [ ] Modèle `subscriptions` synchronisé avec Stripe
- [ ] Stripe Checkout pour upgrade Free → Pro / Pro+
- [ ] Stripe Customer Portal (changement plan, annulation, factures abo)
- [ ] Webhooks Stripe (création, MAJ, échec paiement, annulation)
- [ ] Limitation Free (3 émissions/mois max)
- [ ] Page tarifs publique
- [ ] Tests E2E paiement (mode test Stripe)

---

### Phase 9 — Export, archivage, RGPD (semaine 16)

- [x] Export comptable CSV (factures émises par année, pour comptable annuel)
- [ ] Export FEC simplifié — **différé** (format légal strict, à faire proprement à la demande)
- [x] Export RGPD complet (toutes les données en JSON + ZIP des PDFs, via fflate)
- [x] Suppression de compte (soft-delete + déconnexion ; purge définitive 30j via job ultérieur)
- [x] Politique conservation 10 ans documentée (page confidentialité)
- [~] Pages mentions légales + confidentialité (brouillon en ligne, **à faire valider par avocat**)
- [x] Tests (génération CSV)

---

### Phase 10 — Site marketing et SEO (semaine 17)

- [ ] Landing page publique (positionnement, prix, CTA inscription)
- [ ] Blog avec **30 articles SEO ciblés longue traîne** (voir liste section 5)
- [ ] Sitemap, robots.txt, Open Graph
- [ ] Plausible Analytics (RGPD-friendly)
- [ ] Page partenaires experts-comptables (programme affiliation 20% commission an 1)
- [ ] Page status (uptime app + PDP partenaire)

---

### Phase 11 — Bêta privée (semaines 18-20)

- [ ] Recrutement 50 testeurs depuis liste d'attente collectée depuis Phase 1
- [ ] Onboarding guidé in-app
- [ ] Collecte feedback structurée (questionnaire + entretiens)
- [ ] Itérations produit prioritaires
- [ ] Préparation lancement public

---

### Phase 12 — Lancement public (septembre 2026)

- [ ] Communication coordonnée (LinkedIn, communautés, presse spécialisée)
- [ ] Activation programme partenaires EC
- [ ] Monitoring renforcé
- [ ] Itération rapide bugs critiques

---

### Phases ultérieures (post-lancement)

- Multi-utilisateurs (Pro+)
- API publique d'export
- App mobile (PWA puis native si besoin)
- Multi-devises (e-reporting international)
- Cachet électronique qualifié
- Modèles de factures personnalisables (au-delà du logo)
- **Fonctionnalités IA** (différenciation post-MVP) :
  - Génération devis depuis description en langage naturel
  - Relances IA personnalisées au ton de la relation client
  - Catégorisation automatique factures reçues
  - Suggestion mentions manquantes en temps réel
- Intégrations comptables directes (API Pennylane, Indy — partenariat plutôt que concurrence)

---

## 5. Stratégie SEO (à préparer dès Phase 1)

Articles prioritaires longue traîne, faible concurrence, intention claire :

1. Facturation électronique auto-entrepreneur 2026 : guide complet
2. Comment recevoir une facture électronique en tant que freelance
3. Calendrier facture électronique TPE : dates clés à retenir
4. Factur-X expliqué simplement aux non-techniques
5. PDP, OD, PPF : comprendre les acronymes en 5 minutes
6. Mentions obligatoires d'une facture électronique en 2026
7. Comment choisir sa PDP quand on est freelance
8. Auto-entrepreneur en franchise TVA : suis-je concerné par la réforme ?
9. Désigner sa PDP dans l'annuaire PPF : tutoriel
10. Erreurs à éviter pour passer à la facturation électronique
11. Sanctions en cas de non-conformité au 1er septembre 2026
12. Comparatif PDP gratuites vs payantes pour freelances
13. Migration depuis Word/Excel vers la facturation électronique
14. Archivage 10 ans des factures : ce qu'il faut savoir
15. e-reporting : à quoi ça sert et qui est concerné
16. Logiciel de facturation pas cher pour freelance en 2026
17. Modèle de facture conforme 2026 (à télécharger)
18. Mes 3 premières factures électroniques : tutoriel pas-à-pas
19. Que faire si mon client ne veut pas de facture électronique
20. Facturation électronique et clients étrangers : règles UE/hors-UE

10 autres articles à compléter selon les questions remontées dans les entretiens utilisateurs.

---

## 6. Risques majeurs et mitigation

| Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|
| PDP partenaire défaillante / change ses conditions | Moyenne | Critique | Interface PDPProvider abstraite, contrat avec clause de réversibilité, surveiller alternatives |
| Concurrent low-cost lance en parallèle (Abby agressif) | Moyenne | Élevé | Vitesse d'exécution, focus extrême freelance solo, partenariats EC, contenu SEO en avance |
| Nouveau report de la réforme | Faible | Critique | Diversifier la promesse (pas que conformité, aussi UX et prix), veille hebdo |
| Bug génération Factur-X | Faible | Critique | Tests automatisés contre validateur officiel, validation comptable, beta longue |
| Acquisition plus lente que prévu | Élevée | Élevé | Plan B : freelance en parallèle 6 mois supplémentaires, programme partenaires EC plus agressif |
| Évolution réglementaire imprévue | Moyenne | Moyen | Veille mensuelle, abonnement newsletters DGFiP/AIFE |
| Dev avant choix PDP : refacto | Élevée | Moyen | Interface PDPProvider strictement abstraite, MockPDPProvider en attendant |

---

## 7. Métriques à suivre dès Phase 1

### Produit
- Taux complétion onboarding (signup → première facture créée)
- Time-to-first-value (signup → première facture émise via PDP)
- Taux rétention M+1, M+3, M+6
- NPS

### Business
- Visiteurs uniques landing
- Taux conversion landing → signup (cible : 3-5%)
- Taux conversion Free → Pro (cible : 8-12%)
- MRR, ARR, LTV, CAC
- Churn mensuel (cible : <5%)

### Technique
- Uptime app (cible : >99.5%)
- Taux d'échec d'émission via PDP (cible : <1%)
- P95 latence génération Factur-X (cible : <3s)
- Erreurs Sentry / 1000 utilisateurs

---

## 8. Coûts à anticiper

| Poste | Coût mensuel | Notes |
|---|---|---|
| Vercel | 20-50€ | Pro plan dès quelques milliers d'utilisateurs |
| Supabase | 25-100€ | Pro plan + storage |
| Sentry | 0-30€ | Free plan suffit au début |
| Resend/Postmark | 0-50€ | Selon volume emails |
| Domaine + email pro | 5€ | OVH/Gandi + Google Workspace |
| Stripe | 1.4% + 0.25€/transaction | Sur abonnements clients |
| **PDP partenaire** | **À négocier** | Variable selon volumes (par facture émise/reçue) |
| Avocat (one-shot) | 1500-3000€ | Phase 0 |
| Comptable mensuel | 100-200€ | Pour la SASU |
| **Total estimé** | **~150-300€/mois + PDP** | Hors PDP qui dépend du volume |

---

## 9. Ressources et liens utiles

- Site officiel réforme : https://www.impots.gouv.fr/portail/professionnel/je-passe-la-facturation-electronique
- Liste officielle PDP immatriculées : à télécharger sur impots.gouv.fr
- Documentation Factur-X : https://fnfe-mpe.org/factur-x/
- Validateur Factur-X open source (Mustangproject) : https://www.mustangproject.org/
- AIFE (opérateur PPF) : https://www.aife.economie.gouv.fr/
- API SIRENE INSEE : https://api.insee.fr/catalogue/

---

## 10. Conventions du projet

- **Commits** : Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `test:`)
- **Branches** : trunk-based — `main` est l'unique branche longue (= prod). Solo
  et pré-lancement : on commite sur `main`. Pour un changement risqué (surtout le
  générateur Factur-X), branche courte `feat/xxx` + PR pour faire valider la CI
  **avant** le merge. _Réintroduire les PR systématiques au lancement (sept. 2026),
  quand un bug en prod touchera de vrais clients._ (`develop` abandonnée le 2026-06-07.)
- **Issues** : labels par phase + priorité (P0/P1/P2)
- **Code review** : auto-review systématique avant push (lecture après pause)
- **Tests** : aucune feature poussée sans test unit minimum, flux critiques avec E2E

---

> **Ce plan est vivant.** À mettre à jour à chaque fin de phase pour refléter ce qui a été appris (entretiens, retours bêta, contraintes PDP réelles). Revue mensuelle recommandée.

> **Note de transparence sur la stratégie de démarrage** : ce projet démarre le développement **avant** la fin de la Phase 0 (validation marché et choix PDP). Cette décision est assumée et présente deux risques : refactoring possible quand la PDP sera choisie (mitigé par l'interface abstraite `PDPProvider`), et risque de construire un produit que le marché ne veut pas (mitigé par la landing de capture d'emails dès la Phase 1, qui collecte un signal continu).
