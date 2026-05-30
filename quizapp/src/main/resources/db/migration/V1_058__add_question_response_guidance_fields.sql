ALTER TABLE question
    ADD COLUMN all_answers_justification_required BIT(1) NOT NULL DEFAULT b'0' AFTER speciality_id,
    ADD COLUMN free_text_response_placeholder VARCHAR(255) NULL AFTER all_answers_justification_required;

UPDATE question
SET free_text_response_placeholder = 'Rédigez votre réponse ici...'
WHERE question_type = 'TEXT'
  AND (free_text_response_placeholder IS NULL OR TRIM(free_text_response_placeholder) = '');