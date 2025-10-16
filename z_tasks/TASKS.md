14 / 10 / 2025
# Améliorations du Formulaire de Campagne

## Modifications Backend

- Migration de la base de données : renommage de la colonne `all_can_update` en `all_can_evaluate` dans la table `campaign_crud`
- Correction de tous les fichiers Java pour refléter le changement de nomenclature (CampaignCrud.java, CampaignCrudDto.java, etc.)
- Ajout du champ `creatorName` dans `CampaignsDto.java` pour afficher le créateur de la campagne
- Implémentation de la méthode `getFullInfos()` dans `CampaignsBusiness.java` pour récupérer le nom complet du créateur depuis `UserRepository`
- Correction du filtrage des rôles pour accepter les valeurs en minuscules ('recruiter', 'admin', 'super')
- Ajout de la colonne `is_admin` dans la table `campaign_crud` via migration `V1_016`
- Ajout du champ `isAdmin` dans les entités et DTO Java (CampaignCrud, CampaignCrudDto)

## Formulaire de Création de Campagne

- Ajout de la recherche instantanée de recruteurs avec suggestions en temps réel (debounce de 300ms)
- Ajout de la recherche instantanée de spécialités avec affichage du département associé
- Suppression de l'obligation des champs : description, date de début et date de fin
- Maintien de l'obligation du champ spécialité
- Ajout de la gestion des permissions avec case à cocher "Tous les recruteurs peuvent évaluer" (valeur par défaut activée)
- Exclusion automatique de l'utilisateur connecté des résultats de recherche de recruteurs
- Injection et utilisation de `AuthService` pour récupérer l'utilisateur connecté

## Interface de Recherche des Recruteurs

- Implémentation d'un dropdown avec liste déroulante affichant les résultats de recherche
- Affichage des avatars personnalisés avec initiales basées sur le prénom et nom de famille
- Code couleur des avatars selon le rôle :
  * Bleu pour les recruteurs
  * Violet pour les admins
  * Rouge pour les super utilisateurs
- Affichage des badges de rôle avec les mêmes codes couleur
- Message "Aucun recruteur trouvé" avec icône SVG dimensionnée correctement (32px × 32px)
- Correction de la transformation des données utilisateur dans `user.service.ts` pour inclure firstName, lastName, username et phone
- Ajout du CSS `.no-results` dans la section `.recruiter-access` pour contrôler la taille de l'icône SVG
- Filtrage automatique pour exclure l'utilisateur connecté des résultats de recherche

## Interface de Recherche des Spécialités

- Implémentation d'un dropdown avec liste déroulante affichant les résultats de recherche
- Affichage du nom de la spécialité et du département associé
- Message "Aucune spécialité trouvée" avec icône SVG
- Correction de l'accès aux données : utilisation de `response.content` au lieu de `response.items`

## Liste des Campagnes

- Ajout de l'affichage du nom d'utilisateur du créateur dans les cartes de campagne sur `/dashboard/campaigns`
- Récupération automatique du créateur depuis la base de données via `UserRepository`

## Sauvegarde de la Campagne et Accès Recruteurs

- Ajout du champ `specialityId` dans les données de la campagne lors de la soumission
- Ajout du champ `createdBy` avec l'ID de l'utilisateur connecté
- Extraction de l'ID de la campagne créée depuis la réponse API
- Création automatique d'un enregistrement `campaign_crud` pour le créateur avec tous les droits (can_evaluate, can_update, can_delete, is_admin = true)
- Création d'un enregistrement `campaign_crud` pour chaque recruteur sélectionné avec les permissions définies (is_admin = false)
- Création d'une notification `ADDED_TO_CAMPAIGN` pour chaque recruteur (sauf le créateur)
- Envoi des notifications avec : notif_actor (ID créateur), notif_link (/dashboard/campaigns/{id}), is_read (false)

## Services Frontend

- Ajout de la méthode `saveCampaignAccess()` dans `CampaignService` pour sauvegarder les accès recruteurs
- Ajout de la méthode `createNotification()` dans `CampaignService` pour créer les notifications
- Ajout du champ `specialityId` dans l'interface `Campaign`
- Les méthodes utilisent les endpoints existants : `/campaignCrud/create` et `/notifications/create`

## Corrections Techniques

