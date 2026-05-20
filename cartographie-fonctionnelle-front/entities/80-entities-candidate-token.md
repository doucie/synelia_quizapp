# Entities Candidate Token

## 1. Identite

- Routes: `/dashboard/entities/candidate-token` et `/dashboard/entities/candidate-token/:page`
- Guard: `authGuard` au niveau dashboard puis `permissionGuard(['MANAGE_APP_CONFIG'])`
- Fichier TS: `quizapp_front/src/app/pages/dashboard/entities/solo/candidate-token/entities-candidate-token.ts`
- Fichier HTML: `quizapp_front/src/app/pages/dashboard/entities/solo/candidate-token/entities-candidate-token.html`

## 2. Objectif Produit

La page fournit un CRUD admin brut des tokens rattaches aux candidatures. Elle duplique en version standalone une partie du besoin deja visible via l'onglet enfant `tokens` de la page `/dashboard/entities/applications`.

## 3. Etat Constate

- [x] La page etend `EntityCrudBase`.
- [x] La recherche rapide filtre via `search_string`.
- [x] Les filtres avances couvrent ID, candidature, suppression et intervalles de dates.
- [x] Le tableau expose `id`, `applicationId`, `tokenString`, `createdAt`.
- [x] Les modales create/edit permettent d'associer une candidature et de saisir le token.
- [x] La restauration des lignes supprimees est supportee.
- [ ] Le token est affiche en clair dans le tableau et dans les modales.
- [ ] Les mutations `create/update/delete/restore` envoient `user: 1` en dur, alors que la liste recupere l'utilisateur courant depuis le localStorage.
- [ ] Le contexte metier reste faible dans les formulaires: les selects d'application affichent surtout `candidateEmail`.

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

- [x] colonnes `id`, `applicationId`, `token`, `createdAt`
- [x] manager de visibilite de colonnes
- [x] clic ligne via `selectItem(item)`
- [x] actions edit / delete ou restore selon `isDeleted`

### 4.4 Modales

- [x] confirmation suppression
- [x] confirmation restauration
- [x] creation token candidat
- [x] edition token candidat

## 5. Donnees Affichees Ou Editees

- `id`
- `applicationId`
- `tokenString`
- `isDeleted`
- `createdAt`
- `candidateEmail` utilise pour choisir la candidature en create/edit

## 6. Services Et Endpoints

- liste via `CandidateTokenService.getAllByCriteria()` -> `POST /candidateToken/getAllByCriteria`
- chargement des candidatures pour filtres/selects via `ApplicationService.getAllApplicationsByCriteria()`
- creation via `CandidateTokenService.create()` -> `POST /candidateToken/create`
- edition via `CandidateTokenService.update()` -> `POST /candidateToken/update`
- suppression via `CandidateTokenService.delete()` -> `POST /candidateToken/delete`
- restauration via `CandidateTokenService.restore()` -> `POST /candidateToken/update`

## 7. Ce Que Le Backend Doit Envoyer

- Une reponse paginee `getAllByCriteria` avec `items` ou `item`, plus `totalCount` ou `count`.
- Des `candidateToken` contenant au minimum `id`, `applicationId`, `tokenString`, `isDeleted`, `createdAt`.
- Une liste de candidatures active pour alimenter les selects et filtres FK.
- Un contrat coherent entre la route standalone et les autres surfaces qui consomment ces tokens cote admin.

## 8. Entites Metier Impliquees

- `candidateToken`
- `application`
- administration brute des tokens deja relies aux candidatures

## 9. Questions Ou Ecarts A Qualifier

- [ ] Le token doit-il rester visible en clair, ou seulement copiable / masque ?
- [ ] Les mutations doivent-elles reutiliser l'utilisateur connecte plutot que `1` ?
- [ ] La route standalone apporte-t-elle encore une vraie valeur par rapport au sous-onglet `tokens` de `applications` ?

## 10. Recette Manuelle

1. Ouvrir `/dashboard/entities/candidate-token` avec un compte autorise.
2. Filtrer par candidature et par statut supprime.
3. Creer un token rattache a une candidature.
4. Modifier le `tokenString` existant.
5. Supprimer puis restaurer une ligne.
