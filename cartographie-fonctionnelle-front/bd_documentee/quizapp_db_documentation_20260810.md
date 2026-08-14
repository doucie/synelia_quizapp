# quizapp_db — Dictionnaire des tables et des champs

Date : 2026-08-10
Base : `quizapp_db`
Source : `bd_actuelle/quizapp_db_described_20260810.md` (snapshot vérifié conforme)
But : expliquer, en langage métier, chaque table et chaque champ de la base, en regroupant les tables qui travaillent ensemble.

## Convention de lecture

- Chaque table est présentée dans la famille métier dont elle dépend le plus (les tables qui communiquent le plus sont côte à côte).
- `Type`, `Null`, `Clé` et `Défaut` sont repris tels quels du snapshot de la base.
- Chaque champ est expliqué en une phrase métier simple.
- Les colonnes d'audit, présentes dans presque toutes les tables, ont toujours le même sens (sauf note contraire dans la table) :
  - `created_at` / `created_by` : date et auteur de création de la ligne.
  - `updated_at` / `updated_by` : date et auteur de la dernière modification de la ligne.
  - `is_deleted` : suppression logique (la ligne n'est plus affichée mais reste en base).
  - `search_string` : zone libre de recherche / index plein texte.
- En bas de chaque tableau, les **Notes** signalent les points de vigilance et les écarts documentés.
- Les colonnes d'énumération (statuts, types, modes) sont récapitulées en **annexe** avec leurs valeurs.

## Sommaire des familles

1. **Pipeline (gabarits)** : `pipeline_template`, `pipeline_stage`, `pipeline_stage_notification_rule`
2. **Campagnes & référentiels** : `campaigns`, `campaign_form`, `source_token`, `departments`, `specialities`
3. **Candidature** : `applications`, `application_progress`, `candidate_token`, `candidate_ask`
4. **Quiz** : `form`, `form_version`, `form_questions`, `question`, `answer`, `application_quiz_attempt`, `candidate_answer`
5. **Entretien & évaluation** : `interviews`, `candidate_interview`, `interview_participant`, `evaluations`, `evaluation_item`, `evaluation_grid_template`, `evaluation_grid_template_version`, `evaluation_grid_template_item`
6. **Décisions** : `decisions`
7. **Emailing** : `email_template`, `email_template_preset`, `mail_log`, `smtp_config`, `email_verification_tokens`
8. **Utilisateurs & permissions** : `user`, `business_group`, `business_group_permission`, `user_business_group`, `user_permission_override`, `system_role_permission`, `entity_permission`, `group_change_request`, `invitation_code`
9. **Plateforme transverse** : `app_config`, `legal_text`, `notifications`, `audit_event`, `flyway_schema_history`

---

# 1. Pipeline (gabarits)

## Table 1 — `pipeline_template`

> Un gabarit de processus de recrutement : la liste ordonnée des étapes que suivra chaque candidature d'une campagne.

| Attribut | Type | Null | Clé | Défaut | Explication |
| --- | --- | --- | --- | --- | --- |
| id | int unsigned | NO | PRI | \N | Identifiant technique du gabarit. |
| template_name | varchar(255) | NO |  | \N | Nom du gabarit de pipeline. |
| template_desc | text | YES |  | \N | Description libre du gabarit. |
| is_default | bit(1) | NO |  | b'0' | Indique si c'est le gabarit proposé par défaut pour les nouvelles campagnes. |
| is_active | bit(1) | NO |  | b'1' | Indique si le gabarit est utilisable. |
| is_locked | bit(1) | NO |  | b'0' | Indique si le gabarit est verrouillé (non modifiable). |
| created_at | datetime | YES |  | \N | Date de création de la ligne (audit). |
| created_by | int | YES |  | \N | Auteur de la création de la ligne (audit). |
| updated_at | datetime | YES |  | \N | Date de la dernière modification (audit). |
| updated_by | int | YES |  | \N | Auteur de la dernière modification (audit). |
| is_deleted | bit(1) | NO |  | b'0' | Suppression logique de la ligne. |
| search_string | text | YES |  | \N | Zone libre de recherche / index plein texte. |

## Table 2 — `pipeline_stage`

> Une étape du processus (candidature, quiz, présélection, entretien, décision) dans un gabarit de pipeline.

| Attribut | Type | Null | Clé | Défaut | Explication |
| --- | --- | --- | --- | --- | --- |
| id | int unsigned | NO | PRI | \N | Identifiant technique de l'étape. |
| pipeline_template_id | int unsigned | NO | MUL | \N | Gabarit auquel appartient l'étape. |
| stage_type | varchar(50) | NO |  | \N | Type métier de l'étape (CANDIDATURE, QUIZ, PRESELECTION, INTERVIEW, DECISION). |
| stage_label | varchar(255) | NO |  | \N | Libellé affiché de l'étape. |
| stage_order | int | NO |  | \N | Position de l'étape dans le pipeline. |
| is_active | bit(1) | NO |  | b'1' | Révision active (`1`) ou historique inactive (`0`). Au plus une révision active par slot. |
| active_slot | int | YES | MUL | \N | Colonne générée `IF(is_active, stage_order, NULL)` ; supporte `UNIQUE(pipeline_template_id, active_slot)`. |
| is_required | bit(1) | NO |  | b'1' | Indique si l'étape est obligatoire (ne peut pas être passée). |
| is_eliminatory | bit(1) | NO |  | b'0' | Indique si échouer cette étape élimine définitivement le candidat. |
| config_json | text | YES |  | \N | Configuration de l'étape (screening quiz, règles, etc.). |
| evaluation_grid_template_version_id | int unsigned | YES | MUL | \N | Version de grille d'évaluation utilisée par cette étape d'évaluation (nullable : étape sans évaluation). |
| created_at | datetime | YES |  | \N | Date de création de la ligne (audit). |
| created_by | int | YES |  | \N | Auteur de la création de la ligne (audit). |
| updated_at | datetime | YES |  | \N | Date de la dernière modification (audit). |
| updated_by | int | YES |  | \N | Auteur de la dernière modification (audit). |
| is_deleted | bit(1) | NO |  | b'0' | Suppression logique de la ligne. |
| search_string | text | YES |  | \N | Zone libre de recherche / index plein texte. |

**Notes :**
- `stage_type` est une énumération (valeurs en annexe) ; `EVALUATION` n'est plus un type d'étape, il a été fusionné dans `DECISION`.
- `is_active` + `active_slot` (colonne générée) + `UNIQUE(pipeline_template_id, active_slot)` portent le versionnage fin des étapes (440 Lot B) : un slot a au plus une révision active, les révisions inactives restent en historique sans unicité.
- Le verrou d'étape n'est pas stocké : une étape est considérée utilisée (`locked`) s'il existe un `application_progress` qui la référence avec un statut différent de `PENDING` (dérivé via `ApplicationProgressRepository.findUsedStageIds`).

## Table 3 — `pipeline_stage_notification_rule`

> La règle de notification d'une étape : quel email envoyer, à quel déclencheur, et si l'envoi est automatique.

| Attribut | Type | Null | Clé | Défaut | Explication |
| --- | --- | --- | --- | --- | --- |
| id | int unsigned | NO | PRI | \N | Identifiant technique de la règle. |
| pipeline_stage_id | int unsigned | NO | MUL | \N | Étape à laquelle la règle est rattachée. |
| trigger_code | varchar(80) | NO |  | \N | Événement qui déclenche la notification (ex. entretien planifié). |
| outcome_code | varchar(80) | YES |  | \N | Issue de l'étape qui déclenche la notification (optionnelle). |
| email_template_id | int unsigned | YES | MUL | \N | Modèle d'email à envoyer. |
| is_required | tinyint(1) | NO |  | 0 | Indique si la notification est obligatoire. |
| is_automatic | tinyint(1) | NO |  | 0 | Indique si l'envoi est automatique. |
| requires_manual_confirmation | tinyint(1) | NO |  | 0 | Indique si un humain doit confirmer l'envoi avant qu'il parte. |
| created_at | datetime | YES |  | \N | Date de création de la ligne (audit). |
| created_by | int | YES |  | \N | Auteur de la création de la ligne (audit). |
| updated_at | datetime | YES |  | \N | Date de la dernière modification (audit). |
| updated_by | int | YES |  | \N | Auteur de la dernière modification (audit). |
| is_deleted | tinyint(1) | NO |  | 0 | Suppression logique de la ligne. |
| search_string | text | YES |  | \N | Zone libre de recherche / index plein texte. |

**Notes :**
- C'est ici que vit la politique d'emailing par étape (anciennement `pipeline_stage.email_required` / `email_automatic`, supprimées).

---

# 2. Campagnes & référentiels

## Table 4 — `campaigns`

> Une campagne de recrutement : un poste à pourvoir avec son pipeline, ses dates et ses paramètres.

| Attribut | Type | Null | Clé | Défaut | Explication |
| --- | --- | --- | --- | --- | --- |
| id | int unsigned | NO | PRI | \N | Identifiant technique de la campagne. |
| campaign_title | varchar(255) | NO |  | \N | Intitulé de la campagne (le poste à pourvoir). |
| campaign_desc | text | YES |  | \N | Description de la campagne. |
| campaign_status | varchar(20) | NO |  | \N | Statut de la campagne (DRAFT, PENDING, OPEN, PAUSED, CLOSED). |
| campaign_start | datetime | YES |  | \N | Date de début de la campagne. |
| campaign_end | datetime | YES |  | \N | Date de fin de la campagne. |
| max_apply | int | YES |  | \N | Nombre maximal de candidatures acceptées. |
| all_can_evaluate | tinyint(1) | NO |  | \N | Indique si tous les utilisateurs peuvent évaluer les entretiens de la campagne. |
| total_questions | int | YES |  | \N | Nombre total de questions du quiz (résumé). |
| is_timed | tinyint(1) | NO |  | 0 | Indique si le quiz de la campagne est chronométré. |
| is_archived | tinyint(1) | NO |  | 0 | Indique si la campagne est archivée. |
| time_all_forms | tinyint(1) | NO |  | 0 | Indique si le temps est commun à tous les formulaires du quiz. |
| pipeline_template_id | int unsigned | YES | MUL | \N | Gabarit de pipeline utilisé par la campagne. |
| form_assignment_strategy | varchar(30) | YES |  | \N | Stratégie d'attribution des formulaires aux candidats. |
| form_assignment_exhaustion_policy | varchar(20) | YES |  | \N | Politique appliquée quand tous les formulaires sont épuisés. |
| creator_id | int unsigned | YES | MUL | \N | Utilisateur qui a créé la campagne. |
| speciality_id | int unsigned | YES | MUL | \N | Spécialité métier associée à la campagne. |
| created_at | datetime | YES |  | \N | Date de création de la ligne (audit). |
| created_by | int | YES |  | \N | Auteur de la création de la ligne (audit). |
| updated_at | datetime | YES |  | \N | Date de la dernière modification (audit). |
| updated_by | int | YES |  | \N | Auteur de la dernière modification (audit). |
| is_deleted | tinyint(1) | YES |  | \N | Suppression logique de la ligne. |
| search_string | text | YES |  | \N | Zone libre de recherche / index plein texte. |

**Notes :**
- `total_questions`, `is_timed`, `time_all_forms` et `all_can_evaluate` sont des champs adjacents conservés hors périmètre strict 420.

## Table 5 — `campaign_form`

> Le lien entre une campagne et un formulaire : quel formulaire est attribué à la campagne et dans quel ordre.

| Attribut | Type | Null | Clé | Défaut | Explication |
| --- | --- | --- | --- | --- | --- |
| id | int unsigned | NO | PRI | \N | Identifiant technique du lien. |
| campaign_id | int unsigned | NO | MUL | \N | Campagne concernée. |
| form_id | int unsigned | NO | MUL | \N | Formulaire concerné. |
| assignment_order | int | YES |  | \N | Ordre d'assignation du formulaire dans la campagne. |
| created_at | datetime | YES |  | \N | Date de création de la ligne (audit). |
| created_by | int | YES |  | \N | Auteur de la création de la ligne (audit). |
| updated_at | datetime | YES |  | \N | Date de la dernière modification (audit). |
| updated_by | int | YES |  | \N | Auteur de la dernière modification (audit). |
| is_deleted | bit(1) | YES |  | b'0' | Suppression logique de la ligne. |
| search_string | text | YES |  | \N | Zone libre de recherche / index plein texte. |
| active_campaign_id | int unsigned | YES | MUL | \N | Identifiant de la campagne active (dénormalisation). |
| active_form_id | int unsigned | YES |  | \N | Identifiant du formulaire actif (dénormalisation). |

## Table 6 — `source_token`

> Un code source de recrutement : permet de tracer d'où viennent les candidatures d'une campagne.

| Attribut | Type | Null | Clé | Défaut | Explication |
| --- | --- | --- | --- | --- | --- |
| id | int unsigned | NO | PRI | \N | Identifiant technique du code source. |
| token_string | varchar(6) | NO |  | \N | Code source (6 caractères). |
| source_token_name | varchar(100) | YES |  | \N | Nom du canal source (ex. « LinkedIn »). |
| expiration_date | datetime | YES |  | \N | Date d'expiration du code. |
| campaign_id | int unsigned | YES | MUL | \N | Campagne associée au code. |
| form_id | int unsigned | YES | MUL | \N | Formulaire associé au code (optionnel). |
| created_at | datetime | YES |  | \N | Date de création de la ligne (audit). |
| created_by | int | YES |  | \N | Auteur de la création de la ligne (audit). |
| updated_at | datetime | YES |  | \N | Date de la dernière modification (audit). |
| updated_by | int | YES |  | \N | Auteur de la dernière modification (audit). |
| is_deleted | tinyint(1) | YES |  | \N | Suppression logique de la ligne. |
| search_string | text | YES |  | \N | Zone libre de recherche / index plein texte. |
| is_public | tinyint(1) | NO |  | 0 | Indique si le code est public (accessible sans invitation). |

## Table 7 — `departments`

> Un département de l'entreprise, référentiel utilisé pour classer les spécialités.

| Attribut | Type | Null | Clé | Défaut | Explication |
| --- | --- | --- | --- | --- | --- |
| id | int unsigned | NO | PRI | \N | Identifiant technique du département. |
| department_name | varchar(255) | NO |  | \N | Nom du département. |
| department_desc | text | YES |  | \N | Description du département. |
| created_at | datetime | YES |  | \N | Date de création de la ligne (audit). |
| created_by | int | YES |  | \N | Auteur de la création de la ligne (audit). |
| updated_at | datetime | YES |  | \N | Date de la dernière modification (audit). |
| updated_by | int | YES |  | \N | Auteur de la dernière modification (audit). |
| is_deleted | tinyint(1) | YES |  | \N | Suppression logique de la ligne. |
| search_string | text | YES |  | \N | Zone libre de recherche / index plein texte. |

## Table 8 — `specialities`

> Une spécialité métier rattachée à un département (ex. « Développement », « Marketing »).

| Attribut | Type | Null | Clé | Défaut | Explication |
| --- | --- | --- | --- | --- | --- |
| id | int unsigned | NO | PRI | \N | Identifiant technique de la spécialité. |
| speciality_name | varchar(255) | NO |  | \N | Nom de la spécialité. |
| speciality_desc | text | YES |  | \N | Description de la spécialité. |
| department_id | int unsigned | YES | MUL | \N | Département auquel la spécialité appartient. |
| created_at | datetime | YES |  | \N | Date de création de la ligne (audit). |
| created_by | int | YES |  | \N | Auteur de la création de la ligne (audit). |
| updated_at | datetime | YES |  | \N | Date de la dernière modification (audit). |
| updated_by | int | YES |  | \N | Auteur de la dernière modification (audit). |
| is_deleted | tinyint(1) | YES |  | \N | Suppression logique de la ligne. |
| search_string | text | YES |  | \N | Zone libre de recherche / index plein texte. |

---

# 3. Candidature

## Table 9 — `applications`

> La candidature d'un candidat à une campagne : son identité, son état courant et ses synthèses de progression.

| Attribut | Type | Null | Clé | Défaut | Explication |
| --- | --- | --- | --- | --- | --- |
| id | int unsigned | NO | PRI | \N | Identifiant technique de la candidature. |
| candidate_first_name | varchar(100) | NO |  | \N | Prénom du candidat. |
| candidate_last_name | varchar(100) | NO |  | \N | Nom du candidat. |
| candidate_email | varchar(255) | NO |  | \N | Email du candidat. |
| candidate_phone | varchar(20) | YES |  | \N | Téléphone du candidat. |
| candidate_cv_path | varchar(1000) | YES |  | \N | Chemin du CV du candidat. |
| candidate_birth_date | date | YES |  | \N | Date de naissance du candidat. |
| motivation_letter | text | YES |  | \N | Lettre de motivation du candidat. |
| email_verified | tinyint(1) | NO |  | \N | Indique si l'email du candidat a été vérifié. |
| current_interview_evaluation_score | int | YES |  | \N | Score de synthèse de l'entretien courant (dérivé). |
| current_interview_evaluation_number | int | YES |  | \N | Nombre d'évaluations prises en compte pour l'entretien courant (dérivé). |
| current_interview_evaluation_percentage | double | YES |  | \N | Pourcentage de synthèse de l'entretien courant (dérivé). |
| current_preselection_decision_type | varchar(50) | YES |  | \N | Verdict de la présélection courante (dérivé). |
| current_preselection_decision_date | datetime | YES |  | \N | Date de la décision de présélection courante (dérivée). |
| current_final_decision_type | varchar(50) | YES |  | \N | Verdict de la décision finale courante (dérivé). |
| current_final_decision_date | datetime | YES |  | \N | Date de la décision finale courante (dérivée). |
| current_pipeline_stage_type | varchar(50) | YES |  | \N | Type de l'étape courante du pipeline (dérivé). |
| current_pipeline_stage_label | varchar(255) | YES |  | \N | Libellé de l'étape courante (dérivé). |
| current_pipeline_progress_status | varchar(20) | YES |  | \N | Statut de l'étape courante (dérivé). |
| application_abandoned | tinyint(1) | YES |  | \N | Indique si la candidature a été abandonnée. |
| abandoned_at | datetime | YES |  | \N | Date de l'abandon de la candidature. |
| abandon_reason | text | YES |  | \N | Raison de l'abandon. |
| abandoned_from_application_progress_id | int unsigned | YES | MUL | \N | Étape à partir de laquelle la candidature a été abandonnée. |
| source_token_id | int unsigned | YES | MUL | \N | Code source d'origine de la candidature. |
| form_version_id | int unsigned | YES | MUL | \N | Version de formulaire utilisée pour postuler (formulaire initial). |
| current_application_progress_id | int unsigned | YES | MUL | \N | Pointeur vers l'étape (application_progress) courante. |
| current_pipeline_stage_id | int unsigned | YES | MUL | \N | Pointeur dénormalisé vers l'étape du pipeline courante. |
| last_progressed_at | datetime | YES |  | \N | Date de la dernière progression de la candidature. |
| aggregated_quiz_score | double | YES |  | \N | Score agrégé des rounds quiz retenus (dérivé). |
| aggregated_quiz_score_percent | double | YES |  | \N | Pourcentage agrégé des rounds quiz retenus (dérivé). |
| aggregated_evaluation_score | double | YES |  | \N | Score agrégé des évaluations retenues (dérivé). |
| aggregated_evaluation_score_percent | double | YES |  | \N | Pourcentage agrégé des évaluations retenues (dérivé). |
| created_at | datetime | YES |  | \N | Date de création de la ligne (audit). |
| created_by | int | YES |  | \N | Auteur de la création de la ligne (audit). |
| updated_at | datetime | YES |  | \N | Date de la dernière modification (audit). |
| updated_by | int | YES |  | \N | Auteur de la dernière modification (audit). |
| is_deleted | tinyint(1) | YES |  | \N | Suppression logique de la ligne. |
| search_string | text | YES |  | \N | Zone libre de recherche / index plein texte. |

**Notes :**
- `applications` est une table de résumé et de pointeurs courants ; la progression détaillée vit dans `application_progress`.
- Les anciennes colonnes quiz/interview mono-occurrence (`quiz_status`, `interview_date`, etc.) ont été supprimées ; les synthèses sont désormais les colonnes `aggregated_*` et `current_*`.

## Table 10 — `application_progress`

> Une étape (round) du pipeline pour une candidature : son statut, son score, et ses décisions de validation / skip / réouverture.

| Attribut | Type | Null | Clé | Défaut | Explication |
| --- | --- | --- | --- | --- | --- |
| id | int unsigned | NO | PRI | \N | Identifiant technique de l'occurrence d'étape. |
| application_id | int unsigned | NO | MUL | \N | Candidature concernée. |
| pipeline_stage_id | int unsigned | NO | MUL | \N | Étape du pipeline correspondante. |
| progress_status | varchar(20) | NO |  | PENDING | Statut de l'étape (PENDING, IN_PROGRESS, AWAITING_VALIDATION, COMPLETED, FAILED, SKIPPED). |
| started_at | datetime | YES |  | \N | Date de démarrage de l'étape. |
| completed_at | datetime | YES |  | \N | Date de clôture technique de l'étape. |
| score | double | YES |  | \N | Score de synthèse de cette occurrence d'étape uniquement. |
| notes | text | YES |  | \N | Notes de suivi du round. |
| created_at | datetime | YES |  | \N | Date de création de la ligne (audit). |
| created_by | int | YES |  | \N | Auteur de la création de la ligne (audit). |
| updated_at | datetime | YES |  | \N | Date de la dernière modification (audit). |
| updated_by | int | YES |  | \N | Auteur de la dernière modification (audit). |
| is_deleted | bit(1) | NO |  | b'0' | Suppression logique de la ligne. |
| search_string | text | YES |  | \N | Zone libre de recherche / index plein texte. |
| validated_at | datetime | YES |  | \N | Date de la validation humaine de l'étape. |
| validated_by | int unsigned | YES |  | \N | Utilisateur qui a validé l'étape. |
| validation_comment | text | YES |  | \N | Commentaire / justification de la validation. |
| skipped_at | datetime | YES |  | \N | Date du skip de l'étape. |
| skipped_by | int unsigned | YES |  | \N | Utilisateur qui a passé (skippé) l'étape. |
| skip_reason | text | YES |  | \N | Justification du skip. |
| reopened_at | datetime | YES |  | \N | Date de la réouverture contrôlée de l'étape. |
| reopened_by | int unsigned | YES |  | \N | Utilisateur qui a rouvert l'étape. |
| reopen_reason | text | YES |  | \N | Justification de la réouverture. |

**Notes :**
- `decided_by` (ancienne colonne) a été supprimée : les traces de décision vivent maintenant dans `validated_by` / `skipped_by` / `reopened_by`.
- `mail_sent` (ancienne colonne) a été supprimée : la trace mail dérive de `mail_log`.

## Table 11 — `candidate_token`

> Un code d'accès à 6 caractères qui permet à un candidat de retrouver sa candidature.

| Attribut | Type | Null | Clé | Défaut | Explication |
| --- | --- | --- | --- | --- | --- |
| id | int unsigned | NO | PRI | \N | Identifiant technique du code. |
| token_string | varchar(6) | YES |  | \N | Le code d'accès (6 caractères). |
| application_id | int unsigned | YES | MUL | \N | Candidature associée au code. |
| created_at | datetime | YES |  | \N | Date de création de la ligne (audit). |
| created_by | int | YES |  | \N | Auteur de la création de la ligne (audit). |
| updated_at | datetime | YES |  | \N | Date de la dernière modification (audit). |
| updated_by | int | YES |  | \N | Auteur de la dernière modification (audit). |
| is_deleted | tinyint(1) | YES |  | \N | Suppression logique de la ligne. |
| search_string | text | YES |  | \N | Zone libre de recherche / index plein texte. |

## Table 12 — `candidate_ask`

> Une demande faite par un candidat (changement d'identité, d'email ou de téléphone) en attente de décision.

| Attribut | Type | Null | Clé | Défaut | Explication |
| --- | --- | --- | --- | --- | --- |
| id | int unsigned | NO | PRI | \N | Identifiant technique de la demande. |
| request_type | varchar(10) | YES |  | \N | Type de demande (IDENTITY, EMAIL, PHONE). |
| ask_status | varchar(20) | NO |  | PENDING | Statut de la demande (PENDING, APPROVED, REJECTED). |
| is_verified | tinyint(1) | NO |  | \N | Indique si la demande a été vérifiée. |
| first_name | varchar(100) | YES |  | \N | Prénom communiqué par le candidat dans sa demande. |
| last_name | varchar(100) | YES |  | \N | Nom communiqué par le candidat dans sa demande. |
| new_email | varchar(255) | YES |  | \N | Nouvel email demandé par le candidat. |
| new_phone | varchar(20) | YES |  | \N | Nouveau téléphone demandé par le candidat. |
| decision_reason | varchar(500) | YES |  | \N | Raison de la décision prise sur la demande. |
| application_id | int unsigned | YES | MUL | \N | Candidature concernée par la demande. |
| created_at | datetime | YES |  | \N | Date de création de la ligne (audit). |
| created_by | int | YES |  | \N | Auteur de la création de la ligne (audit). |
| updated_at | datetime | YES |  | \N | Date de la dernière modification (audit). |
| updated_by | int | YES |  | \N | Auteur de la dernière modification (audit). |
| is_deleted | tinyint(1) | YES |  | \N | Suppression logique de la ligne. |
| search_string | text | YES |  | \N | Zone libre de recherche / index plein texte. |

---

# 4. Quiz

## Table 13 — `form`

> Un formulaire (questionnaire) de quiz.

| Attribut | Type | Null | Clé | Défaut | Explication |
| --- | --- | --- | --- | --- | --- |
| id | int unsigned | NO | PRI | \N | Identifiant technique du formulaire. |
| form_name | varchar(255) | NO |  | \N | Nom du formulaire. |
| form_desc | text | YES |  | \N | Description du formulaire. |
| is_active | bit(1) | YES |  | b'1' | Indique si le formulaire est actif. |
| is_timed | tinyint(1) | NO |  | 0 | Indique si le formulaire est chronométré. |
| created_at | datetime | YES |  | CURRENT_TIMESTAMP | Date de création de la ligne (audit). |
| created_by | int unsigned | YES |  | \N | Auteur de la création de la ligne (audit). |
| updated_at | datetime | YES |  | CURRENT_TIMESTAMP | Date de la dernière modification (audit). |
| updated_by | int unsigned | YES |  | \N | Auteur de la dernière modification (audit). |
| is_deleted | bit(1) | YES |  | b'0' | Suppression logique de la ligne. |
| search_string | text | YES |  | \N | Zone libre de recherche / index plein texte. |

## Table 14 — `form_version`

> Une version d'un formulaire : le contenu évolue par versions que l'on publie puis verrouille.

| Attribut | Type | Null | Clé | Défaut | Explication |
| --- | --- | --- | --- | --- | --- |
| id | int unsigned | NO | PRI | \N | Identifiant technique de la version. |
| form_id | int unsigned | NO | MUL | \N | Formulaire dont c'est une version. |
| version_number | int | NO |  | 1 | Numéro de la version. |
| is_published | bit(1) | YES |  | b'0' | Indique si la version est publiée. |
| is_locked | bit(1) | YES |  | b'0' | Indique si la version est verrouillée (non modifiable). |
| random_questions | tinyint(1) | NO |  | 0 | Indique si les questions sont présentées dans un ordre aléatoire. |
| created_at | datetime | YES |  | CURRENT_TIMESTAMP | Date de création de la ligne (audit). |
| created_by | int unsigned | YES |  | \N | Auteur de la création de la ligne (audit). |
| updated_at | datetime | YES |  | CURRENT_TIMESTAMP | Date de la dernière modification (audit). |
| updated_by | int unsigned | YES |  | \N | Auteur de la dernière modification (audit). |
| is_deleted | bit(1) | YES |  | b'0' | Suppression logique de la ligne. |
| search_string | text | YES |  | \N | Zone libre de recherche / index plein texte. |
| published_form_id | int unsigned | YES | UNI | \N | Référence vers le formulaire publié correspondant. |

## Table 15 — `form_questions`

> Le lien entre une version de formulaire et une question : position de la question et temps imparti.

| Attribut | Type | Null | Clé | Défaut | Explication |
| --- | --- | --- | --- | --- | --- |
| id | int unsigned | NO | PRI | \N | Identifiant technique du lien. |
| form_version_id | int unsigned | NO | MUL | \N | Version de formulaire concernée. |
| question_id | int unsigned | NO | MUL | \N | Question concernée. |
| question_order | int | YES |  | 0 | Position de la question dans le formulaire. |
| chrono_override | int unsigned | YES |  | \N | Temps imparti spécifique à cette question (remplace la valeur par défaut). |
| created_at | datetime | YES |  | CURRENT_TIMESTAMP | Date de création de la ligne (audit). |
| created_by | int unsigned | YES |  | \N | Auteur de la création de la ligne (audit). |
| updated_at | datetime | YES |  | CURRENT_TIMESTAMP | Date de la dernière modification (audit). |
| updated_by | int unsigned | YES |  | \N | Auteur de la dernière modification (audit). |
| is_deleted | bit(1) | YES |  | b'0' | Suppression logique de la ligne. |
| search_string | text | YES |  | \N | Zone libre de recherche / index plein texte. |

## Table 16 — `question`

> Une question de quiz : son énoncé, son type, sa difficulté et le score qu'elle rapporte.

| Attribut | Type | Null | Clé | Défaut | Explication |
| --- | --- | --- | --- | --- | --- |
| id | int unsigned | NO | PRI | \N | Identifiant technique de la question. |
| question_ref | varchar(36) | YES |  | \N | Référence technique de la question (UUID). |
| question_text | text | NO |  | \N | Énoncé de la question. |
| question_chrono | int | YES |  | 10 | Temps imparti par défaut en secondes. |
| question_type | varchar(20) | YES |  | SINGLE_CHOICE | Type de question (SINGLE_CHOICE, MULTIPLE_CHOICE, TRUE_FALSE, TEXT). |
| score | int | YES |  | 1 | Points rapportés par la question. |
| difficulty_level | varchar(20) | YES |  | \N | Niveau de difficulté de la question. |
| speciality_id | int unsigned | YES | MUL | \N | Spécialité associée à la question. |
| all_answers_justification_required | bit(1) | NO |  | b'0' | Indique si une justification est demandée pour chaque réponse cochée. |
| manual_correction_required | bit(1) | NO |  | b'0' | Indique si la question doit être corrigée manuellement par un recruteur. |
| free_text_response_placeholder | varchar(255) | YES |  | \N | Placeholder affiché pour la réponse libre (question texte). |
| created_at | datetime | YES |  | \N | Date de création de la ligne (audit). |
| created_by | int | YES |  | \N | Auteur de la création de la ligne (audit). |
| updated_at | datetime | YES |  | \N | Date de la dernière modification (audit). |
| updated_by | int | YES |  | \N | Auteur de la dernière modification (audit). |
| is_deleted | tinyint(1) | YES |  | \N | Suppression logique de la ligne. |
| search_string | text | YES |  | \N | Zone libre de recherche / index plein texte. |

## Table 17 — `answer`

> Une réponse possible à une question de quiz (bonne ou mauvaise, avec texte et options de commentaire).

| Attribut | Type | Null | Clé | Défaut | Explication |
| --- | --- | --- | --- | --- | --- |
| id | int unsigned | NO | PRI | \N | Identifiant technique de la réponse. |
| answer_text | text | NO |  | \N | Contenu de la réponse proposée. |
| is_correct | tinyint(1) | YES |  | \N | Indique si la réponse est la bonne. |
| answer_order | int | YES |  | \N | Position de la réponse dans la liste proposée. |
| answer_type | varchar(20) | NO |  | TEXT | Type de la réponse (TEXT, IMAGE, CODE). |
| allow_additional_comment | tinyint(1) | NO |  | 0 | Indique si le candidat peut ajouter un commentaire sur cette réponse. |
| additional_comment_required | tinyint(1) | NO |  | 0 | Indique si ce commentaire supplémentaire est obligatoire. |
| additional_comment_placeholder | varchar(255) | YES |  | \N | Placeholder du commentaire supplémentaire. |
| question_id | int unsigned | YES | MUL | \N | Question à laquelle la réponse appartient. |
| created_at | datetime | YES |  | \N | Date de création de la ligne (audit). |
| created_by | int | YES |  | \N | Auteur de la création de la ligne (audit). |
| updated_at | datetime | YES |  | \N | Date de la dernière modification (audit). |
| updated_by | int | YES |  | \N | Auteur de la dernière modification (audit). |
| is_deleted | tinyint(1) | YES |  | \N | Suppression logique de la ligne. |
| search_string | text | YES |  | \N | Zone libre de recherche / index plein texte. |

## Table 18 — `application_quiz_attempt`

> Une tentative de quiz passée par un candidat pour une étape de quiz : statut, score, chronomètre et correction manuelle.

| Attribut | Type | Null | Clé | Défaut | Explication |
| --- | --- | --- | --- | --- | --- |
| id | int unsigned | NO | PRI | \N | Identifiant technique de la tentative. |
| application_id | int unsigned | NO | MUL | \N | Candidature concernée. |
| application_progress_id | int unsigned | NO | MUL | \N | Étape (round quiz) concernée. |
| form_version_id | int unsigned | YES | MUL | \N | Version de formulaire passée par le candidat. |
| quiz_token | varchar(64) | YES | UNI | \N | Jeton d'accès au quiz (lien unique du candidat). |
| quiz_status | varchar(20) | NO | MUL | PENDING | Statut de la tentative (PENDING, STARTED, COMPLETED, EXPIRED, CANCELLED). |
| screening_mode | varchar(30) | NO |  | NONE | Mode de screening appliqué (NONE ou mode configuré). |
| screening_threshold | double | YES |  | \N | Seuil de screening appliqué à la tentative. |
| screening_result | varchar(30) | YES |  | \N | Résultat du screening (passé / échoué). |
| score | double | YES |  | \N | Score brut obtenu au quiz. |
| score_percent | double | YES |  | \N | Pourcentage obtenu au quiz. |
| manual_correction_status | varchar(20) | NO |  | NOT_REQUIRED | État de la correction manuelle (NOT_REQUIRED, PENDING, COMPLETED). |
| total_questions | int | YES |  | \N | Nombre de questions de la tentative. |
| time_elapsed | int | NO |  | 0 | Temps écoulé en secondes. |
| timed_snapshot | tinyint(1) | NO |  | 0 | Indique si le chronomètre a été figé en cours de route (snapshot). |
| total_time_allowed_snapshot | int | YES |  | \N | Temps total autorisé au moment du snapshot. |
| last_activity_at | datetime | YES | MUL | \N | Date de la dernière activité sur la tentative. |
| started_at | datetime | YES |  | \N | Date de début de la tentative. |
| completed_at | datetime | YES |  | \N | Date de fin de la tentative. |
| created_at | datetime | YES |  | \N | Date de création de la ligne (audit). |
| created_by | int | YES |  | \N | Auteur de la création de la ligne (audit). |
| updated_at | datetime | YES |  | \N | Date de la dernière modification (audit). |
| updated_by | int | YES |  | \N | Auteur de la dernière modification (audit). |
| is_deleted | tinyint(1) | NO |  | 0 | Suppression logique de la ligne. |
| search_string | text | YES |  | \N | Zone libre de recherche / index plein texte. |

## Table 19 — `candidate_answer`

> La réponse donnée par un candidat à une question lors d'une tentative de quiz, avec l'éventuelle correction manuelle.

| Attribut | Type | Null | Clé | Défaut | Explication |
| --- | --- | --- | --- | --- | --- |
| id | int unsigned | NO | PRI | \N | Identifiant technique de la réponse du candidat. |
| is_selected | tinyint(1) | NO |  | \N | Indique si cette réponse a été choisie par le candidat. |
| manual_is_correct | tinyint(1) | YES |  | \N | Correction manuelle : la réponse est-elle jugée correcte ? |
| manual_correction_comment | text | YES |  | \N | Commentaire de la correction manuelle. |
| manual_correction_score | int | YES |  | \N | Score attribué manuellement à la réponse. |
| manual_corrected_at | timestamp | YES |  | \N | Date de la correction manuelle. |
| manual_corrected_by | int | YES |  | \N | Utilisateur qui a corrigé manuellement. |
| application_quiz_attempt_id | int unsigned | NO | MUL | \N | Tentative de quiz concernée. |
| question_id | int unsigned | NO | MUL | \N | Question concernée. |
| answer_id | int unsigned | YES | MUL | \N | Réponse choisie dans la liste proposée (null si texte libre). |
| free_text_response | text | YES |  | \N | Réponse libre du candidat (question texte). |
| created_at | datetime | YES |  | \N | Date de création de la ligne (audit). |
| created_by | int | YES |  | \N | Auteur de la création de la ligne (audit). |
| updated_at | datetime | YES |  | \N | Date de la dernière modification (audit). |
| updated_by | int | YES |  | \N | Auteur de la dernière modification (audit). |
| is_deleted | tinyint(1) | YES |  | \N | Suppression logique de la ligne. |
| search_string | text | YES |  | \N | Zone libre de recherche / index plein texte. |

---

# 5. Entretien & évaluation

## Table 20 — `interviews`

> Un entretien planifié pour une étape « entretien » : sa date, son type, son statut et sa salle d'évaluation partagée.

| Attribut | Type | Null | Clé | Défaut | Explication |
| --- | --- | --- | --- | --- | --- |
| id | int unsigned | NO | PRI | \N | Identifiant technique de l'entretien. |
| interview_location | varchar(255) | YES |  | \N | Lieu physique de l'entretien (présentiel). |
| interview_date | datetime | NO |  | \N | Date et heure prévues de l'entretien. |
| interview_status | varchar(20) | NO |  | \N | Statut de l'entretien (SCHEDULED, IN_PROGRESS, AWAITING_EVALUATION, AWAITING_VALIDATION, CLOSED, CANCELLED). |
| meet_link | varchar(500) | YES |  | \N | Lien de visioconférence (entretien en ligne). |
| evaluation_room_code | varchar(8) | YES |  | \N | Code de la salle d'évaluation partagée entre évaluateurs. |
| interview_note | text | YES |  | \N | Note interne sur l'entretien. |
| interview_type | varchar(20) | NO |  | \N | Modalité de l'entretien (IN_PERSON ou ONLINE). |
| started_at | datetime | YES |  | \N | Heure réelle de début de l'entretien. |
| ended_at | datetime | YES |  | \N | Heure réelle de fin de l'entretien. |
| evaluation_completed_at | datetime | YES |  | \N | Date de finalisation de l'évaluation. |
| evaluation_completed_by | int unsigned | YES |  | \N | Utilisateur qui a finalisé l'évaluation. |
| closed_at | datetime | YES |  | \N | Date de clôture humaine de l'entretien. |
| closed_by | int unsigned | YES |  | \N | Utilisateur qui a clôturé l'entretien. |
| closure_comment | text | YES |  | \N | Commentaire de clôture. |
| application_progress_id | int unsigned | YES | MUL | \N | Étape (round entretien) à laquelle l'entretien est rattaché. |
| created_at | datetime | YES |  | \N | Date de création de la ligne (audit). |
| created_by | int | YES |  | \N | Auteur de la création de la ligne (audit). |
| updated_at | datetime | YES |  | \N | Date de la dernière modification (audit). |
| updated_by | int | YES |  | \N | Auteur de la dernière modification (audit). |
| is_deleted | tinyint(1) | YES |  | \N | Suppression logique de la ligne. |
| search_string | text | YES |  | \N | Zone libre de recherche / index plein texte. |

**Notes :**
- `application_progress_id` est **nullable** dans la base alors que le doc cible prévoit NOT NULL (ancre unique du round) ; les données actuelles ont **0 NULL**, mais le durcissement est reporté.
- `evaluation_room_code` remplace l'ancienne colonne `interview_evaluations_link` (renommée).

## Table 21 — `candidate_interview`

> La réponse d'un candidat à une convocation d'entretien : acceptation, refus ou demande de replanification.

| Attribut | Type | Null | Clé | Défaut | Explication |
| --- | --- | --- | --- | --- | --- |
| id | int unsigned | NO | PRI | \N | Identifiant technique de la liaison candidat-entretien. |
| interview_duration | int | YES |  | \N | Durée d'entretien (conservée par décision BA, écart cible documenté). |
| candidate_response_status | varchar(30) | NO | MUL | PENDING | Réponse du candidat (PENDING, ACCEPTED, DECLINED, RESCHEDULE_REQUESTED). |
| responded_at | datetime | YES |  | \N | Date de la réponse du candidat. |
| interview_id | int unsigned | NO | MUL | \N | Entretien concerné par la convocation. |
| created_at | datetime | YES |  | \N | Date de création de la ligne (audit). |
| created_by | int | YES |  | \N | Auteur de la création de la ligne (audit). |
| updated_at | datetime | YES |  | \N | Date de la dernière modification (audit). |
| updated_by | int | YES |  | \N | Auteur de la dernière modification (audit). |
| is_deleted | tinyint(1) | YES |  | \N | Suppression logique de la ligne. |
| search_string | text | YES |  | \N | Zone libre de recherche / index plein texte. |
| decline_reason | varchar(500) | YES |  | \N | Raison du refus du candidat. |
| alternative_date_requested | datetime | YES |  | \N | Date alternative demandée par le candidat. |

**Notes :**
- `interview_duration` est conservée : c'est un écart cible validé par décision BA 2026-08-04 (elle n'était pas prévue dans la cible finale).

