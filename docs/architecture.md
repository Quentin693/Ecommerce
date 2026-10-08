# Besoins, architecture et données — LuxeDrive

Document de cadrage Lead Developer. LuxeDrive est une **location de voitures de luxe**, pas un e-commerce panier / Stripe. Les besoins hors MVP (paiement en ligne, panier, promos) sont listés comme exclus volontairement.

---

## 1. Tableau des besoins

### 1.1 Acteurs et parcours

| Acteur | Parcours principal |
| --- | --- |
| Visiteur | Accueil → flotte → fiche véhicule → contact |
| Client (`user`) | Inscription / connexion → réservation → espace personnel (suivi, annulation) |
| Admin (`admin`) | Connexion → back-office (commandes, livraisons, flotte, comptes, messages) |

### 1.2 Besoins métier

| ID | Besoin | Priorité | Statut MVP | Notes |
| --- | --- | --- | --- | --- |
| B01 | Créer un compte et se connecter | Must | Fait | JWT, rôle `user` forcé à l’inscription |
| B02 | Consulter la flotte (filtres, recherche) | Must | Fait | Recherche texte côté navigateur |
| B03 | Voir le détail d’un véhicule | Must | Fait | Prix / jour, photos, équipements |
| B04 | Réserver sur une plage de dates | Must | Fait | Total = jours × `pricePerDay` |
| B05 | Suivre et annuler ses réservations | Must | Fait | Dashboard client |
| B06 | Remise / restitution du véhicule | Must | Fait | Adresse, ville, statut de livraison |
| B07 | Contacter la conciergerie | Should | Fait | Formulaire public + suivi admin |
| B08 | Admin : piloter les commandes | Must | Fait | Statuts pending → completed |
| B09 | Admin : gérer la flotte (CRUD) | Must | Fait | Suppression bloquée si booking lié |
| B10 | Admin : gérer les rôles | Should | Fait | Pas d’auto-déclassement |
| B11 | Empêcher deux réservations qui se chevauchent | Must | Fait | Refus API si dates en conflit |
| B12 | Paiement | Must | Fait | Paiement mock + confirmation sur `/confirmation/[id]` (pas d’e-mail) |
| B13 | Panier | Must | Fait | `/cart`, `/checkout` ; pas de favoris / variantes |
| B14 | Codes promo / remboursements | Could | Hors MVP | — |
| B15 | Emails transactionnels | Could | Hors MVP | Remplacé par confirmation web |
| B16 | Pages légales (CGV, mentions) | Should | Fait | `/mentions-legales`, `/confidentialite`, `/cgv` |

### 1.3 Périmètre MVP

**Inclus :** compte, flotte, panier, paiement mock, confirmation web, livraison, contact, back-office, blocage des doubles réservations, Docker, CI (lint + tests + e2e smoke + build), doc Agile.

**Exclus (volontaire) :** Stripe réel / webhooks, promos, remboursements, variantes, e-mails, S3.

---

## 2. Architecture technique

### 2.1 Vue d’ensemble

Monolithe modulaire (API Nest + site Next), une base PostgreSQL. Pas de microservices.

```
┌─────────────────┐     HTTPS/JSON      ┌─────────────────┐
│  Next.js 16     │ ──────────────────► │  NestJS 11      │
│  App Router     │   Bearer JWT        │  modules métier │
│  TanStack Query │ ◄────────────────── │  ValidationPipe │
│  Tailwind 4     │                     │  passport-jwt   │
└─────────────────┘                     └────────┬────────┘
                                                 │ TypeORM
                                                 ▼
                                        ┌─────────────────┐
                                        │  PostgreSQL 16  │
                                        └─────────────────┘
```

### 2.2 Couches et responsabilités

| Couche | Techno | Responsabilité |
| --- | --- | --- |
| Front-end | Next.js 16, React 19, Tailwind 4 | UI, parcours client et admin, session locale |
| Client HTTP | axios, TanStack Query | Appels API, cache, jeton JWT |
| Back-end | NestJS 11 | Auth, règles métier, autorisations |
| ORM | TypeORM (`synchronize: true` en démo) | Mapping entités ↔ tables |
| BDD | PostgreSQL 16 | Persistance |
| Conteneurs | Docker Compose | Dev : Postgres + pgAdmin. Prod : api + web + Postgres |
| CI/CD | GitHub Actions | Tests API, builds, images GHCR sur `main` |

Écarts assumés vs guide e-commerce classique : TypeORM (pas Prisma), photos locales (pas S3), Jest (pas Vitest/Playwright en CI), pas Stripe.

### 2.3 Modules Nest

