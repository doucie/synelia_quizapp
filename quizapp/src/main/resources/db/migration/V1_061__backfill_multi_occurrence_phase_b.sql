-- =============================================================================
-- V1_061 : phase B - backfill des donnees legacy vers le modele multi-occurrences
-- Les cas non deterministes sont journalises dans audit_event pour arbitrage.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Statistiques de progression legacy par type de stage
-- -----------------------------------------------------------------------------
CREATE TEMPORARY TABLE tmp_phase_b_stage_progress_stats AS
SELECT
    ap.application_id,
    CASE
        WHEN UPPER(ps.stage_type) = 'TECHNICAL_TEST' THEN 'QUIZ'
        ELSE ps.stage_type
    END AS stage_type,
    COUNT(*) AS progress_count,
    MIN(ap.id) AS only_application_progress_id,
    MIN(ap.pipeline_stage_id) AS only_pipeline_stage_id
FROM application_progress ap
JOIN pipeline_stage ps ON ps.id = ap.pipeline_stage_id
WHERE COALESCE(ap.is_deleted, 0) = 0
  AND COALESCE(ps.is_deleted, 0) = 0
GROUP BY ap.application_id, ps.stage_type;

-- -----------------------------------------------------------------------------
-- 2. Rattacher les decisions existantes a leur round pipeline
-- -----------------------------------------------------------------------------
UPDATE decisions d
JOIN application_progress ap
  ON ap.application_id = d.application_id
 AND ap.pipeline_stage_id = d.pipeline_stage_id
 AND COALESCE(ap.is_deleted, 0) = 0
SET d.application_progress_id = ap.id
WHERE COALESCE(d.is_deleted, 0) = 0
  AND d.application_id IS NOT NULL
  AND d.pipeline_stage_id IS NOT NULL
  AND d.application_progress_id IS NULL;

UPDATE decisions d
JOIN tmp_phase_b_stage_progress_stats stats
  ON stats.application_id = d.application_id
 AND stats.stage_type = 'PRESELECTION'
 AND stats.progress_count = 1
SET d.application_progress_id = stats.only_application_progress_id
WHERE COALESCE(d.is_deleted, 0) = 0
  AND d.application_id IS NOT NULL
  AND d.application_progress_id IS NULL
  AND d.decision_type IN ('PRE_SCREEN_ACCEPTED', 'PRE_SCREEN_REJECTED');

UPDATE decisions d
JOIN tmp_phase_b_stage_progress_stats stats
  ON stats.application_id = d.application_id
 AND stats.stage_type = 'DECISION'
 AND stats.progress_count = 1
SET d.application_progress_id = stats.only_application_progress_id
WHERE COALESCE(d.is_deleted, 0) = 0
  AND d.application_id IS NOT NULL
  AND d.application_progress_id IS NULL
  AND d.decision_type IN ('FINAL_ACCEPTED', 'FINAL_REJECTED');

-- -----------------------------------------------------------------------------
-- 3. Rattacher les entretiens existants a leur round INTERVIEW
-- -----------------------------------------------------------------------------
UPDATE interviews i
JOIN tmp_phase_b_stage_progress_stats stats
  ON stats.application_id = i.application_id
 AND stats.stage_type = 'INTERVIEW'
 AND stats.progress_count = 1
SET i.application_progress_id = stats.only_application_progress_id
WHERE COALESCE(i.is_deleted, 0) = 0
  AND i.application_id IS NOT NULL
  AND i.application_progress_id IS NULL;

