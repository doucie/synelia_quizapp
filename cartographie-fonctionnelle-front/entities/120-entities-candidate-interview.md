# Entities Candidate Interview

## 1. Identite

- Routes: `/dashboard/entities/candidate-interview` et `/dashboard/entities/candidate-interview/:page`
- Guard: `authGuard` au niveau dashboard puis `permissionGuard(['MANAGE_APP_CONFIG'])`
- Fichier TS: `quizapp_front/src/app/pages/dashboard/entities/solo/candidate-interview/entities-candidate-interview.ts`
- Fichier HTML: `quizapp_front/src/app/pages/dashboard/entities/solo/candidate-interview/entities-candidate-interview.html`

## 2. Objectif Produit

La page administre les liaisons entre candidatures et entretiens. Elle sert de surface relationnelle transversale, distincte a la fois du CRUD `interviews`, du CRUD `applications` et du parcours d'evaluation, tout en exposant un sous-tableau d'evaluations rattachees.

## 3. Etat Constate

- [x] La page etend `EntityCrudBase`.
- [x] La recherche rapide filtre via `search_string`.
- [x] Les filtres avances couvrent ID, candidature, entretien, suppression et intervalles de dates.
- [x] Le tableau expose `applicationId`, `interviewId`, `interviewStart`, `interviewDuration` et `createdAt`.
- [x] Chaque ligne peut s'etendre pour afficher les evaluations enfants.
- [x] Les modales create/edit permettent de choisir la candidature, l'entretien, puis de saisir debut et duree.
- [x] La restauration est supportee.
- [ ] Le chargement des evaluations enfants passe par `EvaluationService.getAllEvaluationsByCriteria({ candidateInterviewId })`, alors que ce filtre n'est pas transmis par le service actuel: l'expansion risque donc de ne pas etre reellement filtree.
- [ ] Les colonnes TS utilisent les cles `startDate` et `duration`, alors que le template lit `interviewStart` et `interviewDuration`.
- [ ] Les champs `declineReason` et `alternativeDateRequested` existent dans l'entite service mais ne sont jamais visibles ni editables dans cette route.
- [ ] Le formulaire permet d'editer `interviewStart` et `interviewDuration` directement sur la liaison, ce qui brouille la frontiere avec la planification portee par l'entite `interview`.

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
- [x] filtre `interviewId`
- [x] filtre `isDeleted`
- [x] intervalles `dateCreation*` et `dateModification*`

### 4.3 Tableau principal

- [x] colonnes `id`, `applicationId`, `interviewId`, `startDate`, `duration`, `createdAt`
- [x] actions edit / delete ou restore selon `isDeleted`
- [x] bouton d'expansion `Voir les evaluations`
- [x] detail panel branche en bas de page

### 4.4 Expansion enfant

- [x] liste des evaluations enfants
- [x] affichage `candidateName`, `candidateMark` et badge `Commente`
- [x] compteur de lignes enfants

### 4.5 Modales

- [x] confirmation suppression
- [x] confirmation restauration
- [x] creation lien candidature-entretien
- [x] edition lien candidature-entretien

## 5. Donnees Affichees Ou Editees

- `id`
- `applicationId`
- `interviewId`
- `interviewStart`
- `interviewDuration`
- `declineReason`
- `alternativeDateRequested`
- `isDeleted`
- `createdAt`
- evaluations enfants chargees par `candidateInterviewId`

## 6. Services Et Endpoints

- liste via `CandidateInterviewEntityService.getAllByCriteria()` -> `POST /candidateInterview/getAllByCriteria`
- creation via `CandidateInterviewEntityService.create()` -> `POST /candidateInterview/create`
- edition via `CandidateInterviewEntityService.update()` -> `POST /candidateInterview/update`
- suppression via `CandidateInterviewEntityService.delete()` -> `POST /candidateInterview/delete`
- restauration via `CandidateInterviewEntityService.restore()` -> `POST /candidateInterview/update`
- chargement des evaluations enfants via `EvaluationService.getAllEvaluationsByCriteria()` -> `POST /evaluations/getAllByCriteria`
- chargement des candidatures FK via `ApplicationService.getAllApplicationsByCriteria()`
- chargement des entretiens FK via `InterviewService.getAllInterviewsByCriteria()` -> `POST /interviews/getAllByCriteria`

## 7. Ce Que Le Backend Doit Envoyer

- Une reponse paginee `getAllByCriteria` avec `items` ou `item`, plus `totalCount` ou `count`.
- Des `candidateInterview` contenant les FK `applicationId` et `interviewId`, les champs de planification, l'etat de suppression et les dates.
- Des listes FK assez riches pour distinguer facilement les candidatures et entretiens dans les selects.
- Un filtre `candidateInterviewId` coherent cote evaluations, sinon l'expansion enfant reste trompeuse.

## 8. Entites Metier Impliquees

- `candidateInterview`
- `application`
- `interview`
- `evaluation`

## 9. Questions Ou Ecarts A Qualifier

- [ ] Faut-il corriger le filtre des evaluations enfants avant de se fier a cette expansion ?
- [ ] Les champs `interviewStart` et `interviewDuration` doivent-ils etre editables ici, ou seulement sur l'entite `interview` ?
- [ ] Les champs `declineReason` et `alternativeDateRequested` doivent-ils apparaitre dans cette route ?

## 10. Recette Manuelle

1. Ouvrir `/dashboard/entities/candidate-interview` avec un compte autorise.
2. Filtrer par candidature puis par entretien.
3. Creer un lien candidature-entretien.
4. Ouvrir l'expansion `evaluations` et verifier si les lignes semblent vraiment filtrees.
5. Modifier puis supprimer/restaurer une ligne.
