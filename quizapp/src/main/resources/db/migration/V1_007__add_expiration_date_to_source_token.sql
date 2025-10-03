-- Migration pour ajouter le champ expiration_date à la table source_token
-- Cela permet de gérer l'expiration des tokens de candidature

ALTER TABLE source_token 
ADD COLUMN expiration_date DATETIME NULL COMMENT 'Date d\'expiration du token de candidature';
