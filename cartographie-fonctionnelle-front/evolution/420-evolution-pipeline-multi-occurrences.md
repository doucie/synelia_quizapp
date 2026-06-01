# Note - Evolution du modele pipeline multi-occurrences

Date: 2026-05-30
Statut: cible BA et technique a planifier
Perimetre: pipeline, quiz, preselection, entretiens, evaluations, decisions, emails, audit

## 1. Decisions retenues

- `CANDIDATURE` et `DECISION` restent des singletons de pipeline.
- `QUIZ`, `PRESELECTION` et `INTERVIEW` doivent devenir repetables dans un meme template.
- `EVALUATION` ne doit plus etre pensee comme une etape pipeline autonome ; elle devient un sous-workflow de l'entretien.
- le round est defini d'abord par l'ordre de l'etape dans le pipeline, pas par un type metier proprietaire a la plateforme.
- il ne faut pas creer de round supplementaire ad hoc pour un seul candidat ; la structure reste pilotee par le pipeline.
- un round obligatoire ne doit jamais etre skippable.
- `application_progress` doit redevenir la source de verite runtime pour la chronologie du candidat.
- les operations critiques doivent etre auditees avec justification quand il y a annulation, rollback ou contournement.

## 2. Probleme cible

## 2 bis. Etat deja implemente sur le suivi public

Les slices publics deja livres sur `/applications/track` et `/suivre-candidature` servent maintenant de point d'appui concret pour la cible multi-occurrences:

- les entretiens exposes au candidat sont rattaches a leur occurrence exacte via `candidateInterviewId`, `interviewId`, `applicationProgressId` et le contexte `pipeline_stage` associe ;
- la reponse candidat a un entretien est persistee sur `candidate_interview` (`candidate_response_status`, `responded_at`) et reverrouille proprement l'occurrence jusqu'a une nouvelle proposition ;
- le quiz public actionnable est resolu comme une occurrence explicite (`application_quiz_attempt`) au lieu d'un simple miroir global sur `applications` ;
- le suivi public expose maintenant un verrou transversal de candidature (`applicationAbandoned`, `publicActionsLocked`, `publicLockReason`, `canWithdraw`) et un endpoint `POST /applications/withdraw` qui retire la candidature, bloque les actions publiques dependantes et notifie les recruteurs internes.

La base actuelle permet deja plusieurs lignes techniques sur certaines briques, notamment `interviews`, `candidate_interview` et `evaluations`, mais le modele metier reste majoritairement mono-occurrence.

Les blocages les plus visibles dans la description BD du 2026-05-30 sont les suivants:

- `applications` porte encore un etat quiz/interview/evaluation mono-valeur (`quiz_score`, `quiz_score_percent`, `quiz_status`, `interview_date`, `interview_status`, `total_evaluation_*`, `application_status`).
- `interviews` ne reference pas l'occurrence precise de pipeline concernee ; il n'y a pas de `application_progress_id`.
- `decisions` ne reference pas non plus l'occurrence precise de `PRESELECTION` ou `DECISION` ; il n'y a pas de `application_progress_id`.
- `application_progress` porte un `score`, un `mail_sent` et un `decided_by` trop generiques pour supporter plusieurs rounds audites avec validation humaine.
- `pipeline_stage` ne porte qu'un couple `email_required` / `email_automatic`, insuffisant pour une politique email differente selon le contexte ou l'issue.
- `candidate_answer` est encore rattache a `application_id` uniquement, ce qui ne permet pas de distinguer plusieurs quiz pour une meme candidature.
- `evaluations` ne stocke qu'un score global (`candidate_mark`) et un commentaire global (`recruiter_comment`) par ligne, sans grille de criteres configurable par round.
- `mail_log` et `audit_event` existent desormais comme socle technique multi-occurrences, mais leur couverture runtime reste encore partielle selon les flux critiques; tous les emails, validations et mutations sensibles ne sont pas encore rattaches de maniere exhaustive au bon round.

## 3. Cible de modele

Le modele cible doit reposer sur les principes suivants:

- `pipeline_stage` continue de definir le template.
- `application_progress` represente l'occurrence exacte du round pour une candidature.
- tous les objets runtime critiques doivent pointer vers cette occurrence exacte, directement ou via une entite qui y pointe deja.
- chaque quiz doit avoir sa propre tentative et ses propres reponses.
- chaque entretien doit embarquer sa logique d'evaluation et sa propre cloture humaine.
- `applications` doit cesser d'etre la verite metier du parcours et devenir un support de resume ou de pointeur courant.

## 4. Evolutions par table et par objet

### 4.1 `pipeline_stage`

Supprimer:

- la possibilite de creer une etape de premier niveau avec `stage_type = 'EVALUATION'` dans les nouveaux pipelines.
- la colonne `email_required`.
- la colonne `email_automatic`.

Ajouter:

- une structure de regles de notification par stage, par exemple `pipeline_stage_notification_rule`, avec au minimum:
  - `pipeline_stage_id`
  - `trigger_code` (`ON_STAGE_START`, `ON_INTERVIEW_PLANNED`, `ON_CANDIDATE_DECLINED_INTERVIEW`, `ON_CANDIDATE_REQUESTED_RESCHEDULE`, `ON_CANDIDATE_ABANDONED_APPLICATION`, `ON_PRESELECTION_ACCEPTED`, `ON_PRESELECTION_REJECTED`, `ON_FINAL_DECISION`, etc.)
  - `outcome_code` nullable si la regle depend d'une issue
  - `email_template_id` nullable
  - `is_required`
  - `is_automatic`
  - `requires_manual_confirmation`
- une vraie bibliotheque mutualisee de grilles d'evaluation, reutilisable entre plusieurs templates, par exemple `evaluation_grid_template`, `evaluation_grid_template_version` et `evaluation_grid_template_item`
- une structure de criteres effectifs sur le stage, par exemple `pipeline_stage_evaluation_criterion`, qui reference soit une version de bibliotheque, soit un snapshot importe, avec au minimum:
  - `pipeline_stage_id`
  - `evaluation_grid_template_version_id` nullable
  - `criterion_order`
  - `label`
  - `criterion_type` (`TEXT`, `SCORE`, `TEXT_AND_SCORE`)
  - `max_score` nullable
  - `weight` nullable
  - `is_required`
  - `config_json` nullable

Modifier:

- la semantique de `stage_type` pour autoriser plusieurs `QUIZ`, plusieurs `PRESELECTION` et plusieurs `INTERVIEW` dans un meme template.
- la configuration du stage pour qu'un quiz puisse porter sa propre regle de passage au niveau du round, pas au niveau global de la candidature.
- la configuration d'un stage `QUIZ` doit inclure un screening automatique optionnel, par exemple `screeningMode = NONE | AUTO_THRESHOLD` avec `passingScore` nullable. Un round quiz peut donc declencher un screening automatique, tandis qu'un autre round quiz du meme pipeline peut ne pas en avoir.

Raison:

- les rounds repetables demandent des regles attachees a chaque occurrence de template.
- l'evaluation et les emails ne peuvent plus etre geres correctement avec des booleens trop pauvres ni avec un type `EVALUATION` autonome.
- une grille d'evaluation doit pouvoir etre mutualisee entre plusieurs templates sans faire deriver retroactivement les campagnes deja ouvertes; il faut donc prevoir reutilisation + versionnement ou snapshot fige.

### 4.2 `application_progress`

Supprimer:

- `decided_by` comme champ generique de pilotage du round ; il est trop specifique a la decision et pas assez clair pour quiz, entretien, skip ou rollback.
- `mail_sent` comme source de verite unique des notifications du round.

Ajouter:

- `validated_at`
- `validated_by`
- `validation_comment` nullable
- `skipped_at` nullable
- `skipped_by` nullable
- `skip_reason` nullable
- `reopened_at` nullable
- `reopened_by` nullable
- `reopen_reason` nullable

Modifier:

- `score` doit devenir un score de synthese de l'occurrence precise, jamais un score global par `stage_type`.
- `notes` doit etre traite comme un commentaire de suivi du round, pas comme le depot unique de toute la logique metier.
- `progress_status` doit supporter un cycle plus explicite entre ouverture, traitement, validation humaine, cloture, skip et reouverture.

Raison:

- `application_progress` devient l'ancre runtime principale.
- il doit porter la fermeture humaine du round, les skips autorises et les reouvertures auditees.

### 4.3 `applications`

Supprimer:

- `quiz_score`
- `quiz_score_percent`
- `quiz_status`
- `quiz_level`
- `total_questions`
- `quiz_manual_correction_status`
- `time_elapsed`
- `quiz_timed_snapshot`
- `quiz_total_time_allowed_snapshot`
- `quiz_last_activity_at`
- `quiz_token`
- `interview_date`
- `interview_status`
- `total_evaluation_score`
- `total_evaluation_number`
- `total_evaluation_percentage`
- `application_status` comme source de verite principale du pipeline

Ajouter:

- `current_application_progress_id`
- `current_pipeline_stage_id` si un pointeur denormalise est juge utile pour la lecture rapide
- `last_progressed_at` si l'on veut un resume de derniere activite sans relire toute la chronologie
- `aggregated_quiz_score` nullable
- `aggregated_quiz_score_percent` nullable
- `aggregated_evaluation_score` nullable
- `aggregated_evaluation_score_percent` nullable
- `abandoned_at` nullable
- `abandon_reason` nullable
- `abandoned_from_application_progress_id` nullable

Modifier:

- `applications` doit rester une vue de synthese et de recherche, pas le lieu ou l'on decide quel round est en cours ni quel score fait foi.
- les scores quiz et evaluation, ainsi que les dates d'entretien, doivent venir des objets de round specialises ou de resumes recalcules.
- si `form_version_id` reste sur `applications`, il ne doit representer que le formulaire de candidature initial et ne doit jamais servir d'ancre au runtime quiz.
- `application_abandoned` doit rester un verrou global de la candidature, car l'abandon bloque tout avancement quel que soit le round courant; en revanche il doit etre enrichi par un contexte d'origine (`abandoned_from_application_progress_id`) et produire une notification aux recruteurs concernes.
- les scores globaux quiz et evaluation sont acceptables s'ils sont explicitement derives de l'ensemble des rounds retenus, avec une regle d'agregation stable, et jamais traites comme la source primaire de verite.

Raison:

- tant que `applications` reste mono-quiz, mono-entretien et mono-score, le produit ne peut pas gerer plusieurs rounds sans ambiguite.
- certains indicateurs globaux restent legitimes au niveau candidature s'ils sont de vrais resumes calcules (`aggregated_*`) ou un verrou transversal (`application_abandoned`).

### 4.4 Nouveau runtime quiz: `application_quiz_attempt`

Ajouter:

