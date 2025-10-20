-# Implémentation du Système de Gestion des Recruteurs de Campagne

## Migration Base de Données

- Création de la migration `V1_016__add_is_admin_to_campaign_crud.sql`
- Ajout de la colonne `is_admin` dans la table `campaign_crud` pour distinguer l'administrateur (créateur) des autres recruteurs
- Valeur par défaut : `FALSE`
- Type : `BOOLEAN NOT NULL`

## Modifications Backend

### Entité CampaignCrud

- Ajout du champ `isAdmin` dans `CampaignCrud.java`
- Ajout du champ `isAdmin` dans `CampaignCrudDto.java`
- Ajout du paramètre de recherche `isAdminParam` dans `CampaignCrudDto.java`

### Endpoints Existants Utilisés

- `/campaigns/create` : Création de la campagne (déjà existant)
- `/campaignCrud/create` : Création des accès recruteurs (déjà existant)
- `/notifications/create` : Création des notifications (déjà existant)

## Modifications Frontend

### Exclusion de l'Utilisateur Connecté

- Import de `AuthService` dans `campaign-form.ts`
- Injection de `AuthService` dans le constructeur
- Filtrage de l'utilisateur connecté dans les résultats de recherche de recruteurs
- Log console pour tracer l'exclusion de l'utilisateur

### Logique de Soumission du Formulaire

- Récupération de l'ID de l'utilisateur connecté via `authService.getCurrentUser()`
- Ajout du champ `specialityId` dans les données de la campagne
- Ajout du champ `createdBy` dans les données de la campagne
- Extraction de l'ID de la campagne créée depuis la réponse API
- Appel de `saveCampaignAccessAndNotifications()` après création de la campagne

### Sauvegarde des Accès et Notifications

#### 1. Créateur de la Campagne

- Ajout automatique du créateur avec tous les droits :
  * `canEvaluate: true`
  * `canUpdate: true`
  * `canDelete: true`
  * `isAdmin: true`
  * `follow: false`

#### 2. Recruteurs Sélectionnés

- Ajout de chaque recruteur avec ses permissions personnalisées :
  * `canEvaluate` : selon la sélection dans le formulaire
  * `canUpdate` : selon la sélection dans le formulaire
  * `canDelete` : selon la sélection dans le formulaire
  * `isAdmin: false`
  * `follow: false`

#### 3. Notifications

- Création d'une notification pour chaque recruteur ajouté (sauf le créateur)
- Type de notification : `ADDED_TO_CAMPAIGN`
- Acteur de la notification : ID du créateur
- Lien de la notification : `/dashboard/campaigns/{campaign_id}`
- État initial : `isRead: false`
- Créateur système : `createdBy: 1`
- Destinataire : `userId` du recruteur concerné

### Services Mis à Jour

#### CampaignService

- Ajout du champ `specialityId` dans l'interface `Campaign`
- Ajout de la méthode `saveCampaignAccess(accessDataArray)` pour sauvegarder les accès recruteurs en masse
- Ajout de la méthode `createNotification(notificationData)` pour créer une notification
- Les deux méthodes utilisent les endpoints existants du backend

## Flux de Création de Campagne

1. L'utilisateur remplit le formulaire de campagne
2. L'utilisateur sélectionne des recruteurs (recherche en temps réel avec exclusion de lui-même)
3. L'utilisateur définit les permissions pour chaque recruteur
4. Lors de la soumission :
   - Création de la campagne via `/campaigns/create`
   - Récupération de l'ID de la campagne créée
   - Création d'un enregistrement `campaign_crud` pour le créateur (is_admin = true)
   - Création d'un enregistrement `campaign_crud` pour chaque recruteur (is_admin = false)
   - Création d'une notification pour chaque recruteur
5. Redirection vers `/dashboard/campaigns`

## Logs de Débogage

- `🚫 Utilisateur connecté exclu:` lors du filtrage de recherche
- `👤 X utilisateurs après exclusion de l'utilisateur connecté`
- `📝 Campagne créée avec ID:` après création réussie
- `💾 Sauvegarde des accès recruteurs et notifications pour campagne:`
- `👑 Créateur ajouté avec tous les droits:`
- `👤 Recruteur ajouté:` pour chaque recruteur
- `📬 Notification créée:` pour chaque notification
- `📬 Notification envoyée à l'utilisateur X`
- `✅ X accès recruteurs sauvegardés`

## Tests Recommandés

1. Vérifier que l'utilisateur connecté n'apparaît pas dans les résultats de recherche
2. Créer une campagne avec plusieurs recruteurs
3. Vérifier dans la base de données :
   - Enregistrement dans `campaigns` avec `created_by` = ID de l'utilisateur connecté
   - Enregistrement dans `campaign_crud` pour le créateur avec `is_admin = TRUE`
   - Enregistrements dans `campaign_crud` pour chaque recruteur avec `is_admin = FALSE`
   - Enregistrements dans `notifications` pour chaque recruteur (pas pour le créateur)
4. Vérifier que les notifications ont :
   - `notif_type = 'ADDED_TO_CAMPAIGN'`
   - `notif_actor` = ID du créateur
   - `notif_link` = `/dashboard/campaigns/{campaign_id}`
   - `is_read = FALSE`
