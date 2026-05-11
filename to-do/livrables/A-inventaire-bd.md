# Livrable A — Inventaire exhaustif de la BD `quizapp_db`

**Date :** 2026-05-11
**Source :** `to-do/bd_actuelle/quizapp_db_described.md`
**Statut :** ✅ Complet

> 📌 **Convention soft-delete réelle :** la colonne utilisée est **`is_deleted`** (`bit(1)` ou `tinyint(1)`), **pas** `deleted_at`. Les livrables B/C doivent en tenir compte.

---

## 1. Liste des tables (39 tables + 1 technique)

### 1.1 Tables métier (cœur du workflow recrutement)

| # | Table | Rôle métier |
|---|-------|-------------|
| 1 | `campaigns` | Campagne de recrutement |
| 2 | `form` | Formulaire de quiz attaché à une campagne |
| 3 | `form_version` | Version d'un formulaire (publication / verrouillage) |
| 4 | `form_questions` | Lien question ↔ form_version (avec ordre + chrono) |
| 5 | `question` | Question de quiz (réutilisable) |
| 6 | `answer` | Réponse possible à une question |
| 7 | `applications` | Candidature à une campagne |
| 8 | `candidate_answer` | Réponse choisie/écrite par un candidat |
| 9 | `application_progress` | Avancement d'une candidature dans le pipeline |
| 10 | `decisions` | Décision prise sur une candidature |
| 11 | `interviews` | Entretien planifié |
| 12 | `candidate_interview` | Créneau d'entretien pour un candidat |
| 13 | `evaluations` | Évaluation d'un entretien |
| 14 | `pipeline_template` | Template de pipeline réutilisable |
| 15 | `pipeline_stage` | Étape d'un pipeline |
| 16 | `departments` | Département |
| 17 | `specialities` | Spécialité (rattachée à un département) |

### 1.2 Tables jointure / association

| # | Table | Lien |
|---|-------|------|
| 18 | `campaign_crud` | user ↔ campaign + permissions |
| 19 | `interview_participant` | user ↔ interview + permissions |
| 20 | `user_business_group` | user ↔ business_group |

### 1.3 Tables permissions / système-rôles

| # | Table | Rôle |
|---|-------|------|
| 21 | `business_group` | Groupe métier |
| 22 | `business_group_permission` | Permissions d'un groupe |
| 23 | `system_role_permission` | Permissions par rôle système |
| 24 | `entity_permission` | Permission ciblée sur une entité précise |
| 25 | `user_permission_override` | Override individuel utilisateur |
| 26 | `group_change_request` | Demande de changement de groupe |

### 1.4 Tables tokens / auth / verification

| # | Table | Rôle |
|---|-------|------|
| 27 | `candidate_token` | Token court pour candidat (6 caractères) |
| 28 | `source_token` | Token de source (campagne + form) |
| 29 | `email_verification_tokens` | Token de vérification email |
| 30 | `invitation_code` | Code d'invitation (recruteur, etc.) |

### 1.5 Tables configuration & contenu administrable

| # | Table | Rôle |
|---|-------|------|
| 31 | `app_config` | Configuration applicative (branding, couleurs) |
| 32 | `smtp_config` | Configuration serveur SMTP |
| 33 | `email_template` | Template d'email |
| 34 | `email_template_preset` | Preset visuel pour templates |
| 35 | `legal_text` | Textes légaux (CGU, mentions, etc.) |

### 1.6 Tables utilisateurs

| # | Table | Rôle |
|---|-------|------|
| 36 | `user` | Utilisateur de la plateforme |

### 1.7 Tables notifications / communication

| # | Table | Rôle |
|---|-------|------|
| 37 | `notifications` | Notification utilisateur |
| 38 | `candidate_ask` | Demande d'un candidat (modification email, etc.) |

### 1.8 Tables techniques

| # | Table | Rôle |
|---|-------|------|
| 39 | `flyway_schema_history` | Historique migrations Flyway *(ne pas mapper)* |

---

## 2. Inventaire détaillé par table

> Format : `colonne : type : nullable : default : remarques`
> Colonnes techniques systématiques : `id`, `created_at`, `created_by`, `updated_at`, `updated_by`, `is_deleted`, `search_string`. Omises dans la suite **sauf exceptions**.

