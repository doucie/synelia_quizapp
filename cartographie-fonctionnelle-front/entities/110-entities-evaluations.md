# Entities Evaluations

## 1. Identite

- Routes: `/dashboard/entities/evaluations` et `/dashboard/entities/evaluations/:page`
- Guard: `authGuard` au niveau dashboard puis `permissionGuard(['MANAGE_APP_CONFIG'])`
- Fichier TS: `quizapp_front/src/app/pages/dashboard/entities/solo/evaluations/entities-evaluations.ts`
- Fichier HTML: `quizapp_front/src/app/pages/dashboard/entities/solo/evaluations/entities-evaluations.html`

## 2. Objectif Produit

La page fournit un CRUD admin brut des evaluations reliees aux `candidateInterview`. Elle est distincte du parcours d'evaluation plein ecran (`/dashboard/evaluate*`) et du dashboard evaluations, car elle manipule directement les enregistrements persistants sans passer par le lien d'evaluation.

## 3. Etat Constate

- [x] La page etend `EntityCrudBase`.
- [x] La recherche rapide filtre via `search_string`.
- [x] Les filtres avances couvrent ID, `candidateInterviewId`, suppression et intervalles de dates.
- [x] Le tableau affiche une note, un commentaire, le `candidateInterviewId` et la date de creation.
- [x] Les modales create/edit exposent `candidateMark`, `recruiterComment` et `candidateInterviewId`.
- [x] La restauration des evaluations supprimees est supportee.
- [ ] Le filtre avance `candidateInterviewId` est visible dans l'UI mais n'est pas transmis par `EvaluationService.getAllEvaluationsByCriteria()`, donc il est vraisemblablement inactif.
- [ ] Les colonnes TS utilisent encore les cles `rating` et `comment`, alors que le template lit `candidateMark` et `recruiterComment`, signe d'un CRUD partiellement adapte.
- [ ] Les mutations `create/update/delete/restore` utilisent `user: 1` en dur.
- [ ] Le select FK `candidateInterview` affiche seulement `#id - App #applicationId`, avec peu de contexte fonctionnel.

## 4. Blocs UI Constates

### 4.1 Header et toolbar

- [x] breadcrumb retour vers `/dashboard/entities`
- [x] recherche rapide `Rechercher...`
- [x] checkbox `Afficher les evaluations supprimees`
- [x] bouton `Filtres avances`
- [x] bouton `Nouvelle evaluation`

### 4.2 Filtres avances

- [x] plage ID `idDe` / `idA`
- [x] filtre `candidateInterviewId`
- [x] filtre `isDeleted`
- [x] intervalles `dateCreation*` et `dateModification*`

### 4.3 Tableau principal

- [x] colonnes `id`, `rating`, `comment`, `candidateInterviewId`, `createdAt`
- [x] rendu de note via `candidateMark`
- [x] rendu commentaire via `recruiterComment`
- [x] actions edit / delete ou restore selon `isDeleted`
- [x] clic ligne via `selectItem(evaluation)`

### 4.4 Modales

- [x] confirmation suppression
- [x] confirmation restauration
- [x] creation evaluation
- [x] edition evaluation

## 5. Donnees Affichees Ou Editees

- `id`
- `candidateMark`
- `recruiterComment`
- `candidateInterviewId`
- `isDeleted`
- `createdAt`
- `candidateName`, `candidateEmail`, `interviewDate`, `interviewLocation` exposes par le service mais non utilises dans cette route

## 6. Services Et Endpoints

- liste via `EvaluationService.getAllEvaluationsByCriteria()` -> `POST /evaluations/getAllByCriteria`
- chargement des `candidateInterview` pour filtres/selects via `CandidateInterviewEntityService.getAllByCriteria()` -> `POST /candidateInterview/getAllByCriteria`
- creation via `EvaluationService.createEvaluation()` -> `POST /evaluations/create`
- edition via `EvaluationService.updateEvaluation()` -> `POST /evaluations/update`
- suppression via `EvaluationService.deleteEvaluation()` -> `POST /evaluations/delete`
- restauration via `EvaluationService.restoreEvaluation()` -> `POST /evaluations/update`
- autres helpers presents dans le service mais non utilises ici: `getInterviewByEvaluationsLink()`, `getCandidateInterviewsByInterviewId()`, `getEvaluationsByCandidateInterviewId()`, `createCandidateInterview()`

## 7. Ce Que Le Backend Doit Envoyer

- Une reponse paginee `getAllByCriteria` avec `items` ou `item`, plus `totalCount` ou `count`.
- Des evaluations contenant `candidateMark`, `recruiterComment`, `candidateInterviewId`, `isDeleted` et les dates.
- Une liste `candidateInterview` active pour alimenter les selects FK.
- Un contrat filtre coherent: si l'UI expose `candidateInterviewId`, l'endpoint `getAllByCriteria` doit le consommer.

## 8. Entites Metier Impliquees

- `evaluation`
- `candidateInterview`
- parcours d'evaluation recruteur distinct du mode plein ecran

## 9. Questions Ou Ecarts A Qualifier

- [ ] Faut-il corriger le filtre `candidateInterviewId` aujourd'hui inactif dans le service ?
- [ ] Les cles `rating/comment` doivent-elles etre renommees pour coller aux DTO `candidateMark/recruiterComment` ?
- [ ] Les mutations doivent-elles reutiliser l'utilisateur courant au lieu de `1` ?
- [ ] Cette page doit-elle rester un CRUD brut ou afficher plus de contexte candidat / entretien ?

## 10. Recette Manuelle

1. Ouvrir `/dashboard/entities/evaluations` avec un compte autorise.
2. Filtrer par `candidateInterviewId` puis verifier si le resultat change reellement.
3. Creer une evaluation avec note, commentaire et entretien candidat.
4. Modifier la note et le commentaire.
5. Supprimer puis restaurer une evaluation.
6. Comparer le resultat avec les autres surfaces `dashboard/evaluations` et `dashboard/evaluate`.

## 11. Impact Cible Multi-Occurrences

- [ ] remplacer le couple `candidateMark` / `recruiterComment` par un modele cible `evaluation` + `evaluation_item`
- [ ] documenter l'identite de l'evaluateur via `interview_participant_id` ou un equivalent explicite
- [ ] retirer toute hypothese d'etape pipeline `EVALUATION` autonome et recadrer la fiche sur le sous-workflow d'entretien
- [ ] documenter plusieurs evaluations detaillees pour un meme entretien et plusieurs criteres par evaluation
- [ ] documenter `evaluationStatus`, `submittedAt`, `validatedAt` et `validatedBy` pour distinguer brouillon, soumission, validation et exploitation metier
- [x] rattacher les criteres a la grille versionnee (`evaluation_grid_template_version` / `evaluation_grid_template_item`, verrou a l'usage) et l'`evaluation_item` a `evaluation_grid_template_item_id` — design retenu par la note 430 (`pipeline_stage_evaluation_criterion` supprimee)
- [ ] limiter les champs de synthese eventuels (`globalScore`, `globalComment`) a des resumes de soumission, derives des lignes `evaluation_item`
