-- =============================================================================
-- V1_067 : backfill missing legacy pipeline runtime
-- V1_010 skipped the seeded uppercase application statuses from V1_006
-- (`ACTIVE`, `PENDING`, `REJECT`), leaving some legacy applications without
-- any `application_progress` or `application_quiz_attempt` runtime rows.
-- This migration recreates that minimal runtime state for the remaining
-- orphan applications.
-- =============================================================================

DROP TEMPORARY TABLE IF EXISTS tmp_v1067_target_apps;
DROP TEMPORARY TABLE IF EXISTS tmp_v1067_single_interview_progress;
DROP TEMPORARY TABLE IF EXISTS tmp_v1067_quiz_candidates;
DROP TEMPORARY TABLE IF EXISTS tmp_v1067_single_quiz_attempt;
DROP TEMPORARY TABLE IF EXISTS tmp_v1067_current_progress;
DROP TEMPORARY TABLE IF EXISTS tmp_v1067_progress_summary;

CREATE TEMPORARY TABLE tmp_v1067_target_apps AS
SELECT
    a.id AS application_id,
    st.campaign_id,
    c.pipeline_template_id,
    UPPER(TRIM(COALESCE(a.application_status, ''))) AS legacy_application_status,
    UPPER(TRIM(COALESCE(a.quiz_status, 'PENDING'))) AS legacy_quiz_status,
    UPPER(TRIM(COALESCE(a.interview_status, ''))) AS legacy_interview_status,
    UPPER(TRIM(COALESCE(a.current_preselection_decision_type, ''))) AS current_preselection_decision_type,
    UPPER(TRIM(COALESCE(a.current_final_decision_type, ''))) AS current_final_decision_type,
    a.quiz_token,
    a.quiz_score,
    a.quiz_score_percent,
    a.quiz_level,
    a.total_questions,
    a.quiz_manual_correction_status,
    a.time_elapsed,
    a.quiz_timed_snapshot,
    a.quiz_total_time_allowed_snapshot,
    a.quiz_last_activity_at,
    a.interview_date,
    a.interview_status,
    a.total_evaluation_score,
    a.total_evaluation_number,
    a.total_evaluation_percentage,
    a.current_interview_evaluation_score,
    a.current_interview_evaluation_number,
    a.current_interview_evaluation_percentage,
    a.source_token_id,
    a.form_version_id,
    a.created_at,
    a.created_by,
    a.updated_at,
    a.updated_by,
    a.search_string
FROM applications a
JOIN source_token st ON st.id = a.source_token_id
JOIN campaigns c ON c.id = st.campaign_id
WHERE COALESCE(a.is_deleted, 0) = 0
  AND c.pipeline_template_id IS NOT NULL
    AND (
                NOT EXISTS (
                        SELECT 1
                        FROM application_progress ap
                        WHERE ap.application_id = a.id
                            AND COALESCE(ap.is_deleted, 0) = 0
                )
                OR a.current_application_progress_id IS NULL
                OR a.current_pipeline_stage_id IS NULL
                OR a.current_pipeline_stage_type IS NULL
                OR (
                        (
                                a.quiz_token IS NOT NULL
                                OR UPPER(TRIM(COALESCE(a.quiz_status, 'PENDING'))) <> 'PENDING'
                                OR a.quiz_score IS NOT NULL
                                OR a.quiz_score_percent IS NOT NULL
                                OR a.quiz_level IS NOT NULL
                                OR a.total_questions IS NOT NULL
                                OR COALESCE(a.time_elapsed, 0) > 0
                                OR a.quiz_last_activity_at IS NOT NULL
                                OR UPPER(TRIM(COALESCE(a.quiz_manual_correction_status, 'NOT_REQUIRED'))) <> 'NOT_REQUIRED'
                                OR EXISTS (
                                        SELECT 1
                                        FROM candidate_answer ca
                                        WHERE ca.application_id = a.id
                                            AND COALESCE(ca.is_deleted, 0) = 0
                                )
                        )
                        AND NOT EXISTS (
                                SELECT 1
                                FROM application_quiz_attempt aqa
                                WHERE aqa.application_id = a.id
                                    AND COALESCE(aqa.is_deleted, 0) = 0
                        )
                )
                OR EXISTS (
                        SELECT 1
                        FROM interviews i
                        WHERE i.application_id = a.id
                            AND COALESCE(i.is_deleted, 0) = 0
                            AND i.application_progress_id IS NULL
                )
        );