| Module | Dossier | Rôle |
| --- | --- | --- |
| Auth | `backend/src/auth/` | register, login, me, JWT, guards |
| Users | `backend/src/users/` | comptes, rôles |
| Cars | `backend/src/cars/` | catalogue, CRUD admin |
| Bookings | `backend/src/bookings/` | réservations, statut, livraison, conflits de dates |
| Cart | `backend/src/cart/` | panier et checkout |
| Payments | `backend/src/payments/` | paiement mock lié au booking |
| Contact | `backend/src/contact/` | messages du formulaire |

### 2.4 Pages Next

| Route | Rôle |
| --- | --- |
| `/` | Landing |
| `/cars`, `/cars/[id]` | Flotte et réservation |
| `/login`, `/register` | Auth |
| `/dashboard` | Espace client |
| `/cart`, `/checkout` | Panier et paiement |
| `/confirmation/[id]` | Confirmation après paiement (pas d’e-mail) |
| `/contact` | Formulaire |
| `/admin` | Back-office (admin only) |
| `/mentions-legales`, `/confidentialite`, `/cgv` | Pages légales |

### 2.5 Environnements

| Env | Site | API | Base |
| --- | --- | --- | --- |
| Dev local | `:3000` (`npm run dev`) | `:3001` ou `:3010` | Postgres `:5433` |
| Prod Compose | `:3080` | `:3011` | Postgres interne au réseau Docker |

---

## 3. Structure des données et BDD

### 3.1 Modèle conceptuel

```
User 1 ─── * CartItem * ─── 1 Car
User 1 ─── * Booking * ─── 1 Car
                 │
                 └── 1 Payment
                 └── champs livraison

ContactMessage (indépendant, formulaire public)
```

Équivalence guide e-commerce :

| Guide | LuxeDrive |
| --- | --- |
| Product | `Car` |
| Order | `Booking` |
| OrderItem | non (1 véhicule par réservation) |
| Cart / CartItem | `CartItem` |
| Payment | `Payment` (provider `mock`) |
| ProductVariant | non |

### 3.2 Diagramme relationnel

```
┌──────────────────────┐         ┌──────────────────────────┐
│ users                │         │ cars                     │
├──────────────────────┤         ├──────────────────────────┤
│ id           UUID PK │         │ id             UUID PK   │
│ email        UNIQUE  │         │ name                     │
│ password             │         │ brand, model, year       │
│ firstName            │         │ description              │
│ lastName             │         │ pricePerDay    DECIMAL   │
│ role         user\|admin│       │ category                 │
│ createdAt            │         │ imageUrl, images (JSON)  │
│ updatedAt            │         │ available      BOOLEAN   │
└──────────┬───────────┘         │ features       JSON      │
           │                     │ seats, transmission      │
           │ 1                   │ createdAt, updatedAt     │
           │                     └────────────┬─────────────┘
           │                                  │ 1
           │                                  │
           │                     *            │
           ▼                     ▼            │
┌─────────────────────────────────────────────┴─────────────┐
│ bookings                                                  │
├───────────────────────────────────────────────────────────┤
│ id                 UUID PK                                │
│ userId             UUID FK → users.id                     │
│ carId              UUID FK → cars.id                      │
│ startDate, endDate DATE                                   │
│ totalPrice         DECIMAL                                │
│ status             pending\|confirmed\|cancelled\|completed  │
│ notes              NULLABLE                               │
│ deliveryAddress    NULLABLE                               │
│ deliveryCity       NULLABLE                               │
│ deliveryStatus     to_schedule\|scheduled\|…\|returned      │
│ createdAt, updatedAt                                      │
└───────────────────────────────────────────────────────────┘

┌──────────────────────┐       ┌──────────────────────┐
│ cart_items           │       │ payments             │
├──────────────────────┤       ├──────────────────────┤
│ id           UUID PK │       │ id           UUID PK │
│ userId       FK      │       │ bookingId    UNIQUE FK│
│ carId        FK      │       │ amount       DECIMAL │
│ startDate, endDate   │       │ currency     EUR     │
│ notes, delivery*     │       │ status pending\|succeeded\|failed │
│ createdAt, updatedAt │       │ provider     mock    │
└──────────────────────┘       │ paidAt               │
                               └──────────────────────┘

┌──────────────────────┐
│ contact_messages     │
├──────────────────────┤
│ id           UUID PK │
│ name, email          │
│ phone        NULLABLE│
│ subject              │
│ message      TEXT    │
│ status       new\|read\|handled │
│ createdAt            │
└──────────────────────┘
```

### 3.3 Tables détaillées

#### `users`

