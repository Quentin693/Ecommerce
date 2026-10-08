# CI/CD

Le pipeline est dans `.github/workflows/ci-cd.yml`. Il suit le flux Agile : une pull request prouve que l’incrément compile, un merge sur `main` publie les images.

## Intégration continue

Déclencheurs : pull request, push sur `main`, lancement manuel.

| Job | Dossier | Commandes |
| --- | --- | --- |
| API — tests et build | `backend` | `npm ci`, `npm test -- --ci`, `npm run build` |
| Site — build | `frontend` | `npm ci`, `npm run build` |

Le build du site reçoit `NEXT_PUBLIC_API_URL=http://localhost:3001`. Cette valeur est figée dans le JavaScript au moment de la compilation.

Node 22. Les dépendances viennent des `package-lock.json`.

Le test unitaire actuel couvre le calcul du nombre de jours d’une location (`backend/src/bookings/rental-days.spec.ts`). Le service de booking utilise la même fonction.

Le lint n’est pas un job bloquant. `backend` échoue encore sur Prettier et quelques règles TypeScript, `frontend` sur deux règles React. La story est dans [agile.md](agile.md). `npm run test:e2e` n’est pas lancé non plus : le fichier généré par Nest attend `GET /` → `Hello World!`, ce que l’API ne sert pas.

## Livraison continue

Le job **Images GHCR** ne part que si les deux jobs CI sont verts, sur un push vers `main`.

Il construit et pousse :

- `ghcr.io/<owner>/<repo>-api:<sha>` et `:latest`
- `ghcr.io/<owner>/<repo>-web:<sha>` et `:latest`

Le nom est forcé en minuscules, exigence de GHCR. L’authentification utilise `GITHUB_TOKEN` du dépôt (`packages: write`). Aucun secret supplémentaire n’est à créer. Au premier push, rendre les paquets publics dans les réglages GitHub si l’image doit être tirée sans login.

## Lancer la pile de prod en local

Le Compose de développement (`docker-compose.yml`) ne lance que Postgres et pgAdmin. La pile applicative est séparée pour ne pas changer ce démarrage :

```bash
docker compose -f docker-compose.prod.yml up --build
```

- API : `http://localhost:3011` (le conteneur écoute en 3001)
- Site : `http://localhost:3080` (le conteneur écoute en 3000)

Ces ports hôte laissent libres le `npm run dev` du site (3000) et une autre application déjà branchée sur 3001. Le projet Compose s’appelle `luxedrive-prod`, pour ne pas recréer le Postgres de développement (`luxurycars_postgres`, port 5433).
- Postgres n’est pas publié sur l’hôte. L’API le joint sous le nom `postgres`, port `5432`.

`JWT_SECRET` dans ce fichier est un placeholder local. Le remplacer avant toute machine exposée. Le seed n’est pas lancé par l’image : après le premier démarrage, exécuter `npm run seed` depuis `backend` en pointant `DATABASE_PORT` vers la base, ou insérer les comptes à la main.

`NEXT_PUBLIC_API_URL` est passé au build de l’image web. Pour une autre URL d’API, reconstruire l’image avec l’argument :

```bash
docker compose -f docker-compose.prod.yml build --build-arg NEXT_PUBLIC_API_URL=https://api.exemple.fr web
```
