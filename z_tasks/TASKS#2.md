20/10/2025

## Tâches effectuées

- Déroulement des détails de campagnes
- Navigation vers une page détaillée de campagne
- Ajout de la section "Questions" dans la page de détails
- Mise en place de l'indicateur de bonne réponse
- Création de la migration pour supprimer les champs `marked_out_of` et `total_questions` de la table `campaigns`
- Création de la migration pour ajouter le champ `total_questions` à la table `applications`
- Mise à jour du backend pour calculer automatiquement `total_questions` lors de l'ajout/suppression de questions
- Suppression du champ `markedOutOf` du formulaire de création/modification de campagne (frontend)

## DERNIERE REQUETE (vérifier en répondant au quiz avec la candidature 452)
il faudrait stocker le nombre de questions total dans une campagne avec un attribut total_questions dans campaigns. donc créé une nouvelle migration.

il faut aussi aussi ajouter ce même attribut dans applications (total_questions) qui va copier total_question auxquelles le candidat a répondu après avoir soumis la candidature. comme ça, même si après on ajoute des questions dans la campagne, on saura exactement combien de questions il y avait dans la campagne quand le candidat y répondait.

quand le candidat clique sur soumettre le quiz. on compte le nombre de bonne réponses soumises et on note dans quiz_score. et on compte le nombre de questions qu'il y a avait dans la campagne et on note dans total_questions.

dans campaigns, on va retirer l'attribut marked_out_of (migration)
de même, dans /dashboard/campaigns/{campaign_id} et /dashboard/campaigns/new on va retirer "note sur" et le champ "bareme de notation"




---

21/10/2025

## Tâches effectuées

- Amélioration de l'affichage des cartes de candidatures (`application-card`)
- Implémentation du bouton copier-dans-le-presse-papier pour l'email
- Ajout de la modal de prévisualisation du CV
- Remplacement des dropdowns de filtres par des inputs autocomplete pour campagnes et sources
- Correction du problème "Campagne inconnue" en chargeant toutes les campagnes au lieu des campagnes suivies uniquement
- Ajout des migrations V1_022 et V1_023 pour le tracking des interviews (champs `interview_date` et `interview_status`)
- Création de la section interview cliquable dans les cartes de candidatures
- Création de la page `/dashboard/interviews/new` pour planifier un entretien
- Validation du formulaire avec messages d'erreur


## DERNIERE REQUETE (problème à résoudre)
La navigation vers `/dashboard/interviews/new` échoue (retourne `false`) malgré que le guard autorise l'accès. Les logs montrent:
- Le guard `recruiterRoleGuard` autorise bien l'accès
- La méthode `canScheduleInterview()` retourne true
- Mais `router.navigate()` retourne `false`

Route testée: `/dashboard/interview-new`
Composant créé: `InterviewFormComponent` dans `pages/dashboard/interview-form/`

À investiguer au prochain démarrage:
- Vérifier les erreurs de compilation dans le terminal
- Vérifier si le composant se charge (logs avec 🎯 dans la console)
- Possiblement relancer le serveur de dev complètement


---

22/10/2025

## Tâches effectuées

- Refonte complète du design de `/dashboard/interview-new` avec les variables CSS
- Refonte complète de l'enum `application_status`
- Ajout des nouvelles permissions lors de la création d'accès aux campagnes (créateur et recruteurs)
- Modernisation de la structure de la table `interviews` et création d'un nouveau formulaire wizard en 3 étapes.
- Ajout de `meet_link`, `interview_note`, `interview_mail_sent`
- Fix tooltips applications.html

## DERNIERE REQUETE
## REGLER CETTE ERREUR : - Fix canScheduleInterview() pour autoriser planification pour status SUBMITTED et PRE_SCREEN_ACCEPTED
Refonte du système d'interviews complétée. Prochaines étapes:
1. Redémarrer backend pour appliquer migrations V1_027 et V1_028
2. Tester le nouveau formulaire `/dashboard/interview-form-new`: vérifier filtrage candidats SUBMITTED, auto-sélection recruteurs, création interview avec nouveau format
3. Vérifier que les données sont bien enregistrées avec `interview_date`, `interview_status`, `meet_link`, etc.
4. Possiblement ajouter un lien dans la navigation ou dans applications.html pour accéder au nouveau formulaire
5. Mettre à jour l'ancienne route `/dashboard/interview-new` pour utiliser le nouveau composant une fois validé


---

25/10/2025

## Tâches effectuées

- Ceci est une phrase de test ajoutée automatiquement.

## DERNIERE REQUETE


---


