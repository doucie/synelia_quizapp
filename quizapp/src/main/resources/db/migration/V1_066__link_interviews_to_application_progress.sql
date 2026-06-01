-- =============================================================================
-- V1_066 : rattacher les entretiens a leur occurrence application_progress
-- La colonne et la FK ont deja ete introduites en V1_060 ; ce slice termine
-- seulement le backfill des lignes encore nulles, notamment quand plusieurs
-- occurrences INTERVIEW existent deja pour une meme candidature.
-- =============================================================================

-- Backfill simple pour les candidatures qui n'ont qu'une seule occurrence INTERVIEW.
UPDATE interviews i
JOIN (
    SELECT ap.application_id, MIN(ap.id) AS application_progress_id
    FROM application_progress ap
    JOIN pipeline_stage ps ON ps.id = ap.pipeline_stage_id
    WHERE IFNULL(ap.is_deleted, 0) = 0
      AND IFNULL(ps.is_deleted, 0) = 0
      AND ps.stage_type = 'INTERVIEW'
    GROUP BY ap.application_id
    HAVING COUNT(*) = 1
) singleton_match ON singleton_match.application_id = i.application_id
SET i.application_progress_id = singleton_match.application_progress_id
WHERE i.application_progress_id IS NULL
  AND IFNULL(i.is_deleted, 0) = 0;

-- Backfill ordinal quand plusieurs occurrences INTERVIEW existent deja pour une candidature.
UPDATE interviews i
JOIN (
    SELECT ranked_interviews.interview_id, ranked_progress.application_progress_id
    FROM (
        SELECT
            i.id AS interview_id,
            i.application_id,
            ROW_NUMBER() OVER (
                PARTITION BY i.application_id
                ORDER BY COALESCE(i.interview_date, i.created_at), i.id
            ) AS occurrence_rank
        FROM interviews i
        WHERE IFNULL(i.is_deleted, 0) = 0
    ) ranked_interviews
    JOIN (
        SELECT
            ap.id AS application_progress_id,
            ap.application_id,
            ROW_NUMBER() OVER (
                PARTITION BY ap.application_id
                ORDER BY ps.stage_order, ap.id
            ) AS occurrence_rank
        FROM application_progress ap
        JOIN pipeline_stage ps ON ps.id = ap.pipeline_stage_id
        WHERE IFNULL(ap.is_deleted, 0) = 0
          AND IFNULL(ps.is_deleted, 0) = 0
          AND ps.stage_type = 'INTERVIEW'
    ) ranked_progress
      ON ranked_progress.application_id = ranked_interviews.application_id
     AND ranked_progress.occurrence_rank = ranked_interviews.occurrence_rank
) occurrence_match ON occurrence_match.interview_id = i.id
SET i.application_progress_id = occurrence_match.application_progress_id
WHERE i.application_progress_id IS NULL
  AND IFNULL(i.is_deleted, 0) = 0;