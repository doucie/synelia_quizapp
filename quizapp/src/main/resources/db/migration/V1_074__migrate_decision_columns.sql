-- =============================================================================
-- V1_074 : Ancrage mono-occurrence des decisions + retrait is_cancel/decided_by
--   Porte sur : decisions.is_cancel (remplace par decision_mode) ;
--     decisions.application_id / pipeline_stage_id (remplaces par
--     application_progress_id) ; application_progress.decided_by (remplace par
--     validated_by / skipped_by / reopened_by).
--   PREREQUIS : V1_073 appliquee (phase 3) ET phase 4 lots 1-5 verrouilles
--     (backend Decision sans application/pipelineStage ; front sans
--     isCancel/applicationId/pipelineStageId/decidedBy).
--   ORDRE STRICT : backfills PUIS DROP des FK (dont la composite
--     fk_decisions_progress_app portant sur application_progress_id +
--     application_id) PUIS DROP des colonnes.
--   ATTENTION : DDL MySQL NON transactionnel (chaque ALTER auto-commit). A
--   tester sur une copie de la BD avant application sur la BD partagee
--   (Flyway: une migration appliquee est immuable).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0. COMPTAGE AVANT : etat des colonnes legacy ciblees
-- -----------------------------------------------------------------------------
SELECT 'decisions' AS table_name,
       COUNT(*) AS total,
       SUM(CASE WHEN is_cancel = 1 THEN 1 ELSE 0 END) AS is_cancel_1,
       SUM(CASE WHEN decision_mode = 'CANCEL' THEN 1 ELSE 0 END) AS decision_mode_cancel,
       SUM(CASE WHEN application_id IS NULL THEN 1 ELSE 0 END) AS application_id_null,
       SUM(CASE WHEN pipeline_stage_id IS NULL THEN 1 ELSE 0 END) AS pipeline_stage_id_null,
       SUM(CASE WHEN application_progress_id IS NULL THEN 1 ELSE 0 END) AS application_progress_id_null
FROM decisions;

SELECT 'application_progress' AS table_name,
       COUNT(*) AS total,
       SUM(CASE WHEN decided_by IS NULL THEN 1 ELSE 0 END) AS decided_by_null,
       SUM(CASE WHEN validated_by IS NULL THEN 1 ELSE 0 END) AS validated_by_null,
       SUM(CASE WHEN skipped_by IS NULL THEN 1 ELSE 0 END) AS skipped_by_null,
       SUM(CASE WHEN reopened_by IS NULL THEN 1 ELSE 0 END) AS reopened_by_null
FROM application_progress;

