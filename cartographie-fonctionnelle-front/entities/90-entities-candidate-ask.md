# Entities Candidate Ask

## 1. Identite

- Routes: `/dashboard/entities/candidate-ask` et `/dashboard/entities/candidate-ask/:page`
- Guard: `authGuard` au niveau dashboard puis `permissionGuard(['MANAGE_APP_CONFIG'])`
- Fichier TS: `quizapp_front/src/app/pages/dashboard/entities/solo/candidate-ask/entities-candidate-ask.ts`
- Fichier HTML: `quizapp_front/src/app/pages/dashboard/entities/solo/candidate-ask/entities-candidate-ask.html`

## 2. Objectif Produit

La page administre les demandes de correction candidate (`IDENTITY`, `EMAIL`, `PHONE`) soumises depuis le suivi public de candidature. En plus du CRUD standard, elle porte un vrai flux de revue manuelle `approve/reject` pour appliquer ou refuser la correction.

## 3. Etat Constate

- [x] La page etend `EntityCrudBase` mais ajoute sa propre logique de revue (`reviewTarget`, confirmations, motif de refus, loading par ligne).
- [x] La recherche rapide filtre via `search_string`.
- [x] Les filtres avances couvrent ID, candidature, suppression et intervalles de dates.
- [x] Le tableau expose type de demande, statut resolu, identite/contact cible, motif et date de creation.
- [x] Les demandes `PENDING` affichent des actions specifiques `Valider` et `Refuser`.
- [x] Le refus impose un `decisionReason` non vide avant appel du backend.
- [x] La page supporte aussi create/edit/delete/restore comme un CRUD admin classique.
- [ ] L'UI n'expose aucun filtre avance sur `requestType` ni sur le statut, alors que la table affiche ces informations et que le service supporte deja `requestType`.
- [ ] Les modales create/edit utilisent un champ texte libre pour `requestType` au lieu d'un select borne a `IDENTITY|EMAIL|PHONE`.
- [ ] Le statut affiche peut etre deduit de `isVerified` quand `askStatus` manque, ce qui masque un eventuel etat backend incomplet.
- [ ] La modale d'edition ne permet pas de revoir `askStatus` ou `decisionReason`, alors que ces champs existent dans le parcours de rejet.

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
- [x] filtre `isDeleted`
- [x] intervalles `dateCreation*` et `dateModification*`

### 4.3 Tableau principal

- [x] colonnes `id`, `applicationId`, `type`, `status`, `firstName`, `lastName`, `email`, `phone`, `decisionReason`, `createdAt`
- [x] badges de statut derives via `getResolvedAskStatus()`
- [x] boutons `Valider` / `Refuser` reserves aux lignes `PENDING`
- [x] actions edit / delete ou restore selon `isDeleted`
- [x] detail panel branche en bas de page

### 4.4 Modales et dialogs metier

- [x] confirmation de validation
- [x] dialog de refus avec textarea `Motif de refus`
- [x] confirmation suppression
- [x] confirmation restauration
- [x] creation demande candidat
- [x] edition demande candidat

## 5. Donnees Affichees Ou Editees

- `id`
- `applicationId`
- `requestType`
- `askStatus`
- `isVerified`
- `firstName`, `lastName`
- `newEmail`, `newPhone`
- `decisionReason`
- `isDeleted`
- `createdAt`

## 6. Services Et Endpoints

- liste via `CandidateAskService.getAllByCriteria()` -> `POST /candidateAsk/getAllByCriteria`
- chargement des candidatures pour filtres/selects via `ApplicationService.getAllApplicationsByCriteria()`
- creation via `CandidateAskService.create()` -> `POST /candidateAsk/create`
- edition via `CandidateAskService.update()` -> `POST /candidateAsk/update`
- suppression via `CandidateAskService.delete()` -> `POST /candidateAsk/delete`
- restauration via `CandidateAskService.restore()` -> `POST /candidateAsk/update`
- revue metier via `CandidateAskService.review()` -> `POST /candidateAsk/custom`

## 7. Ce Que Le Backend Doit Envoyer

- Des `candidateAsk` normalisables depuis camelCase ou snake_case (`request_type`, `ask_status`, `is_verified`, etc.).
- Des valeurs de type bornees a `IDENTITY`, `EMAIL`, `PHONE`.
- Des valeurs de statut bornees a `PENDING`, `APPROVED`, `REJECTED`.
- Un endpoint `custom` qui applique la decision de revue, persiste `decisionReason` et porte l'effet metier sur la candidature.
- Un backend de revue capable de declencher la notification de resultat candidat une fois la demande traitee.

## 8. Entites Metier Impliquees

- `candidateAsk`
- `application`
- suivi public de candidature (`track-application`)
- notification de resultat de demande candidat

## 9. Questions Ou Ecarts A Qualifier

- [ ] Le create/edit admin doit-il proposer un vrai select enum pour `requestType` ?
- [ ] Le statut doit-il rester inferable depuis `isVerified`, ou faut-il exiger un `askStatus` explicite partout ?
- [ ] L'edition directe de `isVerified` hors flux `approve/reject` est-elle encore souhaitable ?
- [ ] Faut-il exposer `decisionReason` et le statut dans l'edition standard pour garder un historique coherent ?

## 10. Recette Manuelle

1. Ouvrir `/dashboard/entities/candidate-ask` avec un compte autorise.
2. Filtrer les demandes d'une candidature puis identifier une ligne `PENDING`.
3. Valider une demande et verifier le rechargement de la liste.
4. Refuser une autre demande avec un motif obligatoire.
5. Editer une demande existante puis verifier le badge de statut.
6. Supprimer puis restaurer une ligne.
