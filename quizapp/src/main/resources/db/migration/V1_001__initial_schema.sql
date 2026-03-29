-- =============================================================================
-- V1_001 : Schéma initial complet de QuizApp
-- Créé le 2025-07-25 — Consolidation de toutes les migrations précédentes
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. user
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `user` (
    id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
    first_name       VARCHAR(100)  NOT NULL,
    last_name        VARCHAR(500)  NOT NULL,
    username         VARCHAR(50)   NOT NULL,
    email            VARCHAR(255)  NOT NULL,
    phone            VARCHAR(20)   NULL,
    password         VARCHAR(255)  NOT NULL,
    is_default_password BOOLEAN    NULL,
    user_role        VARCHAR(9)    NULL,
    is_online        BOOLEAN       NULL,
    is_locked        BOOLEAN       NULL,
    last_connection_date DATETIME  NULL,
    admin_mode       BOOLEAN       DEFAULT FALSE,
    page_size_preference INT       DEFAULT 10,
    created_at       DATETIME      NULL,
    created_by       INT           NULL,
    updated_at       DATETIME      NULL,
    updated_by       INT           NULL,
    is_deleted       BOOLEAN       NULL,
    search_string    TEXT          NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 2. departments
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS departments (
    id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
    department_name  VARCHAR(255)  NOT NULL,
    department_desc  TEXT          NULL,
    created_at       DATETIME      NULL,
    created_by       INT           NULL,
    updated_at       DATETIME      NULL,
    updated_by       INT           NULL,
    is_deleted       BOOLEAN       NULL,
    search_string    TEXT          NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3. specialities
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS specialities (
    id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
    speciality_name  VARCHAR(255)  NOT NULL,
    speciality_desc  TEXT          NULL,
    department_id    INT UNSIGNED  NULL,
    created_at       DATETIME      NULL,
    created_by       INT           NULL,
    updated_at       DATETIME      NULL,
    updated_by       INT           NULL,
    is_deleted       BOOLEAN       NULL,
    search_string    TEXT          NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_specialities_department FOREIGN KEY (department_id) REFERENCES departments(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 4. campaigns
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS campaigns (
    id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
    campaign_title   VARCHAR(255)  NOT NULL,
    campaign_desc    TEXT          NULL,
    campaign_status  VARCHAR(7)    NOT NULL,
    campaign_start   DATETIME      NULL,
    campaign_end     DATETIME      NULL,
    max_apply        INT           NULL,
    all_can_evaluate BOOLEAN       NOT NULL,
    total_questions  INT           NULL,
    is_timed         BOOLEAN       NOT NULL DEFAULT FALSE,
    creator_id       INT UNSIGNED  NULL,
    speciality_id    INT UNSIGNED  NULL,
    created_at       DATETIME      NULL,
    created_by       INT           NULL,
    updated_at       DATETIME      NULL,
    updated_by       INT           NULL,
    is_deleted       BOOLEAN       NULL,
    search_string    TEXT          NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_campaigns_creator    FOREIGN KEY (creator_id)    REFERENCES `user`(id),
    CONSTRAINT fk_campaigns_speciality FOREIGN KEY (speciality_id) REFERENCES specialities(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 5. campaign_crud
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS campaign_crud (
    id                    INT UNSIGNED NOT NULL AUTO_INCREMENT,
    can_update            BOOLEAN      NULL,
    can_delete            BOOLEAN      NULL,
    can_evaluate          BOOLEAN      NULL,
    follow                BOOLEAN      NULL,
    is_admin              BOOLEAN      NULL,
    is_creator            BOOLEAN      NULL,
    can_planify           BOOLEAN      NULL,
    can_accept_pre_screen BOOLEAN      NULL,
    can_accept_final      BOOLEAN      NULL,
    user_id               INT UNSIGNED NULL,
    campaign_id           INT UNSIGNED NULL,
    created_at            DATETIME     NULL,
    created_by            INT          NULL,
    updated_at            DATETIME     NULL,
    updated_by            INT          NULL,
    is_deleted            BOOLEAN      NULL,
    search_string         TEXT         NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_campaign_crud_user     FOREIGN KEY (user_id)     REFERENCES `user`(id),
    CONSTRAINT fk_campaign_crud_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 6. form
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS form (
    id            INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    form_name     VARCHAR(255)  NOT NULL,
    form_desc     TEXT          NULL,
    is_active     BIT           DEFAULT 1,
    campaign_id   INT UNSIGNED  NOT NULL,
    created_at    DATETIME      DEFAULT CURRENT_TIMESTAMP,
    created_by    INT UNSIGNED  NULL,
    updated_at    DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by    INT UNSIGNED  NULL,
    is_deleted    BIT           DEFAULT 0,
    search_string TEXT          NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_form_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 7. form_version
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS form_version (
    id              INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    form_id         INT UNSIGNED  NOT NULL,
    version_number  INT           NOT NULL DEFAULT 1,
    is_published    BIT           DEFAULT 0,
    is_locked       BIT           DEFAULT 0,
    created_at      DATETIME      DEFAULT CURRENT_TIMESTAMP,
    created_by      INT UNSIGNED  NULL,
    updated_at      DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by      INT UNSIGNED  NULL,
    is_deleted      BIT           DEFAULT 0,
    search_string   TEXT          NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_form_version_form FOREIGN KEY (form_id) REFERENCES form(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 8. question
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS question (
    id               INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    question_ref     VARCHAR(36)   NULL,
    question_text    TEXT          NOT NULL,
    question_chrono  INT UNSIGNED  DEFAULT 10,
    question_type    VARCHAR(20)   DEFAULT 'SINGLE_CHOICE',
    score            INT           DEFAULT 1,
    difficulty_level VARCHAR(20)   NULL,
    speciality_id    INT UNSIGNED  NULL,
    created_at       DATETIME      DEFAULT CURRENT_TIMESTAMP,
    created_by       INT UNSIGNED  NULL,
    updated_at       DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by       INT UNSIGNED  NULL,
    is_deleted       BIT           DEFAULT 0,
    search_string    TEXT          NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_question_speciality FOREIGN KEY (speciality_id) REFERENCES specialities(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 9. form_questions (pivot many-to-many)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS form_questions (
    id                INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    form_version_id   INT UNSIGNED  NOT NULL,
    question_id       INT UNSIGNED  NOT NULL,
    question_order    INT           DEFAULT 0,
    chrono_override   INT UNSIGNED  NULL,
    created_at        DATETIME      DEFAULT CURRENT_TIMESTAMP,
    created_by        INT UNSIGNED  NULL,
    updated_at        DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by        INT UNSIGNED  NULL,
    is_deleted        BIT           DEFAULT 0,
    search_string     TEXT          NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_fq_form_version FOREIGN KEY (form_version_id) REFERENCES form_version(id),
    CONSTRAINT fk_fq_question FOREIGN KEY (question_id) REFERENCES question(id),
    UNIQUE KEY uk_fq_version_question (form_version_id, question_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 10. answer
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS answer (
    id            INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    question_id   INT UNSIGNED  NOT NULL,
    answer_text   TEXT          NOT NULL,
    answer_type   VARCHAR(20)   DEFAULT 'FIXED',
    answer_order  INT           DEFAULT 0,
    is_correct    BIT           DEFAULT 0,
    created_at    DATETIME      DEFAULT CURRENT_TIMESTAMP,
    created_by    INT UNSIGNED  NULL,
    updated_at    DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by    INT UNSIGNED  NULL,
    is_deleted    BIT           DEFAULT 0,
    search_string TEXT          NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_answer_question FOREIGN KEY (question_id) REFERENCES question(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 9. source_token
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS source_token (
    id                INT UNSIGNED NOT NULL AUTO_INCREMENT,
    token_string      VARCHAR(6)    NOT NULL,
    source_token_name VARCHAR(100)  NULL,
    expiration_date   DATETIME      NULL,
    campaign_id       INT UNSIGNED  NULL,
    created_at        DATETIME      NULL,
    created_by        INT           NULL,
    updated_at        DATETIME      NULL,
    updated_by        INT           NULL,
    is_deleted        BOOLEAN       NULL,
    search_string     TEXT          NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_source_token_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 10. applications
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS applications (
    id                          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    candidate_first_name        VARCHAR(100)  NOT NULL,
    candidate_last_name         VARCHAR(100)  NOT NULL,
    candidate_email             VARCHAR(255)  NOT NULL,
    candidate_phone             VARCHAR(20)   NULL,
    candidate_cv_path           VARCHAR(1000) NULL,
    candidate_birth_date        DATE          NULL,
    motivation_letter           TEXT          NULL,
    email_verified              BOOLEAN       NOT NULL,
    quiz_score                  INT           NULL,
    total_evaluation_score      FLOAT         NULL,
    total_evaluation_number     INT           NULL,
    total_evaluation_percentage DOUBLE        NULL,
    application_status          VARCHAR(8)    NULL,
    visit_token                 VARCHAR(255)  NULL,
    quiz_token                  VARCHAR(64)   NULL,
    quiz_status                 VARCHAR(9)    NOT NULL,
    quiz_level                  INT           NULL,
    total_questions             INT           NULL,
    quiz_score_percent          INT           NULL,
    time_elapsed                INT           NOT NULL DEFAULT 0,
    interview_date              DATETIME      NULL,
    interview_status            VARCHAR(20)   NULL,
    application_abandoned       BOOLEAN       NULL,
    pre_screen_decision_mail_sent BOOLEAN     NULL,
    final_decision_mail_sent    BOOLEAN       NULL,
    source_token_id             INT UNSIGNED  NULL,
    form_version_id             INT UNSIGNED  NULL,
    created_at                  DATETIME      NULL,
    created_by                  INT           NULL,
    updated_at                  DATETIME      NULL,
    updated_by                  INT           NULL,
    is_deleted                  BOOLEAN       NULL,
    search_string               TEXT          NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_applications_quiz_token (quiz_token),
    CONSTRAINT fk_applications_source_token FOREIGN KEY (source_token_id) REFERENCES source_token(id),
    CONSTRAINT fk_applications_form_version FOREIGN KEY (form_version_id) REFERENCES form_version(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 11. candidate_token
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS candidate_token (
    id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
    token_string     VARCHAR(6)    NULL,
    application_id   INT UNSIGNED  NULL,
    created_at       DATETIME      NULL,
    created_by       INT           NULL,
    updated_at       DATETIME      NULL,
    updated_by       INT           NULL,
    is_deleted       BOOLEAN       NULL,
    search_string    TEXT          NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_candidate_token_application FOREIGN KEY (application_id) REFERENCES applications(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 12. candidate_ask
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS candidate_ask (
    id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
    request_type     VARCHAR(10)   NULL,
    is_verified      BOOLEAN       NOT NULL,
    first_name       VARCHAR(100)  NULL,
    last_name        VARCHAR(100)  NULL,
    new_email        VARCHAR(255)  NULL,
    new_phone        VARCHAR(20)   NULL,
    application_id   INT UNSIGNED  NULL,
    created_at       DATETIME      NULL,
    created_by       INT           NULL,
    updated_at       DATETIME      NULL,
    updated_by       INT           NULL,
    is_deleted       BOOLEAN       NULL,
    search_string    TEXT          NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_candidate_ask_application FOREIGN KEY (application_id) REFERENCES applications(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 13. candidate_answer
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS candidate_answer (
    id                INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    application_id    INT UNSIGNED  NOT NULL,
    question_id       INT UNSIGNED  NOT NULL,
    answer_id         INT UNSIGNED  NULL,
    free_text_response TEXT         NULL,
    is_selected       BIT           DEFAULT 0,
    created_at        DATETIME      DEFAULT CURRENT_TIMESTAMP,
    created_by        INT UNSIGNED  NULL,
    updated_at        DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by        INT UNSIGNED  NULL,
    is_deleted        BIT           DEFAULT 0,
    search_string     TEXT          NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_ca_application FOREIGN KEY (application_id) REFERENCES applications(id),
    CONSTRAINT fk_ca_question FOREIGN KEY (question_id) REFERENCES question(id),
    CONSTRAINT fk_ca_answer FOREIGN KEY (answer_id) REFERENCES answer(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 14. interviews
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS interviews (
    id                        INT UNSIGNED NOT NULL AUTO_INCREMENT,
    interview_location        VARCHAR(255)  NULL,
    interview_date            DATETIME      NOT NULL,
    interview_status          VARCHAR(20)   NOT NULL,
    meet_link                 VARCHAR(500)  NULL,
    interview_evaluations_link VARCHAR(8)   NULL,
    interview_note            TEXT          NULL,
    interview_mail_sent       BOOLEAN       NOT NULL DEFAULT FALSE,
    interview_type            VARCHAR(20)   NOT NULL,
    started_at                DATETIME      NULL,
    ended_at                  DATETIME      NULL,
    evaluation_score          INT           NULL,
    evaluation_number         INT           NULL,
    evaluation_percentage     DOUBLE        NULL,
    campaign_id               INT UNSIGNED  NULL,
    application_id            INT UNSIGNED  NULL,
    created_at                DATETIME      NULL,
    created_by                INT           NULL,
    updated_at                DATETIME      NULL,
    updated_by                INT           NULL,
    is_deleted                BOOLEAN       NULL,
    search_string             TEXT          NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_interviews_campaign    FOREIGN KEY (campaign_id)    REFERENCES campaigns(id),
    CONSTRAINT fk_interviews_application FOREIGN KEY (application_id) REFERENCES applications(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 15. interview_crud
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS interview_crud (
    id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
    can_update       BOOLEAN       NULL,
    can_delete       BOOLEAN       NULL,
    can_evaluate     BOOLEAN       NULL,
    is_admin         BOOLEAN       NOT NULL DEFAULT FALSE,
    follow           BOOLEAN       NULL,
    is_online        BOOLEAN       NULL,
    has_finished     BOOLEAN       NULL,
    last_ping_at     DATETIME      NULL,
    user_id          INT UNSIGNED  NULL,
    interview_id     INT UNSIGNED  NULL,
    created_at       DATETIME      NULL,
    created_by       INT           NULL,
    updated_at       DATETIME      NULL,
    updated_by       INT           NULL,
    is_deleted       BOOLEAN       NULL,
    search_string    TEXT          NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_interview_crud_user      FOREIGN KEY (user_id)      REFERENCES `user`(id),
    CONSTRAINT fk_interview_crud_interview FOREIGN KEY (interview_id) REFERENCES interviews(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 16. candidate_interview
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS candidate_interview (
    id                INT UNSIGNED NOT NULL AUTO_INCREMENT,
    interview_start   DATETIME      NULL,
    interview_duration INT          NULL,
    application_id    INT UNSIGNED  NULL,
    interview_id      INT UNSIGNED  NULL,
    created_at        DATETIME      NULL,
    created_by        INT           NULL,
    updated_at        DATETIME      NULL,
    updated_by        INT           NULL,
    is_deleted        BOOLEAN       NULL,
    search_string     TEXT          NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_ci_application FOREIGN KEY (application_id) REFERENCES applications(id),
    CONSTRAINT fk_ci_interview   FOREIGN KEY (interview_id)   REFERENCES interviews(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 17. evaluations
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS evaluations (
    id                     INT UNSIGNED NOT NULL AUTO_INCREMENT,
    candidate_mark         INT           NULL,
    recruiter_comment      TEXT          NULL,
    candidate_interview_id INT UNSIGNED  NULL,
    created_at             DATETIME      NULL,
    created_by             INT           NULL,
    updated_at             DATETIME      NULL,
    updated_by             INT           NULL,
    is_deleted             BOOLEAN       NULL,
    search_string          TEXT          NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_evaluations_ci FOREIGN KEY (candidate_interview_id) REFERENCES candidate_interview(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 18. notifications
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    id                INT UNSIGNED NOT NULL AUTO_INCREMENT,
    notif_type        VARCHAR(100)  NULL,
    notif_actor       INT           NULL,
    notif_link        VARCHAR(255)  NULL,
    is_read           BOOLEAN       NULL,
    object_table_name VARCHAR(100)  NULL,
    object_table_id   INT           NULL,
    user_id           INT UNSIGNED  NULL,
    created_at        DATETIME      NULL,
    created_by        INT           NULL,
    updated_at        DATETIME      NULL,
    updated_by        INT           NULL,
    is_deleted        BOOLEAN       NULL,
    search_string     TEXT          NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES `user`(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 19. decisions
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS decisions (
    id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
    decision_type    VARCHAR(50)   NOT NULL,
    is_cancel        BOOLEAN       NOT NULL,
    application_id   INT UNSIGNED  NULL,
    user_id          INT UNSIGNED  NULL,
    created_at       DATETIME      NULL,
    created_by       INT           NULL,
    updated_at       DATETIME      NULL,
    updated_by       INT           NULL,
    is_deleted       BOOLEAN       NULL,
    search_string    TEXT          NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_decisions_application FOREIGN KEY (application_id) REFERENCES applications(id),
    CONSTRAINT fk_decisions_user        FOREIGN KEY (user_id)        REFERENCES `user`(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 20. email_verification_tokens
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
    email            VARCHAR(255)  NOT NULL,
    token            VARCHAR(255)  NOT NULL,
    token_type       VARCHAR(255)  NOT NULL DEFAULT 'APPLICATION_VERIFICATION',
    expires_at       DATETIME      NOT NULL,
    is_used          BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at       DATETIME      NOT NULL,
    used_at          DATETIME      NULL,
    application_id   INT UNSIGNED  NULL,
    user_id          INT UNSIGNED  NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_evt_token (token),
    CONSTRAINT fk_evt_application FOREIGN KEY (application_id) REFERENCES applications(id),
    CONSTRAINT fk_evt_user        FOREIGN KEY (user_id)        REFERENCES `user`(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- SEED DATA
-- =============================================================================

-- Départements
INSERT INTO departments (id, department_name, department_desc, created_at, is_deleted, search_string)
VALUES
    (1, 'Informatique',  'Département Informatique et Technologies',  NOW(), FALSE, 'informatique technologies'),
    (2, 'Marketing',     'Département Marketing et Communication',    NOW(), FALSE, 'marketing communication'),
    (3, 'Finance',       'Département Finance et Comptabilité',       NOW(), FALSE, 'finance comptabilité'),
    (4, 'Ressources Humaines', 'Département des Ressources Humaines', NOW(), FALSE, 'ressources humaines rh');

-- Spécialités
INSERT INTO specialities (id, speciality_name, speciality_desc, department_id, created_at, is_deleted, search_string)
VALUES
    (1, 'Développement Web',      'Développement d''applications web',          1, NOW(), FALSE, 'développement web'),
    (2, 'Développement Mobile',   'Développement d''applications mobiles',      1, NOW(), FALSE, 'développement mobile'),
    (3, 'Data Science',           'Science des données et IA',                  1, NOW(), FALSE, 'data science ia'),
    (4, 'DevOps',                 'Infrastructure et déploiement',              1, NOW(), FALSE, 'devops infrastructure'),
    (5, 'Marketing Digital',      'Marketing en ligne et réseaux sociaux',      2, NOW(), FALSE, 'marketing digital'),
    (6, 'Comptabilité',           'Comptabilité générale et analytique',        3, NOW(), FALSE, 'comptabilité'),
    (7, 'Recrutement',            'Gestion du recrutement et des talents',      4, NOW(), FALSE, 'recrutement talents');

-- Utilisateur SUPER  (mot de passe : Super2025!)
INSERT INTO `user` (id, first_name, last_name, username, email, phone, password,
                    is_default_password, user_role, is_online, is_locked,
                    admin_mode, page_size_preference,
                    created_at, is_deleted, search_string)
VALUES (1, 'Super', 'Admin', 'superadmin', 'super@synelia.tech', NULL,
        '$2b$12$BplBUJnhDc.Cy0th1Paw4eFC412y15Myxkp9Q1rRcvLIjoqhs0U0S',
        FALSE, 'SUPER', FALSE, FALSE,
        FALSE, 10,
        NOW(), FALSE, 'super admin superadmin super@synelia.tech');
