-- =============================================================================
-- V1_008 : Tables pipeline (template, stage, application_progress)
-- + Ajout FK pipeline_template_id sur campaigns
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. pipeline_template — Modèle de pipeline réutilisable
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pipeline_template (
    id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
    template_name    VARCHAR(255)  NOT NULL,
    template_desc    TEXT          NULL,
    is_default       BIT(1)        NOT NULL DEFAULT 0,
    is_active        BIT(1)        NOT NULL DEFAULT 1,
    is_locked        BIT(1)        NOT NULL DEFAULT 0,
    created_at       DATETIME      NULL,
    created_by       INT           NULL,
    updated_at       DATETIME      NULL,
    updated_by       INT           NULL,
    is_deleted       BIT(1)        NOT NULL DEFAULT 0,
    search_string    TEXT          NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 2. pipeline_stage — Étapes d'un template de pipeline
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pipeline_stage (
    id                    INT UNSIGNED NOT NULL AUTO_INCREMENT,
    pipeline_template_id  INT UNSIGNED NOT NULL,
    stage_type            VARCHAR(50)   NOT NULL,
    stage_label           VARCHAR(255)  NOT NULL,
    stage_order           INT           NOT NULL,
    is_required           BIT(1)        NOT NULL DEFAULT 1,
    is_eliminatory        BIT(1)        NOT NULL DEFAULT 0,
    config_json           TEXT          NULL,
    created_at            DATETIME      NULL,
    created_by            INT           NULL,
    updated_at            DATETIME      NULL,
    updated_by            INT           NULL,
    is_deleted            BIT(1)        NOT NULL DEFAULT 0,
    search_string         TEXT          NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_stage_order (pipeline_template_id, stage_order),
    CONSTRAINT fk_stage_template FOREIGN KEY (pipeline_template_id) REFERENCES pipeline_template(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3. application_progress — Avancement d'un candidat dans le pipeline
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS application_progress (
    id                 INT UNSIGNED NOT NULL AUTO_INCREMENT,
    application_id     INT UNSIGNED NOT NULL,
    pipeline_stage_id  INT UNSIGNED NOT NULL,
    progress_status    VARCHAR(20)   NOT NULL DEFAULT 'PENDING',
    started_at         DATETIME      NULL,
    completed_at       DATETIME      NULL,
    score              DOUBLE        NULL,
    notes              TEXT          NULL,
    decided_by         INT UNSIGNED  NULL,
    created_at         DATETIME      NULL,
    created_by         INT           NULL,
    updated_at         DATETIME      NULL,
    updated_by         INT           NULL,
    is_deleted         BIT(1)        NOT NULL DEFAULT 0,
    search_string      TEXT          NULL,
    PRIMARY KEY (id),
    KEY idx_progress_application (application_id),
    UNIQUE KEY uk_progress_app_stage (application_id, pipeline_stage_id),
    CONSTRAINT fk_progress_application FOREIGN KEY (application_id) REFERENCES applications(id),
    CONSTRAINT fk_progress_stage FOREIGN KEY (pipeline_stage_id) REFERENCES pipeline_stage(id),
    CONSTRAINT fk_progress_decided_by FOREIGN KEY (decided_by) REFERENCES `user`(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 4. Ajout FK pipeline_template_id sur campaigns
-- -----------------------------------------------------------------------------
ALTER TABLE campaigns ADD COLUMN pipeline_template_id INT UNSIGNED NULL AFTER is_timed;
ALTER TABLE campaigns ADD CONSTRAINT fk_campaigns_pipeline_template FOREIGN KEY (pipeline_template_id) REFERENCES pipeline_template(id);
