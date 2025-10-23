-- Migration pour mettre à jour la table interview_crud

-- Supprimer can_create si existe
ALTER TABLE interview_crud 
DROP COLUMN can_create;

-- Ajouter can_evaluate si n'existe pas
ALTER TABLE interview_crud 
ADD COLUMN can_evaluate BOOLEAN NOT NULL DEFAULT FALSE AFTER can_delete;

-- Ajouter is_admin
ALTER TABLE interview_crud 
ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT FALSE AFTER can_evaluate;