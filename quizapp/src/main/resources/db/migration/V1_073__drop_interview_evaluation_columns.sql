-- =============================================================================
-- V1_073 : DROP des colonnes legacy phase 3 (entretien/evaluation)
--   Porte sur : interviews.campaign_id/application_id/evaluation_score/
--     evaluation_number/evaluation_percentage ; candidate_interview
--     .interview_start/application_id (PAS interview_duration) ;
--     evaluations.candidate_mark/recruiter_comment ;
--     applications.interview_date/interview_status/total_evaluation_score/
--     total_evaluation_number/total_evaluation_percentage.
--   PREREQUIS : V1_072 appliquee (backfills global_*/interview_start/
--     aggregated_evaluation_* + rename evaluation_room_code) ET phase 3C
--     verrouillee (rg backend+front = 0 reference aux getters/setters legacy
--     cibles, hors champs DTO derives ; build + tests verts).
--   ORDRE STRICT : DROP des FK (dont la composite fk_interviews_progress_app)
--     PUIS DROP des colonnes.
-- ATTENTION : DDL MySQL NON transactionnel (chaque ALTER auto-commit). A
-- tester sur une copie de la BD avant application sur la BD partagee
-- (Flyway: une migration appliquee est immuable).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0. COMPTAGE AVANT : etat des colonnes legacy ciblees
-- -----------------------------------------------------------------------------
SELECT 'interviews' AS table_name,
       COUNT(*) AS total,
       SUM(CASE WHEN campaign_id IS NULL THEN 1 ELSE 0 END) AS campaign_id_null,
       SUM(CASE WHEN application_id IS NULL THEN 1 ELSE 0 END) AS application_id_null,
       SUM(CASE WHEN evaluation_score IS NULL THEN 1 ELSE 0 END) AS evaluation_score_null,
       SUM(CASE WHEN evaluation_number IS NULL THEN 1 ELSE 0 END) AS evaluation_number_null,
       SUM(CASE WHEN evaluation_percentage IS NULL THEN 1 ELSE 0 END) AS evaluation_percentage_null
FROM interviews;

SELECT 'candidate_interview' AS table_name,
       COUNT(*) AS total,
       SUM(CASE WHEN interview_start IS NULL THEN 1 ELSE 0 END) AS interview_start_null,
       SUM(CASE WHEN application_id IS NULL THEN 1 ELSE 0 END) AS application_id_null
FROM candidate_interview;

SELECT 'evaluations' AS table_name,
       COUNT(*) AS total,
       SUM(CASE WHEN candidate_mark IS NULL THEN 1 ELSE 0 END) AS candidate_mark_null,
       SUM(CASE WHEN recruiter_comment IS NULL THEN 1 ELSE 0 END) AS recruiter_comment_null
FROM evaluations;

SELECT 'applications' AS table_name,
       COUNT(*) AS total,
       SUM(CASE WHEN interview_date IS NULL THEN 1 ELSE 0 END) AS interview_date_null,
       SUM(CASE WHEN interview_status IS NULL THEN 1 ELSE 0 END) AS interview_status_null,
       SUM(CASE WHEN total_evaluation_score IS NULL THEN 1 ELSE 0 END) AS total_evaluation_score_null,
       SUM(CASE WHEN total_evaluation_number IS NULL THEN 1 ELSE 0 END) AS total_evaluation_number_null,
       SUM(CASE WHEN total_evaluation_percentage IS NULL THEN 1 ELSE 0 END) AS total_evaluation_percentage_null
FROM applications;

