-- V1_024__add_permissions_to_campaign_crud.sql
-- Ajoute les nouvelles permissions de campagne

ALTER TABLE campaign_crud
ADD COLUMN can_planify BOOLEAN DEFAULT FALSE NOT NULL COMMENT 'Peut planifier un entretien',
ADD COLUMN can_accept_pre_screen BOOLEAN DEFAULT FALSE NOT NULL COMMENT 'Peut accepter après pré-sélection',
ADD COLUMN can_accept_final BOOLEAN DEFAULT FALSE NOT NULL COMMENT 'Peut accepter pour le poste final';
