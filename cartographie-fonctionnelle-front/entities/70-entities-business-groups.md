# Entities Business Groups

## 1. Identite

- Routes: `/dashboard/entities/business-groups` et `/dashboard/entities/business-groups/:page`
- Guard: `authGuard` au niveau dashboard puis `permissionGuard(['MANAGE_APP_CONFIG'])`
- Fichier TS: `quizapp_front/src/app/pages/dashboard/entities/solo/business-groups/entities-business-groups.ts`
- Fichier HTML: `quizapp_front/src/app/pages/dashboard/entities/solo/business-groups/entities-business-groups.html`

## 2. Objectif Produit

La page administre les groupes metier bruts et agrege, par expansion, leurs permissions associees et leurs membres lies.

Le slice BL-008 la pose maintenant plus explicitement comme surface technique et renvoie vers `/dashboard/business-groups` comme page metier de reference pour la gestion quotidienne du domaine.

## 3. Etat Constate

- [x] La page etend `EntityCrudBase`.
- [x] Le header annonce maintenant explicitement le statut de surface technique et propose un acces direct a `/dashboard/business-groups`.
- [x] Les filtres avances couvrent nom, description, suppression et dates.
- [x] Le tableau principal reste simple, mais chaque groupe peut etre expande.
- [x] L'expansion charge deux familles enfants: `businessGroupPermission` et `userBusinessGroup`.
- [x] Les modales create/edit ne manipulent que `groupName` et `groupDesc`.
- [x] La restauration est supportee.
- [ ] Les enfants affichent seulement `functionality` et `userId`, sans resolution de labels fonctionnels ou de noms utilisateurs.
- [ ] Le detail panel est plus statique que sur d'autres pages et son `saveItem` appelle `validateEdit()` sans consommer explicitement la charge utile emise.
- [ ] Le service parent utilise `POST /businessGroup/getByCriteria` plutot qu'un `getAllByCriteria` dedie.

## 4. Blocs UI Constates

### 4.1 Header et filtres

- [x] sous-texte qui explicite le statut de surface technique
- [x] bouton `Page metier`
- [x] recherche rapide generique
- [x] checkbox `Afficher les supprimes`
- [x] bouton `Filtres avances`
- [x] bouton `Nouveau`

### 4.2 Filtres avances

- [x] plage ID
- [x] nom du groupe
- [x] description
- [x] `isDeleted`
- [x] dates creation / modification

### 4.3 Tableau principal

- [x] colonnes `id`, `name`, `description`, `createdAt`
- [x] actions edit / delete / restore
- [x] bouton d'expansion par ligne

### 4.4 Sous-onglets d'expansion

- [x] `Permissions`
- [x] `Membres`

### 4.5 Modales

- [x] confirmation suppression / restauration
- [x] creation groupe metier
- [x] edition groupe metier

## 5. Donnees Affichees Ou Editees

- `groupName`
- `groupDesc`
- `createdAt`
- `isDeleted`
- permissions enfants: `functionality`, `businessGroupId`
- membres enfants: `userId`, `businessGroupId`, `isModerator`

## 6. Services Et Endpoints

- liste groupes via `BusinessGroupCrudService.getAllByCriteria()` -> `POST /businessGroup/getByCriteria`
- creation groupe via `BusinessGroupCrudService.create()` -> `POST /businessGroup/create`
- edition groupe via `BusinessGroupCrudService.update()` -> `POST /businessGroup/update`
- suppression groupe via `BusinessGroupCrudService.delete()` -> `POST /businessGroup/delete`
- restauration groupe via `BusinessGroupCrudService.restore()` -> `POST /businessGroup/update`
- chargement des permissions enfants via `BusinessGroupPermissionService.getAllByCriteria()` -> `POST /businessGroupPermission/getByCriteria`
- chargement des membres enfants via `UserBusinessGroupService.getAllByCriteria()` -> `POST /userBusinessGroup/getByCriteria`

## 7. Ce Que Le Backend Doit Envoyer

- Une liste paginee de groupes metier avec `items` et `count`.
- Des permissions enfants resolubles par `businessGroupId`.
- Des liaisons membres resolubles par `businessGroupId`, idealement enrichies avec l'identite utilisateur pour eviter `User #id` en UI.
- Des libelles fonctionnels suffisamment propres pour que `functionality` soit exploitable tel quel.

## 8. Entites Metier Impliquees

- `business_group`
- `business_group_permission`
- `user_business_group`
- `user`

## 9. Questions Ou Ecarts A Qualifier

- [x] Le premier garde-fou UX de BL-008 est pose: la route annonce maintenant clairement que `/dashboard/business-groups` est la page metier de reference.
- [ ] Faut-il enrichir les enfants avec noms d'utilisateur et labels permission lisibles ?
- [ ] Le detail panel doit-il supporter un vrai `saveItem` inline comme les autres pages ?
- [ ] Les permissions et membres doivent-ils devenir editables directement depuis cette page, ou rester en lecture technique ?

## 10. Recette Manuelle

1. Ouvrir `/dashboard/entities/business-groups`.
2. Verifier que le header annonce la route comme surface technique et que `Page metier` ouvre `/dashboard/business-groups`.
3. Filtrer par nom puis description.
4. Creer puis editer un groupe metier.
5. Ouvrir l'expansion et verifier les onglets `Permissions` et `Membres`.
6. Supprimer puis restaurer un groupe.
