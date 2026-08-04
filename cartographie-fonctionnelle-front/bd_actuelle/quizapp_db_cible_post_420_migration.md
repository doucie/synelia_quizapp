# BD cible theorique - post migration 420 pipeline multi-occurrences

Date: 2026-06-01 (mise a jour 2026-08-04: deviation `candidate_interview.interview_duration` conservee)
Base de depart: `bd_actuelle/quizapp_db_described_20260601.md`
Source cible: `evolution/420-evolution-pipeline-multi-occurrences.md`
Statut: schema theorique cible apres cloture des phases E et F de la migration 420

## 1. Hypotheses de construction

- ce document decrit la cible apres retrait des dependances legacy encore ouvertes en phase E/F
- les types, nullabilites et defaults non explicitement arbitres dans la note 420 sont repris du schema 20260601 ou deduits du runtime deja en place
- les tables non detaillees ici sont identiques au snapshot `quizapp_db_described_20260601.md`
- les champs explicitement marques comme transitoires dans la note 420 sont consideres nettoyes dans la cible finale
- `interviews.campaign_id` est retire de la cible finale
- `interviews.interview_evaluations_link` est renomme en `evaluation_room_code`
- `candidate_interview.interview_start` et `candidate_interview.interview_duration` sont retires de la cible finale
- les champs campagne `total_questions`, `is_timed`, `time_all_forms` et `all_can_evaluate` restent hors perimetre strict 420 et sont conserves tels quels
- les champs seulement notes "a rearbitrer" sans suppression explicite dans 420 sont conserves par prudence

## 2. Enums cibles

| Champ | Valeurs cibles |
| --- | --- |
| `pipeline_stage.stage_type` | `CANDIDATURE`, `QUIZ`, `PRESELECTION`, `INTERVIEW`, `DECISION` |
| `application_progress.progress_status` | `PENDING`, `IN_PROGRESS`, `AWAITING_VALIDATION`, `COMPLETED`, `FAILED`, `SKIPPED` |
| `application_quiz_attempt.quiz_status` | `PENDING`, `STARTED`, `COMPLETED`, `EXPIRED`, `CANCELLED` |
| `candidate_interview.candidate_response_status` | `PENDING`, `ACCEPTED`, `DECLINED`, `RESCHEDULE_REQUESTED` |
| `interviews.interview_status` | `SCHEDULED`, `IN_PROGRESS`, `AWAITING_EVALUATION`, `AWAITING_VALIDATION`, `CLOSED`, `CANCELLED` |
| `evaluations.evaluation_status` | `DRAFT`, `SUBMITTED`, `VALIDATED`, `CANCELLED` |
| `decisions.decision_mode` | `STANDARD`, `CANCEL`, `OVERRIDE`, `ROLLBACK` |

## 3. Tables deja alignees avec la cible finale

Ces tables existent deja dans `quizapp_db_described_20260601.md` avec une structure compatible avec la cible 420. Elles sont donc conservees telles quelles dans la BD theorique finale:

- `application_quiz_attempt`
- `audit_event`
- `evaluation_grid_template`
- `evaluation_grid_template_version`
- `evaluation_grid_template_item`
- `evaluation_item`
- `interview_participant`
- `mail_log`
- `pipeline_stage_evaluation_criterion`
- `pipeline_stage_notification_rule`

Remarque:

- `mail_log.event_code` ne doit plus etre traite comme un champ legacy implicite en sortie de migration; tous les flows doivent le renseigner explicitement meme si le schema actuel tolere encore un default de compatibilite

## 4. Tables non detaillees ici

Toutes les autres tables du snapshot `20260601` sont conservees a l'identique, notamment:

- `answer`
- `app_config`
- `business_group`
- `business_group_permission`
- `candidate_ask`
- `candidate_token`
- `campaign_form`
- `campaigns`
- `departments`
- `email_template`
- `email_template_preset`
- `email_verification_tokens`
- `entity_permission`
- `flyway_schema_history`
- `form`
- `form_questions`
- `form_version`
- `group_change_request`
- `invitation_code`
- `legal_text`
- `notifications`
- `pipeline_template`
- `question`
- `smtp_config`
- `source_token`
- `specialities`
- `system_role_permission`
- `user`
- `user_business_group`
- `user_permission_override`