| Colonne | Type | Contraintes | Description |
| --- | --- | --- | --- |
| id | uuid | PK | Identifiant |
| email | varchar | UNIQUE, NOT NULL | Login |
| password | varchar | NOT NULL | Hash bcrypt |
| firstName | varchar | NOT NULL | Prénom |
| lastName | varchar | NOT NULL | Nom |
| role | varchar | DEFAULT `user` | `user` ou `admin` |
| createdAt | timestamptz | | |
| updatedAt | timestamptz | | |

#### `cars`

| Colonne | Type | Contraintes | Description |
| --- | --- | --- | --- |
| id | uuid | PK | |
| name | varchar | NOT NULL | Libellé affiché |
| brand | varchar | NOT NULL | Marque |
| model | varchar | NOT NULL | Modèle |
| year | int | NOT NULL | Année |
| description | text | NOT NULL | |
| pricePerDay | decimal(10,2) | NOT NULL | Tarif journalier |
| category | varchar | NOT NULL | `supercar`, `luxury`, `suv`, `convertible` |
| imageUrl | varchar | NULL | Photo principale |
| images | simple-json | NULL | Galerie |
| available | boolean | DEFAULT true | Dispo globale (pas de calendrier) |
| features | simple-json | NULL | Liste d’équipements |
| seats | int | NULL | Places |
| transmission | varchar | DEFAULT `automatic` | `automatic` ou `manual` |
| createdAt / updatedAt | timestamptz | | |

#### `bookings`

| Colonne | Type | Contraintes | Description |
| --- | --- | --- | --- |
| id | uuid | PK | |
| userId | uuid | FK → users | Client |
| carId | uuid | FK → cars | Véhicule |
| startDate | date | NOT NULL | Début de location |
| endDate | date | NOT NULL | Fin (après startDate) |
| totalPrice | decimal(10,2) | NOT NULL | Calculé à la création |
| status | varchar | DEFAULT `pending` | Cycle de vie commande |
| notes | varchar | NULL | |
| deliveryAddress | varchar | NULL | Adresse de remise |
| deliveryCity | varchar | NULL | Ville |
| deliveryStatus | varchar | DEFAULT `to_schedule` | Suivi livraison / restitution |
| createdAt / updatedAt | timestamptz | | |

Relations TypeORM : `user` et `car` en **eager** sur `Booking`.

#### `contact_messages`

| Colonne | Type | Contraintes | Description |
| --- | --- | --- | --- |
| id | uuid | PK | |
| name | varchar | NOT NULL | |
| email | varchar | NOT NULL | |
| phone | varchar | NULL | |
| subject | varchar | NOT NULL | |
| message | text | NOT NULL | |
| status | varchar | DEFAULT `new` | `new`, `read`, `handled` |
| createdAt | timestamptz | | |

### 3.4 Statuts métier

**Booking.status**

| Valeur | Signification |
| --- | --- |
| pending | Demande reçue |
| confirmed | Validée par l’admin |
| cancelled | Annulée (client ou admin) |
| completed | Location terminée |

**Booking.deliveryStatus**

| Valeur | Signification |
| --- | --- |
| to_schedule | À planifier |
| scheduled | Planifiée |
| in_transit | En cours de remise |
| delivered | Véhicule remis |
| returned | Véhicule rendu |

**ContactMessage.status** : `new` → `read` → `handled`.

### 3.5 Règles de conservation et contraintes actuelles

| Règle | Implémentation |
| --- | --- |
| Email unique | Contrainte UNIQUE sur `users.email` |
| Mot de passe jamais renvoyé | Strip dans les réponses auth / users / bookings |
| Voiture liée à un booking | DELETE refusé (contrainte FK / erreur métier) |
| Dates | `endDate` > `startDate` au moment de la création |
| Disponibilité | Contrôle de `car.available` |
| Chevauchement de dates | Refus si un booking `pending` ou `confirmed` chevauche la plage |
| Paiement | Au checkout : booking `confirmed` + payment `succeeded` (mock) |
| Migrations versionnées | `TYPEORM_SYNCHRONIZE` (défaut `true` en démo) |

### 3.6 Index recommandés (prod)

Aujourd’hui TypeORM ne déclare pas d’index hors PK / UNIQUE email. Pour la suite :

- `bookings (carId, startDate, endDate)` — détection de conflits ;
- `bookings (userId, createdAt)` — dashboard client ;
- `cars (category, available, pricePerDay)` — filtres flotte.

---

## 4. Liens

- Organisation Agile et sprints : [agile.md](agile.md)
- Pipeline et Docker : [ci-cd.md](ci-cd.md)
- Contrats HTTP : [README.md](../README.md)
