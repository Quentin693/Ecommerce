# LuxeDrive — Location de voitures de luxe

Site de location de véhicules de prestige. Le frontend présente la flotte et les réservations. L’API NestJS porte les comptes, le catalogue et les bookings.

## Stack

| Couche | Technologie |
| --- | --- |
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4 |
| Données côté client | TanStack Query, axios |
| Backend | NestJS 11, TypeORM |
| Base | PostgreSQL 16 |
| Auth | JWT (`passport-jwt`), rôles `user` et `admin` |
| Outils | Docker Compose, pgAdmin |

## Démarrage

### 1. Base de données

```bash
docker-compose up -d
```

PostgreSQL est exposé sur `localhost:5433` (le conteneur écoute en interne sur 5432).  
pgAdmin : `http://localhost:5050` — `admin@luxurycars.com` / `admin`.

### 2. API

```bash
cd backend
cp .env.example .env
npm install
npm run start:dev
npm run seed
```

L’API écoute sur `http://localhost:3001`.  
`synchronize: true` dans `AppModule` crée les tables au démarrage. Le seed n’insère les comptes et les voitures que s’ils n’existent pas encore.

### 3. Site

```bash
cd frontend
npm install
npm run dev
```

Le site est sur `http://localhost:3000`.  
`frontend/.env.local` pointe l’API avec `NEXT_PUBLIC_API_URL=http://localhost:3001`.

## Comptes de test

Créés par `npm run seed`.

| Rôle | Email | Mot de passe |
| --- | --- | --- |
| Admin | admin@luxurycars.com | Admin123! |
| User | user@test.com | Test123! |

## Carte du code

```
Ecommerce/
├── docker-compose.yml          # Postgres (5433) + pgAdmin (5050)
├── backend/src/
│   ├── main.ts                 # CORS vers localhost:3000, validation globale
│   ├── app.module.ts           # Config, TypeORM, modules métier
│   ├── auth/                   # register, login, /auth/me, guards JWT et rôles
│   ├── users/                  # entité User, création de compte, liste admin
│   ├── cars/                   # catalogue, filtres, CRUD admin
│   ├── bookings/               # commandes, statuts, livraisons
│   ├── contact/                # messages du formulaire public
│   └── database/seed.ts        # comptes et flotte de démo
└── frontend/
    ├── app/                    # pages App Router
    ├── components/layout/      # Navbar, Footer
    ├── components/ui/          # Button, CarCard, Badge, DatePicker
    ├── lib/api.ts              # client HTTP et types
    ├── lib/auth.tsx            # session dans le localStorage
    ├── lib/mock-cars.ts        # flotte affichée si l’API ne répond pas
    └── public/cars/            # photos servies par Next
```

### Pages

| Route | Rôle |
| --- | --- |
| `/` | Landing : hero, marques, chiffres, vedettes, engagements |
| `/cars` | Flotte, recherche et filtres |
| `/cars/[id]` | Fiche véhicule et demande de dates |
| `/login`, `/register` | Connexion et création de compte |
| `/dashboard` | Réservations de l’utilisateur connecté |
| `/cart`, `/checkout` | Panier et paiement mock |
| `/confirmation/[id]` | Confirmation de réservation sur le site |
| `/contact` | Formulaire de contact |
| `/admin` | Back-office admin : commandes, livraisons, flotte, comptes, messages |

La navbar est fixe. Sur l’accueil elle est transparente tant qu’on n’a pas scrollé. Sur les autres pages elle est opaque, et le contenu commence sous elle.

## API

Pas de préfixe global. Le header attendu pour les routes protégées est `Authorization: Bearer <jwt>`.

### Auth

- `POST /auth/register` — crée un compte `user`. Le rôle envoyé par le client est ignoré. Réponse : `{ access_token, user }`, comme le login.
- `POST /auth/login` — `{ access_token, user }`. Le payload JWT contient `sub`, `email`, `role`.
- `GET /auth/me` — profil de l’utilisateur du jeton.

### Voitures

- `GET /cars` — `{ data, total, page, limit, totalPages }`. Filtres : `category`, `minPrice`, `maxPrice`, `available`, `page`, `limit` (10 par défaut).
- `GET /cars/:id`
- `POST /cars`, `PATCH /cars/:id`, `DELETE /cars/:id` — admin.

Catégories acceptées par le DTO : `supercar`, `luxury`, `suv`, `convertible`.  
Transmission : `automatic` ou `manual`.

### Bookings

Toutes les routes exigent un JWT. Un chevauchement de dates (`pending` / `confirmed`) sur la même voiture est refusé.

- `POST /bookings` — `{ carId, startDate, endDate, notes?, deliveryAddress?, deliveryCity? }`. Total = jours × `pricePerDay`. Statut initial : `pending`.
- `GET /bookings` — bookings de l’utilisateur connecté.
- `GET /bookings/:id` — propriétaire ou admin.
- `PATCH /bookings/:id/cancel` — `cancelled`.
- `GET /bookings/admin/all` — admin.
- `PATCH /bookings/:id/status` — admin.
- `PATCH /bookings/:id/delivery` — admin.

### Panier et checkout

- `GET /cart`, `POST /cart/items`, `DELETE /cart/items/:id` — JWT.
- `POST /checkout` — paie en mock, crée booking(s) `confirmed` + payment(s) `succeeded`, vide le panier. Confirmation côté site : `/confirmation/:bookingId` (pas d’e-mail).
- `GET /payments/:id` — détail du paiement.

### Contact

- `POST /contact` — public. `{ name, email, phone?, subject, message }`.
- `GET /contact` — admin.
- `PATCH /contact/:id` — admin. `{ status }` : `new`, `read` ou `handled`.

### Comptes

- `GET /users` — admin. Liste sans mot de passe.
- `PATCH /users/:id/role` — admin. `{ role }` : `admin` ou `user`. Un admin ne peut pas changer son propre rôle.

## Comment le frontend s’appuie sur l’API

`lib/api.ts` envoie le jeton stocké sous la clé `token`. Un `401` vide le `localStorage` et renvoie vers `/login`.

La page flotte appelle `GET /cars`. Si cet appel échoue, elle affiche `lib/mock-cars.ts`. Les photos de cette flotte de secours sont dans `frontend/public/cars/`.

Le tableau de bord appelle `reservationsApi`, branché sur `/bookings`. Si l’API ne répond pas, il retombe sur des réservations de démonstration. Le back-office, lui, n’affiche pas de données fictives.

Le client de session accepte `access_token` (réponse Nest) ou `token`. Le rôle est relu via `GET /auth/me` au chargement, pour afficher le lien Back-office.

## Photos

Les visuels de la démo sont des fichiers locaux, pour ne plus dépendre d’URLs distantes qui répondent en 404. `next.config.ts` autorise encore `images.unsplash.com` si une voiture en base pointe vers Unsplash.

## Organisation et livraison

Besoins métier, architecture et schéma BDD : [docs/architecture.md](docs/architecture.md).

Le cadre Scrum, la découpe en epics et la Definition of Done sont dans [docs/agile.md](docs/agile.md).

La CI (tests et build sur chaque pull request) et la publication des images sur `main` sont dans [docs/ci-cd.md](docs/ci-cd.md). Le workflow est `.github/workflows/ci-cd.yml`. La pile Docker applicative se lance avec `docker compose -f docker-compose.prod.yml up --build`.
