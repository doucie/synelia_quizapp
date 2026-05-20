-- V1_046 : aligne campaigns.time_all_forms sur la decision metier finale (flag booleen)

UPDATE campaigns
SET time_all_forms = CASE
    WHEN COALESCE(time_all_forms, 0) > 0 THEN 1
    ELSE 0
END;

ALTER TABLE campaigns
    MODIFY COLUMN time_all_forms TINYINT(1) NOT NULL DEFAULT 0;