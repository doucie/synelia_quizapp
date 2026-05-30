ALTER TABLE question
    ADD COLUMN manual_correction_required BIT(1) NOT NULL DEFAULT b'0' AFTER all_answers_justification_required;

ALTER TABLE candidate_answer
    ADD COLUMN manual_correction_score INT NULL AFTER manual_correction_comment;