-- -----------------------------------------------------------------------------
-- 4. Identifier les candidatures legacy a backfiller en application_quiz_attempt
-- -----------------------------------------------------------------------------
CREATE TEMPORARY TABLE tmp_phase_b_legacy_quiz_candidates AS
SELECT
    a.id AS application_id,
    COALESCE(stats.progress_count, 0) AS quiz_progress_count,
    stats.only_application_progress_id AS application_progress_id,
    a.form_version_id,
    a.quiz_token,
    CASE
        WHEN COALESCE(a.application_abandoned, 0) = 1
             AND UPPER(COALESCE(a.quiz_status, 'PENDING')) = 'STARTED'
            THEN 'EXPIRED'
        ELSE UPPER(COALESCE(a.quiz_status, 'PENDING'))
    END AS quiz_status,
    CASE
        WHEN stats.only_application_progress_id IS NULL THEN 'NONE'
        ELSE 'AUTO_THRESHOLD'
    END AS screening_mode,
    CASE
        WHEN JSON_VALID(ps.config_json) = 1
             AND JSON_EXTRACT(ps.config_json, '$.passingScore') IS NOT NULL
             AND JSON_UNQUOTE(JSON_EXTRACT(ps.config_json, '$.passingScore')) REGEXP '^-?[0-9]+(\\.[0-9]+)?$'
            THEN CAST(JSON_UNQUOTE(JSON_EXTRACT(ps.config_json, '$.passingScore')) AS DECIMAL(10,2))
        WHEN stats.only_application_progress_id IS NULL THEN NULL
        ELSE 50.00
    END AS screening_threshold,
    CASE
        WHEN UPPER(COALESCE(apq.progress_status, '')) = 'PASSED' THEN 'PASSED'
        WHEN UPPER(COALESCE(apq.progress_status, '')) = 'FAILED' THEN 'FAILED'
        ELSE NULL
    END AS screening_result,
    a.quiz_score AS score,
    a.quiz_score_percent AS score_percent,
    COALESCE(NULLIF(a.quiz_manual_correction_status, ''), 'NOT_REQUIRED') AS manual_correction_status,
    a.total_questions,
    COALESCE(a.time_elapsed, 0) AS time_elapsed,
    COALESCE(a.quiz_timed_snapshot, 0) AS timed_snapshot,
    a.quiz_total_time_allowed_snapshot AS total_time_allowed_snapshot,
    a.quiz_last_activity_at AS last_activity_at,
    apq.started_at,
    CASE
        WHEN UPPER(COALESCE(a.quiz_status, 'PENDING')) = 'COMPLETED'
            THEN COALESCE(apq.completed_at, a.updated_at, a.quiz_last_activity_at)
        ELSE apq.completed_at
    END AS completed_at,
    COALESCE(apq.created_at, a.created_at) AS created_at,
    COALESCE(apq.created_by, a.created_by) AS created_by,
    COALESCE(a.updated_at, apq.updated_at, apq.completed_at, apq.started_at, a.created_at) AS updated_at,
    COALESCE(a.updated_by, apq.updated_by, apq.created_by, a.created_by) AS updated_by,
    COALESCE(a.search_string, apq.search_string) AS search_string,
    (
        SELECT COUNT(*)
        FROM application_quiz_attempt existing_attempt
        WHERE existing_attempt.application_id = a.id
          AND COALESCE(existing_attempt.is_deleted, 0) = 0
    ) AS existing_attempt_count
FROM applications a
LEFT JOIN tmp_phase_b_stage_progress_stats stats
       ON stats.application_id = a.id
      AND stats.stage_type = 'QUIZ'
LEFT JOIN application_progress apq
       ON apq.id = stats.only_application_progress_id
LEFT JOIN pipeline_stage ps
       ON ps.id = apq.pipeline_stage_id
WHERE COALESCE(a.is_deleted, 0) = 0
  AND (
        a.quiz_token IS NOT NULL
        OR EXISTS (
            SELECT 1
            FROM candidate_answer ca
            WHERE ca.application_id = a.id
              AND COALESCE(ca.is_deleted, 0) = 0
        )
        OR UPPER(COALESCE(a.quiz_status, 'PENDING')) <> 'PENDING'
        OR a.quiz_score IS NOT NULL
        OR a.quiz_score_percent IS NOT NULL
        OR a.quiz_level IS NOT NULL
        OR a.total_questions IS NOT NULL
        OR COALESCE(a.time_elapsed, 0) > 0
        OR a.quiz_last_activity_at IS NOT NULL
        OR UPPER(COALESCE(a.quiz_manual_correction_status, 'NOT_REQUIRED')) <> 'NOT_REQUIRED'
        OR UPPER(COALESCE(apq.progress_status, 'PENDING')) <> 'PENDING'
        OR apq.started_at IS NOT NULL
        OR apq.completed_at IS NOT NULL
        OR apq.score IS NOT NULL
      );

