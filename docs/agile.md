# Organisation Agile — LuxeDrive

LuxeDrive se pilote en Scrum léger. Un sprint dure deux semaines. Une seule branche d’intégration : `main`. Le découpage fonctionnel suit les modules déjà présents dans le code, pour qu’une story corresponde à un dossier, pas à une réécriture.

## Rôles

| Rôle | Responsabilité |
| --- | --- |
| Product Owner | Ordonne le backlog, tranche le périmètre d’un sprint, valide l’incrément en revue |
| Lead fullstack | Découpe les stories en tâches techniques, tient la Definition of Done, relit les pull requests |
| Développeur | Prend une story à la fois, ouvre une branche, livre un incrément qui passe la CI |

Une même personne peut porter deux rôles sur un petit effectif. Le Product Owner reste celui qui dit si la story est finie du point de vue utilisateur.

## Cérémonies

| Moment | Durée | Sortie |
| --- | --- | --- |
| Sprint planning | 1 h | Sprint backlog : stories engagées, et rien d’autre |
| Daily | 15 min | Ce qui est fini, ce qui est en cours, ce qui bloque |
| Revue | 45 min | Démo sur le site et l’API, pas sur des slides |
| Rétrospective | 30 min | Un point à garder, un point à changer au sprint suivant |

Pas de daily écrit si l’équipe est seule : le tableau du sprint suffit.

## Artefacts

- **Product backlog** : la liste priorisée plus bas. Elle vit dans ce fichier tant que le projet n’a pas d’outil de tickets.
- **Sprint backlog** : le sous-ensemble engagé pour les deux semaines.
- **Incrément** : `main` après une pull request dont la CI est verte.

## Flux de travail

1. Partir de `main` à jour.
2. Branche `feature/<epic>-<sujet>` ou `fix/<sujet>`.
3. Une story par pull request quand c’est possible.
4. La CI compile l’API, lance les tests unitaires, et compile le site.
5. Revue, puis merge dans `main`.
6. Le push sur `main` publie les images Docker (voir [ci-cd.md](ci-cd.md)).

## Definition of Done

Une story est finie quand :

- le comportement décrit dans ses critères d’acceptation est visible sur le site ou l’API ;
- la pull request est mergée ;
- les jobs API et Site de la CI sont verts ;
- un changement de contrat HTTP est reporté dans le README ;
- aucun secret (`.env`, mot de passe, jeton) n’est dans le diff.

Le lint n’est pas encore un critère bloquant : le dépôt a une dette de formatage. C’est une story du backlog, pas un oubli du pipeline.

## Découpe du produit

Chaque epic est un module. L’ordre de haut en bas est l’ordre de valeur pour un utilisateur qui loue une voiture, puis pour l’admin qui opère.

```
Vision
└── Epic Compte          backend/src/auth, backend/src/users, frontend login/register
└── Epic Flotte          backend/src/cars, frontend /cars, onglet Flotte
└── Epic Commande        backend/src/bookings, frontend /dashboard
└── Epic Livraison       champs delivery* de Booking, onglet Livraisons
└── Epic Contact         backend/src/contact, frontend /contact
└── Epic Back-office     frontend /admin
└── Epic Industrialisation  .github/workflows, Docker, cette doc
```

### Epic Compte — fait

| Story | Critères d’acceptation |
| --- | --- |
| Créer un compte | `POST /auth/register` crée un `user`, ignore un rôle envoyé par le client, renvoie `access_token` et `user` |
| Se connecter | `POST /auth/login` renvoie un JWT. Le site stocke le jeton et relit le rôle via `GET /auth/me` |
| Gérer les rôles | Un admin liste les comptes sans mot de passe et change le rôle d’un autre compte. Il ne peut pas changer le sien |

### Epic Flotte — fait

| Story | Critères d’acceptation |
| --- | --- |
| Consulter la flotte | `/cars` filtre catégorie, prix, transmission et recherche. Si l’API ne répond pas, la page affiche `lib/mock-cars.ts` |
| Administrer un véhicule | Dans le back-office, un admin crée, modifie et supprime une voiture. Une voiture liée à une commande ne se supprime pas |

### Epic Commande — fait

| Story | Critères d’acceptation |
| --- | --- |
| Réserver | Un client connecté crée un booking. Le total est le nombre de jours × `pricePerDay`. Statut initial : `pending` |
| Suivre ses réservations | `/dashboard` lit `GET /bookings`. Les chiffres du tableau viennent de cette liste |
| Piloter le statut | Un admin passe une commande en confirmée, annulée ou terminée |

### Epic Livraison — fait

| Story | Critères d’acceptation |
| --- | --- |
| Suivre la remise | Adresse, ville et statut (`to_schedule`, `scheduled`, `in_transit`, `delivered`, `returned`) sont éditables par un admin |

### Epic Contact — fait

| Story | Critères d’acceptation |
| --- | --- |
| Écrire à la conciergerie | `/contact` envoie un message public |
| Traiter le message | Un admin le marque lu ou traité |

### Epic Back-office — fait

Un seul écran `/admin`, réservé au rôle `admin`, regroupe commandes, livraisons, flotte, comptes et messages. Pas de données fictives si l’API échoue : l’écran affiche l’erreur.

### Epic Industrialisation — en cours

| Story | État | Critères d’acceptation |
| --- | --- | --- |
| CI compile et teste | fait | Sur chaque pull request et sur `main`, l’API passe `npm test` et `npm run build`, le site passe `npm run build` |
| Images de prod | fait | Un push sur `main` publie `…-api` et `…-web` sur GHCR. `docker-compose.prod.yml` relance la pile |
| Lint bloquant | à faire | `npm run lint` est vert sur `backend` et `frontend`, puis le job est ajouté à la CI |
| Test e2e d’API | à faire | Remplacer `backend/test/app.e2e-spec.ts` (il attend encore `Hello World!`) par un scénario register → voiture → booking, avec Postgres dans le workflow |

## Prochain sprint proposé

Objectif : la CI refuse une régression de style et un parcours métier cassé.

1. Rendre le lint vert sans changer le comportement (formatage Prettier côté API, règles React déjà signalées côté site).
2. Remplacer le test e2e Nest par un scénario réel branché sur Postgres.
3. Ajouter ce job e2e au workflow, après le build.

Hors sprint tant que ce n’est pas priorisé : paiement, emails transactionnels, recherche côté API (le filtre texte est encore dans le navigateur).
