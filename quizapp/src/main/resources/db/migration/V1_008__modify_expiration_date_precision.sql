-- Migration pour modifier la précision de la colonne expiration_date
-- Supprime les microsecondes pour un format plus simple YYYY-MM-DD HH:MM:SS

ALTER TABLE source_token 
MODIFY COLUMN expiration_date DATETIME(0) NULL COMMENT 'Date d\'expiration du token de candidature';