- une table dediee par tentative de quiz, par exemple `application_quiz_attempt`, avec au minimum:
  - `application_id`
  - `application_progress_id`
  - `form_version_id` ou la reference de quiz effectivement utilisee
  - `quiz_token`
  - `quiz_status`
  - `screening_mode`
  - `screening_threshold` nullable
  - `screening_result` nullable
  - `score`
  - `score_percent`
  - `manual_correction_status`
  - `total_questions`
  - `time_elapsed`
  - `timed_snapshot`
  - `total_time_allowed_snapshot`
  - `last_activity_at`
  - `started_at`
  - `completed_at`

Modifier:

- les regles de screening automatique doivent s'appuyer sur la tentative rattachee au bon `application_progress`, pas sur les colonnes globales de `applications`.
- le screening automatique doit rester optionnel round par round: une tentative de quiz peut porter une regle de screening, une autre non.
- la resolution du quiz cible doit devenir stage-aware: un round quiz doit connaitre son formulaire cible via la config de stage ou un mapping equivalent, au lieu de se reposer sur un unique quiz global de candidature.

Raison:

- plusieurs quiz dans un meme pipeline imposent plusieurs tentatives, plusieurs jetons, plusieurs snapshots de timing et plusieurs resultats distincts.

### 4.5 `candidate_answer`

Supprimer:

- la colonne `application_id`.

Ajouter:

- `application_quiz_attempt_id`

Modifier:

- `candidate_answer` doit etre relu par tentative de quiz.
- la relation vers la candidature doit se deduire de `application_quiz_attempt -> application_progress -> application`.

Raison:

- une meme candidature pourra repondre a plusieurs quiz differents ; sans tentative explicite, les reponses deviennent ambigues.

### 4.6 `interviews`

Supprimer:

- la colonne `application_id`.
- la colonne `evaluation_score`.
- la colonne `evaluation_number`.
- la colonne `evaluation_percentage`.
- la colonne `interview_mail_sent`.

Ajouter:

- `application_progress_id`
- `evaluation_completed_at` nullable
- `evaluation_completed_by` nullable
- `closed_at` nullable
- `closed_by` nullable
- `closure_comment` nullable

Modifier:

- `interview_status` doit devenir un vrai statut operationnel interne couvrant au minimum planification, tenue, evaluation, validation humaine et cloture.
- `interviews` peut rester le conteneur de planification commun a un ou plusieurs `candidate_interview` si le produit conserve des entretiens mutualises pour plusieurs candidatures.
- `interview_evaluations_link` doit rester au niveau `interviews` s'il represente en realite le code ou lien du salon partage par les evaluateurs du meme entretien; il est en revanche recommande de le renommer vers une semantique plus juste du type `evaluation_room_code` ou `interview_room_code`.
- si l'on a besoin plus tard de liens d'acces personnels, revocables ou traces par evaluateur, il faudra une table dediee rattachee aux participants de l'entretien, et non un deplacement de ce champ vers `candidate_interview`.

Raison:

- plusieurs entretiens existent deja techniquement, mais ils doivent maintenant etre rattachables sans ambiguite a l'occurrence exacte `INTERVIEW` dans la chronologie pipeline.
- les indices existants montrent deja que `interviews` porte la session partagee (participants, chat, agregats), tandis que `candidate_interview` porte la liaison individuelle a la candidature.

### 4.7 `interview_participant`

Conserver et renforcer:

- cette table peut rester la couche d'affectation des participants et evaluateurs d'un entretien.

Ajouter:

- `evaluation_status` nullable si l'UX doit suivre quels evaluateurs ont deja depose leur evaluation
- `evaluation_submitted_at` nullable si le suivi par participant est requis

Modifier:

- `can_evaluate` doit devenir la vraie indication des participants attendus dans le sous-workflow d'evaluation.

Raison:

- il existe deja un support de participants par entretien ; il vaut mieux le faire monter en precision que recreer une nouvelle brique parallele.

### 4.8 `candidate_interview`

Supprimer:

- la colonne `application_id`.

Conserver:

- `candidate_interview` peut rester la brique de reponse candidat et de suivi de disponibilite, car elle est deja rattachee a `interview_id`.

Ajouter:

- `candidate_response_status` (`PENDING`, `ACCEPTED`, `DECLINED`, `RESCHEDULE_REQUESTED`)
- `responded_at` nullable
- une contrainte d'unicite logique garantissant qu'un entretien ne porte qu'une reponse candidate active a la fois si cette garantie n'existe pas deja.

Modifier:

- `decline_reason` et `alternative_date_requested` doivent devenir des details de reponse du candidat et non des indicateurs implicites d'etat.
- les parcours de lecture doivent remonter le round cible via `candidate_interview -> interview -> application_progress`.
- le lien vers la candidature doit se deduire de `interview -> application_progress -> application` et non plus d'une duplication locale.
- la reponse candidat doit explicitement couvrir au minimum: acceptation, refus, demande d'autre date.
- une demande de nouvelle date ou un refus doit pouvoir declencher une notification ciblee vers les recruteurs concernes.

Raison:

- la table n'est pas le blocage principal ; le vrai point manquant est le lien de l'entretien vers l'occurrence pipeline.
- elle reste cependant la bonne brique pour porter la reponse individuelle du candidat quand un meme entretien mutualise peut concerner plusieurs candidatures.

### 4.9 `evaluations`

Supprimer:

- la colonne `candidate_mark`.
- la colonne `recruiter_comment`.

Ajouter:

- `interview_participant_id` ou un identifiant explicite d'evaluateur
- `evaluation_status`
- `submitted_at`
- `validated_at` nullable
- `validated_by` nullable
- des champs de synthese explicites si l'on veut conserver un resume de haut niveau, par exemple `global_score` nullable et `global_comment` nullable

Ajouter aussi:

- une table de detail par critere, par exemple `evaluation_item`, avec au minimum:
  - `evaluation_id`
  - `pipeline_stage_evaluation_criterion_id`
  - `score_value` nullable
  - `text_value` nullable
  - `weight_snapshot` nullable
  - `max_score_snapshot` nullable

Modifier:

- `evaluations` doit devenir l'en-tete d'une soumission d'evaluateur pour un entretien donne.
- les agregats d'entretien doivent etre recalcules a partir de ces soumissions detaillees.

Raison:

- la cible produit demande plusieurs evaluateurs, des grilles differentes selon le round, et des evaluations texte seul, score seul ou mixte.

### 4.10 `decisions`

Supprimer:

- la colonne `is_cancel`.
- la colonne `application_id`.
- la colonne `pipeline_stage_id`.

Ajouter:

- `application_progress_id`
- `justification` nullable mais obligatoire pour les annulations, retours arriere ou contournements
- `decision_mode` ou `action_kind` pour distinguer decision normale, annulation, override, rollback
- `cancels_decision_id` nullable si l'on veut tracer quelle decision est annulee

Modifier:

- `decision_type` peut rester la sortie metier (`PRE_SCREEN_ACCEPTED`, `PRE_SCREEN_REJECTED`, etc.), mais elle doit etre historisee par round et non plus rabattue sur un etat global de candidature.
- le pilotage metier et la lecture historique doivent passer par `application_progress_id`.

Raison:

- plusieurs rounds de preselection exigent un rattachement stable a l'occurrence exacte et une vraie tracabilite des annulations.

### 4.11 `mail_log` et notification runtime

Supprimer:

- l'usage de `application_progress.mail_sent` comme preuve suffisante d'envoi ou de validation d'un email critique.

Ajouter dans `mail_log` ou dans une table soeur si l'on veut isoler le metier:

- `application_id` nullable
- `application_progress_id` nullable
- `interview_id` nullable
- `decision_id` nullable
- `notification_rule_id` nullable
- `event_code`
- `requires_confirmation`
- `confirmed_at` nullable
- `confirmed_by` nullable

Modifier:

- le journal mail doit devenir la trace d'execution d'une notification de round, pas seulement une trace SMTP generique.

Raison:

- les besoins cibles sont asymetriques selon le contexte et l'issue ; il faut savoir quel round a declenche quel email et si l'envoi a ete valide manuellement.

### 4.12 Audit transverse

Ajouter:

- une table generique du type `audit_event`, avec au minimum:
  - `application_id` nullable
  - `application_progress_id` nullable
  - `entity_type`
  - `entity_id`
  - `action_type`
  - `actor_user_id`
  - `justification` nullable
  - `before_state_json` nullable
  - `after_state_json` nullable
  - `created_at`

Modifier:

- les creations, editions, suppressions logiques, validations, annulations et rollbacks doivent tous produire un evenement d'audit exploitable.

Raison:

- `mail_log` ne couvre pas l'ensemble des operations critiques.
- l'audit demande dans l'objectif cible ne pourra pas etre reconstitue uniquement avec les timestamps generiques `created_at` / `updated_at`.

## 5. Points a traiter sans imposer un nouveau schema lourd

- `pipeline_template.is_locked` peut rester dans l'immediat, mais la politique de duplication/version doit etre clarifiee avant d'autoriser les nouveaux rounds repetables sur des campagnes ouvertes.
- `campaign_form` reste la source de verite des liens campagne/formulaire ; en revanche, la resolution du quiz runtime ne doit plus supposer qu'une candidature n'a qu'un seul quiz.
- le screening automatique doit etre pense comme une option de configuration du round quiz et de sa regle de passage, pas comme un nouveau `stage_type` ni comme une obligation sur tous les quiz.

## 6. Checklist base de donnees

- creer les tables `application_quiz_attempt`, `pipeline_stage_notification_rule`, `pipeline_stage_evaluation_criterion` et `evaluation_item`
- creer aussi la bibliotheque mutualisee de grilles d'evaluation (`evaluation_grid_template`, version(s), items)
- ajouter `application_progress_id` dans `interviews` et `decisions`
- ajouter `application_quiz_attempt_id` dans `candidate_answer`
- enrichir `application_progress` pour skip, validation humaine et reouverture
- enrichir `applications` pour les resumes globaux derives et le contexte d'abandon
- enrichir `candidate_interview` pour l'etat de reponse candidat
- enrichir `evaluations` pour identifier l'evaluateur et le statut de soumission
- enrichir `mail_log` avec les references metier de round
- ajouter un mecanisme d'audit transverse
- supprimer les snapshots mono-valeur de `applications`

## 7. Checklist backend et runtime

- supprimer les resolutions metier par `stageType` unique pour `QUIZ`, `PRESELECTION` et `INTERVIEW`
- faire pointer la creation d'entretien, de decision et de tentative de quiz vers une occurrence `application_progress` explicite
- recalculer les resumes de `applications` a partir des objets de round, au lieu d'ecrire directement les colonnes legacy comme source principale
- basculer la lecture de la chronologie candidat sur `application_progress` et les objets lies
- sortir `EVALUATION` des workflows pipeline de premier niveau et la repositionner comme sous-workflow d'entretien

## 8. Checklist cartographie dashboard

