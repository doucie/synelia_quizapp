20/10/2025

## Tâches effectuées

- Déroulement des détails de campagnes dans la liste
- Navigation vers une page détaillée de campagne
- Ajout de la section "Questions" dans la page de détails
- Mise en place de l'indicateur de bonne réponse (icône checkmark verte)
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

- Correction de la navigation vers la page de planification d'interview (ajout de `stopPropagation()`)
- Refonte complète du design de `/dashboard/interview-new` avec les variables CSS
- Remplacement de tous les emojis par des SVG professionnels
- Support du dark mode pour la page d'interview
- Création des migrations V1_024, V1_025 et V1_026
- Ajout des permissions dans `campaign_crud`: `can_planify`, `can_accept_pre_screen`, `can_accept_final`
- Refonte complète de l'enum `application_status` (11 états : PENDING, PENDING_ARCHIVED, SUBMITTED, PRE_SCREEN_ACCEPTED, PRE_SCREEN_REJECTED, PRE_SCREEN_REJECTED_ARCHIVED, INTERVIEWING, FINAL_ACCEPTED, FINAL_ACCEPTED_ARCHIVED, FINAL_REJECTED, FINAL_REJECTED_ARCHIVED)
- Ajout des champs dans `applications`: `application_abandoned`, `pre_screen_decision_mail_sent`, `final_decision_mail_sent`, `interview_date`, `interview_status`
- Mise en majuscules de l'enum `quiz_status` (PENDING, STARTED, COMPLETED)
- Mise à jour des entités Java (Applications, CampaignCrud)
- Mise à jour des DTOs (ApplicationsDto, CampaignCrudDto)
- Ajout des 3 nouvelles permissions dans le formulaire de campagne (`/dashboard/campaigns/new` et `/dashboard/campaigns/:id/edit`)
- Mise à jour de l'interface `RecruiterAccess` avec les 3 nouvelles permissions
- Mise à jour de la méthode `toggleRecruiterAccess()` pour supporter les nouvelles permissions
- Ajout des nouvelles permissions lors de la création d'accès aux campagnes (créateur et recruteurs)
- Modification de la condition `canScheduleInterview()` pour vérifier `applicationStatus === 'PRE_SCREEN_ACCEPTED'` au lieu de `PENDING + quiz completed`

## DERNIERE REQUETE
Les migrations sont créées et le code Java/TypeScript est mis à jour. Il faut maintenant:
1. Redémarrer le backend pour appliquer les migrations Flyway
2. Vérifier que les nouvelles colonnes sont bien créées dans la base de données
3. Tester la création/modification d'une campagne avec les nouvelles permissions
4. Tester que seules les candidatures avec status `PRE_SCREEN_ACCEPTED` peuvent planifier un entretien
5. Implémenter les fonctionnalités pour changer le statut des candidatures (boutons d'action dans l'interface)


---

23/10/2025

## Tâches effectuées

**Refonte complète du système d'interviews** - Modernisation de la structure de la table `interviews` et création d'un nouveau formulaire wizard en 3 étapes.

**Migrations de base de données (V1_027 et V1_028):**
- Table `interviews`: Remplacement de `interview_start`/`interview_end` par `interview_date` (datetime) et `interview_status` (ENUM: PENDING, STARTED, OVER, POSTPONED, ARCHIVED)
- Ajout de `meet_link` (VARCHAR 500), `interview_note` (TEXT), `interview_mail_sent` (BOOLEAN)
- Modification de `interview_type`: Suppression de PHONE, conservation de IN_PERSON et ONLINE uniquement
- Table `interview_crud`: Suppression de `can_create`, ajout de `can_evaluate` et `is_admin` (BOOLEAN)

**Backend Java (10 fichiers mis à jour):**
- Entités: Interviews.java, InterviewCrud.java
- DTOs: InterviewsDto.java, InterviewCrudDto.java avec SearchParams
- Business: InterviewsBusiness.java, InterviewCrudBusiness.java (méthodes setters et validations)
- Repositories: InterviewsRepository.java, InterviewCrudRepository.java (queries et generateCriteria)
- Transformers: InterviewsTransformer.java (mappings MapStruct avec format datetime)
- Suppression des méthodes findByInterviewStart/End/CanCreate, remplacement par findByInterviewDate/Status/CanEvaluate

**Frontend Angular (3 nouveaux fichiers):**
- interview-form-new.html (394 lignes): Wizard 3 étapes avec design moderne
  * Étape 1: Sélection candidat (filtres campagne/source, recherche, affichage candidats SUBMITTED uniquement)
  * Étape 2: Détails interview (cartes de sélection type IN_PERSON/ONLINE, date/heure, lieu/lien conditionnel, notes)
  * Étape 3: Sélection intervieweurs (auto-sélection créateur + évaluateurs, badges de rôles)
- interview-form-new.ts (369 lignes): Logique avec Signals Angular, loadCandidates() avec filtres, loadRecruiters() avec auto-sélection, submitInterview()
- interview-form-new.scss (730 lignes): Design utilisant variables colors.css, indicateur de progression, animations
- Route ajoutée: `/dashboard/interview-form-new`

**Corrections compilation:**
- Fix tooltips applications.html (position bottom au lieu de top pour éviter overflow)
- Fix canScheduleInterview(): Autoriser planification pour status SUBMITTED et PRE_SCREEN_ACCEPTED
- Fix import CSS: `../../../styles/core/colors.css` dans interview-form-new.scss
- Fix optional chaining warnings: Suppression de `?.` pour firstName/lastName dans avatars

## DERNIERE REQUETE
Refonte du système d'interviews complétée. Prochaines étapes:
1. Redémarrer backend pour appliquer migrations V1_027 et V1_028
2. Tester le nouveau formulaire `/dashboard/interview-form-new`: vérifier filtrage candidats SUBMITTED, auto-sélection recruteurs, création interview avec nouveau format
3. Vérifier que les données sont bien enregistrées avec `interview_date`, `interview_status`, `meet_link`, etc.
4. Possiblement ajouter un lien dans la navigation ou dans applications.html pour accéder au nouveau formulaire
5. Mettre à jour l'ancienne route `/dashboard/interview-new` pour utiliser le nouveau composant une fois validé