## Table 22 — `interview_participant`

> Un participant (recruteur) à un entretien : ses droits et l'état de son évaluation.

| Attribut | Type | Null | Clé | Défaut | Explication |
| --- | --- | --- | --- | --- | --- |
| id | int unsigned | NO | PRI | \N | Identifiant technique de la participation. |
| can_update | tinyint(1) | YES |  | \N | Indique si le participant peut modifier l'entretien. |
| can_delete | tinyint(1) | YES |  | \N | Indique si le participant peut supprimer l'entretien. |
| can_evaluate | tinyint(1) | YES |  | \N | Indique si le participant peut évaluer l'entretien. |
| is_admin | tinyint(1) | NO |  | 0 | Indique si le participant est administrateur de l'entretien. |
| follow | tinyint(1) | YES |  | \N | Indique si le participant suit l'entretien. |
| is_online | tinyint(1) | YES |  | \N | Indique si le participant est connecté à la salle. |
| has_finished | tinyint(1) | YES |  | \N | Indique si le participant a terminé l'entretien. |
| evaluation_status | varchar(20) | YES | MUL | \N | Statut de l'évaluation du participant. |
| evaluation_submitted_at | datetime | YES |  | \N | Date de soumission de son évaluation. |
| last_ping_at | datetime | YES |  | \N | Dernière activité détectée du participant dans la salle. |
| user_id | int unsigned | YES | MUL | \N | Utilisateur participant. |
| interview_id | int unsigned | YES | MUL | \N | Entretien concerné. |
| created_at | datetime | YES |  | \N | Date de création de la ligne (audit). |
| created_by | int | YES |  | \N | Auteur de la création de la ligne (audit). |
| updated_at | datetime | YES |  | \N | Date de la dernière modification (audit). |
| updated_by | int | YES |  | \N | Auteur de la dernière modification (audit). |
| is_deleted | tinyint(1) | YES |  | \N | Suppression logique de la ligne. |
| search_string | text | YES |  | \N | Zone libre de recherche / index plein texte. |

