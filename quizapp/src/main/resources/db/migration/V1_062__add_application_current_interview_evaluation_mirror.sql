ALTER TABLE applications
    ADD COLUMN current_interview_evaluation_score INT NULL AFTER interview_status,
    ADD COLUMN current_interview_evaluation_number INT NULL AFTER current_interview_evaluation_score,
    ADD COLUMN current_interview_evaluation_percentage DOUBLE NULL AFTER current_interview_evaluation_number;

UPDATE applications a
LEFT JOIN (
    SELECT
        i1.application_id,
        i1.evaluation_score,
        i1.evaluation_number,
        i1.evaluation_percentage
    FROM interviews i1
    LEFT JOIN interviews i2
        ON i2.application_id = i1.application_id
       AND COALESCE(i2.is_deleted, 0) = 0
       AND (
            CASE COALESCE(i2.interview_status, '')
                WHEN 'STARTED' THEN 0
                WHEN 'SCHEDULED' THEN 1
                WHEN 'POSTPONED' THEN 2
                WHEN 'PENDING' THEN 3
                WHEN 'OVER' THEN 4
                WHEN 'PASSED' THEN 5
                WHEN 'FAILED' THEN 6
                WHEN 'ARCHIVED' THEN 7
                ELSE 99
            END
            <
            CASE COALESCE(i1.interview_status, '')
                WHEN 'STARTED' THEN 0
                WHEN 'SCHEDULED' THEN 1
                WHEN 'POSTPONED' THEN 2
                WHEN 'PENDING' THEN 3
                WHEN 'OVER' THEN 4
                WHEN 'PASSED' THEN 5
                WHEN 'FAILED' THEN 6
                WHEN 'ARCHIVED' THEN 7
                ELSE 99
            END
            OR (
                CASE COALESCE(i2.interview_status, '')
                    WHEN 'STARTED' THEN 0
                    WHEN 'SCHEDULED' THEN 1
                    WHEN 'POSTPONED' THEN 2
                    WHEN 'PENDING' THEN 3
                    WHEN 'OVER' THEN 4
                    WHEN 'PASSED' THEN 5
                    WHEN 'FAILED' THEN 6
                    WHEN 'ARCHIVED' THEN 7
                    ELSE 99
                END
                =
                CASE COALESCE(i1.interview_status, '')
                    WHEN 'STARTED' THEN 0
                    WHEN 'SCHEDULED' THEN 1
                    WHEN 'POSTPONED' THEN 2
                    WHEN 'PENDING' THEN 3
                    WHEN 'OVER' THEN 4
                    WHEN 'PASSED' THEN 5
                    WHEN 'FAILED' THEN 6
                    WHEN 'ARCHIVED' THEN 7
                    ELSE 99
                END
                AND COALESCE(i2.interview_date, TIMESTAMP('1000-01-01 00:00:00')) > COALESCE(i1.interview_date, TIMESTAMP('1000-01-01 00:00:00'))
            )
            OR (
                CASE COALESCE(i2.interview_status, '')
                    WHEN 'STARTED' THEN 0
                    WHEN 'SCHEDULED' THEN 1
                    WHEN 'POSTPONED' THEN 2
                    WHEN 'PENDING' THEN 3
                    WHEN 'OVER' THEN 4
                    WHEN 'PASSED' THEN 5
                    WHEN 'FAILED' THEN 6
                    WHEN 'ARCHIVED' THEN 7
                    ELSE 99
                END
                =
                CASE COALESCE(i1.interview_status, '')
                    WHEN 'STARTED' THEN 0
                    WHEN 'SCHEDULED' THEN 1
                    WHEN 'POSTPONED' THEN 2
                    WHEN 'PENDING' THEN 3
                    WHEN 'OVER' THEN 4
                    WHEN 'PASSED' THEN 5
                    WHEN 'FAILED' THEN 6
                    WHEN 'ARCHIVED' THEN 7
                    ELSE 99
                END
                AND COALESCE(i2.interview_date, TIMESTAMP('1000-01-01 00:00:00')) = COALESCE(i1.interview_date, TIMESTAMP('1000-01-01 00:00:00'))
                AND COALESCE(i2.id, 0) > COALESCE(i1.id, 0)
            )
       )
    WHERE COALESCE(i1.is_deleted, 0) = 0
      AND i2.id IS NULL
) current_interview ON current_interview.application_id = a.id
SET
    a.current_interview_evaluation_score = current_interview.evaluation_score,
    a.current_interview_evaluation_number = current_interview.evaluation_number,
    a.current_interview_evaluation_percentage = current_interview.evaluation_percentage;