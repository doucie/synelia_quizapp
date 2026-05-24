# Cartographie Fonctionnelle Front

Ce dossier sert de base de cartographie fonctionnelle route-first du frontend Angular de `quizapp_front`.

L'idee est simple:

- partir des routes montees reelles;
- decrire l'UI constatee dans la page;
- remonter aux services et aux endpoints appeles;
- lister les entites metier impliquees;
- definir ce que le backend doit envoyer;
- transformer cela en recette de verification.

## Sources de verite

- `quizapp_front/src/app/app.routes.ts`
- `quizapp_front/src/app/pages/dashboard/dashboard.ts`
- `quizapp_front/src/app/pages/dashboard/entities/entities.ts`
- les composants TS/HTML de chaque page
- les services Angular appeles par chaque page

## Regles de travail

- 1 fiche = 1 page montee, ou 1 pattern transversal partage.
- La route est la cle primaire documentaire.
- Toujours separer `etat constate`, `attendu backend` et `a verifier`.
- Pour `dashboard/entities/*`, partir d'abord du pattern CRUD commun avant de detailler chaque cas.
- Une table seule ne suffit pas a decrire une page.

## Structure initiale

- [Plan de tri par dependances](./_plan-ordre-dependances.md)
- [Inventaire des routes](./_inventaire-routes.md)
- [Modele de fiche page](./_modele-fiche-page.md)
- [Evolution du modele des reponses](./evolution/400-evolution-modele-reponses-commentaires.md)
- [Inventaire public](./public/README.md)
- [Inventaire dashboard](./dashboard/README.md)
- [Inventaire entities](./entities/README.md)

## Etat au 18/05/2026

- [x] Squelette documentaire cree
- [x] Inventaire initial des routes montees
- [x] Fiche du shell dashboard
- [x] Fiches detaillees pour `campaigns`, `candidates`, `interviews`
- [x] Fiches detaillees des pages publiques
- [x] Fiches detaillees des routes dashboard montees hors `entities/solo`
- [ ] Declinaison page par page des `entities/solo`

## Re-audit au 21/05/2026

- [x] Lot campagnes dashboard (`10` a `13`) revalide contre `app.routes.ts`, les composants `campaign-form*`, `campaign-detail*` et les services Angular associes.
- [ ] Le reste du dossier n'a pas encore ete re-audite avec le meme niveau de verification croisee code / template / service.

## Note de fiabilite

- Un statut `[x]` dans l'inventaire signifie d'abord qu'une fiche existe pour la route, pas que chaque ligne de cette fiche a ete revalidee recemment.
- Les cases `[ ]` peuvent representer soit de vraies questions produit encore ouvertes, soit des points qui n'avaient pas encore ete re-audites; il faut donc lire la date et le perimetre du dernier re-audit du slice concerne.

## Ordre recommande

1. Distinguer les pages `entities` custom des CRUD quasi standards.
2. Deriver ensuite une fiche courte par page `entities/solo`.
3. Revenir au besoin sur les ecarts transverses routes/permissions/pages publiques.
