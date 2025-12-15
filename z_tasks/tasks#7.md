07/12/2025

## Tâches effectuées

- Correction du chargement des informations du candidat sur la page d'évaluation
- Ajout des champs de stockage pour les informations du candidat dans les interviews
- Mise à jour automatique des informations du candidat lors du démarrage d'une interview
- Correction du bug lors de l'affichage du nom du candidat et de la date de l'entretien

## Tâches effectuées

- Création de la page d'évaluation et affichage des notes et commentaires sur la page d'évaluation d'interview
- Ajout d'une liste des évaluateurs connectés avec leur statut en ligne
- Mise à jour automatique des évaluations en temps réel
- Ajout d'un formulaire de notation pour les évaluations, d'un champ de commentaire et d'un bouton d'envoi
- Correction du bug des doublons dans la liste des évaluateurs

## À vérifier au retour

1. Tester l'envoi d'une évaluation et vérifier l'affichage dans le chat
2. Vérifier que les évaluations des autres recruteurs s'affichent en temps réel
3. Tester le bouton "Évaluation terminée" pour fermer la session
4. Vérifier l'affichage correct des informations du candidat

---

08/12/2025

## Tâches effectuées

- [Recrutement] Création des requêtes Postman pour tester les API
- [Recrutement] Vérification des des API de l'application
- [Recrutement] Ajout du cryptage des mots de passe
- [Recrutement] Retrait des champs obligatoires inutiles lors de la création
- [Recrutement] Configuration de l'email pour tester la réinitialisation de mot de passe

---

15/12/2025

## Tâches effectuées

- Ajout de badges pour identifier les administrateurs et créateurs de campagne sur la page d'évaluation
- Ajout de checkboxs mises à jour en temps réel pour indiquer la fin d'une évaluation
- Ajout d'un compteur affichant le nombre d'évaluateurs ayant terminé leur évaluation
- Restriction du bouton de conclusion aux administrateurs et créateurs uniquement
- Ajout de nouveaux champs en base de données pour la synchronisation en temps réel des évaluateurs
- Mise à jour de la version de MapStruct pour la compatibilité avec Java 21
- Correction de la mise à jour automatique du schéma de base de données

## Problème en cours

La synchronisation en temps réel du statut des évaluateurs entre plusieurs utilisateurs connectés ne fonctionne pas encore correctement

## À vérifier au retour

1. Tester la synchronisation du statut en ligne entre plusieurs utilisateurs
2. Vérifier que la case à cocher de fin d'évaluation se synchronise entre les utilisateurs
3. Tester le bouton de conclusion de l'entretien
