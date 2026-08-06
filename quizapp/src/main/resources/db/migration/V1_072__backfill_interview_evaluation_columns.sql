-- =============================================================================
-- V1_072 : bascule des evaluations sur global_score/global_comment + ancrage
--          entretien sur application_progress_id + rename evaluation_room_code
--  - Etape 1 (garde-fou 0 NULL) : COMPTAGE des interviews sans
--    application_progress_id (et sans application_id legacy). Si > 0, la
--    migration s'arrete par SIGNAL (le backfill par creation d'occurrence
--    INTERVIEW reste a declencher manuellement avant re-application).
--  - Etape 2 (mouvement de donnees, regle "conserver les donnees") :
--    evaluations.candidate_mark -> global_score / recruiter_comment ->
--    global_comment (uniquement si global_* NULL) ; candidate_interview
--    .interview_start <- interviews.interview_date (backfill si NULL) ;
--    applications.aggregated_evaluation_* recalcules depuis
--    evaluations.global_score (semantique V1_061 : SUM pour le score,
--    SUM/COUNT pour le percent) sur les applications encore vides.
--  - Etape 3 : RENAME interviews.interview_evaluations_link ->
--    evaluation_room_code (MODIFY varchar(8), type conserve).
--  - Etape 4 (durcissements NOT NULL, apres backfill si lignes NULL) :
--    candidate_interview.interview_id et evaluations.candidate_interview_id
--    -> NOT NULL (alignement cible).
-- ATTENTION : DDL MySQL NON transactionnel. A tester sur une copie de la BD
-- avant application sur la BD partagee (Flyway: une migration appliquee est immuable).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. COMPTAGE AVANT : interviews sans application_progress_id / sans
--    application_id (legacy). SIGNAL bloquant si des occurrences manquent.
-- -----------------------------------------------------------------------------
SELECT
    COUNT(*) AS interviews_total,
    SUM(CASE WHEN application_progress_id IS NULL THEN 1 ELSE 0 END) AS interviews_sans_application_progress_id,
    SUM(CASE WHEN application_id IS NULL THEN 1 ELSE 0 END) AS interviews_sans_application_id
FROM interviews;

