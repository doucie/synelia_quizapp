# Entities User Permission Overrides

## 1. Identite

- Routes: `/dashboard/entities/user-permission-overrides` et `/dashboard/entities/user-permission-overrides/:page`
- Guard: `authGuard` au niveau dashboard puis `permissionGuard(['MANAGE_APP_CONFIG'])`
- Fichier TS: `quizapp_front/src/app/pages/dashboard/entities/solo/user-permission-overrides/entities-user-permission-overrides.ts`
- Fichier HTML: `quizapp_front/src/app/pages/dashboard/entities/solo/user-permission-overrides/entities-user-permission-overrides.html`

## 2. Objectif Produit

La page administre les surcharges individuelles de permissions utilisateur. Elle expose la table `user_permission_override` en mode CRUD brut, alors que la page `dashboard/user-permissions` fournit deja une experience metier beaucoup plus claire avec etats `default / GRANT / DENY`, plancher `ADMIN` et rattachements groupes dans le meme contexte.

Le slice BL-008 la pose maintenant plus explicitement comme surface technique et renvoie vers `/dashboard/user-permissions` comme page metier de reference pour la gestion quotidienne.

## 3. Etat Constate

- [x] La page etend `EntityCrudBase` avec `UserPermissionOverrideCrudService`.
- [x] Le header annonce maintenant explicitement le statut de surface technique et propose un acces direct a `/dashboard/user-permissions`.
- [x] Les filtres avances couvrent `userId`, `functionality`, `isAllowed` et date de creation, avec selects branches sur les catalogues utilisateur et permissions.
- [x] Le tableau expose `userId`, fonctionnalite, booleen `isAllowed` et date de creation, avec labels utilisateur et permission resolus.
- [x] Les modales create/edit utilisent des selects pour `userId` et `functionality`, au lieu d'une saisie libre.
- [x] Le detail panel expose aussi `createdBy`, `updatedAt`, `updatedBy`.
- [x] Le service envoie creation et edition vers `setOverride()`, ce qui colle au domaine metier d'une surcharge utilisateur.
- [x] Une surface bien plus riche existe deja dans `dashboard/user-permissions`, avec recherche utilisateur, contexte role, tri-etat `default / GRANT / DENY` et gestion conjointe des groupes metiers.
- [ ] La route reste binaire `isAllowed=true/false`, alors que la page specialisee travaille explicitement avec un tri-etat incluant `Par defaut`.
- [ ] La route ne montre ni le role utilisateur, ni les metadonnees d'heritage, ni le plancher immuable `ADMIN` documente sur la page specialisee.
- [ ] La route n'expose aucun filtre ni affichage pour les suppressions/restaurations, bien qu'un flux de restauration existe dans le composant et le service.
- [x] Les cles de colonnes sont alignees sur le DTO reel `functionality` et `isAllowed`.
- [ ] La guard `MANAGE_APP_CONFIG` est decalee par rapport a la vraie surface metier, gardee par `MANAGE_SYSTEM_ROLES`.

## 4. Blocs UI Constates

### 4.1 Header et toolbar

- [x] breadcrumb retour vers `/dashboard/entities`
- [x] sous-texte qui explicite le statut de surface technique
- [x] bouton `Page metier`
- [x] recherche rapide `Rechercher...`
- [x] bouton `Filtres avances`
- [x] bouton `Nouveau`
- [ ] pas de toggle `Afficher les supprimes`

### 4.2 Filtres avances

- [x] plage ID `idDe` / `idA`
- [x] filtre `userId` via catalogue utilisateurs
- [x] filtre `functionality` via catalogue permissions
- [x] filtre `isAllowed`
- [x] date de creation `dateCreation*`
- [ ] pas de filtre `isDeleted`

### 4.3 Tableau principal

- [x] colonnes `id`, `userId`, `functionality`, `isAllowed`, `createdAt`
- [x] rendu des libelles utilisateur et permission a partir des catalogues frontend
- [x] rendu booleen simple `Oui / Non`
- [x] actions edit / delete
- [x] detail panel branche en bas de page
- [x] popup dependances FK branche
- [ ] pas de voie visible pour restaurer une ligne supprimee

### 4.4 Modales

- [x] confirmation suppression
- [x] confirmation restauration presente
- [x] creation surcharge utilisateur
- [x] edition surcharge utilisateur

## 5. Donnees Affichees Ou Editees

- `id`
- `userId`
- `functionality`
- `isAllowed`
- `createdAt`
- `createdBy`
- `updatedAt`
- `updatedBy`

## 6. Services Et Endpoints

- liste CRUD via `UserPermissionOverrideCrudService.getAllByCriteria()` -> `POST /userPermissionOverride/getByCriteria`
- creation via `create()` -> `POST /userPermissionOverride/setOverride`
- edition via `update()` -> `POST /userPermissionOverride/setOverride`
- suppression via `delete()` -> `POST /userPermissionOverride/delete`
- restauration via `restore()` -> `POST /userPermissionOverride/setOverride`

## 7. Ce Que Le Backend Doit Envoyer

- Un `getByCriteria` pagine avec `items` et `count` pour alimenter la grille.
- Des lignes stables sur `userId`, `functionality`, `isAllowed`.
- Une precedence backend claire ou les overrides utilisateur sont appliques avant les heritages de groupe/role pertinents.
- Une protection explicite du plancher `ADMIN` si cette regle produit reste active.

## 8. Entites Metier Impliquees

- `userPermissionOverride`
- `user`
- `systemRolePermission`
- `businessGroup`
- `userBusinessGroup`

## 9. Questions Ou Ecarts A Qualifier

- [x] Le premier garde-fou UX de BL-008 est pose: la route annonce maintenant clairement que `/dashboard/user-permissions` est la page metier de reference.
- [ ] Faut-il aligner cette route sur le tri-etat `Par defaut / Accorder / Refuser` ?
- [ ] Faut-il afficher le role utilisateur et le contexte d'heritage pour faciliter le debug ?
- [ ] Le plancher `ADMIN` doit-il etre bloque aussi dans cette route brute ?
- [ ] La guard doit-elle etre alignee sur `MANAGE_SYSTEM_ROLES` ?

## 10. Recette Manuelle

1. Ouvrir `/dashboard/entities/user-permission-overrides` avec un compte autorise.
2. Verifier que le header annonce la route comme surface technique et que `Page metier` ouvre `/dashboard/user-permissions`.
3. Filtrer par `userId`, fonctionnalite et etat autorise/refuse.
4. Creer une surcharge utilisateur.
5. Modifier la fonctionnalite ou `isAllowed`.
6. Supprimer la surcharge et verifier le comportement de la liste.
