ALTER TABLE `applications`
    ADD COLUMN `quiz_manual_correction_status` VARCHAR(20) NOT NULL DEFAULT 'NOT_REQUIRED' AFTER `quiz_score_percent`;

UPDATE `applications`
SET `quiz_manual_correction_status` = 'NOT_REQUIRED'
WHERE `quiz_manual_correction_status` IS NULL;

ALTER TABLE `candidate_answer`
    ADD COLUMN `manual_is_correct` BOOLEAN NULL AFTER `is_selected`,
    ADD COLUMN `manual_correction_comment` TEXT NULL AFTER `manual_is_correct`,
    ADD COLUMN `manual_corrected_at` TIMESTAMP NULL AFTER `manual_correction_comment`,
    ADD COLUMN `manual_corrected_by` INT NULL AFTER `manual_corrected_at`;