-- Garde-fou 0 NULL : le backfill par creation d'occurrence INTERVIEW (stage
-- type 'INTERVIEW' du template de la campagne) n'est pas automatise dans cette
-- migration ; il doit etre effectue manuellement si le comptage le necessite.
-- Echec explicite de la migration (SIGNAL) si des occurrences manquent.
DROP PROCEDURE IF EXISTS v1_072_assert_interviews_linked;
DELIMITER //
CREATE PROCEDURE v1_072_assert_interviews_linked()
BEGIN
    IF EXISTS (
        SELECT 1
        FROM interviews
        WHERE application_progress_id IS NULL
           OR application_id IS NULL
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'V1_072: interviews sans application_progress_id/application_id (backfill manuel requis avant re-application)';
    END IF;
END//
DELIMITER ;
CALL v1_072_assert_interviews_linked();
DROP PROCEDURE v1_072_assert_interviews_linked;

-- -----------------------------------------------------------------------------
-- 2. BACKFILL evaluations.global_score / global_comment depuis les colonnes
--    legacy candidate_mark / recruiter_comment (uniquement si global_* NULL)
-- -----------------------------------------------------------------------------
UPDATE evaluations e
SET
    e.global_score = COALESCE(e.global_score, e.candidate_mark),
    e.global_comment = COALESCE(e.global_comment, e.recruiter_comment)
WHERE e.candidate_mark IS NOT NULL
   OR e.recruiter_comment IS NOT NULL;

-- 2.b BACKFILL candidate_interview.interview_start depuis interviews.interview_date
--     (uniquement si interview_start NULL et l'interview porte une date)
UPDATE candidate_interview ci
LEFT JOIN interviews i ON i.id = ci.interview_id
SET ci.interview_start = COALESCE(ci.interview_start, i.interview_date)
WHERE ci.interview_start IS NULL
  AND i.interview_date IS NOT NULL;

-- 2.c BACKFILL applications.aggregated_evaluation_* depuis evaluations.global_score
--     (semantique V1_061 : SUM pour le score, SUM/COUNT pour le percent),
--     uniquement sur les applications encore vides
UPDATE applications a
LEFT JOIN (
    SELECT
        ci.application_id,
        ROUND(SUM(COALESCE(e.global_score, 0)), 2) AS aggregated_evaluation_score,
        CASE
            WHEN COUNT(e.id) > 0 THEN ROUND(SUM(COALESCE(e.global_score, 0)) / COUNT(e.id), 2)
            ELSE NULL
        END AS aggregated_evaluation_score_percent
    FROM evaluations e
    JOIN candidate_interview ci ON ci.id = e.candidate_interview_id
    WHERE COALESCE(e.is_deleted, 0) = 0
      AND COALESCE(ci.is_deleted, 0) = 0
      AND ci.application_id IS NOT NULL
    GROUP BY ci.application_id
) evaluation_aggregate ON evaluation_aggregate.application_id = a.id
SET
    a.aggregated_evaluation_score = COALESCE(a.aggregated_evaluation_score, evaluation_aggregate.aggregated_evaluation_score),
    a.aggregated_evaluation_score_percent = COALESCE(a.aggregated_evaluation_score_percent, evaluation_aggregate.aggregated_evaluation_score_percent)
WHERE a.aggregated_evaluation_score IS NULL
   OR a.aggregated_evaluation_score_percent IS NULL;

-- -----------------------------------------------------------------------------
-- 3. COMPTAGE APRES : etat des colonnes cibles apres backfill
-- -----------------------------------------------------------------------------
SELECT
    SUM(CASE WHEN global_score IS NULL AND candidate_mark IS NOT NULL THEN 1 ELSE 0 END) AS evaluations_global_score_restants,
    SUM(CASE WHEN global_comment IS NULL AND recruiter_comment IS NOT NULL THEN 1 ELSE 0 END) AS evaluations_global_comment_restants,
    COUNT(*) AS evaluations_total
FROM evaluations;

SELECT
    SUM(CASE WHEN ci.interview_start IS NULL AND i.interview_date IS NOT NULL THEN 1 ELSE 0 END) AS candidate_interview_start_restants,
    COUNT(*) AS candidate_interview_total
FROM candidate_interview ci
LEFT JOIN interviews i ON i.id = ci.interview_id;

-- -----------------------------------------------------------------------------
-- 4. RENAME interviews.interview_evaluations_link -> evaluation_room_code
--    (type et nullabilite conserves : varchar(8) NULL)
-- -----------------------------------------------------------------------------
ALTER TABLE interviews
    CHANGE COLUMN interview_evaluations_link evaluation_room_code VARCHAR(8) NULL;

-- -----------------------------------------------------------------------------
-- 5. DURCISSEMENTS NOT NULL (apres backfill) :
--    candidate_interview.interview_id et evaluations.candidate_interview_id
-- -----------------------------------------------------------------------------
-- Garde-fou 0 NULL avant durcissement (echec explicite sinon)
DROP PROCEDURE IF EXISTS v1_072_assert_not_null_ready;
DELIMITER //
CREATE PROCEDURE v1_072_assert_not_null_ready()
BEGIN
    IF EXISTS (
        SELECT 1
        FROM candidate_interview
        WHERE interview_id IS NULL
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'V1_072: candidate_interview.interview_id NULL apres backfill (arbitrage requis avant NOT NULL)';
    END IF;
    IF EXISTS (
        SELECT 1
        FROM evaluations
        WHERE candidate_interview_id IS NULL
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'V1_072: evaluations.candidate_interview_id NULL apres backfill (arbitrage requis avant NOT NULL)';
    END IF;
END//
DELIMITER ;
CALL v1_072_assert_not_null_ready();
DROP PROCEDURE v1_072_assert_not_null_ready;

ALTER TABLE candidate_interview
    MODIFY COLUMN interview_id int unsigned NOT NULL;

ALTER TABLE evaluations
    MODIFY COLUMN candidate_interview_id int unsigned NOT NULL;