### 2.1 `campaigns`
- `id` : `int unsigned` : NO : PK
- `campaign_title` : `varchar(255)` : NO
- `campaign_desc` : `text` : YES
- `campaign_status` : `varchar(7)` : NO — **enum implicite** (DRAFT/OPEN/CLOSED/PAUSED ?)
- `campaign_start` : `datetime` : YES
- `campaign_end` : `datetime` : YES
- `max_apply` : `int` : YES
- `all_can_evaluate` : `tinyint(1)` : NO
- `total_questions` : `int` : YES
- `is_timed` : `tinyint(1)` : NO : 0
- `pipeline_template_id` : `int unsigned` : YES : **FK → pipeline_template.id**
- `form_assignment_strategy` : `varchar(30)` : YES — **enum implicite** (RANDOM/SEQUENTIAL/ROUND_ROBIN ?)
- `form_assignment_exhaustion_policy` : `varchar(20)` : YES — **enum implicite** (CYCLE/STOP/REUSE ?)
- `creator_id` : `int unsigned` : YES : **FK → user.id**
- `speciality_id` : `int unsigned` : YES : **FK → specialities.id**

### 2.2 `form`
- `id` : `int unsigned` : NO : PK
- `form_name` : `varchar(255)` : NO
- `form_desc` : `text` : YES
- `is_active` : `bit(1)` : YES : b'1'
- `campaign_id` : `int unsigned` : **NO** : **FK → campaigns.id** *(relation 1 campagne → N formulaires)*

### 2.3 `form_version`
- `id` : `int unsigned` : NO : PK
- `form_id` : `int unsigned` : NO : **FK → form.id**
- `version_number` : `int` : NO : 1
- `is_published` : `bit(1)` : YES : b'0'
- `is_locked` : `bit(1)` : YES : b'0'

### 2.4 `form_questions`
- `id` : `int unsigned` : NO : PK
- `form_version_id` : `int unsigned` : NO : **FK → form_version.id**
- `question_id` : `int unsigned` : NO : **FK → question.id**
- `question_order` : `int` : YES : 0
- `chrono_override` : `int unsigned` : YES

### 2.5 `question`
- `id` : `int unsigned` : NO : PK
- `question_ref` : `varchar(36)` : YES *(UUID)*
- `question_text` : `text` : NO
- `question_chrono` : `int` : YES : 10
- `question_type` : `varchar(20)` : YES : SINGLE_CHOICE — **enum implicite** (SINGLE_CHOICE/MULTIPLE_CHOICE/FREE_TEXT ?)
- `score` : `int` : YES : 1
- `difficulty_level` : `varchar(20)` : YES — **enum implicite** (EASY/MEDIUM/HARD ?)
- `speciality_id` : `int unsigned` : YES : **FK → specialities.id**

### 2.6 `answer`
- `id` : `int unsigned` : NO : PK
- `answer_text` : `text` : NO
- `is_correct` : `tinyint(1)` : YES
- `answer_order` : `int` : YES
- `answer_type` : `varchar(20)` : YES — **enum implicite**
- `question_id` : `int unsigned` : YES : **FK → question.id**

### 2.7 `applications`
- `id` : `int unsigned` : NO : PK
- `candidate_first_name` / `candidate_last_name` / `candidate_email` / `candidate_phone` : identité candidat
- `candidate_cv_path` : `varchar(1000)`
- `candidate_birth_date` : `date`
- `motivation_letter` : `text`
- `email_verified` : `tinyint(1)` : NO
- `quiz_score` / `total_evaluation_score` / `total_evaluation_number` / `total_evaluation_percentage` : scoring
- `application_status` : `varchar(8)` : YES — **enum implicite**
- `quiz_token` : `varchar(64)` : YES : UNI
- `quiz_status` : `varchar(9)` : NO — **enum implicite**
- `quiz_level` / `total_questions` / `quiz_score_percent` : quiz
- `quiz_manual_correction_status` : `varchar(20)` : NO : NOT_REQUIRED — **enum implicite**
- `time_elapsed` : `int` : NO : 0
- `quiz_last_activity_at` : `timestamp`
- `interview_date` : `datetime`
- `interview_status` : `varchar(20)` — **enum implicite**
- `application_abandoned` : `tinyint(1)`
- `pre_screen_decision_mail_sent` / `final_decision_mail_sent` : `tinyint(1)`
- `source_token_id` : `int unsigned` : **FK → source_token.id**
- `form_version_id` : `int unsigned` : **FK → form_version.id**

