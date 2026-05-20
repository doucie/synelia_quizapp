# Entities Interviews

## 1. Identite

- Routes: `/dashboard/entities/interviews` et `/dashboard/entities/interviews/:page`
- Guard: `authGuard` au niveau dashboard puis `permissionGuard(['MANAGE_APP_CONFIG'])`
- Fichier TS: `quizapp_front/src/app/pages/dashboard/entities/solo/interviews/entities-interviews.ts`
- Fichier HTML: `quizapp_front/src/app/pages/dashboard/entities/solo/interviews/entities-interviews.html`

## 2. Objectif Produit

La page expose le CRUD technique des entretiens avec une vue d'expansion centrée sur les membres habilites sur l'entretien et les liaisons candidat-entretien.

## 3. Etat Constate

- [x] La page etend `EntityCrudBase` mais enrichit la ligne d'entretien avec deux sous-onglets enfants.
- [x] Les filtres avances couvrent ID, campagne, candidature, suppression et dates.
- [x] Les lignes affichent type, date, lieu/lien, statut, campagne et candidature.
- [x] Le rendu `Lieu / Lien` depend du `interviewType`: `meetLink` en ligne, `interviewLocation` en presentiel.
- [x] L'expansion charge deux familles de donnees: permissions membres sur l'entretien et liaisons `candidateInterview`.
- [x] Les permissions membres sont reconstruites cote front a partir de `EntityPermissionService.getForEntity('INTERVIEW', id)`.
- [x] Les modales create/edit permettent type, date, lien ou lieu, statut, notes et campagne.
- [x] La restauration est supportee.
- [ ] La page affiche et filtre `applicationId`, mais les modales create/edit n'exposent pas la liaison candidature.
- [ ] Le mapping des permissions enfants requalifie `MANAGE_APP_CONFIG` en badge `Admin`, ce qui merite validation metier.

## 4. Blocs UI Constates

### 4.1 Header et filtres

- [x] recherche rapide
- [x] checkbox `Afficher les entretiens supprimes`
- [x] filtres avances sur ID, campagne, candidature, suppression, dates

### 4.2 Tableau principal

- [x] colonnes `id`, `date`, `type`, `location`, `status`, `campaign`, `application`
- [x] badges type et statut
- [x] lien cliquable vers `meetLink`
- [x] actions edit / delete / restore / expansion

### 4.3 Sous-onglets d'expansion

- [x] `Membres`: badges `Admin`, `Evaluer`, `Planifier`, `Commenter`
- [x] `Candidats`: liaisons `candidateInterview` avec heure de debut et duree

### 4.4 Modales

- [x] confirmation suppression / restauration
- [x] edition entretien
- [x] creation entretien

## 5. Donnees Affichees Ou Editees

- `interviewType`
- `interviewDate`
- `meetLink` ou `interviewLocation`
- `interviewStatus`
- `interviewNote`
- `campaignId`
- `applicationId` en lecture/filtre mais pas en edition UI
- permissions enfants par `userId`
- liaisons `CandidateInterviewEntity`

## 6. Services Et Endpoints

- liste via `InterviewService.getAllInterviewsByCriteria()` -> `POST /interviews/getAllByCriteria`
- creation via `InterviewService.createInterview()` -> `POST /interviews/create`
- edition via `InterviewService.updateInterview()` -> `POST /interviews/update`
- suppression via `InterviewService.deleteInterview()` -> `POST /interviews/delete`
- restauration via `InterviewService.restoreInterview()` -> `POST /interviews/update`
- chargement des permissions de l'entretien via `EntityPermissionService.getForEntity()` -> `POST /entityPermission/getForEntity`
- chargement des liaisons candidat via `CandidateInterviewEntityService.getAllByCriteria()` -> `POST /candidateInterview/getAllByCriteria`
- chargement FK campagnes via `CampaignService.getAllCampaignsByCriteria()`
- chargement FK candidatures via `ApplicationService.getAllApplicationsByCriteria()`

## 7. Ce Que Le Backend Doit Envoyer

- Une reponse `interviews/getAllByCriteria` paginee et stable.
- Des champs d'entretien assez riches pour distinguer ligne en ligne / presentiel sans logique supplementaire.
- Des permissions d'entite normalisees par `permissionKey` et `granted`.
- Des liaisons `candidateInterview` pouvant etre chargees uniquement par `interviewId`.
- Une strategie claire sur le rattachement `applicationId`, actuellement consultable mais non editable depuis les modales.

## 8. Entites Metier Impliquees

- `interview`
- `candidate_interview`
- `entity_permission`
- `campaign`
- `application`

## 9. Questions Ou Ecarts A Qualifier

- [ ] La relation candidature-entretien doit-elle etre editable directement dans ce CRUD ?
- [ ] Le badge `Admin` base sur `MANAGE_APP_CONFIG` est-il le bon mapping pour un entretien ?
- [ ] Faut-il afficher aussi les utilisateurs reels des permissions au lieu de `Utilisateur #id` ?

## 10. Recette Manuelle

1. Ouvrir `/dashboard/entities/interviews`.
2. Filtrer par campagne puis candidature.
3. Creer un entretien `ONLINE` puis verifier l'affichage du lien.
4. Modifier un entretien `IN_PERSON` puis verifier le lieu.
5. Ouvrir l'expansion et verifier les badges membres et les liaisons candidats.
6. Supprimer puis restaurer un entretien.
