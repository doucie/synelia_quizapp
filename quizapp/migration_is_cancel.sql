-- Migration de decision_action vers is_cancel
-- Date: 2025-11-01
-- Description: Refactoring de decision_action (String) vers is_cancel (Boolean)

USE quizapp_db;

-- 1. Ajouter la nouvelle colonne is_cancel
ALTER TABLE decisions 
ADD COLUMN is_cancel TINYINT(1) DEFAULT 0 COMMENT 'true = annulation, false = décision' AFTER decision_type;

-- 2. Migrer les données: CANCEL -> true, DECISION -> false
UPDATE decisions 
SET is_cancel = CASE 
    WHEN decision_action = 'CANCEL' THEN 1 
    WHEN decision_action = 'DECISION' THEN 0 
    ELSE 0 
END;

-- 3. Supprimer l'ancienne colonne
ALTER TABLE decisions 
DROP COLUMN decision_action;

-- 4. Vérifier les résultats
SELECT 'Migration terminée avec succès!' as message;
SELECT COUNT(*) as total_decisions FROM decisions;
SELECT is_cancel, COUNT(*) as count FROM decisions GROUP BY is_cancel;
