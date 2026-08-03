-- =============================================================================
-- V1_070 : cloture du perimetre quiz multi-occurrences
--  - Rattache les reponses legacy (candidate_answer.application_quiz_attempt_id NULL)
--    a l'unique tentative historique de leur candidature (repli V1_061).
--  - Echec explicite de la migration si des reponses restent sans tentative.
--  - Backfill des resumes derives applications.aggregated_quiz_score(_percent)
--    depuis l'attempt courant (dernier non supprime, id max) : semantique du runtime.
--  - DROP des colonnes quiz legacy de applications et de candidate_answer.application_id.
-- ATTENTION : DDL MySQL NON transactionnel. A tester sur une copie de la BD
-- avant application sur la BD partagee (Flyway: une migration appliquee est immuable).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Backfill de repli : reponses sans tentative -> tentative unique de leur
--    candidature (reprend la logique tmp_phase_b_single_quiz_attempt de V1_061)
-- -----------------------------------------------------------------------------
CREATE TEMPORARY TABLE tmp_v1_070_single_quiz_attempt AS
SELECT
    aqa.application_id,
    MIN(aqa.id) AS application_quiz_attempt_id,
    COUNT(*) AS attempt_count
FROM application_quiz_attempt aqa
WHERE COALESCE(aqa.is_deleted, 0) = 0
GROUP BY aqa.application_id
HAVING COUNT(*) = 1;

UPDATE candidate_answer ca
JOIN tmp_v1_070_single_quiz_attempt aqa
  ON aqa.application_id = ca.application_id
SET ca.application_quiz_attempt_id = aqa.application_quiz_attempt_id
WHERE ca.application_quiz_attempt_id IS NULL;

-- -----------------------------------------------------------------------------
-- 2. Echec explicite si des reponses restent sans tentative (application avec
--    0 ou plusieurs tentatives, ou orpheline) : arbitrage requis avant DROP.
-- -----------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS v1_070_assert_answers_linked;
DELIMITER //
CREATE PROCEDURE v1_070_assert_answers_linked()
BEGIN
    IF EXISTS (
        SELECT 1
        FROM candidate_answer
        WHERE application_quiz_attempt_id IS NULL
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'V1_070: des candidate_answer n''ont pas de application_quiz_attempt_id apres backfill (arbitrage requis)';
    END IF;
END//
DELIMITER ;
CALL v1_070_assert_answers_linked();
DROP PROCEDURE v1_070_assert_answers_linked;

-- -----------------------------------------------------------------------------
-- 3. Backfill des resumes derives : aggregated_quiz_score(_percent) depuis
--    l'attempt courant (dernier non supprime, id max), semantique runtime
--    (syncApplicationQuizSummaryFromAttempt).
-- -----------------------------------------------------------------------------
CREATE TEMPORARY TABLE tmp_v1_070_latest_attempt AS
SELECT
    aqa.application_id,
    aqa.score,
    aqa.score_percent
FROM application_quiz_attempt aqa
JOIN (
    SELECT application_id, MAX(id) AS max_id
    FROM application_quiz_attempt
    WHERE COALESCE(is_deleted, 0) = 0
    GROUP BY application_id
) latest ON latest.application_id = aqa.application_id AND latest.max_id = aqa.id;

UPDATE applications a
LEFT JOIN tmp_v1_070_latest_attempt la
       ON la.application_id = a.id
SET a.aggregated_quiz_score = la.score,
    a.aggregated_quiz_score_percent = la.score_percent
WHERE COALESCE(a.is_deleted, 0) = 0;

-- -----------------------------------------------------------------------------
-- 4. candidate_answer : fin de la colonne application_id
--    DROP conditionnel de toutes les FK portant sur application_id
--    (fk_candidate_answer_attempt_app V1_060, plus fk_ca_application V1_001 ou
--    fk_candidate_answers_application selon l'historique reel de la BD), puis
--    DROP KEY composite, DROP COLUMN, NOT NULL et FK simple sur l'attempt.
-- -----------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS v1_070_drop_candidate_answer_fks;
DELIMITER //
CREATE PROCEDURE v1_070_drop_candidate_answer_fks()
BEGIN
    DECLARE done INT DEFAULT 0;
    DECLARE fk_name VARCHAR(64);
    DECLARE cur CURSOR FOR
        SELECT DISTINCT CONSTRAINT_NAME
        FROM information_schema.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'candidate_answer'
          AND REFERENCED_TABLE_NAME IS NOT NULL
          AND CONSTRAINT_NAME IN (
              'fk_candidate_answer_attempt_app',
              'fk_ca_application',
              'fk_candidate_answers_application'
          );
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;
    OPEN cur;
    read_loop: LOOP
        FETCH cur INTO fk_name;
        IF done THEN
            LEAVE read_loop;
        END IF;
        SET @sql = CONCAT('ALTER TABLE candidate_answer DROP FOREIGN KEY `', fk_name, '`');
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END LOOP;
    CLOSE cur;
END//
DELIMITER ;
CALL v1_070_drop_candidate_answer_fks();
DROP PROCEDURE v1_070_drop_candidate_answer_fks;

ALTER TABLE candidate_answer
    DROP KEY idx_candidate_answer_attempt_app;

ALTER TABLE candidate_answer
    DROP COLUMN application_id;

ALTER TABLE candidate_answer
    MODIFY COLUMN application_quiz_attempt_id INT UNSIGNED NOT NULL;

ALTER TABLE candidate_answer
    ADD KEY idx_candidate_answer_attempt (application_quiz_attempt_id),
    ADD CONSTRAINT fk_candidate_answer_attempt FOREIGN KEY (application_quiz_attempt_id)
        REFERENCES application_quiz_attempt(id);

-- -----------------------------------------------------------------------------
-- 5. applications : DROP des colonnes quiz legacy (arbitrages 1 et 4, quiz_level inclus)
-- -----------------------------------------------------------------------------
ALTER TABLE applications
    DROP INDEX uk_applications_quiz_token;

ALTER TABLE applications
    DROP COLUMN quiz_score,
    DROP COLUMN quiz_token,
    DROP COLUMN quiz_status,
    DROP COLUMN quiz_level,
    DROP COLUMN total_questions,
    DROP COLUMN quiz_score_percent,
    DROP COLUMN quiz_manual_correction_status,
    DROP COLUMN time_elapsed,
    DROP COLUMN quiz_timed_snapshot,
    DROP COLUMN quiz_total_time_allowed_snapshot,
    DROP COLUMN quiz_last_activity_at;

-- -----------------------------------------------------------------------------
-- 6. Nettoyage des tables temporaires
-- -----------------------------------------------------------------------------
DROP TEMPORARY TABLE IF EXISTS tmp_v1_070_single_quiz_attempt;
DROP TEMPORARY TABLE IF EXISTS tmp_v1_070_latest_attempt;
