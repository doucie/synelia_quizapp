-- V1_042 : normalisation finale des statuts campagne
-- ACTIVE -> OPEN
-- ARCHIVED -> CLOSED + is_archived = 1

UPDATE campaigns
SET campaign_status = 'OPEN'
WHERE UPPER(campaign_status) = 'ACTIVE';

UPDATE campaigns
SET campaign_status = 'CLOSED',
    is_archived = TRUE
WHERE UPPER(campaign_status) = 'ARCHIVED';