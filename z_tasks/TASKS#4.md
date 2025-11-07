03/11/2025

## Tâches effectuées

- Correction des incohérences visuelles dans la page des décisions
- Correction de l'affichage des candidats : amélioration du filtrage pour les campagnes multi-sources
- Suppression complète des champs obsolètes
- Correction du problème de chargement des évaluateurs
- Améliorations de l'expérience utilisateur : pré-sélection automatique, correction thème sombre, clarification des libellés

## DERNIERE REQUETE

Système d'entretien fonctionnel avec affichage correct des candidats et évaluateurs. Migration de base de données à exécuter pour finaliser les changements.

04/11/2025

## Tâches effectuées

- Correction du statut du quiz : le quiz ne passait pas à STARTED lors du clic sur 'Commencer le quiz' (problème d'enum case mismatch)
- Initialisation correcte du niveau du quiz : ajout de @Transactional et logique pour initialiser quiz_level
- Ordre des questions : correction pour que les questions apparaissent dans l'ordre correct
- Ajout de fonctionnalités de timing : nouvelles colonnes chrono dans campaign_questions, time_elapsed dans applications, is_timed dans campaigns
- Mise à jour du statut de l'application : passage à SUBMITTED après complétion du quiz
- Correction de l'affichage du score dans le dashboard : utilisation de quiz_score_percent au lieu de quiz_score

## DERNIERE REQUETE

Quiz fonctionnel avec flux complet : PENDING → STARTED → COMPLETED, suivi des niveaux, questions ordonnées, timing ajouté, statut application mis à jour, score en pourcentage affiché correctement.

06/11/2025

## Tâches effectuées

- Sélection élargie des évaluateurs pour la création d'entretien
- Refonte visuelle de la page d'interview avec design moderne et animations
- Prévisualisation d'email
- Mise à jour autaumatique des mails
- Workflow de confirmation en 3 étapes avant création d'interview
- Validation automatique des dates avec alertes
- Possibilité d'envoyer ou non les emails lors de la création d'interview
- Attribution automatique des permissions aux évaluateurs


## À VÉRIFIER AU RETOUR

1. Tester la sélection de plusieurs candidats et vérifier que le compteur est correct
2. Vérifier l'affichage des noms d'évaluateurs (prénom + nom, sinon username, sinon email)
3. Vérifier que le rôle s'affiche correctement sous l'email dans les cartes d'évaluateurs
4. Tester le workflow complet de création avec les 3 modaux de confirmation
5. Vérifier que les messages des boutons sont clairs et rassurants