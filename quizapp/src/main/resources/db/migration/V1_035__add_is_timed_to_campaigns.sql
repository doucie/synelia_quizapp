-- Migration: Ajouter la colonne is_timed à campaigns
-- Objectif: Indiquer si la campagne est chronométrée (temps limité pour répondre au quiz)
-- Par défaut: false (non chronométrée)

ALTER TABLE campaigns
ADD COLUMN is_timed BOOLEAN DEFAULT FALSE NOT NULL COMMENT 'Indique si le quiz est chronométré';
