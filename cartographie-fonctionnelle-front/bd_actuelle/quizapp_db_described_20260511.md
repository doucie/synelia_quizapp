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
| answer | answer_type | varchar(20) | YES |  | \N | 
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
| application_progress | decided_by | int unsigned | YES | MUL | \N | 
| application_progress | created_at | datetime | YES |  | \N | 
| application_progress | created_by | int | YES |  | \N | 
| application_progress | updated_at | datetime | YES |  | \N | 
| application_progress | updated_by | int | YES |  | \N | 
| application_progress | is_deleted | bit(1) | NO |  | b'0' | 
| application_progress | search_string | text | YES |  | \N | 
| applications | id | int unsigned | NO | PRI | \N | 
| applications | candidate_first_name | varchar(100) | NO |  | \N | 
| applications | candidate_last_name | varchar(100) | NO |  | \N | 
| applications | candidate_email | varchar(255) | NO |  | \N | 
| applications | candidate_phone | varchar(20) | YES |  | \N | 
| applications | candidate_cv_path | varchar(1000) | YES |  | \N | 
| applications | candidate_birth_date | date | YES |  | \N | 
| applications | motivation_letter | text | YES |  | \N | 
| applications | email_verified | tinyint(1) | NO |  | \N | 
| applications | quiz_score | int | YES |  | \N | 
| applications | total_evaluation_score | float | YES |  | \N | 
| applications | total_evaluation_number | int | YES |  | \N | 
| applications | total_evaluation_percentage | double | YES |  | \N | 
| applications | application_status | varchar(8) | YES |  | \N | 
| applications | quiz_token | varchar(64) | YES | UNI | \N | 
| applications | quiz_status | varchar(9) | NO |  | \N | 
| applications | quiz_level | int | YES |  | \N | 
| applications | total_questions | int | YES |  | \N | 
| applications | quiz_score_percent | int | YES |  | \N | 
| applications | quiz_manual_correction_status | varchar(20) | NO |  | NOT_REQUIRED | 
| applications | time_elapsed | int | NO |  | 0 | 
| applications | quiz_last_activity_at | timestamp | YES |  | \N | 
| applications | interview_date | datetime | YES |  | \N | 
| applications | interview_status | varchar(20) | YES |  | \N | 
| applications | application_abandoned | tinyint(1) | YES |  | \N | 
| applications | pre_screen_decision_mail_sent | tinyint(1) | YES |  | \N | 
| applications | final_decision_mail_sent | tinyint(1) | YES |  | \N | 
| applications | source_token_id | int unsigned | YES | MUL | \N | 
| applications | form_version_id | int unsigned | YES | MUL | \N | 
| applications | created_at | datetime | YES |  | \N | 
| applications | created_by | int | YES |  | \N | 
| applications | updated_at | datetime | YES |  | \N | 
| applications | updated_by | int | YES |  | \N | 
| applications | is_deleted | tinyint(1) | YES |  | \N | 
| applications | search_string | text | YES |  | \N | 
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
| campaign_crud | id | int unsigned | NO | PRI | \N | 
| campaign_crud | can_update | tinyint(1) | YES |  | \N | 
| campaign_crud | can_delete | tinyint(1) | YES |  | \N | 
| campaign_crud | can_evaluate | tinyint(1) | YES |  | \N | 
| campaign_crud | follow | tinyint(1) | YES |  | \N | 
| campaign_crud | is_admin | tinyint(1) | YES |  | \N | 
| campaign_crud | is_creator | tinyint(1) | YES |  | \N | 
| campaign_crud | can_planify | tinyint(1) | YES |  | \N | 
| campaign_crud | can_accept_pre_screen | tinyint(1) | YES |  | \N | 
| campaign_crud | can_accept_final | tinyint(1) | YES |  | \N | 
| campaign_crud | user_id | int unsigned | YES | MUL | \N | 
| campaign_crud | campaign_id | int unsigned | YES | MUL | \N | 
| campaign_crud | created_at | datetime | YES |  | \N | 
| campaign_crud | created_by | int | YES |  | \N | 
| campaign_crud | updated_at | datetime | YES |  | \N | 
| campaign_crud | updated_by | int | YES |  | \N | 
| campaign_crud | is_deleted | tinyint(1) | YES |  | \N | 
| campaign_crud | search_string | text | YES |  | \N | 
| campaigns | id | int unsigned | NO | PRI | \N | 
| campaigns | campaign_title | varchar(255) | NO |  | \N | 
| campaigns | campaign_desc | text | YES |  | \N | 
| campaigns | campaign_status | varchar(7) | NO |  | \N | 
| campaigns | campaign_start | datetime | YES |  | \N | 
| campaigns | campaign_end | datetime | YES |  | \N | 
| campaigns | max_apply | int | YES |  | \N | 
| campaigns | all_can_evaluate | tinyint(1) | NO |  | \N | 
| campaigns | total_questions | int | YES |  | \N | 
| campaigns | is_timed | tinyint(1) | NO |  | 0 | 
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
| candidate_answer | manual_corrected_at | timestamp | YES |  | \N | 
| candidate_answer | manual_corrected_by | int | YES |  | \N | 
| candidate_answer | application_id | int unsigned | YES | MUL | \N | 
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
| candidate_interview | interview_start | datetime | YES |  | \N | 
| candidate_interview | interview_duration | int | YES |  | \N | 
| candidate_interview | application_id | int unsigned | YES | MUL | \N | 
| candidate_interview | interview_id | int unsigned | YES | MUL | \N | 
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
| decisions | is_cancel | tinyint(1) | NO |  | \N | 
| decisions | application_id | int unsigned | YES | MUL | \N | 
| decisions | user_id | int unsigned | YES | MUL | \N | 
| decisions | created_at | datetime | YES |  | \N | 
| decisions | created_by | int | YES |  | \N | 
| decisions | updated_at | datetime | YES |  | \N | 
| decisions | updated_by | int | YES |  | \N | 
| decisions | is_deleted | tinyint(1) | YES |  | \N | 
| decisions | search_string | text | YES |  | \N | 
| decisions | pipeline_stage_id | int unsigned | YES | MUL | \N | 
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
| entity_permission | user_id | int unsigned | NO | MUL | \N | 
| entity_permission | entity_type | varchar(50) | NO | MUL | \N | 
| entity_permission | entity_id | int | NO |  | \N | 
| entity_permission | permission_key | varchar(50) | NO |  | \N | 
| entity_permission | created_at | timestamp | YES |  | \N | 
| entity_permission | created_by | int | YES |  | \N | 
| entity_permission | updated_at | timestamp | YES |  | \N | 
| entity_permission | updated_by | int | YES |  | \N | 
| entity_permission | is_deleted | tinyint(1) | YES |  | 0 | 
| entity_permission | search_string | text | YES |  | \N | 
| evaluations | id | int unsigned | NO | PRI | \N | 
| evaluations | candidate_mark | int | YES |  | \N | 
| evaluations | recruiter_comment | text | YES |  | \N | 
| evaluations | candidate_interview_id | int unsigned | YES | MUL | \N | 
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
| form | campaign_id | int unsigned | NO | MUL | \N | 
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
| form_version | created_at | datetime | YES |  | CURRENT_TIMESTAMP | 
| form_version | created_by | int unsigned | YES |  | \N | 
| form_version | updated_at | datetime | YES |  | CURRENT_TIMESTAMP | 
| form_version | updated_by | int unsigned | YES |  | \N | 
| form_version | is_deleted | bit(1) | YES |  | b'0' | 
| form_version | search_string | text | YES |  | \N | 
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
| interviews | interview_evaluations_link | varchar(8) | YES |  | \N | 
| interviews | interview_note | text | YES |  | \N | 
| interviews | interview_mail_sent | tinyint(1) | NO |  | 0 | 
| interviews | interview_type | varchar(20) | NO |  | \N | 
| interviews | started_at | datetime | YES |  | \N | 
| interviews | ended_at | datetime | YES |  | \N | 
| interviews | evaluation_score | int | YES |  | \N | 
| interviews | evaluation_number | int | YES |  | \N | 
| interviews | evaluation_percentage | double | YES |  | \N | 
| interviews | campaign_id | int unsigned | YES | MUL | \N | 
| interviews | application_id | int unsigned | YES | MUL | \N | 
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