INSERT INTO application_progress (
    application_id,
    pipeline_stage_id,
    progress_status,
    started_at,
    completed_at,
    score,
    created_at,
    created_by,
    updated_at,
    updated_by,
    is_deleted,
    search_string
)
SELECT
    projected.application_id,
    projected.pipeline_stage_id,
    projected.progress_status,
    CASE
        WHEN projected.stage_type = 'CANDIDATURE' THEN projected.created_at
        WHEN projected.progress_status = 'PENDING' THEN NULL
        WHEN projected.stage_type = 'QUIZ' THEN COALESCE(projected.quiz_last_activity_at, projected.updated_at, projected.created_at)
        WHEN projected.stage_type = 'INTERVIEW' THEN COALESCE(projected.interview_date, projected.updated_at, projected.created_at)
        ELSE COALESCE(projected.updated_at, projected.created_at)
    END AS started_at,
    CASE
        WHEN projected.stage_type = 'CANDIDATURE' THEN projected.created_at
        WHEN projected.progress_status IN ('PASSED', 'FAILED', 'SKIPPED') AND projected.stage_type = 'QUIZ'
            THEN COALESCE(projected.quiz_last_activity_at, projected.updated_at, projected.created_at)
        WHEN projected.progress_status IN ('PASSED', 'FAILED', 'SKIPPED') AND projected.stage_type IN ('INTERVIEW', 'EVALUATION')
            THEN COALESCE(projected.updated_at, projected.interview_date, projected.created_at)
        WHEN projected.progress_status IN ('PASSED', 'FAILED', 'SKIPPED')
            THEN COALESCE(projected.updated_at, projected.created_at)
        ELSE NULL
    END AS completed_at,
    projected.score,
    projected.created_at,
    projected.created_by,
    projected.updated_at,
    projected.updated_by,
    FALSE,
    projected.search_string