Note specifique sur `campaigns`:

- `total_questions`, `is_timed`, `time_all_forms` et `all_can_evaluate` restent des champs adjacents a rearbitrer hors perimetre strict 420; ils ne sont pas remodeles ici

## 5. Schema cible detaille pour les tables encore differentes du snapshot 20260601

### 5.1 `pipeline_stage`

Colonnes retirees physiquement en cible finale:

- `email_required`
- `email_automatic`

| Attribut | Type | Null | Cle | Defaut | Commentaire |
| --- | --- | --- | --- | --- | --- |
| `id` | `int unsigned` | NO | PRI | `\N` | identifiant technique |
| `pipeline_template_id` | `int unsigned` | NO | FK | `\N` | reference `pipeline_template.id` |
| `stage_type` | `varchar(50)` | NO |  | `\N` | type cible repetable pour `QUIZ` / `PRESELECTION` / `INTERVIEW`; `EVALUATION` n'est plus un stage top-level cible |
| `stage_label` | `varchar(255)` | NO |  | `\N` | libelle fonctionnel libre |
| `stage_order` | `int` | NO |  | `\N` | ordre du round dans le pipeline |
| `is_required` | `bit(1)` | NO |  | `b'1'` | un round obligatoire n'est jamais skippable |
| `is_eliminatory` | `bit(1)` | NO |  | `b'0'` | impact metier sur l'issue du round |
| `config_json` | `text` | YES |  | `\N` | config du stage, y compris screening quiz round-aware |
| `created_at` | `datetime` | YES |  | `\N` | audit standard |
| `created_by` | `int` | YES |  | `\N` | audit standard |
| `updated_at` | `datetime` | YES |  | `\N` | audit standard |
| `updated_by` | `int` | YES |  | `\N` | audit standard |
| `is_deleted` | `bit(1)` | NO |  | `b'0'` | suppression logique |
| `search_string` | `text` | YES |  | `\N` | index libre / recherche |

### 5.2 `application_progress`

Colonnes retirees physiquement en cible finale:

- `decided_by`
- `mail_sent`

| Attribut | Type | Null | Cle | Defaut | Commentaire |
| --- | --- | --- | --- | --- | --- |
| `id` | `int unsigned` | NO | PRI | `\N` | identifiant technique |
| `application_id` | `int unsigned` | NO | FK | `\N` | reference `applications.id` |
| `pipeline_stage_id` | `int unsigned` | NO | FK | `\N` | reference `pipeline_stage.id` |
| `progress_status` | `varchar(20)` | NO |  | `PENDING` | statut cible du round |
| `started_at` | `datetime` | YES |  | `\N` | debut effectif du round |
| `completed_at` | `datetime` | YES |  | `\N` | cloture technique du round |
| `score` | `double` | YES |  | `\N` | score de synthese de cette occurrence uniquement |
| `notes` | `text` | YES |  | `\N` | commentaire de suivi du round |
| `validated_at` | `datetime` | YES |  | `\N` | validation humaine |
| `validated_by` | `int unsigned` | YES | FK | `\N` | reference `user.id` |
| `validation_comment` | `text` | YES |  | `\N` | justification / commentaire de validation |
| `skipped_at` | `datetime` | YES |  | `\N` | skip du round |
| `skipped_by` | `int unsigned` | YES | FK | `\N` | reference `user.id` |
| `skip_reason` | `text` | YES |  | `\N` | justification du skip |
| `reopened_at` | `datetime` | YES |  | `\N` | reouverture controlee |
| `reopened_by` | `int unsigned` | YES | FK | `\N` | reference `user.id` |
| `reopen_reason` | `text` | YES |  | `\N` | justification de reouverture |
| `created_at` | `datetime` | YES |  | `\N` | audit standard |
| `created_by` | `int` | YES |  | `\N` | audit standard |
| `updated_at` | `datetime` | YES |  | `\N` | audit standard |
| `updated_by` | `int` | YES |  | `\N` | audit standard |
| `is_deleted` | `bit(1)` | NO |  | `b'0'` | suppression logique |
| `search_string` | `text` | YES |  | `\N` | index libre / recherche |

