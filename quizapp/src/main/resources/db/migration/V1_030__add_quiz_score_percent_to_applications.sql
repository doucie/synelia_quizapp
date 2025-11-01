-- Migration V1_030: Ajouter quiz_score_percent à applications
-- Date: 2025-10-30
-- Description: 
--   - Ajouter la colonne quiz_score_percent pour stocker le score du quiz en pourcentage
--   - Cette valeur représente quiz_score / total_questions * 100
--   - Permet de faciliter les calculs et affichages des scores

ALTER TABLE applications 
ADD COLUMN quiz_score_percent INT DEFAULT NULL AFTER total_questions;