## Table 23 — `evaluations`

> L'évaluation d'un entretien par un participant évaluateur : score global, commentaire global et statut.

| Attribut | Type | Null | Clé | Défaut | Explication |
| --- | --- | --- | --- | --- | --- |
| id | int unsigned | NO | PRI | \N | Identifiant technique de l'évaluation. |
| evaluation_status | varchar(20) | NO | MUL | DRAFT | Statut de l'évaluation (DRAFT, SUBMITTED, VALIDATED, CANCELLED). |
| submitted_at | datetime | YES |  | \N | Date de dépôt de l'évaluation par l'évaluateur. |
| validated_at | datetime | YES |  | \N | Date de validation humaine de l'évaluation. |
| validated_by | int unsigned | YES |  | \N | Utilisateur qui a validé l'évaluation. |
| global_score | double | YES |  | \N | Score global de synthèse de l'évaluation. |
| global_comment | text | YES |  | \N | Commentaire global de l'évaluateur. |
| candidate_interview_id | int unsigned | NO | MUL | \N | Occurrence candidat-entretien évaluée. |
| interview_participant_id | int unsigned | YES | MUL | \N | Participant (évaluateur) qui a rempli l'évaluation. |
| created_at | datetime | YES |  | \N | Date de création de la ligne (audit). |
| created_by | int | YES |  | \N | Auteur de la création de la ligne (audit). |
| updated_at | datetime | YES |  | \N | Date de la dernière modification (audit). |
| updated_by | int | YES |  | \N | Auteur de la dernière modification (audit). |
| is_deleted | tinyint(1) | YES |  | \N | Suppression logique de la ligne. |
| search_string | text | YES |  | \N | Zone libre de recherche / index plein texte. |

