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

La base actuelle permet deja plusieurs lignes techniques sur certaines briques, notamment `interviews`, `candidate_interview` et `evaluations`, mais le modele metier reste majoritairement mono-occurrence.

Les blocages les plus visibles dans la description BD du 2026-05-30 sont les suivants:

- `applications` porte encore un etat quiz/interview/evaluation mono-valeur (`quiz_score`, `quiz_score_percent`, `quiz_status`, `interview_date`, `interview_status`, `total_evaluation_*`, `application_status`).
- `interviews` ne reference pas l'occurrence precise de pipeline concernee ; il n'y a pas de `application_progress_id`.
- `decisions` ne reference pas non plus l'occurrence precise de `PRESELECTION` ou `DECISION` ; il n'y a pas de `application_progress_id`.
- `application_progress` porte un `score`, un `mail_sent` et un `decided_by` trop generiques pour supporter plusieurs rounds audites avec validation humaine.
- `pipeline_stage` ne porte qu'un couple `email_required` / `email_automatic`, insuffisant pour une politique email differente selon le contexte ou l'issue.
- `candidate_answer` est encore rattache a `application_id` uniquement, ce qui ne permet pas de distinguer plusieurs quiz pour une meme candidature.
- `evaluations` ne stocke qu'un score global (`candidate_mark`) et un commentaire global (`recruiter_comment`) par ligne, sans grille de criteres configurable par round.
- `mail_log` existe, mais sans rattachement metier explicite a un round, une decision, un entretien ou une evaluation.

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

- [ ] figer les arbitrages de `## 12` qui bloquent directement le premier lot SQL ou les contrats runtime
- [ ] lister et nommer les enums / statuts cibles: `progress_status`, `quiz_status`, `candidate_response_status`, `interview_status`, `evaluation_status`, `decision_mode`
- [ ] definir la regle d'agregation des resumes `aggregated_quiz_*` et `aggregated_evaluation_*`
- [ ] definir la politique de coexistence ou d'invalidation des anciens `quizToken`
- [ ] identifier les endpoints, jobs, scripts et batchs impactes avant la premiere migration
- [ ] decider si `interviews.campaign_id`, `candidate_interview.interview_start` et `candidate_interview.interview_duration` sont temporaires ou cibles

Fichiers cartographie lies:

- entities: `cartographie-fonctionnelle-front/entities/20-entities-applications.md`, `cartographie-fonctionnelle-front/entities/180-entities-mail-log.md`, `cartographie-fonctionnelle-front/entities/230-entities-application-progress.md`, `cartographie-fonctionnelle-front/entities/260-entities-pipeline-stages.md`
- dashboard: `cartographie-fonctionnelle-front/dashboard/20-dashboard-candidates.md`, `cartographie-fonctionnelle-front/dashboard/21-dashboard-candidate-detail.md`, `cartographie-fonctionnelle-front/dashboard/40-dashboard-pipeline-templates.md`, `cartographie-fonctionnelle-front/dashboard/41-dashboard-pipeline-template-edit.md`
- public: `cartographie-fonctionnelle-front/public/30-suivre-candidature.md`, `cartographie-fonctionnelle-front/public/80-quiz-public.md`

### Phase A - Ajouter le schema cible sans casser l'existant

Checklist:

- [ ] creer `application_quiz_attempt`
- [ ] creer `pipeline_stage_notification_rule`
- [ ] creer `evaluation_grid_template`, `evaluation_grid_template_version` et `evaluation_grid_template_item`
- [ ] creer `pipeline_stage_evaluation_criterion`
- [ ] creer `evaluation_item`
- [ ] creer `audit_event`
- [ ] ajouter `application_progress_id` nullable dans `interviews` et `decisions`
- [ ] ajouter `application_quiz_attempt_id` nullable dans `candidate_answer`
- [ ] enrichir `application_progress` pour validation, skip et reouverture
- [ ] enrichir `applications` pour pointeurs courants, resumes derives et contexte d'abandon
- [ ] enrichir `candidate_interview`, `interview_participant`, `evaluations` et `mail_log`
- [ ] poser les index, contraintes de coherence et valeurs par defaut minimales sans encore supprimer les colonnes legacy

Fichiers cartographie lies:

- entities: `cartographie-fonctionnelle-front/entities/20-entities-applications.md`, `cartographie-fonctionnelle-front/entities/30-entities-interviews.md`, `cartographie-fonctionnelle-front/entities/60-entities-decisions.md`, `cartographie-fonctionnelle-front/entities/100-entities-candidate-answers.md`, `cartographie-fonctionnelle-front/entities/110-entities-evaluations.md`, `cartographie-fonctionnelle-front/entities/120-entities-candidate-interview.md`, `cartographie-fonctionnelle-front/entities/180-entities-mail-log.md`, `cartographie-fonctionnelle-front/entities/220-entities-interview-participant.md`, `cartographie-fonctionnelle-front/entities/230-entities-application-progress.md`, `cartographie-fonctionnelle-front/entities/260-entities-pipeline-stages.md`
- dashboard: `cartographie-fonctionnelle-front/dashboard/30-dashboard-interviews.md`, `cartographie-fonctionnelle-front/dashboard/31-dashboard-interview-create.md`, `cartographie-fonctionnelle-front/dashboard/35-dashboard-evaluations.md`, `cartographie-fonctionnelle-front/dashboard/40-dashboard-pipeline-templates.md`, `cartographie-fonctionnelle-front/dashboard/41-dashboard-pipeline-template-edit.md`
- public: `cartographie-fonctionnelle-front/public/30-suivre-candidature.md`, `cartographie-fonctionnelle-front/public/80-quiz-public.md`

### Phase B - Backfill et controles de coherence

Checklist:

