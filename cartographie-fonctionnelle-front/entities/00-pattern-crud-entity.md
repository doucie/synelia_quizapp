# Pattern CRUD Entity

Ce document sert de base commune pour beaucoup de pages `dashboard/entities/solo/*`.

## Sources a verifier par page

- `quizapp_front/src/app/shared/entity-crud-base.ts`
- le composant `entities-<nom>.ts`
- le template `entities-<nom>.html`
- le service associe si la page surcharge le flux standard

## Blocs attendus dans un CRUD quasi standard

- [ ] Header de page avec titre et actions principales
- [ ] Recherche texte ou filtres simples
- [ ] Liste ou tableau pagine
- [ ] Resume pagination `debut - fin / total`
- [ ] Etat vide
- [ ] Chargement
- [ ] Creation / edition
- [ ] Suppression logique et parfois restauration

## Contrat backend minimal pour ces pages

- [ ] endpoint de liste avec pagination ou pseudo-pagination
- [ ] `items` ou `content`
- [ ] `totalElements` ou equivalent
- [ ] `hasError`, `status.code`, `status.message` si disponibles
- [ ] IDs stables par ligne
- [ ] enums ou flags deja normalises pour l'UI

## Points a verifier page par page

- [ ] Les colonnes visibles correspondent-elles vraiment a l'entite ?
- [ ] Existe-t-il des champs enrichis venant d'autres tables ?
- [ ] Les actions visibles dependent-elles de permissions fines ?
- [ ] La pagination vide affiche-t-elle `0 - 0` quand il n'y a aucun resultat ?
- [ ] La page suit-elle encore le pattern commun ou a-t-elle diverge ?

## Quand sortir du pattern commun

Creer une fiche detaillee specifique des qu'une page:

- enrichit fortement les donnees;
- agrege plusieurs entites;
- porte une logique de permissions particuliere;
- expose des modales ou actions metier non triviales;
- utilise des fragments, routes filles ou composants auxiliaires specifiques.