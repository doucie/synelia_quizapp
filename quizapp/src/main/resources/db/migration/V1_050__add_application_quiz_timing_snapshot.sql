ALTER TABLE applications
    ADD COLUMN quiz_timed_snapshot TINYINT(1) NOT NULL DEFAULT 0 AFTER time_elapsed,
    ADD COLUMN quiz_total_time_allowed_snapshot INT NULL AFTER quiz_timed_snapshot;

UPDATE applications a
LEFT JOIN source_token st ON st.id = a.source_token_id
LEFT JOIN campaigns c ON c.id = st.campaign_id
LEFT JOIN form_version fv ON fv.id = a.form_version_id
LEFT JOIN form f ON f.id = fv.form_id
LEFT JOIN (
    SELECT
        fq.form_version_id,
        SUM(
            CASE
                WHEN COALESCE(q.is_deleted, 0) = 1 THEN 0
                ELSE GREATEST(COALESCE(fq.chrono_override, q.question_chrono, 0), 0)
            END
        ) AS total_time_allowed
    FROM form_questions fq
    LEFT JOIN question q ON q.id = fq.question_id
    WHERE COALESCE(fq.is_deleted, 0) = 0
    GROUP BY fq.form_version_id
) timing ON timing.form_version_id = a.form_version_id
SET
    a.quiz_timed_snapshot = CASE
        WHEN a.form_version_id IS NULL THEN 0
        WHEN COALESCE(c.time_all_forms, 0) = 1 OR COALESCE(f.is_timed, 0) = 1 THEN 1
        ELSE 0
    END,
    a.quiz_total_time_allowed_snapshot = CASE
        WHEN a.form_version_id IS NULL THEN NULL
        WHEN COALESCE(c.time_all_forms, 0) = 1 OR COALESCE(f.is_timed, 0) = 1 THEN COALESCE(timing.total_time_allowed, 0)
        ELSE NULL
    END;