-- V1_047 : support du tirage aleatoire des questions par version de formulaire

ALTER TABLE form_version
    ADD COLUMN random_questions TINYINT(1) NOT NULL DEFAULT 0 AFTER is_locked;