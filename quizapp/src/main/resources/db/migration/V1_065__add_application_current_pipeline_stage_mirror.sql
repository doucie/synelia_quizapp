ALTER TABLE applications
    ADD COLUMN current_pipeline_stage_type VARCHAR(50) NULL AFTER current_final_decision_date,
    ADD COLUMN current_pipeline_stage_label VARCHAR(255) NULL AFTER current_pipeline_stage_type,
    ADD COLUMN current_pipeline_progress_status VARCHAR(20) NULL AFTER current_pipeline_stage_label;

UPDATE applications a
LEFT JOIN (
    SELECT
        ap1.application_id,
        ps.stage_type,
        ps.stage_label,
        ap1.progress_status
    FROM application_progress ap1
    INNER JOIN pipeline_stage ps ON ps.id = ap1.pipeline_stage_id
    LEFT JOIN application_progress ap2
        ON ap2.application_id = ap1.application_id
       AND COALESCE(ap2.is_deleted, 0) = 0
       AND ap2.progress_status IN ('IN_PROGRESS', 'PENDING')
       AND (
            CASE ap2.progress_status
                WHEN 'IN_PROGRESS' THEN 0
                WHEN 'PENDING' THEN 1
                ELSE 99
            END
            <
            CASE ap1.progress_status
                WHEN 'IN_PROGRESS' THEN 0
                WHEN 'PENDING' THEN 1
                ELSE 99
            END
            OR (
                CASE ap2.progress_status
                    WHEN 'IN_PROGRESS' THEN 0
                    WHEN 'PENDING' THEN 1
                    ELSE 99
                END
                =
                CASE ap1.progress_status
                    WHEN 'IN_PROGRESS' THEN 0
                    WHEN 'PENDING' THEN 1
                    ELSE 99
                END
                AND COALESCE((SELECT ps2.stage_order FROM pipeline_stage ps2 WHERE ps2.id = ap2.pipeline_stage_id), 999999) < COALESCE(ps.stage_order, 999999)
            )
            OR (
                CASE ap2.progress_status
                    WHEN 'IN_PROGRESS' THEN 0
                    WHEN 'PENDING' THEN 1
                    ELSE 99
                END
                =
                CASE ap1.progress_status
                    WHEN 'IN_PROGRESS' THEN 0
                    WHEN 'PENDING' THEN 1
                    ELSE 99
                END
                AND COALESCE((SELECT ps2.stage_order FROM pipeline_stage ps2 WHERE ps2.id = ap2.pipeline_stage_id), 999999) = COALESCE(ps.stage_order, 999999)
                AND COALESCE(ap2.id, 0) < COALESCE(ap1.id, 0)
            )
       )
    WHERE COALESCE(ap1.is_deleted, 0) = 0
      AND ap1.progress_status IN ('IN_PROGRESS', 'PENDING')
      AND ap2.id IS NULL
) current_pipeline_stage ON current_pipeline_stage.application_id = a.id
SET
    a.current_pipeline_stage_type = current_pipeline_stage.stage_type,
    a.current_pipeline_stage_label = current_pipeline_stage.stage_label,
    a.current_pipeline_progress_status = current_pipeline_stage.progress_status;