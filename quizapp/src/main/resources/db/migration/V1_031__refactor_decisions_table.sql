-- Migration V1_031: Refactorisation de la table decisions
-- Date: 2025-11-01
-- Description: 
--   - Supprimer la colonne decision_action
--   - Ajouter la colonne is_cancel (BOOLEAN) pour indiquer si c'est une annulation
--   - Nettoyer les anciennes données de décisions

-- Supprimer toutes les anciennes décisions pour éviter les incohérences
TRUNCATE TABLE decisions;

-- Supprimer la colonne decision_action
ALTER TABLE decisions 
DROP COLUMN decision_action;

-- Ajouter la colonne is_cancel
ALTER TABLE decisions 
ADD COLUMN is_cancel BOOLEAN NOT NULL DEFAULT FALSE AFTER decision_type;

-- Ajouter un commentaire sur la colonne
ALTER TABLE decisions 
MODIFY COLUMN is_cancel BOOLEAN NOT NULL DEFAULT FALSE 
COMMENT 'TRUE = Annulation de décision, FALSE = Prise de décision';