### 5.3 `applications`

Colonnes retirees physiquement en cible finale:

- `quiz_score`
- `total_evaluation_score`
- `total_evaluation_number`
- `total_evaluation_percentage`
- `application_status`
- `quiz_token`
- `quiz_status`
- `quiz_level`
- `total_questions`
- `quiz_score_percent`
- `quiz_manual_correction_status`
- `time_elapsed`
- `quiz_timed_snapshot`
- `quiz_total_time_allowed_snapshot`
- `quiz_last_activity_at`
- `interview_date`
- `interview_status`

| Attribut | Type | Null | Cle | Defaut | Commentaire |
| --- | --- | --- | --- | --- | --- |
| `id` | `int unsigned` | NO | PRI | `\N` | identifiant technique |
| `candidate_first_name` | `varchar(100)` | NO |  | `\N` | identite candidat |
| `candidate_last_name` | `varchar(100)` | NO |  | `\N` | identite candidat |
| `candidate_email` | `varchar(255)` | NO |  | `\N` | email candidat |
| `candidate_phone` | `varchar(20)` | YES |  | `\N` | telephone candidat |
| `candidate_cv_path` | `varchar(1000)` | YES |  | `\N` | CV |
| `candidate_birth_date` | `date` | YES |  | `\N` | date de naissance |
| `motivation_letter` | `text` | YES |  | `\N` | lettre / texte libre |
| `email_verified` | `tinyint(1)` | NO |  | `\N` | verification email initiale |
| `current_interview_evaluation_score` | `int` | YES |  | `\N` | miroir derive de l'entretien courant |
| `current_interview_evaluation_number` | `int` | YES |  | `\N` | miroir derive de l'entretien courant |
| `current_interview_evaluation_percentage` | `double` | YES |  | `\N` | miroir derive de l'entretien courant |
| `current_preselection_decision_type` | `varchar(50)` | YES |  | `\N` | resume derive de la preselection courante |
| `current_preselection_decision_date` | `datetime` | YES |  | `\N` | resume derive de la preselection courante |
| `current_final_decision_type` | `varchar(50)` | YES |  | `\N` | resume derive de la decision finale courante |
| `current_final_decision_date` | `datetime` | YES |  | `\N` | resume derive de la decision finale courante |
| `current_pipeline_stage_type` | `varchar(50)` | YES |  | `\N` | type de l'etape courante derivee |
| `current_pipeline_stage_label` | `varchar(255)` | YES |  | `\N` | libelle de l'etape courante derivee |
| `current_pipeline_progress_status` | `varchar(20)` | YES |  | `\N` | statut de l'etape courante derivee |
| `application_abandoned` | `tinyint(1)` | YES |  | `\N` | verrou global de candidature |
| `abandoned_at` | `datetime` | YES |  | `\N` | date d'abandon |
| `abandon_reason` | `text` | YES |  | `\N` | raison d'abandon |
| `abandoned_from_application_progress_id` | `int unsigned` | YES | FK | `\N` | round d'origine de l'abandon |
| `source_token_id` | `int unsigned` | YES | FK | `\N` | source de candidature |
| `form_version_id` | `int unsigned` | YES | FK | `\N` | formulaire de candidature initial uniquement |
| `current_application_progress_id` | `int unsigned` | YES | FK | `\N` | pointeur vers le round courant |
| `current_pipeline_stage_id` | `int unsigned` | YES | FK | `\N` | pointeur denormalise vers le stage courant |
| `last_progressed_at` | `datetime` | YES |  | `\N` | derniere activite de la chronologie |
| `aggregated_quiz_score` | `double` | YES |  | `\N` | resume calcule des rounds quiz retenus |
| `aggregated_quiz_score_percent` | `double` | YES |  | `\N` | pourcentage calcule des rounds quiz retenus |
| `aggregated_evaluation_score` | `double` | YES |  | `\N` | resume calcule des evaluations retenues |
| `aggregated_evaluation_score_percent` | `double` | YES |  | `\N` | pourcentage calcule des evaluations retenues |
| `created_at` | `datetime` | YES |  | `\N` | audit standard |
| `created_by` | `int` | YES |  | `\N` | audit standard |
| `updated_at` | `datetime` | YES |  | `\N` | audit standard |
| `updated_by` | `int` | YES |  | `\N` | audit standard |
| `is_deleted` | `tinyint(1)` | YES |  | `\N` | suppression logique |
| `search_string` | `text` | YES |  | `\N` | index libre / recherche |

