# Entities Application Progress

## 1. Identite

- Routes: `/dashboard/entities/application-progress` et `/dashboard/entities/application-progress/:page`
- Guard: `authGuard` au niveau dashboard puis `permissionGuard(['MANAGE_APP_CONFIG'])`
- Fichier TS: `quizapp_front/src/app/pages/dashboard/entities/solo/application-progress/entities-application-progress.ts`
- Fichier HTML: `quizapp_front/src/app/pages/dashboard/entities/solo/application-progress/entities-application-progress.html`

## 2. Objectif Produit

La page expose les progressions de candidatures dans le pipeline de recrutement. Elle agit comme une vue CRUD admin sur une entite qui, cote metier, est en realite le moteur central des transitions de pipeline, des scores, des decisions humaines et du deverrouillage des etapes suivantes.

## 3. Etat Constate

- [x] La page etend `EntityCrudBase` avec `ApplicationProgressService`.
- [x] La recherche avancee couvre `progressStatus`, `applicationId`, `pipelineStageId`, suppression et plages de dates.
- [x] Le tableau exploite les champs flattenes `candidateFirstName`, `candidateLastName`, `stageName`, `stageType`, `decidedByFirstName`, `decidedByLastName` quand ils sont presents.
- [x] Les modales create/edit permettent de modifier `progressStatus`, `score`, `notes`, `applicationId` et `pipelineStageId`.
- [x] Le service expose plusieurs actions pipeline non presentes dans cette route: `advance`, `fail`, `skip`, `rollback`, `getCurrentStage`, `getByApplication`, `getMigratableCandidates`, `migrateMultipleCandidates`.
- [x] Le repo indique que `application_progress` est la source de verite du statut candidat et que la synchro interview/evaluation passe par `ApplicationProgressBusiness`.
- [x] La route expose maintenant `getByApplication()` comme vue ciblee par candidature pour charger toute la progression pipeline d'un candidat donne.
- [x] Le mode `candidature courante` est explicite et propose un retour `Voir toutes les progressions` vers la liste CRUD standard.
- [ ] La route reste un CRUD brut alors que le coeur metier pipeline gere preconditions, skip controlle, rollback, emails de stage et synchronisation interview/evaluation.
- [ ] Le filtre `decidedById` existe cote service mais n'est pas expose dans l'UI.
- [ ] Les modales ne proposent aucun select FK pour candidature ou etape: saisie brute par ID seulement.
- [ ] Des signaux metier importants du pipeline ne sont pas visibles ici, notamment les helpers d'avancement/rollback et les contraintes de mail/stage documentees cote backend.
- [ ] Le modele front ne porte pas explicitement certains flags pipeline critiques comme `mailSent`, alors qu'ils pilotent la liberation des etapes suivantes cote backend.

## 4. Blocs UI Constates

### 4.1 Header et toolbar

- [x] breadcrumb retour vers `/dashboard/entities`
- [x] recherche rapide `Rechercher...`
- [x] checkbox `Afficher les supprimes`
- [x] bouton `Voir toutes les progressions` quand une vue ciblee par candidature est active
- [x] bouton `Filtres avances`
- [x] bouton `Nouveau`

### 4.2 Filtres avances

- [x] plage ID `idDe` / `idA`
- [x] filtre `progressStatus`
- [x] filtre `applicationId`
- [x] filtre `pipelineStageId`
- [x] filtre `isDeleted`
- [x] intervalles `dateCreation*` et `dateModification*`
- [ ] pas de filtre `decidedById`

### 4.3 Tableau principal

- [x] colonnes `id`, `application`, `stage`, `type`, `status`, `score`, `startedAt`, `completedAt`, `notes`, `decidedBy`
- [x] badge statut traduit (`PENDING`, `IN_PROGRESS`, `PASSED`, `FAILED`, `SKIPPED`)
- [x] fallback sur `applicationId` si les noms candidat flattenes manquent
- [x] action `Voir la candidature` via `getByApplication()` en plus des actions edit / delete / restore
- [x] detail panel branche en bas de page
- [x] popup dependances FK branche

