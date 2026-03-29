-- =============================================================================
-- V1_003 : Migration vers le système Form/FormVersion/FormQuestions
-- Renommage tables, colonnes, ajout tables manquantes
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Renommer les tables (pluriel -> singulier)
-- -----------------------------------------------------------------------------
RENAME TABLE questions TO question;
RENAME TABLE answers TO answer;
RENAME TABLE candidate_answers TO candidate_answer;

-- -----------------------------------------------------------------------------
-- 2. Renommer les colonnes (question_content -> question_text, etc.)
-- -----------------------------------------------------------------------------
ALTER TABLE question
    CHANGE COLUMN question_content question_text TEXT NOT NULL;

ALTER TABLE answer
    CHANGE COLUMN answer_content answer_text TEXT NOT NULL;

-- -----------------------------------------------------------------------------
-- 3. Ajouter colonnes manquantes à question
-- -----------------------------------------------------------------------------
ALTER TABLE question
    ADD COLUMN question_ref VARCHAR(36) NULL AFTER id,
    ADD COLUMN score INT DEFAULT 1 AFTER question_type,
    ADD COLUMN difficulty_level VARCHAR(20) NULL AFTER score;

-- Mettre un chrono par défaut si NULL
ALTER TABLE question
    ALTER COLUMN question_chrono SET DEFAULT 10;

-- Mettre un type par défaut
ALTER TABLE question
    ALTER COLUMN question_type SET DEFAULT 'SINGLE_CHOICE';

-- -----------------------------------------------------------------------------
-- 4. Ajouter colonnes manquantes à candidate_answer
-- -----------------------------------------------------------------------------
ALTER TABLE candidate_answer
    ADD COLUMN question_id INT UNSIGNED NOT NULL AFTER application_id,
    ADD COLUMN free_text_response TEXT NULL AFTER answer_id;

-- Ajouter FK pour question sur candidate_answer
ALTER TABLE candidate_answer
    ADD CONSTRAINT fk_ca_question FOREIGN KEY (question_id) REFERENCES question(id);

-- -----------------------------------------------------------------------------
-- 5. Créer table form
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
-- 6. Créer table form_version
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
-- 7. Créer table form_questions
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
-- 8. Ajouter form_version_id à applications
-- -----------------------------------------------------------------------------
ALTER TABLE applications
    ADD COLUMN form_version_id INT UNSIGNED NULL AFTER source_token_id,
    ADD CONSTRAINT fk_applications_form_version FOREIGN KEY (form_version_id) REFERENCES form_version(id);

-- -----------------------------------------------------------------------------
-- 9. Supprimer l'ancienne table campaign_questions
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS campaign_questions;