FROM (
    SELECT
        ta.application_id,
        ps.id AS pipeline_stage_id,
        UPPER(ps.stage_type) AS stage_type,
        ps.stage_order,
        CASE
            WHEN UPPER(ps.stage_type) = 'CANDIDATURE' THEN 'PASSED'
            WHEN UPPER(ps.stage_type) = 'QUIZ' THEN CASE
                WHEN ta.legacy_quiz_status IN ('DONE', 'COMPLETED', 'PASSED') THEN 'PASSED'
                WHEN ta.legacy_quiz_status IN ('STARTED', 'IN_PROGRESS') THEN 'IN_PROGRESS'
                WHEN ta.legacy_quiz_status IN ('FAILED', 'EXPIRED') THEN 'FAILED'
                WHEN ta.legacy_quiz_status IN ('CANCELLED', 'ARCHIVED') THEN 'SKIPPED'
                ELSE 'PENDING'
            END
            WHEN UPPER(ps.stage_type) = 'PRESELECTION' THEN CASE
                WHEN ta.current_preselection_decision_type IN ('PRE_SCREEN_REJECTED', 'REJECT', 'REJECTED')
                     OR ta.legacy_application_status IN ('PRE_SCREEN_REJECTED', 'REJECT', 'REJECTED')
                    THEN 'FAILED'
                WHEN ta.current_preselection_decision_type IN ('PRE_SCREEN_ACCEPTED', 'ACCEPTED')
                     OR ta.interview_date IS NOT NULL
                     OR ta.legacy_interview_status <> ''
                     OR ta.current_interview_evaluation_score IS NOT NULL
                     OR ta.total_evaluation_score IS NOT NULL
                     OR ta.current_final_decision_type <> ''
                    THEN 'PASSED'
                WHEN ta.legacy_quiz_status IN ('DONE', 'COMPLETED', 'PASSED')
                    THEN 'IN_PROGRESS'
                ELSE 'PENDING'
            END
            WHEN UPPER(ps.stage_type) = 'INTERVIEW' THEN CASE
                WHEN ta.current_final_decision_type <> ''
                     OR ta.current_interview_evaluation_score IS NOT NULL
                     OR ta.total_evaluation_score IS NOT NULL
                     OR ta.legacy_interview_status IN ('COMPLETED', 'OVER', 'PASSED')
                    THEN 'PASSED'
                WHEN ta.legacy_interview_status = 'FAILED'
                    THEN 'FAILED'
                WHEN ta.interview_date IS NOT NULL
                     OR ta.legacy_interview_status IN ('SCHEDULED', 'STARTED', 'POSTPONED', 'RESCHEDULE_REQUESTED')
                    THEN 'IN_PROGRESS'
                ELSE 'PENDING'
            END
            WHEN UPPER(ps.stage_type) = 'EVALUATION' THEN CASE
                WHEN ta.current_final_decision_type <> ''
                     OR ta.current_interview_evaluation_score IS NOT NULL
                     OR ta.total_evaluation_score IS NOT NULL
                    THEN 'PASSED'
                WHEN ta.legacy_interview_status IN ('COMPLETED', 'OVER', 'PASSED', 'FAILED')
                    THEN 'IN_PROGRESS'
                ELSE 'PENDING'
            END
            WHEN UPPER(ps.stage_type) = 'DECISION' THEN CASE
                WHEN ta.current_final_decision_type IN ('FINAL_REJECTED', 'REJECT', 'REJECTED')
                     OR ta.legacy_application_status = 'FINAL_REJECTED'
                    THEN 'FAILED'
                WHEN ta.current_final_decision_type IN ('FINAL_ACCEPTED', 'ACCEPTED')
                     OR ta.legacy_application_status = 'FINAL_ACCEPTED'
                    THEN 'PASSED'
                WHEN ta.current_interview_evaluation_score IS NOT NULL
                     OR ta.total_evaluation_score IS NOT NULL
                    THEN 'IN_PROGRESS'
                ELSE 'PENDING'
            END
            ELSE 'PENDING'
        END AS progress_status,
        CASE
            WHEN UPPER(ps.stage_type) = 'QUIZ'
                THEN COALESCE(a.quiz_score_percent, a.quiz_score)
            WHEN UPPER(ps.stage_type) = 'EVALUATION'
                THEN COALESCE(a.current_interview_evaluation_percentage, a.total_evaluation_percentage,
                              a.current_interview_evaluation_score, a.total_evaluation_score)
            ELSE NULL
        END AS score,
        ta.created_at,
        ta.created_by,
        COALESCE(ta.updated_at, ta.interview_date, ta.quiz_last_activity_at, ta.created_at) AS updated_at,
        ta.updated_by,
        ta.quiz_last_activity_at,
        ta.interview_date,
        ta.search_string
    FROM tmp_v1067_target_apps ta
    JOIN applications a ON a.id = ta.application_id
    JOIN pipeline_stage ps ON ps.pipeline_template_id = ta.pipeline_template_id
    WHERE COALESCE(ps.is_deleted, 0) = 0
) projected
WHERE NOT EXISTS (
    SELECT 1
    FROM application_progress existing_progress
    WHERE existing_progress.application_id = projected.application_id
      AND existing_progress.pipeline_stage_id = projected.pipeline_stage_id
      AND COALESCE(existing_progress.is_deleted, 0) = 0
);