**Notes :**
- `interview_participant_id` est **nullable** alors que le doc cible prévoit NOT NULL (évaluateur explicite) ; le durcissement est reporté.
- `global_score` / `global_comment` remplacent les anciennes colonnes `candidate_mark` / `recruiter_comment` (supprimées).

## Table 24 — `evaluation_item`

> La note attribuée par un évaluateur sur un critère précis d'une grille d'évaluation.

| Attribut | Type | Null | Clé | Défaut | Explication |
| --- | --- | --- | --- | --- | --- |
| id | int unsigned | NO | PRI | \N | Identifiant technique de la note de critère. |
| evaluation_id | int unsigned | NO | MUL | \N | Évaluation concernée. |
| evaluation_grid_template_item_id | int unsigned | NO | MUL | \N | Item de grille d'évaluation évalué. |
| score_value | double | YES |  | \N | Note attribuée pour ce critère. |
| text_value | text | YES |  | \N | Commentaire texte (si le critère est de type texte). |
| weight_snapshot | double | YES |  | \N | Poids du critère au moment de l'évaluation (figé). |
| max_score_snapshot | double | YES |  | \N | Note maximale du critère au moment de l'évaluation (figée). |
| created_at | datetime | YES |  | \N | Date de création de la ligne (audit). |
| created_by | int | YES |  | \N | Auteur de la création de la ligne (audit). |
| updated_at | datetime | YES |  | \N | Date de la dernière modification (audit). |
| updated_by | int | YES |  | \N | Auteur de la dernière modification (audit). |
| is_deleted | tinyint(1) | NO |  | 0 | Suppression logique de la ligne. |
| search_string | text | YES |  | \N | Zone libre de recherche / index plein texte. |

