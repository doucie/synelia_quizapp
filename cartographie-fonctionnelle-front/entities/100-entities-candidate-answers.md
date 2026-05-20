# Entities Candidate Answers

## 1. Identite

- Routes: `/dashboard/entities/candidate-answers` et `/dashboard/entities/candidate-answers/:page`
- Guard: `authGuard` au niveau dashboard puis `permissionGuard(['MANAGE_APP_CONFIG'])`
- Fichier TS: `quizapp_front/src/app/pages/dashboard/entities/solo/candidate-answers/entities-candidate-answers.ts`
- Fichier HTML: `quizapp_front/src/app/pages/dashboard/entities/solo/candidate-answers/entities-candidate-answers.html`

## 2. Objectif Produit

La page expose un CRUD admin brut des reponses rattachees a une candidature, qu'elles soient a choix ou en texte libre. Elle sert surtout d'audit/administration de liaison, tandis que la correction manuelle metier reste concentree sur la page `/dashboard/entities/applications`.

## 3. Etat Constate

- [x] La page etend `EntityCrudBase`.
- [x] La recherche rapide filtre via `search_string`.
- [x] Les filtres avances couvrent ID, candidature, question, reponse, selection, suppression et intervalles de dates.
- [x] Le tableau expose `applicationId`, `questionId`, `answerId`, un extrait de `freeTextResponse`, le badge `isSelected` et `createdAt`.
- [x] La page charge les FK de `application`, `question` et `answer` pour les filtres/selects.
- [x] Les modales create/edit permettent d'associer une candidature et une reponse, puis de marquer `isSelected`.
- [x] La restauration est supportee.
- [ ] Les formulaires n'exposent ni `questionId` ni `freeTextResponse`, alors que ces informations sont visibles et filtrables dans la page.
- [ ] Le service transporte les champs de correction manuelle (`manualIsCorrect`, `manualCorrectionComment`, `manualCorrectedAt`, `manualCorrectedBy`) et un endpoint `manualCorrection`, mais cette route ne les surface pas.
- [ ] Les mutations `create/update/delete/restore` envoient `user: 1` en dur, alors que l'action `manualCorrection` utilise bien l'utilisateur courant.

## 4. Blocs UI Constates

### 4.1 Header et toolbar

- [x] breadcrumb retour vers `/dashboard/entities`
- [x] recherche rapide `Rechercher...`
- [x] checkbox `Afficher les supprimes`
- [x] bouton `Filtres avances`
- [x] bouton `Nouveau`

### 4.2 Filtres avances

- [x] plage ID `idDe` / `idA`
- [x] filtre `applicationId`
- [x] filtre `questionId`
- [x] filtre `answerId`
- [x] filtre `isSelected`
- [x] filtre `isDeleted`
- [x] intervalles `dateCreation*` et `dateModification*`

### 4.3 Tableau principal

- [x] colonnes `id`, `applicationId`, `questionId`, `answerId`, `freeAnswer`, `selected`, `createdAt`
- [x] troncature visuelle de `freeTextResponse`
- [x] badge booleen `Oui` / `Non` sur `isSelected`
- [x] actions edit / delete ou restore selon `isDeleted`
- [x] detail panel branche en bas de page

### 4.4 Modales

- [x] confirmation suppression
- [x] confirmation restauration
- [x] creation reponse candidat
- [x] edition reponse candidat

## 5. Donnees Affichees Ou Editees

- `id`
- `applicationId`
- `questionId`
- `answerId`
- `freeTextResponse`
- `isSelected`
- `manualIsCorrect`
- `manualCorrectionComment`
- `manualCorrectedAt`, `manualCorrectedBy`
- `isDeleted`
- `createdAt`

## 6. Services Et Endpoints

- liste via `CandidateAnswersService.getAllByCriteria()` -> `POST /candidateanswer/getAllByCriteria`
- chargement des candidatures pour filtres/selects via `ApplicationService.getAllApplicationsByCriteria()`
- chargement des questions via `QuestionService.getAllByCriteria()` -> `POST /question/getAllByCriteria`
- chargement des reponses via `AnswerService.getAllByCriteria()` -> `POST /answer/getAllByCriteria`
- creation via `CandidateAnswersService.create()` -> `POST /candidateanswer/create`
- edition via `CandidateAnswersService.update()` -> `POST /candidateanswer/update`
- suppression via `CandidateAnswersService.delete()` -> `POST /candidateanswer/delete`
- restauration via `CandidateAnswersService.restore()` -> `POST /candidateanswer/update`
- correction manuelle disponible dans le service via `CandidateAnswersService.manualCorrect()` -> `POST /candidateanswer/custom`

## 7. Ce Que Le Backend Doit Envoyer

- Une reponse paginee `getAllByCriteria` avec `items` ou `item`, plus `totalCount` ou `count`.
- Des `candidateAnswer` contenant au minimum les FK `applicationId`, `questionId`, `answerId`, les champs `freeTextResponse`, `isSelected`, `isDeleted` et les dates.
- Les champs de correction manuelle, meme si cette route ne les exploite pas pleinement.
- Des listes FK coherentes pour `application`, `question` et `answer` afin d'alimenter filtres et selects.

## 8. Entites Metier Impliquees

- `candidateAnswer`
- `application`
- `question`
- `answer`
- correction manuelle de quiz portee principalement par `applications`

## 9. Questions Ou Ecarts A Qualifier

- [ ] La page doit-elle rester un CRUD d'audit minimal, ou permettre aussi l'edition de `questionId` et des reponses libres ?
- [ ] La correction manuelle doit-elle etre visible ici, ou rester uniquement sur `applications` ?
- [ ] Les mutations doivent-elles reutiliser l'utilisateur courant au lieu de `1` ?

## 10. Recette Manuelle

1. Ouvrir `/dashboard/entities/candidate-answers` avec un compte autorise.
2. Filtrer par candidature, question et statut `isSelected`.
3. Verifier l'affichage d'une reponse libre longue dans le tableau.
4. Creer puis modifier une liaison reponse/candidature.
5. Supprimer puis restaurer une ligne.
6. Comparer la route avec la correction manuelle disponible dans `/dashboard/entities/applications`.
