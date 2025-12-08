-- Migration: Ajout des colonnes started_at, ended_at et evaluation dans la table interviews
-- Date: 2024-12-07

-- Ajouter les colonnes de timing
ALTER TABLE interviews 
ADD COLUMN started_at DATETIME NULL AFTER interview_status,
ADD COLUMN ended_at DATETIME NULL AFTER started_at;

-- Ajouter les colonnes d'évaluation
ALTER TABLE interviews 
ADD COLUMN evaluation_score INT NULL AFTER started_at,
ADD COLUMN evaluation_number INT NULL AFTER evaluation_score;

ALTER TABLE interviews
ADD COLUMN evaluation_percentage DOUBLE NULL AFTER evaluation_number;

-- Créer un index sur les colonnes de timing pour les recherches
CREATE INDEX idx_interviews_started_at ON interviews(started_at);
CREATE INDEX idx_interviews_ended_at ON interviews(ended_at);