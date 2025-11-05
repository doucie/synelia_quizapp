-- Migration: Ajouter la colonne time_elapsed à applications
-- Objectif: Stocker le temps écoulé (en secondes) depuis le début du quiz
-- Par défaut: 0 secondes

ALTER TABLE applications
ADD COLUMN time_elapsed INT DEFAULT 0 NOT NULL COMMENT 'Temps écoulé depuis le début du quiz (en secondes)';
