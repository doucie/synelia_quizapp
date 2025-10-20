-- Migration V1_021: Ajouter total_questions à applications
-- Date: 2025-10-20
-- Description: 
--   - Ajouter la colonne total_questions pour stocker le nombre de questions auxquelles le candidat a répondu
--   - Cette valeur est copiée depuis campaigns.total_questions au moment de la soumission du quiz
--   - Permet de conserver l'historique même si le nombre de questions de la campagne change

ALTER TABLE applications 
ADD COLUMN total_questions INT DEFAULT 0 COMMENT 'Nombre de questions auxquelles le candidat a répondu lors de la soumission';
