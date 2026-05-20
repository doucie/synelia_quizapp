# Entities System Role Permissions

## 1. Identite

- Routes: `/dashboard/entities/system-role-permissions` et `/dashboard/entities/system-role-permissions/:page`
- Guard: `authGuard` au niveau dashboard puis `permissionGuard(['MANAGE_APP_CONFIG'])`
- Fichier TS: `quizapp_front/src/app/pages/dashboard/entities/solo/system-role-permissions/entities-system-role-permissions.ts`
- Fichier HTML: `quizapp_front/src/app/pages/dashboard/entities/solo/system-role-permissions/entities-system-role-permissions.html`

## 2. Objectif Produit

La page administre les permissions globales de base des roles systeme. Elle reprend les donnees de `system_role_permission` en mode CRUD generique, bien plus brut que la page `dashboard/system-role-permissions` qui structure l'edition par role, categories et toggles immediats.

Le slice BL-008 la pose maintenant plus explicitement comme surface technique et renvoie vers `/dashboard/system-role-permissions` comme page metier de reference pour la gestion quotidienne.

## 3. Etat Constate

- [x] La page etend `EntityCrudBase` avec `SystemRolePermissionCrudService`.
- [x] Le header annonce maintenant explicitement le statut de surface technique et propose un acces direct a `/dashboard/system-role-permissions`.
- [x] Les filtres avances couvrent `systemRole`, `functionality` et la date de creation, avec selects branches sur les catalogues frontend.
- [x] Le tableau expose role systeme, fonctionnalite et date de creation, avec labels resolus au lieu des codes bruts.
- [x] Les modales create/edit utilisent des selects pour `systemRole` et `functionality`, sans saisie libre.
- [x] Le detail panel expose aussi `createdBy`, `updatedAt`, `updatedBy`.
- [x] Le service utilise `addPermission` pour la creation et la restauration, pas le meme endpoint que l'ecran specialise qui s'appuie sur `add`/`remove` atomiques par role.
- [x] Une surface bien plus riche existe deja dans `dashboard/system-role-permissions`, avec onglets `ADMIN` / `RECRUITER`, rappel `SUPER_ADMIN`, categories et toggles immediats.
- [ ] La route ne parle pas du cas `SUPER_ADMIN`, alors que la page specialisee le traite explicitement comme non configurable.
- [ ] La route n'expose aucun filtre ni affichage sur les suppressions/restaurations, bien qu'un flux de restauration reste code dans le composant et le service.
- [x] Les cles de colonnes sont alignees sur le DTO reel `systemRole` et `functionality`.
- [ ] La guard `MANAGE_APP_CONFIG` est incoherente avec la vraie page metier du dashboard, gardee par `MANAGE_SYSTEM_ROLES`.

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
- [x] filtre `systemRole` via catalogue de roles
- [x] filtre `functionality` via catalogue de permissions
- [x] date de creation `dateCreation*`
- [ ] pas de filtre `isDeleted`

### 4.3 Tableau principal

- [x] colonnes `id`, `systemRole`, `functionality`, `createdAt`
- [x] rendu des labels role / fonctionnalite a partir des catalogues frontend
- [x] actions edit / delete
- [x] detail panel branche en bas de page
- [x] popup dependances FK branche
- [ ] pas de voie visible pour restaurer une ligne supprimee

### 4.4 Modales

- [x] confirmation suppression
- [x] confirmation restauration presente
- [x] creation permission role
- [x] edition permission role

## 5. Donnees Affichees Ou Editees

- `id`
- `systemRole`
- `functionality`
- `createdAt`
- `createdBy`
- `updatedAt`
- `updatedBy`

## 6. Services Et Endpoints

- liste CRUD via `SystemRolePermissionCrudService.getAllByCriteria()` -> `POST /systemRolePermission/getByCriteria`
- creation via `create()` -> `POST /systemRolePermission/addPermission`
- edition via `update()` -> `POST /systemRolePermission/update`
- suppression via `delete()` -> `POST /systemRolePermission/delete`
- restauration via `restore()` -> `POST /systemRolePermission/addPermission`

## 7. Ce Que Le Backend Doit Envoyer

- Un `getByCriteria` pagine avec `items` et `count` pour alimenter la grille.
- Des lignes stables sur `systemRole` et `functionality`.
- Une enforcement forte sur la gestion des roles systeme, independamment de la guard front incoherente de cette route.
- Si la suppression logique existe vraiment, un contrat clair sur la restauration via `addPermission`.

## 8. Entites Metier Impliquees

- `systemRolePermission`
- catalogue `Functionality`
- roles systeme `ADMIN`, `RECRUITER`, `SUPER_ADMIN`

## 9. Questions Ou Ecarts A Qualifier

- [x] Le premier garde-fou UX de BL-008 est pose: la route annonce maintenant clairement que `/dashboard/system-role-permissions` est la page metier de reference.
- [ ] Cette route doit-elle etre alignee sur `MANAGE_SYSTEM_ROLES` comme la page specialisee ?
- [ ] `SUPER_ADMIN` doit-il etre protege aussi explicitement ici ?
- [ ] La restauration est-elle vraiment supportee ou faut-il retirer ce flux mort ?
- [x] La saisie libre a ete remplacee par les catalogues frontend de roles et permissions.

## 10. Recette Manuelle

1. Ouvrir `/dashboard/entities/system-role-permissions` avec un compte autorise.
2. Verifier que le header annonce la route comme surface technique et que `Page metier` ouvre `/dashboard/system-role-permissions`.
3. Filtrer par role et fonctionnalite.
4. Creer une permission de role.
5. Modifier le role ou la fonctionnalite.
6. Supprimer la permission et verifier le comportement de la liste.