### 5.4 `candidate_answer`

Colonnes retirees physiquement en cible finale:

- `application_id`

| Attribut | Type | Null | Cle | Defaut | Commentaire |
| --- | --- | --- | --- | --- | --- |
| `id` | `int unsigned` | NO | PRI | `\N` | identifiant technique |
| `is_selected` | `tinyint(1)` | NO |  | `\N` | reponse cochee / active |
| `manual_is_correct` | `tinyint(1)` | YES |  | `\N` | correction manuelle |
| `manual_correction_comment` | `text` | YES |  | `\N` | commentaire de correction |
| `manual_correction_score` | `int` | YES |  | `\N` | score manuel |
| `manual_corrected_at` | `timestamp` | YES |  | `\N` | horodatage correction manuelle |
| `manual_corrected_by` | `int` | YES | FK | `\N` | reference `user.id` |
| `application_quiz_attempt_id` | `int unsigned` | NO | FK | `\N` | reference `application_quiz_attempt.id` |
| `question_id` | `int unsigned` | NO | FK | `\N` | reference `question.id` |
| `answer_id` | `int unsigned` | YES | FK | `\N` | reference `answer.id`, nullable pour texte libre |
| `free_text_response` | `text` | YES |  | `\N` | reponse libre |
| `created_at` | `datetime` | YES |  | `\N` | audit standard |
| `created_by` | `int` | YES |  | `\N` | audit standard |
| `updated_at` | `datetime` | YES |  | `\N` | audit standard |
| `updated_by` | `int` | YES |  | `\N` | audit standard |
| `is_deleted` | `tinyint(1)` | YES |  | `\N` | suppression logique |
| `search_string` | `text` | YES |  | `\N` | index libre / recherche |

### 5.5 `interviews`

Colonnes retirees physiquement en cible finale:

- `campaign_id`
- `application_id`
- `interview_evaluations_link` (renomme)
- `interview_mail_sent`
- `evaluation_score`
- `evaluation_number`
- `evaluation_percentage`

| Attribut | Type | Null | Cle | Defaut | Commentaire |
| --- | --- | --- | --- | --- | --- |
| `id` | `int unsigned` | NO | PRI | `\N` | identifiant technique |
| `interview_location` | `varchar(255)` | YES |  | `\N` | lieu physique |
| `interview_date` | `datetime` | NO |  | `\N` | date de planification |
| `interview_status` | `varchar(20)` | NO |  | `\N` | statut cible de l'entretien |
| `meet_link` | `varchar(500)` | YES |  | `\N` | lien visioconference |
| `evaluation_room_code` | `varchar(8)` | YES |  | `\N` | remplace `interview_evaluations_link` pour la salle d'evaluation partagee |
| `interview_note` | `text` | YES |  | `\N` | note interne |
| `interview_type` | `varchar(20)` | NO |  | `\N` | `IN_PERSON` ou `ONLINE` |
| `started_at` | `datetime` | YES |  | `\N` | debut reel |
| `ended_at` | `datetime` | YES |  | `\N` | fin reelle |
| `evaluation_completed_at` | `datetime` | YES |  | `\N` | evaluation finalisee |
| `evaluation_completed_by` | `int unsigned` | YES | FK | `\N` | reference `user.id` |
| `closed_at` | `datetime` | YES |  | `\N` | cloture humaine |
| `closed_by` | `int unsigned` | YES | FK | `\N` | reference `user.id` |
| `closure_comment` | `text` | YES |  | `\N` | commentaire de cloture |
| `application_progress_id` | `int unsigned` | NO | FK | `\N` | reference `application_progress.id`; ancre unique du round |
| `created_at` | `datetime` | YES |  | `\N` | audit standard |
| `created_by` | `int` | YES |  | `\N` | audit standard |
| `updated_at` | `datetime` | YES |  | `\N` | audit standard |
| `updated_by` | `int` | YES |  | `\N` | audit standard |
| `is_deleted` | `tinyint(1)` | YES |  | `\N` | suppression logique |
| `search_string` | `text` | YES |  | `\N` | index libre / recherche |