-- -----------------------------------------------------------------------------
-- 1. GARDE-FOU : verifie la presence des FK et colonnes ciblees avant les
--    backfills, et l'absence d'ambiguite du backfill application_progress_id
--    (aucune decision ne doit matcher plusieurs occurrences distinctes)
--    (echec explicite si l'etat ne correspond pas au schema attendu)
-- -----------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS v1_074_assert_backfill_ready;
DELIMITER //
CREATE PROCEDURE v1_074_assert_backfill_ready()
BEGIN
    DECLARE nb_missing INT;

    SELECT COUNT(*) INTO nb_missing
    FROM information_schema.TABLE_CONSTRAINTS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'decisions'
      AND CONSTRAINT_TYPE = 'FOREIGN KEY'
      AND CONSTRAINT_NAME IN ('fk_decisions_progress_app', 'fk_decisions_application', 'fk_decisions_pipeline_stage');
    IF nb_missing <> 3 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'V1_074: FKs decisions (fk_decisions_progress_app/fk_decisions_application/fk_decisions_pipeline_stage) introuvables';
    END IF;

    SELECT COUNT(*) INTO nb_missing
    FROM information_schema.TABLE_CONSTRAINTS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'application_progress'
      AND CONSTRAINT_TYPE = 'FOREIGN KEY'
      AND CONSTRAINT_NAME = 'fk_progress_decided_by';
    IF nb_missing <> 1 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'V1_074: FK application_progress (fk_progress_decided_by) introuvable';
    END IF;

    SELECT COUNT(*) INTO nb_missing
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND ( (TABLE_NAME = 'decisions'
             AND COLUMN_NAME IN ('is_cancel', 'application_id', 'pipeline_stage_id', 'application_progress_id'))
         OR (TABLE_NAME = 'application_progress'
             AND COLUMN_NAME IN ('decided_by', 'validated_by', 'skipped_by', 'reopened_by')) );
    IF nb_missing <> 8 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'V1_074: colonnes ciblees manquantes ou deja migrees (etat inattendu)';
    END IF;

    IF EXISTS (
        SELECT 1 FROM (
            SELECT d.id
            FROM decisions d
            JOIN application_progress ap ON ap.application_id = d.application_id
            JOIN pipeline_stage ps ON ps.id = ap.pipeline_stage_id
            WHERE d.application_progress_id IS NULL
              AND ( (d.decision_type LIKE 'PRE_SCREEN%' AND ps.stage_type = 'PRESELECTION')
                 OR (d.decision_type LIKE 'FINAL%'     AND ps.stage_type = 'DECISION') )
            GROUP BY d.id
            HAVING COUNT(DISTINCT ap.id) > 1
        ) x
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'V1_074: backfill application_progress_id ambigu (plusieurs occurrences par decision)';
    END IF;
END//
DELIMITER ;
CALL v1_074_assert_backfill_ready();
DROP PROCEDURE v1_074_assert_backfill_ready;

-- -----------------------------------------------------------------------------
-- 2. BACKFILL decision_mode depuis is_cancel (securite : decision_mode deja
--    normallise a 90%, seuls les residus is_cancel=1 encore en STANDARD passent)
-- -----------------------------------------------------------------------------
UPDATE decisions
SET decision_mode = 'CANCEL'
WHERE is_cancel = 1
  AND decision_mode <> 'CANCEL';

-- -----------------------------------------------------------------------------
-- 3. BACKFILL decisions.application_progress_id REEL (en BD: 2/2 lignes NULL)
--    Resolution de l'occurrence pipeline via application_id + decision_type
--    (match de stage_type : PRE_SCREEN* -> PRESELECTION ; FINAL* -> DECISION).
--    Seules les resolutions UNAMBIGUES sont appliquees ; les decisions
--    irresolues echouent la garde post-backfill (section 5).
-- -----------------------------------------------------------------------------
UPDATE decisions d
JOIN (
    SELECT d2.id AS decision_id,
           COUNT(DISTINCT ap.id) AS nb_progress,
           MIN(ap.id) AS progress_id
    FROM decisions d2
    JOIN application_progress ap ON ap.application_id = d2.application_id
    JOIN pipeline_stage ps ON ps.id = ap.pipeline_stage_id
    WHERE d2.application_progress_id IS NULL
      AND ( (d2.decision_type LIKE 'PRE_SCREEN%' AND ps.stage_type = 'PRESELECTION')
         OR (d2.decision_type LIKE 'FINAL%'     AND ps.stage_type = 'DECISION') )
    GROUP BY d2.id
) m ON m.decision_id = d.id
SET d.application_progress_id = m.progress_id
WHERE d.application_progress_id IS NULL
  AND m.nb_progress = 1;

-- -----------------------------------------------------------------------------
-- 4. BACKFILL application_progress.decided_by -> validated_by / skipped_by
--    Preference via decisions.user_id quand une decision pointe le round
--    (colonne a dropper), sinon conservation directe de decided_by.
--    Garantie : aucune perte de donnees (garde de non-perte ci-dessous).
-- -----------------------------------------------------------------------------
UPDATE application_progress ap
LEFT JOIN (
    SELECT application_progress_id, MIN(user_id) AS user_id
    FROM decisions
    WHERE application_progress_id IS NOT NULL
      AND user_id IS NOT NULL
    GROUP BY application_progress_id
) d ON d.application_progress_id = ap.id
SET ap.validated_by = COALESCE(d.user_id, ap.decided_by)
WHERE ap.decided_by IS NOT NULL
  AND ap.progress_status IN ('PASSED', 'FAILED', 'COMPLETED', 'AWAITING_VALIDATION', 'IN_PROGRESS');

UPDATE application_progress ap
SET ap.skipped_by = ap.decided_by
WHERE ap.decided_by IS NOT NULL
  AND ap.progress_status = 'SKIPPED';

-- garde de non-perte : toute decided_by restante non recopiee bascule sur validated_by
UPDATE application_progress ap
SET ap.validated_by = ap.decided_by
WHERE ap.decided_by IS NOT NULL
  AND ap.validated_by IS NULL
  AND ap.skipped_by IS NULL;

-- -----------------------------------------------------------------------------
-- 5. GARDE-FOU POST-BACKFILL : plus aucune decision sans ancre ; aucune
--    decided_by non recopiee (echec explicite sinon -> migration abandonnee)
-- -----------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS v1_074_assert_backfill_done;
DELIMITER //
CREATE PROCEDURE v1_074_assert_backfill_done()
BEGIN
    IF EXISTS (SELECT 1 FROM decisions WHERE application_progress_id IS NULL) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'V1_074: decisions restantes sans application_progress_id (backfill incomplet)';
    END IF;
    IF EXISTS (SELECT 1 FROM application_progress
               WHERE decided_by IS NOT NULL
                 AND validated_by IS NULL
                 AND skipped_by IS NULL) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'V1_074: decided_by non recopiee (perte de donnees possible)';
    END IF;
END//
DELIMITER ;
CALL v1_074_assert_backfill_done();
DROP PROCEDURE v1_074_assert_backfill_done;

-- -----------------------------------------------------------------------------
-- 6. DROP DES FK (ordre strict : la composite fk_decisions_progress_app porte
--    sur application_progress_id + application_id -> a retirer avant le DROP
--    de decisions.application_id)
-- -----------------------------------------------------------------------------
ALTER TABLE decisions DROP FOREIGN KEY fk_decisions_progress_app;
ALTER TABLE decisions DROP FOREIGN KEY fk_decisions_application;
ALTER TABLE decisions DROP FOREIGN KEY fk_decisions_pipeline_stage;
ALTER TABLE application_progress DROP FOREIGN KEY fk_progress_decided_by;

-- index composite devenu obsolete (application_id va disparaitre)
ALTER TABLE decisions DROP INDEX idx_decisions_progress_app;

-- -----------------------------------------------------------------------------
-- 7. DROP DES COLONNES + ancrage mono-ancre (NOT NULL + FK)
--    decisions : is_cancel, application_id, pipeline_stage_id
--    application_progress : decided_by
--    (fk_decisions_user / fk_decisions_cancels / fk_decisions_progress sont
--     CONSERVEES ; idx_decisions_cancels / idx_decisions_progress sont CONSERVES)
-- -----------------------------------------------------------------------------
ALTER TABLE decisions
    DROP COLUMN is_cancel,
    DROP COLUMN application_id,
    DROP COLUMN pipeline_stage_id;

ALTER TABLE application_progress
    DROP COLUMN decided_by;

ALTER TABLE decisions
    MODIFY application_progress_id INT UNSIGNED NOT NULL,
    ADD KEY idx_decisions_progress (application_progress_id),
    ADD CONSTRAINT fk_decisions_progress FOREIGN KEY (application_progress_id) REFERENCES application_progress(id);

-- -----------------------------------------------------------------------------
-- 8. COMPTAGE APRES : controle que les colonnes legacy ont disparu et que les
--    conservations attendues sont en place
-- -----------------------------------------------------------------------------
SELECT 'colonnes_restantes' AS etat,
       COUNT(*) AS nb_colonnes_legacy_encore_presentes
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND ( (TABLE_NAME = 'decisions'
         AND COLUMN_NAME IN ('is_cancel', 'application_id', 'pipeline_stage_id'))
     OR (TABLE_NAME = 'application_progress'
         AND COLUMN_NAME = 'decided_by') );

-- Conservations attendues
SELECT 'decisions.application_progress_id' AS colonne_conservee,
       COUNT(*) AS nb
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'decisions' AND COLUMN_NAME = 'application_progress_id';

SELECT 'decisions.decision_mode' AS colonne_conservee,
       COUNT(*) AS nb
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'decisions' AND COLUMN_NAME = 'decision_mode';

SELECT 'application_progress.validated_by' AS colonne_conservee,
       COUNT(*) AS nb
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'application_progress' AND COLUMN_NAME = 'validated_by';

SELECT 'application_progress.skipped_by' AS colonne_conservee,
       COUNT(*) AS nb
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'application_progress' AND COLUMN_NAME = 'skipped_by';

SELECT 'application_progress.reopened_by' AS colonne_conservee,
       COUNT(*) AS nb
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'application_progress' AND COLUMN_NAME = 'reopened_by';

SELECT 'fk_decisions_progress (nouvelle FK mono-ancre)' AS contrainte_conservee,
       COUNT(*) AS nb
FROM information_schema.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'decisions' AND CONSTRAINT_NAME = 'fk_decisions_progress';
