# Entities Users

## 1. Identite

- Routes: `/dashboard/entities/users` et `/dashboard/entities/users/:page`
- Guard: `authGuard` au niveau dashboard puis `permissionGuard(['MANAGE_APP_CONFIG'])`
- Fichier TS: `quizapp_front/src/app/pages/dashboard/entities/solo/users/entities-users.ts`
- Fichier HTML: `quizapp_front/src/app/pages/dashboard/entities/solo/users/entities-users.html`

## 2. Objectif Produit

La page fournit une administration brute des comptes utilisateurs, distincte de la page dashboard `/dashboard/users`, avec filtres avances, edition directe, restauration et controle manuel du statut `en ligne`.

## 3. Etat Constate

- [x] La page n'utilise pas `EntityCrudBase`; elle embarque sa propre logique CRUD, pagination et detail panel.
- [x] La recherche rapide filtre par `search_string`.
- [x] Les filtres avances couvrent ID, nom, prenom, pseudo, email, telephone, role, statut en ligne, suppression et intervalles de dates.
- [x] Le tableau expose un badge de role et un bouton cliquable pour basculer `isOnline`.
- [x] Le select `Par page` persiste a la fois en localStorage et via le backend sur `pageSizePreference` du user courant.
- [x] Les modales create/edit exposent nom, prenom, pseudo, email, telephone et role.
- [x] La restauration est supportee pour les users supprimes.
- [x] Le panneau de detail permet edition, suppression, restauration et sauvegarde directe.
- [ ] Le message de suppression parle d'action `definitive`, alors que la page expose ensuite une restauration.
- [ ] La creation assigne un mot de passe temporaire hardcode `temp123!` sans l'afficher dans l'UI.

## 4. Blocs UI Constates

### 4.1 Header et toolbar

- [x] breadcrumb retour vers `/dashboard/entities`
- [x] recherche rapide `Rechercher un utilisateur...`
- [x] checkbox `Afficher les utilisateurs supprimes`
- [x] bouton `Filtres avances`
- [x] bouton `Nouvel utilisateur`

### 4.2 Filtres avances

- [x] plage ID `idDe` / `idA`
- [x] nom, prenom, pseudo
- [x] email, telephone
- [x] role
- [x] statut `isOnline`
- [x] filtre `isDeleted`
- [x] intervalles `dateCreation*` et `dateModification*`

### 4.3 Tableau principal

- [x] colonnes `id`, `nom`, `prenom`, `pseudo`, `email`, `telephone`, `role`, `status`, `createdAt`
- [x] manager de visibilite de colonnes
- [x] detail panel sur clic ligne
- [x] toggle `En ligne` / `Hors ligne`
- [x] actions edit / delete ou restore selon `isDeleted`

### 4.4 Modales

- [x] confirmation suppression
- [x] confirmation restauration
- [x] creation utilisateur
- [x] edition utilisateur

## 5. Donnees Affichees Ou Editees

- `id`
- `nom`, `prenom`, `pseudo`
- `email`, `telephone`
- `role`
- `isOnline`
- `isDeleted`
- `dateCreation`, `derniereConnexion`
- `pageSizePreference` du user courant

## 6. Services Et Endpoints

- liste active via `UserService.getByCriteria()` -> `POST /user/getByCriteria`
- liste incluant supprimes via `UserService.getAllUsersByCriteria()` -> `POST /user/getAllByCriteria`
- lecture du user courant pour preference page size via `UserService.getById()` -> re-utilise `POST /user/getByCriteria`
- creation via `UserService.create()` -> `POST /user/create`
- edition via `UserService.update()` -> `POST /user/update`
- suppression via `UserService.delete()` -> `POST /user/delete`
- restauration via `UserService.restore()` -> `POST /user/updateAll`
- bascule du statut en ligne via `UserService.updateOnlineStatus()` -> `PUT /user/:id/online-status?isOnline=...`
- sauvegarde de la preference pagination via `UserService.updatePageSizePreference()` -> `PUT /user/update-page-size-preference`

## 7. Ce Que Le Backend Doit Envoyer

- Une reponse `getByCriteria` / `getAllByCriteria` avec `items` ou `item`, plus `totalCount` ou `count`.
- Des users normalisables depuis les variantes backend `firstName/lastName/username/phone` vers `prenom/nom/pseudo/telephone`.
- Un `isDeleted` coherent pour permettre le switch entre liste active et liste incluant supprimes.
- Un endpoint `online-status` capable de gerer le toggle direct en tableau.
- Un stockage `pageSizePreference` sur le compte utilisateur courant.
- Un flux de creation qui assume aujourd'hui un mot de passe temporaire impose par le front.

## 8. Entites Metier Impliquees

- `user`
- session utilisateur courante
- preference de pagination utilisateur

## 9. Questions Ou Ecarts A Qualifier

- [ ] Le mot de passe temporaire `temp123!` doit-il etre conserve, expose, ou remplace par un flux d'invitation ?
- [ ] Le toggle `isOnline` doit-il vraiment etre manipulable manuellement depuis l'admin ?
- [ ] Le wording de suppression doit-il etre corrige, puisque la restauration existe ?

## 10. Recette Manuelle

1. Ouvrir `/dashboard/entities/users` avec un compte autorise.
2. Changer la pagination et verifier la persistance apres rechargement.
3. Filtrer par role, statut en ligne et dates.
4. Creer un utilisateur, puis le modifier.
5. Basculer son statut en ligne puis verifier le badge.
6. Supprimer puis restaurer un utilisateur.