### 2.8 `candidate_answer`
- `id` : PK
- `is_selected` : `tinyint(1)` : NO
- `manual_is_correct` / `manual_correction_comment` / `manual_corrected_at` / `manual_corrected_by` : correction manuelle
- `application_id` : **FK → applications.id**
- `question_id` : **FK → question.id**
- `answer_id` : **FK → answer.id**
- `free_text_response` : `text`

### 2.9 `application_progress`
- `id` : PK
- `application_id` : NO : **FK → applications.id**
- `pipeline_stage_id` : NO : **FK → pipeline_stage.id**
- `progress_status` : `varchar(20)` : NO : PENDING — **enum implicite**
- `started_at` / `completed_at` : `datetime`
- `score` : `double`
- `notes` : `text`
- `decided_by` : `int unsigned` : **FK → user.id**

### 2.10 `decisions`
- `id` : PK
- `decision_type` : `varchar(50)` : NO — **enum implicite**
- `is_cancel` : `tinyint(1)` : NO
- `application_id` : **FK → applications.id**
- `user_id` : **FK → user.id**
- `pipeline_stage_id` : **FK → pipeline_stage.id**

### 2.11 `interviews`
- `id` : PK
- `interview_location` : `varchar(255)`
- `interview_date` : `datetime` : NO
- `interview_status` : `varchar(20)` : NO — **enum implicite**
- `meet_link` : `varchar(500)`
- `interview_evaluations_link` : `varchar(8)` *(token court)*
- `interview_note` : `text`
- `interview_mail_sent` : `tinyint(1)` : NO : 0
- `interview_type` : `varchar(20)` : NO — **enum implicite** (PHYSICAL/REMOTE/HYBRID ?)
- `started_at` / `ended_at` : `datetime`
- `evaluation_score` / `evaluation_number` / `evaluation_percentage` : scoring agrégé
- `campaign_id` : **FK → campaigns.id**
- `application_id` : **FK → applications.id**

### 2.12 `candidate_interview`
- `id` : PK
- `interview_start` : `datetime`
- `interview_duration` : `int`
- `application_id` : **FK → applications.id**
- `interview_id` : **FK → interviews.id**
- `decline_reason` : `varchar(500)`
- `alternative_date_requested` : `datetime`

### 2.13 `evaluations`
- `id` : PK
- `candidate_mark` : `int`
- `recruiter_comment` : `text`
- `candidate_interview_id` : **FK → candidate_interview.id**

### 2.14 `pipeline_template`
- `id` : PK
- `template_name` : `varchar(255)` : NO
- `template_desc` : `text`
- `is_default` / `is_active` / `is_locked` : `bit(1)`

### 2.15 `pipeline_stage`
- `id` : PK
- `pipeline_template_id` : NO : **FK → pipeline_template.id**
- `stage_type` : `varchar(50)` : NO — **enum implicite** (APPLICATION/QUIZ/INTERVIEW/DECISION ?)
- `stage_label` : `varchar(255)` : NO
- `stage_order` : `int` : NO
- `is_required` : `bit(1)` : NO : b'1'
- `is_eliminatory` : `bit(1)` : NO : b'0'
- `config_json` : `text` *(config dynamique par étape)*

### 2.16 `departments`
- `id` : PK
- `department_name` : `varchar(255)` : NO
- `department_desc` : `text`

### 2.17 `specialities`
- `id` : PK
- `speciality_name` : `varchar(255)` : NO
- `speciality_desc` : `text`
- `department_id` : `int unsigned` : **FK → departments.id**

### 2.18 `campaign_crud`
- `id` : PK
- `can_update` / `can_delete` / `can_evaluate` / `follow` / `is_admin` / `is_creator` / `can_planify` / `can_accept_pre_screen` / `can_accept_final` : `tinyint(1)` *(matrice de permissions)*
- `user_id` : **FK → user.id**
- `campaign_id` : **FK → campaigns.id**

