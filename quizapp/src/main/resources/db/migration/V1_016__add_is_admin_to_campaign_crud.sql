-- Migration pour ajouter la colonne is_admin à la table campaign_crud
-- Cette colonne permet de distinguer l'administrateur de la campagne (créateur) des autres recruteurs

ALTER TABLE campaign_crud 
ADD COLUMN is_admin BOOLEAN DEFAULT FALSE NOT NULL
COMMENT 'Si TRUE, cet utilisateur est l\'administrateur de la campagne (créateur)';
