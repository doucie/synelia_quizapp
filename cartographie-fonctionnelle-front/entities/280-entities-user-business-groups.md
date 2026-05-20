# Entities User Business Groups

## 1. Identite

- Routes: `/dashboard/entities/user-business-groups` et `/dashboard/entities/user-business-groups/:page`
- Guard: `authGuard` au niveau dashboard puis `permissionGuard(['MANAGE_APP_CONFIG'])`
- Fichier TS: `quizapp_front/src/app/pages/dashboard/entities/solo/user-business-groups/entities-user-business-groups.ts`
- Fichier HTML: `quizapp_front/src/app/pages/dashboard/entities/solo/user-business-groups/entities-user-business-groups.html`

## 2. Objectif Produit

La page administre les rattachements entre utilisateurs et groupes metiers. Elle expose la table de liaison brute `user_business_group`, alors que la page `dashboard/user-permissions` offre deja une gestion bien plus metier des groupes d'un utilisateur dans un contexte d'overrides et de permissions effectives.

Le slice BL-008 la pose maintenant plus explicitement comme surface technique et renvoie vers `/dashboard/user-permissions` comme page metier de reference pour la gestion quotidienne.

## 3. Etat Constate

- [x] La page etend `EntityCrudBase` avec `UserBusinessGroupService`.
- [x] Le header annonce maintenant explicitement le statut de surface technique et propose un acces direct a `/dashboard/user-permissions`.
- [x] Les filtres avances couvrent `userId`, `businessGroupId`, suppression et plages de dates, avec selects branches sur les catalogues utilisateur et groupe.
- [x] Le tableau expose utilisateur, groupe metier et date de creation, avec libelles resolus au lieu des IDs bruts.
- [x] Les modales create/edit utilisent des selects pour `userId` et `businessGroupId`, sans saisie libre.
- [x] Le detail panel et le popup de dependances FK sont montes en bas de page.
- [x] Le service propage l'utilisateur courant, sans `user: 1` en dur.
- [x] Le repo indique que les permissions effectives tiennent compte des memberships de groupes actifs, en ignorant les rattachements soft-delete.
- [x] Une surface plus riche existe deja dans `dashboard/user-permissions`, avec ajout/retrait de groupes par utilisateur dans le contexte des overrides individuels.
- [x] La route charge les catalogues utilisateur et groupe pour remplacer les IDs bruts par des libelles resolus dans les filtres, formulaires et le tableau.
- [ ] Le modele `UserBusinessGroup` contient `isModerator`, mais cette information n'est ni affichee ni editable dans cette route.
- [ ] La route ne montre ni nom, ni email utilisateur, ni nom du groupe, ce qui limite fortement sa valeur produit.
- [ ] La guard `MANAGE_APP_CONFIG` est decalee par rapport aux pages specialisees de permissions qui tournent plutot autour de `MANAGE_SYSTEM_ROLES`.

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
- [x] filtre `userId` via catalogue utilisateurs
- [x] filtre `businessGroupId` via catalogue groupes
- [x] filtre `isDeleted`
- [x] intervalles `dateCreation*` et `dateModification*`

### 4.3 Tableau principal

- [x] colonnes `id`, `userId`, `businessGroupId`, `createdAt`
- [x] rendu des libelles utilisateur et groupe a partir des catalogues frontend
- [x] actions edit / delete / restore
- [x] detail panel branche en bas de page
- [x] popup dependances FK branche

### 4.4 Modales

- [x] confirmation suppression
- [x] confirmation restauration
- [x] creation rattachement utilisateur/groupe
- [x] edition rattachement utilisateur/groupe

## 5. Donnees Affichees Ou Editees

- `id`
- `userId`
- `businessGroupId`
- `isModerator`
- `createdAt`
- `updatedAt`
- `isDeleted`

## 6. Services Et Endpoints

- liste CRUD via `UserBusinessGroupService.getAllByCriteria()` -> `POST /userBusinessGroup/getByCriteria`
- creation via `create()` -> `POST /userBusinessGroup/create`
- edition via `update()` -> `POST /userBusinessGroup/update`
- suppression via `delete()` -> `POST /userBusinessGroup/delete`
- restauration via `restore()` -> `POST /userBusinessGroup/update`

## 7. Ce Que Le Backend Doit Envoyer

- Un `getByCriteria` pagine avec `items` et `count` pour alimenter la grille.
- Des rattachements stables sur `userId`, `businessGroupId` et `isModerator`.
- Une resolution effective qui ignore les lignes soft-deletees lors du calcul des permissions heritees via groupe.
- Si la route reste brute, des IDs coherents avec les surfaces specialisees qui resolvent ensuite noms et emails.

## 8. Entites Metier Impliquees

- `userBusinessGroup`
- `user`
- `businessGroup`
- heritage des permissions par groupe

## 9. Questions Ou Ecarts A Qualifier

- [x] Les libelles utilisateur et groupe sont maintenant affiches dans la grille et les formulaires.
- [x] Le premier garde-fou UX de BL-008 est pose: la route annonce maintenant clairement que `/dashboard/user-permissions` est la page metier de reference.
- [ ] `isModerator` doit-il etre visible et editable dans cette route ?
- [ ] Cette route doit-elle etre remplacee en pratique par la gestion integree de `dashboard/user-permissions` et `dashboard/business-groups` ?
- [ ] La guard devrait-elle etre alignee sur les permissions de gestion des roles/groupes ?

## 10. Recette Manuelle

1. Ouvrir `/dashboard/entities/user-business-groups` avec un compte autorise.
2. Verifier que le header annonce la route comme surface technique et que `Page metier` ouvre `/dashboard/user-permissions`.
3. Filtrer par `userId` puis par `businessGroupId`.
4. Creer un rattachement utilisateur/groupe et verifier sa persistence.
5. Modifier l'utilisateur ou le groupe cible.
6. Supprimer puis restaurer un rattachement.
