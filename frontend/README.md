# Frontend LuxeDrive

Application Next.js du site. Le démarrage, les ports et le contrat avec l’API sont décrits dans le [README racine](../README.md).

## Lancer

```bash
npm install
npm run dev
```

## Organisation

- `app/page.tsx` — landing.
- `app/cars/page.tsx` — liste et filtres. Bascule sur `lib/mock-cars.ts` si `GET /cars` échoue.
- `app/cars/[id]/CarDetailClient.tsx` — fiche et choix des dates.
- `app/login/page.tsx`, `app/register/page.tsx` — formulaires branchés sur `lib/auth.tsx`.
- `app/dashboard/page.tsx` — espace des réservations.
- `components/layout` — navbar et pied de page, présents sur toutes les pages via `app/layout.tsx`.
- `components/ui` — boutons, cartes véhicule, badges, sélecteur de dates.
- `public/cars` — photos de la flotte de démonstration.