INSERT INTO application_quiz_attempt (
    application_id,
    application_progress_id,
    form_version_id,
    quiz_token,
    quiz_status,
    screening_mode,
    screening_threshold,
    screening_result,
    score,
    score_percent,
    manual_correction_status,
    total_questions,
    time_elapsed,
    timed_snapshot,
    total_time_allowed_snapshot,
    last_activity_at,
    started_at,
    completed_at,
    created_at,
    created_by,
    updated_at,
    updated_by,
    is_deleted,
    search_string
)
SELECT
    candidate.application_id,
    candidate.application_progress_id,
    candidate.form_version_id,
    candidate.quiz_token,
    candidate.quiz_status,
    candidate.screening_mode,
    candidate.screening_threshold,
    candidate.screening_result,
    candidate.score,
    candidate.score_percent,
    candidate.manual_correction_status,
    candidate.total_questions,
    candidate.time_elapsed,
    candidate.timed_snapshot,
    candidate.total_time_allowed_snapshot,
    candidate.last_activity_at,
    candidate.started_at,
    candidate.completed_at,
    candidate.created_at,
    candidate.created_by,
    candidate.updated_at,
    candidate.updated_by,
    FALSE,
    candidate.search_string
FROM tmp_phase_b_legacy_quiz_candidates candidate
WHERE candidate.quiz_progress_count = 1
  AND candidate.application_progress_id IS NOT NULL
  AND candidate.existing_attempt_count = 0;

CREATE TEMPORARY TABLE tmp_phase_b_single_quiz_attempt AS
SELECT
    aqa.application_id,
    MIN(aqa.id) AS application_quiz_attempt_id,
    COUNT(*) AS attempt_count
FROM application_quiz_attempt aqa
WHERE COALESCE(aqa.is_deleted, 0) = 0
GROUP BY aqa.application_id
HAVING COUNT(*) = 1;

-- -----------------------------------------------------------------------------
-- 5. Rattacher les reponses quiz legacy a la tentative historique unique
-- -----------------------------------------------------------------------------
UPDATE candidate_answer ca
JOIN tmp_phase_b_single_quiz_attempt aqa
  ON aqa.application_id = ca.application_id
SET ca.application_quiz_attempt_id = aqa.application_quiz_attempt_id
WHERE COALESCE(ca.is_deleted, 0) = 0
  AND ca.application_id IS NOT NULL
  AND ca.application_quiz_attempt_id IS NULL;

-- -----------------------------------------------------------------------------
-- 6. Recalculer les resumes derives candidature
-- -----------------------------------------------------------------------------
CREATE TEMPORARY TABLE tmp_phase_b_quiz_aggregates AS
SELECT
    aqa.application_id,
    ROUND(
        SUM(
            CASE
                WHEN UPPER(COALESCE(aqa.quiz_status, 'PENDING')) NOT IN ('CANCELLED', 'EXPIRED')
                     AND UPPER(COALESCE(ap.progress_status, 'PENDING')) <> 'SKIPPED'
                    THEN COALESCE(aqa.score, 0)
                ELSE 0
            END
        ),
        2
    ) AS aggregated_quiz_score,
    CASE
        WHEN SUM(
            CASE
                WHEN UPPER(COALESCE(aqa.quiz_status, 'PENDING')) NOT IN ('CANCELLED', 'EXPIRED')
                     AND UPPER(COALESCE(ap.progress_status, 'PENDING')) <> 'SKIPPED'
                    THEN 1
                ELSE 0
            END
        ) = 0 THEN NULL
        WHEN SUM(
            CASE
                WHEN UPPER(COALESCE(aqa.quiz_status, 'PENDING')) NOT IN ('CANCELLED', 'EXPIRED')
                     AND UPPER(COALESCE(ap.progress_status, 'PENDING')) <> 'SKIPPED'
                     AND aqa.total_questions IS NOT NULL
                     AND aqa.total_questions > 0
                    THEN aqa.total_questions
                ELSE 0
            END
        ) > 0
            THEN ROUND(
                SUM(
                    CASE
                        WHEN UPPER(COALESCE(aqa.quiz_status, 'PENDING')) NOT IN ('CANCELLED', 'EXPIRED')
                             AND UPPER(COALESCE(ap.progress_status, 'PENDING')) <> 'SKIPPED'
                            THEN COALESCE(aqa.score, 0)
                        ELSE 0
                    END
                )
                /
                SUM(
                    CASE
                        WHEN UPPER(COALESCE(aqa.quiz_status, 'PENDING')) NOT IN ('CANCELLED', 'EXPIRED')
                             AND UPPER(COALESCE(ap.progress_status, 'PENDING')) <> 'SKIPPED'
                             AND aqa.total_questions IS NOT NULL
                             AND aqa.total_questions > 0
                            THEN aqa.total_questions
                        ELSE 0
                    END
                )
                * 100,
                2
            )
        ELSE ROUND(
            AVG(
                CASE
                    WHEN UPPER(COALESCE(aqa.quiz_status, 'PENDING')) NOT IN ('CANCELLED', 'EXPIRED')
                         AND UPPER(COALESCE(ap.progress_status, 'PENDING')) <> 'SKIPPED'
                        THEN aqa.score_percent
                    ELSE NULL
                END
            ),
            2
        )
    END AS aggregated_quiz_score_percent