### 5.6 `candidate_interview`

Colonnes retirees physiquement en cible finale:

- `interview_start`
- `application_id`

ECART CIBLE (decision BA 2026-08-04): `interview_duration` est CONSERVEE dans la cible finale (aucune raison metier de la supprimer). Elle n'est pas dans la liste §7.

| Attribut | Type | Null | Cle | Defaut | Commentaire |
| --- | --- | --- | --- | --- | --- |
| `id` | `int unsigned` | NO | PRI | `\N` | identifiant technique |
| `interview_duration` | `int` | YES |  | `\N` | duree d'entretien (CONSERVEE, decision BA 2026-08-04) |
| `candidate_response_status` | `varchar(30)` | NO |  | `PENDING` | reponse du candidat a cette occurrence |
| `responded_at` | `datetime` | YES |  | `\N` | horodatage de reponse |
| `interview_id` | `int unsigned` | NO | FK | `\N` | reference `interviews.id` |
| `decline_reason` | `varchar(500)` | YES |  | `\N` | raison de refus |
| `alternative_date_requested` | `datetime` | YES |  | `\N` | demande de replanification |
| `created_at` | `datetime` | YES |  | `\N` | audit standard |
| `created_by` | `int` | YES |  | `\N` | audit standard |
| `updated_at` | `datetime` | YES |  | `\N` | audit standard |
| `updated_by` | `int` | YES |  | `\N` | audit standard |
| `is_deleted` | `tinyint(1)` | YES |  | `\N` | suppression logique |
| `search_string` | `text` | YES |  | `\N` | index libre / recherche |

### 5.7 `evaluations`

Colonnes retirees physiquement en cible finale:

- `candidate_mark`
- `recruiter_comment`

| Attribut | Type | Null | Cle | Defaut | Commentaire |
| --- | --- | --- | --- | --- | --- |
| `id` | `int unsigned` | NO | PRI | `\N` | identifiant technique |
| `evaluation_status` | `varchar(20)` | NO |  | `DRAFT` | statut cible de la soumission |
| `submitted_at` | `datetime` | YES |  | `\N` | depot evaluateur |
| `validated_at` | `datetime` | YES |  | `\N` | validation humaine |
| `validated_by` | `int unsigned` | YES | FK | `\N` | reference `user.id` |
| `global_score` | `double` | YES |  | `\N` | score de synthese optionnel |
| `global_comment` | `text` | YES |  | `\N` | commentaire global optionnel |
| `candidate_interview_id` | `int unsigned` | NO | FK | `\N` | reference `candidate_interview.id` |
| `interview_participant_id` | `int unsigned` | NO | FK | `\N` | reference `interview_participant.id`; evaluateur explicite |
| `created_at` | `datetime` | YES |  | `\N` | audit standard |
| `created_by` | `int` | YES |  | `\N` | audit standard |
| `updated_at` | `datetime` | YES |  | `\N` | audit standard |
| `updated_by` | `int` | YES |  | `\N` | audit standard |
| `is_deleted` | `tinyint(1)` | YES |  | `\N` | suppression logique |
| `search_string` | `text` | YES |  | `\N` | index libre / recherche |

