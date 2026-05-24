-- V1_048 : evolution du modele de reponse vers format de contenu + commentaire additionnel

UPDATE answer
SET answer_type = CASE
    WHEN answer_type IS NULL OR TRIM(answer_type) = '' THEN 'TEXT'
    WHEN UPPER(answer_type) IN ('FIXED', 'FREE', 'TEXT') THEN 'TEXT'
    WHEN UPPER(answer_type) = 'IMAGE' THEN 'IMAGE'
    WHEN UPPER(answer_type) = 'CODE' THEN 'CODE'
    ELSE 'TEXT'
END;

ALTER TABLE answer
    MODIFY COLUMN answer_type VARCHAR(20) NOT NULL DEFAULT 'TEXT',
    ADD COLUMN allow_additional_comment TINYINT(1) NOT NULL DEFAULT 0 AFTER answer_type,
    ADD COLUMN additional_comment_required TINYINT(1) NOT NULL DEFAULT 0 AFTER allow_additional_comment,
    ADD COLUMN additional_comment_placeholder VARCHAR(255) NULL AFTER additional_comment_required;