### 2.19 `interview_participant`
- `id` : PK
- `can_update` / `can_delete` / `can_evaluate` / `is_admin` / `follow` / `is_online` / `has_finished` : `tinyint(1)`
- `last_ping_at` : `datetime`
- `user_id` : **FK → user.id**
- `interview_id` : **FK → interviews.id**

### 2.20 `user_business_group`
- `id` : PK
- `user_id` : NO : **FK → user.id**
- `business_group_id` : NO : **FK → business_group.id**
- `is_moderator` : `tinyint(1)` : NO : 0

### 2.21 `business_group`
- `id` : PK
- `group_name` : `varchar(100)` : NO : UNI
- `group_desc` : `text`

### 2.22 `business_group_permission`
- `id` : PK
- `business_group_id` : NO : **FK → business_group.id**
- `functionality` : `varchar(100)` : NO *(clé fonctionnalité)*

### 2.23 `system_role_permission`
- `id` : PK
- `system_role` : `varchar(20)` : NO — **enum implicite** (ROLE_*)
- `functionality` : `varchar(100)` : NO

### 2.24 `entity_permission`
- `id` : PK
- `user_id` : NO : **FK → user.id**
- `entity_type` : `varchar(50)` : NO — **enum implicite** (CAMPAIGN/FORM/INTERVIEW ?)
- `entity_id` : `int` : NO
- `permission_key` : `varchar(50)` : NO

### 2.25 `user_permission_override`
- `id` : PK
- `user_id` : NO : **FK → user.id**
- `functionality` : `varchar(100)` : NO
- `is_allowed` : `tinyint(1)` : NO

### 2.26 `group_change_request`
- `id` : PK
- `user_id` : NO : **FK → user.id**
- `target_group_id` : NO : **FK → business_group.id**
- `reason` : `text`
- `status` : `enum('PENDING','APPROVED','REJECTED')` : NO : PENDING — **ENUM EXPLICITE BD** ✅
- `requested_at` / `processed_at` : `timestamp`
- `processed_by` : **FK → user.id**

### 2.27 `candidate_token`
- `id` : PK
- `token_string` : `varchar(6)` *(token court)*
- `application_id` : **FK → applications.id**

### 2.28 `source_token`
- `id` : PK
- `token_string` : `varchar(6)` : NO
- `source_token_name` : `varchar(100)`
- `expiration_date` : `datetime`
- `campaign_id` : **FK → campaigns.id**
- `form_id` : **FK → form.id**

### 2.29 `email_verification_tokens`
- `id` : PK
- `email` : `varchar(255)` : NO
- `token` : `varchar(255)` : NO : UNI
- `token_type` : `varchar(255)` : NO : APPLICATION_VERIFICATION — **enum implicite**
- `expires_at` : `datetime` : NO
- `is_used` : `tinyint(1)` : NO : 0
- `used_at` : `datetime`
- `application_id` : **FK → applications.id**
- `user_id` : **FK → user.id**

### 2.30 `invitation_code`
- `id` : `bigint` : PK
- `email` : `varchar(255)` : NO
- `role` : `varchar(30)` : NO : recruiter — **enum implicite**
- `code` : `varchar(50)` : NO : UNI
- `is_used` : `bit(1)` : NO : b'0'
- `expired_at` : `datetime` : NO
- `created_by` : **FK → user.id**

### 2.31 `app_config`
- `id` : `bigint` : PK
- `config_name` : `varchar(100)` : NO
- `company_name` : `varchar(255)` : NO : Synelia
- `app_link` : `varchar(500)`
- `logo_html` : `text`
- `primary_color` : `varchar(7)` : NO : #7C3AED
- `color_scheme` : `varchar(30)` : NO : violet
- `candidate_accounts_enabled` : `tinyint(1)` : NO : 0
- `is_active` : `bit(1)` : NO : b'0'

### 2.32 `smtp_config`
- `id` : PK
- `host` / `port` / `username` / `password_encrypted`
- `smtp_auth` / `starttls_enable` / `starttls_required` : `bit(1)`
- `connection_timeout` / `timeout` / `write_timeout` : `int`
- `sender_name` / `sender_email`
- `is_active` : `bit(1)` : b'0'

