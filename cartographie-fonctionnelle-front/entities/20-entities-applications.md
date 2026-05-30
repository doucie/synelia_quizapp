# Entities Applications

## 1. Identite

- Routes: `/dashboard/entities/applications` et `/dashboard/entities/applications/:page`
- Guard: `authGuard` au niveau dashboard puis `permissionGuard(['MANAGE_APP_CONFIG'])`
- Fichier TS: `quizapp_front/src/app/pages/dashboard/entities/solo/applications/entities-applications.ts`
- Fichier HTML: `quizapp_front/src/app/pages/dashboard/entities/solo/applications/entities-applications.html`

## 2. Objectif Produit

La page donne une vue CRUD technique des candidatures avec un panneau d'expansion qui agrege les sous-objets les plus critiques du parcours candidat: reponses, demandes, tokens et entretiens.

## 3. Etat Constate

- [x] La page etend `EntityCrudBase`, mais ajoute un niveau metier nettement plus riche que le pattern standard.
- [x] Les filtres avances couvrent surtout la candidature elle-meme, plus `sourceTokenId` et `formVersionId`.
- [x] Chaque ligne peut s'ouvrir sur 4 sous-onglets: `Reponses`, `Demandes`, `Tokens`, `Entretiens`.
- [x] Les reponses texte supportent une correction manuelle inline avec commentaire.
- [x] La correction manuelle depend soit de la permission globale `CORRECT_TEST`, soit de permissions campagne deduites via `EntityPermissionService`.
- [x] Les demandes candidat affichent type, resume de changement, statut et motif de decision.
- [x] Les modales create/edit manipulent identite candidat, coordonnees, date de naissance, statut et `sourceTokenId`.
- [x] La restauration est supportee.
- [ ] Les statuts proposes dans la modale d'edition (`UNDER_REVIEW`, `INTERVIEW_SCHEDULED`, `ACCEPTED`, `REJECTED`, `ARCHIVED`) ne correspondent pas aux labels principaux affiches dans `getStatusLabel()` (`SUBMITTED`, `PRE_SCREEN_*`, `INTERVIEWING`, `FINAL_*`).
- [ ] `ApplicationService` garde `user: 1` en dur sur create/update/delete/restore.

## 4. Blocs UI Constates

### 4.1 Header et filtres

- [x] recherche rapide
- [x] checkbox `Afficher les candidatures supprimees`
- [x] filtres avances ID / token source / version formulaire / supprime / dates

### 4.2 Tableau principal

- [x] colonnes `id`, `candidate`, `email`, `phone`, `status`, `quizScore`, `createdAt`
- [x] badge de score quiz et badge d'etat de correction manuelle
- [x] actions edit / delete / restore
- [x] bouton d'expansion par candidature

### 4.3 Sous-onglets d'expansion

- [x] `Reponses`
- [x] `Demandes`
- [x] `Tokens`
- [x] `Entretiens`

### 4.4 Modales

- [x] confirmation suppression / restauration
- [x] edition candidature
- [x] creation candidature

## 5. Donnees Affichees Ou Editees

- `candidateFirstName`, `candidateLastName`
- `candidateEmail`, `candidatePhone`, `candidateBirthDate`
- `applicationStatus`
- `quizScorePercent`
- `quizManualCorrectionStatus`
- `sourceTokenId`
- `formVersionId` en filtre seulement
- sous-donnees: `CandidateAnswer[]`, `CandidateAsk[]`, `CandidateToken[]`, `CandidateInterviewEntity[]`
- brouillons de correction manuelle: `manualIsCorrect`, `manualCorrectionComment`

## 6. Services Et Endpoints

- liste via `ApplicationService.getAllApplicationsByCriteria()` -> `POST /applications/getAllByCriteria`
- creation via `ApplicationService.createApplication()` -> `POST /applications/create`
- edition via `ApplicationService.updateApplication()` -> `POST /applications/update`
- suppression via `ApplicationService.deleteApplication()` -> `POST /applications/delete`
- restauration via `ApplicationService.restoreApplication()` -> `POST /applications/update`
- chargement des reponses enfants via `CandidateAnswersService.getAllByCriteria()` -> `POST /candidateAnswer/getAllByCriteria`
- correction manuelle d'une reponse libre via `CandidateAnswersService.manualCorrect()` -> `POST /candidateAnswer/custom` avec `action: manualCorrection`
- chargement des demandes enfants via `CandidateAskService.getAllByCriteria()` -> `POST /candidateAsk/getAllByCriteria`
- chargement des tokens enfants via `CandidateTokenService.getAllByCriteria()` -> `POST /candidateToken/getAllByCriteria`
- chargement des entretiens enfants via `CandidateInterviewEntityService.getAllByCriteria()` -> `POST /candidateInterview/getAllByCriteria`
- resolution des permissions campagne via `EntityPermissionService` et services de permissions associes
- chargement des FK `sourceToken` et `formVersion` via `SourceTokenService` et `FormVersionService`

## 7. Ce Que Le Backend Doit Envoyer

- Une reponse `applications/getAllByCriteria` avec `items` et `totalCount` ou `count`.
- Des candidatures enrichies avec statut, score quiz et etat de correction manuelle.
- Des sous-endpoints enfants suffisamment stables pour agreger par `applicationId` sans rechargement global trop couteux.
- Une permission campagne exploitable pour determiner le droit `CORRECT_TEST` au niveau d'une candidature.
- Une semantique de statut unique entre la liste et la modale d'edition, aujourd'hui partiellement divergente.

## 8. Entites Metier Impliquees

- `application`
- `candidate_answer`
- `candidate_ask`
- `candidate_token`
- `candidate_interview`
- `source_token`
- `form_version`
- `entity_permission` / permissions campagne

## 9. Questions Ou Ecarts A Qualifier

- [ ] Faut-il aligner les enums de statut entre affichage liste et formulaire d'edition ?
- [ ] Le CRUD brut doit-il vraiment permettre la creation manuelle d'une candidature sans tout le flux public associe ?
- [ ] Les appels avec `user: 1` doivent-ils etre corriges avant d'utiliser cette page en production admin ?

## 10. Recette Manuelle

1. Ouvrir `/dashboard/entities/applications`.
2. Filtrer par `sourceTokenId` puis par `formVersionId`.
3. Ouvrir une candidature avec reponses libres et verifier la correction manuelle.
4. Verifier les sous-onglets `Demandes`, `Tokens` et `Entretiens`.
5. Editer une candidature puis controler le statut envoye.
6. Supprimer puis restaurer une candidature.

## 11. Impact Cible Multi-Occurrences

- [ ] supprimer du contrat cartographie les colonnes legacy retirees de `applications` (`quiz_*`, `interview_*`, `total_evaluation_*`, `application_status`)
- [ ] exposer les nouveaux pointeurs de lecture rapide (`currentApplicationProgressId`, `currentPipelineStageId`, `lastProgressedAt`)
- [ ] documenter les resumes derives `aggregatedQuizScore*` et `aggregatedEvaluationScore*` comme indicateurs calcules, jamais comme source primaire de verite metier
- [ ] documenter `applicationAbandoned`, `abandonedAt`, `abandonReason` et `abandonedFromApplicationProgressId` comme verrou global de candidature avec contexte d'origine auditable
- [ ] documenter `application_quiz_attempt` comme enfant dedie de la candidature, distinct des reponses `candidate_answer`
- [ ] retirer toute ambiguite entre `formVersionId` de candidature et runtime quiz par round
- [ ] preciser que `applicationStatus` ne doit plus etre lu comme la verite detaillee du pipeline, mais comme un resume eventuel derive de `application_progress`
