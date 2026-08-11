columns
---
```sql
SELECT 
    TABLE_NAME AS 'Table',
    COLUMN_NAME AS 'Attribut', 
    COLUMN_TYPE AS 'Type', 
    IS_NULLABLE AS 'Null', 
    COLUMN_KEY AS 'Clé', 
    COLUMN_DEFAULT AS 'Défaut'
FROM 
    INFORMATION_SCHEMA.COLUMNS 
WHERE 
    TABLE_SCHEMA = 'quizapp_db' -- Remplacez par le nom de votre base
ORDER BY 
    TABLE_NAME, ORDINAL_POSITION
```
| Table | Attribut | Type | Null | Clé | Défaut | 
| --- | --- | --- | --- | --- | --- | 
| answer | id | int unsigned | NO | PRI | \N | 
| answer | answer_text | text | NO |  | \N | 
| answer | is_correct | tinyint(1) | YES |  | \N | 
| answer | answer_order | int | YES |  | \N | 
| answer | answer_type | varchar(20) | NO |  | TEXT | 
| answer | allow_additional_comment | tinyint(1) | NO |  | 0 | 
| answer | additional_comment_required | tinyint(1) | NO |  | 0 | 
| answer | additional_comment_placeholder | varchar(255) | YES |  | \N | 
| answer | question_id | int unsigned | YES | MUL | \N | 
| answer | created_at | datetime | YES |  | \N | 
| answer | created_by | int | YES |  | \N | 
| answer | updated_at | datetime | YES |  | \N | 
| answer | updated_by | int | YES |  | \N | 
| answer | is_deleted | tinyint(1) | YES |  | \N | 
| answer | search_string | text | YES |  | \N | 
| app_config | id | bigint | NO | PRI | \N | 
| app_config | config_name | varchar(100) | NO |  | \N | 
| app_config | company_name | varchar(255) | NO |  | Synelia | 
| app_config | app_link | varchar(500) | YES |  | \N | 
| app_config | logo_html | text | YES |  | \N | 
| app_config | primary_color | varchar(7) | NO |  | #7C3AED | 
| app_config | color_scheme | varchar(30) | NO |  | violet | 
| app_config | candidate_accounts_enabled | tinyint(1) | NO |  | 0 | 
| app_config | is_active | bit(1) | NO |  | b'0' | 
| app_config | created_at | datetime | YES |  | \N | 
| app_config | updated_at | datetime | YES |  | \N | 
| app_config | created_by | bigint | YES |  | \N | 
| app_config | updated_by | bigint | YES |  | \N | 
| app_config | is_deleted | bit(1) | NO |  | b'0' | 
| application_progress | id | int unsigned | NO | PRI | \N | 
| application_progress | application_id | int unsigned | NO | MUL | \N | 
| application_progress | pipeline_stage_id | int unsigned | NO | MUL | \N | 
| application_progress | progress_status | varchar(20) | NO |  | PENDING | 
| application_progress | started_at | datetime | YES |  | \N | 
| application_progress | completed_at | datetime | YES |  | \N | 
| application_progress | score | double | YES |  | \N | 
| application_progress | notes | text | YES |  | \N | 
| application_progress | created_at | datetime | YES |  | \N | 
| application_progress | created_by | int | YES |  | \N | 
| application_progress | updated_at | datetime | YES |  | \N | 
| application_progress | updated_by | int | YES |  | \N | 
| application_progress | is_deleted | bit(1) | NO |  | b'0' | 
| application_progress | search_string | text | YES |  | \N | 
| application_progress | validated_at | datetime | YES |  | \N | 
| application_progress | validated_by | int unsigned | YES |  | \N | 
| application_progress | validation_comment | text | YES |  | \N | 
| application_progress | skipped_at | datetime | YES |  | \N | 
| application_progress | skipped_by | int unsigned | YES |  | \N | 
| application_progress | skip_reason | text | YES |  | \N | 
| application_progress | reopened_at | datetime | YES |  | \N | 
| application_progress | reopened_by | int unsigned | YES |  | \N | 
| application_progress | reopen_reason | text | YES |  | \N | 
| application_quiz_attempt | id | int unsigned | NO | PRI | \N | 
| application_quiz_attempt | application_id | int unsigned | NO | MUL | \N | 
| application_quiz_attempt | application_progress_id | int unsigned | NO | MUL | \N | 
| application_quiz_attempt | form_version_id | int unsigned | YES | MUL | \N | 
| application_quiz_attempt | quiz_token | varchar(64) | YES | UNI | \N | 
| application_quiz_attempt | quiz_status | varchar(20) | NO | MUL | PENDING | 
| application_quiz_attempt | screening_mode | varchar(30) | NO |  | NONE | 
| application_quiz_attempt | screening_threshold | double | YES |  | \N | 
| application_quiz_attempt | screening_result | varchar(30) | YES |  | \N | 
| application_quiz_attempt | score | double | YES |  | \N | 
| application_quiz_attempt | score_percent | double | YES |  | \N | 
| application_quiz_attempt | manual_correction_status | varchar(20) | NO |  | NOT_REQUIRED | 
| application_quiz_attempt | total_questions | int | YES |  | \N | 
| application_quiz_attempt | time_elapsed | int | NO |  | 0 | 
| application_quiz_attempt | timed_snapshot | tinyint(1) | NO |  | 0 | 
| application_quiz_attempt | total_time_allowed_snapshot | int | YES |  | \N | 
| application_quiz_attempt | last_activity_at | datetime | YES | MUL | \N | 
| application_quiz_attempt | started_at | datetime | YES |  | \N | 
| application_quiz_attempt | completed_at | datetime | YES |  | \N | 
| application_quiz_attempt | created_at | datetime | YES |  | \N | 
| application_quiz_attempt | created_by | int | YES |  | \N | 
| application_quiz_attempt | updated_at | datetime | YES |  | \N | 
| application_quiz_attempt | updated_by | int | YES |  | \N | 
| application_quiz_attempt | is_deleted | tinyint(1) | NO |  | 0 | 
| application_quiz_attempt | search_string | text | YES |  | \N | 
| applications | id | int unsigned | NO | PRI | \N | 
| applications | candidate_first_name | varchar(100) | NO |  | \N | 
| applications | candidate_last_name | varchar(100) | NO |  | \N | 
| applications | candidate_email | varchar(255) | NO |  | \N | 
| applications | candidate_phone | varchar(20) | YES |  | \N | 
| applications | candidate_cv_path | varchar(1000) | YES |  | \N | 
| applications | candidate_birth_date | date | YES |  | \N | 
| applications | motivation_letter | text | YES |  | \N | 
| applications | email_verified | tinyint(1) | NO |  | \N | 
| applications | current_interview_evaluation_score | int | YES |  | \N | 
| applications | current_interview_evaluation_number | int | YES |  | \N | 
| applications | current_interview_evaluation_percentage | double | YES |  | \N | 
| applications | current_preselection_decision_type | varchar(50) | YES |  | \N | 
| applications | current_preselection_decision_date | datetime | YES |  | \N | 
| applications | current_final_decision_type | varchar(50) | YES |  | \N | 
| applications | current_final_decision_date | datetime | YES |  | \N | 
| applications | current_pipeline_stage_type | varchar(50) | YES |  | \N | 
| applications | current_pipeline_stage_label | varchar(255) | YES |  | \N | 
| applications | current_pipeline_progress_status | varchar(20) | YES |  | \N | 
| applications | application_abandoned | tinyint(1) | YES |  | \N | 
| applications | abandoned_at | datetime | YES |  | \N | 
| applications | abandon_reason | text | YES |  | \N | 
| applications | abandoned_from_application_progress_id | int unsigned | YES | MUL | \N | 
| applications | source_token_id | int unsigned | YES | MUL | \N | 
| applications | form_version_id | int unsigned | YES | MUL | \N | 
| applications | current_application_progress_id | int unsigned | YES | MUL | \N | 
| applications | current_pipeline_stage_id | int unsigned | YES | MUL | \N | 
| applications | last_progressed_at | datetime | YES |  | \N | 
| applications | aggregated_quiz_score | double | YES |  | \N | 
| applications | aggregated_quiz_score_percent | double | YES |  | \N | 
| applications | aggregated_evaluation_score | double | YES |  | \N | 
| applications | aggregated_evaluation_score_percent | double | YES |  | \N | 
| applications | created_at | datetime | YES |  | \N | 
| applications | created_by | int | YES |  | \N | 
| applications | updated_at | datetime | YES |  | \N | 
| applications | updated_by | int | YES |  | \N | 
| applications | is_deleted | tinyint(1) | YES |  | \N | 
| applications | search_string | text | YES |  | \N | 
| audit_event | id | int unsigned | NO | PRI | \N | 
| audit_event | application_id | int unsigned | YES | MUL | \N | 
| audit_event | application_progress_id | int unsigned | YES | MUL | \N | 
| audit_event | entity_type | varchar(100) | NO | MUL | \N | 
| audit_event | entity_id | varchar(100) | NO |  | \N | 
| audit_event | action_type | varchar(100) | NO |  | \N | 
| audit_event | actor_user_id | int unsigned | YES |  | \N | 
| audit_event | justification | text | YES |  | \N | 
| audit_event | before_state_json | longtext | YES |  | \N | 
| audit_event | after_state_json | longtext | YES |  | \N | 
| audit_event | created_at | datetime | NO | MUL | CURRENT_TIMESTAMP | 
| business_group | id | int | NO | PRI | \N | 
| business_group | group_name | varchar(100) | NO | UNI | \N | 
| business_group | group_desc | text | YES |  | \N | 
| business_group | created_at | timestamp | YES |  | \N | 
| business_group | created_by | int | YES |  | \N | 
| business_group | updated_at | timestamp | YES |  | \N | 
| business_group | updated_by | int | YES |  | \N | 
| business_group | is_deleted | tinyint(1) | YES |  | 0 | 
| business_group | search_string | text | YES |  | \N | 
| business_group_permission | id | int | NO | PRI | \N | 
| business_group_permission | business_group_id | int | NO | MUL | \N | 
| business_group_permission | functionality | varchar(100) | NO |  | \N | 
| business_group_permission | created_at | timestamp | YES |  | \N | 
| business_group_permission | created_by | int | YES |  | \N | 
| business_group_permission | updated_at | timestamp | YES |  | \N | 
| business_group_permission | updated_by | int | YES |  | \N | 
| business_group_permission | is_deleted | tinyint(1) | YES |  | 0 | 
| campaign_form | id | int unsigned | NO | PRI | \N | 
| campaign_form | campaign_id | int unsigned | NO | MUL | \N | 
| campaign_form | form_id | int unsigned | NO | MUL | \N | 
| campaign_form | assignment_order | int | YES |  | \N | 
| campaign_form | created_at | datetime | YES |  | \N | 
| campaign_form | created_by | int | YES |  | \N | 
| campaign_form | updated_at | datetime | YES |  | \N | 
| campaign_form | updated_by | int | YES |  | \N | 
| campaign_form | is_deleted | bit(1) | YES |  | b'0' | 
| campaign_form | search_string | text | YES |  | \N | 
| campaign_form | active_campaign_id | int unsigned | YES | MUL | \N | 
| campaign_form | active_form_id | int unsigned | YES |  | \N | 
| campaigns | id | int unsigned | NO | PRI | \N | 
| campaigns | campaign_title | varchar(255) | NO |  | \N | 
| campaigns | campaign_desc | text | YES |  | \N | 
| campaigns | campaign_status | varchar(20) | NO |  | \N | 
| campaigns | campaign_start | datetime | YES |  | \N | 
| campaigns | campaign_end | datetime | YES |  | \N | 
| campaigns | max_apply | int | YES |  | \N | 
| campaigns | all_can_evaluate | tinyint(1) | NO |  | \N | 
| campaigns | total_questions | int | YES |  | \N | 
| campaigns | is_timed | tinyint(1) | NO |  | 0 | 
| campaigns | is_archived | tinyint(1) | NO |  | 0 | 
| campaigns | time_all_forms | tinyint(1) | NO |  | 0 | 
| campaigns | pipeline_template_id | int unsigned | YES | MUL | \N | 
| campaigns | form_assignment_strategy | varchar(30) | YES |  | \N | 
| campaigns | form_assignment_exhaustion_policy | varchar(20) | YES |  | \N | 
| campaigns | creator_id | int unsigned | YES | MUL | \N | 
| campaigns | speciality_id | int unsigned | YES | MUL | \N | 
| campaigns | created_at | datetime | YES |  | \N | 
| campaigns | created_by | int | YES |  | \N | 
| campaigns | updated_at | datetime | YES |  | \N | 
| campaigns | updated_by | int | YES |  | \N | 
| campaigns | is_deleted | tinyint(1) | YES |  | \N | 
| campaigns | search_string | text | YES |  | \N | 
| candidate_answer | id | int unsigned | NO | PRI | \N | 
| candidate_answer | is_selected | tinyint(1) | NO |  | \N | 
| candidate_answer | manual_is_correct | tinyint(1) | YES |  | \N | 
| candidate_answer | manual_correction_comment | text | YES |  | \N | 
| candidate_answer | manual_correction_score | int | YES |  | \N | 
| candidate_answer | manual_corrected_at | timestamp | YES |  | \N | 
| candidate_answer | manual_corrected_by | int | YES |  | \N | 
| candidate_answer | application_quiz_attempt_id | int unsigned | NO | MUL | \N | 
| candidate_answer | question_id | int unsigned | NO | MUL | \N | 
| candidate_answer | answer_id | int unsigned | YES | MUL | \N | 
| candidate_answer | free_text_response | text | YES |  | \N | 
| candidate_answer | created_at | datetime | YES |  | \N | 
| candidate_answer | created_by | int | YES |  | \N | 
| candidate_answer | updated_at | datetime | YES |  | \N | 
| candidate_answer | updated_by | int | YES |  | \N | 
| candidate_answer | is_deleted | tinyint(1) | YES |  | \N | 
| candidate_answer | search_string | text | YES |  | \N | 
| candidate_ask | id | int unsigned | NO | PRI | \N | 
| candidate_ask | request_type | varchar(10) | YES |  | \N | 
| candidate_ask | ask_status | varchar(20) | NO |  | PENDING | 
| candidate_ask | is_verified | tinyint(1) | NO |  | \N | 
| candidate_ask | first_name | varchar(100) | YES |  | \N | 
| candidate_ask | last_name | varchar(100) | YES |  | \N | 
| candidate_ask | new_email | varchar(255) | YES |  | \N | 
| candidate_ask | new_phone | varchar(20) | YES |  | \N | 
| candidate_ask | decision_reason | varchar(500) | YES |  | \N | 
| candidate_ask | application_id | int unsigned | YES | MUL | \N | 
| candidate_ask | created_at | datetime | YES |  | \N | 
| candidate_ask | created_by | int | YES |  | \N | 
| candidate_ask | updated_at | datetime | YES |  | \N | 
| candidate_ask | updated_by | int | YES |  | \N | 
| candidate_ask | is_deleted | tinyint(1) | YES |  | \N | 
| candidate_ask | search_string | text | YES |  | \N | 
| candidate_interview | id | int unsigned | NO | PRI | \N | 
| candidate_interview | interview_duration | int | YES |  | \N | 
| candidate_interview | candidate_response_status | varchar(30) | NO | MUL | PENDING | 
| candidate_interview | responded_at | datetime | YES |  | \N | 
| candidate_interview | interview_id | int unsigned | NO | MUL | \N | 
| candidate_interview | created_at | datetime | YES |  | \N | 
| candidate_interview | created_by | int | YES |  | \N | 
| candidate_interview | updated_at | datetime | YES |  | \N | 
| candidate_interview | updated_by | int | YES |  | \N | 
| candidate_interview | is_deleted | tinyint(1) | YES |  | \N | 
| candidate_interview | search_string | text | YES |  | \N | 
| candidate_interview | decline_reason | varchar(500) | YES |  | \N | 
| candidate_interview | alternative_date_requested | datetime | YES |  | \N | 
| candidate_token | id | int unsigned | NO | PRI | \N | 
| candidate_token | token_string | varchar(6) | YES |  | \N | 
| candidate_token | application_id | int unsigned | YES | MUL | \N | 
| candidate_token | created_at | datetime | YES |  | \N | 
| candidate_token | created_by | int | YES |  | \N | 
| candidate_token | updated_at | datetime | YES |  | \N | 
| candidate_token | updated_by | int | YES |  | \N | 
| candidate_token | is_deleted | tinyint(1) | YES |  | \N | 
| candidate_token | search_string | text | YES |  | \N | 
| decisions | id | int unsigned | NO | PRI | \N | 
| decisions | decision_type | varchar(50) | NO |  | \N | 
| decisions | user_id | int unsigned | YES | MUL | \N | 
| decisions | created_at | datetime | YES |  | \N | 
| decisions | created_by | int | YES |  | \N | 
| decisions | updated_at | datetime | YES |  | \N | 
| decisions | updated_by | int | YES |  | \N | 
| decisions | is_deleted | tinyint(1) | YES |  | \N | 
| decisions | search_string | text | YES |  | \N | 
| decisions | application_progress_id | int unsigned | NO | MUL | \N | 
| decisions | justification | text | YES |  | \N | 
| decisions | decision_mode | varchar(20) | NO |  | STANDARD | 
| decisions | cancels_decision_id | int unsigned | YES | MUL | \N | 
| departments | id | int unsigned | NO | PRI | \N | 
| departments | department_name | varchar(255) | NO |  | \N | 
| departments | department_desc | text | YES |  | \N | 
| departments | created_at | datetime | YES |  | \N | 
| departments | created_by | int | YES |  | \N | 
| departments | updated_at | datetime | YES |  | \N | 
| departments | updated_by | int | YES |  | \N | 
| departments | is_deleted | tinyint(1) | YES |  | \N | 
| departments | search_string | text | YES |  | \N | 
| email_template | id | int unsigned | NO | PRI | \N | 
| email_template | template_key | varchar(50) | NO | UNI | \N | 
| email_template | subject_template | varchar(500) | NO |  | \N | 
| email_template | body_template | text | NO |  | \N | 
| email_template | editable_variables_json | text | YES |  | \N | 
| email_template | description | varchar(500) | YES |  | \N | 
| email_template | available_variables | text | YES |  | \N | 
| email_template | action_type | varchar(50) | YES | MUL | \N | 
| email_template | preset_id | int | YES |  | \N | 
| email_template | is_active | bit(1) | YES |  | b'1' | 
| email_template | created_at | datetime | YES |  | CURRENT_TIMESTAMP | 
| email_template | created_by | int unsigned | YES |  | \N | 
| email_template | updated_at | datetime | YES |  | CURRENT_TIMESTAMP | 
| email_template | updated_by | int unsigned | YES |  | \N | 
| email_template | is_deleted | bit(1) | YES |  | b'0' | 
| email_template | search_string | text | YES |  | \N | 
| email_template_preset | id | int | NO | PRI | \N | 
| email_template_preset | name | varchar(100) | NO |  | \N | 
| email_template_preset | category | enum('MINIMAL','MODERN','CORPORATE','COLORFUL','DARK','APPLICATION_VERIFICATION','PASSWORD_RESET','INVITATION_CODE','CANDIDATE_ASK_RESULT','PRE_SCREEN_DECISION','FINAL_DECISION','INTERVIEW_INVITE','QUIZ_INVITE','WELCOME','GENERIC') | NO |  | GENERIC | 
| email_template_preset | html_structure | text | NO |  | \N | 
| email_template_preset | preview_image | varchar(500) | YES |  | \N | 
| email_template_preset | description | varchar(500) | YES |  | \N | 
| email_template_preset | is_deleted | tinyint(1) | YES |  | 0 | 
| email_template_preset | created_at | datetime | YES |  | CURRENT_TIMESTAMP | 
| email_template_preset | updated_at | datetime | YES |  | \N | 
| email_verification_tokens | id | int unsigned | NO | PRI | \N | 
| email_verification_tokens | email | varchar(255) | NO |  | \N | 
| email_verification_tokens | token | varchar(255) | NO | UNI | \N | 
| email_verification_tokens | token_type | varchar(255) | NO |  | APPLICATION_VERIFICATION | 
| email_verification_tokens | expires_at | datetime | NO |  | \N | 
| email_verification_tokens | is_used | tinyint(1) | NO |  | 0 | 
| email_verification_tokens | created_at | datetime | NO |  | \N | 
| email_verification_tokens | used_at | datetime | YES |  | \N | 
| email_verification_tokens | application_id | int unsigned | YES | MUL | \N | 
| email_verification_tokens | user_id | int unsigned | YES | MUL | \N | 
| entity_permission | id | int | NO | PRI | \N | 
| entity_permission | user_id | int unsigned | YES | MUL | \N | 
| entity_permission | business_group_id | int | YES | MUL | \N | 
| entity_permission | system_role | varchar(20) | YES | MUL | \N | 
| entity_permission | entity_type | varchar(50) | NO | MUL | \N | 
| entity_permission | entity_id | int | NO |  | \N | 
| entity_permission | permission_key | varchar(50) | NO |  | \N | 
| entity_permission | created_at | timestamp | YES |  | \N | 
| entity_permission | created_by | int | YES |  | \N | 
| entity_permission | updated_at | timestamp | YES |  | \N | 
| entity_permission | updated_by | int | YES |  | \N | 
| entity_permission | is_deleted | tinyint(1) | YES |  | 0 | 
| entity_permission | search_string | text | YES |  | \N | 
| evaluation_grid_template | id | int unsigned | NO | PRI | \N | 
| evaluation_grid_template | template_name | varchar(255) | NO | MUL | \N | 
| evaluation_grid_template | template_desc | text | YES |  | \N | 
| evaluation_grid_template | is_active | tinyint(1) | NO |  | 1 | 
| evaluation_grid_template | created_at | datetime | YES |  | \N | 
| evaluation_grid_template | created_by | int | YES |  | \N | 
| evaluation_grid_template | updated_at | datetime | YES |  | \N | 
| evaluation_grid_template | updated_by | int | YES |  | \N | 
| evaluation_grid_template | is_deleted | tinyint(1) | NO |  | 0 | 
| evaluation_grid_template | search_string | text | YES |  | \N | 
| evaluation_grid_template_item | id | int unsigned | NO | PRI | \N | 
| evaluation_grid_template_item | evaluation_grid_template_version_id | int unsigned | NO | MUL | \N | 
| evaluation_grid_template_item | criterion_order | int | NO |  | \N | 
| evaluation_grid_template_item | label | varchar(255) | NO |  | \N | 
| evaluation_grid_template_item | criterion_type | varchar(20) | NO |  | \N | 
| evaluation_grid_template_item | max_score | double | YES |  | \N | 
| evaluation_grid_template_item | weight | double | YES |  | \N | 
| evaluation_grid_template_item | is_required | tinyint(1) | NO |  | 1 | 
| evaluation_grid_template_item | config_json | text | YES |  | \N | 
| evaluation_grid_template_item | created_at | datetime | YES |  | \N | 
| evaluation_grid_template_item | created_by | int | YES |  | \N | 
| evaluation_grid_template_item | updated_at | datetime | YES |  | \N | 
| evaluation_grid_template_item | updated_by | int | YES |  | \N | 
| evaluation_grid_template_item | is_deleted | tinyint(1) | NO |  | 0 | 
| evaluation_grid_template_item | search_string | text | YES |  | \N | 
| evaluation_grid_template_version | id | int unsigned | NO | PRI | \N | 
| evaluation_grid_template_version | evaluation_grid_template_id | int unsigned | NO | MUL | \N | 
| evaluation_grid_template_version | version_number | int | NO |  | \N | 
| evaluation_grid_template_version | version_label | varchar(255) | YES |  | \N | 
| evaluation_grid_template_version | is_published | tinyint(1) | NO |  | 0 | 
| evaluation_grid_template_version | published_at | datetime | YES |  | \N | 
| evaluation_grid_template_version | created_at | datetime | YES |  | \N | 
| evaluation_grid_template_version | created_by | int | YES |  | \N | 
| evaluation_grid_template_version | updated_at | datetime | YES |  | \N | 
| evaluation_grid_template_version | updated_by | int | YES |  | \N | 
| evaluation_grid_template_version | is_deleted | tinyint(1) | NO |  | 0 | 
| evaluation_grid_template_version | search_string | text | YES |  | \N | 
| evaluation_item | id | int unsigned | NO | PRI | \N | 
| evaluation_item | evaluation_id | int unsigned | NO | MUL | \N | 
| evaluation_item | pipeline_stage_evaluation_criterion_id | int unsigned | NO | MUL | \N | 
| evaluation_item | score_value | double | YES |  | \N | 
| evaluation_item | text_value | text | YES |  | \N | 
| evaluation_item | weight_snapshot | double | YES |  | \N | 
| evaluation_item | max_score_snapshot | double | YES |  | \N | 
| evaluation_item | created_at | datetime | YES |  | \N | 
| evaluation_item | created_by | int | YES |  | \N | 
| evaluation_item | updated_at | datetime | YES |  | \N | 
| evaluation_item | updated_by | int | YES |  | \N | 
| evaluation_item | is_deleted | tinyint(1) | NO |  | 0 | 
| evaluation_item | search_string | text | YES |  | \N | 
| evaluations | id | int unsigned | NO | PRI | \N | 
| evaluations | evaluation_status | varchar(20) | NO | MUL | DRAFT | 
| evaluations | submitted_at | datetime | YES |  | \N | 
| evaluations | validated_at | datetime | YES |  | \N | 
| evaluations | validated_by | int unsigned | YES |  | \N | 
| evaluations | global_score | double | YES |  | \N | 
| evaluations | global_comment | text | YES |  | \N | 
| evaluations | candidate_interview_id | int unsigned | NO | MUL | \N | 
| evaluations | interview_participant_id | int unsigned | YES | MUL | \N | 
| evaluations | created_at | datetime | YES |  | \N | 
| evaluations | created_by | int | YES |  | \N | 
| evaluations | updated_at | datetime | YES |  | \N | 
| evaluations | updated_by | int | YES |  | \N | 
| evaluations | is_deleted | tinyint(1) | YES |  | \N | 
| evaluations | search_string | text | YES |  | \N | 
| flyway_schema_history | installed_rank | int | NO | PRI | \N | 
| flyway_schema_history | version | varchar(50) | YES |  | \N | 
| flyway_schema_history | description | varchar(200) | NO |  | \N | 
| flyway_schema_history | type | varchar(20) | NO |  | \N | 
| flyway_schema_history | script | varchar(1000) | NO |  | \N | 
| flyway_schema_history | checksum | int | YES |  | \N | 
| flyway_schema_history | installed_by | varchar(100) | NO |  | \N | 
| flyway_schema_history | installed_on | timestamp | NO |  | CURRENT_TIMESTAMP | 
| flyway_schema_history | execution_time | int | NO |  | \N | 
| flyway_schema_history | success | tinyint(1) | NO | MUL | \N | 
| form | id | int unsigned | NO | PRI | \N | 
| form | form_name | varchar(255) | NO |  | \N | 
| form | form_desc | text | YES |  | \N | 
| form | is_active | bit(1) | YES |  | b'1' | 
| form | is_timed | tinyint(1) | NO |  | 0 | 
| form | created_at | datetime | YES |  | CURRENT_TIMESTAMP | 
| form | created_by | int unsigned | YES |  | \N | 
| form | updated_at | datetime | YES |  | CURRENT_TIMESTAMP | 
| form | updated_by | int unsigned | YES |  | \N | 
| form | is_deleted | bit(1) | YES |  | b'0' | 
| form | search_string | text | YES |  | \N | 
| form_questions | id | int unsigned | NO | PRI | \N | 
| form_questions | form_version_id | int unsigned | NO | MUL | \N | 
| form_questions | question_id | int unsigned | NO | MUL | \N | 
| form_questions | question_order | int | YES |  | 0 | 
| form_questions | chrono_override | int unsigned | YES |  | \N | 
| form_questions | created_at | datetime | YES |  | CURRENT_TIMESTAMP | 
| form_questions | created_by | int unsigned | YES |  | \N | 
| form_questions | updated_at | datetime | YES |  | CURRENT_TIMESTAMP | 
| form_questions | updated_by | int unsigned | YES |  | \N | 
| form_questions | is_deleted | bit(1) | YES |  | b'0' | 
| form_questions | search_string | text | YES |  | \N | 
| form_version | id | int unsigned | NO | PRI | \N | 
| form_version | form_id | int unsigned | NO | MUL | \N | 
| form_version | version_number | int | NO |  | 1 | 
| form_version | is_published | bit(1) | YES |  | b'0' | 
| form_version | is_locked | bit(1) | YES |  | b'0' | 
| form_version | random_questions | tinyint(1) | NO |  | 0 | 
| form_version | created_at | datetime | YES |  | CURRENT_TIMESTAMP | 
| form_version | created_by | int unsigned | YES |  | \N | 
| form_version | updated_at | datetime | YES |  | CURRENT_TIMESTAMP | 
| form_version | updated_by | int unsigned | YES |  | \N | 
| form_version | is_deleted | bit(1) | YES |  | b'0' | 
| form_version | search_string | text | YES |  | \N | 
| form_version | published_form_id | int unsigned | YES | UNI | \N | 
| group_change_request | id | int | NO | PRI | \N | 
| group_change_request | user_id | int unsigned | NO | MUL | \N | 
| group_change_request | target_group_id | int | NO | MUL | \N | 
| group_change_request | reason | text | YES |  | \N | 
| group_change_request | status | enum('PENDING','APPROVED','REJECTED') | NO |  | PENDING | 
| group_change_request | requested_at | timestamp | YES |  | CURRENT_TIMESTAMP | 
| group_change_request | processed_at | timestamp | YES |  | \N | 
| group_change_request | processed_by | int unsigned | YES | MUL | \N | 
| group_change_request | created_at | timestamp | YES |  | CURRENT_TIMESTAMP | 
| group_change_request | created_by | int unsigned | YES |  | \N | 
| group_change_request | updated_at | timestamp | YES |  | \N | 
| group_change_request | updated_by | int unsigned | YES |  | \N | 
| group_change_request | is_deleted | tinyint(1) | NO |  | 0 | 
| interview_participant | id | int unsigned | NO | PRI | \N | 
| interview_participant | can_update | tinyint(1) | YES |  | \N | 
| interview_participant | can_delete | tinyint(1) | YES |  | \N | 
| interview_participant | can_evaluate | tinyint(1) | YES |  | \N | 
| interview_participant | is_admin | tinyint(1) | NO |  | 0 | 
| interview_participant | follow | tinyint(1) | YES |  | \N | 
| interview_participant | is_online | tinyint(1) | YES |  | \N | 
| interview_participant | has_finished | tinyint(1) | YES |  | \N | 
| interview_participant | evaluation_status | varchar(20) | YES | MUL | \N | 
| interview_participant | evaluation_submitted_at | datetime | YES |  | \N | 
| interview_participant | last_ping_at | datetime | YES |  | \N | 
| interview_participant | user_id | int unsigned | YES | MUL | \N | 
| interview_participant | interview_id | int unsigned | YES | MUL | \N | 
| interview_participant | created_at | datetime | YES |  | \N | 
| interview_participant | created_by | int | YES |  | \N | 
| interview_participant | updated_at | datetime | YES |  | \N | 
| interview_participant | updated_by | int | YES |  | \N | 
| interview_participant | is_deleted | tinyint(1) | YES |  | \N | 
| interview_participant | search_string | text | YES |  | \N | 
| interviews | id | int unsigned | NO | PRI | \N | 
| interviews | interview_location | varchar(255) | YES |  | \N | 
| interviews | interview_date | datetime | NO |  | \N | 
| interviews | interview_status | varchar(20) | NO |  | \N | 
| interviews | meet_link | varchar(500) | YES |  | \N | 
| interviews | evaluation_room_code | varchar(8) | YES |  | \N | 
| interviews | interview_note | text | YES |  | \N | 
| interviews | interview_type | varchar(20) | NO |  | \N | 
| interviews | started_at | datetime | YES |  | \N | 
| interviews | ended_at | datetime | YES |  | \N | 
| interviews | evaluation_completed_at | datetime | YES |  | \N | 
| interviews | evaluation_completed_by | int unsigned | YES |  | \N | 
| interviews | closed_at | datetime | YES |  | \N | 
| interviews | closed_by | int unsigned | YES |  | \N | 
| interviews | closure_comment | text | YES |  | \N | 
| interviews | application_progress_id | int unsigned | YES | MUL | \N | 
| interviews | created_at | datetime | YES |  | \N | 
| interviews | created_by | int | YES |  | \N | 
| interviews | updated_at | datetime | YES |  | \N | 
| interviews | updated_by | int | YES |  | \N | 
| interviews | is_deleted | tinyint(1) | YES |  | \N | 
| interviews | search_string | text | YES |  | \N | 
| invitation_code | id | bigint | NO | PRI | \N | 
| invitation_code | email | varchar(255) | NO | MUL | \N | 
| invitation_code | role | varchar(30) | NO |  | recruiter | 
| invitation_code | code | varchar(50) | NO | UNI | \N | 
| invitation_code | is_used | bit(1) | NO |  | b'0' | 
| invitation_code | expired_at | datetime | NO | MUL | \N | 
| invitation_code | created_by | int unsigned | YES | MUL | \N | 
| invitation_code | created_at | datetime | YES |  | CURRENT_TIMESTAMP | 
| invitation_code | updated_at | datetime | YES |  | \N | 
| invitation_code | updated_by | int unsigned | YES |  | \N | 
| invitation_code | is_deleted | bit(1) | NO |  | b'0' | 
| invitation_code | search_string | text | YES |  | \N | 
| legal_text | id | int unsigned | NO | PRI | \N | 
| legal_text | text_key | varchar(50) | NO | UNI | \N | 
| legal_text | title | varchar(255) | NO |  | \N | 
| legal_text | content | text | NO |  | \N | 
| legal_text | description | varchar(500) | YES |  | \N | 
| legal_text | is_active | bit(1) | YES |  | b'1' | 
| legal_text | created_at | datetime | YES |  | CURRENT_TIMESTAMP | 
| legal_text | created_by | int unsigned | YES |  | \N | 
| legal_text | updated_at | datetime | YES |  | CURRENT_TIMESTAMP | 
| legal_text | updated_by | int unsigned | YES |  | \N | 
| legal_text | is_deleted | bit(1) | YES |  | b'0' | 
| legal_text | search_string | text | YES |  | \N | 
| mail_log | id | int unsigned | NO | PRI | \N | 
| mail_log | recipient_email | varchar(255) | NO | MUL | \N | 
| mail_log | application_id | int unsigned | YES | MUL | \N | 
| mail_log | application_progress_id | int unsigned | YES | MUL | \N | 
| mail_log | interview_id | int unsigned | YES | MUL | \N | 
| mail_log | decision_id | int unsigned | YES | MUL | \N | 
| mail_log | notification_rule_id | int unsigned | YES | MUL | \N | 
| mail_log | event_code | varchar(80) | NO | MUL | LEGACY_UNCLASSIFIED | 
| mail_log | requires_confirmation | tinyint(1) | NO |  | 0 | 
| mail_log | confirmed_at | datetime | YES |  | \N | 
| mail_log | confirmed_by | int unsigned | YES |  | \N | 
| mail_log | recipient_user_id | int unsigned | YES | MUL | \N | 
| mail_log | sender_user_id | int unsigned | YES | MUL | \N | 
| mail_log | email_template_id | int unsigned | YES | MUL | \N | 
| mail_log | subject | varchar(500) | NO |  | \N | 
| mail_log | body_preview | text | YES |  | \N | 
| mail_log | status | varchar(20) | NO | MUL | PENDING | 
| mail_log | error_message | text | YES |  | \N | 
| mail_log | sent_at | datetime | YES | MUL | \N | 
| mail_log | created_at | datetime | YES |  | CURRENT_TIMESTAMP | 
| mail_log | created_by | int | YES |  | \N | 
| mail_log | updated_at | datetime | YES |  | \N | 
| mail_log | updated_by | int | YES |  | \N | 
| mail_log | is_deleted | tinyint(1) | NO |  | 0 | 
| mail_log | search_string | text | YES |  | \N | 
| notifications | id | int unsigned | NO | PRI | \N | 
| notifications | notif_type | varchar(100) | YES |  | \N | 
| notifications | notif_actor | int | YES |  | \N | 
| notifications | notif_link | varchar(255) | YES |  | \N | 
| notifications | is_read | tinyint(1) | YES |  | \N | 
| notifications | object_table_name | varchar(100) | YES |  | \N | 
| notifications | object_table_id | int | YES |  | \N | 
| notifications | user_id | int unsigned | YES | MUL | \N | 
| notifications | created_at | datetime | YES |  | \N | 
| notifications | created_by | int | YES |  | \N | 
| notifications | updated_at | datetime | YES |  | \N | 
| notifications | updated_by | int | YES |  | \N | 
| notifications | is_deleted | tinyint(1) | YES |  | \N | 
| notifications | search_string | text | YES |  | \N | 
| pipeline_stage | id | int unsigned | NO | PRI | \N | 
| pipeline_stage | pipeline_template_id | int unsigned | NO | MUL | \N | 
| pipeline_stage | stage_type | varchar(50) | NO |  | \N | 
| pipeline_stage | stage_label | varchar(255) | NO |  | \N | 
| pipeline_stage | stage_order | int | NO |  | \N | 
| pipeline_stage | is_required | bit(1) | NO |  | b'1' | 
| pipeline_stage | is_eliminatory | bit(1) | NO |  | b'0' | 
| pipeline_stage | config_json | text | YES |  | \N | 
| pipeline_stage | created_at | datetime | YES |  | \N | 
| pipeline_stage | created_by | int | YES |  | \N | 
| pipeline_stage | updated_at | datetime | YES |  | \N | 
| pipeline_stage | updated_by | int | YES |  | \N | 
| pipeline_stage | is_deleted | bit(1) | NO |  | b'0' | 
| pipeline_stage | search_string | text | YES |  | \N | 
| pipeline_stage_evaluation_criterion | id | int unsigned | NO | PRI | \N | 
| pipeline_stage_evaluation_criterion | pipeline_stage_id | int unsigned | NO | MUL | \N | 
| pipeline_stage_evaluation_criterion | evaluation_grid_template_version_id | int unsigned | YES | MUL | \N | 
| pipeline_stage_evaluation_criterion | criterion_order | int | NO |  | \N | 
| pipeline_stage_evaluation_criterion | label | varchar(255) | NO |  | \N | 
| pipeline_stage_evaluation_criterion | criterion_type | varchar(20) | NO |  | \N | 
| pipeline_stage_evaluation_criterion | max_score | double | YES |  | \N | 
| pipeline_stage_evaluation_criterion | weight | double | YES |  | \N | 
| pipeline_stage_evaluation_criterion | is_required | tinyint(1) | NO |  | 1 | 
| pipeline_stage_evaluation_criterion | config_json | text | YES |  | \N | 
| pipeline_stage_evaluation_criterion | created_at | datetime | YES |  | \N | 
| pipeline_stage_evaluation_criterion | created_by | int | YES |  | \N | 
| pipeline_stage_evaluation_criterion | updated_at | datetime | YES |  | \N | 
| pipeline_stage_evaluation_criterion | updated_by | int | YES |  | \N | 
| pipeline_stage_evaluation_criterion | is_deleted | tinyint(1) | NO |  | 0 | 
| pipeline_stage_evaluation_criterion | search_string | text | YES |  | \N | 
| pipeline_stage_notification_rule | id | int unsigned | NO | PRI | \N | 
| pipeline_stage_notification_rule | pipeline_stage_id | int unsigned | NO | MUL | \N | 
| pipeline_stage_notification_rule | trigger_code | varchar(80) | NO |  | \N | 
| pipeline_stage_notification_rule | outcome_code | varchar(80) | YES |  | \N | 
| pipeline_stage_notification_rule | email_template_id | int unsigned | YES | MUL | \N | 
| pipeline_stage_notification_rule | is_required | tinyint(1) | NO |  | 0 | 
| pipeline_stage_notification_rule | is_automatic | tinyint(1) | NO |  | 0 | 
| pipeline_stage_notification_rule | requires_manual_confirmation | tinyint(1) | NO |  | 0 | 
| pipeline_stage_notification_rule | created_at | datetime | YES |  | \N | 
| pipeline_stage_notification_rule | created_by | int | YES |  | \N | 
| pipeline_stage_notification_rule | updated_at | datetime | YES |  | \N | 
| pipeline_stage_notification_rule | updated_by | int | YES |  | \N | 
| pipeline_stage_notification_rule | is_deleted | tinyint(1) | NO |  | 0 | 
| pipeline_stage_notification_rule | search_string | text | YES |  | \N | 
| pipeline_template | id | int unsigned | NO | PRI | \N | 
| pipeline_template | template_name | varchar(255) | NO |  | \N | 
| pipeline_template | template_desc | text | YES |  | \N | 
| pipeline_template | is_default | bit(1) | NO |  | b'0' | 
| pipeline_template | is_active | bit(1) | NO |  | b'1' | 
| pipeline_template | is_locked | bit(1) | NO |  | b'0' | 
| pipeline_template | created_at | datetime | YES |  | \N | 
| pipeline_template | created_by | int | YES |  | \N | 
| pipeline_template | updated_at | datetime | YES |  | \N | 
| pipeline_template | updated_by | int | YES |  | \N | 
| pipeline_template | is_deleted | bit(1) | NO |  | b'0' | 
| pipeline_template | search_string | text | YES |  | \N | 
| question | id | int unsigned | NO | PRI | \N | 
| question | question_ref | varchar(36) | YES |  | \N | 
| question | question_text | text | NO |  | \N | 
| question | question_chrono | int | YES |  | 10 | 
| question | question_type | varchar(20) | YES |  | SINGLE_CHOICE | 
| question | score | int | YES |  | 1 | 
| question | difficulty_level | varchar(20) | YES |  | \N | 
| question | speciality_id | int unsigned | YES | MUL | \N | 
| question | all_answers_justification_required | bit(1) | NO |  | b'0' | 
| question | manual_correction_required | bit(1) | NO |  | b'0' | 
| question | free_text_response_placeholder | varchar(255) | YES |  | \N | 
| question | created_at | datetime | YES |  | \N | 
| question | created_by | int | YES |  | \N | 
| question | updated_at | datetime | YES |  | \N | 
| question | updated_by | int | YES |  | \N | 
| question | is_deleted | tinyint(1) | YES |  | \N | 
| question | search_string | text | YES |  | \N | 
| smtp_config | id | int unsigned | NO | PRI | \N | 
| smtp_config | host | varchar(255) | NO |  | \N | 
| smtp_config | port | int | NO |  | 587 | 
| smtp_config | username | varchar(255) | YES |  | \N | 
| smtp_config | password_encrypted | varchar(500) | YES |  | \N | 
| smtp_config | smtp_auth | bit(1) | YES |  | b'1' | 
| smtp_config | starttls_enable | bit(1) | YES |  | b'1' | 
| smtp_config | starttls_required | bit(1) | YES |  | b'0' | 
| smtp_config | connection_timeout | int | YES |  | 5000 | 
| smtp_config | timeout | int | YES |  | 5000 | 
| smtp_config | write_timeout | int | YES |  | 5000 | 
| smtp_config | sender_name | varchar(255) | YES |  | \N | 
| smtp_config | sender_email | varchar(255) | YES |  | \N | 
| smtp_config | is_active | bit(1) | YES |  | b'0' | 
| smtp_config | created_at | datetime | YES |  | CURRENT_TIMESTAMP | 
| smtp_config | created_by | int unsigned | YES |  | \N | 
| smtp_config | updated_at | datetime | YES |  | CURRENT_TIMESTAMP | 
| smtp_config | updated_by | int unsigned | YES |  | \N | 
| smtp_config | is_deleted | bit(1) | YES |  | b'0' | 
| smtp_config | search_string | text | YES |  | \N | 
| source_token | id | int unsigned | NO | PRI | \N | 
| source_token | token_string | varchar(6) | NO |  | \N | 
| source_token | source_token_name | varchar(100) | YES |  | \N | 
| source_token | expiration_date | datetime | YES |  | \N | 
| source_token | campaign_id | int unsigned | YES | MUL | \N | 
| source_token | form_id | int unsigned | YES | MUL | \N | 
| source_token | created_at | datetime | YES |  | \N | 
| source_token | created_by | int | YES |  | \N | 
| source_token | updated_at | datetime | YES |  | \N | 
| source_token | updated_by | int | YES |  | \N | 
| source_token | is_deleted | tinyint(1) | YES |  | \N | 
| source_token | search_string | text | YES |  | \N | 
| source_token | is_public | tinyint(1) | NO |  | 0 | 
| specialities | id | int unsigned | NO | PRI | \N | 
| specialities | speciality_name | varchar(255) | NO |  | \N | 
| specialities | speciality_desc | text | YES |  | \N | 
| specialities | department_id | int unsigned | YES | MUL | \N | 
| specialities | created_at | datetime | YES |  | \N | 
| specialities | created_by | int | YES |  | \N | 
| specialities | updated_at | datetime | YES |  | \N | 
| specialities | updated_by | int | YES |  | \N | 
| specialities | is_deleted | tinyint(1) | YES |  | \N | 
| specialities | search_string | text | YES |  | \N | 
| system_role_permission | id | int | NO | PRI | \N | 
| system_role_permission | system_role | varchar(20) | NO | MUL | \N | 
| system_role_permission | functionality | varchar(100) | NO |  | \N | 
| system_role_permission | created_at | timestamp | YES |  | \N | 
| system_role_permission | created_by | int | YES |  | \N | 
| system_role_permission | updated_at | timestamp | YES |  | \N | 
| system_role_permission | updated_by | int | YES |  | \N | 
| system_role_permission | is_deleted | tinyint(1) | YES |  | 0 | 
| user | id | int unsigned | NO | PRI | \N | 
| user | first_name | varchar(100) | NO |  | \N | 
| user | last_name | varchar(500) | NO |  | \N | 
| user | username | varchar(50) | NO | UNI | \N | 
| user | email | varchar(255) | NO | UNI | \N | 
| user | phone | varchar(20) | YES |  | \N | 
| user | password | varchar(255) | NO |  | \N | 
| user | is_default_password | tinyint(1) | YES |  | \N | 
| user | user_role | varchar(20) | YES |  | \N | 
| user | is_online | tinyint(1) | YES |  | \N | 
| user | is_locked | tinyint(1) | YES |  | \N | 
| user | last_connection_date | datetime | YES |  | \N | 
| user | admin_mode | tinyint(1) | YES |  | 0 | 
| user | page_size_preference | int | YES |  | 10 | 
| user | created_at | datetime | YES |  | \N | 
| user | created_by | int | YES |  | \N | 
| user | updated_at | datetime | YES |  | \N | 
| user | updated_by | int | YES |  | \N | 
| user | is_deleted | tinyint(1) | YES |  | \N | 
| user | search_string | text | YES |  | \N | 
| user_business_group | id | int | NO | PRI | \N | 
| user_business_group | user_id | int unsigned | NO | MUL | \N | 
| user_business_group | business_group_id | int | NO | MUL | \N | 
| user_business_group | created_at | timestamp | YES |  | \N | 
| user_business_group | created_by | int | YES |  | \N | 
| user_business_group | updated_at | timestamp | YES |  | \N | 
| user_business_group | updated_by | int | YES |  | \N | 
| user_business_group | is_deleted | tinyint(1) | YES |  | 0 | 
| user_business_group | is_moderator | tinyint(1) | NO |  | 0 | 
| user_permission_override | id | int | NO | PRI | \N | 
| user_permission_override | user_id | int unsigned | NO | MUL | \N | 
| user_permission_override | functionality | varchar(100) | NO |  | \N | 
| user_permission_override | is_allowed | tinyint(1) | NO |  | \N | 
| user_permission_override | created_at | timestamp | YES |  | \N | 
| user_permission_override | created_by | int | YES |  | \N | 
| user_permission_override | updated_at | timestamp | YES |  | \N | 
| user_permission_override | updated_by | int | YES |  | \N | 
| user_permission_override | is_deleted | tinyint(1) | YES |  | 0 | 