CREATE TEMPORARY TABLE tmp_v1067_quiz_candidates AS
SELECT
    ta.application_id,
    quiz_progress.id AS application_progress_id,
    ta.form_version_id,
    ta.quiz_token,
    ta.legacy_quiz_status AS quiz_status,
    CASE
        WHEN JSON_VALID(ps.config_json) = 1
             AND JSON_EXTRACT(ps.config_json, '$.passingScore') IS NOT NULL
             AND JSON_UNQUOTE(JSON_EXTRACT(ps.config_json, '$.passingScore')) REGEXP '^-?[0-9]+(\.[0-9]+)?$'
            THEN 'AUTO_THRESHOLD'
        ELSE 'NONE'
    END AS screening_mode,
    CASE
        WHEN JSON_VALID(ps.config_json) = 1
             AND JSON_EXTRACT(ps.config_json, '$.passingScore') IS NOT NULL
             AND JSON_UNQUOTE(JSON_EXTRACT(ps.config_json, '$.passingScore')) REGEXP '^-?[0-9]+(\.[0-9]+)?$'
            THEN CAST(JSON_UNQUOTE(JSON_EXTRACT(ps.config_json, '$.passingScore')) AS DECIMAL(10,2))
        ELSE NULL
    END AS screening_threshold,
    CASE
        WHEN UPPER(COALESCE(quiz_progress.progress_status, '')) = 'PASSED' THEN 'PASSED'
        WHEN UPPER(COALESCE(quiz_progress.progress_status, '')) = 'FAILED' THEN 'FAILED'
        ELSE NULL
    END AS screening_result,
    ta.quiz_score AS score,
    ta.quiz_score_percent AS score_percent,
    COALESCE(NULLIF(ta.quiz_manual_correction_status, ''), 'NOT_REQUIRED') AS manual_correction_status,
    ta.total_questions,
    COALESCE(ta.time_elapsed, 0) AS time_elapsed,
    COALESCE(ta.quiz_timed_snapshot, 0) AS timed_snapshot,
    ta.quiz_total_time_allowed_snapshot AS total_time_allowed_snapshot,
    ta.quiz_last_activity_at AS last_activity_at,
    CASE
        WHEN ta.legacy_quiz_status IN ('STARTED', 'DONE', 'COMPLETED', 'PASSED', 'FAILED', 'EXPIRED')
            THEN COALESCE(ta.quiz_last_activity_at, ta.updated_at, ta.created_at)
        ELSE NULL
    END AS started_at,
    CASE
        WHEN ta.legacy_quiz_status IN ('DONE', 'COMPLETED', 'PASSED', 'FAILED', 'EXPIRED')
            THEN COALESCE(ta.quiz_last_activity_at, ta.updated_at, ta.created_at)
        ELSE NULL
    END AS completed_at,
    ta.created_at,
    ta.created_by,
    COALESCE(ta.updated_at, ta.quiz_last_activity_at, ta.created_at) AS updated_at,
    ta.updated_by,
    ta.search_string,
    (
        SELECT COUNT(*)
        FROM application_quiz_attempt existing_attempt
        WHERE existing_attempt.application_id = ta.application_id
          AND COALESCE(existing_attempt.is_deleted, 0) = 0
    ) AS existing_attempt_count
FROM tmp_v1067_target_apps ta
JOIN application_progress quiz_progress
  ON quiz_progress.application_id = ta.application_id
JOIN pipeline_stage ps
  ON ps.id = quiz_progress.pipeline_stage_id
