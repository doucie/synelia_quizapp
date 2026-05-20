# Dashboard Business Groups

## 1. Identite

- Route: `/dashboard/business-groups`
- Guard: `permissionGuard(['MANAGE_SYSTEM_ROLES'])`
- Menu dashboard: expose la page avec `MANAGE_BUSINESS_GROUPS`
- Fichier TS: `quizapp_front/src/app/pages/dashboard/business-groups/business-groups.ts`
- Fichier HTML: `quizapp_front/src/app/pages/dashboard/business-groups/business-groups.html`

## 2. Objectif Produit

La page sert a gerer les groupes metiers, leurs permissions collectives, leurs membres et les demandes d'adhesion en attente.

## 3. Etat Constate

- [x] La page fonctionne avec deux modes: liste des groupes puis edition detaillee d'un groupe.
- [x] Un groupe peut etre cree, modifie ou supprime depuis la vue liste.
- [x] La vue edition se decoupe en onglets `Informations`, `Permissions`, `Membres`, `Demandes`.
- [x] Les permissions du groupe reutilisent le meme catalogue `PERMISSION_CATEGORIES` que les autres surfaces admin.
- [x] Les membres du groupe sont geres par affectation ou retrait via `assignUser` / `removeUser`.
- [x] Les demandes en attente sont chargees via `GroupChangeRequestService` puis approuvees ou rejetees.
- [x] La creation d'un groupe n'ouvre d'abord que l'onglet `Informations`; les autres onglets apparaissent apres persistance.
- [ ] Ecart a verifier: le menu dashboard semble exiger `MANAGE_BUSINESS_GROUPS`, alors que la route elle-meme est gardee par `MANAGE_SYSTEM_ROLES`.
- [ ] Verifier si l'ajout de membre par simple `ID utilisateur` reste acceptable UX et securite.

## 4. Blocs UI Constates

### 4.1 Vue liste

- [x] titre `Groupes metiers`
- [x] bouton `Actualiser`
- [x] bouton `Nouveau groupe`
- [x] cartes groupe avec nom, description et nombre de membres
- [x] actions `Modifier` et `Supprimer`

### 4.2 Vue edition

- [x] bouton retour liste
- [x] titre dynamique du groupe
- [x] onglets `Informations`, `Permissions`, `Membres`, `Demandes`

### 4.3 Onglet Informations

- [x] nom du groupe
- [x] description
- [x] bouton `Creer / Enregistrer`

### 4.4 Onglet Permissions

- [x] categories de permissions
- [x] cases a cocher par fonctionnalite

### 4.5 Onglet Membres

- [x] ajout par `ID utilisateur`
- [x] liste des membres
- [x] badge `Moderateur` si present
- [x] retrait de membre

### 4.6 Onglet Demandes

- [x] affichage des demandes `PENDING`
- [x] nom, email, raison
- [x] actions `Approuver` / `Refuser`

## 5. Donnees Affichees Ou Editees

### 5.1 Groupe

- `id`
- `groupName`
- `groupDesc`
- `createdAt`
- `userCount`
- `permissionCount`

### 5.2 Permissions du groupe

- `businessGroupId`
- `functionality`

### 5.3 Membres

- `userId`
- `userFirstName`
- `userLastName`
- `userEmail`
- `isModerator`

### 5.4 Demandes de changement

- `id`
- `userId`
- `userName`
- `userEmail`
- `reason`
- `status`
- `targetGroupId`

## 6. Services Et Endpoints

- liste groupes via `POST /businessGroup/getByCriteria`
- creation via `POST /businessGroup/create`
- mise a jour via `POST /businessGroup/update`
- suppression via `POST /businessGroup/delete`
- chargement des permissions via `POST /businessGroup/getPermissions`
- ajout ou retrait d'une permission via `POST /businessGroup/addPermission` et `POST /businessGroup/removePermission`
- chargement des membres via `POST /businessGroup/getUsersInGroup`
- ajout ou retrait d'un membre via `POST /businessGroup/assignUser` et `POST /businessGroup/removeUser`
- chargement des demandes via `GroupChangeRequestService.getAllByCriteria()` -> `/groupChangeRequest/getAllByCriteria`
- approbation ou refus via `GroupChangeRequestService.approve()` / `reject()` -> `POST /groupChangeRequest/update`

## 7. Ce Que Le Backend Doit Envoyer

- Une liste de groupes avec au moins nom, description et compteurs de membres si l'UI doit les afficher.
- Une lecture fiable des permissions d'un groupe et des membres effectivement rattaches.
- Un modele de demande de groupe capable de lier utilisateur, groupe cible, raison et statut.
- Une enforcement serveur coherente entre droits de gestion des groupes et droits de gestion des roles, afin d'eviter la divergence visible entre menu et guard.

## 8. Entites Metier Impliquees

- `businessGroup`
- `businessGroupPermission`
- `userBusinessGroup`
- `groupChangeRequest`
- catalogue `Functionality`

## 9. Questions Ou Ecarts A Qualifier

- [ ] Faut-il aligner menu et guard sur une meme permission source de verite ?
- [ ] L'ajout de membres doit-il proposer une recherche utilisateur plutot qu'une saisie d'ID brute ?
- [ ] La suppression d'un groupe doit-elle etre bloquee si des demandes ou permissions actives subsistent ?

## 10. Recette Manuelle

1. Ouvrir `/dashboard/business-groups` avec un utilisateur autorise.
2. Creer un groupe puis enregistrer.
3. Ajouter ou retirer une permission du groupe.
4. Ajouter un membre puis le retirer.
5. Traiter une demande d'adhesion en attente.
6. Verifier l'effet reel du groupe sur les permissions effectives d'un utilisateur rattache.