- [x] mettre a jour `40-dashboard-pipeline-templates.md` pour remplacer la logique singleton `QUIZ` / `PRESELECTION` / `INTERVIEW` / `EVALUATION` par la cible repetable `QUIZ` / `PRESELECTION` / `INTERVIEW`, avec retrait de `EVALUATION` comme etape editable de premier niveau
- [x] mettre a jour `41-dashboard-pipeline-template-edit.md` pour documenter les rounds repetables, la suppression de `allowSkip` sur les rounds obligatoires et le screening automatique optionnel par stage `QUIZ`
- [x] mettre a jour `20-dashboard-candidates.md` et `21-dashboard-candidate-detail.md` pour remplacer la dependance a `applicationStatus`, `quizScorePercent`, `evaluationScore` et autres snapshots globaux par une lecture basee sur `application_progress`, `application_quiz_attempt`, `interviews` et `decisions`
- [x] mettre a jour `25-dashboard-decisions.md` pour documenter des decisions rattachees a `application_progress_id`, historisees par round, avec justification obligatoire en cas d'annulation ou de rollback
- [x] mettre a jour `30-dashboard-interviews.md` et `31-dashboard-interview-create.md` pour documenter la planification d'entretien par round `INTERVIEW`, via `application_progress_id`, sans lecture mono-valeur de la candidature
- [x] mettre a jour `35-dashboard-evaluations.md`, `90-dashboard-evaluate-fullscreen.md` et `91-dashboard-evaluate-link.md` pour repositionner l'evaluation comme sous-workflow d'entretien avec plusieurs evaluateurs, plusieurs criteres et disparition des agregats mono-valeur comme source primaire

## 9. Checklist cartographie entities

- [x] mettre a jour `20-entities-applications.md` pour supprimer des contrats cartographies les colonnes legacy retirees de `applications`
- [x] mettre a jour `30-entities-interviews.md` pour documenter `application_progress_id` comme rattachement principal et la suppression de `application_id`, `evaluation_score`, `evaluation_number`, `evaluation_percentage` et `interview_mail_sent`
- [x] mettre a jour `60-entities-decisions.md` pour documenter `application_progress_id`, `justification`, `decision_mode` et la suppression de `application_id`, `pipeline_stage_id` et `is_cancel`
- [x] mettre a jour `100-entities-candidate-answers.md` pour documenter le rattachement par `application_quiz_attempt_id` et la suppression de `application_id`
- [x] mettre a jour `110-entities-evaluations.md` pour documenter la nouvelle structure d'en-tete d'evaluation et de lignes `evaluation_item`
- [x] mettre a jour `180-entities-mail-log.md` pour documenter les references metier de round et la journalisation des validations manuelles
- [x] mettre a jour `230-entities-application-progress.md` pour documenter le role central de l'occurrence de round, les validations humaines, les reouvertures et la disparition de `mail_sent` / `decided_by`
- [x] mettre a jour `260-entities-pipeline-stages.md` pour documenter la suppression des colonnes `email_required` / `email_automatic`, l'abandon de `EVALUATION` comme type editable de premier niveau et les nouveaux objets de config de notification / grille d'evaluation

## 10. Checklist cartographie public

- [x] mettre a jour `30-suivre-candidature.md` pour remplacer la lecture de `applicationStatus` par une chronologie de rounds et plusieurs entretiens / quiz potentiels
- [x] ajouter une fiche publique dediee a la route `quiz/:applicationId/:quizToken`, puis la faire evoluer vers une lecture par tentative `application_quiz_attempt`
- [x] verifier les flux publics qui redirigent vers un quiz afin qu'ils resolvent un token de tentative explicite et non un quiz global unique par candidature

## 11. Strategie de migration recommandee

La migration doit etre menee en phases courtes avec double lecture / ecriture transitoire, controles de coherence explicites et points de validation visibles pour le front public comme pour le dashboard.

### Phase 0 - Cadrage final avant implementation

Checklist:

- [x] figer les arbitrages de `## 12` qui bloquent directement le premier lot SQL ou les contrats runtime
- [x] lister et nommer les enums / statuts cibles: `progress_status`, `quiz_status`, `candidate_response_status`, `interview_status`, `evaluation_status`, `decision_mode`
- [x] definir la regle d'agregation des resumes `aggregated_quiz_*` et `aggregated_evaluation_*`
- [x] definir la politique de coexistence ou d'invalidation des anciens `quizToken`
- [x] identifier les endpoints, jobs, scripts et batchs impactes avant la premiere migration
- [x] decider si `interviews.campaign_id`, `candidate_interview.interview_start` et `candidate_interview.interview_duration` sont temporaires ou cibles

Sorties figees de la phase 0:

- enums / statuts cibles:
  - `progress_status`: `PENDING`, `IN_PROGRESS`, `AWAITING_VALIDATION`, `COMPLETED`, `FAILED`, `SKIPPED`
  - `quiz_status`: `PENDING`, `STARTED`, `COMPLETED`, `EXPIRED`, `CANCELLED`
  - `candidate_response_status`: `PENDING`, `ACCEPTED`, `DECLINED`, `RESCHEDULE_REQUESTED`
  - `interview_status`: `SCHEDULED`, `IN_PROGRESS`, `AWAITING_EVALUATION`, `AWAITING_VALIDATION`, `CLOSED`, `CANCELLED`
  - `evaluation_status`: `DRAFT`, `SUBMITTED`, `VALIDATED`, `CANCELLED`
  - `decision_mode`: `STANDARD`, `CANCEL`, `OVERRIDE`, `ROLLBACK`
- regle d'agregation des resumes candidature:
  - `aggregated_quiz_score` = somme des points obtenus sur les tentatives retenues; `aggregated_quiz_score_percent` = somme des points obtenus / somme des points possibles * 100
  - on ne retient qu'une tentative active par round `application_progress`; si plusieurs tentatives existent pour un meme round, seule la tentative finale validee par le runtime est retenue dans le resume
  - sont exclus des resumes quiz: tentatives `CANCELLED`, `EXPIRED`, tentatives d'un round `SKIPPED`, et tentatives d'un round rouvert tant que ce round n'est pas de nouveau cloture
  - `aggregated_evaluation_score` = somme des scores de synthese retenus par entretien; `aggregated_evaluation_score_percent` = somme obtenue / somme possible * 100
  - l'agregation evaluation se fait a partir d'un resume par entretien / round, jamais par simple somme brute de toutes les soumissions evaluateur; seules les soumissions `VALIDATED` et les entretiens clos sont retenus
- politique de transition des `quizToken`:
  - le `applications.quiz_token` legacy reste accepte uniquement pendant la transition, en etant backfille vers une `application_quiz_attempt` historique unique pour chaque candidature mono-quiz existante
  - tout nouveau lien public de quiz doit etre emis sur `application_quiz_attempt.quiz_token`, jamais sur `applications.quiz_token`
  - un token doit identifier une tentative unique; si une tentative est reinitialisee ou remplacee, l'ancien token devient invalide
  - un token rattache a une tentative `COMPLETED`, `EXPIRED`, `CANCELLED` ou a une candidature abandonnee ne doit plus autoriser d'ecriture quiz
- endpoints / jobs / surfaces impactes identifies avant implementation:
  - backend public `ApplicationsController`: `/applications/verify-email`, `/applications/get-quiz`, `/applications/save-quiz-answer`, `/applications/complete-quiz`, `/applications/touch-quiz`, `/applications/progress`, `/applications/track`, `/applications/respond-interview`, `/applications/submit-ask`
  - backend recrutement / runtime: `InterviewsController` (`create`, `update`, `finish`), `PipelineTemplateController`, `PipelineStageController`, `InterviewParticipantController`, `CandidateInterviewController`, `MailLogController`
  - securite / exposition publique: `SecurityConfig` doit etre aligne avec les futurs endpoints publics de tentative quiz et ne doit plus s'appuyer implicitement sur `candidateanswer/**` comme surface de compatibilite quiz
  - batch / scheduler impacte: `ApplicationsBusiness.abandonInactiveQuizApplications()` tourne deja toutes les minutes sur `applications.quiz_status = STARTED` et devra pivoter vers `application_quiz_attempt`
  - frontend impacte: `quizapp_front/src/app/core/services/application.service.ts`, `quizapp_front/src/app/pages/quiz/quiz.ts`, `quizapp_front/src/app/pages/track-application/track-application.ts`
  - scripts / contrats a garder alignes: migrations Flyway sous `quizapp/src/main/resources/db/migration/`, `POSTMAN_API_GUIDE.md`, collections Postman `src/main/resources/json/rest_api.postman_collection*.json`
- statut des champs transitoires:
  - `interviews.campaign_id` est conserve comme denormalise transitoire controle jusqu'en phase E, avec coherence obligatoire vis-a-vis de `application_progress -> application -> campaign`; il n'est pas une source de verite cible
  - `candidate_interview.interview_start` et `candidate_interview.interview_duration` restent des snapshots transitoires tant que les flux publics et dashboards existants les lisent encore; pendant la migration ils doivent etre resynchronises depuis `interviews` et cesser d'etre traites comme source officielle

Fichiers cartographie lies:

- entities: `cartographie-fonctionnelle-front/entities/20-entities-applications.md`, `cartographie-fonctionnelle-front/entities/180-entities-mail-log.md`, `cartographie-fonctionnelle-front/entities/230-entities-application-progress.md`, `cartographie-fonctionnelle-front/entities/260-entities-pipeline-stages.md`
- dashboard: `cartographie-fonctionnelle-front/dashboard/20-dashboard-candidates.md`, `cartographie-fonctionnelle-front/dashboard/21-dashboard-candidate-detail.md`, `cartographie-fonctionnelle-front/dashboard/40-dashboard-pipeline-templates.md`, `cartographie-fonctionnelle-front/dashboard/41-dashboard-pipeline-template-edit.md`
- public: `cartographie-fonctionnelle-front/public/30-suivre-candidature.md`, `cartographie-fonctionnelle-front/public/80-quiz-public.md`

### Phase A - Ajouter le schema cible sans casser l'existant

Implementation SQL:

- `quizapp/src/main/resources/db/migration/V1_060__add_multi_occurrence_phase_a_schema.sql`

Checklist:

- [x] creer `application_quiz_attempt`
- [x] creer `pipeline_stage_notification_rule`
- [x] creer `evaluation_grid_template`, `evaluation_grid_template_version` et `evaluation_grid_template_item`
- [x] creer `pipeline_stage_evaluation_criterion`
- [x] creer `evaluation_item`
- [x] creer `audit_event`
- [x] ajouter `application_progress_id` nullable dans `interviews` et `decisions`
- [x] ajouter `application_quiz_attempt_id` nullable dans `candidate_answer`
- [x] enrichir `application_progress` pour validation, skip et reouverture
- [x] enrichir `applications` pour pointeurs courants, resumes derives et contexte d'abandon
- [x] enrichir `candidate_interview`, `interview_participant`, `evaluations` et `mail_log`
- [x] poser les index, contraintes de coherence et valeurs par defaut minimales sans encore supprimer les colonnes legacy

