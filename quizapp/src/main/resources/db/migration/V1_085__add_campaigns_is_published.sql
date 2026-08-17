-- 480 : Ajout du booleen is_published sur les campagnes
-- isPublished = true → statut derive (PENDING/OPEN/PAUSED)
-- isPublished = false → statut derive (DRAFT/CLOSED)
ALTER TABLE campaigns ADD COLUMN is_published BOOLEAN NOT NULL DEFAULT FALSE;

-- Initialiser selon le statut existant
UPDATE campaigns SET is_published = TRUE WHERE campaign_status IN ('PENDING', 'OPEN', 'PAUSED');
UPDATE campaigns SET is_published = FALSE WHERE campaign_status IN ('DRAFT', 'CLOSED');