-- -----------------------------------------------------------------------------
-- 1. GARDE-FOU : verifie la presence des FK et colonnes ciblees avant DROP
--    (echec explicite si l'etat ne correspond pas au schema attendu)
-- -----------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS v1_073_assert_schema_ready;
DELIMITER //
CREATE PROCEDURE v1_073_assert_schema_ready()
BEGIN
    DECLARE nb_missing INT;

    SELECT COUNT(*) INTO nb_missing
    FROM information_schema.TABLE_CONSTRAINTS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'interviews'
      AND CONSTRAINT_TYPE = 'FOREIGN KEY'
      AND CONSTRAINT_NAME IN ('fk_interviews_progress_app', 'fk_interviews_application', 'fk_interviews_campaign');
    IF nb_missing <> 3 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'V1_073: FKs interviews (fk_interviews_progress_app/fk_interviews_application/fk_interviews_campaign) introuvables';
    END IF;

    SELECT COUNT(*) INTO nb_missing
    FROM information_schema.TABLE_CONSTRAINTS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'candidate_interview'
      AND CONSTRAINT_TYPE = 'FOREIGN KEY'
      AND CONSTRAINT_NAME = 'fk_ci_application';
    IF nb_missing <> 1 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'V1_073: FK candidate_interview (fk_ci_application) introuvable';
    END IF;

    SELECT COUNT(*) INTO nb_missing
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND ( (TABLE_NAME = 'interviews'
             AND COLUMN_NAME IN ('campaign_id', 'application_id', 'evaluation_score', 'evaluation_number', 'evaluation_percentage'))
         OR (TABLE_NAME = 'candidate_interview'
             AND COLUMN_NAME IN ('interview_start', 'application_id'))
         OR (TABLE_NAME = 'evaluations'
             AND COLUMN_NAME IN ('candidate_mark', 'recruiter_comment'))
         OR (TABLE_NAME = 'applications'
             AND COLUMN_NAME IN ('interview_date', 'interview_status', 'total_evaluation_score', 'total_evaluation_number', 'total_evaluation_percentage')) );
    IF nb_missing <> 14 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'V1_073: colonnes legacy ciblees manquantes ou deja droppees (etat inattendu)';
    END IF;
END//
DELIMITER ;
CALL v1_073_assert_schema_ready();
DROP PROCEDURE v1_073_assert_schema_ready;

-- -----------------------------------------------------------------------------
-- 2. DROP DES FK (ordre strict : la composite fk_interviews_progress_app
--    porte sur application_id + application_progress_id -> a retirer avant
--    le DROP de interviews.application_id)
-- -----------------------------------------------------------------------------
ALTER TABLE interviews DROP FOREIGN KEY fk_interviews_progress_app;
ALTER TABLE interviews DROP FOREIGN KEY fk_interviews_application;
ALTER TABLE interviews DROP FOREIGN KEY fk_interviews_campaign;
ALTER TABLE candidate_interview DROP FOREIGN KEY fk_ci_application;

-- -----------------------------------------------------------------------------
-- 3. DROP DES COLONNES
-- -----------------------------------------------------------------------------
-- interviews : campaign_id, application_id, evaluation_score,
--              evaluation_number, evaluation_percentage
-- (l'index manuel idx_interviews_progress_app sur application_id est supprime
--  automatiquement avec la colonne ; application_progress_id est conserve)
ALTER TABLE interviews
    DROP COLUMN campaign_id,
    DROP COLUMN application_id,
    DROP COLUMN evaluation_score,
    DROP COLUMN evaluation_number,
    DROP COLUMN evaluation_percentage;

-- candidate_interview : interview_start, application_id
-- (interview_duration ET interview_id sont CONSERVES)
ALTER TABLE candidate_interview
    DROP COLUMN interview_start,
    DROP COLUMN application_id;

-- evaluations : candidate_mark, recruiter_comment
ALTER TABLE evaluations
    DROP COLUMN candidate_mark,
    DROP COLUMN recruiter_comment;

-- applications : interview_date, interview_status, total_evaluation_*
ALTER TABLE applications
    DROP COLUMN interview_date,
    DROP COLUMN interview_status,
    DROP COLUMN total_evaluation_score,
    DROP COLUMN total_evaluation_number,
    DROP COLUMN total_evaluation_percentage;

-- -----------------------------------------------------------------------------
-- 4. COMPTAGE APRES : controle que les colonnes legacy ont disparu
-- -----------------------------------------------------------------------------
SELECT 'colonnes_restantes' AS etat,
       COUNT(*) AS nb_colonnes_legacy_encore_presentes
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND ( (TABLE_NAME = 'interviews'
         AND COLUMN_NAME IN ('campaign_id', 'application_id', 'evaluation_score', 'evaluation_number', 'evaluation_percentage'))
     OR (TABLE_NAME = 'candidate_interview'
         AND COLUMN_NAME IN ('interview_start', 'application_id'))
     OR (TABLE_NAME = 'evaluations'
         AND COLUMN_NAME IN ('candidate_mark', 'recruiter_comment'))
     OR (TABLE_NAME = 'applications'
         AND COLUMN_NAME IN ('interview_date', 'interview_status', 'total_evaluation_score', 'total_evaluation_number', 'total_evaluation_percentage')) );

-- Controle des conservations attendues
SELECT 'interviews.application_progress_id' AS colonne_conservee,
       COUNT(*) AS nb
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'interviews' AND COLUMN_NAME = 'application_progress_id';

SELECT 'candidate_interview.interview_duration' AS colonne_conservee,
       COUNT(*) AS nb
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'candidate_interview' AND COLUMN_NAME = 'interview_duration';

SELECT 'candidate_interview.interview_id' AS colonne_conservee,
       COUNT(*) AS nb
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'candidate_interview' AND COLUMN_NAME = 'interview_id';

SELECT 'interviews.evaluation_room_code' AS colonne_conservee,
       COUNT(*) AS nb
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'interviews' AND COLUMN_NAME = 'evaluation_room_code';
