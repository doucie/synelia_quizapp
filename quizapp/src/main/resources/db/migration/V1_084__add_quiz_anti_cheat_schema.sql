-- =============================================================================
-- V1_084 : Évolution 450 Vague 2 — Règles anti-triche du quiz (chantiers B/C)
--   - quiz_anti_cheat_event : journal de chaque événement détecté côté candidat.
--   - application_quiz_attempt : compteurs tab_switch / fullscreen_exit /
--     cheat_flag (la politique portée par les champs dormeurs screening_*).
--   - app_config : configuration globale anti-triche (interrupteur + politique
--     WARN/FLAG/FAIL + seuils + blocages d'interface).
--   - campaigns.anti_cheat_enabled : override par campagne, NULL = suit le
--     global (cohérent avec is_timed / time_all_forms).
-- Migration strictement additive.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Journal des événements anti-triche (B.5)
-- -----------------------------------------------------------------------------
CREATE TABLE quiz_anti_cheat_event (
    id                         INT UNSIGNED NOT NULL AUTO_INCREMENT,
    application_quiz_attempt_id INT UNSIGNED NOT NULL,
    event_type                 VARCHAR(30)  NOT NULL,
    occurred_at                DATETIME     NOT NULL,
    metadata                   VARCHAR(500) NULL,
    created_by                 INT UNSIGNED NULL,
    created_at                 DATETIME     NULL,
    updated_by                 INT UNSIGNED NULL,
    updated_at                 DATETIME     NULL,
    is_deleted                 TINYINT(1)   NOT NULL DEFAULT 0,
    search_string              TEXT NULL,
    PRIMARY KEY (id),
    KEY idx_ace_attempt (application_quiz_attempt_id),
    CONSTRAINT fk_ace_attempt FOREIGN KEY (application_quiz_attempt_id)
        REFERENCES application_quiz_attempt(id)
);

-- -----------------------------------------------------------------------------
-- 2. Compteurs anti-triche sur la tentative (B.1/B.3)
-- -----------------------------------------------------------------------------
ALTER TABLE application_quiz_attempt
    ADD COLUMN tab_switch_count      INT UNSIGNED NOT NULL DEFAULT 0 AFTER screening_result,
    ADD COLUMN fullscreen_exit_count INT UNSIGNED NOT NULL DEFAULT 0 AFTER tab_switch_count,
    ADD COLUMN cheat_flag_count      INT UNSIGNED NOT NULL DEFAULT 0 AFTER fullscreen_exit_count;

-- -----------------------------------------------------------------------------
-- 3. Configuration globale anti-triche (chantier C)
-- -----------------------------------------------------------------------------
ALTER TABLE app_config
    ADD COLUMN anti_cheat_enabled      TINYINT(1)   NOT NULL DEFAULT 0 AFTER candidate_accounts_enabled,
    ADD COLUMN screening_policy        VARCHAR(10)  NOT NULL DEFAULT 'WARN' AFTER anti_cheat_enabled,
    ADD COLUMN tab_switch_max_warnings INT UNSIGNED NOT NULL DEFAULT 3 AFTER screening_policy,
    ADD COLUMN tab_switch_max_actions  INT UNSIGNED NOT NULL DEFAULT 5 AFTER tab_switch_max_warnings,
    ADD COLUMN fullscreen_required     TINYINT(1)   NOT NULL DEFAULT 0 AFTER tab_switch_max_actions,
    ADD COLUMN block_shortcuts         TINYINT(1)   NOT NULL DEFAULT 0 AFTER fullscreen_required,
    ADD COLUMN block_copy_paste        TINYINT(1)   NOT NULL DEFAULT 0 AFTER block_shortcuts;

-- -----------------------------------------------------------------------------
-- 4. Override par campagne (chantier C)
-- -----------------------------------------------------------------------------
ALTER TABLE campaigns
    ADD COLUMN anti_cheat_enabled TINYINT(1) NULL AFTER time_all_forms;
