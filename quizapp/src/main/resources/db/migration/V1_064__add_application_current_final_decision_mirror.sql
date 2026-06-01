ALTER TABLE applications
    ADD COLUMN current_final_decision_type VARCHAR(50) NULL AFTER current_preselection_decision_date,
    ADD COLUMN current_final_decision_date DATETIME NULL AFTER current_final_decision_type;

UPDATE applications a
LEFT JOIN (
    SELECT
        d1.application_id,
        d1.decision_type,
        COALESCE(d1.updated_at, d1.created_at) AS decision_date
    FROM decisions d1
    LEFT JOIN decisions d2
        ON d2.application_id = d1.application_id
       AND COALESCE(d2.is_deleted, 0) = 0
       AND COALESCE(d2.is_cancel, 0) = 0
       AND d2.decision_type IN ('FINAL_ACCEPTED', 'FINAL_REJECTED')
       AND (
            COALESCE(d2.updated_at, d2.created_at, TIMESTAMP('1000-01-01 00:00:00')) > COALESCE(d1.updated_at, d1.created_at, TIMESTAMP('1000-01-01 00:00:00'))
            OR (
                COALESCE(d2.updated_at, d2.created_at, TIMESTAMP('1000-01-01 00:00:00')) = COALESCE(d1.updated_at, d1.created_at, TIMESTAMP('1000-01-01 00:00:00'))
                AND COALESCE(d2.id, 0) > COALESCE(d1.id, 0)
            )
       )
    WHERE COALESCE(d1.is_deleted, 0) = 0
      AND COALESCE(d1.is_cancel, 0) = 0
      AND d1.decision_type IN ('FINAL_ACCEPTED', 'FINAL_REJECTED')
      AND d2.id IS NULL
) current_final_decision ON current_final_decision.application_id = a.id
SET
    a.current_final_decision_type = current_final_decision.decision_type,
    a.current_final_decision_date = current_final_decision.decision_date;