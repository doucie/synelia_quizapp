# Entities Interview Participant

## 1. Identite

- Routes: `/dashboard/entities/interview-participant` et `/dashboard/entities/interview-participant/:page`
- Guard: `authGuard` au niveau dashboard puis `permissionGuard(['MANAGE_APP_CONFIG'])`
- Fichier TS: `quizapp_front/src/app/pages/dashboard/entities/solo/interview-participant/entities-interview-participant.ts`
- Fichier HTML: `quizapp_front/src/app/pages/dashboard/entities/solo/interview-participant/entities-interview-participant.html`

## 2. Objectif Produit

La page administre les participants rattaches a un entretien, avec un role tres operationnel de suivi de presence: participant assigne, statut online, fin de session et dernier ping. C'est une vue d'administration brute d'un etat temps reel, pas un vrai ecran metier guide.

## 3. Etat Constate

- [x] La page etend `EntityCrudBase` avec un service dedie `InterviewParticipantService`.
- [x] La recherche avancee permet de filtrer par utilisateur, entretien, suppression et plages de dates.
- [x] Les listes utilisateurs et entretiens sont prechargees au `ngOnInit()` via `UserService` et `InterviewService` en `size: 9999`.
- [x] Les modales create/edit proposent une selection par utilisateur et entretien, puis les booleens `isOnline` et `hasFinished`.
- [x] Le tableau expose l'etat de session `isOnline`, `hasFinished`, `lastPingAt`, avec libelles utilisateur et entretien resolus.
- [x] Le service offre plusieurs helpers metier absents de l'UI: `sendPresencePing`, `markOffline`, `updateHasFinished`, `updateStatus`, `createParticipants`, `getByInterviewId`.
- [ ] Les cles de colonnes restent `online`, `finished`, `lastPing`, alors que les champs reels sont `isOnline`, `hasFinished`, `lastPingAt`.
- [x] Les appels service ne partent plus en `user: 1`: ils utilisent l'utilisateur courant resolu par le contexte auth et echouent explicitement si la session manque.
- [x] Le tableau affiche des libelles utilisateur et entretien a partir des catalogues deja charges, au lieu des IDs bruts.
- [ ] Le clic ligne appelle `selectItem(item)`, mais aucun `app-entity-detail-panel` n'est monte dans le template: la selection ne debouche pas sur un vrai panneau de detail.
- [ ] La recherche avancee ne propose ni filtre `isOnline` ni filtre `hasFinished`, pourtant centraux pour la session d'entretien.

## 4. Blocs UI Constates

### 4.1 Header et toolbar

- [x] breadcrumb retour vers `/dashboard/entities`
- [x] recherche rapide `Rechercher...`
- [x] checkbox `Afficher les supprimes`
- [x] bouton `Filtres avances`
- [x] bouton `Nouveau`

### 4.2 Filtres avances

- [x] plage ID `idDe` / `idA`
- [x] select utilisateur depuis `allUsers()`
- [x] select entretien depuis `allInterviews()`
- [x] filtre `isDeleted`
- [x] intervalles `dateCreation*` et `dateModification*`

### 4.3 Tableau principal

- [x] colonnes `id`, `userId`, `interviewId`, `online`, `finished`, `lastPing`, `createdAt`
- [x] rendu des libelles utilisateur et entretien dans la grille et les selecteurs
- [x] badges booleens pour presence et fin de session
- [x] actions edit / delete / restore
- [ ] pas de panneau de detail visible malgre le clic ligne

### 4.4 Modales

- [x] confirmation suppression
- [x] confirmation restauration
- [x] creation participant entretien
- [x] edition participant entretien

## 5. Donnees Affichees Ou Editees

- `id`
- `interviewId`
- `userId`
- `isOnline`
- `hasFinished`
- `lastPingAt`
- `createdAt`
- `updatedAt`
- `isDeleted`

## 6. Services Et Endpoints

- liste CRUD via `InterviewParticipantService.getAllByCriteria()` -> `POST /interviewParticipant/getAllByCriteria`
- creation via `entityCreate()` -> `POST /interviewParticipant/create`
- edition via `entityUpdate()` -> `POST /interviewParticipant/update`
- suppression via `entityDelete()` -> `POST /interviewParticipant/delete`
- restauration via `entityRestore()` -> `POST /interviewParticipant/update`
- recuperation par entretien via `getByInterviewId()` -> `POST /interviewParticipant/getByCriteria`
- creation bulk via `createParticipants()` -> `POST /interviewParticipant/create`
- ping de presence via `sendPresencePing()` -> `POST /interviewParticipant/update`
- mise hors ligne via `markOffline()` -> `POST /interviewParticipant/update`
- mise a jour fin session via `updateHasFinished()` -> `POST /interviewParticipant/update`
- mise a jour complete de statut via `updateStatus()` -> `POST /interviewParticipant/update`

## 7. Ce Que Le Backend Doit Envoyer

- Un `getAllByCriteria` pagine avec `items` ou `item`, `count` ou `totalCount`, suffisamment stable pour le mapping manuel du service.
- Des IDs `userId` et `interviewId` coherents avec les listes chargees en masse par le front.
- Un etat session fiable sur `isOnline`, `hasFinished` et `lastPingAt`.
- Des mises a jour supportant la logique de ping et de presence temps reel.
- Une session authentifiee cote front avant tout appel `InterviewParticipantService`, faute de quoi le service echoue explicitement.

## 8. Entites Metier Impliquees

- `interviewParticipant`
- `interview`
- `user`
- suivi de presence / fin de session pendant un entretien

## 9. Questions Ou Ecarts A Qualifier

- [ ] Faut-il exposer `isOnline` et `hasFinished` dans les filtres avances ?
- [x] Les libelles utilisateur / entretien sont maintenant affiches dans le tableau et les selecteurs.
- [ ] Le detail panel manque-t-il par oubli de template ?
- [x] Les mutations `user: 1` ont ete remplacees par l'utilisateur courant exige par le service.

## 10. Recette Manuelle

1. Ouvrir `/dashboard/entities/interview-participant` avec un compte autorise.
2. Filtrer par utilisateur puis par entretien.
3. Creer un participant et verifier la persistence des IDs selectionnes.
4. Modifier `Online` et `Finished`, puis controler le rendu des badges.
5. Supprimer puis restaurer un participant.