**Notes :**
- Colonne renommée (`pipeline_stage_evaluation_criterion_id` → `evaluation_grid_template_item_id`) et passée `NOT NULL` lors du rebranchement sur les grilles versionnées (Phase C/D, note 430).
- UNIQUE sur `(evaluation_id, evaluation_grid_template_item_id)` : une évaluation ne note pas deux fois le même item de grille.

## Table 25 — `evaluation_grid_template`

> Un modèle de grille d'évaluation réutilisable d'une campagne à l'autre.

| Attribut | Type | Null | Clé | Défaut | Explication |
| --- | --- | --- | --- | --- | --- |
| id | int unsigned | NO | PRI | \N | Identifiant technique du modèle. |
| template_name | varchar(255) | NO | MUL | \N | Nom du modèle de grille. |
| template_desc | text | YES |  | \N | Description du modèle. |
| is_active | tinyint(1) | NO |  | 1 | Indique si le modèle est actif. |
| created_at | datetime | YES |  | \N | Date de création de la ligne (audit). |
| created_by | int | YES |  | \N | Auteur de la création de la ligne (audit). |
| updated_at | datetime | YES |  | \N | Date de la dernière modification (audit). |
| updated_by | int | YES |  | \N | Auteur de la dernière modification (audit). |
| is_deleted | tinyint(1) | NO |  | 0 | Suppression logique de la ligne. |
| search_string | text | YES |  | \N | Zone libre de recherche / index plein texte. |

## Table 26 — `evaluation_grid_template_version`