### 5.8 `decisions`

Colonnes retirees physiquement en cible finale:

- `is_cancel`
- `application_id`
- `pipeline_stage_id`

| Attribut | Type | Null | Cle | Defaut | Commentaire |
| --- | --- | --- | --- | --- | --- |
| `id` | `int unsigned` | NO | PRI | `\N` | identifiant technique |
| `decision_type` | `varchar(50)` | NO |  | `\N` | sortie metier de la decision |
| `user_id` | `int unsigned` | YES | FK | `\N` | acteur de la decision |
| `application_progress_id` | `int unsigned` | NO | FK | `\N` | round cible de la decision |
| `justification` | `text` | YES |  | `\N` | obligatoire pour annulation / override / rollback |
| `decision_mode` | `varchar(20)` | NO |  | `STANDARD` | mode technique de la decision |
| `cancels_decision_id` | `int unsigned` | YES | FK | `\N` | decision annulee le cas echeant |
| `created_at` | `datetime` | YES |  | `\N` | audit standard |
| `created_by` | `int` | YES |  | `\N` | audit standard |
| `updated_at` | `datetime` | YES |  | `\N` | audit standard |
| `updated_by` | `int` | YES |  | `\N` | audit standard |
| `is_deleted` | `tinyint(1)` | YES |  | `\N` | suppression logique |
| `search_string` | `text` | YES |  | `\N` | index libre / recherche |

## 6. Renommages et nettoyages semantiques retenus en cible finale

- `interviews.interview_evaluations_link` devient `interviews.evaluation_room_code`
- les identifiants de round font foi via `application_progress_id`; les colonnes `application_id` ou `pipeline_stage_id` redondantes encore presentes en transition sont retirees des tables runtime specialisees
- `applications` devient une table de resume et de pointeurs courants, plus une source primaire mono-occurrence
- `pipeline_stage.email_required` / `email_automatic` disparaissent de la structure cible; la politique de notification vit dans `pipeline_stage_notification_rule`

## 7. Colonnes retirees physiquement a l'issue de la migration

- `pipeline_stage`: `email_required`, `email_automatic`
- `application_progress`: `decided_by`, `mail_sent`
- `applications`: `quiz_score`, `total_evaluation_score`, `total_evaluation_number`, `total_evaluation_percentage`, `application_status`, `quiz_token`, `quiz_status`, `quiz_level`, `total_questions`, `quiz_score_percent`, `quiz_manual_correction_status`, `time_elapsed`, `quiz_timed_snapshot`, `quiz_total_time_allowed_snapshot`, `quiz_last_activity_at`, `interview_date`, `interview_status`
- `candidate_answer`: `application_id`
- `interviews`: `campaign_id`, `application_id`, `interview_evaluations_link`, `interview_mail_sent`, `evaluation_score`, `evaluation_number`, `evaluation_percentage`
- `candidate_interview`: `interview_start`, `application_id` (ECART CIBLE 2026-08-04: `interview_duration` est CONSERVEE, decision BA)
- `evaluations`: `candidate_mark`, `recruiter_comment`
- `decisions`: `is_cancel`, `application_id`, `pipeline_stage_id`

## 8. Lecture rapide de la cible finale

- le template vit dans `pipeline_stage`
- le runtime de chaque round vit dans `application_progress`
- chaque quiz vit dans `application_quiz_attempt` et `candidate_answer`
- chaque entretien vit dans `interviews` et `candidate_interview`
- chaque evaluation vit dans `evaluations` et `evaluation_item`
- chaque decision est ancree sur `decisions.application_progress_id`
- les notifications de round vivent dans `pipeline_stage_notification_rule` et `mail_log`
- l'audit transverse vit dans `audit_event`
- `applications` ne sert plus qu'a la synthese, aux pointeurs courants et aux verrous transverses de candidature