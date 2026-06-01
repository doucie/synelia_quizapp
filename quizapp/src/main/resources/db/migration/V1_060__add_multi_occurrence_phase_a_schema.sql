-- =============================================================================
-- V1_060 : socle schema phase A pour le pipeline multi-occurrences
-- Migration strictement additive : aucune suppression legacy a ce stade.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Index de coherence sur application_progress
-- -----------------------------------------------------------------------------
ALTER TABLE application_progress
    ADD KEY idx_progress_id_application (id, application_id);

-- -----------------------------------------------------------------------------
-- 2. Runtime quiz explicite par tentative
-- -----------------------------------------------------------------------------
CREATE TABLE application_quiz_attempt (
    id                           INT UNSIGNED NOT NULL AUTO_INCREMENT,
    application_id               INT UNSIGNED NOT NULL,
    application_progress_id      INT UNSIGNED NOT NULL,
    form_version_id              INT UNSIGNED NULL,
    quiz_token                   VARCHAR(64)  NULL,
    quiz_status                  VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    screening_mode               VARCHAR(30)  NOT NULL DEFAULT 'NONE',
    screening_threshold          DOUBLE       NULL,
    screening_result             VARCHAR(30)  NULL,
    score                        DOUBLE       NULL,
    score_percent                DOUBLE       NULL,
    manual_correction_status     VARCHAR(20)  NOT NULL DEFAULT 'NOT_REQUIRED',
    total_questions              INT          NULL,
    time_elapsed                 INT          NOT NULL DEFAULT 0,
    timed_snapshot               TINYINT(1)   NOT NULL DEFAULT 0,
    total_time_allowed_snapshot  INT          NULL,
    last_activity_at             DATETIME     NULL,
    started_at                   DATETIME     NULL,
    completed_at                 DATETIME     NULL,
    created_at                   DATETIME     NULL,
    created_by                   INT          NULL,
    updated_at                   DATETIME     NULL,
    updated_by                   INT          NULL,
    is_deleted                   BOOLEAN      NOT NULL DEFAULT FALSE,
    search_string                TEXT         NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_aqa_quiz_token (quiz_token),
    KEY idx_aqa_application (application_id),
    KEY idx_aqa_progress_application (application_progress_id, application_id),
    KEY idx_aqa_id_application (id, application_id),
    KEY idx_aqa_quiz_status (quiz_status),
    KEY idx_aqa_last_activity (last_activity_at),
    CONSTRAINT fk_aqa_application FOREIGN KEY (application_id) REFERENCES applications(id),
    CONSTRAINT fk_aqa_progress_application FOREIGN KEY (application_progress_id, application_id)
        REFERENCES application_progress(id, application_id),
    CONSTRAINT fk_aqa_form_version FOREIGN KEY (form_version_id) REFERENCES form_version(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3. Regles de notification de stage
-- -----------------------------------------------------------------------------
CREATE TABLE pipeline_stage_notification_rule (
    id                            INT UNSIGNED NOT NULL AUTO_INCREMENT,
    pipeline_stage_id             INT UNSIGNED NOT NULL,
    trigger_code                  VARCHAR(80)  NOT NULL,
    outcome_code                  VARCHAR(80)  NULL,
    email_template_id             INT UNSIGNED NULL,
    is_required                   BOOLEAN      NOT NULL DEFAULT FALSE,
    is_automatic                  BOOLEAN      NOT NULL DEFAULT FALSE,
    requires_manual_confirmation  BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at                    DATETIME     NULL,
    created_by                    INT          NULL,
    updated_at                    DATETIME     NULL,
    updated_by                    INT          NULL,
    is_deleted                    BOOLEAN      NOT NULL DEFAULT FALSE,
    search_string                 TEXT         NULL,
    PRIMARY KEY (id),
    KEY idx_psnr_stage_trigger (pipeline_stage_id, trigger_code),
    KEY idx_psnr_email_template (email_template_id),
    CONSTRAINT fk_psnr_stage FOREIGN KEY (pipeline_stage_id) REFERENCES pipeline_stage(id),
    CONSTRAINT fk_psnr_email_template FOREIGN KEY (email_template_id) REFERENCES email_template(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 4. Bibliotheque mutualisee de grilles d'evaluation
-- -----------------------------------------------------------------------------
CREATE TABLE evaluation_grid_template (
    id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
    template_name    VARCHAR(255) NOT NULL,
    template_desc    TEXT         NULL,
    is_active        BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at       DATETIME     NULL,
    created_by       INT          NULL,
    updated_at       DATETIME     NULL,
    updated_by       INT          NULL,
    is_deleted       BOOLEAN      NOT NULL DEFAULT FALSE,
    search_string    TEXT         NULL,
    PRIMARY KEY (id),
    KEY idx_egt_name (template_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE evaluation_grid_template_version (
    id                           INT UNSIGNED NOT NULL AUTO_INCREMENT,
    evaluation_grid_template_id  INT UNSIGNED NOT NULL,
    version_number               INT          NOT NULL,
    version_label                VARCHAR(255) NULL,
    is_published                 BOOLEAN      NOT NULL DEFAULT FALSE,
    published_at                 DATETIME     NULL,
    created_at                   DATETIME     NULL,
    created_by                   INT          NULL,
    updated_at                   DATETIME     NULL,
    updated_by                   INT          NULL,
    is_deleted                   BOOLEAN      NOT NULL DEFAULT FALSE,
    search_string                TEXT         NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_egtv_template_version (evaluation_grid_template_id, version_number),
    KEY idx_egtv_template (evaluation_grid_template_id),
    CONSTRAINT fk_egtv_template FOREIGN KEY (evaluation_grid_template_id)
        REFERENCES evaluation_grid_template(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE evaluation_grid_template_item (
    id                                   INT UNSIGNED NOT NULL AUTO_INCREMENT,
    evaluation_grid_template_version_id  INT UNSIGNED NOT NULL,
    criterion_order                      INT          NOT NULL,
    label                                VARCHAR(255) NOT NULL,
    criterion_type                       VARCHAR(20)  NOT NULL,
    max_score                            DOUBLE       NULL,
    weight                               DOUBLE       NULL,
    is_required                          BOOLEAN      NOT NULL DEFAULT TRUE,
    config_json                          TEXT         NULL,
    created_at                           DATETIME     NULL,
    created_by                           INT          NULL,
    updated_at                           DATETIME     NULL,
    updated_by                           INT          NULL,
    is_deleted                           BOOLEAN      NOT NULL DEFAULT FALSE,
    search_string                        TEXT         NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_egti_version_order (evaluation_grid_template_version_id, criterion_order),
    KEY idx_egti_version (evaluation_grid_template_version_id),
    CONSTRAINT fk_egti_version FOREIGN KEY (evaluation_grid_template_version_id)
        REFERENCES evaluation_grid_template_version(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 5. Criteres effectifs du stage et detail d'evaluation
-- -----------------------------------------------------------------------------
CREATE TABLE pipeline_stage_evaluation_criterion (
    id                                   INT UNSIGNED NOT NULL AUTO_INCREMENT,
    pipeline_stage_id                    INT UNSIGNED NOT NULL,
    evaluation_grid_template_version_id  INT UNSIGNED NULL,
    criterion_order                      INT          NOT NULL,
    label                                VARCHAR(255) NOT NULL,
    criterion_type                       VARCHAR(20)  NOT NULL,
    max_score                            DOUBLE       NULL,
    weight                               DOUBLE       NULL,
    is_required                          BOOLEAN      NOT NULL DEFAULT TRUE,
    config_json                          TEXT         NULL,
    created_at                           DATETIME     NULL,
    created_by                           INT          NULL,
    updated_at                           DATETIME     NULL,
    updated_by                           INT          NULL,
    is_deleted                           BOOLEAN      NOT NULL DEFAULT FALSE,
    search_string                        TEXT         NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_psec_stage_order (pipeline_stage_id, criterion_order),
    KEY idx_psec_grid_version (evaluation_grid_template_version_id),
    CONSTRAINT fk_psec_stage FOREIGN KEY (pipeline_stage_id) REFERENCES pipeline_stage(id),
    CONSTRAINT fk_psec_grid_version FOREIGN KEY (evaluation_grid_template_version_id)
        REFERENCES evaluation_grid_template_version(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE evaluation_item (
    id                                    INT UNSIGNED NOT NULL AUTO_INCREMENT,
    evaluation_id                         INT UNSIGNED NOT NULL,
    pipeline_stage_evaluation_criterion_id INT UNSIGNED NOT NULL,
    score_value                           DOUBLE       NULL,
    text_value                            TEXT         NULL,
    weight_snapshot                       DOUBLE       NULL,
    max_score_snapshot                    DOUBLE       NULL,
    created_at                            DATETIME     NULL,
    created_by                            INT          NULL,
    updated_at                            DATETIME     NULL,
    updated_by                            INT          NULL,
    is_deleted                            BOOLEAN      NOT NULL DEFAULT FALSE,
    search_string                         TEXT         NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_evaluation_item_criterion (evaluation_id, pipeline_stage_evaluation_criterion_id),
    KEY idx_evaluation_item_criterion (pipeline_stage_evaluation_criterion_id),
    CONSTRAINT fk_evaluation_item_evaluation FOREIGN KEY (evaluation_id) REFERENCES evaluations(id),
    CONSTRAINT fk_evaluation_item_criterion FOREIGN KEY (pipeline_stage_evaluation_criterion_id)
        REFERENCES pipeline_stage_evaluation_criterion(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 6. Audit transverse
-- -----------------------------------------------------------------------------
CREATE TABLE audit_event (
    id                     INT UNSIGNED NOT NULL AUTO_INCREMENT,
    application_id         INT UNSIGNED NULL,
    application_progress_id INT UNSIGNED NULL,
    entity_type            VARCHAR(100) NOT NULL,
    entity_id              VARCHAR(100) NOT NULL,
    action_type            VARCHAR(100) NOT NULL,
    actor_user_id          INT UNSIGNED NULL,
    justification          TEXT         NULL,
    before_state_json      LONGTEXT     NULL,
    after_state_json       LONGTEXT     NULL,
    created_at             DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_audit_event_application (application_id),
    KEY idx_audit_event_progress (application_progress_id),
    KEY idx_audit_event_entity (entity_type, entity_id),
    KEY idx_audit_event_created_at (created_at),
    CONSTRAINT fk_audit_event_application FOREIGN KEY (application_id) REFERENCES applications(id),
    CONSTRAINT fk_audit_event_progress FOREIGN KEY (application_progress_id) REFERENCES application_progress(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 7. Enrichissement application_progress
-- -----------------------------------------------------------------------------
ALTER TABLE application_progress
    ADD COLUMN validated_at DATETIME NULL AFTER mail_sent,
    ADD COLUMN validated_by INT UNSIGNED NULL AFTER validated_at,
    ADD COLUMN validation_comment TEXT NULL AFTER validated_by,
    ADD COLUMN skipped_at DATETIME NULL AFTER validation_comment,
    ADD COLUMN skipped_by INT UNSIGNED NULL AFTER skipped_at,
    ADD COLUMN skip_reason TEXT NULL AFTER skipped_by,
    ADD COLUMN reopened_at DATETIME NULL AFTER skip_reason,
    ADD COLUMN reopened_by INT UNSIGNED NULL AFTER reopened_at,
    ADD COLUMN reopen_reason TEXT NULL AFTER reopened_by;

-- -----------------------------------------------------------------------------
-- 8. Enrichissement applications
-- -----------------------------------------------------------------------------
ALTER TABLE applications
    ADD COLUMN current_application_progress_id INT UNSIGNED NULL AFTER form_version_id,
    ADD COLUMN current_pipeline_stage_id INT UNSIGNED NULL AFTER current_application_progress_id,
    ADD COLUMN last_progressed_at DATETIME NULL AFTER current_pipeline_stage_id,
    ADD COLUMN aggregated_quiz_score DOUBLE NULL AFTER last_progressed_at,
    ADD COLUMN aggregated_quiz_score_percent DOUBLE NULL AFTER aggregated_quiz_score,
    ADD COLUMN aggregated_evaluation_score DOUBLE NULL AFTER aggregated_quiz_score_percent,
    ADD COLUMN aggregated_evaluation_score_percent DOUBLE NULL AFTER aggregated_evaluation_score,
    ADD COLUMN abandoned_at DATETIME NULL AFTER application_abandoned,
    ADD COLUMN abandon_reason TEXT NULL AFTER abandoned_at,
    ADD COLUMN abandoned_from_application_progress_id INT UNSIGNED NULL AFTER abandon_reason,
    ADD KEY idx_app_current_progress (current_application_progress_id),
    ADD KEY idx_app_current_stage (current_pipeline_stage_id),
    ADD KEY idx_app_abandoned_from_progress (abandoned_from_application_progress_id),
    ADD CONSTRAINT fk_app_current_progress FOREIGN KEY (current_application_progress_id)
        REFERENCES application_progress(id),
    ADD CONSTRAINT fk_app_current_stage FOREIGN KEY (current_pipeline_stage_id)
        REFERENCES pipeline_stage(id),
    ADD CONSTRAINT fk_app_abandoned_from_progress FOREIGN KEY (abandoned_from_application_progress_id)
        REFERENCES application_progress(id);

-- -----------------------------------------------------------------------------
-- 9. Rattachement progressif des reponses quiz
-- -----------------------------------------------------------------------------
ALTER TABLE candidate_answer
    ADD COLUMN application_quiz_attempt_id INT UNSIGNED NULL AFTER application_id,
    ADD KEY idx_candidate_answer_attempt_app (application_quiz_attempt_id, application_id),
    ADD CONSTRAINT fk_candidate_answer_attempt_app FOREIGN KEY (application_quiz_attempt_id, application_id)
        REFERENCES application_quiz_attempt(id, application_id);

-- -----------------------------------------------------------------------------
-- 10. Rattachement des entretiens a l'occurrence pipeline
-- -----------------------------------------------------------------------------
ALTER TABLE interviews
    ADD COLUMN application_progress_id INT UNSIGNED NULL AFTER application_id,
    ADD COLUMN evaluation_completed_at DATETIME NULL AFTER evaluation_percentage,
    ADD COLUMN evaluation_completed_by INT UNSIGNED NULL AFTER evaluation_completed_at,
    ADD COLUMN closed_at DATETIME NULL AFTER evaluation_completed_by,
    ADD COLUMN closed_by INT UNSIGNED NULL AFTER closed_at,
    ADD COLUMN closure_comment TEXT NULL AFTER closed_by,
    ADD KEY idx_interviews_progress_app (application_progress_id, application_id),
    ADD CONSTRAINT fk_interviews_progress_app FOREIGN KEY (application_progress_id, application_id)
        REFERENCES application_progress(id, application_id);

-- -----------------------------------------------------------------------------
-- 11. Rattachement des decisions a l'occurrence pipeline
-- -----------------------------------------------------------------------------
ALTER TABLE decisions
    ADD COLUMN application_progress_id INT UNSIGNED NULL AFTER pipeline_stage_id,
    ADD COLUMN justification TEXT NULL AFTER application_progress_id,
    ADD COLUMN decision_mode VARCHAR(20) NOT NULL DEFAULT 'STANDARD' AFTER justification,
    ADD COLUMN cancels_decision_id INT UNSIGNED NULL AFTER decision_mode,
    ADD KEY idx_decisions_progress_app (application_progress_id, application_id),
    ADD KEY idx_decisions_cancels (cancels_decision_id),
    ADD CONSTRAINT fk_decisions_progress_app FOREIGN KEY (application_progress_id, application_id)
        REFERENCES application_progress(id, application_id),
    ADD CONSTRAINT fk_decisions_cancels FOREIGN KEY (cancels_decision_id) REFERENCES decisions(id);

-- -----------------------------------------------------------------------------
-- 12. Reponse candidat sur candidate_interview
-- -----------------------------------------------------------------------------
ALTER TABLE candidate_interview
    ADD COLUMN candidate_response_status VARCHAR(30) NOT NULL DEFAULT 'PENDING' AFTER interview_duration,
    ADD COLUMN responded_at DATETIME NULL AFTER candidate_response_status,
    ADD KEY idx_candidate_interview_response_status (candidate_response_status);

-- -----------------------------------------------------------------------------
-- 13. Suivi de depot d'evaluation par participant
-- -----------------------------------------------------------------------------
ALTER TABLE interview_participant
    ADD COLUMN evaluation_status VARCHAR(20) NULL AFTER has_finished,
    ADD COLUMN evaluation_submitted_at DATETIME NULL AFTER evaluation_status,
    ADD KEY idx_interview_participant_evaluation_status (evaluation_status);

-- -----------------------------------------------------------------------------
-- 14. En-tete d'evaluation enrichi
-- -----------------------------------------------------------------------------
ALTER TABLE evaluations
    ADD COLUMN interview_participant_id INT UNSIGNED NULL AFTER candidate_interview_id,
    ADD COLUMN evaluation_status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' AFTER recruiter_comment,
    ADD COLUMN submitted_at DATETIME NULL AFTER evaluation_status,
    ADD COLUMN validated_at DATETIME NULL AFTER submitted_at,
    ADD COLUMN validated_by INT UNSIGNED NULL AFTER validated_at,
    ADD COLUMN global_score DOUBLE NULL AFTER validated_by,
    ADD COLUMN global_comment TEXT NULL AFTER global_score,
    ADD KEY idx_evaluations_interview_participant (interview_participant_id),
    ADD KEY idx_evaluations_status (evaluation_status),
    ADD CONSTRAINT fk_evaluations_interview_participant FOREIGN KEY (interview_participant_id)
        REFERENCES interview_participant(id);

-- -----------------------------------------------------------------------------
-- 15. Journal mail enrichi par le contexte de round
-- -----------------------------------------------------------------------------
ALTER TABLE mail_log
    ADD COLUMN application_id INT UNSIGNED NULL AFTER recipient_email,
    ADD COLUMN application_progress_id INT UNSIGNED NULL AFTER application_id,
    ADD COLUMN interview_id INT UNSIGNED NULL AFTER application_progress_id,
    ADD COLUMN decision_id INT UNSIGNED NULL AFTER interview_id,
    ADD COLUMN notification_rule_id INT UNSIGNED NULL AFTER decision_id,
    ADD COLUMN event_code VARCHAR(80) NOT NULL DEFAULT 'LEGACY_UNCLASSIFIED' AFTER notification_rule_id,
    ADD COLUMN requires_confirmation BOOLEAN NOT NULL DEFAULT FALSE AFTER event_code,
    ADD COLUMN confirmed_at DATETIME NULL AFTER requires_confirmation,
    ADD COLUMN confirmed_by INT UNSIGNED NULL AFTER confirmed_at,
    ADD KEY idx_mail_log_application (application_id),
    ADD KEY idx_mail_log_application_progress (application_progress_id),
    ADD KEY idx_mail_log_interview (interview_id),
    ADD KEY idx_mail_log_decision (decision_id),
    ADD KEY idx_mail_log_notification_rule (notification_rule_id),
    ADD KEY idx_mail_log_event_code (event_code),
    ADD CONSTRAINT fk_mail_log_application FOREIGN KEY (application_id) REFERENCES applications(id),
    ADD CONSTRAINT fk_mail_log_application_progress FOREIGN KEY (application_progress_id)
        REFERENCES application_progress(id),
    ADD CONSTRAINT fk_mail_log_interview FOREIGN KEY (interview_id) REFERENCES interviews(id),
    ADD CONSTRAINT fk_mail_log_decision FOREIGN KEY (decision_id) REFERENCES decisions(id),
    ADD CONSTRAINT fk_mail_log_notification_rule FOREIGN KEY (notification_rule_id)
        REFERENCES pipeline_stage_notification_rule(id);