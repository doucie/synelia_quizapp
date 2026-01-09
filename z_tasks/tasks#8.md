15/12/2025

## Tâches effectuées

- Déplacement des informations du candidat dans l'en-tête de la page d'évaluation
- Correction de la sauvegarde de l'état la checkbox de fin d'évaluation entre les sessions
- Ajout de la synchronisation de la checkbox entre plusieurs utilisateurs connectés
- Ajout de champs en base de données pour le statut en ligne et la date du dernier ping
- Correction du format de date pour le suivi du statut en ligne

## Problème en cours

Le statut "en ligne" des évaluateurs reste bloqué sur "en attente" malgré les données correctement enregistrées en base de données. Le problème vient de la sérialisation JSON des champs booléens préfixés par "is" avec Jackson et Lombok.

## À vérifier au retour

1. Vérifier que les champs isOnline, hasFinished et lastPingAt sont bien retournés dans la réponse JSON de l'API
2. Tester le statut en ligne avec plusieurs utilisateurs connectés
3. Vérifier que le statut passe bien de "en attente" à "en ligne" quand un utilisateur est connecté


17/12/2025

## Tâches effectuées

- Correction du bug lors l'envoi des évaluations
- Ajout des fonctions Modifier et Supprimer sur ses propres messages d'évaluation et du formulaire de modification en ligne dans le chat
- Réinitialisation automatique du statut "terminé" quand on modifie ou supprime son évaluation
- Création d'une popup personnalisée pour terminer l'entretien avec liste des évaluateurs en attente et affichage du résumé des scores dans la popup de clôture

## Problème en cours

Le bouton "Terminer l'entretien" ne semble pas mettre à jour les données en base de données. Le statut de l'entretien devrait passer à "Terminé" avec la date de fin et les scores.

## À vérifier au retour

1. Vérifier les logs du backend lors du clic sur "Terminer l'entretien"
2. Vérifier que les badges Admin et Créateur s'affichent correctement pour tous les évaluateurs
3. Tester la mise à jour du statut de l'entretien en base de données


21/12/2025

## Tâches effectuées

- Correction de la checkbox pour terminer l'évaluation qui se décochait automatiquement
- Correction du bouton "Terminer l'évaluation" qui renvoyait une erreur
- Création de la page liste des évaluations avec en-tête et barre latérale
- Ajout de filtres par statut sur la liste des évaluations
- Ajout d'un compteur de statistiques et barre de recherche sur la liste des évaluations
- Réorganisation des routes pour séparer la liste des évaluations et la page d'évaluation plein écran

- Formation GraphQL : Caching et batching
- Formation GraphQL : Persisted queries
- Formation GraphQL : Monitoring (Apollo Studio)
- Formation GraphQL : Pagination : offset vs cursor-based
- Formation GraphQL : Apollo Client (ou urql) : installation et usage
- Formation GraphQL : Queries et mutations côté client
- Formation GraphQL : Gestion du cache
- Formation GraphQL : Optimistic response


- Formation GraphQL : (Projet Final) Définir le schéma GraphQL complet
- Formation GraphQL : (Projet Final) Définir les types, relations, inputs
- Formation GraphQL : (Projet Final) Implémentation de tous les queries
- Formation GraphQL : (Projet Final) Implémentation de toutes les mutations
- Formation GraphQL : (Projet Final) Ajout de la validation des inputs
- Formation GraphQL : (Projet Final) Ajout d'authentification (JWT)
- Formation GraphQL : (Projet Final) Ajout des permissions
- Formation GraphQL : (Projet Final) Ajout des DataLoader
- Formation GraphQL : (Projet Final) Écriture des tests essentiels
- Formation GraphQL : (Projet Final) Documentation auto. avec GraphQL Playground / Voyager
- 
- Formation GraphQL : (Projet Final) Document de Présentation


## Problème en cours

La mise à jour de la base de données lors de la clôture de l'entretien ne fonctionne pas. La redirection se fait correctement mais les scores et le statut de l'entretien ne sont pas enregistrés.

## À vérifier au retour

1. Vérifier que l'entretien est bien marqué comme terminé en base de données
2. Vérifier que les scores sont calculés et enregistrés correctement
3. Tester le flux complet de clôture d'un entretien