### 2.33 `email_template`
- `id` : PK
- `template_key` : `varchar(50)` : NO : UNI
- `subject_template` / `body_template` : NO
- `editable_variables_json` : `text`
- `description` : `varchar(500)`
- `available_variables` : `text`
- `action_type` : `varchar(50)` — **enum implicite**
- `preset_id` : **FK → email_template_preset.id** *(implicite, pas marqué MUL)*
- `is_active` : `bit(1)` : b'1'

### 2.34 `email_template_preset`
- `id` : PK
- `name` : `varchar(100)` : NO
- `category` : `enum('MINIMAL','MODERN','CORPORATE','COLORFUL','DARK','APPLICATION_VERIFICATION','PASSWORD_RESET','INVITATION_CODE','CANDIDATE_ASK_RESULT','PRE_SCREEN_DECISION','FINAL_DECISION','INTERVIEW_INVITE','QUIZ_INVITE','WELCOME','GENERIC')` : NO : GENERIC — **ENUM EXPLICITE BD** ✅
- `html_structure` : `text` : NO
- `preview_image` : `varchar(500)`
- `description` : `varchar(500)`

### 2.35 `legal_text`
- `id` : PK
- `text_key` : `varchar(50)` : NO : UNI
- `title` : `varchar(255)` : NO
- `content` : `text` : NO
- `description` : `varchar(500)`
- `is_active` : `bit(1)` : b'1'

### 2.36 `user`
- `id` : PK
- `first_name` / `last_name` : NO
- `username` : `varchar(50)` : NO : UNI
- `email` : `varchar(255)` : NO : UNI
- `phone` : `varchar(20)`
- `password` : `varchar(255)` : NO
- `is_default_password` : `tinyint(1)`
- `user_role` : `varchar(20)` — **enum implicite** (SUPER_ADMIN/ADMIN/RECRUITER/CANDIDATE ?)
- `is_online` / `is_locked` : `tinyint(1)`
- `last_connection_date` : `datetime`
- `admin_mode` : `tinyint(1)` : 0
- `page_size_preference` : `int` : 10

### 2.37 `notifications`
- `id` : PK
- `notif_type` : `varchar(100)` — **enum implicite**
- `notif_actor` : `int` *(non-FK formelle)*
- `notif_link` : `varchar(255)`
- `is_read` : `tinyint(1)`
- `object_table_name` : `varchar(100)` *(référence polymorphique)*
- `object_table_id` : `int`
- `user_id` : **FK → user.id**

### 2.38 `candidate_ask`
- `id` : PK
- `request_type` : `varchar(10)` — **enum implicite**
- `ask_status` : `varchar(20)` : NO : PENDING — **enum implicite**
- `is_verified` : `tinyint(1)` : NO
- `first_name` / `last_name` / `new_email` / `new_phone`
- `decision_reason` : `varchar(500)`
- `application_id` : **FK → applications.id**

---

## 3. Tableau récapitulatif des FK