WHERE COALESCE(quiz_progress.is_deleted, 0) = 0
  AND UPPER(ps.stage_type) = 'QUIZ'
  AND (
        ta.quiz_token IS NOT NULL
        OR ta.legacy_quiz_status <> 'PENDING'
        OR ta.quiz_score IS NOT NULL
        OR ta.quiz_score_percent IS NOT NULL
        OR ta.quiz_level IS NOT NULL
        OR ta.total_questions IS NOT NULL
        OR COALESCE(ta.time_elapsed, 0) > 0
        OR ta.quiz_last_activity_at IS NOT NULL
        OR UPPER(COALESCE(ta.quiz_manual_correction_status, 'NOT_REQUIRED')) <> 'NOT_REQUIRED'
        OR UPPER(COALESCE(quiz_progress.progress_status, 'PENDING')) <> 'PENDING'
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
FROM tmp_v1067_quiz_candidates candidate
WHERE candidate.application_progress_id IS NOT NULL
  AND candidate.existing_attempt_count = 0;

CREATE TEMPORARY TABLE tmp_v1067_single_quiz_attempt AS
SELECT
    aqa.application_id,
    MIN(aqa.id) AS application_quiz_attempt_id,
    COUNT(*) AS attempt_count
FROM application_quiz_attempt aqa
WHERE COALESCE(aqa.is_deleted, 0) = 0
  AND aqa.application_id IN (SELECT application_id FROM tmp_v1067_target_apps)
GROUP BY aqa.application_id
HAVING COUNT(*) = 1;

UPDATE candidate_answer ca
JOIN tmp_v1067_single_quiz_attempt aqa
  ON aqa.application_id = ca.application_id
SET ca.application_quiz_attempt_id = aqa.application_quiz_attempt_id
WHERE COALESCE(ca.is_deleted, 0) = 0
  AND ca.application_id IN (SELECT application_id FROM tmp_v1067_target_apps)
  AND ca.application_quiz_attempt_id IS NULL;

CREATE TEMPORARY TABLE tmp_v1067_single_interview_progress AS
SELECT
    ap.application_id,
    MIN(ap.id) AS application_progress_id,
    COUNT(*) AS progress_count
FROM application_progress ap
JOIN pipeline_stage ps ON ps.id = ap.pipeline_stage_id
WHERE COALESCE(ap.is_deleted, 0) = 0
  AND ap.application_id IN (SELECT application_id FROM tmp_v1067_target_apps)
  AND UPPER(ps.stage_type) = 'INTERVIEW'
GROUP BY ap.application_id
HAVING COUNT(*) = 1;

UPDATE interviews i
JOIN tmp_v1067_single_interview_progress stats
  ON stats.application_id = i.application_id
SET i.application_progress_id = stats.application_progress_id
WHERE COALESCE(i.is_deleted, 0) = 0
  AND i.application_progress_id IS NULL;

CREATE TEMPORARY TABLE tmp_v1067_current_progress AS
SELECT
    target.application_id,
    COALESCE(
        (
            SELECT ap.id
            FROM application_progress ap
            JOIN pipeline_stage ps ON ps.id = ap.pipeline_stage_id
            WHERE ap.application_id = target.application_id
              AND COALESCE(ap.is_deleted, 0) = 0
              AND UPPER(COALESCE(ap.progress_status, '')) = 'IN_PROGRESS'
            ORDER BY ps.stage_order ASC, ap.id ASC
            LIMIT 1
        ),
        (
            SELECT ap.id
            FROM application_progress ap
            JOIN pipeline_stage ps ON ps.id = ap.pipeline_stage_id
            WHERE ap.application_id = target.application_id
              AND COALESCE(ap.is_deleted, 0) = 0
              AND UPPER(COALESCE(ap.progress_status, '')) = 'PENDING'
            ORDER BY ps.stage_order ASC, ap.id ASC
            LIMIT 1
        ),
        (
            SELECT ap.id
            FROM application_progress ap
            JOIN pipeline_stage ps ON ps.id = ap.pipeline_stage_id
            WHERE ap.application_id = target.application_id
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
        WHERE ap.application_id = target.application_id
          AND COALESCE(ap.is_deleted, 0) = 0
    ) AS last_progressed_at
FROM tmp_v1067_target_apps target;

CREATE TEMPORARY TABLE tmp_v1067_progress_summary AS
SELECT
    ap.application_id,
    MAX(CASE WHEN UPPER(ps.stage_type) = 'PRESELECTION' AND UPPER(ap.progress_status) = 'PASSED' THEN 1 ELSE 0 END) AS preselection_passed,
    MAX(CASE WHEN UPPER(ps.stage_type) = 'PRESELECTION' AND UPPER(ap.progress_status) = 'FAILED' THEN 1 ELSE 0 END) AS preselection_failed,
    MAX(CASE WHEN UPPER(ps.stage_type) = 'DECISION' AND UPPER(ap.progress_status) = 'FAILED' THEN 1 ELSE 0 END) AS decision_failed,
    SUM(CASE WHEN UPPER(COALESCE(ap.progress_status, 'PENDING')) NOT IN ('PASSED', 'FAILED', 'SKIPPED') THEN 1 ELSE 0 END) AS unresolved_count,
    SUM(CASE WHEN UPPER(COALESCE(ap.progress_status, 'PENDING')) IN ('PASSED', 'FAILED', 'SKIPPED', 'IN_PROGRESS') THEN 1 ELSE 0 END) AS started_count
FROM application_progress ap
JOIN pipeline_stage ps ON ps.id = ap.pipeline_stage_id
WHERE COALESCE(ap.is_deleted, 0) = 0
  AND ap.application_id IN (SELECT application_id FROM tmp_v1067_target_apps)
GROUP BY ap.application_id;

UPDATE applications a
LEFT JOIN tmp_v1067_current_progress current_progress
       ON current_progress.application_id = a.id
LEFT JOIN application_progress selected_progress
       ON selected_progress.id = current_progress.current_application_progress_id
LEFT JOIN pipeline_stage selected_stage
       ON selected_stage.id = selected_progress.pipeline_stage_id
LEFT JOIN tmp_v1067_progress_summary summary
       ON summary.application_id = a.id
SET a.current_application_progress_id = current_progress.current_application_progress_id,
    a.current_pipeline_stage_id = CASE
        WHEN current_progress.current_application_progress_id IS NULL THEN a.current_pipeline_stage_id
        ELSE selected_progress.pipeline_stage_id
    END,
    a.current_pipeline_stage_type = CASE
        WHEN current_progress.current_application_progress_id IS NULL THEN a.current_pipeline_stage_type
        ELSE selected_stage.stage_type
    END,
    a.current_pipeline_stage_label = CASE
        WHEN current_progress.current_application_progress_id IS NULL THEN a.current_pipeline_stage_label
        ELSE selected_stage.stage_label
    END,
    a.current_pipeline_progress_status = CASE
        WHEN current_progress.current_application_progress_id IS NULL THEN a.current_pipeline_progress_status
        ELSE selected_progress.progress_status
    END,
    a.last_progressed_at = COALESCE(current_progress.last_progressed_at, a.last_progressed_at, a.updated_at, a.created_at),
    a.aggregated_quiz_score = COALESCE(a.aggregated_quiz_score, a.quiz_score),
    a.aggregated_quiz_score_percent = COALESCE(a.aggregated_quiz_score_percent, a.quiz_score_percent),
    a.aggregated_evaluation_score = COALESCE(a.aggregated_evaluation_score, a.total_evaluation_score),
    a.aggregated_evaluation_score_percent = COALESCE(a.aggregated_evaluation_score_percent, a.total_evaluation_percentage)
WHERE a.id IN (SELECT application_id FROM tmp_v1067_target_apps);

DROP TEMPORARY TABLE IF EXISTS tmp_v1067_progress_summary;
DROP TEMPORARY TABLE IF EXISTS tmp_v1067_current_progress;
DROP TEMPORARY TABLE IF EXISTS tmp_v1067_single_quiz_attempt;
DROP TEMPORARY TABLE IF EXISTS tmp_v1067_quiz_candidates;
DROP TEMPORARY TABLE IF EXISTS tmp_v1067_single_interview_progress;
DROP TEMPORARY TABLE IF EXISTS tmp_v1067_target_apps;