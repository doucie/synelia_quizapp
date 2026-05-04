ALTER TABLE `candidate_ask`
    ADD COLUMN `ask_status` VARCHAR(20) NOT NULL DEFAULT 'PENDING' AFTER `request_type`,
    ADD COLUMN `decision_reason` VARCHAR(500) DEFAULT NULL AFTER `new_phone`;

UPDATE `candidate_ask`
SET `ask_status` = CASE
    WHEN `is_verified` = 1 THEN 'APPROVED'
    ELSE 'PENDING'
END
WHERE `ask_status` IS NULL
   OR `ask_status` = '';