### 4.4 Modales

- [x] confirmation suppression
- [x] confirmation restauration
- [x] creation progression
- [x] edition progression

## 5. Donnees Affichees Ou Editees

- `id`
- `progressStatus`
- `startedAt`
- `completedAt`
- `score`
- `notes`
- `applicationId`
- `pipelineStageId`
- `decidedById`
- `stageName`
- `stageType`
- `stageOrder`
- `candidateFirstName`
- `candidateLastName`
- `decidedByFirstName`
- `decidedByLastName`
- `isDeleted`

## 6. Services Et Endpoints

- liste CRUD via `ApplicationProgressService.getAllByCriteria()` -> `POST /applicationProgress/getByCriteria`
- creation via `create()` -> `POST /applicationProgress/create`
- edition via `update()` -> `POST /applicationProgress/update`
- suppression via `delete()` -> `POST /applicationProgress/delete`
- restauration via `restore()` -> `POST /applicationProgress/update`
- lecture par candidature via `getByApplication()` -> `POST /applicationProgress/byApplication`
- passage a l'etape suivante via `advance()` -> `POST /applicationProgress/advance`
- echec d'etape via `fail()` -> `POST /applicationProgress/fail`
- skip d'etape via `skip()` -> `POST /applicationProgress/skip`
- rollback pipeline via `rollback()` -> `POST /applicationProgress/rollback`
- etape courante via `getCurrentStage()` -> `POST /applicationProgress/currentStage`
- previsualisation migration via `getMigratableCandidates()` -> `POST /applicationProgress/migratableCandidates`
- migration multiple via `migrateMultipleCandidates()` -> `POST /applicationProgress/migrateMultiple`

## 7. Ce Que Le Backend Doit Envoyer

- Un `getByCriteria` pagine avec `items` ou `item`, plus `count` ou `totalCount`, compatible avec le mapping du service.
- Les champs flattenes de lecture (`stageName`, `stageType`, noms candidat, noms decideur) pour rendre le tableau lisible.
- Des statuts pipeline coherents avec la logique centrale (`PENDING`, `IN_PROGRESS`, `PASSED`, `FAILED`, `SKIPPED`).
- Une synchro fiable avec les etapes interview/evaluation et les regles de stage requises ou skippables.
- Les informations necessaires a la logique mail de stage si le back continue a s'appuyer sur `mailSent` pour liberer la suite du pipeline.

## 8. Entites Metier Impliquees

- `applicationProgress`
- `application`
- `pipelineStage`
- `pipelineTemplate`
- decisions humaines et synchro entretien/evaluation

## 9. Questions Ou Ecarts A Qualifier

- [x] `getByApplication()` est expose ici comme helper de lecture ciblee; les vraies transitions pipeline (`advance`, `fail`, `skip`, `rollback`) restent hors scope de cette route brute pour l'instant.
- [ ] Faut-il ajouter un filtre `decidedById` et des selects FK pour candidature/etape ?
- [ ] Le front doit-il afficher les flags de mail/stage qui conditionnent l'avancement reel ?
- [ ] Le detail panel montre-t-il correctement les champs flattenes et techniques les plus utiles ?

## 10. Recette Manuelle

1. Ouvrir `/dashboard/entities/application-progress` avec un compte autorise.
2. Filtrer par statut puis par `applicationId`.
3. Creer ou modifier une progression avec score et notes.
4. Utiliser l'action `Voir la candidature` sur une progression et verifier le chargement cible de toutes les progressions de cette candidature.
5. Revenir avec `Voir toutes les progressions` puis verifier le retour a la liste CRUD standard.
6. Verifier l'affichage des noms candidat/decideur et des dates de progression.
7. Supprimer puis restaurer une progression.
