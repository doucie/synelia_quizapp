-- Migration V1_020: Ajouter total_questions à campaigns et retirer marked_out_of
-- Date: 2025-10-20
-- Description: 
--   - Ajouter la colonne total_questions pour stocker le nombre de questions dans une campagne
--   - Retirer la colonne marked_out_of qui n'est plus utilisée

-- Ajouter la colonne total_questions (seulement si elle n'existe pas déjà)
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS total_questions INT DEFAULT 0 COMMENT 'Nombre total de questions dans la campagne';

-- Supprimer la colonne marked_out_of (seulement si elle existe)
ALTER TABLE campaigns 
DROP COLUMN IF EXISTS marked_out_of;

-- Désactiver temporairement le mode safe update pour permettre la mise à jour en masse
SET SQL_SAFE_UPDATES = 0;

-- Mettre à jour les campagnes existantes avec le nombre de questions actuel
UPDATE campaigns c
SET c.total_questions = (
    SELECT COUNT(*)
    FROM campaign_questions cq
    WHERE cq.campaign_id = c.id
    AND cq.is_deleted = FALSE
)
WHERE c.is_deleted = FALSE;

-- Réactiver le mode safe update
SET SQL_SAFE_UPDATES = 1;