| Table enfant | Colonne | → Table parent | Cardinalité |
|---|---|---|---|
| `answer` | `question_id` | `question` | N:1 |
| `application_progress` | `application_id` | `applications` | N:1 |
| `application_progress` | `pipeline_stage_id` | `pipeline_stage` | N:1 |
| `application_progress` | `decided_by` | `user` | N:1 |
| `applications` | `source_token_id` | `source_token` | N:1 |
| `applications` | `form_version_id` | `form_version` | N:1 |
| `business_group_permission` | `business_group_id` | `business_group` | N:1 |
| `campaign_crud` | `user_id` | `user` | N:1 |
| `campaign_crud` | `campaign_id` | `campaigns` | N:1 |
| `campaigns` | `pipeline_template_id` | `pipeline_template` | N:1 |
| `campaigns` | `creator_id` | `user` | N:1 |
| `campaigns` | `speciality_id` | `specialities` | N:1 |
| `candidate_answer` | `application_id` | `applications` | N:1 |
| `candidate_answer` | `question_id` | `question` | N:1 |
| `candidate_answer` | `answer_id` | `answer` | N:1 |
| `candidate_ask` | `application_id` | `applications` | N:1 |
| `candidate_interview` | `application_id` | `applications` | N:1 |
| `candidate_interview` | `interview_id` | `interviews` | N:1 |
| `candidate_token` | `application_id` | `applications` | N:1 |
| `decisions` | `application_id` | `applications` | N:1 |
| `decisions` | `user_id` | `user` | N:1 |
| `decisions` | `pipeline_stage_id` | `pipeline_stage` | N:1 |
| `email_verification_tokens` | `application_id` | `applications` | N:1 |
| `email_verification_tokens` | `user_id` | `user` | N:1 |
| `entity_permission` | `user_id` | `user` | N:1 |
| `evaluations` | `candidate_interview_id` | `candidate_interview` | N:1 |
| `form` | `campaign_id` | `campaigns` | **N:1** *(1 campagne → N forms)* |
| `form_questions` | `form_version_id` | `form_version` | N:1 |
| `form_questions` | `question_id` | `question` | N:1 |
| `form_version` | `form_id` | `form` | N:1 |
| `group_change_request` | `user_id` | `user` | N:1 |
| `group_change_request` | `target_group_id` | `business_group` | N:1 |
| `group_change_request` | `processed_by` | `user` | N:1 |
| `interview_participant` | `user_id` | `user` | N:1 |
| `interview_participant` | `interview_id` | `interviews` | N:1 |
| `interviews` | `campaign_id` | `campaigns` | N:1 |
| `interviews` | `application_id` | `applications` | N:1 |
| `invitation_code` | `created_by` | `user` | N:1 |
| `notifications` | `user_id` | `user` | N:1 |
| `pipeline_stage` | `pipeline_template_id` | `pipeline_template` | N:1 |
| `question` | `speciality_id` | `specialities` | N:1 |
| `source_token` | `campaign_id` | `campaigns` | N:1 |
| `source_token` | `form_id` | `form` | N:1 |
| `specialities` | `department_id` | `departments` | N:1 |
| `user_business_group` | `user_id` | `user` | N:1 |
| `user_business_group` | `business_group_id` | `business_group` | N:1 |
| `user_permission_override` | `user_id` | `user` | N:1 |

---

## 4. Enums à matérialiser côté code

### 4.1 Enums **explicites** BD (déjà déclarés `ENUM(...)`)

| Table | Colonne | Valeurs |
|---|---|---|
| `email_template_preset` | `category` | MINIMAL, MODERN, CORPORATE, COLORFUL, DARK, APPLICATION_VERIFICATION, PASSWORD_RESET, INVITATION_CODE, CANDIDATE_ASK_RESULT, PRE_SCREEN_DECISION, FINAL_DECISION, INTERVIEW_INVITE, QUIZ_INVITE, WELCOME, GENERIC |
| `group_change_request` | `status` | PENDING, APPROVED, REJECTED |

### 4.2 Enums **implicites** (`varchar` libre — à matérialiser)

