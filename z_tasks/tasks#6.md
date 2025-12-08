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

---

25/11/2025

## Tâches effectuées

- Correction de la recherche des permissions de modification
- Ajout de la vérification des permissions avant la mise à jour des campagnes
- Correction des attributs 'créé par' et 'modifié par' lors de la mise à jour des campagnes
- Ajout de la suppression et recréation des droits lors de la modification d'une campagne
- Correction des bugs empêchant la lecture des notifications

## Problèmes en cours

1. Erreur lors de la modification d'une campagne après les corrections
2. Les permissions ne sont pas vérifiées avant d'accéder aux pages de modification

## À vérifier au retour

1. Résoudre l'erreur de modification des campagnes
2. Ajouter la vérification des permissions avant d'afficher les pages de modification
3. Vérifier que le créateur de la campagne garde tous les droits après modification
4. Tester la modification complète avec tous les recruteurs sélectionnés

---

26/11/2025

## Tâches effectuées

- Correction du bug lors de la modification des campagnes
- Ajout des champs manquants pour les droits de planification d'interview et d'acceptation de candidatures
- Correction de la génération automatique des identifiants de recherche
- Ajout d'une colonne pour identifier le créateur d'une campagne
- Distinction visuelle entre le créateur, les administrateurs et les recruteurs
- Ajout d'une case à cocher pour définir les administrateurs lors de la sélection des recruteurs d'une campagne
- Activation automatique de tous les droits lors de la nomination d'un administrateur

## Problèmes résolus

1. Erreur lors de la mise à jour des campagnes avec des champs manquants
2. Duplication des enregistrements d'accès aux campagnes
3. Identifiant de recherche généré manuellement au lieu d'être automatique
4. Impossibilité de distinguer le créateur des autres administrateurs

## À vérifier au retour

1. Tester la modification complète d'une campagne avec plusieurs recruteurs et vérifier update_by
2. Vérifier que le créateur ne peut pas être supprimé de la liste
3. Vérifier que seul le créateur peut retirer les administrateurs
4. Tester l'activation automatique des droits lors de la nomination d'un administrateur

---

30/11/2025

## Tâches effectuées

- Ajout d'une vue calendrier pour la page des interviews avec navigation par année, mois et jour
- Ajout d'une vue détaillée par heure pour afficher les interviews d'une journée
- Correction du bug lors de l'affichage de la liste des interviews après l'ajout du calendrier
- Génération automatique d'un code unique de 8 caractères lors du démarrage d'une interview
- Vérification de l'unicité du code d'évaluation dans la base de données

## À vérifier au retour

1. Tester le démarrage d'une interview et vérifier que le code d'évaluation est bien généré
2. Remplacer le bouton de fin d'interview par un bouton d'évaluation dans l'interface
3. Créer la page d'évaluation accessible via le lien unique
4. Vérifier que le calendrier affiche correctement les interviews sur plusieurs mois
