# Entities Entity Permissions

## 1. Identite

- Routes: `/dashboard/entities/entity-permissions` et `/dashboard/entities/entity-permissions/:page`
- Guard: `authGuard` au niveau dashboard puis `permissionGuard(['MANAGE_APP_CONFIG'])`
- Fichier TS: `quizapp_front/src/app/pages/dashboard/entities/solo/entity-permissions/entities-entity-permissions.ts`
- Fichier HTML: `quizapp_front/src/app/pages/dashboard/entities/solo/entity-permissions/entities-entity-permissions.html`

## 2. Objectif Produit

La page administre les permissions scopees par entite. C'est une surface centrale pour les droits campagnes, entretiens et autres entites ciblees, mais l'UI reste un CRUD brut oriente base de donnees, sans les garde-fous produit ni les libelles contextuels attendus sur une surface d'acces sensible.

## 3. Etat Constate

- [x] La page etend `EntityCrudBase` avec `EntityPermissionCrudService`.
- [x] Les filtres avances couvrent `entityType`, `entityId`, `permissionKey`, `userId`, `businessGroupId`, `systemRole`, suppression et date de creation.
- [x] Le tableau expose type/entite ciblee, permission, cibles utilisateur/groupe/role et date de creation, avec labels resolus au lieu des IDs/codes bruts quand les catalogues sont disponibles.
- [x] Les modales create/edit utilisent des selects controles pour `entityType`, `permissionKey`, `userId`, `businessGroupId`, `systemRole` et `entityId` lorsque le catalogue du type choisi est charge.
- [x] Le detail panel est plus riche que le tableau et expose aussi `createdBy`, `updatedAt`, `updatedBy`.
- [x] Le service normalise les retours snake_case/camelCase et expose aussi `granted`, `userFirstName`, `userLastName`, `userEmail`, `userName`, `userRole`.
- [x] Le service utilise `grant` aussi bien pour la creation que pour la mise a jour, et meme pour la restauration logique.
- [x] Le repo indique que `entity_permission` est la source de verite pour les acces scopes et que la resolution combine utilisateur direct, groupes actifs et role systeme.
- [ ] La route n'expose toujours pas explicitement `granted`, meme si les metadonnees utilisateur normalisees servent maintenant a resoudre le libelle utilisateur dans la grille.
- [x] La route ne demande plus de valeurs textuelles libres pour `entityType`, `permissionKey` et `systemRole`: ces champs passent par des selects alignes sur les enums backend.
- [x] La route guide maintenant les cles de permission courtes attendues (`ADMIN`, `CREATOR`, `UPDATE`, `DELETE`, `EVALUATE`, `CORRECT_TEST`, `PLANIFY`, `ADVANCE_PIPELINE`, `FOLLOW`) via un select dedie.
- [ ] La guard `MANAGE_APP_CONFIG` est decalee par rapport au domaine reel de gestion des permissions.

## 4. Blocs UI Constates

### 4.1 Header et toolbar

- [x] breadcrumb retour vers `/dashboard/entities`
- [x] recherche rapide `Rechercher...`
- [x] checkbox `Afficher les supprimes`
- [x] bouton `Filtres avances`
- [x] bouton `Nouveau`

### 4.2 Filtres avances

- [x] plage ID `idDe` / `idA`
- [x] filtre `entityType` via select enum backend
- [x] filtre `entityId` via select dependante du type d'entite, avec fallback numerique si aucun catalogue n'est disponible
- [x] filtre `permissionKey` via select enum backend
- [x] filtre `userId` via select utilisateur
- [x] filtre `businessGroupId` via select groupe metier
- [x] filtre `systemRole` via select role systeme
- [x] filtre `isDeleted`
- [x] date de creation `dateCreation*`

### 4.3 Tableau principal

- [x] colonnes `id`, `entityType`, `entityId`, `permission`, `userId`, `businessGroupId`, `systemRole`, `createdAt`
- [x] labels resolus dans la grille pour `entityType`, `entityId`, `permissionKey`, `userId`, `businessGroupId`, `systemRole`
- [x] actions edit / delete / restore
- [x] detail panel branche en bas de page
- [x] popup dependances FK branche

### 4.4 Modales

- [x] confirmation suppression
- [x] confirmation restauration
- [x] creation permission entite avec selects controles et cible unique utilisateur/groupe/role facilitee
- [x] edition permission entite avec selects controles et cible unique utilisateur/groupe/role facilitee

## 5. Donnees Affichees Ou Editees

- `id`
- `entityType`
- `entityId`
- `permissionKey`
- `userId`
- `businessGroupId`
- `systemRole`
- `granted`
- `userFirstName`
- `userLastName`
- `userEmail`
- `userName`
- `userRole`
- `createdAt`
- `createdBy`
- `updatedAt`
- `updatedBy`
- `isDeleted`

## 6. Services Et Endpoints

- liste CRUD via `EntityPermissionCrudService.getAllByCriteria()` -> `POST /entityPermission/getByCriteria`
- creation via `create()` -> `POST /entityPermission/grant`
- edition via `update()` -> `POST /entityPermission/grant`
- suppression via `delete()` -> `POST /entityPermission/delete`
- restauration via `restore()` -> `POST /entityPermission/grant`

## 7. Ce Que Le Backend Doit Envoyer

- Un `getByCriteria` pagine avec `items` et `count` pour alimenter la grille.
- Des retours coherents en snake_case ou camelCase, puisque le service accepte les deux.
- Une validation forte de `entityType`, `permissionKey` et `systemRole` via les enums backend.
- Des catalogues chargeables pour les entites scopees supportees (`CAMPAIGN`, `INTERVIEW`, `APPLICATION`, `QUIZ`, `FORM`) afin que l'UI puisse resoudre `entityId` sans saisie brute dans les cas courants.
- Des droits effectifs calcules en ignorant les lignes soft-deletees, les memberships groupes inactifs et les overrides denies pertinents.
- Des metadonnees utilisateur quand la permission cible un utilisateur direct, pour permettre un affichage plus utile si l'UI evolue.

## 8. Entites Metier Impliquees

- `entityPermission`
- campagnes, entretiens et autres entites scopees
- `businessGroupPermission`
- `userPermissionOverride`
- resolution effective des acces scopes

## 9. Questions Ou Ecarts A Qualifier

- [x] Les champs texte libres critiques sont remplaces par des enums/selects controles pour `entityType`, `permissionKey`, `systemRole`, `userId`, `businessGroupId` et `entityId` quand le catalogue cible est connu.
- [ ] Faut-il afficher les metadonnees utilisateur et `granted` dans cette route ?
- [x] La route documente maintenant les cles courtes via le catalogue frontend branche sur les enums backend.
- [ ] La guard doit-elle etre alignee sur une permission de gestion des acces plutot que `MANAGE_APP_CONFIG` ?

## 10. Recette Manuelle

1. Ouvrir `/dashboard/entities/entity-permissions` avec un compte autorise.
2. Filtrer par `entityType`, `entityId` et `permissionKey`.
3. Creer une permission ciblee pour un utilisateur, un groupe ou un role.
4. Modifier la cible ou la cle de permission.
5. Supprimer puis restaurer la permission.
