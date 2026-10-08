# Conventions Git

## Branches

- `main` : branche d’intégration, protégée idéalement (PR + CI verte).
- `feature/<sujet>` : nouvelle capacité.
- `fix/<sujet>` : correction.

## Commits

Messages courts en français ou anglais, à l’impératif :

- `feat: panier et checkout mock`
- `fix: bloquer les réservations qui se chevauchent`
- `docs: architecture et besoins`

Une PR = une intention. La CI doit être verte avant merge.
