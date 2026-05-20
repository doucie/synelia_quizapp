# Entities Business Group Permissions

## 1. Identite

- Routes: `/dashboard/entities/business-group-permissions` et `/dashboard/entities/business-group-permissions/:page`
- Guard: `authGuard` au niveau dashboard puis `permissionGuard(['MANAGE_APP_CONFIG'])`
- Fichier TS: `quizapp_front/src/app/pages/dashboard/entities/solo/business-group-permissions/entities-business-group-permissions.ts`
- Fichier HTML: `quizapp_front/src/app/pages/dashboard/entities/solo/business-group-permissions/entities-business-group-permissions.html`

## 2. Objectif Produit

La page administre les permissions globales attribuees a un groupe metier. Elle expose une vue brute sur la table de rattachement `business_group_permission`, sans reprendre l'experience plus metier de la page `dashboard/business-groups` qui regroupe permissions, membres et demandes autour d'un groupe.

Le slice BL-008 la pose maintenant plus explicitement comme surface technique et renvoie vers `/dashboard/business-groups` comme page metier de reference pour la gestion quotidienne.

## 3. Etat Constate

- [x] La page etend `EntityCrudBase` avec `BusinessGroupPermissionService`.
- [x] Le header annonce maintenant explicitement le statut de surface technique et propose un acces direct a `/dashboard/business-groups`.
- [x] Les filtres avances couvrent `functionality`, `businessGroupId`, suppression et plages de dates, avec selects branches sur les catalogues frontend.
- [x] Le tableau expose fonctionnalite, groupe metier et date de creation, avec libelles resolus au lieu des codes/IDs bruts.
- [x] Les modales create/edit utilisent des selects pour `functionality` et `businessGroupId`, sans saisie libre.
- [x] Le detail panel et le popup de dependances FK sont montes en bas de page.
- [x] Le service propage l'utilisateur courant, pas de `user: 1` en dur sur cette route.
- [x] Le repo indique que les permissions effectives passent par les rattachements de groupes actifs, et que les lignes soft-delete doivent etre ignorees dans la resolution effective.
- [x] Une surface plus riche existe deja dans `dashboard/business-groups`, avec gestion integree des permissions du groupe, de ses membres et des demandes d'adhesion.
- [x] Les cles de colonnes sont alignees sur `functionality` et `businessGroupId`.
- [x] L'UI charge le catalogue des groupes et le catalogue des permissions pour remplacer la saisie libre et resoudre les libelles de groupe.
- [ ] La route ne montre ni le nom du groupe, ni la categorie fonctionnelle, ni l'effet effectif de la permission.
- [ ] La guard `MANAGE_APP_CONFIG` est decalee par rapport aux surfaces permissions/roles du dashboard, qui utilisent plutot `MANAGE_SYSTEM_ROLES` ou `MANAGE_BUSINESS_GROUPS`.

## 4. Blocs UI Constates

### 4.1 Header et toolbar

- [x] breadcrumb retour vers `/dashboard/entities`
- [x] sous-texte qui explicite le statut de surface technique
- [x] bouton `Page metier`
- [x] recherche rapide `Rechercher...`
- [x] checkbox `Afficher les supprimes`
- [x] bouton `Filtres avances`
- [x] bouton `Nouveau`

### 4.2 Filtres avances

- [x] plage ID `idDe` / `idA`
- [x] filtre `functionality` via catalogue permissions
- [x] filtre `businessGroupId` via catalogue groupes
- [x] filtre `isDeleted`
- [x] intervalles `dateCreation*` et `dateModification*`

### 4.3 Tableau principal

- [x] colonnes `id`, `functionality`, `businessGroupId`, `createdAt`
- [x] rendu des libelles permission et groupe a partir des catalogues frontend
- [x] actions edit / delete / restore
- [x] detail panel branche en bas de page
- [x] popup dependances FK branche

### 4.4 Modales

- [x] confirmation suppression
- [x] confirmation restauration
- [x] creation permission groupe metier
- [x] edition permission groupe metier

## 5. Donnees Affichees Ou Editees

- `id`
- `functionality`
- `businessGroupId`
- `createdAt`
- `updatedAt`
- `isDeleted`

## 6. Services Et Endpoints

- liste CRUD via `BusinessGroupPermissionService.getAllByCriteria()` -> `POST /businessGroupPermission/getByCriteria`
- creation via `create()` -> `POST /businessGroupPermission/create`
- edition via `update()` -> `POST /businessGroupPermission/update`
- suppression via `delete()` -> `POST /businessGroupPermission/delete`
- restauration via `restore()` -> `POST /businessGroupPermission/update`

## 7. Ce Que Le Backend Doit Envoyer

- Un `getByCriteria` pagine avec `items` et `count` pour alimenter la grille.
- Des lignes `businessGroupPermission` stables sur `functionality` et `businessGroupId`.
- Une resolution effective qui ignore les lignes soft-deletees et les adhesions groupe inactives, conformement aux regles repo.
- Un catalogue fonctionnel backend suffisamment strict pour eviter les fautes de saisie en texte libre.

## 8. Entites Metier Impliquees

- `businessGroupPermission`
- `businessGroup`
- catalogue `Functionality`
- resolution des permissions effectives par groupe

## 9. Questions Ou Ecarts A Qualifier

- [x] La saisie libre de `functionality` a ete remplacee par un catalogue controle.
- [x] Le tableau et les formulaires affichent des libelles de groupe au lieu du seul ID.
- [x] Le premier garde-fou UX de BL-008 est pose: la route annonce maintenant clairement que `/dashboard/business-groups` est la page metier de reference.
- [ ] Cette route doit-elle exister alors que `dashboard/business-groups` gere deja ces permissions de facon plus utile ?
- [ ] La guard devrait-elle etre alignee sur les permissions de gestion des groupes ou des roles ?

## 10. Recette Manuelle

1. Ouvrir `/dashboard/entities/business-group-permissions` avec un compte autorise.
2. Verifier que le header annonce la route comme surface technique et que `Page metier` ouvre `/dashboard/business-groups`.
3. Filtrer par `functionality` puis par `businessGroupId`.
4. Creer une permission de groupe et verifier sa persistence.
5. Modifier la fonctionnalite ou le groupe cible.
6. Supprimer puis restaurer une ligne de permission.
