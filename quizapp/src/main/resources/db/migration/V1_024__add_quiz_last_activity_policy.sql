ALTER TABLE `applications`
    ADD COLUMN `quiz_last_activity_at` TIMESTAMP NULL AFTER `time_elapsed`;

UPDATE `applications`
SET `quiz_last_activity_at` = `updated_at`
WHERE `quiz_status` = 'STARTED'
  AND `quiz_last_activity_at` IS NULL;