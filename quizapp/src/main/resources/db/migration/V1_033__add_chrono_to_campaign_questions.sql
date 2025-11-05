-- Migration: Ajouter la colonne chrono à campaign_questions
-- Objectif: Stocker le temps alloué (en secondes) pour répondre à chaque question
-- Par défaut: 10 secondes

ALTER TABLE campaign_questions
ADD COLUMN chrono INT DEFAULT 10 NOT NULL COMMENT 'Temps alloué pour répondre à la question (en secondes)';
