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

---

19/11/2025

## Tâches effectuées

- Correction de l'affichage des entretiens dans le tableau de bord
- Correction de la correspondance entre les entretiens et les candidats
- Correction de la récupération des informations des campagnes
- Ajout d'un badge de statut d'envoi d'email sur chaque entretien
- Ajout de libellés pour les types d'entretien
- Nettoyage du code et suppression des logs de débogage
- Correction de la création des entretiens depuis l'application
- Correction de l'attribution des droits aux évaluateurs lors de la création d'entretien
- Correction du défilement de la liste des entretiens dans le tableau de bord

## Vérifier au retour
- La création de l'entretien avec plusieurs candidats et d'autres évaluateurs que les prédéfinnis