- Suppression d'erreurs de syntaxe (duplication de `}));` dans user.service.ts)
- Vérification et correction de toutes les erreurs de compilation
- Optimisation de la recherche avec RxJS (debounceTime, switchMap, distinctUntilChanged)
- Utilisation de signals Angular pour la gestion réactive des états de recherche
- Gestion correcte des types TypeScript pour les paramètres de callback (error: any)



---

16 / 10 / 2025
## Corrections et Améliorations Supplémentaires

### Corrections de la Sauvegarde de Campagne

- Implémentation de `forkJoin` pour attendre la fin de toutes les requêtes HTTP (campaign_crud + notifications) avant de naviguer
- Correction du type du champ `user` de String vers Integer dans les requêtes API
- Implémentation d'une fonction `calculateSearchString()` pour générer automatiquement le champ searchString côté frontend
- Ajout du searchString calculé dans les objets `creatorAccess`, `accessData` et `notificationData`
- Changement de `GenerationType.AUTO` vers `GenerationType.IDENTITY` dans l'entité `CampaignCrud.java`
- Suppression de la dépendance à la table `campaign_crud_seq` (utilisation de AUTO_INCREMENT MySQL)
- Mise en commentaire des champs obligatoires `notifActor`, `notifLink` et `searchString` dans `NotificationsBusiness.java`
- Modification de `follow: false` vers `follow: true` pour que le créateur suive automatiquement sa campagne

### Système de Notifications

- Ajout de l'interface `DbNotification` dans `notification.service.ts`
- Implémentation de `getUserNotifications(userId)` pour récupérer les notifications depuis la BD
- Implémentation de `markAsRead(notificationId)` pour marquer une notification comme lue
- Implémentation de `markAllAsRead(userId, notificationIds[])` pour marquer toutes les notifications comme lues
- Ajout de l'interface `DashboardNotification` dans `dashboard.ts`
- Remplacement des notifications mock par des vraies données de la BD dans `loadNotifications()`
- Implémentation de `convertToDashboardNotification()` pour transformer les notifications BD en format dashboard
- Ajout du mapping des types de notifications (ADDED_TO_CAMPAIGN → info, CAMPAIGN_UPDATE → warning, etc.)
- Implémentation de `handleNotificationClick()` pour gérer le clic (marquer comme lue + navigation)
- Ajout de la conversion userId de string vers number avec `parseInt()`
- Modification du HTML pour utiliser `handleNotificationClick()` au lieu de `markNotificationAsRead()`

### Migration Base de Données

- Création de la migration `V1_017__add_object_reference_to_notifications.sql`
- Ajout de la colonne `object_table_name` VARCHAR(100) dans la table `notifications`
- Ajout de la colonne `object_table_id` INT dans la table `notifications`
- Création de l'index `idx_notifications_object_reference` sur (object_table_name, object_table_id)
- Création de l'index `idx_notifications_user_object` sur (user_id, object_table_name, object_table_id)
- Ajout des champs `objectTableName` et `objectTableId` dans l'entité `Notifications.java`
- Ajout des champs `objectTableName` et `objectTableId` dans le DTO `NotificationsDto.java`
- Ajout des SearchParam `objectTableNameParam` et `objectTableIdParam` dans `NotificationsDto.java`
- Ajout des mappings `objectTableName` et `objectTableId` dans `NotificationsTransformer.java`
- Ajout des champs optionnels `objectTableName` et `objectTableId` dans l'interface `DbNotification`
- Ajout automatique de `objectTableName: 'campaigns'` et `objectTableId: campaignId` lors de la création de notifications

### Fonctionnalités Badge et Liste de Notifications

- Affichage du nombre réel de notifications non lues depuis la BD dans le badge
- Mise à jour automatique du badge après marquage comme lue
- Affichage de toutes les notifications de l'utilisateur dans la liste
- Ajout d'un indicateur visuel (point bleu) pour les notifications non lues
- Ajout du formatage du temps écoulé ("il y a 30 minutes")
- Ajout des couleurs différentes selon le type (info, success, warning, error)
- Implémentation du clic sur notification pour marquer comme lue et naviguer vers l'objet lié
- Implémentation du bouton "Tout marquer" pour marquer toutes les notifications non lues
- Synchronisation de l'état local avec la base de données
- Affichage des notifications dans le dashboard après création de campagne
- Navigation automatique vers la campagne lors du clic sur la notification


