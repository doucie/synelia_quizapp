# Entities Form Questions

## 1. Identite

- Routes: `/dashboard/entities/form-questions` et `/dashboard/entities/form-questions/:page`
- Guard: `authGuard` au niveau dashboard puis `permissionGuard(['MANAGE_APP_CONFIG'])`
- Fichier TS: `quizapp_front/src/app/pages/dashboard/entities/solo/form-questions/entities-form-questions.ts`
- Fichier HTML: `quizapp_front/src/app/pages/dashboard/entities/solo/form-questions/entities-form-questions.html`

## 2. Objectif Produit

La page administre l'association entre une version de formulaire et une question, avec ordre d'affichage et surcharge de chrono. C'est le dernier maillon de la chaine `formulaire -> version -> question`.

## 3. Etat Constate

- [x] La page etend `EntityCrudBase`.
- [x] La recherche rapide filtre via `search_string`.
- [x] Les filtres avances couvrent ID, version de formulaire, question, ordre, suppression et intervalles de dates.
- [x] Le tableau expose `questionOrder`, `chronoOverride`, `formVersionId`, `questionId` et `createdAt`, avec labels resolves pour la version et la question.
- [x] Les modales create/edit permettent de regler ordre, chrono, version de formulaire et question, avec labels resolves dans les selecteurs.
- [x] La restauration est supportee.
- [ ] Les cles de colonnes TS restent `order` et `versionId`, alors que le template lit `questionOrder` et `formVersionId`.
- [ ] Les formulaires create/edit utilisent des `<select>` natifs, pas `app-filter-select`, contrairement au reste de ces CRUD admin.
- [ ] `FormQuestionsService.create/update/delete/restore` envoie encore `user: 1` en dur.
- [x] Le tableau et les selecteurs resolvent maintenant les libelles de version et de question au lieu d'afficher seulement des IDs.

## 4. Blocs UI Constates

### 4.1 Header et toolbar

- [x] breadcrumb retour vers `/dashboard/entities`
- [x] recherche rapide `Rechercher...`
- [x] checkbox `Afficher les supprimes`
- [x] bouton `Filtres avances`
- [x] bouton `Nouveau`

### 4.2 Filtres avances

- [x] plage ID `idDe` / `idA`
- [x] filtre `formVersionId`
- [x] filtre `questionId`
- [x] filtre `questionOrder`
- [x] filtre `isDeleted`
- [x] intervalles `dateCreation*` et `dateModification*`

### 4.3 Tableau principal

- [x] colonnes `id`, `order`, `chronoOverride`, `versionId`, `questionId`, `createdAt`
- [x] rendu des libelles version/question a partir des catalogues frontend
- [x] affichage `chronoOverride` en secondes
- [x] actions edit / delete ou restore selon `isDeleted`
- [x] detail panel branche en bas de page

### 4.4 Modales

- [x] confirmation suppression
- [x] confirmation restauration
- [x] creation question formulaire
- [x] edition question formulaire

## 5. Donnees Affichees Ou Editees

- `id`
- `questionOrder`
- `chronoOverride`
- `formVersionId`
- `questionId`
- `isDeleted`
- `createdAt`

## 6. Services Et Endpoints

- liste via `FormQuestionsService.getAllByCriteria()` -> `POST /formquestions/getAllByCriteria`
- creation via `FormQuestionsService.create()` -> `POST /formquestions/create`
- edition via `FormQuestionsService.update()` -> `POST /formquestions/update`
- suppression via `FormQuestionsService.delete()` -> `POST /formquestions/delete`
- restauration via `FormQuestionsService.restore()` -> `POST /formquestions/update`
- chargement des versions FK via `FormVersionService.getAllByCriteria()` -> `POST /formversion/getAllByCriteria`
- chargement des questions FK via `QuestionService.getAllByCriteria()` -> `POST /question/getAllByCriteria`

## 7. Ce Que Le Backend Doit Envoyer

- Une reponse paginee `getAllByCriteria` avec `items` ou `item`, plus `totalCount` ou `count`.
- Des `formQuestions` contenant `questionOrder`, `chronoOverride`, `formVersionId`, `questionId`, l'etat de suppression et les dates.
- Des listes FK exploitables pour les versions de formulaire et les questions.
- Une gestion coherente de l'ordre si plusieurs questions sont rattachees a la meme version.

## 8. Entites Metier Impliquees

- `formQuestions`
- `formVersion`
- `question`
- ordonnancement et chrono des questions dans un formulaire

## 9. Questions Ou Ecarts A Qualifier

- [ ] Les cles de colonnes doivent-elles etre alignees sur le DTO reel ?
- [ ] Les mutations doivent-elles reutiliser l'utilisateur courant au lieu de `1` ?
- [x] Le texte de la question et le libelle de version sont maintenant affiches dans le tableau et les selecteurs.
- [ ] La route doit-elle proteger davantage l'edition des questions rattachees a une version publiee ou verrouillee ?

## 10. Recette Manuelle

1. Ouvrir `/dashboard/entities/form-questions` avec un compte autorise.
2. Filtrer par version, question et ordre.
3. Creer une liaison question/version avec chrono override.
4. Modifier l'ordre puis verifier le rendu du tableau.
5. Supprimer puis restaurer une ligne.