Fichiers cartographie lies:

- entities: `cartographie-fonctionnelle-front/entities/20-entities-applications.md`, `cartographie-fonctionnelle-front/entities/30-entities-interviews.md`, `cartographie-fonctionnelle-front/entities/60-entities-decisions.md`, `cartographie-fonctionnelle-front/entities/100-entities-candidate-answers.md`, `cartographie-fonctionnelle-front/entities/110-entities-evaluations.md`, `cartographie-fonctionnelle-front/entities/120-entities-candidate-interview.md`, `cartographie-fonctionnelle-front/entities/180-entities-mail-log.md`, `cartographie-fonctionnelle-front/entities/220-entities-interview-participant.md`, `cartographie-fonctionnelle-front/entities/230-entities-application-progress.md`, `cartographie-fonctionnelle-front/entities/260-entities-pipeline-stages.md`
- dashboard: `cartographie-fonctionnelle-front/dashboard/30-dashboard-interviews.md`, `cartographie-fonctionnelle-front/dashboard/31-dashboard-interview-create.md`, `cartographie-fonctionnelle-front/dashboard/35-dashboard-evaluations.md`, `cartographie-fonctionnelle-front/dashboard/40-dashboard-pipeline-templates.md`, `cartographie-fonctionnelle-front/dashboard/41-dashboard-pipeline-template-edit.md`
- public: `cartographie-fonctionnelle-front/public/30-suivre-candidature.md`, `cartographie-fonctionnelle-front/public/80-quiz-public.md`

### Phase B - Backfill et controles de coherence

Implementation SQL:

- `quizapp/src/main/resources/db/migration/V1_061__backfill_multi_occurrence_phase_b.sql`

Sortie des cas a arbitrer:

- journalisation dans `audit_event` avec des actions `PHASE_B_*` pour les rattachements non deterministes ou les incoherences legacy detectees

Checklist:

- [x] rattacher chaque entretien existant a la bonne ligne `application_progress`
- [x] rattacher chaque decision existante a la bonne ligne `application_progress`
- [x] creer une `application_quiz_attempt` historique pour chaque candidature qui n'a connu qu'un quiz legacy
- [x] renseigner `candidate_answer.application_quiz_attempt_id`
- [x] backfiller `current_application_progress_id`, `last_progressed_at` et `abandoned_from_application_progress_id` quand l'information est reconstructible
- [x] recalculer une premiere fois les resumes `aggregated_quiz_*` et `aggregated_evaluation_*`
- [x] verifier les coherences `application_quiz_attempt.application_id` / `application_progress_id`, `interviews.application_progress_id` / `campaign_id`, `candidate_interview` / `interview`
- [x] sortir une liste de cas ambigus a arbitrer manuellement avant toute bascule de lecture ou d'ecriture

Fichiers cartographie lies:

- entities: `cartographie-fonctionnelle-front/entities/20-entities-applications.md`, `cartographie-fonctionnelle-front/entities/30-entities-interviews.md`, `cartographie-fonctionnelle-front/entities/60-entities-decisions.md`, `cartographie-fonctionnelle-front/entities/100-entities-candidate-answers.md`, `cartographie-fonctionnelle-front/entities/120-entities-candidate-interview.md`, `cartographie-fonctionnelle-front/entities/230-entities-application-progress.md`
- dashboard: `cartographie-fonctionnelle-front/dashboard/20-dashboard-candidates.md`, `cartographie-fonctionnelle-front/dashboard/21-dashboard-candidate-detail.md`, `cartographie-fonctionnelle-front/dashboard/25-dashboard-decisions.md`, `cartographie-fonctionnelle-front/dashboard/30-dashboard-interviews.md`
- public: `cartographie-fonctionnelle-front/public/30-suivre-candidature.md`, `cartographie-fonctionnelle-front/public/80-quiz-public.md`

### Phase C - Basculer les lectures

Checklist:

- [ ] faire lire la chronologie candidat depuis `application_progress` et les objets de round lies
- [x] faire lire le quiz public depuis `application_quiz_attempt` et non plus depuis un quiz global de candidature
- [ ] faire lire les ecrans candidats / detail candidat a partir des resumes recalcules et des objets runtime, pas des snapshots legacy
- [ ] faire lire les entretiens et les decisions depuis `application_progress_id`
- [ ] faire lire les evaluations depuis `evaluations` + `evaluation_item` + `interview_participant`
- [ ] faire renvoyer par `applications/track` et les flux publics des actions deja resolues sur l'occurrence precise concernee
- [ ] conserver au besoin un fallback temporaire de lecture legacy uniquement pour les dossiers encore non backfilles

Statut d'implementation:

