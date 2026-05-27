ALTER TABLE form_questions
DROP INDEX uk_form_questions_form_version_question_order;

CREATE UNIQUE INDEX uk_form_questions_form_version_question_order
    ON form_questions (
        (CASE WHEN is_deleted = 0 OR is_deleted IS NULL THEN form_version_id END),
        (CASE WHEN is_deleted = 0 OR is_deleted IS NULL THEN question_order END)
    );