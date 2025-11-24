24/11/2025

## Tâches effectuées

- Correction de l'affichage des campagnes partagées avec l'utilisateur
- Correction du message d'erreur lors de la vérification des droits de modification
- Ajout de notifications pour remplacer les alertes système lors des refus d'accès
- Amélioration de l'affichage des notifications avec des couleurs et animations
- Ajout de l'envoi de l'identifiant utilisateur dans les vérifications de permissions

## Problème en cours
La vérification des droits de modification des campagnes ne fonctionne pas correctement. L'utilisateur possède les droits dans la base de données mais le système ne les trouve pas lors de la recherche.

## À vérifier au retour

1. Examiner les logs backend pour comprendre pourquoi la recherche dans la table des droits ne retourne aucun résultat
2. Vérifier que les paramètres de recherche sont correctement construits et envoyés au repository
3. Tester la modification d'une campagne après correction de la recherche
4. Résoudre le problème des couleurs des avatars des recruteurs lors de la modification de campagne