- backend pose sur `ApplicationsBusiness.getQuizForApplication`: resolution d'une tentative via `application_quiz_attempt.quiz_token`, lecture du `form_version` et des `candidate_answer` par tentative avec fallback legacy par `application_id`
- contrat public conserve: les endpoints et le JSON restent compatibles, avec exposition additionnelle de `applicationQuizAttemptId` et `applicationProgressId` dans la charge utile du quiz
- detail candidature admin: l'onglet des reponses groupe maintenant les `candidate_answer` par `applicationQuizAttemptId` pour distinguer visuellement les tentatives et isoler le bloc legacy sans tentative explicite
- detail candidature admin: le meme endpoint `candidateanswer/getAllByCriteria` remonte maintenant le statut, la correction manuelle, le score et les horodatages de `application_quiz_attempt`, ce qui rend les groupes de tentative lisibles sans nouvelle API dediee
- admin candidature: une action `applications/custom` permet maintenant de creer une nouvelle `application_quiz_attempt`, de remettre le resume quiz sur cette occurrence et de copier le lien public `/quiz/{applicationId}/{quizToken}` depuis l'ecran de detail
- detail candidature admin: la candidature recharge maintenant un resume typé de ses `application_quiz_attempt`, ce qui affiche aussi les tentatives encore vides et permet de recopier a posteriori chaque lien quiz deja genere
- detail candidature admin: la tentative quiz explicite la plus recente est aussi mise en avant au niveau du resume de la candidature, avec statut, correction, score, activite et copie du lien courant sans devoir ouvrir d'abord l'onglet des reponses
- liste candidatures admin: le tableau reflète maintenant le quiz courant via le miroir `applications.*` (statut, score/correction et copie du lien public courant), ce qui évite d'ouvrir chaque ligne pour identifier l'occurrence quiz active
- detail candidature admin: l'onglet des entretiens remonte maintenant `interviewDate` et `interviewStatus` depuis `CandidateInterviewDto`, trie les occurrences par priorite métier et met en avant l'entretien courant directement dans le resume de la candidature
- liste candidatures admin: le miroir `applications.interviewDate` / `applications.interviewStatus` est maintenant resynchronise depuis les flux entretien (create/update/delete/finish/reponse candidat), ce qui permet d'afficher l'entretien courant directement dans le tableau sans charger le detail
- detail candidature admin: `CandidateInterviewDto` remonte maintenant aussi les metriques d'evaluation de `Interviews` (`evaluationScore`, `evaluationNumber`, `evaluationPercentage`), ce qui permet d'afficher l'evaluation courante de l'entretien courant dans le resume candidature et dans l'onglet Entretiens
- liste candidatures admin: `applications.*` porte maintenant aussi le miroir de l'evaluation de l'entretien courant (`currentInterviewEvaluationScore`, `currentInterviewEvaluationNumber`, `currentInterviewEvaluationPercentage`), resynchronise sur les flux entretien et reponse candidat, ce qui permet d'afficher l'evaluation courante directement dans le tableau
- public `applications/track`: chaque entretien renvoie maintenant aussi `applicationProgressId` et les metadonnees de stage (`pipelineStageId`, `pipelineStageType`, `pipelineStageLabel`, `pipelineStageOrder`), puis l'ecran public trie ces cartes par ordre d'occurrence pipeline avant fallback sur la date; un candidat peut donc rattacher chaque invitation / reponse au bon round `INTERVIEW` meme si plusieurs occurrences existent
- public `applications/track`: les reponses candidat d'entretien lisent maintenant le statut persistant `candidate_interview.candidate_response_status` (avec fallback legacy sur `declineReason` / `alternativeDateRequested`), exposent aussi `respondedAt`, ferment `canRespond` des qu'une occurrence est deja resolue (`ACCEPTED`, `DECLINED`, `RESCHEDULE_REQUESTED`), et `InterviewsBusiness.resetCandidateInterviewResponse(...)` remet explicitement cette occurrence a `PENDING` quand un nouveau creneau est repropose
- public `applications/track`: le contrat d'entretien distingue maintenant explicitement `candidateInterviewId` (ID du lien candidat / occurrence a poster sur `respond-interview`) et `interviewId` (ID metier de l'entretien), ce qui retire l'ambiguite precedente autour du champ generique `id` tout en gardant ce dernier pour compatibilite
- public `applications/track`: un objet `quiz` explicite maintenant aussi la tentative publique courante (`applicationQuizAttemptId`, `applicationProgressId`, `quizToken`, statut, contexte de stage) avec une selection occurrence-aware priorisant une tentative `STARTED` ou `PENDING`, puis la page `/suivre-candidature` affiche un CTA de reprise vers `/quiz/:applicationId/:quizToken` seulement quand cette tentative est encore actionnable
- liste/detail candidatures admin: `applications.*` porte maintenant aussi le miroir de la preselection courante (`currentPreselectionDecisionType`, `currentPreselectionDecisionDate`), recalcule depuis la derniere decision de preselection non annulee sur les flux create/update/delete/cancel de `DecisionBusiness`, ce qui permet d'afficher la preselection courante sans charger une API enfant dediee
- liste/detail candidatures admin: `applications.*` porte maintenant aussi le miroir de la decision finale courante (`currentFinalDecisionType`, `currentFinalDecisionDate`), recalcule depuis la derniere decision finale non annulee sur les flux create/update/delete/cancel de `DecisionBusiness`, ce qui permet d'afficher la decision finale courante sans charger une API enfant dediee
- liste/detail candidatures admin: `applications.*` porte maintenant aussi le miroir de l'etape pipeline courante (`currentPipelineStageType`, `currentPipelineStageLabel`, `currentPipelineProgressStatus`), aligne sur la meme regle que `ApplicationProgressBusiness.getCurrentStage(...)` (`IN_PROGRESS`, sinon premiere `PENDING`) et resynchronise depuis les mutations `application_progress`, ce qui permet de voir l'etape courante sans charger le pipeline enfant
- detail candidature admin: l'ecran charge maintenant aussi l'historique `Decision` par candidature via `DecisionService.getDecisionsByApplicationId(...)`, expose un onglet `Decisions` trie du plus recent au plus ancien, remonte `applicationProgressId` depuis le backend et rattache chaque decision a son occurrence `application_progress` chargee dans le meme detail, ce qui rend visibles les rounds de preselection / decision finale et la ligne courante sans passer par la page dashboard dediee
- dashboard decisions: la timeline runtime remonte maintenant aussi `decisionMode`, `justification` et `cancelsDecisionId`, envoie `pipelineStageId` / `applicationProgressId` sur les creations et annulations, puis affiche l'occurrence cible et la lignée d'annulation directement dans l'historique
- dashboard decisions: les actions de decision passent maintenant par une vraie modal de justification au lieu d'un `prompt`, avec justification requise pour une annulation historisee et fermeture clavier (`Escape`) alignee sur le reste de l'ecran
- backend decisions: `DecisionBusiness` impose maintenant aussi la `justification` pour toute decision critique (`CANCEL`, `OVERRIDE`, `ROLLBACK`), ce qui retire la dependance a la seule validation front pour l'audit
- backend decisions: `DecisionBusiness.update(...)` refuse maintenant aussi la mutation des ancrages historises (`isCancel`, `decisionMode`, `pipelineStageId`, `applicationProgressId`, `cancelsDecisionId`) et, pour une ligne d'annulation, verrouille aussi `applicationId`, `userId` et `decisionType`; l'API n'accepte donc plus de retargeter une decision historisee hors du flux metier dedie
- backend decisions: le endpoint `update` accepte maintenant aussi de vraies mises a jour partielles; il ne reapplique plus les validations de creation (`decisionType`, `isCancel`, `applicationId`, `userId`) quand ces champs ne sont pas fournis, resolve les permissions sur la candidature existante si besoin, et n'evalue les champs immuables que lorsqu'ils sont explicitement presents dans la requete
- backend decisions: `DecisionBusinessTest` couvre maintenant explicitement deux non-regressions sur `update(...)`: une annulation historisee peut etre corrigee avec un payload partiel `id + justification`, tandis qu'une tentative de retargeting de `applicationProgressId` reste refusee cote serveur
- crud generique `entities-decisions`: la creation brute est maintenant limitee aux decisions standard et renvoie les annulations historisees vers le dashboard metier, tout en laissant la `justification` editable sur les lignes existantes
- crud generique `entities-decisions`: le tableau et le panneau detail rendent maintenant aussi `decisionMode`, `applicationProgressId`, `cancelsDecisionId` et un apercu de `justification`, ce qui rend la lecture des decisions occurrence-aware possible meme hors dashboard metier
- crud generique `entities-decisions`: le panneau de filtres avances et le backend `getByCriteria` savent maintenant aussi filtrer par `decisionMode`, `pipelineStageId`, `applicationProgressId`, `cancelsDecisionId`, `isCancel` et texte de `justification`, tandis que la recherche rapide couvre egalement `decisionMode` et `justification`
- crud generique `entities-decisions`: le panneau detail partage est maintenant entierement en lecture seule sur cette entite, et toute modification passe par la modal dediee de la ligne; on evite ainsi l'edition inline des champs sensibles d'une decision historisee hors du dashboard metier
- crud generique `entities-decisions`: dans la modal d'edition, une ligne `isCancel=true` ne laisse plus modifier que la `justification`; `applicationId`, `userId` et `decisionType` restent verrouilles pour ne pas deformer une annulation historisee
- crud generique `entities-decisions`: une ligne `isCancel=true` envoie maintenant un payload d'update minimal (`id`, `justification`) au backend, ce qui aligne la surface admin avec le nouveau contrat de mise a jour partielle
- crud generique `entities-decisions`: une spec Angular dediee verrouille maintenant ce contrat front, en couvrant a la fois le payload minimal des annulations historisees et la conservation d'un payload complet pour une decision standard
- dashboard metier `decisions`: une spec Angular dediee verrouille maintenant aussi les payloads de creation, avec un chemin `STANDARD` ancre sur `applicationProgressId` pour la decision courante et un chemin `CANCEL` historise qui renseigne `cancelsDecisionId` plus une `justification` trimmee
- dashboard metier `decisions`: cette spec couvre maintenant aussi la garde de la modal d'annulation; en mode `UNDO`, aucune requete `createDecision` ne part tant que la `justification` reste vide
- backend API `DecisionController`: un test controller HTTP verrouille maintenant le contrat JSON partiel de `/decisions/update`, en verifiant qu'un payload `datas:[{id, justification}]` traverse bien l'endpoint sans reintroduire les champs omis
- backend API `DecisionController`: la couverture controller verrouille maintenant aussi le chemin d'erreur courant de `/decisions/update`; quand le backend remonte `hasError=true`, l'endpoint conserve le contrat HTTP existant (`200` + payload d'erreur inchangé)
- backend API `DecisionController`: le meme niveau de couverture verrouille maintenant aussi `/decisions/create` pour une annulation historisee, en verifiant qu'un payload `CANCEL` conserve `applicationProgressId`, `decisionMode`, `cancelsDecisionId` et `justification` jusqu'a la delegation controller
- backend API `DecisionController`: la couverture controller verrouille maintenant aussi les trois sorties d'erreur de `/decisions/create`; si la creation remonte une erreur metier, ou si elle revient sans aucune ligne creee (liste vide ou `null`), l'endpoint repond bien en `400 Bad Request`
- shared `EntityDetailPanel`: les `detailFields` peuvent maintenant fournir un libelle calcule par champ, ce qui permet d'afficher dans le panneau detail des references metier lisibles (`Candidature`, `Occurrence`, `Decision annulee`) au lieu de simples IDs bruts
- detail candidature admin: l'onglet `Decisions` affiche maintenant aussi `decisionMode`, `justification` et `cancelsDecisionId`, ce qui rend lisibles la decision annulee, l'occurrence ciblee et le commentaire associe directement depuis la fiche candidature
- detail candidature admin: l'ecran charge maintenant aussi l'historique `ApplicationProgress` par candidature via `ApplicationProgressService.getByApplication(...)`, expose un onglet `Pipeline` ordonne par `stageOrder`, reutilise la meme regle de selection de l'etape courante (`IN_PROGRESS`, sinon premiere `PENDING`) et rend visibles statut, ordre, email envoye, notes et horodatages directement dans le detail candidature
- detail candidature admin: l'ecran agrege maintenant aussi l'historique `Evaluation` a partir des `candidate_interview` deja charges, appelle `EvaluationService.getEvaluationsByCandidateInterviewId(...)` pour chaque occurrence d'entretien, expose un onglet `Evaluations` trie du plus recent au plus ancien et rend visibles note, commentaire, evaluateur et rattachement a l'entretien courant sans ajouter de nouvel endpoint backend
- backend runtime: premier vrai slice multi-occurrences livre pour `INTERVIEW`; `V1_066__link_interviews_to_application_progress.sql` ajoute `interviews.application_progress_id`, `InterviewsBusiness` rattache chaque entretien a son `application_progress` courant sur create/update, et la fin d'entretien comme le recalcul d'evaluation resynchronisent desormais l'occurrence exacte au lieu de retomber sur la premiere etape `INTERVIEW` resolue globalement par `stageType`
- backend runtime: deuxieme slice livre pour `PRESELECTION` / `DECISION`; `DecisionBusiness` n'utilise plus prioritairement `findByTemplateIdAndStageType(...)` pour synchroniser le pipeline et le mail, il prefere desormais le `pipelineStage` exact deja porte par `Decision`, puis l'occurrence courante resolue par `ApplicationProgressBusiness`, et ne retombe sur la resolution singleton de template qu'en dernier filet de retrocompatibilite
- backend runtime: premier sous-slice livre pour `EVALUATION`; `EvaluationsBusiness` mappe maintenant `interviewParticipant`, `evaluationStatus` et `submittedAt`, rattache automatiquement une evaluation au `interview_participant` de l'acteur quand il existe sur l'entretien courant, et resynchronise le suivi `evaluation_status` / `evaluation_submitted_at` du participant sur create/update/delete
- front runtime `evaluations`: le dashboard envoie maintenant aussi explicitement `interviewParticipantId` dans les payloads create/update quand `currentUserParticipantId` est connu, ce qui aligne le contrat Angular avec le nouveau write path backend sans depender uniquement de l'inference par `userId`
- backend API `EvaluationsController`: le create aligne maintenant son contrat HTTP sur `DecisionController`; si la creation remonte `hasError=true`, ou revient sans aucune ligne creee (`null` / vide), l'endpoint repond en `400 Bad Request` au lieu de tenter de construire une reponse `201` invalide
- backend/runtime pipeline templates: `PipelineStageBusiness` refuse maintenant la creation d'un nouveau stage top-level `EVALUATION` ainsi que la conversion d'une autre etape vers ce type, tout en laissant un ancien stage `EVALUATION` legacy editable tant qu'il conserve ce type; le meme slice corrige aussi `update(...)` pour qu'une omission de `stageType` reste une vraie omission et non une mutation `null`
- front pipeline templates: `pipeline-template-edit` ne propose plus `EVALUATION` parmi les types intermediaires creables, mais laisse encore visible un ancien stage `EVALUATION` charge depuis un template legacy afin de pouvoir le migrer sans casser l'ecran
- tests pipeline templates: `PipelineStageBusinessTest` verrouille l'interdiction backend create/update vers `EVALUATION` et la preservation d'un stage legacy deja existant; `pipeline-template-edit.spec.ts` verrouille le retrait de `EVALUATION` des nouveaux choix front tout en gardant visible une occurrence legacy existante
- tests evaluations runtime: `EvaluationsBusinessTest` verrouille le chemin create normalise du dashboard, en verifiant qu'une evaluation creee par un participant s'ancre sur `interview_participant` et met a jour le suivi de depot de ce participant
- tests evaluations runtime: `evaluations.spec.ts` verrouille maintenant aussi le contrat front du dashboard, en couvrant create et update avec un payload qui transmet explicitement `candidateInterviewId` + `interviewParticipantId`
- tests evaluations runtime: `EvaluationsControllerTest` verrouille maintenant aussi le contrat HTTP create/update, en couvrant la transmission JSON de `interviewParticipantId` jusqu'a la delegation controller et les branches `400` du create (`hasError`, items `null`, items vides)

Fichiers cartographie lies:

- entities: `cartographie-fonctionnelle-front/entities/20-entities-applications.md`, `cartographie-fonctionnelle-front/entities/30-entities-interviews.md`, `cartographie-fonctionnelle-front/entities/100-entities-candidate-answers.md`, `cartographie-fonctionnelle-front/entities/110-entities-evaluations.md`, `cartographie-fonctionnelle-front/entities/120-entities-candidate-interview.md`, `cartographie-fonctionnelle-front/entities/230-entities-application-progress.md`
- dashboard: `cartographie-fonctionnelle-front/dashboard/20-dashboard-candidates.md`, `cartographie-fonctionnelle-front/dashboard/21-dashboard-candidate-detail.md`, `cartographie-fonctionnelle-front/dashboard/25-dashboard-decisions.md`, `cartographie-fonctionnelle-front/dashboard/30-dashboard-interviews.md`, `cartographie-fonctionnelle-front/dashboard/35-dashboard-evaluations.md`, `cartographie-fonctionnelle-front/dashboard/90-dashboard-evaluate-fullscreen.md`, `cartographie-fonctionnelle-front/dashboard/91-dashboard-evaluate-link.md`
- public: `cartographie-fonctionnelle-front/public/30-suivre-candidature.md`, `cartographie-fonctionnelle-front/public/80-quiz-public.md`

### Phase D - Basculer les ecritures runtime

Checklist:

- [x] faire creer chaque nouvelle tentative de quiz sur `application_quiz_attempt` a partir d'un `application_progress` explicite
- [x] faire ecrire `save-quiz-answer`, `touch-quiz` et `complete-quiz` sur la tentative et ses reponses dediees
- [x] faire creer les entretiens sur `interviews.application_progress_id` et faire vivre la reponse candidat sur `candidate_interview`
- [x] faire ecrire les decisions sur `decisions.application_progress_id` avec `decision_mode`, justification et annulation historisee
- [x] faire ecrire les evaluations sur `evaluations` + `evaluation_item`, avec suivi par `interview_participant`
- [x] faire ecrire les notifications critiques sur `mail_log` avec references de round, et l'audit sur `audit_event`
- [x] recalculer ou resynchroniser `applications.*` comme resume derive, sans retransformer ces colonnes en source primaire
- [x] bloquer la creation de nouveaux stages `EVALUATION` dans les nouveaux templates

Statut d'implementation:

- backend pose sur `ApplicationsBusiness.saveQuizAnswer`, `touchQuizActivity` et `completeQuiz`: ecriture des `candidate_answer` par `application_quiz_attempt_id`, gestion de l'activite, du temps ecoule, du statut et de la completion sur la tentative quiz
- creation de la tentative initiale quiz branchee sur `ApplicationsBusiness.verifyEmail`: emission du `quiz_token`, creation de `application_quiz_attempt` et rattachement explicite a l'`application_progress` de stage `QUIZ`
- initialisation des reponses quiz alignee sur la tentative quand un `quiz_token` pointe vers `application_quiz_attempt`, avec fallback legacy conserve uniquement pour les dossiers historiques deja engages et non encore completement rattaches
- backend pose sur `ApplicationsBusiness`: la resynchronisation du resume quiz ne force plus `applications.applicationStatus = SUBMITTED`; le helper partage `syncApplicationQuizSummaryFromAttempt(...)` repasse maintenant par `ApplicationProgressBusiness.syncApplicationStatus(...)` pour recalculer `applicationStatus` et `currentPipeline*` depuis `application_progress`, et le CRUD generique `update(...)` n'autorise plus l'ecriture directe de `applicationStatus`, `quizScore` ni des agregats `totalEvaluation*`
- backend pose sur `ApplicationsBusiness.create(...)`: le mapper de creation n'accepte plus non plus `applicationStatus`, `quizScore` ni `totalEvaluation*` depuis `ApplicationsDto`; ces colonnes restent initialisees ou resynchronisees exclusivement par le runtime (`application_progress`, quiz attempts, evaluations) au lieu d'etre injectables a la creation
- correction manuelle backend/front alignee sur `applicationQuizAttemptId` quand il est disponible, pour eviter les collisions de scoring ou de carrier sur plusieurs tentatives d'une meme question
- backend pose sur `DecisionBusiness`: `Decision` mappe maintenant `applicationProgress`, `DecisionDto` expose `applicationProgressId`, et les flux create/update/sync/mail resoudent d'abord l'occurrence `application_progress` exacte avant de retomber seulement sur l'occurrence courante de meme `stageType`; le fallback singleton template `findByTemplateIdAndStageType(...)` a ete retire de ce runtime
- backend pose sur `DecisionBusiness`: `Decision` mappe maintenant aussi `decisionMode`, `justification` et `cancelsDecision`, les creations de decision sont sauvegardees avant resynchronisation, les annulations historisees ciblent explicitement la decision annulee, rouvrent l'etape via `ApplicationProgressBusiness.rollbackStage(...)`, et les resumes courants ignorent desormais les decisions neutralisees par une ligne `CANCEL`
- backend pose sur `mail_log`: `MailLog`, `MailLogService` et `HostingUtils` supportent maintenant `applicationId`, `applicationProgressId`, `interviewId`, `decisionId`, `eventCode` et `requiresConfirmation`; les invitations d'entretien, emails de decision, email de verification candidature et email de resultat `candidate_ask` injectent deja ce contexte pour journaliser l'execution sur l'application et, quand elle est resolvable, sur l'occurrence pipeline courante. Les derniers `sendEmail(...)` sans contexte observes a ce stade sont l'invitation d'inscription admin (`InvitationCodeBusiness`) et le mail de test SMTP (`SmtpConfigBusiness`), hors perimetre runtime candidat de cette phase
- backend pose sur `audit_event`: le socle JPA/service existe maintenant; `DecisionBusiness` emet des evenements `DECISION_CREATED`, `DECISION_UPDATED`, `DECISION_DELETED`, `DECISION_CANCELLED`, `DECISION_OVERRIDDEN` ou `DECISION_ROLLED_BACK`, `EvaluationsBusiness` emet `EVALUATION_CREATED`, `EVALUATION_UPDATED` et `EVALUATION_DELETED`, `InterviewsBusiness` emet `INTERVIEW_CREATED`, `INTERVIEW_UPDATED`, `INTERVIEW_DELETED` et `INTERVIEW_FINISHED`, et `CandidateAskBusiness` emet maintenant aussi `CANDIDATE_ASK_APPROVED` / `CANDIDATE_ASK_REJECTED`; tous ces evenements portent `application_id`, un `application_progress_id` quand il est resolvable, et des snapshots avant/apres du runtime touche, ce qui couvre maintenant les mutations metier critiques branchees dans cette phase D
- backend pose sur `EvaluationsBusiness`: `Evaluations` mappe maintenant aussi `interviewParticipant`, `evaluationStatus` et `submittedAt`; si l'acteur courant est present dans `interview_participant` pour l'entretien cible, la creation ou mise a jour d'evaluation rattache desormais explicitement cette ligne et resynchronise `interview_participant.evaluation_status` / `evaluation_submitted_at`
- backend pose sur `EvaluationsBusiness`: quand le payload fournit `evaluationItems[*].pipelineStageEvaluationCriterionId`, create/update ecrivent maintenant un premier detail par critere dans `evaluation_item`, avec validation du `pipeline_stage` courant et snapshots `weight_snapshot` / `max_score_snapshot`; la suppression d'une evaluation marque aussi ses lignes `evaluation_item` comme supprimees
- backend pose sur `EvaluationsBusiness`: la lecture enrichie charge maintenant aussi `evaluation_item` meme quand `getByCriteria` retourne plusieurs evaluations, ce qui ouvre un premier vrai read path backend pour les listes d'evaluations et plus seulement pour une lecture unitaire
- backend pose sur `EvaluationsBusiness`: `evaluationItems` devient maintenant un set autoritaire a l'update; quand le payload envoie une liste vide ou retire un critere, les anciennes lignes `evaluation_item` absentes du payload sont marquees supprimees, ce qui evite de conserver des details obsoletes apres edition
- backend pose sur `EvaluationsController`: `/evaluations/create` refuse maintenant les reponses metier invalides sans item cree, les tests controller verrouillent la deserialisation HTTP de `evaluationItems[*]` sur create/update, et un nouvel endpoint `/evaluations/getCriteria` expose les criteres du stage courant a partir du `candidateInterviewId`
- front pose sur `dashboard/evaluations`: `EvaluationService` expose maintenant `interviewParticipantId`, et `submitEvaluation` / `saveEditEvaluation` l'ajoutent au payload quand `currentUserParticipantId` est resolu depuis le roster d'entretien
- front pose sur `dashboard/evaluations`: les evaluations chargees remontent maintenant `evaluationItems` jusque dans les messages du chat et affichent en lecture seule le detail critere (label, valeur, note) quand le backend le renvoie
- front pose sur `dashboard/evaluations`: l'ecran charge aussi les criteres du stage via `/evaluations/getCriteria`, initialise des drafts create/edit par critere et envoie maintenant `evaluationItems` sur create/update; des qu'une grille comporte des criteres scorables, le score global `candidateMark` est maintenant derive de ces items dans le payload et affiche comme score derive, avec fallback manuel conserve uniquement pour les grilles sans score
- front pose sur `dashboard/evaluations-list`: la liste des entretiens evaluables resolve maintenant aussi les `candidateInterview`, recharge les evaluations de chaque round et affiche sur chaque carte un premier apercu de la derniere soumission (nombre de soumissions, score derive, premiers criteres) au lieu de rester limitee aux seuls agregats `evaluationScore` / `evaluationPercentage`
- front pose sur `dashboard/evaluations-list`: la page croise maintenant aussi `interviewParticipant` et `user` pour afficher, sur chaque carte, le roster des evaluateurs et leur etat reel de soumission (`Soumis`, `Termine`, `En ligne`, `Assigne`) au lieu de reduire le suivi a un simple compteur global
- backend/front pose sur `interviews`: le DTO d'entretien remonte maintenant aussi `applicationProgressId` et les metadonnees de son stage pipeline (`pipelineStageId`, `pipelineStageType`, `pipelineStageLabel`, `pipelineStageOrder`), ce qui permet aux vues front de se rattacher au bon `application_progress` sans remapping heuristique
- backend/front pose sur `interviews` + `dashboard/evaluations-list`: le contrat d'entretien remonte maintenant aussi `interviewRound`, calcule cote backend a partir des occurrences d'entretien d'une meme candidature; la liste n'a donc plus besoin de reconstituer localement le round ni de faire un fetch auxiliaire `applicationProgress.byApplication` pour afficher le contexte exact de la carte
- backend data repair: `V1_067__backfill_missing_legacy_pipeline_runtime.sql` reconstruit aussi le runtime manquant des candidatures legacy ignorees par `V1_010` (lignes `application_progress`, tentative `application_quiz_attempt`, rattachement `candidate_answer.application_quiz_attempt_id`, reliaison `interviews.application_progress_id`, recomputation des miroirs d'etape courante), ce qui ferme le trou des seeds locales qui n'avaient jamais bascule vers la chronologie pipeline
- front pose sur `dashboard/interviews`: la page de gestion des entretiens affiche maintenant elle aussi le contexte d'occurrence directement depuis `InterviewService` (`interviewRound`, `pipelineStageLabel`, `applicationProgressId`) sur les cartes, le panneau detail et la vue calendrier jour, ce qui retire l'ambiguite visuelle entre plusieurs rounds `INTERVIEW` d'une meme candidature
- front pose sur `dashboard/interview-create`: le selecteur des candidatures a planifier prefere maintenant `applications.currentPipelineStageType/currentPipelineProgressStatus` pour n'exposer que la vraie occurrence runtime `INTERVIEW` sans entretien courant deja resume, ne retombe sur `applicationStatus = PRE_SCREEN_ACCEPTED` qu'en filet de retrocompatibilite quand aucun miroir runtime n'est encore disponible, et affiche sur chaque carte candidate le contexte de lecture utilise (`Entretien` / `En attente`, ou fallback legacy explicite)
- front pose sur `dashboard/entities/solo/interviews`: le CRUD generique des entretiens rend maintenant aussi le contexte pipeline de la ligne (`interviewRound`, `pipelineStageLabel`, `applicationProgressId`) dans le tableau et le panneau detail, ce qui aligne la lecture admin technique avec les vues metier deja occurrence-aware
- front pose sur `dashboard/entities/solo/interviews`: l'onglet enfant `Candidats` lit maintenant aussi `candidateInterview.interviewDate`, `interviewStatus`, `declineReason` et `alternativeDateRequested`, ce qui remonte un vrai etat de reponse candidat par occurrence d'entretien au lieu d'un simple lien technique `applicationId + interviewStart`
- front pose sur `dashboard/entities/solo/applications`: quand les enfants runtime sont deja charges, les résumés courants d'entretien, d'évaluation et d'étape pipeline preferent maintenant `candidateInterview` / `applicationProgress` aux miroirs `applications.interview*`, `currentInterviewEvaluation*` et `currentPipelineStage*`, ce qui reduit encore la dependance aux snapshots legacy dans la vue admin candidature
- front pose sur `dashboard/entities/solo/applications`: les résumés courants de pré-sélection et de décision finale preferent maintenant aussi les `decisions` runtime chargées, et ignorent une décision explicitement annulée au lieu de la faire réapparaître via `currentPreselectionDecision*` ou `currentFinalDecision*`
- front pose sur `dashboard/entities/solo/applications`: la colonne `quiz courant` prefère maintenant la tentative runtime chargée (statut, score, correction manuelle, token de lien) au miroir `applications.quiz*`, ce qui retire un autre snapshot mono-occurrence du tableau admin candidature
- front pose sur `dashboard/entities/solo/applications`: le badge de statut global affiché dans le tableau est maintenant dérivé du runtime courant (décision finale, étape entretien, pré-sélection, quiz) avant fallback sur `applicationStatus`, ce qui réduit encore la portée métier du miroir legacy
- front pose sur `dashboard/decisions`: le panneau d’étape recharge maintenant `quizAttempts` et `candidateInterview` à la sélection d’une candidature, puis préfère ces valeurs runtime pour le score du quiz, la date / le statut d’entretien et le score d’évaluation au lieu de laisser les miroirs `Application` dominer la lecture
- front pose sur `dashboard/decisions`: les badges de statut candidat, les compteurs de header et les filtres `En attente` / `Pré-sélectionnés` / `Décisions finales` dérivent maintenant d'abord du runtime courant (`application_progress` chargé, puis `currentPreselectionDecisionType` / `currentFinalDecisionType` / `currentPipelineStage*`) avant fallback sur `applicationStatus`, ce qui évite de reclasser une candidature au mauvais bucket quand le snapshot legacy a divergé
- front pose sur `dashboard/candidates`: chaque carte recharge maintenant aussi `quizAttempts` et `candidateInterview` par candidature, prefere ces valeurs runtime pour le quiz courant, le score courant, l'entretien courant et l'évaluation courante, et le CTA `Planifier` ne s'ouvre plus que sur une vraie étape pipeline `INTERVIEW` runtime courante (`active` ou `pending`), sans retomber sur `applicationStatus`, `interviewDate` ni sur le fallback visuel de fin de pipeline
- front pose sur `dashboard/candidates`: la carte de stats `En attente` ne compte plus seulement `applications.applicationStatus === PENDING`; elle suit maintenant l'etape pipeline courante marquee `pending` quand le runtime de progression est charge, avec fallback legacy seulement avant resolution locale du pipeline
- front pose sur `dashboard/candidates`: quand la campagne n'a pas encore resolu ses `PipelineStage[]`, le pipeline compact fallback de la carte lit maintenant `application_progress.stageOrder`, `stageType` et `progressStatus` pour ses dots et son libelle au lieu de retomber tout de suite sur le triplet legacy calcule depuis `applicationStatus`
- front pose sur `dashboard/evaluations-list`: pour les cartes `OVER` ayant deja des soumissions rechargees, le resume principal bascule maintenant vers une synthese calculee sur les evaluations reelles (moyenne derivee `/100`, dernier score, nombre de soumissions) avec fallback legacy seulement quand aucun detail de soumission n'est disponible
- front pose sur `dashboard/entities/applications`: l'onglet enfant `Evaluations` remonte maintenant aussi les `evaluationItems` de chaque evaluation, recalcule localement le score affiche a partir des criteres scorables quand ils existent, et expose le detail label/valeur/note par critere au lieu de rester limite au seul couple score/commentaire
- backend/front pose sur l'edition de template pipeline: les nouveaux templates ne peuvent plus ajouter de stage top-level `EVALUATION`; le garde-fou est maintenant double (blocage UI dans `pipeline-template-edit` et refus backend dans `PipelineStageBusiness`), avec preservation minimale des stages legacy deja presents pour migration
- backend pose sur `EvaluationsBusiness`: le recalcul des agregats apres create/update/delete resynchronise maintenant aussi le resume derive `applications.interviewDate`, `applications.interviewStatus` et `applications.currentInterviewEvaluation*` a partir de l'entretien courant selectionne avec la meme priorite multi-occurrence que les autres surfaces runtime, au lieu de laisser ces miroirs figes jusqu'a une prochaine mutation d'entretien
- `applications.*` reste temporairement mis a jour comme resume derive miroir du runtime de tentative pour conserver la compatibilite des usages legacy existants
- reste ouvert sur `EVALUATION`: `evaluation_item` dispose maintenant d'un premier write path, d'un premier read path backend, d'un endpoint de criteres, d'une saisie/edition front qui derive deja `candidateMark` des criteres scorables sur create/update, d'une projection admin dans `dashboard/entities/applications` et d'une liste `dashboard/evaluations-list` qui affiche deja round explicite, etat evaluateur et resume principal depuis les soumissions reelles, mais l'agregation reste encore limitee aux evaluations rechargees localement et toutes les vues admin/listes ne sont pas encore reconstruites autour de ce detail; ce slice ne ferme donc pas encore la case complete du write/read path evaluation
- reste ouvert: les vues admin de consultation restent encore majoritairement chargees par `application_id` et non encore recomposees par round explicite, meme si la mutation de correction sait maintenant cibler une tentative

Fichiers cartographie lies:

- entities: `cartographie-fonctionnelle-front/entities/20-entities-applications.md`, `cartographie-fonctionnelle-front/entities/30-entities-interviews.md`, `cartographie-fonctionnelle-front/entities/60-entities-decisions.md`, `cartographie-fonctionnelle-front/entities/100-entities-candidate-answers.md`, `cartographie-fonctionnelle-front/entities/110-entities-evaluations.md`, `cartographie-fonctionnelle-front/entities/180-entities-mail-log.md`, `cartographie-fonctionnelle-front/entities/230-entities-application-progress.md`, `cartographie-fonctionnelle-front/entities/260-entities-pipeline-stages.md`
- dashboard: `cartographie-fonctionnelle-front/dashboard/25-dashboard-decisions.md`, `cartographie-fonctionnelle-front/dashboard/30-dashboard-interviews.md`, `cartographie-fonctionnelle-front/dashboard/31-dashboard-interview-create.md`, `cartographie-fonctionnelle-front/dashboard/35-dashboard-evaluations.md`, `cartographie-fonctionnelle-front/dashboard/41-dashboard-pipeline-template-edit.md`
- public: `cartographie-fonctionnelle-front/public/30-suivre-candidature.md`, `cartographie-fonctionnelle-front/public/80-quiz-public.md`

### Phase E - Stabilisation fonctionnelle et retrait des dependances legacy

Checklist:

- [ ] retirer les resolutions metier par `stageType` singleton pour `QUIZ`, `PRESELECTION` et `INTERVIEW`
- [ ] retirer les lectures et ecritures applicatives qui dependent encore directement des colonnes mono-valeur de `applications`
- [ ] verifier que les resumes `aggregated_*` et les bannieres d'abandon racontent la meme verite que la chronologie de round
- [ ] verifier que les dashboards recruteur n'utilisent plus `application_status`, `quiz_score_percent`, `interview_date` ou `total_evaluation_*` comme source principale
- [ ] verifier que les flux publics utilisent bien un `trackingCode` distinct du `quizToken` et un token de tentative explicite
- [ ] renommer ou nettoyer les champs gardes transitoirement s'ils creent encore une ambiguite fonctionnelle (`interview_evaluations_link`, `interviews.campaign_id`, etc.)

Fichiers cartographie lies:

- entities: `cartographie-fonctionnelle-front/entities/20-entities-applications.md`, `cartographie-fonctionnelle-front/entities/30-entities-interviews.md`, `cartographie-fonctionnelle-front/entities/110-entities-evaluations.md`, `cartographie-fonctionnelle-front/entities/180-entities-mail-log.md`, `cartographie-fonctionnelle-front/entities/230-entities-application-progress.md`, `cartographie-fonctionnelle-front/entities/260-entities-pipeline-stages.md`
- dashboard: `cartographie-fonctionnelle-front/dashboard/20-dashboard-candidates.md`, `cartographie-fonctionnelle-front/dashboard/21-dashboard-candidate-detail.md`, `cartographie-fonctionnelle-front/dashboard/25-dashboard-decisions.md`, `cartographie-fonctionnelle-front/dashboard/30-dashboard-interviews.md`, `cartographie-fonctionnelle-front/dashboard/35-dashboard-evaluations.md`, `cartographie-fonctionnelle-front/dashboard/40-dashboard-pipeline-templates.md`, `cartographie-fonctionnelle-front/dashboard/41-dashboard-pipeline-template-edit.md`
- public: `cartographie-fonctionnelle-front/public/30-suivre-candidature.md`, `cartographie-fonctionnelle-front/public/80-quiz-public.md`

### Phase F - Nettoyage physique et sortie de migration

Checklist:

- [ ] supprimer physiquement les colonnes legacy devenues inutiles dans `applications`, `application_progress`, `interviews`, `decisions`, `candidate_answer` et `pipeline_stage`
- [ ] supprimer les tables ou contrats intermediaires devenus obsoletes une fois la bascule terminee
- [ ] retirer les fallbacks temporaires de lecture et d'ecriture encore presents dans le code
- [ ] rejouer les controles de coherence post-migration et comparer les ecrans critiques avant / apres bascule
- [ ] mettre a jour la cartographie si l'implementation reelle a force un ecart par rapport a cette note

Fichiers cartographie lies:

- entities: `cartographie-fonctionnelle-front/entities/20-entities-applications.md`, `cartographie-fonctionnelle-front/entities/30-entities-interviews.md`, `cartographie-fonctionnelle-front/entities/60-entities-decisions.md`, `cartographie-fonctionnelle-front/entities/100-entities-candidate-answers.md`, `cartographie-fonctionnelle-front/entities/180-entities-mail-log.md`, `cartographie-fonctionnelle-front/entities/230-entities-application-progress.md`, `cartographie-fonctionnelle-front/entities/260-entities-pipeline-stages.md`
- dashboard: `cartographie-fonctionnelle-front/dashboard/20-dashboard-candidates.md`, `cartographie-fonctionnelle-front/dashboard/21-dashboard-candidate-detail.md`, `cartographie-fonctionnelle-front/dashboard/25-dashboard-decisions.md`, `cartographie-fonctionnelle-front/dashboard/30-dashboard-interviews.md`, `cartographie-fonctionnelle-front/dashboard/35-dashboard-evaluations.md`
- public: `cartographie-fonctionnelle-front/public/30-suivre-candidature.md`, `cartographie-fonctionnelle-front/public/80-quiz-public.md`

## 12. Arbitrages figes pour demarrage

- il ne faut pas imposer d'unicite technique sur les libelles de stages actifs; l'identite du round reste portee par `pipeline_stage.id`, l'ordre et le contexte template, pas par un libelle unique
- un pipeline utilise par une campagne ouverte doit etre considere comme fige operationnellement; l'evolution passe par duplication / nouvelle version de template, pas par mutation en place
- si le pipeline d'une campagne change, les candidatures deja engagees restent rattachees a leur structure courante et ne sont pas migrees automatiquement sans procedure de migration explicite
- le rollback fonctionnel cible est une reouverture controlee d'une ancienne ligne `application_progress`, avec conservation auditable des etapes intermediaires deja cloturees; on ne fait pas de reset global silencieux
- pour le premier lot d'implementation, `mail_log` reste la table d'execution email enrichie; `audit_event` couvre l'audit transverse, et aucune table supplementaire de notification metier n'est introduite avant d'avoir valide ce socle

A ce stade, aucun arbitrage supplementaire n'est requis pour ouvrir la phase A. Les questions restantes des sections `13` a `15` relevent de details de migration, de nettoyage ou d'evolutions futures, pas d'un blocage d'implementation immediate.

## 13. Limites residuelles apres evolution

Si l'on livre strictement la cible documentee dans cette note, la base sera nettement plus propre et plus robuste qu'aujourd'hui, mais certaines attentes metier resteront hors perimetre.

Ce qu'un recruteur pourrait vouloir faire mais qui ne sera toujours pas possible, ou pas correctement supporte, sans travaux complementaires:

- ajouter un round supplementaire pour un seul candidat hors du pipeline de campagne; la cible reste structurelle et refuse l'ad hoc par candidature
- modeliser des embranchements complexes de pipeline (`si score > X alors round A sinon round B`, ou des etapes paralleles a valider en AND/OR); la cible reste un pipeline lineaire ordonne
- migrer automatiquement et sans arbitrage des candidatures deja engagees vers une nouvelle version de pipeline quand la campagne change en cours de route
- gerer une vraie bibliotheque mutualisee de politiques de notification reutilisables entre plusieurs templates; la cible actuelle pense surtout des regles rattachees au stage
- proposer au candidat un vrai parcours libre de self-scheduling avec plusieurs creneaux, reservation autonome et arbitrage calendrier; la cible doit en revanche couvrir explicitement le refus d'entretien et la demande d'une autre date, sans aller jusqu'a la reservation autonome multi-creneaux
- faire une evaluation autonome hors entretien; ce point est explicitement exclu par la cible BA
- inviter chaque evaluateur via un lien public personnel, revocable et distinct, tant qu'on ne complete pas le salon partage de `interviews` par un modele de liens ou d'invitations individuels plus fin

## 14. Champs oublies ou a re-arbitrer dans la BD actuelle

Le controle croise avec `bd_actuelle/quizapp_db_described_20260530.md` fait remonter plusieurs champs ou tables adjacentes que la note n'avait pas encore couverts explicitement.

### 14.1 Champs probablement a retirer ou a descendre en simple resume

- `campaigns.total_questions`: ce champ suppose encore un pilotage quiz global au niveau campagne; avec plusieurs rounds quiz et plusieurs formulaires potentiels, il ne doit plus piloter le runtime
- `campaigns.is_timed`: meme probleme; un timing global de campagne n'est plus une bonne source de verite si chaque round quiz peut avoir sa propre politique
- `campaigns.time_all_forms`: ce flag devient ambigu si le timing est defini round par round, ou si plusieurs quiz d'un meme pipeline n'ont pas le meme comportement
- `campaigns.all_can_evaluate`: ce champ est trop grossier si l'evaluation devient un sous-workflow d'entretien avec participants et evaluateurs definis par round
- `interviews.campaign_id`: si l'entretien pointe vers `application_progress`, puis vers `application`, puis vers `campaign`, ce champ devient potentiellement redondant et sujet a divergence
- `interview_participant.has_finished`: ce booleen devient trop pauvre si l'on distingue desormais presence, evaluation soumise, evaluation validee et cloture d'entretien

### 14.2 Champs a clarifier car ils risquent de devenir ambigus

- `candidate_interview.interview_start` et `candidate_interview.interview_duration`: ces champs risquent de dupliquer la planification portee par `interviews.interview_date` et ses metadonnees; il faut decider s'ils sont de vrais snapshots de reponse candidat ou s'ils doivent disparaitre
- `pipeline_stage.config_json`: la note suppose qu'une partie des regles sort vers des tables structurees; il faut donc limiter clairement ce qui reste autorise dans `config_json`, sinon on recreera une zone grise source d'incoherences

### 14.3 Champs adjacents qui ne sont pas obsoletes, mais qu'il faut bien repositionner

- `applications.application_abandoned`: il faut le conserver comme drapeau global de blocage de candidature, mais l'enrichir avec son contexte d'origine (`abandoned_from_application_progress_id`) et l'audit/notification associes; ce n'est pas un simple statut de round
- `interviews.interview_type`: ce champ reste coherent si sa semantique reste strictement `IN_PERSON` / `ONLINE`; en revanche il ne doit pas redevenir une pseudo-typologie metier du round, puisque le round est defini par le stage pipeline et son libelle
- `interviews.interview_evaluations_link`: si ce champ est en realite le code du chat ou du salon partage des evaluateurs, il doit rester rattache a `interviews` et etre plutot renomme qu'etale vers `candidate_interview`
- `form.is_timed`: ce champ peut rester comme caracteristique du formulaire ou comme valeur par defaut, mais il ne doit plus decider a lui seul le comportement runtime d'un round quiz si le stage ou la tentative impose autre chose
- `notifications.object_table_name` / `object_table_id`: ces champs peuvent continuer a servir de mecanique d'inbox, mais ils ne remplacent ni `audit_event` ni un vrai journal metier des notifications pipeline

## 15. Incoherences a surveiller apres evolution

Le risque principal n'est plus l'absence de modele, mais la coexistence de plusieurs niveaux de verite pendant et apres migration.

Les points de vigilance les plus importants sont les suivants:

- si `campaigns.is_timed`, `campaigns.total_questions`, `campaigns.time_all_forms`, `form.is_timed`, `pipeline_stage.config_json` et `application_quiz_attempt` continuent tous a influencer le runtime quiz, on recreera plusieurs sources de verite concurrentes
- si une meme grille mutualisee peut etre editee apres avoir ete rattachee a des stages ou a des campagnes deja ouvertes, il faut obligatoirement versionner ou snapshotter la grille effective pour eviter les derives retroactives
- si `application_quiz_attempt` conserve `application_id` en plus de `application_progress_id`, il faut imposer une coherence forte entre les deux, sinon les tentatives de quiz pourront etre rattachees a la mauvaise candidature
- si `application_abandoned` est conserve sur `applications`, il ne faut pas en parallele disperser une autre verite metier d'abandon sur plusieurs lignes `application_progress` sans convention explicite; le round d'origine doit etre trace, mais le verrou reste global
- si `interviews.campaign_id` est conserve alors que la campagne se deduit deja via `application_progress -> application`, il faut assumer que c'est un denormalise controle ou le supprimer pour eviter les divergences
- si `candidate_interview` garde `interview_start` / `interview_duration` alors que l'horaire officiel vit sur `interviews`, il faut definir lequel fait foi, sinon les ecrans recruteur et candidat pourront raconter des verites differentes
- si `interview_participant.has_finished` coexiste avec `evaluation_status`, `evaluation_submitted_at`, `validated_at` et la cloture d'entretien, il faut une semantique non ambiguë pour chaque etat
- si `all_can_evaluate` reste actif au niveau campagne en meme temps qu'une selection explicite des participants/evaluateurs par entretien, des conflits d'autorisation apparaitront
- si `aggregated_quiz_score*` et `aggregated_evaluation_score*` sont exposes sur `applications`, il faut documenter une regle d'agregation stable (poids, rounds exclus, annulations, reouvertures) et recalculer ces resumes de maniere deterministe
- si `config_json` continue a porter a la fois des regles quiz, des regles email et des grilles d'evaluation alors que des tables structurees existent, la maintenance redeviendra fragile
- si les colonnes resumes de `applications` survivent trop longtemps apres la bascule runtime, les listes et dashboards risquent de relire des valeurs stalees differentes de la chronologie reelle
- si `mail_log`, `notifications` et `audit_event` ne sont pas clairement separes par role, on obtiendra trois journaux partiels au lieu d'une piste d'audit lisible

## 16. Conclusion

La refonte cible ne consiste pas seulement a "autoriser plusieurs entretiens". Elle impose de sortir d'un modele mono-occurrence encore present dans `applications`, dans la resolution par `stageType` et dans plusieurs tables runtime.

Le coeur de l'evolution a faire est le suivant:

- faire de `application_progress` l'ancre unique de chaque round
- sortir le quiz dans une entite de tentative dediee
- rattacher explicitement entretiens et decisions a leur round exact
- integrer l'evaluation dans le sous-workflow entretien
- releguer `applications` au rang de resume denormalise
- ajouter une vraie couche d'audit et de journalisation des notifications

Sans cette evolution structurelle, les objectifs du document d'audit du 2026-05-30 resteront partiellement contradictoires avec la base et le runtime actuels.
