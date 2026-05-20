# Entities Notifications

## 1. Identite

- Routes: `/dashboard/entities/notifications` et `/dashboard/entities/notifications/:page`
- Guard: `authGuard` au niveau dashboard puis `permissionGuard(['MANAGE_APP_CONFIG'])`
- Fichier TS: `quizapp_front/src/app/pages/dashboard/entities/solo/notifications/entities-notifications.ts`
- Fichier HTML: `quizapp_front/src/app/pages/dashboard/entities/solo/notifications/entities-notifications.html`

## 2. Objectif Produit

La page administre les notifications persistantes stockees en base. Elle sert autant de journal fonctionnel que de CRUD admin brut, alors que le service expose aussi des usages plus cibles comme `markAsRead`, `markAllAsRead` et la creation multiple dedupee.

## 3. Etat Constate

- [x] La page etend `EntityCrudBase`.
- [x] La recherche rapide filtre via `search_string`.
- [x] Les filtres avances couvrent ID, utilisateur, suppression et intervalles de dates.
- [x] Le tableau expose utilisateur, type, acteur, lien, etat lu, table cible et date de creation.
- [x] Les modales create/edit permettent de manipuler toutes les colonnes fonctionnelles principales.
- [x] La restauration est supportee.
- [x] Les cles de colonnes TS sont alignees sur les donnees reelles `notifType`, `notifActor`, `notifLink`, `isRead`, `objectTableName`, `objectTableId`.
- [ ] Le service supporte deja un filtre `notifType`, mais l'UI ne l'expose pas.
- [ ] Le filtre utilisateur affiche nom/prenom, alors que les modales create/edit utilisent plutot l'email: la surface n'est pas coherente sur le libelle utilisateur.
- [ ] La page reste un CRUD generaliste alors que le service propose aussi `markAsRead`, `markAllAsRead` et `createMultipleDbNotifications`, plus proches du vrai cycle metier des notifications.

## 4. Blocs UI Constates

### 4.1 Header et toolbar

- [x] breadcrumb retour vers `/dashboard/entities`
- [x] recherche rapide `Rechercher...`
- [x] checkbox `Afficher les supprimes`
- [x] bouton `Filtres avances`
- [x] bouton `Nouveau`

### 4.2 Filtres avances

- [x] plage ID `idDe` / `idA`
- [x] filtre `userId`
- [x] filtre `isDeleted`
- [x] intervalles `dateCreation*` et `dateModification*`

### 4.3 Tableau principal

- [x] colonnes `id`, `userId`, `notifType`, `notifActor`, `notifLink`, `isRead`, `objectTableName`, `objectTableId`, `createdAt`
- [x] badge booleen `Oui` / `Non` sur `isRead`
- [x] affichage utilisateur via `getUserDisplay()`
- [x] actions edit / delete ou restore selon `isDeleted`
- [x] detail panel branche en bas de page

### 4.4 Modales

- [x] confirmation suppression
- [x] confirmation restauration
- [x] creation notification
- [x] edition notification

## 5. Donnees Affichees Ou Editees

- `id`
- `userId`
- `notifType`
- `notifActor`
- `notifLink`
- `isRead`
- `objectTableName`
- `objectTableId`
- `userFirstName`, `userLastName`
- `actorName`
- `isDeleted`
- `createdAt`

## 6. Services Et Endpoints

- liste via `NotificationService.getAllNotificationsByCriteria()` -> `POST /notifications/getAllByCriteria`
- creation via `NotificationService.createNotification()` -> `POST /notifications/create`
- edition via `NotificationService.updateNotification()` -> `POST /notifications/update`
- suppression via `NotificationService.deleteNotification()` -> `POST /notifications/delete`
- restauration via `NotificationService.restoreNotification()` -> `POST /notifications/update`
- helpers metier disponibles mais non utilises ici: `getUserNotifications()`, `markAsRead()`, `markAllAsRead()`, `createDbNotification()`, `createMultipleDbNotifications()`
- chargement des utilisateurs FK via `UserService.getByCriteria()`

## 7. Ce Que Le Backend Doit Envoyer

- Des notifications normalisables depuis camelCase ou snake_case vers `notifType`, `notifActor`, `notifLink`, `isRead`, `objectTableName`, `objectTableId`.
- Un endpoint `getAllByCriteria` pagine pour l'administration complete.
- Un modele de notification suffisamment riche pour faire le lien avec l'objet cible et l'utilisateur vise.
- Des helpers de marquage comme lu et de creation multiple pour les flux metier qui ne passent pas par ce CRUD brut.

## 8. Entites Metier Impliquees

- `notifications`
- `user`
- references vers objets metier cibles via `objectTableName` et `objectTableId`

## 9. Questions Ou Ecarts A Qualifier

- [ ] Faut-il exposer le filtre `notifType` dans l'UI ?
- [ ] Cette page doit-elle rester un CRUD complet, ou etre davantage une vue de consultation/diagnostic ?
- [ ] Le libelle utilisateur doit-il etre harmonise entre filtres, tableau et modales ?

## 10. Recette Manuelle

1. Ouvrir `/dashboard/entities/notifications` avec un compte autorise.
2. Filtrer par utilisateur puis par suppression.
3. Creer une notification manuelle avec table cible et lien.
4. Modifier son etat `Lu` puis verifier le tableau.
5. Supprimer puis restaurer une notification.
