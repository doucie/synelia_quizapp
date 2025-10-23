-- V1_026__update_quiz_status_to_uppercase.sql
-- Met à jour quiz_status pour utiliser des valeurs en majuscules

-- Modifier l'enum quiz_status en majuscules
ALTER TABLE applications
MODIFY COLUMN quiz_status ENUM('PENDING', 'STARTED', 'COMPLETED') DEFAULT 'PENDING' NOT NULL;

-- Mettre à jour les données existantes (si nécessaire)
UPDATE applications SET quiz_status = 'PENDING' WHERE quiz_status = 'pending' OR quiz_status = 'not_started';
UPDATE applications SET quiz_status = 'STARTED' WHERE quiz_status = 'started' OR quiz_status = 'in_progress';
UPDATE applications SET quiz_status = 'COMPLETED' WHERE quiz_status = 'completed';