FROM application_quiz_attempt aqa
JOIN application_progress ap ON ap.id = aqa.application_progress_id
WHERE COALESCE(aqa.is_deleted, 0) = 0
GROUP BY aqa.application_id;

CREATE TEMPORARY TABLE tmp_phase_b_evaluation_aggregates AS
SELECT
    ci.application_id,
    ROUND(SUM(COALESCE(e.candidate_mark, 0)), 2) AS aggregated_evaluation_score,
    CASE
        WHEN COUNT(e.id) > 0 THEN ROUND(SUM(COALESCE(e.candidate_mark, 0)) / COUNT(e.id), 2)
        ELSE NULL
    END AS aggregated_evaluation_score_percent
FROM evaluations e
JOIN candidate_interview ci ON ci.id = e.candidate_interview_id
WHERE COALESCE(e.is_deleted, 0) = 0
  AND COALESCE(ci.is_deleted, 0) = 0
  AND ci.application_id IS NOT NULL
GROUP BY ci.application_id;

CREATE TEMPORARY TABLE tmp_phase_b_current_progress AS
SELECT
    a.id AS application_id,
    COALESCE(
        (
            SELECT ap.id
            FROM application_progress ap
            JOIN pipeline_stage ps ON ps.id = ap.pipeline_stage_id
            WHERE ap.application_id = a.id
              AND COALESCE(ap.is_deleted, 0) = 0
              AND UPPER(COALESCE(ap.progress_status, '')) = 'IN_PROGRESS'
            ORDER BY ps.stage_order ASC, ap.id ASC
            LIMIT 1
        ),
        (
            SELECT ap.id
            FROM application_progress ap
            JOIN pipeline_stage ps ON ps.id = ap.pipeline_stage_id
            WHERE ap.application_id = a.id
              AND COALESCE(ap.is_deleted, 0) = 0
              AND UPPER(COALESCE(ap.progress_status, '')) = 'AWAITING_VALIDATION'
            ORDER BY ps.stage_order ASC, ap.id ASC
            LIMIT 1
        ),
        (
            SELECT ap.id
            FROM application_progress ap
            JOIN pipeline_stage ps ON ps.id = ap.pipeline_stage_id
            WHERE ap.application_id = a.id
              AND COALESCE(ap.is_deleted, 0) = 0
              AND UPPER(COALESCE(ap.progress_status, '')) = 'PENDING'
            ORDER BY ps.stage_order ASC, ap.id ASC
            LIMIT 1
        ),
        (
            SELECT ap.id
            FROM application_progress ap
            JOIN pipeline_stage ps ON ps.id = ap.pipeline_stage_id
            WHERE ap.application_id = a.id
              AND COALESCE(ap.is_deleted, 0) = 0
            ORDER BY COALESCE(ap.completed_at, ap.started_at, ap.updated_at, ap.created_at) DESC,
                     ps.stage_order DESC,
                     ap.id DESC
            LIMIT 1
        )
    ) AS current_application_progress_id,
    (
        SELECT MAX(COALESCE(ap.completed_at, ap.started_at, ap.updated_at, ap.created_at))
        FROM application_progress ap
        WHERE ap.application_id = a.id
          AND COALESCE(ap.is_deleted, 0) = 0
    ) AS last_progressed_at