| Table | Colonne | Valeurs probables (à confronter au code) |
|---|---|---|
| `applications` | `application_status` | *(8 caractères : DRAFT/PENDING/ACCEPTED/REJECTED ?)* |
| `applications` | `quiz_status` | *(9 caractères : NOT_TAKEN/STARTED/COMPLETED/EXPIRED ?)* |
| `applications` | `quiz_manual_correction_status` | NOT_REQUIRED, PENDING, IN_PROGRESS, DONE *(à confirmer)* |
| `applications` | `interview_status` | *(à confirmer côté code)* |
| `application_progress` | `progress_status` | PENDING, IN_PROGRESS, COMPLETED, SKIPPED *(à confirmer)* |
| `answer` | `answer_type` | *(à confirmer)* |
| `campaigns` | `campaign_status` | *(7 caractères : DRAFT/OPEN/CLOSED ?)* |
| `campaigns` | `form_assignment_strategy` | RANDOM, SEQUENTIAL, ROUND_ROBIN *(à confirmer)* |
| `campaigns` | `form_assignment_exhaustion_policy` | CYCLE, STOP, REUSE *(à confirmer)* |
| `candidate_ask` | `request_type` | *(à confirmer)* |
| `candidate_ask` | `ask_status` | PENDING, APPROVED, REJECTED *(à confirmer)* |
| `decisions` | `decision_type` | PRE_SCREEN_ACCEPT, PRE_SCREEN_REJECT, FINAL_ACCEPT, FINAL_REJECT *(à confirmer)* |
| `email_template` | `action_type` | *(à confirmer)* |
| `email_verification_tokens` | `token_type` | APPLICATION_VERIFICATION, PASSWORD_RESET, ... |
| `entity_permission` | `entity_type` | CAMPAIGN, FORM, INTERVIEW, ... |
| `interviews` | `interview_status` | SCHEDULED, IN_PROGRESS, DONE, CANCELLED *(à confirmer)* |
| `interviews` | `interview_type` | PHYSICAL, REMOTE, HYBRID *(à confirmer)* |
| `invitation_code` | `role` | recruiter, admin, ... |
| `notifications` | `notif_type` | *(catalogue à extraire du code)* |
| `pipeline_stage` | `stage_type` | APPLICATION, QUIZ, INTERVIEW, DECISION *(à confirmer)* |
| `question` | `question_type` | SINGLE_CHOICE, MULTIPLE_CHOICE, FREE_TEXT *(à confirmer)* |
| `question` | `difficulty_level` | EASY, MEDIUM, HARD *(à confirmer)* |
| `system_role_permission` | `system_role` | SUPER_ADMIN, ADMIN, RECRUITER, CANDIDATE *(à confirmer)* |
| `user` | `user_role` | SUPER_ADMIN, ADMIN, RECRUITER, CANDIDATE *(à confirmer)* |

---

## 5. Conventions techniques observées

### 5.1 Colonnes techniques systématiques
- `id` : `int unsigned` ou `bigint` (PK)
- `created_at` : `datetime` ou `timestamp`
- `created_by` : `int` ou `int unsigned`
- `updated_at` : `datetime` ou `timestamp`
- `updated_by` : `int` ou `int unsigned`
- `is_deleted` : `tinyint(1)` ou `bit(1)` — **convention soft-delete**
- `search_string` : `text` — *(champ de recherche dénormalisé)*

### 5.2 Incohérences de typage observées
- `created_by` / `updated_by` : tantôt `int`, tantôt `int unsigned` — **à harmoniser**.
- `is_deleted` : tantôt `tinyint(1)`, tantôt `bit(1)` — **à harmoniser**.
- `created_at` / `updated_at` : tantôt `datetime`, tantôt `timestamp` — *(à clarifier)*.

### 5.3 Tables **sans `search_string`**
- `business_group_permission`
- `email_template_preset`
- `email_verification_tokens`
- `system_role_permission`
- `user_business_group`
- `user_permission_override`
- `flyway_schema_history`
> *Probablement intentionnel (tables de jointure/config) mais à confirmer.*

### 5.4 Tables **sans triplet (`updated_at`, `updated_by`)** complet ou cohérent
- `email_template_preset` : pas de `updated_by`
- `system_role_permission`, `business_group_permission`, `entity_permission`, `user_permission_override`, `user_business_group` : OK
- *(Vérifier en B.1 que les entités JPA refletent fidèlement.)*

---

## 6. Tables à surveiller particulièrement (signaux d'alerte)

- **`campaigns`** : champs `form_assignment_strategy` / `form_assignment_exhaustion_policy` éditables en BD mais probablement absents de l'UI métier.
- **`form` / `form_version` / `form_questions`** : trio récent — vérifier que tout le pipeline back+front est en place.
- **`source_token` / `candidate_token`** : usage côté UI à vérifier.
- **`group_change_request`** : enum BD bien défini ; vérifier que les transitions de statut sont gérées côté code.
- **`notifications.object_table_name` + `object_table_id`** : référence polymorphique — vérifier la cohérence des `object_table_name` autorisés.
- **`pipeline_stage.config_json`** : configuration dynamique — vérifier la documentation des schémas attendus par `stage_type`.

---

## 7. Tables **absentes** de la BD (mais potentiellement référencées côté code)

> *À confirmer via Phase B.1.*

- `campaign_questions` *(présomption : remplacée par `form_questions` via `form_version`)*
- *(Liste à compléter en Phase B.)*
