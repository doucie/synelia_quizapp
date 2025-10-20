20/10/2025

## Tâches effectuées

- Déroulement des détails de campagnes dans la liste
- Navigation vers une page détaillée de campagne
- Ajout de la section "Questions" dans la page de détails
- Affichage des questions avec leurs réponses
- Mise en place de l'indicateur de bonne réponse (icône checkmark verte)
- Création de la migration pour supprimer le champ `marked_out_of` de la table `campaigns`
- Création de la migration pour ajouter le champ `total_questions` à la table `campaigns`
- Création de la migration pour ajouter le champ `total_questions` à la table `applications`
- Mise à jour du backend pour calculer automatiquement `total_questions` lors de l'ajout/suppression de questions
- Modification du calcul du score du quiz pour utiliser `QuestionsAnswers.isCorrect` au lieu de `Answers.isCorrect`
- Suppression du champ `markedOutOf` du formulaire de création/modification de campagne (frontend)
- Correction des erreurs de compilation dans tous les fichiers Java affectés
- Mise à jour du transformer MapStruct pour remplacer `markedOutOf` par `totalQuestions`
- Correction des requêtes SQL dans les repositories
- Validation de la compilation du projet backend