FROM applications a
WHERE COALESCE(a.is_deleted, 0) = 0;

UPDATE applications a
LEFT JOIN tmp_phase_b_current_progress current_progress
       ON current_progress.application_id = a.id
LEFT JOIN application_progress selected_progress
       ON selected_progress.id = current_progress.current_application_progress_id
LEFT JOIN tmp_phase_b_quiz_aggregates quiz_aggregate
       ON quiz_aggregate.application_id = a.id
LEFT JOIN tmp_phase_b_evaluation_aggregates evaluation_aggregate
       ON evaluation_aggregate.application_id = a.id
LEFT JOIN tmp_phase_b_stage_progress_stats quiz_progress_stats
       ON quiz_progress_stats.application_id = a.id
      AND quiz_progress_stats.stage_type = 'QUIZ'
      AND quiz_progress_stats.progress_count = 1
LEFT JOIN application_progress abandoned_progress
       ON abandoned_progress.id = quiz_progress_stats.only_application_progress_id
SET a.current_application_progress_id = current_progress.current_application_progress_id,
    a.current_pipeline_stage_id = CASE
        WHEN current_progress.current_application_progress_id IS NULL THEN a.current_pipeline_stage_id
        ELSE selected_progress.pipeline_stage_id
    END,
    a.last_progressed_at = COALESCE(current_progress.last_progressed_at, a.last_progressed_at, a.updated_at, a.created_at),
    a.aggregated_quiz_score = quiz_aggregate.aggregated_quiz_score,
    a.aggregated_quiz_score_percent = quiz_aggregate.aggregated_quiz_score_percent,
    a.aggregated_evaluation_score = evaluation_aggregate.aggregated_evaluation_score,
    a.aggregated_evaluation_score_percent = evaluation_aggregate.aggregated_evaluation_score_percent,
    a.abandoned_at = CASE
        WHEN COALESCE(a.application_abandoned, 0) = 1
            THEN COALESCE(a.abandoned_at, abandoned_progress.completed_at, a.quiz_last_activity_at, a.updated_at)
        ELSE a.abandoned_at
    END,
    a.abandon_reason = CASE
        WHEN COALESCE(a.application_abandoned, 0) = 1
             AND (a.abandon_reason IS NULL OR TRIM(a.abandon_reason) = '')
            THEN 'Cette candidature a ete abandonnee apres une periode d''inactivite.'
        ELSE a.abandon_reason
    END,
    a.abandoned_from_application_progress_id = CASE
        WHEN COALESCE(a.application_abandoned, 0) = 1
             AND a.abandoned_from_application_progress_id IS NULL
            THEN quiz_progress_stats.only_application_progress_id
        ELSE a.abandoned_from_application_progress_id
    END
WHERE COALESCE(a.is_deleted, 0) = 0;

-- -----------------------------------------------------------------------------
-- 7. Journaliser les cas ambigus ou incoherents pour arbitrage manuel
-- -----------------------------------------------------------------------------
INSERT INTO audit_event (
    application_id,
    application_progress_id,
    entity_type,
    entity_id,
    action_type,
    actor_user_id,
    justification,
    before_state_json,
    after_state_json,
    created_at
)
SELECT
    i.application_id,
    NULL,
    'INTERVIEW',
    CAST(i.id AS CHAR),
    'PHASE_B_INTERVIEW_REVIEW',
    0,
    CASE
        WHEN COALESCE(stats.progress_count, 0) = 0 THEN 'Aucun application_progress INTERVIEW legacy ne permet un rattachement automatique.'
        WHEN stats.progress_count > 1 THEN 'Plusieurs application_progress INTERVIEW existent pour cette candidature legacy.'
        ELSE 'Le rattachement interview -> application_progress doit etre arbitre manuellement.'
    END,
    JSON_OBJECT(
        'applicationId', i.application_id,
        'campaignId', i.campaign_id,
        'interviewStatus', i.interview_status,
        'legacyProgressCount', COALESCE(stats.progress_count, 0)
    ),
    NULL,
    CURRENT_TIMESTAMP
