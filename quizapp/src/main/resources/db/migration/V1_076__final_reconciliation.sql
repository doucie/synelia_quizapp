-- =============================================================================
-- V1_076 : Reconciliation finale (Phase 6)
--   Backfills de valeurs enum legacy vers le vocabulaire cible post-420 :
--     - application_quiz_attempt.quiz_status : DONE -> COMPLETED
--     - interviews.interview_status          : mapping semantique actuel->cible
--         (PENDING->SCHEDULED, SCHEDULED->SCHEDULED, STARTED->IN_PROGRESS,
--          OVER->CLOSED, POSTPONED->CANCELLED, ARCHIVED->CLOSED,
--          COMPLETED legacy -> CLOSED)
--     - application_progress.progress_status : PASSED -> COMPLETED
--         (AWAITING_VALIDATION = nouveau statut cible, 0 backfill)
--     - pipeline_stage.stage_type            : EVALUATION -> DECISION
--         (EVALUATION n'est plus un stage top-level cible ; remap des 2 etapes)
--         + pipeline_stage_notification_rule.outcome_code aligne sur la nouvelle
--         valeur du stage_type (règle 8 EVALUATION, soft-deleted -> DECISION).
--   PREREQUIS : V1_075 appliquee (phase 5) ; decisions BA 2026-08-08.
--   ORDRE STRICT : garde-fous (comptage avant) PUIS backfills PUIS garde-fous
--     post-backfill PUIS comptage apres.
--   ATTENTION : DDL MySQL NON transactionnel (chaque UPDATE auto-commit). A
--   tester sur une copie de la BD avant application sur la BD partagee
--   (Flyway: une migration appliquee est immuable).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0. COMPTAGE AVANT : volumes reels des valeurs legacy ciblees
-- -----------------------------------------------------------------------------
SELECT 'application_quiz_attempt' AS table_name,
       quiz_status,
       COUNT(*) AS nb
FROM application_quiz_attempt
GROUP BY quiz_status;

SELECT 'interviews' AS table_name,
       interview_status,
       COUNT(*) AS nb
FROM interviews
GROUP BY interview_status;

SELECT 'application_progress' AS table_name,
       progress_status,
       COUNT(*) AS nb
FROM application_progress
GROUP BY progress_status;

SELECT 'pipeline_stage' AS table_name,
       stage_type,
       COUNT(*) AS nb
FROM pipeline_stage
GROUP BY stage_type;

SELECT 'pipeline_stage_notification_rule' AS table_name,
       outcome_code,
       COUNT(*) AS nb
FROM pipeline_stage_notification_rule
WHERE trigger_code = 'STAGE_EMAIL'
GROUP BY outcome_code;

-- -----------------------------------------------------------------------------
-- 1. GARDE-FOU : verifie que les valeurs legacy a migrer existent bel et bien
--    (echec explicite si le schema de donnees ne correspond pas a l'etat attendu)
-- -----------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS v1_076_assert_backfill_ready;
DELIMITER //
CREATE PROCEDURE v1_076_assert_backfill_ready()
BEGIN
    -- quiz_status legacy DONE
    IF EXISTS (
        SELECT 1
        FROM (SELECT 'DONE' AS quiz_status) expected
        LEFT JOIN (SELECT DISTINCT quiz_status FROM application_quiz_attempt) actual
               ON actual.quiz_status = expected.quiz_status
        WHERE actual.quiz_status IS NULL
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'V1_076: quiz_status legacy DONE absent (etat inattendu)';
    END IF;

    -- interview_status : toute valeur presente doit appartenir au vocabulaire
    -- legacy+cible connu (aucune valeur inconnue ne doit exister)
    IF EXISTS (
        SELECT 1
        FROM interviews
        WHERE interview_status NOT IN ('PENDING','SCHEDULED','STARTED','OVER','POSTPONED','ARCHIVED','COMPLETED')
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'V1_076: valeur interview_status inconnue (etat inattendu)';
    END IF;

    -- progress_status legacy PASSED
    IF EXISTS (
        SELECT 1
        FROM (SELECT 'PASSED' AS progress_status) expected
        LEFT JOIN (SELECT DISTINCT progress_status FROM application_progress) actual
               ON actual.progress_status = expected.progress_status
        WHERE actual.progress_status IS NULL
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'V1_076: progress_status legacy PASSED absent (etat inattendu)';
    END IF;

    -- stage_type legacy EVALUATION
    IF EXISTS (
        SELECT 1
        FROM (SELECT 'EVALUATION' AS stage_type) expected
        LEFT JOIN (SELECT DISTINCT stage_type FROM pipeline_stage) actual
               ON actual.stage_type = expected.stage_type
        WHERE actual.stage_type IS NULL
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'V1_076: stage_type legacy EVALUATION absent (etat inattendu)';
    END IF;
END//
DELIMITER ;
CALL v1_076_assert_backfill_ready();
DROP PROCEDURE v1_076_assert_backfill_ready;

-- -----------------------------------------------------------------------------
-- 2. BACKFILLS DES VALEURS ENUM LEGACY
-- -----------------------------------------------------------------------------

-- 2.1 application_quiz_attempt.quiz_status : DONE -> COMPLETED
--     DONE est une valeur legacy absente de l'enum actuel (PENDING/STARTED/
--     COMPLETED) ET de la cible (PENDING/STARTED/COMPLETED/EXPIRED/CANCELLED) :
--     elle represente une tentative terminee -> COMPLETED.
UPDATE application_quiz_attempt
SET quiz_status = 'COMPLETED',
    updated_at  = COALESCE(updated_at, NOW())
WHERE quiz_status = 'DONE';

-- 2.2 interviews.interview_status : mapping semantique actuel -> cible
--     (PENDING->SCHEDULED, SCHEDULED->SCHEDULED, STARTED->IN_PROGRESS,
--      OVER->CLOSED, POSTPONED->CANCELLED, ARCHIVED->CLOSED,
--      COMPLETED legacy -> CLOSED)
UPDATE interviews
SET interview_status = CASE interview_status
        WHEN 'PENDING'    THEN 'SCHEDULED'
        WHEN 'SCHEDULED'  THEN 'SCHEDULED'
        WHEN 'STARTED'    THEN 'IN_PROGRESS'
        WHEN 'OVER'       THEN 'CLOSED'
        WHEN 'POSTPONED'  THEN 'CANCELLED'
        WHEN 'ARCHIVED'   THEN 'CLOSED'
        WHEN 'COMPLETED'  THEN 'CLOSED'
        ELSE interview_status
    END,
    updated_at = COALESCE(updated_at, NOW())
WHERE interview_status IN ('PENDING','SCHEDULED','STARTED','OVER','POSTPONED','ARCHIVED','COMPLETED');

-- 2.3 application_progress.progress_status : PASSED -> COMPLETED
--     (toutes les lignes PASSED ont completed_at renseigne -> cloture technique,
--     AWAITING_VALIDATION n'est pas derive automatiquement : nouveau statut)
UPDATE application_progress
SET progress_status = 'COMPLETED',
    updated_at      = COALESCE(updated_at, NOW())
WHERE progress_status = 'PASSED';

-- 2.4 pipeline_stage.stage_type : EVALUATION -> DECISION
--     (EVALUATION n'est plus un stage top-level cible ; remap des 2 etapes
--      vers DECISION, decision BA 2026-08-08)
UPDATE pipeline_stage
SET stage_type = 'DECISION',
    updated_at = COALESCE(updated_at, NOW())
WHERE stage_type = 'EVALUATION';

-- 2.5 pipeline_stage_notification_rule.outcome_code : aligne sur le nouveau
--     stage_type (outcome_code reproduit le stage_type de l'etape portee)
UPDATE pipeline_stage_notification_rule r
JOIN pipeline_stage ps ON ps.id = r.pipeline_stage_id
SET r.outcome_code = ps.stage_type,
    r.updated_at   = COALESCE(r.updated_at, NOW())
WHERE r.trigger_code = 'STAGE_EMAIL'
  AND r.outcome_code <> ps.stage_type;

-- -----------------------------------------------------------------------------
-- 3. GARDE-FOU POST-BACKFILL : aucune valeur legacy ne doit subsister
--    (echec explicite sinon -> migration a corriger et re-appliquer)
-- -----------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS v1_076_assert_backfill_done;
DELIMITER //
CREATE PROCEDURE v1_076_assert_backfill_done()
BEGIN
    IF EXISTS (SELECT 1 FROM application_quiz_attempt WHERE quiz_status = 'DONE') THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'V1_076: quiz_status DONE restant (backfill incomplet)';
    END IF;

    IF EXISTS (
        SELECT 1 FROM interviews
        WHERE interview_status IN ('PENDING','STARTED','OVER','POSTPONED','ARCHIVED','COMPLETED')
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'V1_076: interview_status legacy restant (backfill incomplet)';
    END IF;

    IF EXISTS (SELECT 1 FROM application_progress WHERE progress_status = 'PASSED') THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'V1_076: progress_status PASSED restant (backfill incomplet)';
    END IF;

    IF EXISTS (SELECT 1 FROM pipeline_stage WHERE stage_type = 'EVALUATION') THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'V1_076: stage_type EVALUATION restant (backfill incomplet)';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM pipeline_stage_notification_rule r
        JOIN pipeline_stage ps ON ps.id = r.pipeline_stage_id
        WHERE r.trigger_code = 'STAGE_EMAIL'
          AND r.outcome_code <> ps.stage_type
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'V1_076: outcome_code non aligne sur stage_type (backfill incomplet)';
    END IF;
END//
DELIMITER ;
CALL v1_076_assert_backfill_done();
DROP PROCEDURE v1_076_assert_backfill_done;

-- -----------------------------------------------------------------------------
-- 4. COMPTAGE APRES : controle que les valeurs legacy ont disparu et que le
--    vocabulaire est conforme a la cible post-420
-- -----------------------------------------------------------------------------
SELECT 'application_quiz_attempt' AS table_name,
       quiz_status,
       COUNT(*) AS nb
FROM application_quiz_attempt
GROUP BY quiz_status;

SELECT 'interviews' AS table_name,
       interview_status,
       COUNT(*) AS nb
FROM interviews
GROUP BY interview_status;

SELECT 'application_progress' AS table_name,
       progress_status,
       COUNT(*) AS nb
FROM application_progress
GROUP BY progress_status;

SELECT 'pipeline_stage' AS table_name,
       stage_type,
       COUNT(*) AS nb
FROM pipeline_stage
GROUP BY stage_type;

SELECT 'pipeline_stage_notification_rule' AS table_name,
       outcome_code,
       COUNT(*) AS nb
FROM pipeline_stage_notification_rule
WHERE trigger_code = 'STAGE_EMAIL'
GROUP BY outcome_code;
