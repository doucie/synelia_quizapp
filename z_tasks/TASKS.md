du 13/10/2025 au 17/10/2025

## Vue des campagnes et des utilisateurs pour le rôle "recruteurs"

- Migration de la base de données : Correction de nomenclatures
- Ajout du champ pour afficher le nom du créateur dans l'interface utilisateur
- Correction du filtrage des rôles Pour corriger les problèmes d'authentification
- Différenciation entre administrateurs et recruteurs dans les accès aux campagnes
- Ajout de la recherche instantanée de recruteurs avec suggestions en temps réel
- Ajout de la recherche instantanée de spécialités avec affichage du département associé
- Ajout de la gestion des permissions avec case à cocher
- Injection et utilisation de `AuthService` pour récupérer l'utilisateur connecté
- Exclusion automatique de l'utilisateur connecté des résultats de recherche de recruteurs
- Enregistrement automatique des permissions pour le créateur d'une campagne avec tous les droits
- Enregistrement automatique des permissions définies pour chaque recruteur sélectionné avec les permissions définies
- Création d'une notification `ADDED_TO_CAMPAIGN` pour chaque recruteur ajouté


## Corrections Techniques

- Suppression d'erreurs de syntaxe dans user.service.ts
- Vérification et correction de toutes les erreurs de compilation 
- Utilisation de signals Angular pour la gestion réactive des états de recherche


### Corrections de la Sauvegarde de Campagne

- Implémentation de `forkJoin` pour éviter que les requêtes soient annulées par la navigation prématurée
- Modification de `follow: false` vers `follow: true` pour que le créateur suive automatiquement sa campagne 


### Système de Notifications

- Ajout de l'interface `DbNotification` dans `notification.service.ts` pour typer correctement les données de notification depuis la base de données
- Implémentation de `getUserNotifications(userId)` pour récupérer les notifications depuis la BD
- Implémentation de `markAsRead(notificationId)` pour marquer une notification comme lue
- Implémentation de `markAllAsRead(userId, notificationIds[])` pour marquer toutes les notifications comme lues
- Ajout de l'interface `DashboardNotification` dans `dashboard.ts` Pour structurer les données de notification dans le dashboard
- Remplacement des notifications mock par des vraies données de la BD dans `loadNotifications()`
- Implémentation de `convertToDashboardNotification()` pour transformer les notifications BD en format dashboard
- Ajout du mapping des types de notifications pour différencier visuellement les types de notifications
- Implémentation de `handleNotificationClick()` pour gérer le clic (marquer comme lue + navigation)


### Fonctionnalités Badge et Liste de Notifications

- Affichage du nombre réel de notifications non lues depuis la BD dans le badge de notifications
- Mise à jour automatique du badge après marquage comme lue 
- Affichage de toutes les notifications de l'utilisateur dans la liste 
- Ajout d'un indicateur visuel pour les notifications non lues 
- Ajout du formatage du temps écoulé ("il y a 30 minutes")
- Implémentation du clic sur notification pour marquer comme lue et naviguer vers l'objet lié
- Synchronisation de l'état local avec la base de données pour maintenir la cohérence entre frontend et backend
- Affichage des notifications dans le dashboard après création de campagne
- Navigation automatique vers la campagne lors du clic sur la notification