- [ ] rattacher chaque entretien existant a la bonne ligne `application_progress`
- [ ] rattacher chaque decision existante a la bonne ligne `application_progress`
- [ ] creer une `application_quiz_attempt` historique pour chaque candidature qui n'a connu qu'un quiz legacy
- [ ] renseigner `candidate_answer.application_quiz_attempt_id`
- [ ] backfiller `current_application_progress_id`, `last_progressed_at` et `abandoned_from_application_progress_id` quand l'information est reconstructible
- [ ] recalculer une premiere fois les resumes `aggregated_quiz_*` et `aggregated_evaluation_*`
- [ ] verifier les coherences `application_quiz_attempt.application_id` / `application_progress_id`, `interviews.application_progress_id` / `campaign_id`, `candidate_interview` / `interview`
- [ ] sortir une liste de cas ambigus a arbitrer manuellement avant toute bascule de lecture ou d'ecriture

Fichiers cartographie lies:

- entities: `cartographie-fonctionnelle-front/entities/20-entities-applications.md`, `cartographie-fonctionnelle-front/entities/30-entities-interviews.md`, `cartographie-fonctionnelle-front/entities/60-entities-decisions.md`, `cartographie-fonctionnelle-front/entities/100-entities-candidate-answers.md`, `cartographie-fonctionnelle-front/entities/120-entities-candidate-interview.md`, `cartographie-fonctionnelle-front/entities/230-entities-application-progress.md`
- dashboard: `cartographie-fonctionnelle-front/dashboard/20-dashboard-candidates.md`, `cartographie-fonctionnelle-front/dashboard/21-dashboard-candidate-detail.md`, `cartographie-fonctionnelle-front/dashboard/25-dashboard-decisions.md`, `cartographie-fonctionnelle-front/dashboard/30-dashboard-interviews.md`
- public: `cartographie-fonctionnelle-front/public/30-suivre-candidature.md`, `cartographie-fonctionnelle-front/public/80-quiz-public.md`

### Phase C - Basculer les lectures

Checklist:

- [ ] faire lire la chronologie candidat depuis `application_progress` et les objets de round lies
- [ ] faire lire le quiz public depuis `application_quiz_attempt` et non plus depuis un quiz global de candidature
- [ ] faire lire les ecrans candidats / detail candidat a partir des resumes recalcules et des objets runtime, pas des snapshots legacy
- [ ] faire lire les entretiens et les decisions depuis `application_progress_id`
- [ ] faire lire les evaluations depuis `evaluations` + `evaluation_item` + `interview_participant`
- [ ] faire renvoyer par `applications/track` et les flux publics des actions deja resolues sur l'occurrence precise concernee
- [ ] conserver au besoin un fallback temporaire de lecture legacy uniquement pour les dossiers encore non backfilles

Fichiers cartographie lies:

- entities: `cartographie-fonctionnelle-front/entities/20-entities-applications.md`, `cartographie-fonctionnelle-front/entities/30-entities-interviews.md`, `cartographie-fonctionnelle-front/entities/100-entities-candidate-answers.md`, `cartographie-fonctionnelle-front/entities/110-entities-evaluations.md`, `cartographie-fonctionnelle-front/entities/120-entities-candidate-interview.md`, `cartographie-fonctionnelle-front/entities/230-entities-application-progress.md`
- dashboard: `cartographie-fonctionnelle-front/dashboard/20-dashboard-candidates.md`, `cartographie-fonctionnelle-front/dashboard/21-dashboard-candidate-detail.md`, `cartographie-fonctionnelle-front/dashboard/25-dashboard-decisions.md`, `cartographie-fonctionnelle-front/dashboard/30-dashboard-interviews.md`, `cartographie-fonctionnelle-front/dashboard/35-dashboard-evaluations.md`, `cartographie-fonctionnelle-front/dashboard/90-dashboard-evaluate-fullscreen.md`, `cartographie-fonctionnelle-front/dashboard/91-dashboard-evaluate-link.md`
- public: `cartographie-fonctionnelle-front/public/30-suivre-candidature.md`, `cartographie-fonctionnelle-front/public/80-quiz-public.md`

### Phase D - Basculer les ecritures runtime

Checklist:

- [ ] faire creer chaque nouvelle tentative de quiz sur `application_quiz_attempt` a partir d'un `application_progress` explicite
- [ ] faire ecrire `save-quiz-answer`, `touch-quiz` et `complete-quiz` sur la tentative et ses reponses dediees
- [ ] faire creer les entretiens sur `interviews.application_progress_id` et faire vivre la reponse candidat sur `candidate_interview`
- [ ] faire ecrire les decisions sur `decisions.application_progress_id` avec `decision_mode`, justification et annulation historisee
- [ ] faire ecrire les evaluations sur `evaluations` + `evaluation_item`, avec suivi par `interview_participant`
- [ ] faire ecrire les notifications critiques sur `mail_log` avec references de round, et l'audit sur `audit_event`
- [ ] recalculer ou resynchroniser `applications.*` comme resume derive, sans retransformer ces colonnes en source primaire
- [ ] bloquer la creation de nouveaux stages `EVALUATION` dans les nouveaux templates

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

## 12. Arbitrages encore a figer

- faut-il imposer techniquement l'unicite des libelles de stages actifs dans un template
- faut-il rendre les pipelines strictement non modifiables des qu'une campagne ouverte les utilise
- quelle politique appliquer si le pipeline d'une campagne change alors que des candidatures ont deja produit quiz, decisions et entretiens
- comment modeliser le rollback fonctionnel: reouverture d'une ancienne etape, conservation des etapes intermediaires cloturees, ou reset partiel
- faut-il conserver `mail_log` comme seule table d'execution email enrichie, ou introduire une table metier distincte pour les notifications de pipeline

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
