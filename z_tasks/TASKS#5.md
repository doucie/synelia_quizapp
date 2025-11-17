17/11/2025

## Tâches effectuées

- Correction de l'affichage des noms des évaluateurs dans la page de création d'entretien
- Correction du compteur de candidats lors de la sélection multiple
- Ajout du champ candidat dans la création des entretiens
- Ajout du statut SCHEDULED dans les valeurs possibles pour les entretiens
- Correction du format des requêtes pour correspondre au backend Spring Boot

## Problème en cours

La création d'entretien fonctionne avec Postman mais pas depuis l'application Angular. Erreur 404 sur l'endpoint /interviews/create.

## À vérifier au retour

1. Vérifier que le backend est bien démarré et accessible sur le port 8081
2. Vérifier les logs du backend lors d'une tentative de création depuis l'application
3. Comparer la requête envoyée par l'application avec celle de Postman
4. Vérifier la configuration CORS du backend
5. Tester la création d'entretien depuis l'application après redémarrage du frontend