FROM interviews i
LEFT JOIN tmp_phase_b_stage_progress_stats stats
       ON stats.application_id = i.application_id
      AND stats.stage_type = 'INTERVIEW'
WHERE COALESCE(i.is_deleted, 0) = 0
  AND i.application_id IS NOT NULL
  AND i.application_progress_id IS NULL;

INSERT INTO audit_event (
    application_id,
    application_progress_id,
    entity_type,
    entity_id,
    action_type,
    actor_user_id,
    justification,
    before_state_json,
    after_state_json,
    created_at
)
SELECT
    d.application_id,
    NULL,
    'DECISION',
    CAST(d.id AS CHAR),
    'PHASE_B_DECISION_REVIEW',
    0,
    'La decision legacy n''a pas pu etre rattachee de maniere deterministe a application_progress.',
    JSON_OBJECT(
        'applicationId', d.application_id,
        'pipelineStageId', d.pipeline_stage_id,
        'decisionType', d.decision_type,
        'expectedStageType', CASE
            WHEN d.decision_type IN ('PRE_SCREEN_ACCEPTED', 'PRE_SCREEN_REJECTED') THEN 'PRESELECTION'
            WHEN d.decision_type IN ('FINAL_ACCEPTED', 'FINAL_REJECTED') THEN 'DECISION'
            ELSE NULL
        END
    ),
    NULL,
    CURRENT_TIMESTAMP
FROM decisions d
WHERE COALESCE(d.is_deleted, 0) = 0
  AND d.application_id IS NOT NULL
  AND d.application_progress_id IS NULL;

INSERT INTO audit_event (
    application_id,
    application_progress_id,
    entity_type,
    entity_id,
    action_type,
    actor_user_id,
    justification,
    before_state_json,
    after_state_json,
    created_at
)
SELECT
    candidate.application_id,
    NULL,
    'APPLICATION',
    CAST(candidate.application_id AS CHAR),
    'PHASE_B_QUIZ_REVIEW',
    0,
    CASE
        WHEN candidate.quiz_progress_count = 0 THEN 'Aucun application_progress QUIZ legacy ne permet de creer une tentative historique.'
        WHEN candidate.quiz_progress_count > 1 THEN 'Plusieurs application_progress QUIZ legacy existent pour cette candidature.'
        WHEN candidate.existing_attempt_count > 1 THEN 'Plusieurs application_quiz_attempt existent deja pour cette candidature.'
        ELSE 'La tentative quiz historique n''a pas pu etre backfillee automatiquement.'
    END,
    JSON_OBJECT(
        'applicationId', candidate.application_id,
        'quizProgressCount', candidate.quiz_progress_count,
        'existingAttemptCount', candidate.existing_attempt_count,
        'quizToken', candidate.quiz_token,
        'quizStatus', candidate.quiz_status
    ),
    NULL,
    CURRENT_TIMESTAMP
FROM tmp_phase_b_legacy_quiz_candidates candidate
LEFT JOIN tmp_phase_b_single_quiz_attempt single_attempt
       ON single_attempt.application_id = candidate.application_id
WHERE single_attempt.application_id IS NULL;

INSERT INTO audit_event (
    application_id,
    application_progress_id,
    entity_type,
    entity_id,
    action_type,
    actor_user_id,
    justification,
    before_state_json,
    after_state_json,
    created_at
)
SELECT
    ca.application_id,
    NULL,
    'APPLICATION',
    CAST(ca.application_id AS CHAR),
    'PHASE_B_ANSWER_REVIEW',
    0,
    'Certaines reponses legacy n''ont pas pu etre rattachees a une tentative quiz unique.',
    JSON_OBJECT(
        'applicationId', ca.application_id,
        'unlinkedAnswerCount', COUNT(*)
    ),
    NULL,
    CURRENT_TIMESTAMP
FROM candidate_answer ca
WHERE COALESCE(ca.is_deleted, 0) = 0
  AND ca.application_id IS NOT NULL
  AND ca.application_quiz_attempt_id IS NULL