> Une version d'un modèle de grille d'évaluation (on publie une version avant de l'utiliser).

| Attribut | Type | Null | Clé | Défaut | Explication |
| --- | --- | --- | --- | --- | --- |
| id | int unsigned | NO | PRI | \N | Identifiant technique de la version. |
| evaluation_grid_template_id | int unsigned | NO | MUL | \N | Modèle dont c'est une version. |
| version_number | int | NO |  | \N | Numéro de la version. |
| version_label | varchar(255) | YES |  | \N | Libellé de la version. |
| is_published | tinyint(1) | NO |  | 0 | Indique si la version est publiée. |
| published_at | datetime | YES |  | \N | Date de publication de la version. |
| content_hash | varchar(64) | YES | UNI | \N | Empreinte SHA-256 (hex) de l'ensemble ordonné des items de la version (forme canonique) ; UNIQUE — une seule version par contenu. |
| locked_at | datetime | YES |  | \N | Verrou d'usage : posé à la première evaluation_item réellement saisie qui référence un item de la version ; `is_locked` = `locked_at` non nul. |
| created_at | datetime | YES |  | \N | Date de création de la ligne (audit). |
| created_by | int | YES |  | \N | Auteur de la création de la ligne (audit). |
| updated_at | datetime | YES |  | \N | Date de la dernière modification (audit). |
| updated_by | int | YES |  | \N | Auteur de la dernière modification (audit). |
| is_deleted | tinyint(1) | NO |  | 0 | Suppression logique de la ligne. |
| search_string | text | YES |  | \N | Zone libre de recherche / index plein texte. |

## Table 27 — `evaluation_grid_template_item`

> Un critère défini dans une version de grille d'évaluation : intitulé, note maximale et poids.

| Attribut | Type | Null | Clé | Défaut | Explication |
| --- | --- | --- | --- | --- | --- |
| id | int unsigned | NO | PRI | \N | Identifiant technique du critère de grille. |
| evaluation_grid_template_version_id | int unsigned | NO | MUL | \N | Version de grille à laquelle le critère appartient. |
| criterion_order | int | NO |  | \N | Position du critère dans la grille. |
| label | varchar(255) | NO |  | \N | Intitulé du critère. |
| criterion_type | varchar(20) | NO |  | \N | Type de critère (note, texte, etc.). |
| max_score | double | YES |  | \N | Note maximale possible. |
| weight | double | YES |  | \N | Poids du critère dans le calcul de la note. |
| is_required | tinyint(1) | NO |  | 1 | Indique si le critère est obligatoire. |
| config_json | text | YES |  | \N | Configuration libre du critère. |
| created_at | datetime | YES |  | \N | Date de création de la ligne (audit). |
| created_by | int | YES |  | \N | Auteur de la création de la ligne (audit). |
| updated_at | datetime | YES |  | \N | Date de la dernière modification (audit). |
| updated_by | int | YES |  | \N | Auteur de la dernière modification (audit). |
| is_deleted | tinyint(1) | NO |  | 0 | Suppression logique de la ligne. |
| search_string | text | YES |  | \N | Zone libre de recherche / index plein texte. |

---

# 6. Décisions

## Table 28 — `decisions`

> La décision prise sur une étape (présélection ou décision finale) : le verdict métier, le mode technique et l'acteur.

| Attribut | Type | Null | Clé | Défaut | Explication |
| --- | --- | --- | --- | --- | --- |
| id | int unsigned | NO | PRI | \N | Identifiant technique de la décision. |
| decision_type | varchar(50) | NO |  | \N | Verdict métier de la décision (ex. ACCEPTED, REJECTED). |
| user_id | int unsigned | YES | MUL | \N | Acteur qui a pris la décision. |
| created_at | datetime | YES |  | \N | Date de création de la ligne (audit). |
| created_by | int | YES |  | \N | Auteur de la création de la ligne (audit). |
| updated_at | datetime | YES |  | \N | Date de la dernière modification (audit). |
| updated_by | int | YES |  | \N | Auteur de la dernière modification (audit). |
| is_deleted | tinyint(1) | YES |  | \N | Suppression logique de la ligne. |
| search_string | text | YES |  | \N | Zone libre de recherche / index plein texte. |
| application_progress_id | int unsigned | NO | MUL | \N | Étape concernée par la décision (ancre unique du round). |
| justification | text | YES |  | \N | Justification de la décision (obligatoire pour annulation / override / rollback). |
| decision_mode | varchar(20) | NO |  | STANDARD | Mode technique de la décision (STANDARD, CANCEL, OVERRIDE, ROLLBACK). |
| cancels_decision_id | int unsigned | YES | MUL | \N | Décision annulée par celle-ci (pour les modes CANCEL / OVERRIDE / ROLLBACK). |

**Notes :**
- `application_progress_id` est NOT NULL : chaque décision est mono-ancrée sur une étape précise.
- Les anciennes colonnes `is_cancel`, `application_id` et `pipeline_stage_id` ont été supprimées ; la référence vers une décision annulée vit dans `cancels_decision_id`.

---

# 7. Emailing

## Table 29 — `email_template`

> Un modèle d'email configurable (sujet, corps, variables) réutilisé par les notifications du processus.

| Attribut | Type | Null | Clé | Défaut | Explication |
| --- | --- | --- | --- | --- | --- |
| id | int unsigned | NO | PRI | \N | Identifiant technique du modèle. |
| template_key | varchar(50) | NO | UNI | \N | Clé unique du modèle (ex. INTERVIEW_INVITE). |
| subject_template | varchar(500) | NO |  | \N | Sujet de l'email, avec variables. |
| body_template | text | NO |  | \N | Corps de l'email, avec variables. |
| editable_variables_json | text | YES |  | \N | Variables éditables par l'utilisateur. |
| description | varchar(500) | YES |  | \N | Description du modèle. |
| available_variables | text | YES |  | \N | Variables disponibles pour ce modèle. |
| action_type | varchar(50) | YES | MUL | \N | Type d'action associé au modèle. |
| preset_id | int | YES |  | \N | Preset visuel (style) associé au modèle. |
| is_active | bit(1) | YES |  | b'1' | Indique si le modèle est actif. |
| created_at | datetime | YES |  | CURRENT_TIMESTAMP | Date de création de la ligne (audit). |
| created_by | int unsigned | YES |  | \N | Auteur de la création de la ligne (audit). |
| updated_at | datetime | YES |  | CURRENT_TIMESTAMP | Date de la dernière modification (audit). |
| updated_by | int unsigned | YES |  | \N | Auteur de la dernière modification (audit). |
| is_deleted | bit(1) | YES |  | b'0' | Suppression logique de la ligne. |
| search_string | text | YES |  | \N | Zone libre de recherche / index plein texte. |

## Table 30 — `email_template_preset`

> Un gabarit visuel d'email (style et structure HTML) prêt à l'emploi.

| Attribut | Type | Null | Clé | Défaut | Explication |
| --- | --- | --- | --- | --- | --- |
| id | int | NO | PRI | \N | Identifiant technique du preset. |
| name | varchar(100) | NO |  | \N | Nom du preset. |
| category | enum(...) | NO |  | GENERIC | Catégorie de style / type d'email du preset. |
| html_structure | text | NO |  | \N | Structure HTML du preset. |
| preview_image | varchar(500) | YES |  | \N | Image d'aperçu du preset. |
| description | varchar(500) | YES |  | \N | Description du preset. |
| is_deleted | tinyint(1) | YES |  | 0 | Suppression logique de la ligne. |
| created_at | datetime | YES |  | CURRENT_TIMESTAMP | Date de création de la ligne (audit). |
| updated_at | datetime | YES |  | \N | Date de la dernière modification (audit). |

**Notes :**
- `category` est un type MySQL `enum(...)` ; la liste complète des valeurs est donnée en annexe.

## Table 31 — `mail_log`

> La trace de chaque email envoyé ou à envoyer : destinataire, événement, statut et contexte métier.

| Attribut | Type | Null | Clé | Défaut | Explication |
| --- | --- | --- | --- | --- | --- |
| id | int unsigned | NO | PRI | \N | Identifiant technique de la trace. |
| recipient_email | varchar(255) | NO | MUL | \N | Adresse email du destinataire. |
| application_id | int unsigned | YES | MUL | \N | Candidature concernée par l'email. |
| application_progress_id | int unsigned | YES | MUL | \N | Étape concernée par l'email. |
| interview_id | int unsigned | YES | MUL | \N | Entretien concerné par l'email. |
| decision_id | int unsigned | YES | MUL | \N | Décision concernée par l'email. |
| notification_rule_id | int unsigned | YES | MUL | \N | Règle de notification qui a déclenché l'envoi. |
| event_code | varchar(80) | NO | MUL | LEGACY_UNCLASSIFIED | Événement métier de l'email (ex. INTERVIEW_INVITATION_EMAIL). |
| requires_confirmation | tinyint(1) | NO |  | 0 | Indique si l'envoi doit être confirmé par un humain. |
| confirmed_at | datetime | YES |  | \N | Date de confirmation de l'envoi. |
| confirmed_by | int unsigned | YES |  | \N | Utilisateur qui a confirmé l'envoi. |
| recipient_user_id | int unsigned | YES | MUL | \N | Utilisateur destinataire (si compte interne). |
| sender_user_id | int unsigned | YES | MUL | \N | Utilisateur expéditeur. |
| email_template_id | int unsigned | YES | MUL | \N | Modèle d'email utilisé. |
| subject | varchar(500) | NO |  | \N | Sujet effectif de l'email envoyé. |
| body_preview | text | YES |  | \N | Aperçu du corps de l'email envoyé. |
| status | varchar(20) | NO | MUL | PENDING | Statut de l'envoi (PENDING, SENT, FAILED). |
| error_message | text | YES |  | \N | Message d'erreur en cas d'échec d'envoi. |
| sent_at | datetime | YES | MUL | \N | Date d'envoi effective. |
| created_at | datetime | YES |  | CURRENT_TIMESTAMP | Date de création de la ligne (audit). |
| created_by | int | YES |  | \N | Auteur de la création de la ligne (audit). |
| updated_at | datetime | YES |  | \N | Date de la dernière modification (audit). |
| updated_by | int | YES |  | \N | Auteur de la dernière modification (audit). |
| is_deleted | tinyint(1) | NO |  | 0 | Suppression logique de la ligne. |
| search_string | text | YES |  | \N | Zone libre de recherche / index plein texte. |

**Notes :**
- `event_code` a un défaut de compatibilité `LEGACY_UNCLASSIFIED`, mais tous les flux doivent renseigner un code explicite (ex. `APPLICATION_VERIFICATION_EMAIL`, `CANDIDATE_ASK_RESULT_EMAIL`, `INTERVIEW_INVITATION_EMAIL`, plus les codes du type `<EVENEMENT>_EMAIL`).

## Table 32 — `smtp_config`

> La configuration du serveur SMTP utilisé pour envoyer les emails de la plateforme.

| Attribut | Type | Null | Clé | Défaut | Explication |
| --- | --- | --- | --- | --- | --- |
| id | int unsigned | NO | PRI | \N | Identifiant technique de la configuration. |
| host | varchar(255) | NO |  | \N | Hôte du serveur SMTP. |
| port | int | NO |  | 587 | Port du serveur SMTP. |
| username | varchar(255) | YES |  | \N | Utilisateur d'authentification SMTP. |
| password_encrypted | varchar(500) | YES |  | \N | Mot de passe SMTP (chiffré). |
| smtp_auth | bit(1) | YES |  | b'1' | Indique si l'authentification SMTP est activée. |
| starttls_enable | bit(1) | YES |  | b'1' | Indique si STARTTLS est activé. |
| starttls_required | bit(1) | YES |  | b'0' | Indique si STARTTLS est obligatoire. |
| connection_timeout | int | YES |  | 5000 | Délai de connexion en millisecondes. |
| timeout | int | YES |  | 5000 | Délai d'envoi en millisecondes. |
| write_timeout | int | YES |  | 5000 | Délai d'écriture en millisecondes. |
| sender_name | varchar(255) | YES |  | \N | Nom d'affichage de l'expéditeur. |
| sender_email | varchar(255) | YES |  | \N | Adresse email de l'expéditeur. |
| is_active | bit(1) | YES |  | b'0' | Indique si cette configuration est active. |
| created_at | datetime | YES |  | CURRENT_TIMESTAMP | Date de création de la ligne (audit). |
| created_by | int unsigned | YES |  | \N | Auteur de la création de la ligne (audit). |
| updated_at | datetime | YES |  | CURRENT_TIMESTAMP | Date de la dernière modification (audit). |
| updated_by | int unsigned | YES |  | \N | Auteur de la dernière modification (audit). |
| is_deleted | bit(1) | YES |  | b'0' | Suppression logique de la ligne. |
| search_string | text | YES |  | \N | Zone libre de recherche / index plein texte. |

## Table 33 — `email_verification_tokens`

> Un jeton envoyé par email pour vérifier une adresse (candidature ou compte utilisateur).

| Attribut | Type | Null | Clé | Défaut | Explication |
| --- | --- | --- | --- | --- | --- |
| id | int unsigned | NO | PRI | \N | Identifiant technique du jeton. |
| email | varchar(255) | NO |  | \N | Adresse email à vérifier. |
| token | varchar(255) | NO | UNI | \N | Jeton de vérification (unique). |
| token_type | varchar(255) | NO |  | APPLICATION_VERIFICATION | Type de vérification (application, réinitialisation de mot de passe...). |
| expires_at | datetime | NO |  | \N | Date d'expiration du jeton. |
| is_used | tinyint(1) | NO |  | 0 | Indique si le jeton a été consommé. |
| created_at | datetime | NO |  | \N | Date de création du jeton. |
| used_at | datetime | YES |  | \N | Date de consommation du jeton. |
| application_id | int unsigned | YES | MUL | \N | Candidature concernée par la vérification. |
| user_id | int unsigned | YES | MUL | \N | Compte utilisateur concerné par la vérification. |

---

# 8. Utilisateurs & permissions

## Table 34 — `user`

> Un utilisateur de la plateforme (recruteur, administrateur, candidat).

| Attribut | Type | Null | Clé | Défaut | Explication |
| --- | --- | --- | --- | --- | --- |
| id | int unsigned | NO | PRI | \N | Identifiant technique de l'utilisateur. |
| first_name | varchar(100) | NO |  | \N | Prénom de l'utilisateur. |
| last_name | varchar(500) | NO |  | \N | Nom de l'utilisateur. |
| username | varchar(50) | NO | UNI | \N | Identifiant de connexion (unique). |
| email | varchar(255) | NO | UNI | \N | Adresse email de l'utilisateur (unique). |
| phone | varchar(20) | YES |  | \N | Téléphone de l'utilisateur. |
| password | varchar(255) | NO |  | \N | Mot de passe de connexion (haché). |
| is_default_password | tinyint(1) | YES |  | \N | Indique si l'utilisateur utilise encore le mot de passe par défaut. |
| user_role | varchar(20) | YES |  | \N | Rôle de l'utilisateur (SUPER, ADMIN, RECRUITER, CANDIDATE). |
| is_online | tinyint(1) | YES |  | \N | Indique si l'utilisateur est connecté. |
| is_locked | tinyint(1) | YES |  | \N | Indique si le compte est verrouillé. |
| last_connection_date | datetime | YES |  | \N | Date de la dernière connexion. |
| admin_mode | tinyint(1) | YES |  | 0 | Indique si le mode admin est activé pour l'utilisateur. |
| page_size_preference | int | YES |  | 10 | Nombre de lignes affichées par page par défaut. |
| created_at | datetime | YES |  | \N | Date de création de la ligne (audit). |
| created_by | int | YES |  | \N | Auteur de la création de la ligne (audit). |
| updated_at | datetime | YES |  | \N | Date de la dernière modification (audit). |
| updated_by | int | YES |  | \N | Auteur de la dernière modification (audit). |
| is_deleted | tinyint(1) | YES |  | \N | Suppression logique de la ligne. |
| search_string | text | YES |  | \N | Zone libre de recherche / index plein texte. |

## Table 35 — `business_group`

> Un groupe d'utilisateurs (équipe) qui partage des permissions sur le processus.

| Attribut | Type | Null | Clé | Défaut | Explication |
| --- | --- | --- | --- | --- | --- |
| id | int | NO | PRI | \N | Identifiant technique du groupe. |
| group_name | varchar(100) | NO | UNI | \N | Nom du groupe. |
| group_desc | text | YES |  | \N | Description du groupe. |
| created_at | timestamp | YES |  | \N | Date de création de la ligne (audit). |
| created_by | int | YES |  | \N | Auteur de la création de la ligne (audit). |
| updated_at | timestamp | YES |  | \N | Date de la dernière modification (audit). |
| updated_by | int | YES |  | \N | Auteur de la dernière modification (audit). |
| is_deleted | tinyint(1) | YES |  | 0 | Suppression logique de la ligne. |
| search_string | text | YES |  | \N | Zone libre de recherche / index plein texte. |

## Table 36 — `business_group_permission`

> Une permission accordée à un groupe sur une fonctionnalité de la plateforme.

| Attribut | Type | Null | Clé | Défaut | Explication |
| --- | --- | --- | --- | --- | --- |
| id | int | NO | PRI | \N | Identifiant technique de la permission. |
| business_group_id | int | NO | MUL | \N | Groupe auquel la permission est accordée. |
| functionality | varchar(100) | NO |  | \N | Fonctionnalité autorisée pour le groupe. |
| created_at | timestamp | YES |  | \N | Date de création de la ligne (audit). |
| created_by | int | YES |  | \N | Auteur de la création de la ligne (audit). |
| updated_at | timestamp | YES |  | \N | Date de la dernière modification (audit). |
| updated_by | int | YES |  | \N | Auteur de la dernière modification (audit). |
| is_deleted | tinyint(1) | YES |  | 0 | Suppression logique de la ligne. |

## Table 37 — `user_business_group`

> L'appartenance d'un utilisateur à un groupe, avec son éventuel rôle de modérateur.

| Attribut | Type | Null | Clé | Défaut | Explication |
| --- | --- | --- | --- | --- | --- |
| id | int | NO | PRI | \N | Identifiant technique de l'appartenance. |
| user_id | int unsigned | NO | MUL | \N | Utilisateur concerné. |
| business_group_id | int | NO | MUL | \N | Groupe auquel l'utilisateur appartient. |
| created_at | timestamp | YES |  | \N | Date de création de la ligne (audit). |
| created_by | int | YES |  | \N | Auteur de la création de la ligne (audit). |
| updated_at | timestamp | YES |  | \N | Date de la dernière modification (audit). |
| updated_by | int | YES |  | \N | Auteur de la dernière modification (audit). |
| is_deleted | tinyint(1) | YES |  | 0 | Suppression logique de la ligne. |
| is_moderator | tinyint(1) | NO |  | 0 | Indique si l'utilisateur est modérateur du groupe. |

## Table 38 — `user_permission_override`

> Une exception individuelle de permission (autorisée ou bloquée) appliquée à un utilisateur précis.

| Attribut | Type | Null | Clé | Défaut | Explication |
| --- | --- | --- | --- | --- | --- |
| id | int | NO | PRI | \N | Identifiant technique de l'exception. |
| user_id | int unsigned | NO | MUL | \N | Utilisateur concerné. |
| functionality | varchar(100) | NO |  | \N | Fonctionnalité concernée par l'exception. |
| is_allowed | tinyint(1) | NO |  | \N | Indique si la fonctionnalité est autorisée ou bloquée pour cet utilisateur. |
| created_at | timestamp | YES |  | \N | Date de création de la ligne (audit). |
| created_by | int | YES |  | \N | Auteur de la création de la ligne (audit). |
| updated_at | timestamp | YES |  | \N | Date de la dernière modification (audit). |
| updated_by | int | YES |  | \N | Auteur de la dernière modification (audit). |
| is_deleted | tinyint(1) | YES |  | 0 | Suppression logique de la ligne. |

## Table 39 — `system_role_permission`

> Une permission accordée à un rôle système (super admin, admin, recruteur).

| Attribut | Type | Null | Clé | Défaut | Explication |
| --- | --- | --- | --- | --- | --- |
| id | int | NO | PRI | \N | Identifiant technique de la permission. |
| system_role | varchar(20) | NO | MUL | \N | Rôle système concerné. |
| functionality | varchar(100) | NO |  | \N | Fonctionnalité autorisée pour ce rôle. |
| created_at | timestamp | YES |  | \N | Date de création de la ligne (audit). |
| created_by | int | YES |  | \N | Auteur de la création de la ligne (audit). |
| updated_at | timestamp | YES |  | \N | Date de la dernière modification (audit). |
| updated_by | int | YES |  | \N | Auteur de la dernière modification (audit). |
| is_deleted | tinyint(1) | YES |  | 0 | Suppression logique de la ligne. |

## Table 40 — `entity_permission`

> Une permission portant sur une entité précise (par exemple un entretien donné), accordée à un utilisateur, un groupe ou un rôle.

| Attribut | Type | Null | Clé | Défaut | Explication |
| --- | --- | --- | --- | --- | --- |
| id | int | NO | PRI | \N | Identifiant technique de la permission. |
| user_id | int unsigned | YES | MUL | \N | Utilisateur concerné par la permission. |
| business_group_id | int | YES | MUL | \N | Groupe concerné par la permission. |
| system_role | varchar(20) | YES | MUL | \N | Rôle système concerné par la permission. |
| entity_type | varchar(50) | NO | MUL | \N | Type d'entité (ex. INTERVIEW). |
| entity_id | int | NO |  | \N | Identifiant de l'entité concernée. |
| permission_key | varchar(50) | NO |  | \N | Clé de permission (ex. MANAGE_APP_CONFIG). |
| created_at | timestamp | YES |  | \N | Date de création de la ligne (audit). |
| created_by | int | YES |  | \N | Auteur de la création de la ligne (audit). |
| updated_at | timestamp | YES |  | \N | Date de la dernière modification (audit). |
| updated_by | int | YES |  | \N | Auteur de la dernière modification (audit). |
| is_deleted | tinyint(1) | YES |  | 0 | Suppression logique de la ligne. |
| search_string | text | YES |  | \N | Zone libre de recherche / index plein texte. |

## Table 41 — `group_change_request`

> Une demande d'un utilisateur de changer de groupe, en attente de traitement.

| Attribut | Type | Null | Clé | Défaut | Explication |
| --- | --- | --- | --- | --- | --- |
| id | int | NO | PRI | \N | Identifiant technique de la demande. |
| user_id | int unsigned | NO | MUL | \N | Utilisateur demandeur. |
| target_group_id | int | NO | MUL | \N | Groupe demandé par l'utilisateur. |
| reason | text | YES |  | \N | Motif de la demande de changement. |
| status | enum('PENDING','APPROVED','REJECTED') | NO |  | PENDING | Statut de la demande (PENDING, APPROVED, REJECTED). |
| requested_at | timestamp | YES |  | CURRENT_TIMESTAMP | Date de la demande. |
| processed_at | timestamp | YES |  | \N | Date de traitement de la demande. |
| processed_by | int unsigned | YES | MUL | \N | Utilisateur qui a traité la demande. |
| created_at | timestamp | YES |  | CURRENT_TIMESTAMP | Date de création de la ligne (audit). |
| created_by | int unsigned | YES |  | \N | Auteur de la création de la ligne (audit). |
| updated_at | timestamp | YES |  | \N | Date de la dernière modification (audit). |
| updated_by | int unsigned | YES |  | \N | Auteur de la dernière modification (audit). |
| is_deleted | tinyint(1) | NO |  | 0 | Suppression logique de la ligne. |

## Table 42 — `invitation_code`

> Un code d'invitation permettant de créer un compte recruteur.

| Attribut | Type | Null | Clé | Défaut | Explication |
| --- | --- | --- | --- | --- | --- |
| id | bigint | NO | PRI | \N | Identifiant technique de l'invitation. |
| email | varchar(255) | NO | MUL | \N | Adresse email invitée. |
| role | varchar(30) | NO |  | recruiter | Rôle attribué au compte invité. |
| code | varchar(50) | NO | UNI | \N | Code d'invitation unique. |
| is_used | bit(1) | NO |  | b'0' | Indique si le code a déjà été utilisé. |
| expired_at | datetime | NO | MUL | \N | Date d'expiration du code. |
| created_by | int unsigned | YES | MUL | \N | Utilisateur qui a créé l'invitation. |
| created_at | datetime | YES |  | CURRENT_TIMESTAMP | Date de création de la ligne (audit). |
| updated_at | datetime | YES |  | \N | Date de la dernière modification (audit). |
| updated_by | int unsigned | YES |  | \N | Auteur de la dernière modification (audit). |
| is_deleted | bit(1) | NO |  | b'0' | Suppression logique de la ligne. |
| search_string | text | YES |  | \N | Zone libre de recherche / index plein texte. |

---

# 9. Plateforme transverse

## Table 43 — `app_config`

> La configuration générale de la plateforme : nom de l'entreprise, logo, couleurs et activation des comptes candidats.

| Attribut | Type | Null | Clé | Défaut | Explication |
| --- | --- | --- | --- | --- | --- |
| id | bigint | NO | PRI | \N | Identifiant technique de la configuration. |
| config_name | varchar(100) | NO |  | \N | Nom de la configuration. |
| company_name | varchar(255) | NO |  | Synelia | Nom de l'entreprise affiché. |
| app_link | varchar(500) | YES |  | \N | Lien de l'application. |
| logo_html | text | YES |  | \N | Logo de l'entreprise (HTML). |
| primary_color | varchar(7) | NO |  | #7C3AED | Couleur principale de l'interface. |
| color_scheme | varchar(30) | NO |  | violet | Thème de couleurs de l'interface. |
| candidate_accounts_enabled | tinyint(1) | NO |  | 0 | Indique si la création de comptes candidats est activée. |
| is_active | bit(1) | NO |  | b'0' | Indique si cette configuration est active. |
| created_at | datetime | YES |  | \N | Date de création de la ligne (audit). |
| updated_at | datetime | YES |  | \N | Date de la dernière modification (audit). |
| created_by | bigint | YES |  | \N | Auteur de la création de la ligne (audit). |
| updated_by | bigint | YES |  | \N | Auteur de la dernière modification (audit). |
| is_deleted | bit(1) | NO |  | b'0' | Suppression logique de la ligne. |

## Table 44 — `legal_text`

> Les textes légaux (CGU, confidentialité, mentions) affichés aux utilisateurs.

| Attribut | Type | Null | Clé | Défaut | Explication |
| --- | --- | --- | --- | --- | --- |
| id | int unsigned | NO | PRI | \N | Identifiant technique du texte légal. |
| text_key | varchar(50) | NO | UNI | \N | Clé unique du texte (ex. CGU). |
| title | varchar(255) | NO |  | \N | Titre du texte légal. |
| content | text | NO |  | \N | Contenu du texte légal. |
| description | varchar(500) | YES |  | \N | Description du texte. |
| is_active | bit(1) | YES |  | b'1' | Indique si le texte est actif. |
| created_at | datetime | YES |  | CURRENT_TIMESTAMP | Date de création de la ligne (audit). |
| created_by | int unsigned | YES |  | \N | Auteur de la création de la ligne (audit). |
| updated_at | datetime | YES |  | CURRENT_TIMESTAMP | Date de la dernière modification (audit). |
| updated_by | int unsigned | YES |  | \N | Auteur de la dernière modification (audit). |
| is_deleted | bit(1) | YES |  | b'0' | Suppression logique de la ligne. |
| search_string | text | YES |  | \N | Zone libre de recherche / index plein texte. |

## Table 45 — `notifications`

> Une notification interne affichée à un utilisateur dans l'application.

| Attribut | Type | Null | Clé | Défaut | Explication |
| --- | --- | --- | --- | --- | --- |
| id | int unsigned | NO | PRI | \N | Identifiant technique de la notification. |
| notif_type | varchar(100) | YES |  | \N | Type de notification. |
| notif_actor | int | YES |  | \N | Utilisateur à l'origine de la notification. |
| notif_link | varchar(255) | YES |  | \N | Lien vers la ressource concernée. |
| is_read | tinyint(1) | YES |  | \N | Indique si la notification a été lue. |
| object_table_name | varchar(100) | YES |  | \N | Nom de l'objet métier référencé. |
| object_table_id | int | YES |  | \N | Identifiant de l'objet métier référencé. |
| user_id | int unsigned | YES | MUL | \N | Utilisateur destinataire de la notification. |
| created_at | datetime | YES |  | \N | Date de création de la ligne (audit). |
| created_by | int | YES |  | \N | Auteur de la création de la ligne (audit). |
| updated_at | datetime | YES |  | \N | Date de la dernière modification (audit). |
| updated_by | int | YES |  | \N | Auteur de la dernière modification (audit). |
| is_deleted | tinyint(1) | YES |  | \N | Suppression logique de la ligne. |
| search_string | text | YES |  | \N | Zone libre de recherche / index plein texte. |

## Table 46 — `audit_event`

> La trace d'une action métier : qui a fait quoi, quand, sur quelle entité, avec l'état avant / après.

| Attribut | Type | Null | Clé | Défaut | Explication |
| --- | --- | --- | --- | --- | --- |
| id | int unsigned | NO | PRI | \N | Identifiant technique de l'événement d'audit. |
| application_id | int unsigned | YES | MUL | \N | Candidature concernée par l'action (optionnel). |
| application_progress_id | int unsigned | YES | MUL | \N | Étape concernée par l'action (optionnel). |
| entity_type | varchar(100) | NO | MUL | \N | Type d'entité auditée. |
| entity_id | varchar(100) | NO |  | \N | Identifiant de l'entité auditée. |
| action_type | varchar(100) | NO |  | \N | Action effectuée (ex. CREATE, UPDATE, DELETE). |
| actor_user_id | int unsigned | YES |  | \N | Utilisateur à l'origine de l'action. |
| justification | text | YES |  | \N | Justification fournie pour l'action. |
| before_state_json | longtext | YES |  | \N | État de l'entité avant l'action (JSON). |
| after_state_json | longtext | YES |  | \N | État de l'entité après l'action (JSON). |
| created_at | datetime | NO | MUL | CURRENT_TIMESTAMP | Date et heure de l'action (audit). |

## Table 47 — `flyway_schema_history`

> L'historique des migrations de schéma appliquées par Flyway (table technique, non métier).

| Attribut | Type | Null | Clé | Défaut | Explication |
| --- | --- | --- | --- | --- | --- |
| installed_rank | int | NO | PRI | \N | Rang d'installation de la migration. |
| version | varchar(50) | YES |  | \N | Numéro de version de la migration. |
| description | varchar(200) | NO |  | \N | Description de la migration. |
| type | varchar(20) | NO |  | \N | Type de la migration (SQL, JDBC...). |
| script | varchar(1000) | NO |  | \N | Nom du script de migration. |
| checksum | int | YES |  | \N | Empreinte du script (détection de modification). |
| installed_by | varchar(100) | NO |  | \N | Utilisateur de la base qui a appliqué la migration. |
| installed_on | timestamp | NO |  | CURRENT_TIMESTAMP | Date d'application de la migration. |
| execution_time | int | NO |  | \N | Temps d'exécution de la migration (ms). |
| success | tinyint(1) | NO | MUL | \N | Indique si la migration a réussi. |

---

# Annexe — Colonnes d'énumération et leurs valeurs

Valeurs confirmées dans les enums backend (`quizapp/src/main/java/tech/synelia/quizapp/utils/enums/`), sauf mention contraire.

| Table | Colonne | Valeurs |
| --- | --- | --- |
| pipeline_stage | stage_type | CANDIDATURE, QUIZ, PRESELECTION, INTERVIEW, DECISION |
| application_progress | progress_status | PENDING, IN_PROGRESS, AWAITING_VALIDATION, COMPLETED, FAILED, SKIPPED |
| application_quiz_attempt | quiz_status | PENDING, STARTED, COMPLETED, EXPIRED, CANCELLED |
| application_quiz_attempt | manual_correction_status | NOT_REQUIRED, PENDING, COMPLETED |
| application_quiz_attempt | screening_mode | NONE (valeur de base) ; autres valeurs selon la configuration — à confirmer |
| application_quiz_attempt | screening_result | Résultat du screening (PASSED / FAILED) — à confirmer |
| candidate_interview | candidate_response_status | PENDING, ACCEPTED, DECLINED, RESCHEDULE_REQUESTED |
| interviews | interview_status | SCHEDULED, IN_PROGRESS, AWAITING_EVALUATION, AWAITING_VALIDATION, CLOSED, CANCELLED |
| interviews | interview_type | IN_PERSON, ONLINE |
| evaluations | evaluation_status | DRAFT, SUBMITTED, VALIDATED, CANCELLED |
| decisions | decision_mode | STANDARD, CANCEL, OVERRIDE, ROLLBACK |
| candidate_ask | ask_status | PENDING, APPROVED, REJECTED |
| candidate_ask | request_type | IDENTITY, EMAIL, PHONE |
| campaigns | campaign_status | DRAFT, PENDING, OPEN, PAUSED, CLOSED |
| group_change_request | status | PENDING, APPROVED, REJECTED |
| mail_log | status | PENDING, SENT, FAILED |
| mail_log | event_code | Code explicite obligatoire (ex. APPLICATION_VERIFICATION_EMAIL, CANDIDATE_ASK_RESULT_EMAIL, INTERVIEW_INVITATION_EMAIL, `<EVENEMENT>_EMAIL`) ; défaut de compatibilité LEGACY_UNCLASSIFIED |
| question | question_type | SINGLE_CHOICE, MULTIPLE_CHOICE, TRUE_FALSE, TEXT |
| answer | answer_type | TEXT, IMAGE, CODE |
| user | user_role | SUPER, ADMIN, RECRUITER, CANDIDATE |
| invitation_code | role | RECRUITER (défaut `recruiter`) |
| email_verification_tokens | token_type | APPLICATION_VERIFICATION (défaut) ; PASSWORD_RESET et autres — à confirmer |
| email_template_preset | category | MINIMAL, MODERN, CORPORATE, COLORFUL, DARK, APPLICATION_VERIFICATION, PASSWORD_RESET, INVITATION_CODE, CANDIDATE_ASK_RESULT, PRE_SCREEN_DECISION, FINAL_DECISION, INTERVIEW_INVITE, QUIZ_INVITE, WELCOME, GENERIC |
| evaluation_grid_template_item | criterion_type | Type de critère (note, texte...) — à confirmer |
