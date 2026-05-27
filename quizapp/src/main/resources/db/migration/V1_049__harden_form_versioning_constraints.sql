ALTER TABLE form_version
ADD CONSTRAINT uk_form_version_form_id_version_number
UNIQUE (form_id, version_number);

ALTER TABLE form_questions
ADD CONSTRAINT uk_form_questions_form_version_question_order
UNIQUE (form_version_id, question_order);