GROUP BY ca.application_id;

INSERT INTO audit_event (
    application_id,
    application_progress_id,
    entity_type,
    entity_id,
    action_type,
    actor_user_id,
    justification,
    before_state_json,
    after_state_json,
    created_at
)
SELECT
    a.id,
    i.application_progress_id,
    'INTERVIEW',
    CAST(i.id AS CHAR),
    'PHASE_B_CAMPAIGN_MISMATCH',
    0,
    'interviews.campaign_id diverge de la campagne deduite via la candidature / le round.',
    JSON_OBJECT(
        'interviewCampaignId', i.campaign_id,
        'derivedCampaignId', st.campaign_id,
        'applicationId', a.id
    ),
    NULL,
    CURRENT_TIMESTAMP
FROM interviews i
JOIN applications a ON a.id = i.application_id
JOIN source_token st ON st.id = a.source_token_id
WHERE COALESCE(i.is_deleted, 0) = 0
  AND COALESCE(a.is_deleted, 0) = 0
  AND i.application_progress_id IS NOT NULL
  AND i.campaign_id IS NOT NULL
  AND st.campaign_id IS NOT NULL
  AND i.campaign_id <> st.campaign_id;

INSERT INTO audit_event (
    application_id,
    application_progress_id,
    entity_type,
    entity_id,
    action_type,
    actor_user_id,
    justification,
    before_state_json,
    after_state_json,
    created_at
)
SELECT
    COALESCE(ci.application_id, i.application_id),
    i.application_progress_id,
    'CANDIDATE_INTERVIEW',
    CAST(ci.id AS CHAR),
    'PHASE_B_LINK_MISMATCH',
    0,
    'candidate_interview.application_id diverge de interviews.application_id.',
    JSON_OBJECT(
        'candidateInterviewApplicationId', ci.application_id,
        'interviewApplicationId', i.application_id,
        'interviewId', ci.interview_id
    ),
    NULL,
    CURRENT_TIMESTAMP
FROM candidate_interview ci
JOIN interviews i ON i.id = ci.interview_id
WHERE COALESCE(ci.is_deleted, 0) = 0
  AND COALESCE(i.is_deleted, 0) = 0
  AND ci.application_id IS NOT NULL
  AND i.application_id IS NOT NULL
  AND ci.application_id <> i.application_id;

INSERT INTO audit_event (
    application_id,
    application_progress_id,
    entity_type,
    entity_id,
    action_type,
    actor_user_id,
    justification,
    before_state_json,
    after_state_json,
    created_at
)
SELECT
    a.id,
    NULL,
    'APPLICATION',
    CAST(a.id AS CHAR),
    'PHASE_B_ABANDON_REVIEW',
    0,
    'application_abandoned est positionne sans round d''origine deterministe.',
    JSON_OBJECT(
        'applicationId', a.id,
        'quizStatus', a.quiz_status,
        'applicationAbandoned', a.application_abandoned
    ),
    NULL,
    CURRENT_TIMESTAMP
FROM applications a
LEFT JOIN tmp_phase_b_stage_progress_stats stats
       ON stats.application_id = a.id
      AND stats.stage_type = 'QUIZ'
WHERE COALESCE(a.is_deleted, 0) = 0
  AND COALESCE(a.application_abandoned, 0) = 1
  AND a.abandoned_from_application_progress_id IS NULL;

-- -----------------------------------------------------------------------------
-- 8. Nettoyage des tables temporaires
-- -----------------------------------------------------------------------------
DROP TEMPORARY TABLE IF EXISTS tmp_phase_b_current_progress;
DROP TEMPORARY TABLE IF EXISTS tmp_phase_b_evaluation_aggregates;
DROP TEMPORARY TABLE IF EXISTS tmp_phase_b_quiz_aggregates;
DROP TEMPORARY TABLE IF EXISTS tmp_phase_b_single_quiz_attempt;
DROP TEMPORARY TABLE IF EXISTS tmp_phase_b_legacy_quiz_candidates;
DROP TEMPORARY TABLE IF EXISTS tmp_phase_b_stage_progress_stats;